@AGENTS.md

# ScouttOpp — Implementation Roadmap

## Phase Status

| Phase | Status | Summary |
|---|---|---|
| Phase 0 | ✅ Frozen | Design system, UI primitives, fonts |
| Phase 1 | ✅ Frozen | Auth screens (UI only) |
| Phase 2 | ✅ Frozen | Supabase integration, auth machine, 8-state machine, proxy.ts |
| Phase 3 | ✅ Frozen | Google Sheets sync → staging → admin review → approve/reject → invite email |
| Phase 4 | ✅ Frozen | Candidate Dashboard v1 — editable profile, avatar upload, portfolio, settings |
| Phase 5 | ✅ Frozen | Public marketing website — landing (home), employer dashboard MVP |
| Phase 5C | ✅ Frozen | Employer Dashboard Foundation — full nav, analytics, notifications, candidates/matches/messages shells |
| Phase 6 | ✅ Frozen | Employer Discovery Engine — discovery feed, save/pass, filters, profile panel, saved list, private notes |
| Phase 6.5 | ✅ Frozen | Architecture Refinement — multi-role, portfolio links, smart pass expiry, completeness scoring, Scout branding |
| Phase 6.6 | ✅ Frozen | Scout Mode UI — Hinge-style stacked card deck, drag gestures, portfolio carousel, filter pre-flight |
| **Candidate Beta** | 🚀 **Active** | **Public launch — employer features disabled, all CTAs target creatives, Founding Creative messaging** |
| Phase 7 | 🔒 Blocked | Native Candidate Onboarding (replaces Google Form flow) |
| Phase 8 | 🔒 Blocked | Swipe / Scout Mode (Hinge-style) |
| Phase 9 | 🔒 Blocked | Messaging |
| Phase 10 | 🔒 Blocked | AI Matching |
| Phase 11 | 🔒 Blocked | Production Readiness |

---

## Architecture — Critical Rules

### Data flow (immutable)
```
Google Form → Google Sheets → /api/sync/run → candidate_sync_staging
→ Admin reviews → /api/admin/candidates/[id]/approve
→ candidate_profiles (user_id=null) + Supabase invite email
→ Candidate accepts invite → /api/auth/callback links user_id
→ All future edits: Supabase only. Never write back to Google Sheets.
```

### Phase 4 baseline (frozen)
- `services/sheets.service.ts` — Google Sheets API (RS256 JWT, no googleapis package)
- `services/sync-mapper.ts` — flexible column matching, role mapping
- `services/admin.service.ts` — approve (creates profile + invite), reject, suspend, reinstate
- `lib/auth/require-admin.ts` — admin auth guard
- `lib/auth/require-candidate.ts` — candidate auth guard
- `app/api/sync/` — run + status endpoints
- `app/api/admin/` — candidates CRUD + approve/reject/suspend/reinstate
- `app/api/candidate/` — profile, avatar, portfolio, preferences, visibility, account
- `app/api/auth/callback/` — invite acceptance → links user_id, sets APPROVED
- `app/dashboard/admin/` — layout, sidebar, topbar, overview, candidates list + detail
- `app/dashboard/candidate/` — layout, home, profile, portfolio, settings

### Phase 5 baseline (frozen)
- `app/(marketing)/` — route group with `MarketingNav` + `MarketingFooter`, dark-first design
- `app/(marketing)/page.tsx` — home page: hero, features, how-it-works, early access, social proof, CTA
- `components/marketing/` — all marketing section components
- `app/sitemap.ts`, `app/robots.ts` — SEO
- `lib/auth/require-employer.ts` — employer auth guard
- `app/api/employer/` — profile, logo, hiring, preferences, account API routes
- `app/dashboard/employer/` — layout, home, profile, settings
- `components/dashboard/employer/` — logo-upload, company-form, hiring-form, employer-notifications, employer-danger-zone
- `supabase/migrations/20260630000003_employer_profile_fields.sql` — `linkedin_url`, `founded_year` on `employer_profiles`

### Auth guard pattern
```typescript
// Admin routes
import { requireAdmin } from '@/lib/auth/require-admin'
const auth = await requireAdmin()
if (!auth.ok) return auth.response

// Candidate routes
import { requireCandidate } from '@/lib/auth/require-candidate'
const auth = await requireCandidate()
if (!auth.ok) return auth.response

// Employer routes
import { requireEmployer } from '@/lib/auth/require-employer'
const auth = await requireEmployer()
if (!auth.ok) return auth.response
// auth.userId, auth.employerProfileId
```

### Employer feature flag (Candidate Beta)
- `NEXT_PUBLIC_EMPLOYER_ENABLED=true` re-enables the employer dashboard, discovery APIs, and employer role in sign-up
- Default is `false` — employer routes return 503 / redirect to `/` via `proxy.ts`
- **Do NOT delete employer code.** All employer components, API routes, and migrations are preserved and will be re-enabled for the Employer Beta launch
- Feature flag lives in `lib/flags.ts`; proxy gate lives in `proxy.ts` at the top of the `proxy()` function

### Next.js 16 breaking changes (always apply)
- Proxy file: `proxy.ts` not `middleware.ts`, export `proxy` not `middleware`
- `params` and `searchParams` in pages/routes are `Promise<{...}>` — always `await`
- `cookies()` is async — always `await cookies()`
- Read `node_modules/next/dist/docs/` before using any App Router API

### Service client vs session client
- **Service client** (`createServiceClient()`): bypasses RLS. Use in admin routes and server components that need unrestricted access.
- **Session client** (`createClient()` from `@/lib/supabase/server`): uses the caller's auth cookie. Use in candidate-facing routes — always filter by `user_id`.

### Storage uploads
- Always use `createSignedUrl()` — never `getPublicUrl()`. Works regardless of bucket public/private setting.

### Upsert rule
- Do NOT pass `updated_at` in `.upsert()` payloads. DB triggers (`update_updated_at`) handle it. Manually setting it causes TypeScript overload resolution errors with Supabase client.

### React Hook Form
- Use `useWatch({ control, name, defaultValue })` not `watch()`. Avoids `react-hooks/incompatible-library` ESLint error from React Compiler.

### Portfolio limit
- `MAX_PORTFOLIO_ITEMS = 12` enforced in `POST /api/candidate/portfolio`. Returns `422 LIMIT_REACHED` when count ≥ 12.

---

## Phase 5 — Public Marketing Website

### Design specification
Full visual spec: `docs/LANDING_PAGE.md`

### Route structure
```
/                    ← Landing (hero, features, how-it-works, early access, CTA)
/features            ← Platform capabilities
/about               ← Company story + team
/contact             ← Contact form
/privacy             ← Privacy policy
/terms               ← Terms of service
/faq                 ← Common questions
/blog                ← Blog index placeholder
```

### Layout
New route group `app/(marketing)/layout.tsx`:
- Full-width design, separate from auth two-panel shell
- `MarketingNav` (logo + links + CTA) + `MarketingFooter`
- Components in `components/landing/`

### Key rules
- One primary CTA per section (design system rule)
- All cards use `rounded-2xl`
- No cold grays on light canvas — use warm neutrals only
- SEO: `metadata` on every page, `sitemap.ts`, `robots.ts` at root
- Animations: use existing Framer Motion tokens from `lib/tokens.ts`

---

## Phase 5C — Employer Dashboard Foundation (frozen)

### Route structure
```
/dashboard/employer                  ← Overview (existing)
/dashboard/employer/profile          ← Company profile + hiring prefs (existing)
/dashboard/employer/settings         ← Account settings (existing)
/dashboard/employer/analytics        ← Placeholder stat cards + chart shell
/dashboard/employer/notifications    ← Empty state + notification type list
/dashboard/employer/candidates       ← Empty state (discovery coming soon)
/dashboard/employer/matches          ← Empty state + how-matching-works
/dashboard/employer/messages         ← Two-panel shell (thread list + content)
```

### New components (frozen)
- `components/dashboard/employer-sidebar.tsx` — full nav with 3 sections (Main, Talent, Company); exports `EmployerNavContent` for mobile reuse
- `components/dashboard/employer-topbar.tsx` — mobile hamburger + AnimatePresence slide-in drawer
- `components/dashboard/employer/employer-page-header.tsx` — reusable `EmployerPageHeader` (title, subtitle, badge, action)
- `components/dashboard/employer/employer-stat-card.tsx` — reusable `EmployerStatCard` (value, label, icon, trend, comingSoon)
- `components/dashboard/employer/employer-empty-state.tsx` — reusable `EmployerEmptyState` (icon, title, description, badge, action, compact mode)

### Mobile nav pattern
- Desktop: `EmployerSidebar` (hidden on mobile via `lg:flex`)
- Mobile: `EmployerTopBar` owns drawer state; renders `EmployerNavContent` inside an `AnimatePresence` slide-in panel
- `EmployerNavContent` is exported from `employer-sidebar.tsx` and shared between both surfaces
- `onNavigate` callback closes mobile drawer when a link is tapped

---

## Phase 6 — Employer Discovery Engine (frozen)

### Route structure
```
/dashboard/employer/candidates       ← Discovery feed (live — replaces placeholder)
/dashboard/employer/matches          ← Saved candidates list (renamed "Saved" in nav)
```

### New tables (migration 20260701000001_phase6_discovery.sql)
- `employer_saved_candidates` — `(employer_id, candidate_id)` UNIQUE; saves a candidate
- `employer_passed_candidates` — `(employer_id, candidate_id)` UNIQUE; passes on candidate (removed from feed)
- `candidate_views` — no UNIQUE; records each profile view for analytics + future AI signals
- `candidate_notes` — `(employer_id, candidate_id)` UNIQUE; private employer note per candidate

### API routes (all under /api/discovery/)
- `GET /api/discovery` — feed with cursor pagination + full filter set
- `GET /api/discovery/[candidateId]` — full profile + fires view event + returns swipe_state + note
- `POST /api/discovery/save` / `DELETE /api/discovery/save` — save / unsave
- `POST /api/discovery/pass` — pass (removes from feed)
- `GET /api/discovery/saved` — saved list with cursor pagination + search
- `POST /api/discovery/note` — upsert private note (auto-saves client-side 1s after typing)

### Discovery components (components/discovery/)
- `candidate-card.tsx` — `CandidateCard`; hover reveals Save/Pass bar; optimistic state
- `candidate-card-skeleton.tsx` — `CandidateCardSkeleton`, `CandidateCardSkeletonGrid`
- `candidate-profile-panel.tsx` — `CandidateProfilePanel`; right slide-in Framer Motion drawer; portfolio lightbox
- `filter-panel.tsx` — `FilterSidebar` (desktop) + `FilterDrawer` (mobile bottom) + `FilterDrawerButton`; exports `DiscoveryFilters`, `EMPTY_FILTERS`, `countActiveFilters`
- `discovery-feed.tsx` — `DiscoveryFeed`; owns all feed + filter state; URL-persisted filters via `router.replace()`; debounced search; cursor load-more; optimistic save/pass with rollback
- `saved-candidate-row.tsx` — `SavedCandidateRow`; expandable note editor (auto-save on blur); Unsave action

### Critical rules
- Discovery feed excludes candidates already in `employer_saved_candidates` OR `employer_passed_candidates`
- Save overrides pass (removing from passed table); Pass overrides save (removing from saved table)
- `candidate_views` insert is fire-and-forget (non-blocking) — errors silently logged
- Filters are AND-only (not OR across filter groups)
- URL search params are the source of truth for filter state — always sync via `router.replace()`
- `avatar_url` in `candidate_profiles` is a pre-signed URL (stored at upload time) — do NOT re-sign in API routes

---

## Phase 6.5 — Architecture Refinement (frozen)

### What changed (migration 20260701000002_phase6_5_arch.sql)

**`candidate_profiles` changes:**
- `primary_role` changed from `candidate_role_enum` to `TEXT` — now holds any string (preset or custom)
- `profile_completeness SMALLINT DEFAULT 0` added — 0–100 score computed by `lib/candidate-completeness.ts`

**New table: `candidate_roles`**
- Multi-role support. One row per role per candidate.
- `role_name TEXT` — human-readable label, preset or custom
- `is_primary BOOLEAN` — partial unique index enforces max one primary per candidate
- `candidate_profiles.primary_role` is a denormalised cache of the primary role name — update it when `candidate_roles` is written

**New table: `candidate_portfolio_links`**
- External portfolio links (Behance, Dribbble, YouTube, Vimeo, GitHub, Instagram, PDF, website, other)
- Separate from `candidate_portfolio_items` (uploaded media)

**`employer_passed_candidates` changes:**
- `pass_type TEXT` — `'temporary'` (default) or `'forever'` (Hide Forever)
- `expires_at TIMESTAMPTZ` — null for forever; now()+30 days for temporary
- `candidate_updated_at TIMESTAMPTZ` — snapshot of candidate's `updated_at` at pass time
- Pass route writes all three fields. Discovery feed re-includes temporary-passed candidates when expired OR when candidate updates profile.

**`swipe_action_enum`** — `'scout'` added (replaces `'like'` in ScouttOpp branding). `'like'` kept for legacy; new code uses `'scout'`.

### New service: `lib/candidate-completeness.ts`
- `computeCompleteness(candidateId)` → `{ score: 0-100, checklist }`
- `updateCompleteness(candidateId)` → persists score to `candidate_profiles.profile_completeness`
- Criteria (weights): avatar (15), bio >50 chars (15), roles (15), ≥3 skills (15), portfolio item or link (20), location (10), preferences row (10)
- `MIN_DISCOVERY_COMPLETENESS = 0` during dev — raise to 60 before launch
- Must be called after writes to: profile, roles, specialties, portfolio items/links, preferences

### New constants (`constants/index.ts`)
- `PRESET_ROLES` — 15 creative role labels (used for UI dropdowns; `candidate_roles.role_name` stores these)
- `MIN_DISCOVERY_COMPLETENESS` — 0 in dev, set to 60 for production

### Branding rule
- UI must use **Scout** (not Like) for the positive discovery action. Buttons, toasts, labels all say "Scout" / "Scouted".
- Pass is still "Pass". Hide Forever is the permanent pass variant.

### Discovery feed pass exclusion logic
Temporary passes are excluded from the feed only while ALL of these hold:
1. `pass_type = 'temporary'`
2. `expires_at > now()`
3. `candidate.updated_at <= pass.candidate_updated_at` (candidate hasn't updated profile since pass)

If any condition fails → candidate re-appears in feed. Forever passes are always excluded.

### Role filter
Discovery feed role filter now queries `candidate_roles` table (not `candidate_profiles.primary_role`), same pre-query pattern as the skills filter.

---

## Phase 6.6 — Scout Mode UI (frozen)

### What changed
`/dashboard/employer/candidates` replaced from a grid-based `DiscoveryFeed` to a Hinge-style `ScoutMode` experience. No backend changes.

### New components (`components/discovery/`)
- `scout-card.tsx` — `ScoutCard` (active, draggable) + `StaticCardPreview` (behind cards). Framer Motion `drag="x"`, `useMotionValue`/`useTransform` for rotation and SCOUT/PASS overlays. Portfolio image carousel with prev/next arrows. Accepts `forceDismiss` prop for button-triggered swipes. Fires `onAction(dir)` immediately at threshold for simultaneous stack transition, `onDismissed()` after exit animation completes. `CardPortfolioItem` type exported.
- `scout-deck.tsx` — `ScoutDeck`. Manages local stack state (separate from parent fetch state). Renders up to 3 stacked cards: active at z-30, behind cards at z-20/z-10 with `scale`/`y` spring animations. When top card commits, behind cards animate to new positions simultaneously via `animate` prop. Pre-fetches portfolio items for the top 2 cards via `GET /api/discovery/[candidateId]`. Undo history (up to 5 steps). Auto-triggers `onLoadMore` when stack ≤ 3. Inline `ActionsBar` with Pass / Undo / Scout buttons.
- `scout-actions.tsx` — `ScoutActions` standalone action bar (used in Phase 8 if needed). Pass (X), Undo (RotateCcw), Scout (star gradient). `whileTap` micro-interactions.
- `scout-filter-sheet.tsx` — `ScoutFilterSheet`. Wraps `Drawer side="right"` around `FilterContent`. Local draft state — changes committed only on "Start Scouting". Footer: Clear all + Scout CTA.
- `scout-mode.tsx` — `ScoutMode`. Two phases: `'preflight'` (landing screen with how-it-works + Start Scouting / Set Filters CTAs) and `'scouting'` (top bar + `ScoutDeck` + loading/empty/error states). Calls `POST /api/discovery/save` on Scout, `POST /api/discovery/pass` on Pass. Toast on Scout success. Profile panel opened via `CandidateProfilePanel` (existing, unchanged).

### Modified files
- `filter-panel.tsx` — `FilterContent` is now exported (used by `ScoutFilterSheet`). `ROLES` array updated from old enum snake_case values to PRESET_ROLES text labels (e.g., `'Motion Designer'` not `'motion_designer'`) to match `candidate_roles.role_name` for correct `.in()` API filtering.
- `app/dashboard/employer/candidates/page.tsx` — replaced `DiscoveryFeed` with `ScoutMode`. Page title updated to "Scout Talent | ScouttOpp".

### Interaction model
- Drag left past 90px (or velocity > 450px/s) → Pass
- Drag right past 90px (or velocity > 450px/s) → Scout
- Card exit animation: 380ms ease-out to ±680px; behind cards spring to new position simultaneously
- Spring return when threshold not reached (`dragConstraints={{ left: 0, right: 0 }}`)
- Button press triggers `forceDismiss` prop → `useAnimation` controls take over (disables drag)
- Portfolio images loaded lazily from `/api/discovery/[id]` when card becomes active; avatar shown while loading

### Critical rules
- Do NOT call backend pass/scout APIs optimistically — call them only in `onDismissed` (after animation). This prevents API calls for snapped-back cards.
- `FilterContent` draft changes in `ScoutFilterSheet` are local until "Start Scouting" is pressed — never call `onChange` with live filter state during draft editing.
- `ScoutDeck` stack is decoupled from parent `candidates` prop — new items are appended, not replaced, so deck state survives load-more batches.
- `StaticCardPreview` is `pointer-events-none` and `aria-hidden` — never renders interactive elements.
