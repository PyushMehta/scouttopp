import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { getCanonicalRoute } from '@/lib/auth/machine'

/**
 * Routes that bypass all auth checks — always pass through.
 */
const ALWAYS_PUBLIC = [
  '/api/auth/callback',
  '/api/invite/validate',
  '/auth/confirm',
  '/auth/reset-password', // recovery session handled client-side
  '/auth/rejected',        // viewable even without a session
  '/auth/suspended',       // viewable even without a session
]

/**
 * Routes visible to unauthenticated visitors. Logged-in users are redirected
 * to their canonical route when they hit these.
 */
const UNAUTHED_PUBLIC = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/verify-email',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always pass through: static assets, Next.js internals, root redirect
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/'
  ) {
    return NextResponse.next({ request })
  }

  // Always pass through specific public paths
  if (ALWAYS_PUBLIC.some((p) => pathname.startsWith(p))) {
    const { supabaseResponse } = await updateSession(request)
    return supabaseResponse
  }

  // Refresh session tokens and get current user
  const { supabaseResponse, user, supabase } = await updateSession(request)

  // ── No session ─────────────────────────────────────────────────────────────
  if (!user || !supabase) {
    if (UNAUTHED_PUBLIC.some((p) => pathname.startsWith(p))) {
      return supabaseResponse
    }
    // Protected route — send to login
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    if (!UNAUTHED_PUBLIC.some((p) => pathname.startsWith(p))) {
      url.searchParams.set('redirect', pathname)
    }
    return NextResponse.redirect(url)
  }

  // ── Session exists — fetch profile ─────────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('auth_state, role')
    .eq('id', user.id)
    .single()

  // If profile not yet created (trigger delay edge case), pass through
  if (!profile) return supabaseResponse

  const canonical = getCanonicalRoute(profile)

  // If on an unauthed-public route (login, signup, etc.) while logged in,
  // redirect to the user's canonical destination
  if (UNAUTHED_PUBLIC.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL(canonical, request.url))
  }

  // Role-select and verify-email are only for users in the matching state
  if (
    pathname.startsWith('/auth/role-select') ||
    pathname.startsWith('/auth/verify-email') ||
    pathname.startsWith('/auth/pending')
  ) {
    if (!pathname.startsWith(canonical)) {
      return NextResponse.redirect(new URL(canonical, request.url))
    }
    return supabaseResponse
  }

  // Dashboard and onboarding routes — verify the user is APPROVED and on the
  // correct role prefix. E.g. an employer cannot access /dashboard/candidate.
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/onboarding')
  ) {
    if (!pathname.startsWith(canonical)) {
      return NextResponse.redirect(new URL(canonical, request.url))
    }
    return supabaseResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files. Proxy must NOT run on:
     *   - _next/static  (static files)
     *   - _next/image   (image optimisation)
     *   - favicon.ico
     *   - Public assets (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
