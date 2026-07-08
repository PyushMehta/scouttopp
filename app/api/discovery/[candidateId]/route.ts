import { NextResponse, type NextRequest } from 'next/server'
import { requireEmployer }               from '@/lib/auth/require-employer'
import { createServiceClient }           from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> },
) {
  const auth = await requireEmployer()
  if (!auth.ok) return auth.response

  const { employerProfileId } = auth
  const { candidateId }       = await params
  const service               = createServiceClient()

  // Fetch candidate + check discoverable
  const { data: candidate, error } = await service
    .from('candidate_profiles')
    .select('id, full_name, pronouns, location_city, location_country, timezone, bio, avatar_url, primary_role, years_experience, portfolio_url, linkedin_url, instagram_url, website_url, is_discoverable, discovery_paused, created_at')
    .eq('id', candidateId)
    .eq('is_discoverable', true)
    .single()

  if (error || !candidate) {
    return NextResponse.json({ success: false, error: { message: 'Candidate not found.' } }, { status: 404 })
  }

  // Batch-fetch related data in parallel
  const [
    { data: specialties },
    { data: preferences },
    { data: portfolio },
    { data: savedRow },
    { data: passedRow },
    { data: noteRow },
  ] = await Promise.all([
    service.from('candidate_specialties').select('name, level').eq('candidate_id', candidateId),
    service.from('candidate_preferences').select('open_to_remote, open_to_onsite, open_to_hybrid, open_to_contract, open_to_fulltime, rate_min_hourly, rate_max_hourly, available_from, notice_period_days').eq('candidate_id', candidateId).maybeSingle(),
    service.from('candidate_portfolio_items').select('id, title, description, media_url, thumbnail_url, media_type, sort_order').eq('candidate_id', candidateId).order('sort_order'),
    service.from('employer_saved_candidates').select('id').eq('employer_id', employerProfileId).eq('candidate_id', candidateId).maybeSingle(),
    service.from('employer_passed_candidates').select('id').eq('employer_id', employerProfileId).eq('candidate_id', candidateId).maybeSingle(),
    service.from('candidate_notes').select('note').eq('employer_id', employerProfileId).eq('candidate_id', candidateId).maybeSingle(),
  ])

  // Record view (fire-and-forget — errors silently logged, don't block response)
  service.from('candidate_views').insert({ employer_id: employerProfileId, candidate_id: candidateId })
    .then(({ error: ve }) => { if (ve) console.error('[discovery/view]', ve.message) })

  const swipeState = savedRow ? 'saved' : passedRow ? 'passed' : 'none'

  return NextResponse.json({
    data: {
      id:               candidate.id,
      full_name:        candidate.full_name,
      pronouns:         candidate.pronouns,
      location_city:    candidate.location_city,
      location_country: candidate.location_country,
      timezone:         candidate.timezone,
      bio:              candidate.bio,
      avatar_url:       candidate.avatar_url,
      primary_role:     candidate.primary_role,
      years_experience: candidate.years_experience,
      portfolio_url:    candidate.portfolio_url,
      linkedin_url:     candidate.linkedin_url,
      instagram_url:    candidate.instagram_url,
      website_url:      candidate.website_url,
      has_portfolio:    Boolean(candidate.portfolio_url) || (portfolio?.length ?? 0) > 0,
      specialties:      specialties ?? [],
      preferences:      preferences ?? null,
      portfolio_items:  portfolio ?? [],
      swipe_state:      swipeState,
      note:             noteRow?.note ?? '',
    },
  })
}
