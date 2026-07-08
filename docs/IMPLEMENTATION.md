# ScouttOpp — Implementation Status
### Phase-by-Phase Progress Tracker

> **Last updated:** 2026-07-05  
> **Overall status:** v0.7.0 — **Candidate Beta live.** Employer features preserved in codebase, disabled in production via `NEXT_PUBLIC_EMPLOYER_ENABLED` flag. Phase 7 (Native Candidate Onboarding) is next.

---

## Phase Summary

| Phase | Name | Status | Version |
|---|---|---|---|
| 0 | Foundation — design system, UI primitives | ✅ FROZEN | 0.1.0 |
| 1 | Auth screens (UI only) | ✅ FROZEN | 0.1.0 |
| 2 | Supabase + auth machine | ✅ FROZEN | 0.2.0 |
| 3 | Google Sheets sync + admin dashboard | ✅ FROZEN | 0.3.0 |
| 4 | Candidate dashboard v1 | ✅ FROZEN | 0.4.0 |
| 5 | Public marketing website + Employer Dashboard MVP | ✅ FROZEN | 0.5.0 |
| 5C | Employer Dashboard Foundation — full nav shell, analytics, notifications, candidates/matches/messages | ✅ FROZEN | 0.5.1 |
| 6 | Employer Discovery Engine — discovery feed, save/pass, filters, profile panel, notes | ✅ FROZEN | 0.6.0 |
| 6.5 | Architecture Refinement — multi-role, pass logic, completeness gate, portfolio links, Scout branding | ✅ FROZEN | 0.6.5 |
| 6.6 | Scout Mode UI — Hinge-style stacked card deck, drag gestures, portfolio carousel, filter pre-flight | ✅ FROZEN | 0.6.6 |
| **Beta** | **Candidate Beta Launch** — employer feature flag, candidate-focused landing, Founding Creative UX | **🚀 LIVE** | **0.7.0** |
| 7 | Native candidate onboarding | 🔒 NOT STARTED | — |
| 8 | Swipe discovery engine | 🔒 NOT STARTED | — |
| 9 | Messaging | 🔒 NOT STARTED | — |
| 10 | AI matching | 🔒 NOT STARTED | — |
| 11 | Production readiness (incl. Employer Beta re-enable) | 🔒 NOT STARTED | — |

---

## Phase 6.6 — Scout Mode UI `FROZEN`

### New Components

| File | Exports | Purpose |
|---|---|---|
| `components/discovery/scout-card.tsx` | `ScoutCard`, `StaticCardPreview`, `CardPortfolioItem` | Draggable candidate card with drag gestures, rotation overlays, portfolio carousel |
| `components/discovery/scout-deck.tsx` | `ScoutDeck` | Stacked card deck; manages local stack, portfolio pre-fetch, undo history, load-more trigger |
| `components/discovery/scout-actions.tsx` | `ScoutActions` | Standalone Pass / Undo / Scout action bar |
| `components/discovery/scout-filter-sheet.tsx` | `ScoutFilterSheet` | Right-side filter Drawer with draft state; confirms on "Start Scouting" |
| `components/discovery/scout-mode.tsx` | `ScoutMode` | Orchestrator; pre-flight landing → scouting deck; calls save/pass APIs; opens CandidateProfilePanel |

### Modified Files

| File | Change |
|---|---|
| `components/discovery/filter-panel.tsx` | `FilterContent` exported; `ROLES` array updated to PRESET_ROLES text values |
| `app/dashboard/employer/candidates/page.tsx` | Replaced `DiscoveryFeed` with `ScoutMode`; title updated |

### Interaction Model

| Gesture / Action | Threshold | Result |
|---|---|---|
| Drag right | offset > 90px or velocity > 450px/s | Scout (save) |
| Drag left | offset < −90px or velocity < −450px/s | Pass |
| Release inside threshold | — | Spring return to center |
| Scout button | — | `forceDismiss='scout'` on active card |
| Pass button | — | `forceDismiss='pass'` on active card |
| Undo button | — | Re-inserts last dismissed card at top of stack |

### TypeScript Status (current freeze)

| Area | Status |
|---|---|
| Phase 6.6 (current freeze) | ✅ 0 errors (`tsc --noEmit`) |
| Phase 6.5 | ✅ 0 errors |
| Phase 6 | ✅ 0 errors |

---

## Phase 6.5 — Architecture Refinement `FROZEN`

### What Changed

#### Database (migration `20260701000002_phase6_5_arch.sql`)

| Change | Detail |
|---|---|
| `candidate_profiles.primary_role` | Migrated from `candidate_role_enum` → `TEXT`; supports custom role labels beyond preset list |
| `candidate_profiles.profile_completeness` | Added `SMALLINT NOT NULL DEFAULT 0`; computed 0–100 score updated by `lib/candidate-completeness.ts` |
| `candidate_roles` table | Relational multi-role table; partial UNIQUE index on primary flag |
| `candidate_portfolio_links` table | External portfolio links (Behance, Dribbble, YouTube, Vimeo, GitHub, Instagram, PDF, website, other) |
| `employer_passed_candidates.pass_type` | `'temporary'` (30-day, default) or `'forever'` (permanent hide) |
| `employer_passed_candidates.expires_at` | `now() + 30 days` for temp; null for forever |
| `employer_passed_candidates.candidate_updated_at` | Snapshot at pass time; re-eligibility when candidate updates profile |
| `swipe_action_enum` | Added `'scout'` value; `'like'` kept for legacy compatibility |

#### New Files

| File | Purpose |
|---|---|
| `lib/candidate-completeness.ts` | `computeCompleteness`, `updateCompleteness`, `meetsDiscoveryThreshold` |
| `supabase/migrations/20260701000002_phase6_5_arch.sql` | Idempotent Phase 6.5 migration |

#### Updated Files

| File | Change |
|---|---|
| `constants/index.ts` | Added `PRESET_ROLES` (15 labels), `MIN_DISCOVERY_COMPLETENESS = 0` |
| `app/api/discovery/route.ts` | Smart pass exclusion; role filter via `candidate_roles`; `profile_completeness` + `roles` in payload |
| `app/api/discovery/pass/route.ts` | `forever` flag; writes `pass_type`, `expires_at`, `candidate_updated_at` |
| `lib/supabase/types.ts` | `primary_role: string | null`; `profile_completeness`; new table types; `SwipeActionEnum` + `'scout'` |
| `services/sync-mapper.ts` | `primary_role: string | null`; `ROLE_MAP: Record<string, string>` |
| `services/admin.service.ts` | Removed `CandidateRoleEnum` cast |
| `app/api/candidate/profile/route.ts` | `primary_role: z.string().max(100).nullable()` |
| `components/dashboard/candidate/profile-form.tsx` | `primary_role: string | null`; uses `PRESET_ROLES` |

#### Completeness Criteria (0–100)

| Criterion | Weight |
|---|---|
| Avatar set | 15 |
| Bio ≥ 50 chars | 15 |
| At least one role in `candidate_roles` | 15 |
| `candidate_specialties` count ≥ 3 | 15 |
| Portfolio item OR portfolio link exists | 20 |
| City + country set | 10 |
| `candidate_preferences` row exists | 10 |

`MIN_DISCOVERY_COMPLETENESS = 0` in dev — raise to `60` before launch.

#### Pass Exclusion Logic

```
forever pass  → always excluded (until employer explicitly un-hides — future feature)
temp pass     → excluded if expires_at > now() AND candidate.updated_at ≤ pass.candidate_updated_at
              → re-eligible if expires_at ≤ now() (30 days elapsed) OR candidate updated since pass
```

#### Branding Rule

"Scout" (not "Like") in all new UI and copy. `swipe_action_enum` keeps `'like'` for DB compatibility.

---

## Phase 4 — Candidate Dashboard v1 `FROZEN`

### Dashboard Routes

| Route | File | Status |
|---|---|---|
| `/dashboard/candidate` | `app/dashboard/candidate/page.tsx` | ✅ |
| `/dashboard/candidate/profile` | `app/dashboard/candidate/profile/page.tsx` | ✅ |
| `/dashboard/candidate/portfolio` | `app/dashboard/candidate/portfolio/page.tsx` | ✅ |
| `/dashboard/candidate/settings` | `app/dashboard/candidate/settings/page.tsx` | ✅ |

### Features

| Feature | Key Files | Status |
|---|---|---|
| Dashboard home — completion %, status card, quick-nav, Coming Soon | `app/dashboard/candidate/page.tsx` | ✅ |
| Editable profile — personal info, bio, role, links | `app/dashboard/candidate/profile/page.tsx`, `components/dashboard/candidate/profile-form.tsx` | ✅ |
| Avatar upload — `avatars` bucket, signed URL | `components/dashboard/candidate/avatar-upload.tsx`, `app/api/candidate/avatar/route.ts` | ✅ |
| Portfolio — add/edit/delete/reorder, `portfolio` bucket | `app/dashboard/candidate/portfolio/page.tsx`, `components/dashboard/candidate/portfolio-grid.tsx`, `components/dashboard/candidate/portfolio-item-modal.tsx` | ✅ |
| Work preferences — remote/onsite/hybrid, rate, availability | `components/dashboard/candidate/preferences-form.tsx`, `app/api/candidate/preferences/route.ts` | ✅ |
| Discovery visibility toggle — instant auto-save | `components/dashboard/candidate/visibility-section.tsx`, `app/api/candidate/visibility/route.ts` | ✅ |
| Password change — re-auth before update | `components/dashboard/candidate/account-settings.tsx` | ✅ |
| Account deletion — type-to-confirm, cascade delete | `components/dashboard/candidate/danger-zone.tsx`, `app/api/candidate/account/route.ts` | ✅ |

### API Routes Added

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/candidate/profile` | Candidate | Fetch own profile |
| PATCH | `/api/candidate/profile` | Candidate | Update personal info, links |
| POST | `/api/candidate/avatar` | Candidate | Upload avatar (multipart/form-data, max 5 MB) |
| GET | `/api/candidate/portfolio` | Candidate | List portfolio items (sorted by sort_order) |
| POST | `/api/candidate/portfolio` | Candidate | Add portfolio item (max 12 enforced) |
| PATCH | `/api/candidate/portfolio/[id]` | Candidate | Edit portfolio item |
| DELETE | `/api/candidate/portfolio/[id]` | Candidate | Remove portfolio item |
| POST | `/api/candidate/portfolio/reorder` | Candidate | Persist drag-and-drop order |
| POST | `/api/candidate/portfolio/upload` | Candidate | Upload media file (max 20 MB) |
| GET | `/api/candidate/preferences` | Candidate | Fetch work preferences |
| PATCH | `/api/candidate/preferences` | Candidate | Update work preferences (upsert) |
| PATCH | `/api/candidate/visibility` | Candidate | Toggle `discovery_paused` |
| DELETE | `/api/candidate/account` | Candidate | Delete account (cascade via `auth.admin.deleteUser`) |

### Components Added

| Component | Purpose |
|---|---|
| `components/dashboard/candidate-sidebar.tsx` | Left nav |
| `components/dashboard/candidate-topbar.tsx` | Top bar |
| `components/dashboard/candidate-actions.tsx` | Shared action helpers |
| `components/dashboard/candidate/profile-form.tsx` | Editable profile form |
| `components/dashboard/candidate/avatar-upload.tsx` | Avatar upload + preview |
| `components/dashboard/candidate/portfolio-grid.tsx` | Draggable grid |
| `components/dashboard/candidate/portfolio-item-modal.tsx` | Add/edit modal |
| `components/dashboard/candidate/preferences-form.tsx` | Work preferences |
| `components/dashboard/candidate/visibility-section.tsx` | Discovery toggle |
| `components/dashboard/candidate/account-settings.tsx` | Email display + change password |
| `components/dashboard/candidate/danger-zone.tsx` | Delete account modal |

### Constants Enforced

| Constant | Value | Where |
|---|---|---|
| `MAX_PORTFOLIO_ITEMS` | 12 | `POST /api/candidate/portfolio` returns 422 when count ≥ 12 |
| `MAX_SPECIALTIES` | 10 | UI only (API enforcement deferred to Phase 7) |

---

## Phase 5 — Public Marketing Website + Employer Dashboard MVP `FROZEN`

### Marketing Routes

| Route | File | Status |
|---|---|---|
| `/` | `app/(marketing)/page.tsx` | ✅ |
| `/sitemap.xml` | `app/sitemap.ts` | ✅ |
| `/robots.txt` | `app/robots.ts` | ✅ |

### Employer Dashboard Routes

| Route | File | Status |
|---|---|---|
| `/dashboard/employer` | `app/dashboard/employer/page.tsx` | ✅ |
| `/dashboard/employer/profile` | `app/dashboard/employer/profile/page.tsx` | ✅ |
| `/dashboard/employer/settings` | `app/dashboard/employer/settings/page.tsx` | ✅ |

### Features

| Feature | Key Files | Status |
|---|---|---|
| Home page — hero, features, how-it-works, early access, social proof, CTA | `app/(marketing)/page.tsx`, `components/marketing/` | ✅ |
| Marketing nav (glassmorphism on scroll, mobile drawer) | `components/marketing/marketing-nav.tsx` | ✅ |
| Marketing footer (4-col, inline SVG socials) | `components/marketing/marketing-footer.tsx` | ✅ |
| Employer dashboard home — company card, completion tracker, quick-nav | `app/dashboard/employer/page.tsx` | ✅ |
| Company profile form — logo upload, info, links, location | `components/dashboard/employer/company-form.tsx` | ✅ |
| Hiring preferences — role chips multi-select, toggles, budget, urgency | `components/dashboard/employer/hiring-form.tsx` | ✅ |
| Logo upload — `avatars` bucket, `employer-logos/{id}/logo.{ext}` | `components/dashboard/employer/logo-upload.tsx` | ✅ |
| Settings — password (reuses `AccountSettings`), notifications, danger zone | `app/dashboard/employer/settings/page.tsx` | ✅ |
| Notification preferences — real-time toggle auto-save | `components/dashboard/employer/employer-notifications.tsx` | ✅ |
| Account deletion — type-to-confirm, cascade delete | `components/dashboard/employer/employer-danger-zone.tsx` | ✅ |

### API Routes Added

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/employer/profile` | Employer | Fetch company profile |
| PATCH | `/api/employer/profile` | Employer | Update company info, links, location |
| POST | `/api/employer/logo` | Employer | Upload company logo (max 5 MB) |
| GET | `/api/employer/hiring` | Employer | Fetch hiring preferences |
| PATCH | `/api/employer/hiring` | Employer | Upsert hiring prefs (roles, work types, budget, urgency) |
| GET | `/api/employer/preferences` | Employer | Fetch notification preferences |
| PATCH | `/api/employer/preferences` | Employer | Upsert notification preferences |
| DELETE | `/api/employer/account` | Employer | Delete account (cascade via `auth.admin.deleteUser`) |

### DB Changes

- `supabase/migrations/20260630000003_employer_profile_fields.sql` — added `linkedin_url TEXT`, `founded_year SMALLINT` to `employer_profiles`
- `lib/supabase/types.ts` — `employer_profiles` Row/Insert/Update updated

---

## Phase 3 — Google Sheets Sync + Admin Dashboard `FROZEN`

### Services

| File | Purpose |
|---|---|
| `services/sheets.service.ts` | Google Sheets API via RS256 JWT (no googleapis package) |
| `services/sync-mapper.ts` | Flexible column-matching; normalises roles to `candidate_role_enum` |
| `services/admin.service.ts` | `approveCandidate`, `rejectCandidate`, `suspendUser`, `reinstateUser` |

### API Routes

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/sync/run` | Admin | Trigger Google Sheets sync → `candidate_sync_staging` |
| GET | `/api/sync/status/[runId]` | Admin | Poll sync run status |
| GET | `/api/admin/candidates` | Admin | List staging/canonical candidates (filter, search, paginate) |
| GET | `/api/admin/candidates/[id]` | Admin | Full candidate detail |
| POST | `/api/admin/candidates/[id]/approve` | Admin | Promote staging → `candidate_profiles` + Supabase invite |
| POST | `/api/admin/candidates/[id]/reject` | Admin | Set `auth_state = REJECTED` |
| POST | `/api/admin/users/[id]/suspend` | Admin | Set `auth_state = SUSPENDED` |
| POST | `/api/admin/users/[id]/reinstate` | Admin | Set `auth_state = APPROVED` |

### Dashboard Pages

| Route | Status |
|---|---|
| `/dashboard/admin` | ✅ Overview page with stats |
| `/dashboard/admin/candidates` | ✅ List with filter/search |
| `/dashboard/admin/candidates/[id]` | ✅ Detail + approve/reject/suspend actions |

### Auth Guard

`lib/auth/require-admin.ts` — checks `profiles.role = 'admin'`, returns 401/403 if not.

---

## Phase 2 — Supabase + Auth Machine `FROZEN`

### Files Created

| File | Purpose |
|---|---|
| `lib/supabase/client.ts` | Browser client (`createBrowserClient`) |
| `lib/supabase/server.ts` | Server client + service role variant |
| `lib/supabase/middleware.ts` | `updateSession()` for proxy |
| `lib/supabase/types.ts` | Hand-authored TypeScript types matching schema |
| `lib/auth/machine.ts` | `ALLOWED_TRANSITIONS`, `STATE_ROUTES`, `getCanonicalRoute()` |
| `lib/auth/require-admin.ts` | Admin API auth guard |
| `lib/auth/require-candidate.ts` | Candidate API auth guard |
| `lib/validations.ts` | Zod v4 schemas: login, signup, forgotPassword, resetPassword, inviteCode, changePassword |
| `lib/hooks/use-auth.ts` | `useAuth()` + `signOutClient()` |
| `constants/index.ts` | `APP_NAME`, `APP_URL`, `SUPPORT_EMAIL`, `ROUTES`, `MAX_PORTFOLIO_ITEMS = 12`, `MAX_SPECIALTIES = 10`, `RESEND_COOLDOWN_SECONDS = 60` |
| `proxy.ts` | State-machine-aware route guard. Exports `proxy` (not `middleware`). |
| `services/auth.service.ts` | Server-side auth operations |
| `app/api/auth/callback/route.ts` | PKCE code exchange; invite acceptance links `user_id` |
| `app/api/auth/role/route.ts` | `VERIFIED_NO_ROLE → PENDING_APPROVAL` transition |
| `app/api/invite/validate/route.ts` | Invite code check (case-insensitive, uses, expiry) |
| `supabase/migrations/20260630000000_initial_schema.sql` | All enums, tables, triggers, indexes |
| `supabase/migrations/20260630000001_rls_policies.sql` | Deny-by-default RLS |
| `.env.local.example` | Environment variable template |

### Auth Machine States

| State | Canonical Route |
|---|---|
| `UNVERIFIED` | `/auth/verify-email` |
| `VERIFIED_NO_ROLE` | `/auth/role-select` |
| `ONBOARDING` | `/onboarding` (Phase 7) |
| `PENDING_APPROVAL` | `/auth/pending` |
| `APPROVED` | `/dashboard/<role>` |
| `REJECTED` | `/auth/rejected` |
| `SUSPENDED` | `/auth/suspended` |
| `INVITED` | `/auth/role-select` |

---

## Phase 1 — Auth Screens `FROZEN`

| Screen | Route |
|---|---|
| Login | `/auth/login` |
| Signup | `/auth/signup` |
| Verify Email | `/auth/verify-email` |
| Role Select | `/auth/role-select` |
| Confirm (callback) | `/auth/confirm` |
| Forgot Password | `/auth/forgot-password` |
| Reset Password | `/auth/reset-password` |
| Pending | `/auth/pending` |
| Rejected | `/auth/rejected` |
| Suspended | `/auth/suspended` |

---

## Phase 0 — Foundation `FROZEN`

All UI primitives in `components/ui/`:  
`Button`, `Input`, `PasswordInput`, `Checkbox`, `Select`, `Textarea`, `Radio`, `Card` (+sub-components), `Badge`, `Avatar` + `AvatarGroup`, `Modal`, `Drawer`, `Tabs`, `Tooltip`, `Divider`, `SearchInput`, `Spinner`, `Skeleton`, `Toast`, `PageTransition`

`lib/tokens.ts` — Framer Motion variants and transition configs.  
`app/globals.css` — Tailwind v4 `@theme`, two-canvas colour system, keyframes.  
Font: Plus Jakarta Sans via `next/font/google`, weights 400–800.

---

## TypeScript / Lint Status

| Phase | `tsc --noEmit` | ESLint |
|---|---|---|
| 6.5 (current freeze) | ✅ 0 errors | ✅ 0 warnings |
| 6 | ✅ 0 errors | ✅ 0 warnings |
| 4 | ✅ 0 errors | ✅ 0 warnings |
| 3 | ✅ 0 errors | ✅ 0 warnings |
| 2 | ✅ 0 errors | ✅ 0 warnings |
| 1 | ✅ 0 errors | ✅ 0 warnings |

---

## Architecture Decisions (Permanent)

| Decision | Rationale |
|---|---|
| `proxy.ts` not `middleware.ts` | Next.js 16 breaking change — file must be `proxy.ts`, export must be `proxy` |
| `params`/`searchParams` always awaited | Next.js 16 — these are `Promise<{...}>` |
| `createSignedUrl()` not `getPublicUrl()` | Works regardless of bucket public/private setting |
| `requireCandidate()` / `requireAdmin()` in API routes | Checks JWT + role + auth_state atomically |
| Direct `createClient()` / `createServiceClient()` in server pages | Server pages don't use route-handler response shape |
| No `updated_at` in `.upsert()` payloads | DB `update_updated_at` triggers handle this; setting it manually breaks Supabase TS overload resolution |
| `useWatch({ control, name, defaultValue })` not `watch()` | Avoids `react-hooks/incompatible-library` ESLint error from React Compiler |
| `defaultChecked` on `Checkbox` in `PreferencesForm` | Avoids internal-state/visual-sync mismatch |
| `auth.admin.deleteUser()` for account deletion | Cascade FK deletes handle all child rows automatically |
| Google Sheets via RS256 JWT | No `googleapis` package; lighter bundle, Vercel Edge compatible |
| Supabase sole source of truth after sync | Never write back to Google Sheets |
