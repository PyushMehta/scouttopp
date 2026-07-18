import { NextResponse } from 'next/server'
import { requireCandidate }    from '@/lib/auth/require-candidate'
import { createServiceClient } from '@/lib/supabase/server'
import { serverError }         from '@/lib/api-error'

export async function DELETE() {
  const auth = await requireCandidate()
  if (!auth.ok) return auth.response

  const service = createServiceClient()
  const { error } = await service.auth.admin.deleteUser(auth.userId)

  if (error) {
    return serverError('candidate/account DELETE', error)
  }

  return NextResponse.json({ success: true })
}
