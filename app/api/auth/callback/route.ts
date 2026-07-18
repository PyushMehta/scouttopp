import { NextResponse, type NextRequest } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getCanonicalRoute }                 from '@/lib/auth/machine'
import { APP_URL, ROUTES }                   from '@/constants'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code             = searchParams.get('code')
  const type             = searchParams.get('type')
  const next             = searchParams.get('next')
  const oauthError       = searchParams.get('error')
  const oauthErrorDesc   = searchParams.get('error_description')

  const base = APP_URL

  if (oauthError) {
    console.error('[auth/callback] OAuth error:', oauthError, oauthErrorDesc)
    const url = new URL(ROUTES.auth.login, base)
    url.searchParams.set('error', 'oauth_error')
    return NextResponse.redirect(url)
  }

  if (!code) {
    return NextResponse.redirect(new URL(`${ROUTES.auth.login}?error=missing_code`, base))
  }

  const supabase = await createClient()
  const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeErr) {
    console.error('[auth/callback] exchangeCodeForSession error:', exchangeErr.message)
    return NextResponse.redirect(new URL(`${ROUTES.auth.login}?error=auth_error`, base))
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL(`${ROUTES.auth.login}?error=no_user`, base))
  }

  if (type === 'recovery') {
    return NextResponse.redirect(new URL(ROUTES.auth.resetPassword, base))
  }

  if (next && next.startsWith('/') && !next.startsWith('//')) {
    return NextResponse.redirect(new URL(next, base))
  }

  const admin = createServiceClient()

  // ── Invite acceptance: link candidate_profile and promote to APPROVED ───────
  const candidateProfileId = user.user_metadata?.candidate_profile_id as string | undefined

  if (candidateProfileId) {
    // Link the candidate_profiles row to this new auth user
    const { error: linkErr } = await admin
      .from('candidate_profiles')
      .update({ user_id: user.id })
      .eq('id', candidateProfileId)
      .is('user_id', null) // only update if not yet linked (idempotent)

    if (linkErr) {
      console.error('[auth/callback] candidate_profile link error:', linkErr.message)
    }

    // Promote profile to APPROVED + set role (service role bypasses RLS)
    await admin
      .from('profiles')
      .update({ role: 'candidate', auth_state: 'APPROVED' })
      .eq('id', user.id)

    return NextResponse.redirect(new URL(ROUTES.dashboard.candidate, base))
  }

  // ── Standard flow: route by state machine ────────────────────────────────
  const { data: profile, error: profileErr } = await admin
    .from('profiles')
    .select('auth_state, role')
    .eq('id', user.id)
    .single()

  if (profileErr) {
    console.error('[auth/callback] profile fetch error:', profileErr.message, profileErr.code, '| user:', user.id)
  }

  if (!profile) {
    console.error('[auth/callback] no profile row for user:', user.id)
    return NextResponse.redirect(new URL(`${ROUTES.auth.login}?error=profile_missing`, base))
  }

  return NextResponse.redirect(new URL(getCanonicalRoute(profile), base))
}
