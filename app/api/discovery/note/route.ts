import { NextResponse, type NextRequest } from 'next/server'
import { requireEmployer }               from '@/lib/auth/require-employer'
import { createServiceClient }           from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const auth = await requireEmployer()
  if (!auth.ok) return auth.response

  const { employerProfileId } = auth
  const body = await req.json() as { candidate_id?: string; note?: string }
  const { candidate_id, note } = body

  if (!candidate_id) {
    return NextResponse.json({ success: false, error: { message: 'candidate_id is required.' } }, { status: 400 })
  }

  const service = createServiceClient()

  const { error } = await service
    .from('candidate_notes')
    .upsert(
      { employer_id: employerProfileId, candidate_id, note: note ?? '' },
      { onConflict: 'employer_id,candidate_id' },
    )

  if (error) {
    console.error('[discovery/note] POST:', error.message)
    return NextResponse.json({ success: false, error: { message: 'Failed to save note.' } }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
