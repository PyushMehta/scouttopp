# ScouttOpp — Authentication Flow
### State Machine, Route Guards, and Session Lifecycle v1.0

> **Status:** ✅ Implemented in Phase 2. State machine live in `lib/auth/machine.ts`; middleware in `middleware.ts`; API routes in `app/api/auth/`.  
> This document is the authoritative reference for every auth state, transition, guard, and redirect rule. Update it before changing any auth logic.

---

## Table of Contents

1. [The 8-State Machine](#1-the-8-state-machine)
2. [State Transition Rules](#2-state-transition-rules)
3. [Canonical Routes Per State](#3-canonical-routes-per-state)
4. [Middleware Flow](#4-middleware-flow)
5. [Session Lifecycle](#5-session-lifecycle)
6. [Invite Flow](#6-invite-flow)
7. [Email Verification Flow](#7-email-verification-flow)
8. [Approval Flow (Admin → Candidate)](#8-approval-flow-admin--candidate)
9. [Reject / Suspend Flow](#9-reject--suspend-flow)
10. [Google OAuth Flow](#10-google-oauth-flow)
11. [Password Reset Flow](#11-password-reset-flow)
12. [Route Guard Reference](#12-route-guard-reference)
13. [Implementation Files](#13-implementation-files)

---

## 1. The 8-State Machine

Every authenticated user has exactly one `auth_state` at any point in time. This state lives in `profiles.auth_state` (see [DATABASE.md](DATABASE.md)).

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ScouttOpp Auth States                            │
│                                                                         │
│  Sign up ──► UNVERIFIED ──► VERIFIED_NO_ROLE ──► ONBOARDING*          │
│                                    │                    │               │
│                               (role select)    (profile submitted)      │
│                                    │                    │               │
│                                    └─────────┬──────────┘               │
│                                              ▼                          │
│                                      PENDING_APPROVAL ──► APPROVED     │
│                                              │                 │        │
│                                              ▼                 ▼        │
│                                          REJECTED         (dashboard)   │
│                                                                         │
│                              APPROVED ──► SUSPENDED (reversible)        │
│                                                                         │
│  INVITED: bypasses some checks, enters at VERIFIED_NO_ROLE              │
└─────────────────────────────────────────────────────────────────────────┘

* ONBOARDING is deferred to Phase 5 (native onboarding). For MVP:
  candidates submitted via Google Sheets arrive at PENDING_APPROVAL directly.
```

### State Descriptions

| State | Meaning | Access |
|---|---|---|
| `UNVERIFIED` | Just signed up, email not confirmed | `/auth/verify-email` only |
| `VERIFIED_NO_ROLE` | Email confirmed, no role selected | `/auth/role-select` only |
| `ONBOARDING` | Role selected, completing profile *(future)* | `/onboarding/*` only |
| `PENDING_APPROVAL` | Profile submitted, awaiting admin review | `/auth/pending` (read-only) |
| `APPROVED` | Admin approved | `/dashboard/*` full access |
| `REJECTED` | Admin rejected | `/auth/rejected` (read-only) |
| `SUSPENDED` | Temporarily suspended | `/auth/suspended` (read-only) |
| `INVITED` | Joined via invite code, enters VERIFIED_NO_ROLE | As VERIFIED_NO_ROLE |

---

## 2. State Transition Rules

### Allowed Transitions

```ts
// lib/auth/machine.ts — ALLOWED_TRANSITIONS
export const ALLOWED_TRANSITIONS: Record<AuthState, AuthState[]> = {
  UNVERIFIED:        ['VERIFIED_NO_ROLE'],
  VERIFIED_NO_ROLE:  ['ONBOARDING', 'PENDING_APPROVAL'],  // direct to PENDING for synced candidates
  ONBOARDING:        ['PENDING_APPROVAL'],
  PENDING_APPROVAL:  ['APPROVED', 'REJECTED'],
  APPROVED:          ['SUSPENDED'],
  REJECTED:          [],                                   // terminal (appeal via support)
  SUSPENDED:         ['APPROVED'],                         // admin can reinstate
  INVITED:           ['VERIFIED_NO_ROLE'],                 // treated as VERIFIED_NO_ROLE
};
```

### Who Triggers Each Transition

| Transition | Triggered by | Mechanism |
|---|---|---|
| `UNVERIFIED → VERIFIED_NO_ROLE` | User clicking email link | Supabase email confirmation → DB trigger |
| `VERIFIED_NO_ROLE → PENDING_APPROVAL` | User selecting role (MVP only — no onboarding) | Application: API call after role-select |
| `VERIFIED_NO_ROLE → ONBOARDING` | User selecting role (Phase 5+) | Application: API call |
| `ONBOARDING → PENDING_APPROVAL` | User submitting onboarding form | Application: API call |
| `PENDING_APPROVAL → APPROVED` | Admin approving candidate | Admin API: `POST /api/admin/candidates/[id]/approve` |
| `PENDING_APPROVAL → REJECTED` | Admin rejecting candidate | Admin API: `POST /api/admin/candidates/[id]/reject` |
| `APPROVED → SUSPENDED` | Admin suspending user | Admin API: `POST /api/admin/users/[id]/suspend` |
| `SUSPENDED → APPROVED` | Admin reinstating user | Admin API: `POST /api/admin/users/[id]/reinstate` |

### Transition Validation

All state changes go through `validateTransition()` in `lib/auth/machine.ts`:

```ts
export function validateTransition(from: AuthState, to: AuthState): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}
```

Any attempt to set an invalid transition throws a `400 Bad Request` from the API.

---

## 3. Canonical Routes Per State

```ts
// lib/auth/router.ts — STATE_ROUTES
export const STATE_ROUTES: Record<AuthState, string> = {
  UNVERIFIED:        '/auth/verify-email',
  VERIFIED_NO_ROLE:  '/auth/role-select',
  ONBOARDING:        '/onboarding',          // Phase 5
  PENDING_APPROVAL:  '/auth/pending',
  APPROVED:          '/dashboard',
  REJECTED:          '/auth/rejected',
  SUSPENDED:         '/auth/suspended',
  INVITED:           '/auth/role-select',    // treated as VERIFIED_NO_ROLE
};
```

`getCanonicalRoute(user: Profile): string` returns the correct destination for a given user.

### Role-Specific Dashboard Routes

When `auth_state === 'APPROVED'`, the route depends on role:

```ts
export function getCanonicalRoute(profile: Profile): string {
  if (profile.auth_state !== 'APPROVED') {
    return STATE_ROUTES[profile.auth_state];
  }
  switch (profile.role) {
    case 'candidate': return '/dashboard/candidate';
    case 'employer':  return '/dashboard/employer';
    case 'admin':     return '/dashboard/admin';
    default:          return '/auth/role-select';
  }
}
```

---

## 4. Middleware Flow

`middleware.ts` at the project root runs on every request before any page renders.

### Decision Tree

```
Request arrives
    │
    ├── Is public route? (/auth/*, /, public assets)
    │       └── PASS THROUGH (no auth check)
    │
    ├── Is protected route? (/dashboard/*, /onboarding/*, /admin/*)
    │       │
    │       ├── No session cookie?
    │       │       └── REDIRECT → /auth/login?redirect=<original_path>
    │       │
    │       └── Session exists → fetch profiles.auth_state
    │               │
    │               ├── auth_state !== 'APPROVED'
    │               │       └── REDIRECT → getCanonicalRoute(profile)
    │               │
    │               └── auth_state === 'APPROVED'
    │                       │
    │                       ├── role = 'candidate' + accessing /dashboard/employer
    │                       │       └── REDIRECT → /dashboard/candidate
    │                       │
    │                       ├── role = 'employer' + accessing /dashboard/admin
    │                       │       └── REDIRECT → /dashboard/employer
    │                       │
    │                       └── role matches route → PASS THROUGH
    │
    └── Is auth route? (/auth/login, /auth/signup, etc.)
            │
            └── Has valid session?
                    ├── YES → REDIRECT → getCanonicalRoute(profile)
                    └── NO  → PASS THROUGH
```

### Middleware Implementation Notes

```ts
// middleware.ts
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

The middleware uses the Supabase server client with `updateSession()` to refresh the access token and keep the session alive on every request. It must be done here — not in page components.

### Public Routes (No Auth Check)

```
/
/auth/login
/auth/signup
/auth/verify-email
/auth/confirm       ← Supabase callback, exchanges code for session
/auth/forgot-password
/auth/reset-password
/auth/rejected      ← Accessible without session (user may be logged out)
/auth/suspended     ← Accessible without session
```

---

## 5. Session Lifecycle

### Access Token

Supabase issues JWTs valid for **1 hour** by default. The middleware calls `updateSession()` on every request, which transparently refreshes the token using the refresh token cookie when it's near expiry.

### Session Storage

- Access token: `sb-<project-ref>-auth-token` (cookie, httpOnly, Secure)
- Refresh token: `sb-<project-ref>-auth-token` (same cookie, extended)
- Server components read via `createServerClient` with cookie adapter
- Browser components read via `createBrowserClient` (singleton, `lib/supabase/client.ts`)

### Session Invalidation

| Event | What happens |
|---|---|
| User clicks Sign Out | `supabase.auth.signOut()` → clears cookies → redirect `/auth/login` |
| JWT expires, refresh fails | Middleware detects missing session → redirect `/auth/login?redirect=<path>` |
| Admin suspends user | `auth_state` → `SUSPENDED` → next request middleware redirects to `/auth/suspended` |
| Admin rejects user | Same → `/auth/rejected` |

### Post-Login Redirect

After successful login, redirect the user to:
1. `?redirect=<path>` if present in the URL (validated: must start with `/`, no `//`, no external URLs)
2. Otherwise: `getCanonicalRoute(profile)`

---

## 6. Invite Flow

### How Invite Codes Work

1. Admin creates an invite code in `invite_codes` table via admin dashboard.
2. Admin shares the code with a prospective user (email, Slack, etc.).
3. User navigates to `/auth/signup` and expands the "Have an invite code?" section.
4. On signup submit:
   - Client calls `POST /api/invite/validate` with the code.
   - API checks: code exists, `uses < max_uses`, not expired.
   - If valid: signup proceeds, `profiles.invite_code_id` is set, `invite_codes.uses` is incremented.
5. Role selection screen: if the invite code specifies a role, auto-select it for the user.
6. Invited employers enter `VERIFIED_NO_ROLE` → role select → `PENDING_APPROVAL` (or `APPROVED` directly if admin-invited).

### Invite Code Validation

```ts
// Validate at time of signup, not at code entry
// Race condition mitigation: use a Postgres transaction to check + increment atomically
BEGIN;
SELECT id, role, max_uses, uses, expires_at FROM invite_codes
  WHERE code = $1 FOR UPDATE;
-- Check validity in application
UPDATE invite_codes SET uses = uses + 1 WHERE id = $2;
COMMIT;
```

---

## 7. Email Verification Flow

```
User signs up
    │
    ├── Supabase sends confirmation email (magic link / OTP)
    │
    ├── User lands on /auth/verify-email
    │       - Email shown from ?email= query param
    │       - Resend button (60-second cooldown)
    │
    ├── User clicks email link
    │       └── Browser navigates to /auth/confirm?code=<code>
    │
    ├── /auth/confirm page loads (Phase 2: API handler)
    │       ├── Calls supabase.auth.exchangeCodeForSession(code)
    │       ├── Supabase updates auth.users.email_confirmed_at
    │       └── DB trigger fires: UNVERIFIED → VERIFIED_NO_ROLE
    │
    └── Middleware / page handler redirects → /auth/role-select
```

### Resend Logic

- Cooldown: 60 seconds, enforced client-side via `useEffect` countdown.
- Server-side: Supabase rate-limits resends at the infrastructure level.
- Call: `supabase.auth.resend({ type: 'signup', email })`

---

## 8. Approval Flow (Admin → Candidate)

### MVP Flow (Google Sheets Sync Path)

```
Admin triggers sync (POST /api/sync/run)
    │
    ├── Sync service fetches rows from Google Sheets API
    │
    ├── Rows inserted into candidate_sync_staging (status: 'pending')
    │
    ├── Admin reviews staging rows in admin dashboard
    │
    ├── Admin clicks "Approve" on a staging row
    │       ├── POST /api/admin/candidates/[id]/approve
    │       ├── Creates candidate_profiles row (data_source: 'google_sheets_sync')
    │       ├── Updates staging row status → 'promoted'
    │       ├── If candidate has a user account: updates profiles.auth_state → APPROVED
    │       └── DB trigger fires: sets is_discoverable = true on candidate_profiles
    │
    └── Candidate gets email notification (Phase 3+)
            └── Next login → getCanonicalRoute → /dashboard/candidate
```

### Future Native Onboarding Path (Phase 5)

```
Candidate completes onboarding form
    └── POST /api/candidates/submit-profile
            ├── Creates/updates candidate_profiles (data_source: 'native_onboarding')
            └── Updates profiles.auth_state → PENDING_APPROVAL

Admin reviews in admin dashboard (same UI, different filter by data_source)
    └── Same approval/rejection flow as above
```

---

## 9. Reject / Suspend Flow

### Rejection

- **Who:** Admin only.
- **Action:** `POST /api/admin/candidates/[id]/reject` with `{ reason: string }`.
- **Effect:** `profiles.auth_state → REJECTED`, `candidate_profiles.rejection_reason` set.
- **User experience:** Next login → middleware redirects to `/auth/rejected`.
- **Reversibility:** `REJECTED` is a terminal state. User must contact support.

### Suspension

- **Who:** Admin only.
- **Action:** `POST /api/admin/users/[id]/suspend` with `{ reason?: string }`.
- **Effect:** `profiles.auth_state → SUSPENDED`.
- **User experience:** Next request → middleware redirects to `/auth/suspended`.
- **Reversibility:** Admin can reinstate: `profiles.auth_state → APPROVED`.

### Real-time Effect

Session-level: the middleware checks `auth_state` on every protected request. A user who is suspended while browsing the dashboard will be redirected on their next page navigation (within ~60 seconds if using Next.js navigation) or immediately if the access token refreshes.

---

## 10. Google OAuth Flow

*(Stubbed in Phase 1. Wired in Phase 2.)*

```
User clicks "Continue with Google"
    │
    ├── supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: '/auth/confirm' })
    │
    ├── Browser redirected to Google OAuth consent screen
    │
    ├── Google redirects back to /auth/confirm?code=<code>
    │
    ├── /auth/confirm exchanges code for session
    │       ├── New user? → trigger creates profiles row (auth_state: UNVERIFIED)
    │       │       └── But Google users skip email verify — trigger fires immediately
    │       │               profiles.auth_state → VERIFIED_NO_ROLE
    │       │
    │       └── Existing user? → session refreshed, redirect → getCanonicalRoute
    │
    └── Redirect → /auth/role-select (for new users) or dashboard (for existing)
```

**Note:** Google OAuth users have `email_confirmed_at` set by Supabase automatically (Google already verified the email). The `handle_email_verified` trigger fires and transitions `UNVERIFIED → VERIFIED_NO_ROLE` in the same operation.

---

## 11. Password Reset Flow

```
User clicks "Forgot password" on login screen
    │
    ├── /auth/forgot-password form
    │       └── supabase.auth.resetPasswordForEmail(email, { redirectTo: '/auth/reset-password' })
    │
    ├── Supabase sends reset email with token link
    │
    ├── User clicks link → lands on /auth/reset-password?token=<token>
    │       ├── token present? → show new password form
    │       └── token absent? → show "invalid link" state
    │
    ├── User submits new password
    │       ├── supabase.auth.updateUser({ password: newPassword })
    │       └── On success → show success state → link to /auth/login
    │
    └── User logs in with new password (standard login flow)
```

Token is extracted from `searchParams` in the Server Component page and passed as a prop to the Client Component form. No token in query string → invalid/expired link view.

---

## 12. Route Guard Reference

| Route prefix | Required state | Redirect on fail |
|---|---|---|
| `/dashboard/candidate/*` | `APPROVED` + `role = candidate` | `getCanonicalRoute(profile)` |
| `/dashboard/employer/*` | `APPROVED` + `role = employer` | `getCanonicalRoute(profile)` |
| `/dashboard/admin/*` | `APPROVED` + `role = admin` | `getCanonicalRoute(profile)` |
| `/onboarding/*` | `ONBOARDING` | `getCanonicalRoute(profile)` |
| `/auth/login` | unauthenticated | `getCanonicalRoute(profile)` (if logged in) |
| `/auth/signup` | unauthenticated | `getCanonicalRoute(profile)` (if logged in) |
| `/auth/verify-email` | `UNVERIFIED` | `getCanonicalRoute(profile)` |
| `/auth/role-select` | `VERIFIED_NO_ROLE` | `getCanonicalRoute(profile)` |
| `/auth/rejected` | `REJECTED` | open (no redirect) |
| `/auth/suspended` | `SUSPENDED` | open (no redirect) |
| `/auth/confirm` | any / unauthenticated | — (public, handles code exchange) |
| `/auth/forgot-password` | unauthenticated | `getCanonicalRoute(profile)` (if logged in) |
| `/auth/reset-password` | unauthenticated | — |

---

## 13. Implementation Files

| File | Purpose | Phase |
|---|---|---|
| `middleware.ts` | Route guard, session refresh, redirect logic | 2 |
| `lib/supabase/client.ts` | Browser Supabase singleton | 2 |
| `lib/supabase/server.ts` | Server-side cookie Supabase client | 2 |
| `lib/supabase/middleware.ts` | `updateSession()` helper | 2 |
| `lib/supabase/types.ts` | Generated DB types (`supabase gen types`) | 2 |
| `lib/auth/machine.ts` | `ALLOWED_TRANSITIONS`, `STATE_ROUTES`, `validateTransition()` | 2 |
| `lib/auth/router.ts` | `getCanonicalRoute(profile)` | 2 |
| `lib/hooks/use-auth.ts` | Client-side auth hook (`useUser`, `useProfile`, `useSignOut`) | 2 |
| `app/api/auth/callback/route.ts` | Code exchange handler | 2 |
| `app/auth/confirm/page.tsx` | Landing page for email/OAuth callbacks | 2 |
| `services/auth.service.ts` | Auth business logic (sign in, sign up, sign out, reset) | 2 |
