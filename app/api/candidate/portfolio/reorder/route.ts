import { NextResponse, type NextRequest } from 'next/server'
import { requireCandidate }              from '@/lib/auth/require-candidate'
import { createServiceClient }           from '@/lib/supabase/server'
import { z }                             from 'zod'

const schema = z.object({ orderedIds: z.array(z.string().uuid()).min(1) })

export async function POST(req: NextRequest) {
  const auth = await requireCandidate()
  if (!auth.ok) return auth.response

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid JSON.' } }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid fields.' } }, { status: 422 })
  }

  const service = createServiceClient()

  const results = await Promise.all(
    parsed.data.orderedIds.map((id, index) =>
      service
        .from('candidate_portfolio_items')
        .update({ sort_order: index })
        .eq('id', id)
        .eq('candidate_id', auth.candidateProfileId)
    ),
  )

  const failed = results.find(r => r.error)
  if (failed?.error) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: failed.error.message } }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
