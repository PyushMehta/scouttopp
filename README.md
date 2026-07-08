# ScouttOpp

A curated creative talent marketplace connecting vetted designers, directors, and creatives with employers.

---

## Project Status

| Phase | Name | Status |
|---|---|---|
| 0 | Foundation — design system, UI primitives, fonts | ✅ Frozen |
| 1 | Auth screens (UI only) | ✅ Frozen |
| 2 | Supabase + auth machine | ✅ Frozen |
| 3 | Google Sheets sync + admin dashboard | ✅ Frozen |
| 4 | Candidate dashboard v1 | ✅ Frozen |
| 5 | Public marketing website + Employer Dashboard MVP | ✅ Frozen |
| 6 | Employer Discovery & Swipe Engine | 🔨 Active |
| 7 | Native candidate onboarding | 🔒 Not started |
| 8 | Swipe discovery engine | 🔒 Not started |
| 9 | Messaging | 🔒 Not started |
| 10 | AI matching | 🔒 Not started |
| 11 | Production readiness | 🔒 Not started |

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Next.js | 16.x (App Router) |
| UI | React | 19.x |
| Styling | Tailwind CSS | v4 |
| Animation | Framer Motion | 12.x |
| Forms | react-hook-form | 7.x |
| Validation | Zod | 4.x |
| Auth/DB | Supabase | 2.x |
| Storage | Supabase Storage | (`avatars`, `portfolio` buckets) |
| Icons | lucide-react | 1.x |
| Toasts | Sonner | 2.x |
| Font | Plus Jakarta Sans | via next/font/google |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project (see `.env.local.example`)
- Google Cloud service account with Sheets API access (for sync feature)

### Local Development

```bash
npm install
cp .env.local.example .env.local
# Fill in your Supabase and Google credentials

# Run migrations (Supabase CLI required)
supabase login
supabase link --project-ref <your-project-ref>
supabase db push

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/auth/login`.

### Environment Variables

See `.env.local.example` for the full template:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY          # server-only — never expose to browser
NEXT_PUBLIC_APP_URL

GOOGLE_SERVICE_ACCOUNT_EMAIL       # Phase 3 Sheets sync
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
GOOGLE_SHEETS_SPREADSHEET_ID
GOOGLE_SHEETS_RANGE
```

---

## Data Flow (MVP)

```
Google Form → Google Sheets
    → POST /api/sync/run
    → candidate_sync_staging (admin reviews)
    → POST /api/admin/candidates/[id]/approve
    → candidate_profiles (user_id = null) + Supabase invite email
    → Candidate clicks invite → GET /api/auth/callback links user_id
    → Candidate logs in → /dashboard/candidate
```

After approval, all edits go through Supabase only. The app never writes back to Google Sheets.

---

## MVP Scope

### Included (Phases 0–4)

- Complete authentication: email/password, Google OAuth, forgot/reset password, email verification
- 8-state auth machine with `proxy.ts` route guards
- Admin dashboard: Google Sheets sync, staging queue, candidate approve/reject/suspend/reinstate
- Candidate dashboard: profile editor, avatar upload, portfolio (add/edit/delete/reorder), work preferences, discovery visibility toggle, password change, account deletion
- Supabase PostgreSQL with full RLS (deny-by-default), DB triggers, cascading deletes

### Not Included

- Public marketing website (Phase 5)
- Employer dashboard (Phase 6)
- In-app candidate onboarding — candidates apply via Google Form (Phase 7)
- Swipe / discovery engine (Phase 8)
- Messaging (Phase 9)
- AI matching (Phase 10)
- Email notifications beyond Supabase Auth built-ins
- Mobile app, payments, subscriptions

---

## Documentation

All project docs live in `docs/`:

| File | Contents |
|---|---|
| [docs/DATABASE.md](docs/DATABASE.md) | Tables, enums, triggers, RLS policies, indexes |
| [docs/AUTH_FLOW.md](docs/AUTH_FLOW.md) | 8-state machine, route guards, all auth flows |
| [docs/API_REFERENCE.MD](docs/API_REFERENCE.MD) | Every endpoint — method, auth, request, response |
| [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) | Folder inventory and architectural decisions |
| [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md) | Phase-by-phase progress and feature tracking |
| [docs/FUTURE_ROADMAP.md](docs/FUTURE_ROADMAP.md) | Phases 5–11 specification |
| [docs/LANDING_PAGE.md](docs/LANDING_PAGE.md) | Landing page design specification |
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Visual source of truth — colours, components, patterns |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Vercel + Supabase deployment guide |
| [docs/SECURITY.md](docs/SECURITY.md) | Threat model, RLS, secrets, checklists |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Version history |
| [docs/TESTING.md](docs/TESTING.md) | Testing strategy and patterns |

---

## Next.js 16 Notes

- **Proxy file:** `proxy.ts` at root, exports `proxy` (not `middleware.ts`/`middleware`)
- **Async params:** `params` and `searchParams` are `Promise<{...}>` — always `await` them
- **Async cookies:** `cookies()` is async — always `await cookies()`
- Read `node_modules/next/dist/docs/` before using any App Router API (per `AGENTS.md`)
