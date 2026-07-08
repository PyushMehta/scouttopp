import { NextResponse, type NextRequest } from 'next/server'
import { requireEmployer }               from '@/lib/auth/require-employer'
import { createServiceClient }           from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const auth = await requireEmployer()
  if (!auth.ok) return auth.response

  const { employerProfileId } = auth
  const body = await req.json() as { candidate_id?: string }
  const { candidate_id } = body

  if (!candidate_id) {
    return NextResponse.json({ success: false, error: { message: 'candidate_id is required.' } }, { status: 400 })
  }

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
  const body = await req.json() as { candidate_id?: string }
  const { candidate_id } = body

  if (!candidate_id) {
    return NextResponse.json({ success: false, error: { message: 'candidate_id is required.' } }, { status: 400 })
  }

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
