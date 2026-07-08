# ScouttOpp — Authentication Flow
### State Machine, Route Guards, and Session Lifecycle

> **Status:** ✅ Implemented in Phase 2. State machine live in `lib/auth/machine.ts`; route guard in `proxy.ts`; API routes in `app/api/auth/`.  
> This document is the authoritative reference for every auth state, transition, guard, and redirect rule. Update it before changing any auth logic.

---

## Table of Contents

1. [The 8-State Machine](#1-the-8-state-machine)
2. [State Transitions](#2-state-transitions)
3. [Route Guard — proxy.ts](#3-route-guard--proxysts)
4. [Auth Flows](#4-auth-flows)
5. [Implementation Files](#5-implementation-files)
6. [Security Notes](#6-security-notes)

---

## 1. The 8-State Machine

`auth_state` is stored in `profiles.auth_state` (type: `auth_state_enum`). Every authenticated user has exactly one state at all times.

| State | Meaning | Canonical Route |
|---|---|---|
| `UNVERIFIED` | Account created but email not yet confirmed | `/auth/verify-email` |
| `VERIFIED_NO_ROLE` | Email confirmed; user hasn't chosen a role yet | `/auth/role-select` |
| `ONBOARDING` | Role chosen; completing in-app onboarding (Phase 7) | `/onboarding` |
| `PENDING_APPROVAL` | Onboarding submitted; awaiting admin review | `/auth/pending` |
| `APPROVED` | Admin approved; full access to role dashboard | `/dashboard/<role>` |
| `REJECTED` | Admin rejected; account cannot progress | `/auth/rejected` |
| `SUSPENDED` | Admin suspended; access revoked | `/auth/suspended` |
| `INVITED` | Admin sent Supabase invite; awaiting user acceptance | `/auth/role-select` |

**`getCanonicalRoute(role, authState)`** in `lib/auth/machine.ts` maps any (role, state) pair to its canonical route.

---

## 2. State Transitions

### Allowed Transitions (enforced in `lib/auth/machine.ts`)

```
UNVERIFIED          → VERIFIED_NO_ROLE   (email link confirmation)
VERIFIED_NO_ROLE    → PENDING_APPROVAL   (POST /api/auth/role)
VERIFIED_NO_ROLE    → ONBOARDING         (POST /api/auth/role — Phase 7)
ONBOARDING          → PENDING_APPROVAL   (POST /api/onboarding/submit — Phase 7)
PENDING_APPROVAL    → APPROVED           (admin approve)
PENDING_APPROVAL    → REJECTED           (admin reject)
INVITED             → APPROVED           (candidate accepts invite via /api/auth/callback)
APPROVED            → SUSPENDED          (admin suspend)
SUSPENDED           → APPROVED           (admin reinstate)
```

Any other transition returns `400 INVALID_TRANSITION`.

### Current MVP Path (Phases 0–4)

Candidates currently enter via Google Form → admin approve → Supabase invite, bypassing the `PENDING_APPROVAL` state for their initial onboarding:

```
Admin syncs sheet → candidate_profiles (user_id=null, auth_state=INVITED)
    → Supabase invite email sent
    → Candidate clicks email link → /api/auth/callback
    → auth_state = APPROVED, user_id linked
    → redirect → /dashboard/candidate
```

---

## 3. Route Guard — `proxy.ts`

File: `proxy.ts` (root of project)  
Export: `proxy` (named, not default)

**Note:** Next.js 16 renamed `middleware.ts` to `proxy.ts` and the export from `middleware` to `proxy`. Do not create or edit `middleware.ts`.

### How It Works

1. Reads session via `updateSession()` from `lib/supabase/middleware.ts`
2. Uses `getUser()` (server JWT validation) — never `getSession()` (cache-based)
3. Fetches `profiles` row for role + `auth_state`
4. Redirects to `getCanonicalRoute(role, authState)` if user is on wrong route

### Route Categories

| Category | Routes | Behaviour |
|---|---|---|
| `ALWAYS_PUBLIC` | `/api/auth/callback`, `/api/invite/validate`, `/auth/confirm`, `/auth/reset-password`, `/auth/rejected`, `/auth/suspended` | No redirect — always serve as-is |
| `UNAUTHED_PUBLIC` | `/auth/login`, `/auth/signup`, `/auth/forgot-password`, `/auth/verify-email` | Serve to unauthenticated; redirect authenticated users to their canonical route |
| Protected | Everything else | Require authenticated + `APPROVED` state + correct role |

### matcher Config

```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## 4. Auth Flows

### Email / Password Signup

```
1. POST /auth/signup form
2. supabase.auth.signUp({ email, password })
3. Supabase sends verification email
4. profiles trigger auto-creates row: auth_state = UNVERIFIED
5. User is redirected to /auth/verify-email
6. User clicks email link → /auth/confirm (server redirect)
7. → /api/auth/callback?token_hash=...
8. PKCE exchange → session created
9. profiles.auth_state updated: UNVERIFIED → VERIFIED_NO_ROLE
10. Redirect → /auth/role-select
11. User selects role → POST /api/auth/role
12. profiles.auth_state: VERIFIED_NO_ROLE → PENDING_APPROVAL
13. Redirect → /auth/pending
```

### Google OAuth Signup

```
1. supabase.auth.signInWithOAuth({ provider: 'google' })
2. OAuth callback → /api/auth/callback?code=...
3. PKCE exchange → session created
4. profiles trigger creates row (if first sign-in): auth_state = UNVERIFIED
5. Email is auto-verified by Google → auth_state → VERIFIED_NO_ROLE
6. Redirect → /auth/role-select (same as step 10 above)
```

### Supabase Invite Flow (Current Candidate Path)

```
1. Admin approves staging candidate → admin.service.ts
2. candidate_profiles row INSERT (user_id=null, auth_state=INVITED)
3. supabase.auth.admin.inviteUserByEmail({ email })
4. Candidate receives invite email → clicks link
5. Browser → /api/auth/callback?code=... (invite code)
6. PKCE exchange → new user created in auth.users
7. /api/auth/callback detects invite type:
   - Sets candidate_profiles.user_id = auth.user.id
   - Sets profiles.auth_state = APPROVED
8. Redirect → /dashboard/candidate
```

### Forgot Password

```
1. POST /auth/forgot-password form
2. supabase.auth.resetPasswordForEmail({ email, redirectTo: /api/auth/callback?next=/auth/reset-password })
3. Always show success (prevents email enumeration)
4. User clicks email → /api/auth/callback (recovery session type)
5. Redirect → /auth/reset-password
6. supabase.auth.updateUser({ password: newPassword })
7. Redirect → /auth/login
```

### Sign Out

```
Client: signOutClient() in lib/hooks/use-auth.ts
    → supabase.auth.signOut()
    → redirect → /auth/login
```

---

## 5. Implementation Files

| File | Purpose |
|---|---|
| `proxy.ts` | Route guard — reads session, checks state, redirects |
| `lib/supabase/middleware.ts` | `updateSession()` — refreshes session cookie for proxy.ts |
| `lib/auth/machine.ts` | `ALLOWED_TRANSITIONS`, `STATE_ROUTES`, `getCanonicalRoute()` |
| `lib/auth/require-admin.ts` | Admin API auth guard — returns `{ ok, userId }` or `{ ok: false, response }` |
| `lib/auth/require-candidate.ts` | Candidate API auth guard — returns `{ ok, userId, candidateProfileId }` or `{ ok: false, response }` |
| `lib/hooks/use-auth.ts` | `useAuth()` client hook — reads session; `signOutClient()` |
| `app/api/auth/callback/route.ts` | PKCE exchange + recovery detection + invite linking |
| `app/api/auth/role/route.ts` | Role assignment → `VERIFIED_NO_ROLE → PENDING_APPROVAL` |
| `app/api/invite/validate/route.ts` | Invite code validation |
| `app/auth/confirm/page.tsx` | Server redirect to `/api/auth/callback` (preserves `token_hash`) |

---

## 6. Security Notes

### `getUser()` not `getSession()`

`proxy.ts` uses `supabase.auth.getUser()` which validates the JWT server-side on every request. `getSession()` reads from the cookie cache and can be stale — never use it for security decisions.

### Service Role Key

`createServiceClient()` uses `SUPABASE_SERVICE_ROLE_KEY`. This key bypasses RLS and must never appear in `NEXT_PUBLIC_` variables or be sent to the browser.

### Email Enumeration Prevention

`POST /auth/forgot-password` always responds with a success screen regardless of whether the email exists in the database.

### Cascade Deletes

Account deletion calls `auth.admin.deleteUser(userId)`. FK constraints cascade all child rows:

```
auth.users
  └── profiles (ON DELETE CASCADE)
        └── candidate_profiles (ON DELETE CASCADE)
              ├── candidate_specialties (ON DELETE CASCADE)
              ├── candidate_portfolio_items (ON DELETE CASCADE)
              └── candidate_preferences (ON DELETE CASCADE)
```

### RLS Deny-by-Default

Every table starts with `ENABLE ROW LEVEL SECURITY` + `USING (false)`. Rows are accessible only through explicit `SELECT`, `INSERT`, `UPDATE`, `DELETE` policies. See `docs/DATABASE.md` for full policy list.
