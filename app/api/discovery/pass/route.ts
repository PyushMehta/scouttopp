import { NextResponse, type NextRequest } from 'next/server'
import { requireEmployer }               from '@/lib/auth/require-employer'
import { createServiceClient }           from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const auth = await requireEmployer()
  if (!auth.ok) return auth.response

  const { employerProfileId } = auth
  const body = await req.json() as { candidate_id?: string; forever?: boolean }
  const { candidate_id, forever = false } = body

  if (!candidate_id) {
    return NextResponse.json({ success: false, error: { message: 'candidate_id is required.' } }, { status: 400 })
  }

  const service = createServiceClient()

  // Snapshot the candidate's current updated_at so we can detect future profile updates
  const { data: candidate } = await service
    .from('candidate_profiles')
    .select('updated_at')
    .eq('id', candidate_id)
    .maybeSingle()

  // If previously saved, remove (pass overrides save)
  await service
    .from('employer_saved_candidates')
    .delete()
    .eq('employer_id', employerProfileId)
    .eq('candidate_id', candidate_id)

  const passType  = forever ? 'forever' : 'temporary'
  const expiresAt = forever
    ? null
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await service
    .from('employer_passed_candidates')
    .upsert(
      {
        employer_id:          employerProfileId,
        candidate_id,
        pass_type:            passType,
        expires_at:           expiresAt,
        candidate_updated_at: candidate?.updated_at ?? null,
      },
      { onConflict: 'employer_id,candidate_id' },
    )

  if (error) {
    console.error('[discovery/pass] POST:', error.message)
    return NextResponse.json({ success: false, error: { message: 'Failed to pass candidate.' } }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
