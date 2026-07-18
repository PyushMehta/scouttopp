import { NextResponse, type NextRequest } from 'next/server'
import { requireCandidate }              from '@/lib/auth/require-candidate'
import { createServiceClient }           from '@/lib/supabase/server'
import { z }                             from 'zod'
import { serverError }                   from '@/lib/api-error'

const patchSchema = z.object({
  discovery_paused: z.boolean(),
})

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
    .from('candidate_profiles')
    .update({ discovery_paused: parsed.data.discovery_paused, updated_at: new Date().toISOString() })
    .eq('id', auth.candidateProfileId)
    .select('discovery_paused')
    .single()

  if (error) {
    return serverError('candidate/visibility PATCH', error)
  }

  return NextResponse.json({ success: true, data })
}
