import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

type OkResult   = { ok: true;  userId: string; candidateProfileId: string }
type FailResult = { ok: false; response: NextResponse }

function unauth()    { return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } }, { status: 401 }) }
function forbidden() { return NextResponse.json({ success: false, error: { code: 'FORBIDDEN',      message: 'Candidate access required.' } }, { status: 403 }) }
function notFound()  { return NextResponse.json({ success: false, error: { code: 'NOT_FOUND',      message: 'Candidate profile not found.' } }, { status: 404 }) }

export async function requireCandidate(): Promise<OkResult | FailResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, response: unauth() }

  const service = createServiceClient()

  const { data: profile } = await service
    .from('profiles')
    .select('role, auth_state')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'candidate' || profile?.auth_state !== 'APPROVED') {
    return { ok: false, response: forbidden() }
  }

  const { data: candidateProfile } = await service
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!candidateProfile) return { ok: false, response: notFound() }

  return { ok: true, userId: user.id, candidateProfileId: candidateProfile.id }
}
