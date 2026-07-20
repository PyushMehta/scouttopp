import { type NextRequest, NextResponse } from 'next/server'
import { updateSession }    from '@/lib/supabase/middleware'
import { getCanonicalRoute } from '@/lib/auth/machine'
import {
  checkAuthIP,
  checkAuthed,
  checkAdmin,
  checkPublic,
  getClientIP,
  rateLimitResponse,
} from '@/lib/rate-limit'

// Employer features are disabled in the Candidate Beta release.
// Set NEXT_PUBLIC_EMPLOYER_ENABLED=true to re-enable.
const EMPLOYER_ENABLED = process.env.NEXT_PUBLIC_EMPLOYER_ENABLED === 'true'

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
  const ip = getClientIP(request)

  // ── Employer feature gate ──────────────────────────────────────────────────
  // When EMPLOYER_ENABLED is false (Candidate Beta), block employer routes so
  // the code stays in the repo but remains inaccessible in production.
  if (!EMPLOYER_ENABLED) {
    if (
      pathname.startsWith('/api/employer') ||
      pathname.startsWith('/api/discovery')
    ) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: { code: 'EMPLOYER_FEATURES_DISABLED', message: 'Employer features are not available in this release.' },
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } },
      )
    }
    if (pathname.startsWith('/dashboard/employer')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Always pass through: static assets, Next.js internals, marketing pages
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/' ||
    pathname.startsWith('/features') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/faq') ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/cookies') ||
    pathname.startsWith('/community-guidelines') ||
    pathname.startsWith('/copyright') ||
    pathname.startsWith('/disclaimer') ||
    pathname.startsWith('/ai-policy') ||
    pathname.startsWith('/candidate-verification') ||
    pathname.startsWith('/employer-verification') ||
    pathname.startsWith('/account-deletion')
  ) {
    return NextResponse.next({ request })
  }

  // ── Auth-sensitive rate limit (per-IP, strict) ────────────────────────────
  // Covers invite-code validation, OAuth callback, and auth state transitions.
  // Backoff and per-code limits are applied inside each route handler.
  const isAuthPath =
    pathname.startsWith('/api/invite/') ||
    pathname.startsWith('/api/auth/')
  if (isAuthPath) {
    const rl = await checkAuthIP(ip)
    if (!rl.ok) return rateLimitResponse(rl.retryAfter)
  }

  // Always pass through specific public paths
  if (ALWAYS_PUBLIC.some((p) => pathname.startsWith(p))) {
    const { supabaseResponse } = await updateSession(request)
    return supabaseResponse
  }

  // Refresh session tokens and get current user
  const { supabaseResponse, user, supabase } = await updateSession(request)

  // ── API rate limits (post-session) ────────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    if (user) {
      // Authenticated: admin routes get the looser admin tier; everything else
      // gets the authed tier. Auth-sensitive paths already checked above.
      if (!isAuthPath) {
        const isAdminPath = pathname.startsWith('/api/admin/') || pathname.startsWith('/api/sync/')
        const rl = isAdminPath ? await checkAdmin(user.id) : await checkAuthed(user.id)
        if (!rl.ok) return rateLimitResponse(rl.retryAfter)
      }
    } else if (!isAuthPath) {
      // Unauthenticated public API call (not already covered by auth-path check)
      const rl = await checkPublic(ip)
      if (!rl.ok) return rateLimitResponse(rl.retryAfter)
    }
  }

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
