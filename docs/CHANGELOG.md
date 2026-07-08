# ScouttOpp — Changelog

All notable changes to ScouttOpp are documented here.  
Format: **[version] — date** followed by `Added`, `Changed`, `Fixed`, `Removed`, `Security` sections.  
Versioning follows [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`.

---

## [Unreleased]

_Nothing pending._

---

## [0.7.1] — 2026-07-06 — Homepage Redesign (Candidate Beta)

### Public beta homepage — candidate-first redesign

#### Added
- `components/marketing/hero-section.tsx` — full-screen looping video background (`/public/videos/hero-bg.mp4`, autoPlay/muted/loop/playsInline, object-cover) with dark overlay (`rgba(10,10,10,0.62)`) and purple accent orb; copy layout changed from two-column split to centered single-column; `CandidateCardMockup` removed
- `components/marketing/for-employers-coming-soon-section.tsx` — new `ForEmployersComingSoonSection`: prominent "Coming Soon" badge, H2 "For Employers", brief explanation of the candidate-first strategy, 5-card capabilities grid (Verified talent discovery, Role and skills filters, Portfolio-first profiles, Scout Mode, Direct connections), employer contact link to `/contact?type=employer`. No screenshots, no interactive employer UI.

#### Changed
- `app/(marketing)/page.tsx` — page title updated to "ScouttOpp — The Creative Talent Platform"; description updated with "Founding Creatives" messaging; `ForEmployersComingSoonSection` inserted after `FeaturesSection`
- `components/marketing/faq-section.tsx` — "For Employers" FAQ group removed; candidate-only questions remain; added "When will employers join?" to address the question proactively

#### Removed
- `CandidateCardMockup` from hero render (still exists for future reuse)
- All employer-implying copy from hero subheadline

---

## [0.7.0] — 2026-07-05 — Candidate Beta Launch

### Strategic pivot: public launch as a Candidate Beta

#### Added
- `lib/flags.ts` — `EMPLOYER_ENABLED` feature flag (`NEXT_PUBLIC_EMPLOYER_ENABLED=true` to re-enable)
- `proxy.ts` — employer feature gate: `/api/employer/**` and `/api/discovery/**` return 503; `/dashboard/employer/**` redirects to `/` when `EMPLOYER_ENABLED=false`
- Candidate role management: `GET/POST /api/candidate/roles`, `DELETE/PATCH /api/candidate/roles/[id]`
- `components/dashboard/candidate/roles-editor.tsx` — `RolesEditor` component (add/remove roles, set primary, preset + custom)

#### Changed
- **Landing page** — `ForEmployersSection` removed from render; hero subheadline updated to candidate-focused copy; `HowItWorksSection` redesigned to show only the 4-step candidate flow (employer tab removed); `EarlyAccessSection` replaced two-column layout with single "Founding Creative" card; `FinalCtaSection` copy updated to candidate-only messaging; all nav CTAs pinned to `?role=candidate`
- **Candidate dashboard** — "Scout Mode coming soon" card replaced with "Founding Creative / Beta" card; "Visible to employers" → "Profile active"; profile completion text updated
- **Role-select form** — employer role card hidden behind `EMPLOYER_ENABLED` flag; candidate-only in beta
- `app/(marketing)/page.tsx` — page title and description updated for Candidate Beta
- `app/(marketing)/layout.tsx` — meta description updated
- `components/dashboard/candidate/profile-form.tsx` — "Primary role" Select removed; roles managed via `RolesEditor`
- `app/dashboard/candidate/profile/page.tsx` — fetches `candidate_roles` and renders `RolesEditor` below profile form
- `components/dashboard/candidate-sidebar.tsx` — removed "Scout Mode soon" nav item (employer-facing feature)

#### Fixed
- `components/discovery/scout-deck.tsx` — stale closure bug: right-swipe was calling `onPass` instead of `onScout` due to `dismissDir` state not propagating through drag-path `.then()` closure; fixed by mirroring state in `dismissDirRef`

---

## [0.6.6] — 2026-07-02

### Phase 6.6 Complete — Scout Mode UI

#### Added

**New discovery components** (`components/discovery/`):
- `scout-card.tsx` — `ScoutCard` (draggable active card) + `StaticCardPreview` (behind-card placeholder). Framer Motion `drag="x"` with rotation transform, SCOUT/PASS overlays via `useTransform`, portfolio image carousel (prev/next arrows, dot indicator strip), completeness badge. `forceDismiss` prop for button-triggered exits; `onAction` fires at threshold for simultaneous stack animation; `onDismissed` fires after exit animation.
- `scout-deck.tsx` — `ScoutDeck`. Manages local stack (up to 3 rendered cards). Behind cards animate position simultaneously with active card exit via spring `animate` on each card. Portfolio items pre-fetched from `GET /api/discovery/[id]` for top 2 cards, cached by candidateId. Undo history (up to 5). Auto-triggers `onLoadMore` when stack ≤ 3. Inline action bar (Pass / Undo / Scout).
- `scout-actions.tsx` — standalone `ScoutActions` action bar component for future reuse.
- `scout-filter-sheet.tsx` — `ScoutFilterSheet`. Right-side `Drawer` around `FilterContent`. Local draft state; confirms on "Start Scouting". Footer has Clear all + CTA.
- `scout-mode.tsx` — `ScoutMode` orchestrator. Pre-flight landing screen (Telescope icon, how-it-works grid, Start Scouting + Set Filters CTAs) → Scout Mode deck with top bar (title, filter count button), loading skeleton, empty state (with clear-filters retry), error state. Uses existing `CandidateProfilePanel` for full profile view.

#### Changed

- `filter-panel.tsx` — `FilterContent` exported (was internal). `ROLES` array values updated from snake_case enum values (`motion_designer`) to free-text labels (`Motion Designer`) to correctly match `candidate_roles.role_name` for `.in()` API filtering (Phase 6.5 alignment fix).
- `app/dashboard/employer/candidates/page.tsx` — replaced `DiscoveryFeed` + grid with `ScoutMode`. Page title changed to "Scout Talent | ScouttOpp". `DiscoveryFeed` import removed.

#### Removed

- `DiscoveryFeed`, `FilterSidebar`, `CandidateCard`, `CandidateCardSkeletonGrid` are no longer used in the candidates page. Files remain in `components/discovery/` for potential future reuse.

---

## [0.6.5] — 2026-07-01

### Phase 6.5 Complete — Architecture Refinement

#### Added

**Database migration** (`supabase/migrations/20260701000002_phase6_5_arch.sql`):
- `candidate_roles` — relational multi-role table; `UNIQUE(candidate_id, lower(role_name))`; partial UNIQUE index on `(candidate_id) WHERE is_primary = true`
- `candidate_portfolio_links` — external portfolio link table (Behance, Dribbble, YouTube, Vimeo, GitHub, Instagram, PDF, website, other); `(candidate_id, platform)` not unique (multiple links per platform)
- `candidate_profiles.profile_completeness SMALLINT NOT NULL DEFAULT 0` — computed completeness score (0–100); set by `lib/candidate-completeness.ts`
- `employer_passed_candidates.pass_type TEXT` — `'temporary'` (default, 30-day) or `'forever'` (permanent hide)
- `employer_passed_candidates.expires_at TIMESTAMPTZ` — null for forever passes; `now() + 30 days` for temp passes
- `employer_passed_candidates.candidate_updated_at TIMESTAMPTZ` — snapshot of `candidate_profiles.updated_at` at pass time; used to detect re-eligibility

**Services:**
- `lib/candidate-completeness.ts` — `computeCompleteness(candidateId)` (weighted 0–100 score), `updateCompleteness(candidateId)` (writes to DB), `meetsDiscoveryThreshold(score)` (gate check)

**Constants** (`constants/index.ts`):
- `PRESET_ROLES` — 15 preset creative role labels (application-layer only, not DB enum)
- `MIN_DISCOVERY_COMPLETENESS` — set to `0` in dev; raise to `60` before launch

#### Changed

**`candidate_profiles.primary_role`:**
- Migrated from `candidate_role_enum` → `TEXT` to support custom roles
- All code that typed `CandidateRoleEnum` for this column now uses `string | null`

**`app/api/discovery/route.ts`** (rewritten):
- Pass exclusion logic replaced: forever passes always excluded; temp passes re-eligible after 30 days OR if `candidate.updated_at > pass.candidate_updated_at` (candidate updated profile/portfolio/skills)
- Role filter now queries `candidate_roles` table instead of `candidate_profiles.primary_role`
- Response payload adds `profile_completeness: number` and `roles: { role_name: string; is_primary: boolean }[]`
- Profile completeness gate (`MIN_DISCOVERY_COMPLETENESS > 0`) inactive in dev

**`app/api/discovery/pass/route.ts`** (rewritten):
- Accepts optional `forever: boolean` flag
- Writes `pass_type`, `expires_at`, `candidate_updated_at` to `employer_passed_candidates`

**`swipe_action_enum`:**
- Added `'scout'` value (keeps `'like'` for legacy compatibility)

**`services/sync-mapper.ts`**, **`services/admin.service.ts`**, **`app/api/candidate/profile/route.ts`**, **`components/dashboard/candidate/profile-form.tsx`**:
- All `CandidateRoleEnum` references for `primary_role` replaced with `string | null`

**`lib/supabase/types.ts`**:
- `candidate_profiles.primary_role`: `CandidateRoleEnum | null` → `string | null`
- `candidate_profiles`: added `profile_completeness: number`
- `SwipeActionEnum`: added `'scout'`
- Added full types for `candidate_roles` and `candidate_portfolio_links`
- `employer_passed_candidates`: added `pass_type`, `expires_at`, `candidate_updated_at`

#### Branding

- "Scout" replaces "Like" in all new UI copy and action labels going forward
- `'like'` value in `swipe_action_enum` retained for DB compatibility; new `'scout'` value used in new code

---

## [0.6.0] — 2026-07-01

### Phase 6 Complete — Employer Discovery Engine

#### Added

**Database migration** (`supabase/migrations/20260701000001_phase6_discovery.sql`):
- `employer_saved_candidates` — employer bookmarks a candidate; `UNIQUE(employer_id, candidate_id)`
- `employer_passed_candidates` — employer passes on a candidate; `UNIQUE(employer_id, candidate_id)`
- `candidate_views` — records each time an employer opens a full candidate profile (no unique constraint — tracks every view)
- `candidate_notes` — private employer notes per candidate; `UNIQUE(employer_id, candidate_id)`, auto `updated_at` trigger
- 13 new indexes covering discovery feed ordering, exclusion joins, skills filter, preferences, and location

**API routes:**
- `GET /api/discovery` — paginated candidate feed; cursor-based pagination; full filter support (role, skills, location, work type, engagement, rate, experience, availability, portfolio, text search); excludes already-saved and already-passed candidates
- `GET /api/discovery/[candidateId]` — full candidate profile; fires view event; returns `swipe_state` and employer's existing note
- `POST /api/discovery/save` — save (bookmark) a candidate; removes from passed list if previously passed
- `DELETE /api/discovery/save` — unsave a candidate; returns to discovery feed
- `POST /api/discovery/pass` — pass on candidate; removes from saved list if previously saved; candidate disappears from feed
- `GET /api/discovery/saved` — paginated list of saved candidates with notes; supports text search and cursor pagination
- `POST /api/discovery/note` — upsert a private employer note for a candidate (auto-saves on blur)

**Discovery components** (`components/discovery/`):
- `candidate-card.tsx` — `CandidateCard`; avatar, name, role, location, bio snippet, top 3 skills chips, work type pills, portfolio indicator; hover reveals Save/Pass action bar with optimistic UI
- `candidate-card-skeleton.tsx` — `CandidateCardSkeleton` + `CandidateCardSkeletonGrid`; shimmer placeholders
- `candidate-profile-panel.tsx` — `CandidateProfilePanel`; slide-in panel from right (spring animation); sections: header, skills, work preferences, portfolio grid + lightbox, links; Save/Pass actions in sticky header; messaging placeholder footer
- `filter-panel.tsx` — `FilterSidebar` (desktop) + `FilterDrawer` (mobile bottom drawer) + `FilterDrawerButton`; all filters: role, work location, engagement, availability, portfolio, skills (preset + custom), location (country/city), experience range, max hourly rate; `countActiveFilters` utility; `EMPTY_FILTERS` constant
- `discovery-feed.tsx` — `DiscoveryFeed` client component; manages all feed state; URL-persisted filters via `useRouter().replace()`; debounced search (350ms); cursor pagination; optimistic save/pass (instant UI, rollback on failure); renders `FilterSidebar` for desktop and `FilterDrawer` for mobile
- `saved-candidate-row.tsx` — `SavedCandidateRow`; avatar + name + role + location + skills chips + saved date; expandable private note section (auto-saves 1s after typing stops); Unsave button with confirmation

**Pages (rewrites):**
- `app/dashboard/employer/candidates/page.tsx` — full discovery page; auth guard; reads filter state from URL `searchParams`; renders `DiscoveryFeed`
- `app/dashboard/employer/matches/page.tsx` — full rewrite as Saved Candidates page; client-side with debounced search; load-more pagination; empty state linking to discovery

**Sidebar update:**
- `components/dashboard/employer-sidebar.tsx` — "Matches" nav item renamed to "Saved"

#### Changed
- `lib/supabase/types.ts` — 4 new table types added (`employer_saved_candidates`, `employer_passed_candidates`, `candidate_views`, `candidate_notes`)

---

## [0.5.1] — 2026-07-01

### Phase 5C Complete — Employer Dashboard Foundation

#### Added

**Sidebar & mobile nav:**
- `components/dashboard/employer-sidebar.tsx` — full rewrite; 3-section nav (Main, Talent, Company); exports `EmployerNavContent` shared by desktop and mobile surfaces
- `components/dashboard/employer-topbar.tsx` — full rewrite; hamburger button + `AnimatePresence` slide-in overlay (w-60, spring physics, backdrop blur); closes on nav link tap via `onNavigate` callback

**Reusable employer components:**
- `components/dashboard/employer/employer-page-header.tsx` — `EmployerPageHeader` (title, subtitle, optional badge + action slot)
- `components/dashboard/employer/employer-stat-card.tsx` — `EmployerStatCard` (value, label, icon, optional trend with up/down arrow, comingSoon badge, custom icon colour)
- `components/dashboard/employer/employer-empty-state.tsx` — `EmployerEmptyState` (icon, title, description, optional badge + action CTA, compact mode for panels)

**New pages:**
- `app/dashboard/employer/analytics/page.tsx` — 4 stat cards (candidates in pool, profile views, matches, response rate), placeholder bar chart + engagement funnel, all with Coming Soon overlays
- `app/dashboard/employer/notifications/page.tsx` — empty state + notification type list (match, message, candidate activity, platform updates), link to Settings
- `app/dashboard/employer/candidates/page.tsx` — search bar stub, empty state, 3 feature-preview cards (browse, filters, save)
- `app/dashboard/employer/matches/page.tsx` — empty state, 4-step how-matching-works section
- `app/dashboard/employer/messages/page.tsx` — two-panel layout (thread list w-72 + content area); each panel has its own empty state; thread list visible on all sizes, content panel hidden on mobile (`hidden md:flex`)

#### Changed

- `components/dashboard/employer-sidebar.tsx` — Discover Talent, Saved Candidates, Matches removed from "Coming Soon" dead-end items; replaced by real nav links to new shell pages
- `components/dashboard/employer-topbar.tsx` — icon-only mobile nav replaced with hamburger → full sidebar drawer

---

## [0.5.0] — 2026-07-01

### Phase 5 Complete — Public Marketing Website + Employer Dashboard MVP

#### Added

**Marketing site (`app/(marketing)/`):**
- `app/(marketing)/layout.tsx` — `MarketingNav` + `MarketingFooter`, separate from auth shell
- `app/(marketing)/page.tsx` — home page: hero, features, how-it-works, early access, social proof, CTA
- `components/marketing/` — all section components (hero, features, how-it-works, social-proof, early-access, final-cta, marketing-nav, marketing-footer, candidate-card-mockup)
- `app/sitemap.ts`, `app/robots.ts` — SEO configuration
- `proxy.ts` — marketing routes (`/`, `/features`, `/about`, `/contact`, `/faq`, `/blog`, `/privacy`, `/terms`) bypass auth check

**Employer Dashboard (`app/dashboard/employer/`):**
- `app/dashboard/employer/layout.tsx` — `EmployerSidebar` + `EmployerTopBar`
- `app/dashboard/employer/page.tsx` — home: company card, profile completion tracker, quick-nav, Coming Soon (Discover Talent, Saved, Matches), account status
- `app/dashboard/employer/profile/page.tsx` — company info + hiring preferences
- `app/dashboard/employer/settings/page.tsx` — account (reuses `AccountSettings`), notifications, danger zone

**Employer API routes:**
- `GET/PATCH /api/employer/profile` — company info (name, bio, industry, size, URLs, location, founded_year)
- `POST /api/employer/logo` — logo upload to `avatars` bucket (`employer-logos/{id}/logo.{ext}`, max 5 MB)
- `GET/PATCH /api/employer/hiring` — hiring preferences upsert (roles, work types, budget, urgency)
- `GET/PATCH /api/employer/preferences` — notification preferences upsert
- `DELETE /api/employer/account` — account deletion via `auth.admin.deleteUser` + cascade

**Employer components:**
- `components/dashboard/employer-sidebar.tsx` — desktop sidebar with Coming Soon badges
- `components/dashboard/employer-topbar.tsx` — mobile icon-only topbar
- `components/dashboard/employer/logo-upload.tsx` — logo upload widget
- `components/dashboard/employer/company-form.tsx` — company info form with logo upload
- `components/dashboard/employer/hiring-form.tsx` — hiring prefs with role chips + toggles
- `components/dashboard/employer/employer-notifications.tsx` — notification preference toggles
- `components/dashboard/employer/employer-danger-zone.tsx` — account deletion with confirmation modal

**Auth guard:**
- `lib/auth/require-employer.ts` — checks JWT + `role = employer` + `auth_state = APPROVED` + `employer_profiles` row; returns `{ ok, userId, employerProfileId }`

**DB migration:**
- `supabase/migrations/20260630000003_employer_profile_fields.sql` — `linkedin_url TEXT`, `founded_year SMALLINT` on `employer_profiles`
- `lib/supabase/types.ts` — `employer_profiles` Row/Insert/Update updated with `linkedin_url` and `founded_year`

#### Security

- Logo uploads use `createSignedUrl()` — never `getPublicUrl()`
- Employer account deletion calls `auth.admin.deleteUser()` (service role) — all data cascades via FK constraints
- `SUPABASE_SERVICE_ROLE_KEY` only in server-side `createServiceClient()` — never exposed to browser

---

## [0.4.0] — 2026-07-01

### Phase 4 Complete — Candidate Dashboard v1

#### Added

**Dashboard routes:**
- `app/dashboard/candidate/layout.tsx` — shared layout with sidebar + topbar
- `app/dashboard/candidate/page.tsx` — home: profile completion %, status card, quick-nav, Coming Soon (Scout Mode)
- `app/dashboard/candidate/profile/page.tsx` — editable profile page
- `app/dashboard/candidate/portfolio/page.tsx` — portfolio management page
- `app/dashboard/candidate/settings/page.tsx` — account, preferences, visibility, danger zone

**API routes:**
- `GET/PATCH /api/candidate/profile` — fetch and update personal info, links, bio, role
- `POST /api/candidate/avatar` — avatar upload to `avatars` bucket (max 5 MB, JPEG/PNG/WebP/GIF)
- `GET/POST /api/candidate/portfolio` — list and add portfolio items (max 12 enforced server-side)
- `PATCH/DELETE /api/candidate/portfolio/[id]` — edit or remove a specific item
- `POST /api/candidate/portfolio/reorder` — persist drag-and-drop `sort_order`
- `POST /api/candidate/portfolio/upload` — upload media to `portfolio` bucket (max 20 MB)
- `GET/PATCH /api/candidate/preferences` — work preferences upsert
- `PATCH /api/candidate/visibility` — toggle `discovery_paused`
- `DELETE /api/candidate/account` — delete account via `auth.admin.deleteUser` + cascade

**Components:**
- `components/dashboard/candidate-sidebar.tsx`
- `components/dashboard/candidate-topbar.tsx`
- `components/dashboard/candidate-actions.tsx`
- `components/dashboard/candidate/profile-form.tsx`
- `components/dashboard/candidate/avatar-upload.tsx`
- `components/dashboard/candidate/portfolio-grid.tsx`
- `components/dashboard/candidate/portfolio-item-modal.tsx`
- `components/dashboard/candidate/preferences-form.tsx`
- `components/dashboard/candidate/visibility-section.tsx`
- `components/dashboard/candidate/account-settings.tsx`
- `components/dashboard/candidate/danger-zone.tsx`

**Auth guard:**
- `lib/auth/require-candidate.ts` — checks JWT + `role = candidate` + `auth_state = APPROVED` + `candidate_profiles` row existence

#### Fixed

- `MAX_PORTFOLIO_ITEMS` enforcement gap — `POST /api/candidate/portfolio` now returns `422 LIMIT_REACHED` when count ≥ 12

#### Security

- Avatar and portfolio uploads use `createSignedUrl()` (1-year TTL) instead of `getPublicUrl()` — works regardless of bucket access policy
- Account deletion calls `auth.admin.deleteUser()` (service role key) — all PII cascade-deleted via FK constraints
- Password change re-authenticates user before `supabase.auth.updateUser({ password })` — prevents session hijacking

---

## [0.3.0] — 2026-06-30

### Phase 3 Complete — Google Sheets Sync + Admin Dashboard

#### Added

**Services:**
- `services/sheets.service.ts` — Google Sheets API via RS256 JWT (service account, no `googleapis` package)
- `services/sync-mapper.ts` — flexible column matching; normalises free-text roles to `candidate_role_enum`
- `services/admin.service.ts` — `approveCandidate`, `rejectCandidate`, `suspendUser`, `reinstateUser`

**API routes:**
- `POST /api/sync/run` — triggers Google Sheets sync → `candidate_sync_staging`
- `GET /api/sync/status/[runId]` — polls sync status
- `GET /api/admin/candidates` — lists staging/canonical candidates (filter, search, paginate)
- `GET /api/admin/candidates/[id]` — full candidate detail (staging or canonical)
- `POST /api/admin/candidates/[id]/approve` — promotes staging → `candidate_profiles` + Supabase invite email
- `POST /api/admin/candidates/[id]/reject` — sets `auth_state = REJECTED` + rejection reason
- `POST /api/admin/users/[id]/suspend` — sets `auth_state = SUSPENDED`
- `POST /api/admin/users/[id]/reinstate` — sets `auth_state = APPROVED`

**Dashboard:**
- `app/dashboard/admin/layout.tsx` — admin shell with sidebar + topbar
- `app/dashboard/admin/page.tsx` — overview with sync stats
- `app/dashboard/admin/candidates/page.tsx` — candidate queue with search/filter
- `app/dashboard/admin/candidates/[id]/page.tsx` — candidate detail + action buttons
- `components/dashboard/admin-sidebar.tsx`
- `components/dashboard/admin-topbar.tsx`
- `components/dashboard/sync-panel.tsx`
- `components/dashboard/candidate-actions.tsx` (approve/reject/suspend/reinstate UI)

**Auth guard:**
- `lib/auth/require-admin.ts`

**Auth callback updated:**
- `app/api/auth/callback/route.ts` — extended to handle Supabase invite links: sets `auth_state = APPROVED`, links `candidate_profiles.user_id` to authenticated user

#### Security

- Admin routes protected by `requireAdmin()` — 401 for unauthenticated, 403 for non-admin role
- Sync writes only to `candidate_sync_staging` — no direct writes to `candidate_profiles` until admin approval

---

## [0.2.0] — 2026-06-30

### Phase 2 Complete — Supabase Integration & Authentication Architecture

#### Added

- `@supabase/ssr` — `createBrowserClient` / `createServerClient` for App Router
- `lib/supabase/types.ts` — hand-authored TypeScript DB types
- `lib/supabase/client.ts` — browser singleton
- `lib/supabase/server.ts` — server + service-role clients
- `lib/supabase/middleware.ts` — `updateSession()` for `proxy.ts`
- `lib/auth/machine.ts` — 8-state machine: `ALLOWED_TRANSITIONS`, `STATE_ROUTES`, `getCanonicalRoute()`
- `lib/validations.ts` — Zod v4 schemas for all auth forms
- `lib/hooks/use-auth.ts` — `useAuth()` + `signOutClient()`
- `types/index.ts` — unified type re-exports
- `constants/index.ts` — `APP_URL`, `ROUTES`, `MAX_PORTFOLIO_ITEMS = 12`, `MAX_SPECIALTIES = 10`, `RESEND_COOLDOWN_SECONDS = 60`
- `proxy.ts` — state-machine-aware route guard (Next.js 16: `proxy.ts`, export `proxy`)
- `services/auth.service.ts` — server-side auth operations
- `app/api/auth/callback/route.ts` — PKCE code exchange + recovery session detection
- `app/api/auth/role/route.ts` — role assignment + `VERIFIED_NO_ROLE → PENDING_APPROVAL` transition
- `app/api/invite/validate/route.ts` — invite code validation (case-insensitive, use count, expiry)
- `components/auth/pending-screen.tsx`
- `app/auth/pending/page.tsx`
- `supabase/migrations/20260630000000_initial_schema.sql` — 5 enums, 14 tables, triggers, indexes
- `supabase/migrations/20260630000001_rls_policies.sql` — deny-by-default RLS

#### Changed

- All auth form components wired to real Supabase calls (login, signup, verify-email, forgot-password, reset-password, role-select)
- `app/auth/confirm/page.tsx` — server-redirects to `/api/auth/callback`

#### Security

- `proxy.ts` uses `getUser()` (server-side JWT validation), not `getSession()` (cache-based)
- Service role key server-only — not in `NEXT_PUBLIC_` vars
- RLS deny-by-default on all 14 tables
- Forgot-password always shows success (prevents email enumeration)

---

## [0.1.0] — 2026-06-30

### Phases 0–1 Complete — Foundation & Auth Screens

#### Added

- Auth layout: two-panel shell (navy left / warm-white right)
- 10 authentication screens: login, signup, verify-email, role-select, confirm, forgot-password, reset-password, pending, rejected, suspended
- Root page redirect → `/auth/login`
- Complete UI primitive library: Button (6 variants), Input, PasswordInput, Checkbox, Card, Badge, Modal, Avatar, Spinner, Skeleton, Toast, Drawer, Tabs, Tooltip, Divider, Select, Textarea, Radio, SearchInput, PageTransition
- `lib/tokens.ts` — Framer Motion animation variants and spring configs
- `lib/utils.ts` — `cn()` (clsx + tailwind-merge)
- `app/globals.css` — Tailwind v4 `@theme`, two-canvas colour system, keyframes
- Plus Jakarta Sans font (weights 400–800)

#### Fixed

- Zod v4: `errorMap` → `error` in `z.literal()` options
- Next.js 16: `params`/`searchParams` awaited in all pages
- Tailwind v4: `max-w-[440px]` → `max-w-110`

---

## Versioning Guide

| Bump | When |
|---|---|
| `PATCH` (0.0.X) | Bug fixes, copy changes, styling tweaks |
| `MINOR` (0.X.0) | New feature, screen, endpoint, or component |
| `MAJOR` (X.0.0) | Breaking schema change, major UX overhaul, platform-level change |

### Phase → Version Mapping

| Phase | Version |
|---|---|
| 0–1 (foundation + auth UI) | 0.1.0 |
| 2 (Supabase + auth machine) | 0.2.0 |
| 3 (sync + admin) | 0.3.0 |
| 4 (candidate dashboard) | 0.4.0 |
| 5 (marketing website) | 0.5.0 |
| 6 (employer discovery engine) | 0.6.0 |
| 6.5 (architecture refinement) | 0.6.5 |
| 6.6 (Scout Mode UI) | 0.6.6 |
| 7 (native onboarding) | 0.7.0 |
| 8 (swipe) | 0.8.0 |
| 9 (messaging) | 0.9.0 |
| 10 (AI matching) | 0.10.0 |
| 11 (production readiness) | 1.0.0 |
