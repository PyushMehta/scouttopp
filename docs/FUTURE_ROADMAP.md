# ScouttOpp — Future Roadmap
### Phases 7–11 Specification

> **Current status:** v0.7.0 — Candidate Beta live. Employer features preserved in codebase but disabled via `NEXT_PUBLIC_EMPLOYER_ENABLED` flag. The next phase is Phase 7 (Native Candidate Onboarding). This document defines every planned phase from here to production readiness.
>
> **Employer Beta** (re-enabling all employer features) is a separate strategic milestone that follows a successful Candidate Beta cohort.

---

## Table of Contents

1. [What Phases 0–6.6 Delivered](#1-what-phases-066-delivered)
2. [Phase 5 — Public Marketing Website](#2-phase-5--public-marketing-website)
3. [Phase 6 — Employer Discovery Engine](#3-phase-6--employer-discovery-engine--frozen-v060)
4. [Phase 6.5 — Architecture Refinement](#4-phase-65--architecture-refinement--frozen-v065)
5. [Phase 6.6 — Scout Mode UI](#5-phase-66--scout-mode-ui--frozen-v066)
6. [Phase 7 — Native Candidate Onboarding](#6-phase-7--native-candidate-onboarding-next)
7. [Phase 8 — Scout / Swipe Mode](#7-phase-8--scout--swipe-mode)
8. [Phase 9 — Messaging](#8-phase-9--messaging)
9. [Phase 10 — AI Matching](#9-phase-10--ai-matching)
10. [Phase 11 — Production Readiness](#10-phase-11--production-readiness)
11. [Deferred Product Decisions](#11-deferred-product-decisions)

---

## 1. What Phases 0–6.6 Delivered

### Included

- Complete authentication: email/password, Google OAuth, forgot/reset password, 8-state auth machine
- Admin dashboard: Google Sheets sync, staging queue, approve/reject/suspend/reinstate, Supabase invite emails; employer list with company details
- Candidate dashboard: editable profile, avatar upload, portfolio management (add/edit/delete/reorder), work preferences, discovery visibility toggle, password change, account deletion
- Public marketing website: landing page, marketing nav/footer, SEO
- Employer dashboard: company profile + logo upload, hiring preferences, notification preferences, account deletion; employer pending/onboarding form
- Employer Discovery Engine: paginated feed with full filter system (role, skills, location, work type, rate, availability, portfolio); candidate profile panel with portfolio lightbox; save/pass actions with optimistic UI; saved candidates list with private notes; private note auto-save; view recording
- Architecture Refinement: multi-role system (`candidate_roles` table), temporary vs permanent pass logic with re-eligibility on profile update, profile completeness scoring (0–100) with discoverability gate, portfolio links table, "Scout" branding, `primary_role` migrated to free-text
- Scout Mode UI: Hinge-style stacked card deck replacing the grid; drag gestures (mouse + touch) with rotation and SCOUT/PASS overlays; portfolio image carousel inside card; filter pre-flight screen; progress indicator; full empty/loading/error states
- Supabase PostgreSQL with full RLS, DB triggers, cascading deletes, 20 tables

### Explicitly NOT yet built

| Feature | Planned Phase |
|---|---|
| In-app candidate onboarding | 7 |
| Swipe / card-stack discovery engine | 8 |
| Messaging | 9 |
| AI matching | 10 |
| Branded email templates | 11 |
| Mobile app | Post-11 |
| Payments / subscriptions | Post-11 |

---

## 2. Phase 5 — Public Marketing Website

**Prerequisite:** None — can begin immediately after Phase 4 freeze.  
**Goal:** Public face for the product before employer outreach begins.

### Pages

| Route | Purpose |
|---|---|
| `/` | Landing — hero, value prop, early access CTAs |
| `/features` | Platform capabilities for candidates and employers |
| `/about` | Company story, mission, team |
| `/contact` | Contact form + support email |
| `/privacy` | Privacy policy (legal requirement) |
| `/terms` | Terms of service (legal requirement) |
| `/faq` | Common questions |
| `/blog` | Blog index (placeholder — no posts needed at launch) |

### Layout

New `app/(marketing)/layout.tsx`:
- Full-width design, distinct from the auth two-panel shell
- Top navigation: logo + nav links + primary CTA ("Get early access" / "Sign in")
- Footer: links, copyright, social icons
- Light/dark sections via explicit canvas classes

### New Components

| Component | File |
|---|---|
| `MarketingNav` | `components/landing/marketing-nav.tsx` |
| `MarketingFooter` | `components/landing/marketing-footer.tsx` |
| `HeroSection` | `components/landing/hero-section.tsx` |
| `FeatureGrid` | `components/landing/feature-grid.tsx` |
| `HowItWorks` | `components/landing/how-it-works.tsx` |
| `CandidateSection` | `components/landing/candidate-section.tsx` |
| `EmployerSection` | `components/landing/employer-section.tsx` |
| `TestimonialsSection` | `components/landing/testimonials-section.tsx` |
| `FaqSection` | `components/landing/faq-section.tsx` |
| `ContactForm` | `components/landing/contact-form.tsx` |
| `EarlyAccessSection` | `components/landing/early-access-section.tsx` |

### SEO Requirements

- `metadata` with `title`, `description`, `openGraph` on every page
- `sitemap.ts` at root
- `robots.ts` at root
- Structured data (`application/ld+json`) on landing and about pages

### Full Design Specification

See `docs/LANDING_PAGE.md` for the complete visual and copy specification.

---

## 3. Phase 6 — Employer Discovery Engine ✅ FROZEN (v0.6.0)

**Delivered:** Full employer-side candidate discovery system — paginated browseable feed, rich filters, full profile panel, save/pass with optimistic UI, saved list, private per-candidate notes.

### What was built

#### Discovery Feed (`/dashboard/employer/candidates`)
- Paginated feed of approved, discoverable candidates (excluding already-saved/passed)
- Composite cursor pagination (`{ createdAt, id }`, base64-encoded, stable across inserts)
- Full filter system persisted in URL: role, skills, location, work type (remote/hybrid/onsite), engagement type (contract/fulltime), max rate, experience range, available now, has portfolio
- Text search (name or bio) with 350ms debounce
- Optimistic save/pass in UI with rollback on failure

#### Candidate Profile Panel
- Right slide-in drawer (`createPortal`) with spring animation
- Full profile: bio, specialties with level badges, work preferences, portfolio grid, social links
- Portfolio lightbox (nested AnimatePresence)
- Escape key: closes lightbox first, then panel
- Messaging placeholder footer (disabled — Phase 9)

#### Saved Candidates (`/dashboard/employer/matches` — nav label: "Saved")
- Searchable, paginated list of saved candidates
- Per-candidate private note with 1s auto-save on typing
- Unsave action
- Profile panel accessible from saved list

#### New API routes
All under `/api/discovery/`:
- `GET /api/discovery` — feed
- `GET /api/discovery/[candidateId]` — full profile + fires view event
- `POST/DELETE /api/discovery/save` — save / unsave
- `POST /api/discovery/pass` — pass
- `GET /api/discovery/saved` — saved list
- `POST /api/discovery/note` — upsert private note

#### New tables (migration 20260701000001_phase6_discovery.sql)
- `employer_saved_candidates` — `(employer_id, candidate_id)` UNIQUE
- `employer_passed_candidates` — `(employer_id, candidate_id)` UNIQUE
- `candidate_views` — no UNIQUE; records each profile view
- `candidate_notes` — `(employer_id, candidate_id)` UNIQUE; private employer note

---

## 4. Phase 6.5 — Architecture Refinement ✅ FROZEN (v0.6.5)

**Delivered:** Data model and product logic improvements required before building the Hinge-style Scout interface. No new user-facing screens — all changes are data model, API behaviour, and branding.

### Multiple Creative Roles (`candidate_roles` table)

Candidates now have multiple roles (relational), not a single role string.

- New table: `candidate_roles(id, candidate_id, role_name TEXT, is_primary BOOLEAN, sort_order INT)`
- Partial UNIQUE index: at most one `is_primary = true` per candidate
- 15 preset role labels in `constants/PRESET_ROLES` (application layer — not a DB enum)
- Custom roles allowed (any text ≤ 100 chars)
- `candidate_profiles.primary_role` migrated from `candidate_role_enum` → `TEXT` (denormalised cache for display; `candidate_roles` is the source of truth for filtering)
- Discovery feed role filter queries `candidate_roles.role_name` (AND match across comma-separated values)

### Temporary vs Permanent Pass Logic

Passes are no longer permanent.

- `employer_passed_candidates.pass_type`: `'temporary'` (default) or `'forever'`
- Temp passes expire after 30 days (`expires_at`)
- Temp-passed candidates re-enter feed if: 30 days elapsed **OR** `candidate.updated_at > pass.candidate_updated_at` (profile/portfolio/skills updated since pass)
- Forever passes = permanent hide; only removed by a future "Un-hide" action
- `POST /api/discovery/pass` accepts optional `{ forever: boolean }` body flag

### Profile Completeness Gate

- `candidate_profiles.profile_completeness SMALLINT` (0–100), computed by `lib/candidate-completeness.ts`
- Weighted criteria: avatar (15), bio ≥ 50 chars (15), roles (15), skills ≥ 3 (15), portfolio item or link (20), location (10), preferences (10)
- `MIN_DISCOVERY_COMPLETENESS = 0` in dev — raise to `60` before launch
- Feed query filters `profile_completeness >= MIN_DISCOVERY_COMPLETENESS` when threshold > 0

### Portfolio Links (`candidate_portfolio_links` table)

External portfolio URLs separate from uploaded media items.

- New table: `candidate_portfolio_links(id, candidate_id, platform, url, label, sort_order)`
- Platforms: `behance`, `dribbble`, `website`, `instagram`, `youtube`, `vimeo`, `github`, `pdf`, `other`
- Completeness checker counts both `candidate_portfolio_items` AND `candidate_portfolio_links`

### "Scout" Branding

- Action label throughout UI/UX: **"Scout"** (not "Like")
- `swipe_action_enum` added `'scout'`; `'like'` kept for legacy DB compatibility
- New code uses `'scout'`

---

## 5. Phase 6.6 — Scout Mode UI ✅ FROZEN (v0.6.6)

**Delivered:** Premium Hinge-inspired talent discovery experience replacing the Phase 6 grid. No backend changes — all existing endpoints used as-is.

### What Was Built

| Component | Description |
|---|---|
| `ScoutCard` | Framer Motion draggable card; `drag="x"` with `useMotionValue`/`useTransform` for rotation (±18°) and SCOUT/PASS overlay opacity; portfolio image carousel (arrow nav, dot strip); `forceDismiss` prop for button-triggered exits; fires `onAction` at threshold for simultaneous stack transition |
| `StaticCardPreview` | Lightweight non-interactive preview rendered behind active card |
| `ScoutDeck` | Renders up to 3 stacked cards; behind cards spring-animate position simultaneously with active card exit; pre-fetches portfolio from `/api/discovery/[id]` for top 2 cards; undo history (5 steps); auto-loads more at ≤3 remaining |
| `ScoutActions` | Standalone Pass / Undo / Scout action bar with `whileTap` micro-interactions |
| `ScoutFilterSheet` | Right-side `Drawer` with local draft state; "Start Scouting" commits filters |
| `ScoutMode` | Two-phase orchestrator: pre-flight (Telescope icon, how-it-works, CTAs) → scouting deck with progress strip, loading skeleton, empty/error states |

### Swipe mechanics

- Threshold: 90px offset or 450px/s velocity
- Active card exit: 380ms ease-out to ±680px; behind cards spring simultaneously
- Button press: `forceDismiss` disables drag, `useAnimation` controls drive exit
- Portfolio items loaded lazily per card; avatar shown while loading

---

## 6. Phase 7 — Native Candidate Onboarding (NEXT)

**Prerequisite:** Phase 6 complete and validated.  
**Goal:** Candidates can sign up and onboard entirely in-app (Google Form becomes optional).

### New Auth Flow Step

```
Signup → Email verify → Role select (candidate)
    → ONBOARDING state → /onboarding multi-step form
    → Submit → PENDING_APPROVAL
    → Admin approves → /dashboard/candidate
```

The `ONBOARDING` state already exists in the database and state machine but has no UI yet.

### Onboarding Steps

| Step | Fields |
|---|---|
| 1 — Personal | Full name, location, timezone, pronouns, bio (500 chars) |
| 2 — Professional | Primary role, years experience, portfolio URL, LinkedIn, Instagram, website |
| 3 — Portfolio | Upload up to 12 items — drag-to-reorder, image/video/PDF/link |
| 4 — Specialties | Tag input, up to 10, optional proficiency level |
| 5 — Preferences | Remote/onsite/hybrid, contract/fulltime, hourly rate range, available from |
| 6 — Review & Submit | Preview → `ONBOARDING → PENDING_APPROVAL` |

### New Components

| Component | File |
|---|---|
| `OnboardingLayout` | `components/onboarding/layout.tsx` |
| `StepIndicator` | `components/onboarding/step-indicator.tsx` |
| `FileUpload` | `components/ui/file-upload.tsx` |
| `TagInput` | `components/ui/tag-input.tsx` |
| `Slider` | `components/ui/slider.tsx` |
| `Progress` | `components/ui/progress.tsx` |

### New API Routes

```
POST  /api/onboarding/profile
POST  /api/onboarding/specialties
POST  /api/onboarding/portfolio
DELETE /api/onboarding/portfolio/[itemId]
PATCH  /api/onboarding/portfolio/[itemId]/reorder
POST  /api/onboarding/preferences
POST  /api/onboarding/submit          ← ONBOARDING → PENDING_APPROVAL
```

### Database Impact

No schema changes needed. All tables already support native onboarding:
- `candidate_profiles.data_source = 'native_onboarding'` (enum already defined)
- `candidate_specialties`, `candidate_portfolio_items`, `candidate_preferences` — already defined
- `ONBOARDING` state — already in `auth_state_enum`

Possibly needed: `candidate_onboarding_progress` table to persist multi-step state across sessions.

---

## 7. Phase 8 — Scout / Swipe Mode

**Prerequisite:** Phase 7 complete. Enough approved, discoverable candidates exist.  
**Goal:** Employers can discover and express interest in candidates via a Hinge-style card interface.

### Scout Interface (`/dashboard/employer/discover` — upgraded)

- Cards stacked with peek effect
- Card content: photo, name, roles, location, specialties, rate range
- Actions: Pass (×), Scout / Express Interest (♥), Super Scout (★)
- Keyboard: ← pass, → scout, ↑ super-scout
- Batch prefetch when deck < 5 cards remaining

### Discovery Query

```sql
SELECT cp.*
FROM candidate_profiles cp
WHERE cp.is_discoverable = true
  AND cp.discovery_paused = false
  AND cp.id NOT IN (
    SELECT candidate_id FROM swipe_actions WHERE employer_id = $employerProfileId
  )
ORDER BY cp.discovery_score DESC NULLS LAST
LIMIT 20;
```

`is_discoverable` is already indexed for this query (partial index in initial migration).

### Match Event

When employer scouts a discoverable candidate:
1. INSERT into `swipe_actions` (`action = 'scout'`)
2. INSERT into `matches` (`status = 'pending'`)
3. Show match celebration animation
4. Notify candidate (Phase 9 — messaging / Phase 11 — email)

### Candidate Match View (`/dashboard/candidate/matches`)

- See who scouted them (optional — product decision)
- Accept / decline
- View match list

### New API Routes

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/swipe/candidates` | Next batch of discoverable candidates |
| POST | `/api/swipe/actions` | Record scout / pass / super_scout |
| GET | `/api/matches` | All matches for current user |
| PATCH | `/api/matches/[matchId]` | Update match status |

### New Components

| Component | Description |
|---|---|
| `ScoutCard` | Full-bleed candidate card with gradient overlay |
| `ScoutDeck` | Framer Motion drag gesture stack |
| `ScoutActions` | Pass / Scout / Super Scout buttons |
| `MatchCelebration` | Spring animation overlay on match |
| `MatchList` | List of employer matches |

Visual spec: `docs/DESIGN_SYSTEM.md` Section 15.

---

## 8. Phase 9 — Messaging

**Prerequisite:** Phase 8 complete. Active matches exist.  
**Goal:** Matched employers and candidates can communicate in-app.

### Features

- Message thread per match (keyed on `matches.id`)
- Real-time via Supabase Realtime channel per thread
- Read receipts
- File attachments (portfolio items, resumes)
- Email notification for new messages (unread after 30 min)

### New Database Items

```sql
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### New API Routes

```
GET   /api/messages/[matchId]      — fetch thread
POST  /api/messages/[matchId]      — send message
PATCH /api/messages/[matchId]/read — mark thread as read
```

### Real-time Pattern

```ts
const channel = supabase
  .channel(`match-${matchId}`)
  .on('postgres_changes', {
    event: 'INSERT', schema: 'public', table: 'messages',
    filter: `match_id=eq.${matchId}`
  }, (payload) => setMessages(prev => [...prev, payload.new]))
  .subscribe()
```

---

## 9. Phase 10 — AI Matching

**Prerequisite:** Phase 8 complete. Swipe data available for signals.  
**Goal:** Improve candidate ranking and provide personalised recommendations.

### Candidate Scoring (improves `discovery_score`)

Signals:
- Profile completeness %
- Portfolio item count and diversity
- Approval recency
- Match-to-contact conversion rate
- Admin-assigned quality flag

### Smart Deck Ordering

Personalise swipe deck per employer based on:
- Hiring profile (`typically_hires`, `remote_ok`, `budget_min/max_hourly`)
- Past swipe behaviour (revealed preferences from like patterns)
- Freshly approved candidates surfaced earlier

### Recommendations

- "Based on your past likes" — proactive employer suggestions
- Weekly "New talent" digest
- Candidate: "Companies that match your profile"

### Implementation Path

1. Start with rule-based scoring (no external AI API needed)
2. Upgrade to semantic matching via Supabase `pgvector` + OpenAI embeddings (bio + portfolio descriptions)

---

## 10. Phase 11 — Production Readiness

**Prerequisite:** Core features (Phases 5–8) stable and validated.  
**Goal:** Harden the platform for real traffic, legal compliance, and operational sustainability.

### Branded Email Templates

- Tool: Resend + React Email
- Templates: signup confirmation, invite accepted, password reset, candidate approved, new match, new message, weekly digest

### Monitoring & Logging

- Vercel Analytics — Web Vitals
- Sentry — error tracking (`@sentry/nextjs`)
- Uptime: UptimeRobot or Better Uptime on root URL + `/api/health`
- Health endpoint: `GET /api/health` → `200 { status: 'ok', ts: '...' }`

### Rate Limiting

- `/api/invite/validate` — 20/min per IP
- `/api/sync/run` — 5/min per admin
- General API — Upstash Redis + `@upstash/ratelimit`

### Security Audit

- [ ] `npm audit` — zero critical/high vulnerabilities
- [ ] Supabase RLS re-verified against final schema
- [ ] CSP headers via `next.config.ts` `headers()`
- [ ] Dependabot enabled on GitHub
- [ ] All secrets rotated

### Performance

- `next/image` for all Supabase Storage media
- `remotePatterns` in `next.config.ts` for `*.supabase.co` and `lh3.googleusercontent.com`
- Lighthouse: Accessibility ≥ 95, Performance ≥ 90

### Legal & Compliance

- [ ] Privacy policy at `/privacy`
- [ ] Terms at `/terms`
- [ ] Cookie consent banner (if analytics cookies used)
- [ ] Data processing agreements with Supabase and Google
- [ ] "Delete my account" — verify all PII removed via cascade

### CI/CD

```yaml
# .github/workflows/ci.yml
jobs:
  type-check:  npx tsc --noEmit
  lint:        npm run lint
  unit-tests:  npx vitest run
  e2e:         npx playwright test
# On merge to main: auto-deploy to Vercel production
# On PR: deploy to Vercel preview URL
```

### Infra Scaling

| Milestone | Action |
|---|---|
| Launch | Supabase Pro (daily backups, connection pooler) |
| 500+ candidates | Review `discovery_score` index, slow query log |
| 1000+ swipes/day | Cache swipe deck query (Redis or Supabase Edge Functions) |
| Real-time messages | Monitor Supabase Realtime connection limits |
| 50K+ storage files | Consider Cloudflare R2 for CDN |

---

## 11. Deferred Product Decisions

| Decision | Options | When to decide |
|---|---|---|
| Do candidates see who liked them? | Transparent / hidden until match / count only | After Phase 8 |
| Employer filters before swipe? | Yes (explicit filters) / No (algorithm) | After Phase 8 UX testing |
| Employer pricing model | Monthly subscription / per-seat / commission / freemium | Before Phase 6 launch |
| Direct signup — invite-only or open? | Invite-only (quality) / Open (growth) | After MVP validation |
| Google Form fate after Phase 7 | Keep as fallback / Deprecate / Keep forever | After Phase 7 adoption |
| Candidate public URL | `scouttopp.com/c/maya-rodriguez` | When employers request it |
| Mobile app | React Native / PWA / web-only | After web platform validated |
