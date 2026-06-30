# ScouttOpp — Changelog

All notable changes to ScouttOpp are documented here.  
Format: **[version] — date** followed by `Added`, `Changed`, `Fixed`, `Removed`, `Security` sections.  
Versioning follows [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`.

---

## [Unreleased]

_Nothing pending._

---

## [0.2.0] — 2026-06-30

### Phase 2 Complete — Supabase Integration & Authentication Architecture

#### Added
- `@supabase/ssr` package — `createBrowserClient` / `createServerClient` for App Router
- `lib/supabase/types.ts` — comprehensive TypeScript DB types matching full schema
- `lib/supabase/client.ts` — browser Supabase client singleton
- `lib/supabase/server.ts` — server + service-role Supabase clients (cookies-based)
- `lib/supabase/middleware.ts` — `updateSession()` for token refresh in middleware
- `lib/auth/machine.ts` — auth state machine: transitions, routes, `getCanonicalRoute()`
- `lib/validations.ts` — Zod v4 schemas for all auth forms (Zod v4 compatible)
- `lib/hooks/use-auth.ts` — `useAuth()` client hook + `signOutClient()`
- `types/index.ts` — unified type re-exports
- `constants/index.ts` — `APP_URL`, typed `ROUTES`, all constant values
- `middleware.ts` — state-machine-aware route protection using `getUser()` (not `getSession()`)
- `services/auth.service.ts` — server-side auth service functions
- `app/api/auth/callback/route.ts` — PKCE code exchange, recovery session detection
- `app/api/auth/role/route.ts` — role assignment + `VERIFIED_NO_ROLE → PENDING_APPROVAL` transition
- `app/api/invite/validate/route.ts` — invite code validation (case-insensitive, use count, expiry)
- `components/auth/pending-screen.tsx` — PENDING_APPROVAL state UI
- `app/auth/pending/page.tsx` — server-rendered pending page
- `supabase/migrations/20260630000000_initial_schema.sql` — enums, tables, triggers, indexes
- `supabase/migrations/20260630000001_rls_policies.sql` — deny-by-default RLS policies
- `.env.local.example` — environment variable template

#### Changed
- `components/auth/login-form.tsx` — wired real Supabase auth (signIn + Google OAuth)
- `components/auth/signup-form.tsx` — wired real Supabase signUp, invite code validation, Google OAuth
- `components/auth/verify-email-prompt.tsx` — wired `supabase.auth.resend()`
- `components/auth/forgot-password-form.tsx` — wired `resetPasswordForEmail()` with PKCE redirect
- `components/auth/reset-password-form.tsx` — redesigned to use session check instead of URL token
- `components/auth/role-select-form.tsx` — wired `POST /api/auth/role` with canonical redirect
- `app/auth/confirm/page.tsx` — now server-redirects to `/api/auth/callback` with params
- `app/auth/reset-password/page.tsx` — removed obsolete token extraction from searchParams

#### Security
- Middleware uses `getUser()` (server-side JWT validation), not `getSession()` (cache-based)
- Service role key confined to server-side only — never in `NEXT_PUBLIC_` vars
- RLS deny-by-default on all tables with explicit per-role policies
- Email enumeration protection in forgot-password flow (always shows success)

---

## [0.1.0] — 2026-06-30

### Phase 1 Complete — Auth UI

#### Added
- Auth layout (`app/auth/layout.tsx`) — two-panel shell, navy left / warm-white right
- `data-color-scheme="light"` cascade on auth form panel
- All 9 authentication screens:
  - Login (`/auth/login`) — Zod validation, shake animation, credential error state, Google OAuth stub
  - Signup (`/auth/signup`) — password strength, invite code expander, terms checkbox
  - Verify Email (`/auth/verify-email`) — 60-second resend cooldown, success banner, email from searchParams
  - Role Select (`/auth/role-select`) — animated radio cards, keyboard accessible
  - Forgot Password (`/auth/forgot-password`) — inline success state
  - Reset Password (`/auth/reset-password`) — 3 states (invalid token / form / success)
  - Rejected (`/auth/rejected`) — static Server Component, mailto CTA
  - Suspended (`/auth/suspended`) — static Server Component, warning tone
  - Confirm (`/auth/confirm`) — placeholder spinner, Phase 2 ready
- Root page (`app/page.tsx`) — redirects to `/auth/login`
- Auth components: `BrandPanel`, `GoogleButton`, `AuthDivider`, `PasswordStrength`
- Complete UI primitive library (`components/ui/`):
  - `Button` (6 variants, 3 sizes, loading/disabled states, Framer Motion)
  - `Input` (label, error, helper, left/right icons, aria)
  - `PasswordInput` (Eye/EyeOff toggle)
  - `Checkbox` (ReactNode label, spring animation)
  - `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardBody`, `CardFooter`
  - `Badge` (6 variants, 2 sizes, dot, dismiss)
  - `Modal` (focus trap, portal, 5 sizes, Framer Motion)
  - `Avatar`, `AvatarGroup`
  - `Spinner`, `Skeleton`
  - `Toast` (Sonner wrapper, 7 helpers)
  - `Drawer`, `Tabs`, `Tooltip`, `Divider`, `Select`, `Textarea`, `Radio`, `SearchInput`, `PageTransition`
- `lib/tokens.ts` — animation tokens, Framer Motion variants
- `lib/utils.ts` — `cn()` clsx + tailwind-merge
- `app/globals.css` — brand palette, light-canvas override, keyframes, `.animate-shake`, `.skeleton`
- Plus Jakarta Sans font (next/font/google, weights 400–800)
- Stub files: `lib/supabase.ts`, `lib/validations.ts`, `services/*.ts`, `types/index.ts`, `constants/index.ts`

#### Changed
- `components/ui/checkbox.tsx` — widened `label` prop from `string` to `ReactNode`
- `components/auth/signup-form.tsx` — post-signup redirect to `/auth/verify-email?email=...`

#### Fixed
- Zod v4 breaking change: `errorMap` → `error` in `z.literal()` options
- Next.js 16 breaking change: `params`/`searchParams` now `Promise<{...}>` — awaited in all page components
- Tailwind v4 lint warning: `max-w-[440px]` → `max-w-110`

---

## Versioning Guide

| Version bump | When |
|---|---|
| `PATCH` (0.0.X) | Bug fixes, copy changes, styling tweaks |
| `MINOR` (0.X.0) | New feature, new screen, new endpoint, new component |
| `MAJOR` (X.0.0) | Breaking schema change, major UX overhaul, platform-level change |

### Phase → Version Mapping

| Phase | Expected version |
|---|---|
| Phase 0 (foundation) | 0.1.0 |
| Phase 1 (auth UI) | 0.1.0 |
| Phase 2 (Supabase + auth machine) | 0.2.0 |
| Phase 3 (sync + admin) | 0.3.0 |
| Phase 4 (dashboards) | 0.4.0 |
| Phase 5 (native onboarding) | 0.5.0 |
| Phase 6 (swipe) | 0.6.0 |
| Production launch | 1.0.0 |
