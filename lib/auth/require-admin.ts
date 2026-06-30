import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

type OkResult   = { ok: true;  userId: string }
type FailResult = { ok: false; response: NextResponse }

const unauth = () =>
  NextResponse.json(
    { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
    { status: 401 },
  )

const forbidden = () =>
  NextResponse.json(
    { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required.' } },
    { status: 403 },
  )

export async function requireAdmin(): Promise<OkResult | FailResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { ok: false, response: unauth() }

  const admin = createServiceClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { ok: false, response: forbidden() }

  return { ok: true, userId: user.id }
}
