import { NextResponse, type NextRequest } from 'next/server'
import { requireEmployer }               from '@/lib/auth/require-employer'
import { createServiceClient }           from '@/lib/supabase/server'
import { MIN_DISCOVERY_COMPLETENESS }    from '@/constants'

type PrefRow = {
  candidate_id:     string
  open_to_remote:   boolean
  open_to_onsite:   boolean
  open_to_hybrid:   boolean
  open_to_contract: boolean
  open_to_fulltime: boolean
  rate_min_hourly:  number | null
  rate_max_hourly:  number | null
  available_from:   string | null
}

const PAGE_SIZE = 20

export interface DiscoveryCursor {
  createdAt: string
  id:        string
}

export interface CandidateCardPayload {
  id:                   string
  full_name:            string
  primary_role:         string | null
  location_city:        string | null
  location_country:     string | null
  years_experience:     number | null
  bio:                  string | null
  avatar_url:           string | null
  has_portfolio:        boolean
  discovery_score:      number | null
  profile_completeness: number
  created_at:           string
  specialties:          { name: string; level: string | null }[]
  roles:                { role_name: string; is_primary: boolean }[]
  preferences: {
    open_to_remote:   boolean
    open_to_onsite:   boolean
    open_to_hybrid:   boolean
    open_to_contract: boolean
    open_to_fulltime: boolean
    rate_min_hourly:  number | null
    rate_max_hourly:  number | null
    available_from:   string | null
  } | null
}

export async function GET(req: NextRequest) {
  const auth = await requireEmployer()
  if (!auth.ok) return auth.response

  const { employerProfileId } = auth
  const service = createServiceClient()
  const { searchParams } = new URL(req.url)

  const cursorParam     = searchParams.get('cursor')
  const qRaw            = searchParams.get('q')?.trim()
  const roleParam       = searchParams.get('role')
  const skillsParam     = searchParams.get('skills')
  const locationCountry = searchParams.get('location_country')?.trim().slice(0, 100) || undefined
  const locationCity    = searchParams.get('location_city')?.trim().slice(0, 100) || undefined
  const filterRemote    = searchParams.get('remote')   === '1'
  const filterHybrid    = searchParams.get('hybrid')   === '1'
  const filterOnsite    = searchParams.get('onsite')   === '1'
  const filterContract  = searchParams.get('contract') === '1'
  const filterFulltime  = searchParams.get('fulltime') === '1'
  const availableNow    = searchParams.get('available_now') === '1'
  const hasPortfolio    = searchParams.get('has_portfolio') === '1'
  const isFirstPage     = !cursorParam

  // Reject q that contains PostgREST metacharacters (comma injects extra OR conditions)
  if (qRaw && (qRaw.length > 100 || /[,()]/.test(qRaw))) {
    return NextResponse.json({ success: false, error: { message: 'Invalid search query.' } }, { status: 422 })
  }
  const q = qRaw || undefined

  // Parse numeric params — reject non-finite or out-of-range values
  const parseNumeric = (key: string, min: number, max: number): number | null => {
    const raw = searchParams.get(key)
    if (!raw) return null
    const n = Number(raw)
    if (!Number.isFinite(n) || n < min || n > max || !Number.isInteger(n)) return null
    return n
  }
  const rateMax = parseNumeric('rate_max', 0, 100000)
  const expMin  = parseNumeric('exp_min',  0, 100)
  const expMax  = parseNumeric('exp_max',  0, 100)

  // roles/skills: split on comma, enforce item count and per-item length
  const roles  = roleParam
    ? roleParam.split(',').filter(Boolean).slice(0, 20).map(r => r.trim().slice(0, 100))
    : []
  const skills = skillsParam
    ? skillsParam.split(',').filter(Boolean).slice(0, 30).map(s => s.trim().slice(0, 100))
    : []

  // ── 1. Build exclusion list ────────────────────────────────────────────────
  const [{ data: saved }, { data: passed }] = await Promise.all([
    service.from('employer_saved_candidates')
      .select('candidate_id')
      .eq('employer_id', employerProfileId),
    service.from('employer_passed_candidates')
      .select('candidate_id, pass_type, expires_at, candidate_updated_at')
      .eq('employer_id', employerProfileId),
  ])

  const savedIds = saved?.map(r => r.candidate_id) ?? []
  const now      = new Date().toISOString()

  // Forever passes → always exclude
  const foreverPassedIds = passed
    ?.filter(p => p.pass_type === 'forever')
    .map(p => p.candidate_id) ?? []

  // Temporary passes still within 30-day window → check if candidate updated since pass
  const tempPassedActive = passed?.filter(
    p => p.pass_type === 'temporary' && p.expires_at !== null && p.expires_at > now,
  ) ?? []

  let tempPassedToExclude: string[] = []
  if (tempPassedActive.length > 0) {
    const tempIds = tempPassedActive.map(p => p.candidate_id)
    const { data: timestamps } = await service
      .from('candidate_profiles')
      .select('id, updated_at')
      .in('id', tempIds)

    if (timestamps) {
      const snapshotMap = new Map(
        tempPassedActive.map(p => [p.candidate_id, p.candidate_updated_at]),
      )
      tempPassedToExclude = timestamps
        .filter(c => {
          const snapshot = snapshotMap.get(c.id)
          // Exclude if no snapshot (legacy row) OR candidate hasn't updated since pass
          return !snapshot || c.updated_at <= snapshot
        })
        .map(c => c.id)
    }
  }

  const excludedIds = [...new Set([...savedIds, ...foreverPassedIds, ...tempPassedToExclude])]

  // ── 2. Role filter via candidate_roles table ───────────────────────────────
  let roleCandidateIds: string[] | null = null
  if (roles.length > 0) {
    const { data: roleRows } = await service
      .from('candidate_roles')
      .select('candidate_id')
      .in('role_name', roles)
    roleCandidateIds = [...new Set(roleRows?.map(r => r.candidate_id) ?? [])]
  }

  // ── 3. Skills filter via candidate_specialties ─────────────────────────────
  let skillCandidateIds: string[] | null = null
  if (skills.length > 0) {
    const { data: skillRows } = await service
      .from('candidate_specialties')
      .select('candidate_id')
      .in('name', skills)
    skillCandidateIds = [...new Set(skillRows?.map(r => r.candidate_id) ?? [])]
  }

  // ── 4. Preference filter (work type / rate / availability) ────────────────
  let prefCandidateIds: string[] | null = null
  const hasWorkTypeFilter = filterRemote || filterHybrid || filterOnsite
  const hasEngTypeFilter  = filterContract || filterFulltime
  if (hasWorkTypeFilter || hasEngTypeFilter || rateMax !== null || availableNow) {
    const { data: prefRows } = await service
      .from('candidate_preferences')
      .select('candidate_id, open_to_remote, open_to_onsite, open_to_hybrid, open_to_contract, open_to_fulltime, rate_max_hourly, available_from')

    if (prefRows) {
      const today    = new Date().toISOString().split('T')[0]
      const filtered = prefRows.filter(p => {
        if (hasWorkTypeFilter) {
          const ok = (filterRemote && p.open_to_remote) ||
                     (filterHybrid && p.open_to_hybrid) ||
                     (filterOnsite && p.open_to_onsite)
          if (!ok) return false
        }
        if (hasEngTypeFilter) {
          const ok = (filterContract && p.open_to_contract) ||
                     (filterFulltime && p.open_to_fulltime)
          if (!ok) return false
        }
        if (rateMax !== null && p.rate_max_hourly !== null && p.rate_max_hourly > rateMax) return false
        if (availableNow && p.available_from !== null && p.available_from > today) return false
        return true
      })
      prefCandidateIds = filtered.map(p => p.candidate_id)
    }
  }

  // ── 5. Build main candidate query ──────────────────────────────────────────
  let query = service
    .from('candidate_profiles')
    .select(
      'id, full_name, location_city, location_country, years_experience, bio, avatar_url, primary_role, portfolio_url, discovery_score, profile_completeness, created_at',
      isFirstPage ? { count: 'exact' } : undefined,
    )
    .eq('is_discoverable', true)
    .eq('discovery_paused', false)
    .order('discovery_score', { ascending: false, nullsFirst: false })
    .order('created_at',      { ascending: false })
    .order('id',              { ascending: true })
    .limit(PAGE_SIZE + 1)

  // Profile completeness gate (set MIN_DISCOVERY_COMPLETENESS = 60 for production)
  if (MIN_DISCOVERY_COMPLETENESS > 0) {
    query = query.gte('profile_completeness', MIN_DISCOVERY_COMPLETENESS)
  }

  if (excludedIds.length > 0) {
    query = query.not('id', 'in', `(${excludedIds.join(',')})`)
  }

  if (roleCandidateIds !== null) {
    if (roleCandidateIds.length === 0) {
      return NextResponse.json({ data: [], nextCursor: null, total: 0 })
    }
    query = query.in('id', roleCandidateIds)
  }

  if (skillCandidateIds !== null) {
    if (skillCandidateIds.length === 0) {
      return NextResponse.json({ data: [], nextCursor: null, total: 0 })
    }
    query = query.in('id', skillCandidateIds)
  }

  if (prefCandidateIds !== null) {
    if (prefCandidateIds.length === 0) {
      return NextResponse.json({ data: [], nextCursor: null, total: 0 })
    }
    query = query.in('id', prefCandidateIds)
  }

  if (locationCountry) query = query.ilike('location_country', locationCountry)
  if (locationCity)    query = query.ilike('location_city',    `%${locationCity}%`)
  if (expMin !== null) query = query.gte('years_experience', expMin)
  if (expMax !== null) query = query.lte('years_experience', expMax)
  if (hasPortfolio)    query = query.not('portfolio_url', 'is', null)

  if (q) {
    // q is already validated: max 100 chars, no commas or parens
    const escaped = q.replace(/'/g, "''")
    query = query.or(`full_name.ilike.%${escaped}%,bio.ilike.%${escaped}%`)
  }

  if (cursorParam) {
    let cursor: DiscoveryCursor
    try {
      cursor = JSON.parse(Buffer.from(cursorParam, 'base64').toString('utf8')) as DiscoveryCursor
    } catch {
      return NextResponse.json({ success: false, error: { message: 'Invalid cursor.' } }, { status: 400 })
    }
    query = query.or(
      `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.gt.${cursor.id})`,
    )
  }

  const { data: candidates, count, error } = await query

  if (error) {
    console.error('[discovery] feed query:', error.message)
    return NextResponse.json({ success: false, error: { message: 'Failed to load candidates.' } }, { status: 500 })
  }

  const rows    = candidates ?? []
  const hasMore = rows.length > PAGE_SIZE
  const page    = hasMore ? rows.slice(0, PAGE_SIZE) : rows

  // ── 6. Batch-fetch specialties, roles, preferences for this page ───────────
  const ids = page.map(c => c.id)
  const [{ data: specialties }, { data: candidateRoles }, { data: preferences }] = ids.length > 0
    ? await Promise.all([
        service.from('candidate_specialties').select('candidate_id, name, level').in('candidate_id', ids),
        service.from('candidate_roles').select('candidate_id, role_name, is_primary').in('candidate_id', ids),
        service.from('candidate_preferences').select('candidate_id, open_to_remote, open_to_onsite, open_to_hybrid, open_to_contract, open_to_fulltime, rate_min_hourly, rate_max_hourly, available_from').in('candidate_id', ids),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }]

  const specialtyMap  = new Map<string, { name: string; level: string | null }[]>()
  const rolesMap      = new Map<string, { role_name: string; is_primary: boolean }[]>()
  const preferenceMap = new Map<string, PrefRow>()

  for (const s of specialties ?? []) {
    const list = specialtyMap.get(s.candidate_id) ?? []
    list.push({ name: s.name, level: s.level })
    specialtyMap.set(s.candidate_id, list)
  }
  for (const r of candidateRoles ?? []) {
    const list = rolesMap.get(r.candidate_id) ?? []
    list.push({ role_name: r.role_name, is_primary: r.is_primary })
    rolesMap.set(r.candidate_id, list)
  }
  for (const p of (preferences ?? []) as PrefRow[]) {
    preferenceMap.set(p.candidate_id, p)
  }

  // ── 7. Build response payload ──────────────────────────────────────────────
  const data: CandidateCardPayload[] = page.map(c => {
    const pref = preferenceMap.get(c.id) ?? null
    return {
      id:                   c.id,
      full_name:            c.full_name,
      primary_role:         c.primary_role,
      location_city:        c.location_city,
      location_country:     c.location_country,
      years_experience:     c.years_experience,
      bio:                  c.bio ? c.bio.slice(0, 220) : null,
      avatar_url:           c.avatar_url,
      has_portfolio:        Boolean(c.portfolio_url),
      discovery_score:      c.discovery_score,
      profile_completeness: c.profile_completeness,
      created_at:           c.created_at,
      specialties:          specialtyMap.get(c.id) ?? [],
      roles:                rolesMap.get(c.id) ?? [],
      preferences: pref ? {
        open_to_remote:   pref.open_to_remote,
        open_to_onsite:   pref.open_to_onsite,
        open_to_hybrid:   pref.open_to_hybrid,
        open_to_contract: pref.open_to_contract,
        open_to_fulltime: pref.open_to_fulltime,
        rate_min_hourly:  pref.rate_min_hourly,
        rate_max_hourly:  pref.rate_max_hourly,
        available_from:   pref.available_from,
      } : null,
    }
  })

  const lastRow    = page[page.length - 1]
  const nextCursor = hasMore && lastRow
    ? Buffer.from(JSON.stringify({ createdAt: lastRow.created_at, id: lastRow.id })).toString('base64')
    : null

  return NextResponse.json({
    data,
    nextCursor,
    total: isFirstPage ? (count ?? null) : null,
  })
}
