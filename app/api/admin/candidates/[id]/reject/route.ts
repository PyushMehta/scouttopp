import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin }                  from '@/lib/auth/require-admin'
import { rejectCandidate, AdminError }   from '@/services/admin.service'
import { z }                             from 'zod'

const bodySchema = z.object({
  reason: z.string().max(1000).optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params

  let reason = ''
  try {
    const raw    = await req.json()
    const parsed = bodySchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid reason.' } }, { status: 422 })
    }
    reason = parsed.data.reason?.trim() ?? ''
  } catch {
    // Body is optional
  }

  try {
    const result = await rejectCandidate(id, reason)
    return NextResponse.json({ success: true, data: result })
  } catch (e) {
    if (e instanceof AdminError) {
      return NextResponse.json(
        { success: false, error: { code: e.code, message: e.message } },
        { status: e.status },
      )
    }
    console.error('[admin/candidates/reject]', e)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Unexpected error.' } },
      { status: 500 },
    )
  }
}
