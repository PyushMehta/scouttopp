import { NextResponse, type NextRequest } from 'next/server'
import { requireEmployer }               from '@/lib/auth/require-employer'
import { createServiceClient }           from '@/lib/supabase/server'

const PAGE_SIZE = 24

export async function GET(req: NextRequest) {
  const auth = await requireEmployer()
  if (!auth.ok) return auth.response

  const { employerProfileId } = auth
  const service = createServiceClient()
  const { searchParams } = new URL(req.url)
  const cursorParam = searchParams.get('cursor')
  const q           = searchParams.get('q')?.trim().slice(0, 200) || undefined

  // Validate cursor is an ISO 8601 timestamp before sending to DB
  if (cursorParam && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(cursorParam)) {
    return NextResponse.json({ success: false, error: { message: 'Invalid cursor.' } }, { status: 400 })
  }

  // Fetch saved candidate records with cursor pagination
  let savedQuery = service
    .from('employer_saved_candidates')
    .select('candidate_id, saved_at')
    .eq('employer_id', employerProfileId)
    .order('saved_at', { ascending: false })
    .limit(PAGE_SIZE + 1)

  if (cursorParam) {
    savedQuery = savedQuery.lt('saved_at', cursorParam)
  }

  const { data: savedRows, error: savedErr } = await savedQuery

  if (savedErr) {
    return NextResponse.json({ success: false, error: { message: 'Failed to load saved candidates.' } }, { status: 500 })
  }

  const rows     = savedRows ?? []
  const hasMore  = rows.length > PAGE_SIZE
  const page     = hasMore ? rows.slice(0, PAGE_SIZE) : rows
  const ids      = page.map(r => r.candidate_id)
  const savedAtMap = new Map(page.map(r => [r.candidate_id, r.saved_at]))

  if (ids.length === 0) {
    return NextResponse.json({ data: [], nextCursor: null })
  }

  // Batch-fetch candidate data + specialties + notes
  const [
    { data: candidates },
    { data: specialties },
    { data: notes },
  ] = await Promise.all([
    service
      .from('candidate_profiles')
      .select('id, full_name, location_city, location_country, years_experience, bio, avatar_url, primary_role, portfolio_url')
      .in('id', ids)
      .match(q ? {} : {})
      .then(res => {
        if (q && res.data) {
          const lower = q.toLowerCase()
          return { ...res, data: res.data.filter(c =>
            c.full_name.toLowerCase().includes(lower) ||
            (c.bio ?? '').toLowerCase().includes(lower) ||
            (c.primary_role ?? '').toLowerCase().includes(lower),
          )}
        }
        return res
      }),
    service.from('candidate_specialties').select('candidate_id, name, level').in('candidate_id', ids),
    service.from('candidate_notes').select('candidate_id, note').eq('employer_id', employerProfileId).in('candidate_id', ids),
  ])

  const specialtyMap = new Map<string, { name: string; level: string | null }[]>()
  for (const s of specialties ?? []) {
    const list = specialtyMap.get(s.candidate_id) ?? []
    list.push({ name: s.name, level: s.level })
    specialtyMap.set(s.candidate_id, list)
  }

  const noteMap = new Map((notes ?? []).map(n => [n.candidate_id, n.note]))

  const data = (candidates ?? []).map(c => ({
    id:               c.id,
    full_name:        c.full_name,
    primary_role:     c.primary_role,
    location_city:    c.location_city,
    location_country: c.location_country,
    years_experience: c.years_experience,
    bio:              c.bio ? c.bio.slice(0, 160) : null,
    avatar_url:       c.avatar_url,
    has_portfolio:    Boolean(c.portfolio_url),
    specialties:      specialtyMap.get(c.id) ?? [],
    saved_at:         savedAtMap.get(c.id) ?? '',
    note:             noteMap.get(c.id) ?? '',
  })).sort((a, b) => b.saved_at.localeCompare(a.saved_at)) // maintain saved order

  const lastRow    = page[page.length - 1]
  const nextCursor = hasMore && lastRow ? lastRow.saved_at : null

  return NextResponse.json({ data, nextCursor })
}
