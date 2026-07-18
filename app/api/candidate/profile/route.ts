import { NextResponse, type NextRequest } from 'next/server'
import { requireCandidate }              from '@/lib/auth/require-candidate'
import { createServiceClient }           from '@/lib/supabase/server'
import { z }                             from 'zod'
import type { Database }                 from '@/lib/supabase/types'
import { serverError }                   from '@/lib/api-error'

type CandidateProfileUpdate = Database['public']['Tables']['candidate_profiles']['Update']

const urlOrEmpty = z.string().refine(v => v === '' || /^https?:\/\/.+/.test(v), 'Must be a valid URL').optional()

const patchSchema = z.object({
  full_name:        z.string().min(1).max(100).optional(),
  pronouns:         z.string().max(50).optional(),
  bio:              z.string().max(600).optional(),
  primary_role:     z.string().max(100).nullable().optional(),
  years_experience: z.number().int().min(0).max(50).nullable().optional(),
  location_city:    z.string().max(100).optional(),
  location_country: z.string().max(100).optional(),
  timezone:         z.string().max(100).optional(),
  phone:            z.string().max(30).optional(),
  portfolio_url:    urlOrEmpty,
  linkedin_url:     urlOrEmpty,
  instagram_url:    urlOrEmpty,
  website_url:      urlOrEmpty,
  resume_url:       urlOrEmpty,
})

export async function GET() {
  const auth = await requireCandidate()
  if (!auth.ok) return auth.response

  const service = createServiceClient()
  const { data, error } = await service
    .from('candidate_profiles')
    .select('*')
    .eq('id', auth.candidateProfileId)
    .single()

  if (error || !data) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Profile not found.' } }, { status: 404 })
  }

  return NextResponse.json({ success: true, data })
}

export async function PATCH(req: NextRequest) {
  const auth = await requireCandidate()
  if (!auth.ok) return auth.response

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid JSON.' } }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid fields.', details: parsed.error.flatten() },
    }, { status: 422 })
  }

  const d = parsed.data

  // Sanitise empty URL strings → null
  const urlNull = (v: string | undefined) => (v === '' ? null : v)

  const update: CandidateProfileUpdate = {
    ...(d.full_name        !== undefined && { full_name:        d.full_name }),
    ...(d.pronouns         !== undefined && { pronouns:         d.pronouns }),
    ...(d.bio              !== undefined && { bio:              d.bio }),
    ...(d.primary_role     !== undefined && { primary_role:     d.primary_role }),
    ...(d.years_experience !== undefined && { years_experience: d.years_experience }),
    ...(d.location_city    !== undefined && { location_city:    d.location_city }),
    ...(d.location_country !== undefined && { location_country: d.location_country }),
    ...(d.timezone         !== undefined && { timezone:         d.timezone }),
    ...(d.phone            !== undefined && { phone:            d.phone }),
    ...(d.portfolio_url    !== undefined && { portfolio_url:    urlNull(d.portfolio_url) }),
    ...(d.linkedin_url     !== undefined && { linkedin_url:     urlNull(d.linkedin_url) }),
    ...(d.instagram_url    !== undefined && { instagram_url:    urlNull(d.instagram_url) }),
    ...(d.website_url      !== undefined && { website_url:      urlNull(d.website_url) }),
    ...(d.resume_url       !== undefined && { resume_url:       urlNull(d.resume_url) }),
    updated_at: new Date().toISOString(),
  }

  const service = createServiceClient()
  const { data, error } = await service
    .from('candidate_profiles')
    .update(update)
    .eq('id', auth.candidateProfileId)
    .select()
    .single()

  if (error) {
    return serverError('candidate/profile PATCH', error)
  }

  return NextResponse.json({ success: true, data })
}
