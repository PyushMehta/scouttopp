import { NextResponse, type NextRequest } from 'next/server'
import { requireCandidate }              from '@/lib/auth/require-candidate'
import { createServiceClient }           from '@/lib/supabase/server'
import { z }                             from 'zod'
import { serverError }                   from '@/lib/api-error'

const DEFAULTS = {
  open_to_remote:     true,
  open_to_onsite:     false,
  open_to_hybrid:     true,
  open_to_contract:   true,
  open_to_fulltime:   false,
  rate_min_hourly:    null as number | null,
  rate_max_hourly:    null as number | null,
  available_from:     null as string | null,
  notice_period_days: null as number | null,
}

const patchSchema = z.object({
  open_to_remote:     z.boolean().optional(),
  open_to_onsite:     z.boolean().optional(),
  open_to_hybrid:     z.boolean().optional(),
  open_to_contract:   z.boolean().optional(),
  open_to_fulltime:   z.boolean().optional(),
  rate_min_hourly:    z.number().int().min(0).max(100000).nullable().optional(),
  rate_max_hourly:    z.number().int().min(0).max(100000).nullable().optional(),
  available_from:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  notice_period_days: z.number().int().min(0).max(365).nullable().optional(),
})

export async function GET() {
  const auth = await requireCandidate()
  if (!auth.ok) return auth.response

  const service = createServiceClient()
  const { data, error } = await service
    .from('candidate_preferences')
    .select('*')
    .eq('candidate_id', auth.candidateProfileId)
    .maybeSingle()

  if (error) {
    return serverError('candidate/preferences GET', error)
  }

  return NextResponse.json({ success: true, data: data ?? { candidate_id: auth.candidateProfileId, ...DEFAULTS } })
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

  const service = createServiceClient()
  const { data, error } = await service
    .from('candidate_preferences')
    .upsert(
      { candidate_id: auth.candidateProfileId, ...parsed.data },
      { onConflict: 'candidate_id' },
    )
    .select()
    .single()

  if (error) {
    return serverError('candidate/preferences PATCH', error)
  }

  return NextResponse.json({ success: true, data })
}
