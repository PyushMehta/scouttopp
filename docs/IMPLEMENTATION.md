# ScouttOpp — Implementation Progress Tracker

> **Last updated:** 2026-06-30  
> **Updated by:** Phase 2 implementation  
> **Source of truth for specs:** Parts 1–4 (frozen) · `docs/DESIGN_SYSTEM.md`  
> **Overall progress:** ~55%

---

## Current Phase

**Phase 2 — Supabase Integration & Authentication Architecture**  
Status: ✅ **COMPLETE** — awaiting approval to begin Phase 3.

---

## Overall Progress

| Phase | Name | Status | % Done |
|---|---|---|---|
| 0 | Foundation | ✅ COMPLETE | 100% |
| 1 | Auth Screens (UI only) | ✅ COMPLETE | 100% |
| 2 | Supabase + Auth Machine | ✅ COMPLETE | 100% |
| 3 | Google Sheets Sync + Admin | ⬜ NOT STARTED | 0% |
| 4 | Candidate Dashboard | ⬜ NOT STARTED | 0% |
| 5 | Native Onboarding (FUTURE) | 🔒 DEFERRED | — |
| 6 | Swipe Feature (FUTURE) | 🔒 DEFERRED | — |

---

## Phase 1 — Auth Screens `COMPLETE`

### All Auth Routes

| Screen | Route | Component | Status | Notes |
|---|---|---|---|---|
| Login | `/auth/login` | `login-form.tsx` | ✅ Done | Zod, shake animation, credential error, Google OAuth stub |
| Signup | `/auth/signup` | `signup-form.tsx` | ✅ Done | Password strength, invite code expander, terms checkbox |
| Verify Email | `/auth/verify-email` | `verify-email-prompt.tsx` | ✅ Done | Resend cooldown (60s), success banner, email from searchParams |
| Role Select | `/auth/role-select` | `role-select-form.tsx` | ✅ Done | Animated radio cards, disabled continue until selected |
| Forgot Password | `/auth/forgot-password` | `forgot-password-form.tsx` | ✅ Done | Inline success view (no page change), Zod validation |
| Reset Password | `/auth/reset-password` | `reset-password-form.tsx` | ✅ Done | 3 states: invalid token / form / success; PasswordStrength reused |
| Rejected | `/auth/rejected` | `rejected-screen.tsx` | ✅ Done | Static Server Component, mailto CTA |
| Suspended | `/auth/suspended` | `suspended-screen.tsx` | ✅ Done | Static Server Component, warning-tinted, mailto CTA |
| Confirm | `/auth/confirm` | page (Server) | ✅ Done | Server-side redirect to `/api/auth/callback` passing code + type params |
| Pending | `/auth/pending` | `pending-screen.tsx` | ✅ Done | PENDING_APPROVAL state — shows review steps, email from server session |

### Phase 1 TypeScript status
`npx tsc --noEmit` → **0 errors** ✅

---

## Phase 2 — Supabase + Auth Machine `COMPLETE`

### Files Created

| File | Purpose |
|---|---|
| `.env.local.example` | Environment variable template |
| `lib/supabase/types.ts` | Hand-authored DB TypeScript types matching schema |
| `lib/supabase/client.ts` | Browser Supabase client (`createBrowserClient` from `@supabase/ssr`) |
| `lib/supabase/server.ts` | Server Supabase client (`createServerClient` + service role variant) |
| `lib/supabase/middleware.ts` | `updateSession()` — token refresh + user extraction for middleware |
| `lib/auth/machine.ts` | Auth state machine: `ALLOWED_TRANSITIONS`, `STATE_ROUTES`, `getCanonicalRoute()` |
| `lib/validations.ts` | Zod v4 schemas: login, signup, forgotPassword, resetPassword, inviteCode |
| `lib/hooks/use-auth.ts` | Client hook: `useAuth()` + `signOutClient()` |
| `types/index.ts` | Re-exports all types, `Profile` convenience alias |
| `constants/index.ts` | `APP_URL`, `ROUTES`, `RESEND_COOLDOWN_SECONDS`, `AUTH_CALLBACK_PATH` |
| `middleware.ts` | Route protection: state-machine-aware redirect logic, `getUser()` (not `getSession()`) |
| `services/auth.service.ts` | Server-side auth operations: signIn, signUp, OAuth, password reset, resend |
| `app/api/auth/callback/route.ts` | PKCE code exchange → session → canonical redirect (or `/auth/reset-password` for recovery) |
| `app/api/auth/role/route.ts` | `POST /api/auth/role` — validates + executes `VERIFIED_NO_ROLE → PENDING_APPROVAL` transition |
| `app/api/invite/validate/route.ts` | `POST /api/invite/validate` — case-insensitive code check, use count, expiry |
| `components/auth/pending-screen.tsx` | PENDING_APPROVAL UI — "you're on the list" with review steps |
| `app/auth/pending/page.tsx` | Server Component — fetches user email, renders `PendingScreen` |
| `supabase/migrations/20260630000000_initial_schema.sql` | All enums, tables, triggers, indexes |
| `supabase/migrations/20260630000001_rls_policies.sql` | All RLS policies (deny-by-default) |

### Files Modified

| File | Changes |
|---|---|
| `components/auth/login-form.tsx` | Wired `supabase.auth.signInWithPassword()` + Google OAuth + `router.refresh()` |
| `components/auth/signup-form.tsx` | Wired invite code validation, `supabase.auth.signUp()`, Google OAuth |
| `components/auth/verify-email-prompt.tsx` | Wired `supabase.auth.resend()` with 60s cooldown |
| `components/auth/forgot-password-form.tsx` | Wired `supabase.auth.resetPasswordForEmail()` with PKCE redirect |
| `components/auth/reset-password-form.tsx` | Redesigned: removed `token` prop, client-side session check, `supabase.auth.updateUser()` |
| `components/auth/role-select-form.tsx` | Wired `POST /api/auth/role`, follows `redirectTo` from response |
| `app/auth/confirm/page.tsx` | Server-side redirect to `/api/auth/callback` passing URL params |
| `app/auth/reset-password/page.tsx` | Removed obsolete `searchParams` extraction (no `token` prop) |

### Phase 2 TypeScript status
`npx tsc --noEmit` → **0 errors** ✅

---

## Phase 0 — Foundation `COMPLETE`

### Files Created / Modified
| File | Status | Notes |
|---|---|---|
| `app/globals.css` | ✅ Modified | Brand tokens, light-theme override, keyframes, `.animate-shake`, `.skeleton` |
| `app/layout.tsx` | ✅ Modified | Switched Geist → Plus Jakarta Sans (`--font-plus-jakarta-sans`) |
| `app/page.tsx` | ✅ Created | Root redirect → `/auth/login` |
| `components/ui/button.tsx` | ✅ Exists | Framer Motion, CSS vars, variant/size map |
| `components/ui/input.tsx` | ✅ Exists | `useId()`, aria-describedby, error state |
| `components/ui/password-input.tsx` | ✅ Exists | Wraps Input, Eye/EyeOff toggle |
| `components/ui/checkbox.tsx` | ✅ Modified | Widened `label` prop: `string` → `ReactNode` |
| `components/ui/badge.tsx` | ✅ Exists | — |
| `components/ui/textarea.tsx` | ✅ Exists | — |
| `components/ui/select.tsx` | ✅ Exists | — |
| `components/ui/radio.tsx` | ✅ Exists | — |
| `components/ui/card.tsx` | ✅ Exists | — |
| `components/ui/avatar.tsx` | ✅ Exists | — |
| `components/ui/spinner.tsx` | ✅ Exists | — |
| `components/ui/skeleton.tsx` | ✅ Exists | — |
| `components/ui/toast.tsx` | ✅ Exists | — |
| `components/ui/drawer.tsx` | ✅ Exists | — |
| `components/ui/modal.tsx` | ✅ Exists | — |
| `components/ui/tabs.tsx` | ✅ Exists | — |
| `components/ui/tooltip.tsx` | ✅ Exists | — |
| `components/ui/divider.tsx` | ✅ Exists | — |
| `components/ui/search-input.tsx` | ✅ Exists | — |
| `components/ui/page-transition.tsx` | ✅ Exists | — |
| `components/ui/index.ts` | ✅ Exists | Barrel exports |
| `components/layout/navbar.tsx` | ✅ Exists | — |
| `components/layout/footer.tsx` | ✅ Exists | — |
| `components/layout/container.tsx` | ✅ Exists | — |
| `components/layout/section.tsx` | ✅ Exists | — |
| `components/layout/index.ts` | ✅ Exists | Barrel exports |
| `lib/utils.ts` | ✅ Exists | `cn()` — clsx + tailwind-merge |
| `lib/tokens.ts` | ✅ Exists | Animation tokens, transitions, variants |
| `lib/supabase.ts` | ⚠️ Empty | Stub file — real implementation Phase 2 |
| `lib/validations.ts` | ⚠️ Empty | Stub file — real implementation Phase 2+ |

---

## Folder Structure Status

```
app/
  (marketing)/
    layout.tsx          ✅ exists
    page.tsx            ✅ exists
  auth/
    layout.tsx          ✅ exists — two-panel shell (42% navy / 58% warm-white)
    login/page.tsx      ✅ exists
    signup/page.tsx     ✅ exists
    verify-email/page.tsx  ✅ exists
    confirm/page.tsx       ✅ exists (placeholder)
    role-select/page.tsx   ✅ exists
    forgot-password/page.tsx  ✅ exists
    reset-password/page.tsx   ✅ exists
    rejected/page.tsx      ✅ exists
    suspended/page.tsx     ✅ exists
  dashboard/
    candidate/page.tsx  ⚠️ stub (return null) — Phase 4
    employer/page.tsx   ⚠️ stub (return null) — Phase 4
    admin/page.tsx      ⚠️ stub (return null) — Phase 6
  globals.css           ✅ complete
  layout.tsx            ✅ complete
  page.tsx              ✅ root redirect

components/
  auth/
    brand-panel.tsx           ✅ Server Component, navy left panel
    google-button.tsx         ✅ Inline SVG Google logo, loading state
    auth-divider.tsx          ✅ Reusable "or" separator
    login-form.tsx            ✅ Full form, Zod, shake, credential error
    signup-form.tsx           ✅ Password strength, invite code expander, terms
    password-strength.tsx     ✅ 4-segment animated bar, 5 states
    verify-email-prompt.tsx   ✅ Resend cooldown, success banner
    role-select-form.tsx      ✅ Animated radio cards, keyboard accessible
    forgot-password-form.tsx  ✅ Form + inline success view
    reset-password-form.tsx   ✅ Invalid token / form / success states
    rejected-screen.tsx       ✅ Static Server Component
    suspended-screen.tsx      ✅ Static Server Component
  ui/                   ✅ all primitives exist
  layout/               ✅ all layout components exist

lib/
  utils.ts              ✅ complete
  tokens.ts             ✅ complete
  supabase.ts           ⚠️ empty stub — Phase 2
  validations.ts        ⚠️ empty stub — Phase 2+

store/                  ⬜ not created (Phase 5 — DEFERRED)
middleware.ts           ⬜ not created (Phase 2)
```

---

## Database Status

| Status | Notes |
|---|---|
| ⬜ NOT CREATED | Supabase project not yet connected |

### Schema Designed (ready to deploy in Phase 2):
- `profiles` — core auth state machine row per user
- `candidate_sync_staging` — Google Sheets sync transit layer
- `sync_runs` — audit log of sync executions
- `candidate_profiles` — canonical candidate data (compatible with future native onboarding)
- `candidate_specialties` — candidate skills
- `candidate_portfolio_items` — portfolio entries
- `candidate_preferences` — work preferences
- `employer_profiles` — employer data
- `employer_hiring_profiles` — hiring details
- `employer_showcase_items` — company culture content
- `employer_preferences` — hiring preferences
- `invite_codes` — signup invite codes
- `swipe_actions` — FUTURE (defined now, empty)
- `matches` — FUTURE (defined now, empty)

---

## API Status

| Route | Method | Status | Phase |
|---|---|---|---|
| `/api/auth/callback` | GET | ⬜ Not created | 2 |
| `/api/invite/validate` | POST | ⬜ Not created | 2 |
| `/api/sync/run` | POST | ⬜ Not created | 3 |
| `/api/sync/status/[runId]` | GET | ⬜ Not created | 3 |
| `/api/admin/candidates` | GET | ⬜ Not created | 3 |
| `/api/admin/candidates/[id]/approve` | POST | ⬜ Not created | 3 |
| `/api/admin/candidates/[id]/reject` | POST | ⬜ Not created | 3 |

---

## UI Component Status

### Auth Components
| Component | Complete | Notes |
|---|---|---|
| `AuthLayout` (two-panel shell) | ✅ | `app/auth/layout.tsx` |
| `BrandPanel` | ✅ | Navy left panel, logo, features, quote |
| `GoogleButton` | ✅ | Inline SVG, loading spinner, Framer Motion |
| `AuthDivider` | ✅ | "or" separator, reusable |
| `LoginForm` | ✅ | Zod, react-hook-form, shake, credential error |
| `SignupForm` | ✅ | Password strength, invite code expander, terms |
| `PasswordStrength` | ✅ | 4-segment bar, animated, hint text |
| `VerifyEmailPrompt` | ✅ | Resend cooldown timer, success banner, help box |
| `RoleSelectForm` | ✅ | Animated radio cards, radio semantics, Framer Motion dot |
| `ForgotPasswordForm` | ✅ | Form → inline success state transition |
| `ResetPasswordForm` | ✅ | 3-state: no-token / form / success; PasswordStrength reused |
| `RejectedScreen` | ✅ | Static Server Component, reasons list, mailto CTA |
| `SuspendedScreen` | ✅ | Static Server Component, warning tone, mailto CTA |

### UI Primitives
| Component | Complete | Notes |
|---|---|---|
| `Button` | ✅ | variants: primary, secondary, ghost, outline, destructive, icon |
| `Input` | ✅ | label, error, `useId`, aria |
| `PasswordInput` | ✅ | Eye/EyeOff toggle |
| `Checkbox` | ✅ | `ReactNode` label, Framer Motion check |
| `Badge` | ✅ | — |
| `Textarea` | ✅ | — |
| `Select` | ✅ | — |
| `Radio` | ✅ | — |
| `Card` | ✅ | — |
| `Avatar` | ✅ | — |
| `Spinner` | ✅ | — |
| `Skeleton` | ✅ | — |
| `Toast` | ✅ | — |
| `Drawer` | ✅ | — |
| `Modal` | ✅ | — |
| `Tabs` | ✅ | — |
| `Tooltip` | ✅ | — |
| `Divider` | ✅ | — |
| `SearchInput` | ✅ | — |
| `PageTransition` | ✅ | — |
| `FileUpload` | ⬜ | Phase 5 (onboarding) |
| `TagInput` | ⬜ | Phase 5 (onboarding) |
| `AvatarUpload` | ⬜ | Phase 5 (onboarding) |
| `Slider` | ⬜ | Phase 5 (onboarding) |
| `Progress` | ⬜ | Phase 5 (onboarding) |

---

## Known Issues

| # | Severity | Issue | Status |
|---|---|---|---|
| 1 | Low | `lib/supabase.ts` and `lib/validations.ts` are empty stub files | Phase 2 |
| 2 | Low | `app/dashboard/candidate\|employer\|admin/page.tsx` return `null` | Phase 4/6 |

---

## Architecture Decisions (Permanent)

| Decision | Rationale |
|---|---|
| `data-color-scheme="light"` on auth form panel | Cascades CSS variable redefinitions — no component duplication needed |
| Zod v4 uses `error:` not `errorMap:` | Breaking change from v3 |
| `z.literal(true, { error: ... })` for terms checkbox | Zod v4 pattern for literal validation with custom message |
| `max-w-110` not `max-w-[440px]` | Tailwind v4 canonical class (arbitrary value triggers lint warning) |
| Inline SVG for Google/brand logos | `lucide-react` v1 has no brand icons |
| `params` must be `await`ed in Next.js 16 | `params` / `searchParams` are now `Promise<{...}>` |
| `PageProps<T>` requires route type argument in Next.js 16 | Used inline prop type `{ searchParams: Promise<Record<...>> }` instead |
| Static screens (Rejected, Suspended) use `<a>` not `<Button>` | Server Components — no need for client-side Framer Motion on mailto links |
| All hooks called before early returns in ResetPasswordForm | React Rules of Hooks — conditional hook calls are forbidden |
| Google Sheets is transit layer, Supabase is source of truth | After sync, app never queries Sheets again for that data |
| `is_discoverable` flag on `candidate_profiles` | Future swipe feature queries this; no schema change needed at Phase 6 |
| `data_source` enum on `candidate_profiles` | Distinguishes Google Sheets synced rows from future native onboarding |

---

## Design Token Reference

### Brand Colours
| Token | Value | Usage |
|---|---|---|
| `--color-navy` `#2B3875` | `bg-navy`, `text-navy` | Brand primary, auth panel, links, active states |
| `--color-navy-deep` `#1e2850` | `bg-navy-deep` | Navy hover |
| `--color-indigo` `#6B5FAE` | `text-indigo` | Secondary links, subtle CTAs |
| `--color-cream` `#F9F0E3` | `bg-cream` | Warm surface, info boxes |
| `--color-warm-white` `#FDFAF6` | `bg-warm-white` | Form panel background |
| `--color-vellum` `#F0E8D8` | `bg-vellum` | Card hover |
| `--color-flax` `#D8CFC0` | `border-flax` | Borders, dividers |
| `--color-stone` `#8A8070` | `text-stone` | Muted text |
| `--color-charcoal` `#2C2620` | `text-charcoal` | Primary dark body text |
| `--color-brand-error` `#C43A3A` | — | Error states, rejected |
| `--color-brand-success` `#2D8A5E` | — | Success states |
| `--color-brand-warning` `#C47C1A` | — | Warning states, suspended |

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Next.js | 16.2.9 (App Router) |
| UI | React | 19.2.4 |
| Styling | Tailwind CSS | v4 |
| Animation | Framer Motion | 12.x |
| Forms | react-hook-form | 7.x |
| Validation | Zod | 4.x |
| Icons | lucide-react | 1.x (no brand icons — use inline SVG) |
| Auth/DB | Supabase | 2.x (wired in Phase 2) |
| Toasts | Sonner | 2.x |
| Font | Plus Jakarta Sans | via `next/font/google` |

---

## Documentation Suite

All project docs live in `docs/`. Moved from project root. Update the relevant file **before** making any change it describes.

| File | Status | Contents |
|---|---|---|
| `docs/DESIGN_SYSTEM.md` | ✅ Complete | Visual source of truth — colours, typography, spacing, all components |
| `docs/DATABASE.md` | ✅ Complete | 14 tables, 5 enums, triggers, RLS policies, migration strategy |
| `docs/AUTH_FLOW.md` | ✅ Complete | 8-state machine, route guards, middleware, session lifecycle, all flows |
| `docs/API_REFERENCE.md` | ✅ Complete | All endpoints (Phases 2–6), request/response, error format |
| `docs/PROJECT_STRUCTURE.md` | ✅ Complete | Every folder, architectural decisions, import conventions |
| `docs/IMPLEMENTATION.md` | ✅ This file | Progress tracker |
| `docs/CHANGELOG.md` | ✅ Complete | Version history, format guide |
| `docs/DEPLOYMENT.md` | ✅ Complete | Vercel + Supabase setup, env vars, migration steps, post-deploy checklist |
| `docs/SECURITY.md` | ✅ Complete | Threat model, RLS, secrets, injection prevention, CSRF, checklist |
| `docs/TESTING.md` | ✅ Complete | Vitest + Playwright strategy, patterns, CI/CD |
| `docs/FUTURE_ROADMAP.md` | ✅ Complete | Phases 5–6, post-launch features, deferred decisions |

---

## Next Recommended Task

**Begin Phase 2 — Supabase + Auth Machine** (requires explicit approval)

Phase 2 scope:
1. Create Supabase project, configure env vars (`.env.local`)
2. `lib/supabase/client.ts` — browser Supabase client (singleton)
3. `lib/supabase/server.ts` — cookie-based server client
4. `lib/supabase/middleware.ts` — `updateSession()` helper
5. `lib/supabase/types.ts` — generated DB types (`supabase gen types typescript`)
6. Deploy database schema to Supabase (all tables, enums, RLS policies, triggers)
7. `lib/auth/machine.ts` — `STATE_ROUTES` + `ALLOWED_TRANSITIONS` constants
8. `lib/auth/router.ts` — `getCanonicalRoute(state, role)` helper
9. `middleware.ts` — auth guard for `/dashboard/*` and `/onboarding/*`
10. `app/api/auth/callback/route.ts` — exchange code for session, redirect by auth_state
11. Replace all `TODO Phase 2` stubs in auth components with real Supabase calls
12. `app/auth/confirm/page.tsx` — replace placeholder with real callback logic
13. `lib/hooks/use-auth.ts` — client-side auth hook

**Do NOT begin Phase 2 until explicitly approved.**
