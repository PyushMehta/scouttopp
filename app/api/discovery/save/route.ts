import { NextResponse, type NextRequest } from 'next/server'
import { requireEmployer }               from '@/lib/auth/require-employer'
import { createServiceClient }           from '@/lib/supabase/server'
import { z }                             from 'zod'

const bodySchema = z.object({
  candidate_id: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const auth = await requireEmployer()
  if (!auth.ok) return auth.response

  const { employerProfileId } = auth

  let raw: unknown
  try { raw = await req.json() } catch {
    return NextResponse.json({ success: false, error: { message: 'Invalid JSON.' } }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { message: 'Invalid request.', details: parsed.error.flatten() } }, { status: 422 })
  }

  const { candidate_id } = parsed.data

  const service = createServiceClient()

  // Verify candidate is discoverable
  const { data: candidate } = await service
    .from('candidate_profiles')
    .select('id')
    .eq('id', candidate_id)
    .eq('is_discoverable', true)
    .maybeSingle()

  if (!candidate) {
    return NextResponse.json({ success: false, error: { message: 'Candidate not found.' } }, { status: 404 })
  }

  // Remove from passed list if previously passed (undo-pass on save)
  await service.from('employer_passed_candidates')
    .delete()
    .eq('employer_id', employerProfileId)
    .eq('candidate_id', candidate_id)

  const { error } = await service
    .from('employer_saved_candidates')
    .upsert({ employer_id: employerProfileId, candidate_id }, { onConflict: 'employer_id,candidate_id' })

  if (error) {
    console.error('[discovery/save] POST:', error.message)
    return NextResponse.json({ success: false, error: { message: 'Failed to save candidate.' } }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const auth = await requireEmployer()
  if (!auth.ok) return auth.response

  const { employerProfileId } = auth

  let raw: unknown
  try { raw = await req.json() } catch {
    return NextResponse.json({ success: false, error: { message: 'Invalid JSON.' } }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { message: 'Invalid request.', details: parsed.error.flatten() } }, { status: 422 })
  }

  const { candidate_id } = parsed.data

  const service = createServiceClient()

  const { error } = await service
    .from('employer_saved_candidates')
    .delete()
    .eq('employer_id', employerProfileId)
    .eq('candidate_id', candidate_id)

  if (error) {
    console.error('[discovery/save] DELETE:', error.message)
    return NextResponse.json({ success: false, error: { message: 'Failed to unsave candidate.' } }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
