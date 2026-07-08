import { NextResponse } from 'next/server'
import { requireEmployer } from '@/lib/auth/require-employer'
import { createServiceClient } from '@/lib/supabase/server'

export async function DELETE() {
  const auth = await requireEmployer()
  if (!auth.ok) return auth.response

  const service = createServiceClient()
  const { error } = await service.auth.admin.deleteUser(auth.userId)
  if (error) {
    return NextResponse.json({ success: false, error: { code: 'DELETE_ERROR', message: error.message } }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
