import { NextResponse, type NextRequest } from 'next/server'
import { requireEmployer }               from '@/lib/auth/require-employer'
import { createServiceClient }           from '@/lib/supabase/server'
import { z }                             from 'zod'

const bodySchema = z.object({
  candidate_id: z.string().uuid(),
  note:         z.string().max(5000).optional(),
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

  const { candidate_id, note } = parsed.data

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
