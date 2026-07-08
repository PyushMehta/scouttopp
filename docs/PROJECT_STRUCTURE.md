# ScouttOpp — Project Structure
### Folder Inventory and Architectural Decisions

> **Status:** Reflects Phase 6 freeze. Update when a new top-level folder, route group, or shared pattern is added.

---

## Top-Level

```
scouttopp/
├── app/                        # Next.js 16 App Router
├── components/                 # Shared React components
├── constants/                  # App-wide constants
├── docs/                       # Project documentation
├── lib/                        # Utility libraries (not business logic)
├── services/                   # Business logic / API-client wrappers
├── supabase/                   # Migrations, Supabase config
├── types/                      # Shared TypeScript types
├── public/                     # Static assets
├── proxy.ts                    # Next.js 16 route guard (NOT middleware.ts)
├── CLAUDE.md                   # AI agent instructions
├── AGENTS.md                   # AI framework agent spec
├── .env.local.example          # Environment variable template
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**`proxy.ts` — not `middleware.ts`:** Next.js 16 renamed this file. The export is `proxy` (not `middleware`). See `docs/AUTH_FLOW.md` for route guard logic.

---

## `app/`

```
app/
├── (root)/
│   └── page.tsx                # Redirects → /auth/login
├── globals.css                 # Tailwind v4 @theme, colour system, keyframes
├── layout.tsx                  # Root layout — Plus Jakarta Sans font
├── auth/
│   ├── layout.tsx              # Two-panel auth shell (navy / warm-white)
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── verify-email/page.tsx
│   ├── role-select/page.tsx
│   ├── confirm/page.tsx        # Server-redirects → /api/auth/callback
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   ├── pending/page.tsx
│   ├── rejected/page.tsx
│   └── suspended/page.tsx
├── dashboard/
│   ├── admin/
│   │   ├── layout.tsx          # Admin shell: sidebar + topbar
│   │   ├── page.tsx            # Overview / stats
│   │   └── candidates/
│   │       ├── page.tsx        # Candidate queue (filter / search)
│   │       └── [id]/page.tsx   # Candidate detail + actions
│   ├── candidate/
│   │   ├── layout.tsx          # Candidate shell: sidebar + topbar
│   │   ├── page.tsx            # Home: completion %, status, Coming Soon
│   │   ├── profile/page.tsx    # Editable profile
│   │   ├── portfolio/page.tsx  # Portfolio management
│   │   └── settings/page.tsx   # Account + preferences + visibility + danger zone
│   └── employer/
│       ├── layout.tsx               # Employer shell: sidebar + topbar
│       ├── page.tsx                 # Home: company card, completion tracker, quick-nav
│       ├── profile/page.tsx         # Company info + hiring preferences
│       ├── settings/page.tsx        # Account + notifications + danger zone
│       ├── analytics/page.tsx       # Placeholder stat cards + chart shell
│       ├── notifications/page.tsx   # Empty state + notification type list
│       ├── candidates/page.tsx      # Discovery feed (live — DiscoveryFeed component)
│       ├── matches/page.tsx         # Saved candidates list (client component)
│       └── messages/page.tsx        # Two-panel shell (thread list + content)
├── (marketing)/
│   ├── layout.tsx              # MarketingNav + MarketingFooter
│   └── page.tsx                # Landing page (hero → CTA)
└── api/
    ├── auth/
    │   ├── callback/route.ts   # PKCE exchange; invite linking
    │   └── role/route.ts       # Set role → PENDING_APPROVAL
    ├── invite/
    │   └── validate/route.ts   # Invite code check
    ├── sync/
    │   ├── run/route.ts        # Trigger Google Sheets sync
    │   └── status/[runId]/route.ts
    ├── admin/
    │   ├── candidates/
    │   │   ├── route.ts        # GET list
    │   │   └── [id]/
    │   │       ├── route.ts    # GET detail
    │   │       ├── approve/route.ts
    │   │       └── reject/route.ts
    │   └── users/
    │       └── [id]/
    │           ├── suspend/route.ts
    │           └── reinstate/route.ts
    ├── candidate/
    │   ├── profile/route.ts
    │   ├── avatar/route.ts
    │   ├── portfolio/
    │   │   ├── route.ts
    │   │   ├── [id]/route.ts
    │   │   ├── reorder/route.ts
    │   │   └── upload/route.ts
    │   ├── preferences/route.ts
    │   ├── visibility/route.ts
    │   └── account/route.ts
    ├── employer/
    │   ├── profile/route.ts
    │   ├── logo/route.ts
    │   ├── hiring/route.ts
    │   ├── preferences/route.ts
    │   ├── onboarding/route.ts     # POST: employer submits company details while pending
    │   └── account/route.ts
    └── discovery/
        ├── route.ts                # GET feed (cursor pagination, full filter set)
        ├── [candidateId]/route.ts  # GET full profile + swipe_state + note; fires view event
        ├── save/route.ts           # POST save / DELETE unsave
        ├── pass/route.ts           # POST pass
        ├── saved/route.ts          # GET saved list (cursor pagination)
        └── note/route.ts           # POST upsert private note
```

### Route Group Conventions

| Pattern | Purpose |
|---|---|
| `(root)` | Routes that don't inherit any layout |
| `(marketing)/layout.tsx` | Full-width dark marketing shell (nav + footer) |
| `auth/layout.tsx` | Two-panel shell shared across all `/auth/*` screens |
| `dashboard/admin/layout.tsx` | Admin sidebar + topbar shell |
| `dashboard/candidate/layout.tsx` | Candidate sidebar + topbar shell |
| `dashboard/employer/layout.tsx` | Employer sidebar + topbar shell |

### Dynamic Segments

All dynamic segments (`[id]`, `[runId]`) follow Next.js 16 rules: `params` is `Promise<{ id: string }>` — always `await` before using.

---

## `components/`

```
components/
├── ui/                         # Design system primitives (no business logic)
│   ├── button.tsx
│   ├── input.tsx
│   ├── password-input.tsx
│   ├── checkbox.tsx
│   ├── select.tsx
│   ├── textarea.tsx
│   ├── radio.tsx
│   ├── card.tsx                # Card, CardHeader, CardBody, CardFooter
│   ├── badge.tsx
│   ├── avatar.tsx              # Avatar, AvatarGroup
│   ├── modal.tsx
│   ├── drawer.tsx
│   ├── tabs.tsx
│   ├── tooltip.tsx
│   ├── divider.tsx
│   ├── search-input.tsx
│   ├── spinner.tsx
│   ├── skeleton.tsx
│   ├── toast.tsx
│   └── page-transition.tsx
├── auth/                       # Auth screen components
│   ├── login-form.tsx
│   ├── signup-form.tsx
│   ├── verify-email-screen.tsx
│   ├── role-select-form.tsx
│   ├── forgot-password-form.tsx
│   ├── reset-password-form.tsx
│   ├── pending-screen.tsx
│   ├── rejected-screen.tsx
│   ├── suspended-screen.tsx
│   └── password-strength.tsx
├── marketing/                  # Public marketing site components
│   ├── marketing-nav.tsx       # Sticky nav, glassmorphism on scroll, mobile drawer
│   ├── marketing-footer.tsx    # 4-col footer
│   ├── hero-section.tsx
│   ├── features-section.tsx
│   ├── how-it-works-section.tsx
│   ├── social-proof-section.tsx
│   ├── early-access-section.tsx
│   ├── final-cta-section.tsx
│   └── candidate-card-mockup.tsx
└── dashboard/
    ├── admin-sidebar.tsx
    ├── admin-topbar.tsx
    ├── candidate-sidebar.tsx   # Candidate dashboard left nav
    ├── candidate-topbar.tsx    # Candidate dashboard top bar
    ├── candidate-actions.tsx   # Shared admin action UI
    ├── employer-sidebar.tsx    # Employer dashboard left nav (with Coming Soon)
    ├── employer-topbar.tsx     # Employer dashboard top bar
    ├── sync-panel.tsx          # Google Sheets sync UI
    ├── candidate/              # Candidate dashboard feature components
    │   ├── profile-form.tsx
    │   ├── avatar-upload.tsx
    │   ├── portfolio-grid.tsx
    │   ├── portfolio-item-modal.tsx
    │   ├── preferences-form.tsx
    │   ├── visibility-section.tsx
    │   ├── account-settings.tsx
    │   └── danger-zone.tsx
    └── employer/               # Employer dashboard feature components
        ├── logo-upload.tsx
        ├── company-form.tsx
        ├── hiring-form.tsx
        ├── employer-notifications.tsx
        └── employer-danger-zone.tsx
discovery/                          # Employer discovery feature components
├── candidate-card.tsx              # CandidateCard — hover Save/Pass bar; optimistic state
├── candidate-card-skeleton.tsx     # CandidateCardSkeleton, CandidateCardSkeletonGrid
├── candidate-profile-panel.tsx     # Slide-in profile drawer (createPortal); portfolio lightbox
├── filter-panel.tsx                # FilterSidebar (desktop), FilterDrawer (mobile), FilterDrawerButton; exports DiscoveryFilters, EMPTY_FILTERS, countActiveFilters
├── discovery-feed.tsx              # DiscoveryFeed — owns all feed + filter state; URL-persisted filters
└── saved-candidate-row.tsx         # SavedCandidateRow — expandable note editor with auto-save
```

### Component Rules

- `components/ui/` — primitives only; no Supabase calls, no API calls
- `components/auth/` — auth-screen-specific; may call Supabase client directly
- `components/dashboard/` — dashboard features; fetch via API routes or server components
- All components are `.tsx`. Client components have `'use client'` at the top.

---

## `lib/`

```
lib/
├── supabase/
│   ├── client.ts               # createClient() — browser singleton
│   ├── server.ts               # createClient() + createServiceClient() — server-only
│   ├── middleware.ts           # updateSession() for proxy.ts
│   └── types.ts                # Hand-authored TypeScript types (DB schema)
├── auth/
│   ├── machine.ts              # ALLOWED_TRANSITIONS, STATE_ROUTES, getCanonicalRoute()
│   ├── require-admin.ts        # Admin API auth guard
│   └── require-candidate.ts   # Candidate API auth guard
├── hooks/
│   └── use-auth.ts             # useAuth() hook + signOutClient()
├── tokens.ts                   # Framer Motion variants and spring configs
├── utils.ts                    # cn() — clsx + tailwind-merge
└── validations.ts              # Zod v4 schemas (login, signup, invite, changePassword, etc.)
```

### Client vs Server Supabase

| Import | File | Context |
|---|---|---|
| `createClient()` from `@/lib/supabase/client` | `client.ts` | Browser components only |
| `createClient()` from `@/lib/supabase/server` | `server.ts` | Server components + API routes (uses caller's auth cookie) |
| `createServiceClient()` from `@/lib/supabase/server` | `server.ts` | Admin routes and unrestricted server access (bypasses RLS) |

Never import the browser `createClient` in a server file, and never expose `createServiceClient` to the browser.

---

## `services/`

```
services/
├── auth.service.ts             # Server-side auth operations
├── admin.service.ts            # approveCandidate, rejectCandidate, suspendUser, reinstateUser
├── sheets.service.ts           # Google Sheets API (RS256 JWT, no googleapis package)
└── sync-mapper.ts              # Column matching + role normalisation
```

Services contain business logic that would be too verbose in route handlers. They do not return `NextResponse` — they return data or throw errors. Route handlers are responsible for JSON serialisation and status codes.

---

## `constants/`

```
constants/
└── index.ts
```

Exports:

| Constant | Value | Purpose |
|---|---|---|
| `APP_NAME` | `"ScouttOpp"` | Brand name |
| `APP_URL` | `process.env.NEXT_PUBLIC_APP_URL` | Base URL for email links |
| `SUPPORT_EMAIL` | `"support@scouttopp.com"` | Support contact |
| `ROUTES` | `{ HOME, LOGIN, SIGNUP, ... }` | Typed route strings |
| `MAX_PORTFOLIO_ITEMS` | `12` | Server-enforced portfolio limit |
| `MAX_SPECIALTIES` | `10` | UI-enforced specialty limit |
| `RESEND_COOLDOWN_SECONDS` | `60` | Verification email resend cooldown |

---

## `types/`

```
types/
└── index.ts                    # Re-exports from lib/supabase/types.ts + local declarations
```

---

## `supabase/`

```
supabase/
├── config.toml                 # Supabase CLI project config
└── migrations/
    ├── 20260630000000_initial_schema.sql            # 5 enums, 14 tables, triggers, indexes
    ├── 20260630000001_rls_policies.sql              # Deny-by-default RLS policies
    ├── 20260630000003_employer_profile_fields.sql   # linkedin_url, founded_year on employer_profiles
    └── 20260701000001_phase6_discovery.sql          # employer_saved_candidates, employer_passed_candidates, candidate_views, candidate_notes + 13 indexes
```

---

## `docs/`

```
docs/
├── API_REFERENCE.MD            # All endpoint specs
├── AUTH_FLOW.md                # State machine + route guards
├── CHANGELOG.md                # Version history
├── DATABASE.md                 # Tables, enums, triggers, RLS, indexes
├── DEPLOYMENT.md               # Vercel + Supabase deployment guide
├── DESIGN_SYSTEM.md            # Visual source of truth
├── FUTURE_ROADMAP.md           # Phases 5–11 specification
├── IMPLEMENTATION.md           # Phase-by-phase progress tracker
├── LANDING_PAGE.md             # Landing page design specification
├── PROJECT_STRUCTURE.md        # This file
├── SECURITY.md                 # Threat model + RLS + secrets
└── TESTING.md                  # Testing strategy
```

---

## File Naming Conventions

| Pattern | Convention |
|---|---|
| Pages | `page.tsx` (Next.js App Router convention) |
| Layouts | `layout.tsx` |
| API routes | `route.ts` |
| Components | `kebab-case.tsx` |
| Utilities | `kebab-case.ts` |
| Types | Inline in `lib/supabase/types.ts` or `types/index.ts` |

**Never use `index.ts` for components.** Named files are easier to navigate in VS Code file tabs.
