import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin }                  from '@/lib/auth/require-admin'
import { suspendUser, AdminError }       from '@/services/admin.service'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params

  try {
    const result = await suspendUser(id)
    return NextResponse.json({ success: true, data: result })
  } catch (e) {
    if (e instanceof AdminError) {
      return NextResponse.json(
        { success: false, error: { code: e.code, message: e.message } },
        { status: e.status },
      )
    }
    console.error('[admin/suspend] unexpected error:', e)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
      { status: 500 },
    )
  }
}
