# ScouttOpp — Project Structure
### Folder Inventory and Architectural Decisions v1.0

> This document explains every folder, file convention, and structural decision in the project. Update it when you add a new top-level folder, route group, or shared pattern.

---

## Root Directory

```
scouttopp/
├── app/                    # Next.js App Router — all routes and layouts
├── components/             # React components (UI primitives, auth, feature)
├── constants/              # Application-wide constants
├── docs/                   # All project documentation
├── hooks/                  # Global custom React hooks (not feature-specific)
├── lib/                    # Utilities, tokens, Supabase clients, auth logic
├── public/                 # Static assets served at /
├── services/               # Business logic services (data access layer)
├── types/                  # Shared TypeScript type definitions
├── AGENTS.md               # AI agent instructions (CLAUDE.md imports this)
├── CLAUDE.md               # AI coding assistant configuration
├── eslint.config.mjs       # ESLint configuration
├── next.config.ts          # Next.js configuration
├── package.json
├── postcss.config.mjs      # PostCSS for Tailwind v4
└── tsconfig.json
```

---

## `app/` — Routes

Next.js App Router. Every folder is a route segment unless prefixed with `(` (route group) or `_` (private).

```
app/
├── (marketing)/            # Route group — shares marketing layout
│   ├── layout.tsx          # Marketing layout (future landing page)
│   └── page.tsx            # Landing page (future)
│
├── auth/                   # Authentication route segment
│   ├── layout.tsx          # Two-panel auth shell (navy left / warm-white right)
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── verify-email/page.tsx
│   ├── confirm/page.tsx    # Supabase auth callback — exchanges code for session
│   ├── role-select/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   ├── rejected/page.tsx
│   └── suspended/page.tsx
│
├── dashboard/              # Protected route segment
│   ├── candidate/          # Candidate dashboard (Phase 4)
│   │   └── page.tsx
│   ├── employer/           # Employer dashboard (Phase 4)
│   │   └── page.tsx
│   └── admin/              # Admin dashboard (Phase 3)
│       └── page.tsx
│
├── api/                    # API Route Handlers (Next.js Server Actions / Route Handlers)
│   ├── auth/
│   │   └── callback/route.ts       # Phase 2
│   ├── invite/
│   │   └── validate/route.ts       # Phase 2
│   ├── sync/
│   │   ├── run/route.ts            # Phase 3
│   │   └── status/[runId]/route.ts # Phase 3
│   └── admin/
│       ├── candidates/
│       │   ├── route.ts            # GET (Phase 3)
│       │   └── [id]/
│       │       ├── route.ts        # GET (Phase 3)
│       │       ├── approve/route.ts
│       │       └── reject/route.ts
│       └── users/
│           └── [id]/
│               ├── suspend/route.ts
│               └── reinstate/route.ts
│
├── globals.css             # Tailwind v4 @theme tokens, keyframes, utility classes
├── layout.tsx              # Root layout — font, Toaster, metadata
├── icon.svg                # App icon
└── page.tsx                # Root page — redirects to /auth/login
```

### Route Group: `(marketing)`

The `(marketing)` folder is a route group — it doesn't create a URL segment. It allows the landing page and future marketing pages to share a distinct layout (full-width, different header) without affecting the `/auth` or `/dashboard` paths.

### `auth/layout.tsx` — Two-Panel Shell

The auth layout renders on all `/auth/*` pages. It provides:
- Left panel: `hidden lg:flex` navy `BrandPanel` — logo, hero copy, testimonial
- Right panel: `flex-1` — `data-color-scheme="light"` applied here, which cascades light-theme CSS variable overrides to all descendant components
- Mobile header: logo shown only below `lg` breakpoint

**The `data-color-scheme="light"` is the only place this attribute is applied** — it controls the entire light canvas without duplicating any component code.

### `app/api/` — Route Handlers

Route handlers are used (not Server Actions) for all API operations. Rationale:
- External integrations (Google Sheets API) need HTTP-based routes
- Admin dashboard will eventually be callable from external tools
- Route handlers provide clearer error handling and response structure
- Testable independently of the React component tree

---

## `components/` — React Components

```
components/
├── animations/             # Reusable Framer Motion animation wrappers
├── auth/                   # Auth-specific components (not reusable elsewhere)
│   ├── auth-divider.tsx        # "or" divider
│   ├── brand-panel.tsx         # Navy left panel (Server Component)
│   ├── forgot-password-form.tsx
│   ├── google-button.tsx       # Google OAuth button (inline SVG)
│   ├── login-form.tsx
│   ├── password-strength.tsx   # 4-segment animated strength bar
│   ├── rejected-screen.tsx     # Static Server Component
│   ├── reset-password-form.tsx
│   ├── role-select-form.tsx    # Animated radio card selector
│   ├── signup-form.tsx
│   ├── suspended-screen.tsx    # Static Server Component
│   └── verify-email-prompt.tsx # Resend cooldown, success banner
│
├── dashboard/              # Dashboard-specific components (Phase 3+)
│
├── icons/                  # Custom SVG icon components
│
├── landing/                # Landing page components (future)
│
├── layout/                 # Page-level layout wrappers
│   ├── container.tsx
│   ├── footer.tsx
│   ├── index.ts            # Barrel export
│   ├── navbar.tsx
│   └── section.tsx
│
├── shared/                 # Shared cross-feature components (not auth, not dashboard)
│
└── ui/                     # Primitive design system components
    ├── avatar.tsx
    ├── badge.tsx
    ├── button.tsx
    ├── card.tsx
    ├── checkbox.tsx
    ├── divider.tsx
    ├── drawer.tsx
    ├── index.ts            # Barrel export for all UI primitives
    ├── input.tsx
    ├── modal.tsx
    ├── page-transition.tsx
    ├── password-input.tsx
    ├── radio.tsx
    ├── search-input.tsx
    ├── select.tsx
    ├── skeleton.tsx
    ├── spinner.tsx
    ├── tabs.tsx
    ├── textarea.tsx
    ├── toast.tsx
    ├── tooltip.tsx
    └── ... (future: file-upload, tag-input, progress, slider)
```

### Component Architecture Rules

**`components/ui/`** — Primitive, design-system-level components. No business logic. No Supabase calls. No feature-specific imports. These are the atoms and molecules of the design system.

**`components/auth/`** — Auth flow-specific forms and screens. May import from `components/ui/`. May use `react-hook-form` and Zod. Should not import from `components/dashboard/` or `services/`.

**`components/dashboard/`** — Dashboard-specific composite components. May import from `components/ui/` and `components/shared/`. May call `services/` functions.

**`components/shared/`** — Cross-feature components used in multiple sections (e.g., a `CandidateCard` used in both the admin and employer dashboards).

### Server vs. Client Components

| Component | Directive | Reason |
|---|---|---|
| `brand-panel.tsx` | (none — Server) | Static content, no interactivity |
| `rejected-screen.tsx` | (none — Server) | Static, uses `<a>` not `<Button>` (no Framer Motion needed) |
| `suspended-screen.tsx` | (none — Server) | Same reason |
| `auth-divider.tsx` | (none — Server) | Static HTML, no hooks |
| All form components | `'use client'` | `react-hook-form`, `useState`, Framer Motion |
| All UI primitives with motion | `'use client'` | Framer Motion requires client |
| `spinner.tsx`, `badge.tsx` | (none — Server) | No client hooks |

---

## `lib/` — Utilities and Shared Logic

```
lib/
├── auth/                   # Auth state machine (Phase 2)
│   ├── machine.ts          # ALLOWED_TRANSITIONS, STATE_ROUTES, validateTransition()
│   └── router.ts           # getCanonicalRoute(profile)
│
├── supabase/               # Supabase client factories (Phase 2)
│   ├── client.ts           # Browser singleton: createBrowserClient()
│   ├── server.ts           # Server: createServerClient() with cookie adapter
│   ├── middleware.ts       # updateSession() for middleware.ts
│   └── types.ts            # Generated: `supabase gen types typescript`
│
├── hooks/                  # Low-level hooks that wrap Supabase or auth (Phase 2)
│   └── use-auth.ts         # useUser(), useProfile(), useSignOut()
│
├── supabase.ts             # Empty stub — replaced by lib/supabase/ folder in Phase 2
├── tokens.ts               # Animation tokens, Framer Motion variants
├── utils.ts                # cn() — clsx + tailwind-merge
└── validations.ts          # Shared Zod schemas (email, password, phone, etc.)
```

### Why `lib/supabase/` is a Folder, Not One File

Three different runtime contexts need different Supabase clients:
- **Browser:** singleton via `createBrowserClient` — used in Client Components and hooks
- **Server:** `createServerClient` with cookie adapter — used in Server Components and API routes
- **Middleware:** `createServerClient` with the middleware cookie adapter — used only in `middleware.ts`

Using the wrong client in the wrong context causes authentication to break silently.

### `lib/tokens.ts`

The sole source of Framer Motion animation tokens. Every component that needs an animation imports from here — no inline duration values or easing functions.

```ts
transitions.fast   // 150ms — hover/focus colour changes
transitions.normal // 250ms — fade in, page elements
transitions.slow   // 400ms — complex transitions
transitions.spring // stiffness: 400, damping: 30 — buttons, card lift
transitions.springBouncy // stiffness: 300, damping: 20 — future swipe

buttonTap   // { scale: 0.97 }
cardHover   // { y: -4, transition: transitions.spring }
```

### `lib/utils.ts`

Exports `cn(...inputs)` — `clsx` + `tailwind-merge`. Required for conditional class merging throughout the codebase. Never concatenate Tailwind classes with string templates.

---

## `services/` — Business Logic Layer

```
services/
├── auth.service.ts         # signIn, signUp, signOut, resetPassword, updatePassword
├── admin.service.ts        # approveCandidate, rejectCandidate, suspendUser, reinstateUser
├── candidate.service.ts    # getCandidateProfile, updateCandidateProfile
└── employer.service.ts     # getEmployerProfile, updateEmployerProfile
```

All files are currently empty stubs. They are implemented in Phases 2–4.

### Service Layer Rules

- Services are server-side only. They import the server Supabase client.
- Services are called from API Route Handlers — not directly from Client Components.
- Services own all database query logic. Route handlers should be thin: validate input → call service → return response.
- Services throw typed errors. Route handlers catch them and map to HTTP status codes.
- Services do not import from `components/` — zero dependency on React.

---

## `types/` — Shared TypeScript Types

```
types/
└── index.ts    # Exported shared types (currently empty stub)
```

Types that belong here:
- `Profile` — the `profiles` table row type
- `AuthState` — union of all auth state enum values
- `CandidateProfile` — canonical candidate data type
- `SyncRun`, `StagingRow` — admin-facing types
- API request/response body types
- Supabase database generated types (imported from `lib/supabase/types.ts`)

Types that **don't** belong here:
- Component prop types (stay co-located in the component file)
- Zod inferred types (stay in `lib/validations.ts`)
- Framer Motion variant types (stay in `lib/tokens.ts`)

---

## `constants/` — Application Constants

```
constants/
└── index.ts    # Currently empty stub
```

Constants that belong here:
- `APP_NAME`, `APP_URL`, `SUPPORT_EMAIL`
- `COOLDOWN_SECONDS` (resend email cooldown = 60)
- `MAX_PORTFOLIO_ITEMS` = 12
- `MAX_SPECIALTIES` = 10
- `GOOGLE_SHEETS_ID` (from env)
- `SYNC_BATCH_SIZE` = 50
- Route constants (`ROUTES.auth.login`, `ROUTES.dashboard.candidate`, etc.)

---

## `hooks/` — Global Custom Hooks

```
hooks/
(empty — future)
```

Hooks that belong here (distinct from `lib/hooks/`):
- `useMediaQuery(query: string)` — responsive breakpoint hooks
- `useDebounce(value, delay)` — debounced search input
- `useLocalStorage(key, initialValue)` — typed localStorage wrapper
- `useMounted()` — SSR-safe mounting check

`lib/hooks/` contains auth-specific hooks that depend on Supabase.  
The root `hooks/` folder is for pure, reusable utility hooks with no Supabase dependency.

---

## `docs/` — Documentation

```
docs/
├── DESIGN_SYSTEM.md    # Visual source of truth — all tokens, components, patterns
├── DATABASE.md         # Schema, enums, triggers, RLS, migration strategy
├── AUTH_FLOW.md        # State machine, route guards, session lifecycle
├── API_REFERENCE.md    # All endpoints — request, response, auth requirements
├── PROJECT_STRUCTURE.md  # This file
├── IMPLEMENTATION.md   # Progress tracker — phases, completion status, known issues
├── CHANGELOG.md        # Version history
├── DEPLOYMENT.md       # How to deploy to production
├── SECURITY.md         # Security model, secrets, vulnerability handling
├── TESTING.md          # Testing strategy and patterns
└── FUTURE_ROADMAP.md   # Deferred features and future phases
```

All docs are Markdown. Update the relevant doc **before** making the change it describes.

---

## Architectural Decisions

### Why App Router (not Pages Router)?

App Router enables Server Components, which are used extensively in static auth screens (Rejected, Suspended, BrandPanel). It also provides the `searchParams` as Promise pattern needed for email in the verify-email page.

### Why Not Prisma?

Supabase has its own auto-generated TypeScript types (`supabase gen types typescript`) and built-in RLS that enforces security at the database level. Prisma would add an abstraction layer that bypasses RLS when used server-side. Direct Supabase queries with generated types provide full type safety without this risk.

### Why Service Layer (not Server Actions)?

Server Actions work well for simple form mutations but don't suit:
- Admin operations with complex business logic and state machine validation
- Google Sheets sync (long-running, needs polling)
- External API calls that need explicit error mapping
- Future API consumers (mobile app, admin CLI)

Route Handlers + service functions provide a clearer contract for all of the above.

### Why No State Management Library (Zustand, Redux)?

Auth state lives in Supabase session + `profiles` table — it's server state, not client state. The `use-auth.ts` hook wraps Supabase's built-in real-time session listener. Dashboard data will be fetched via TanStack Query (Phase 4) if needed — no global client store required.

### Import Path Convention

All imports use `@/` path alias (configured in `tsconfig.json`):

```ts
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { fadeUpVariants } from '@/lib/tokens'
```

Never use relative imports across folder boundaries (`../../components/ui/button`). Relative imports are only used for files in the same folder.
