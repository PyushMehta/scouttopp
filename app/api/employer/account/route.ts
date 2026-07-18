import { NextResponse } from 'next/server'
import { requireEmployer }     from '@/lib/auth/require-employer'
import { createServiceClient } from '@/lib/supabase/server'
import { serverError }         from '@/lib/api-error'

export async function DELETE() {
  const auth = await requireEmployer()
  if (!auth.ok) return auth.response

  const service = createServiceClient()
  const { error } = await service.auth.admin.deleteUser(auth.userId)
  if (error) {
    return serverError('employer/account DELETE', error)
  }

  return NextResponse.json({ success: true })
}
