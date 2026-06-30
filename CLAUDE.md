@AGENTS.md

# ScouttOpp — Implementation Roadmap

## Phase Status

| Phase | Status | Summary |
|---|---|---|
| Phase 1 | ✅ Frozen | Project setup, auth system, database schema, design system |
| Phase 2 | ✅ Frozen | Auth flows (login, signup, OAuth, role-select, verify-email, pending, rejected, suspended) |
| Phase 3 | ✅ Frozen | Google Sheets sync → staging → admin review → approve/reject → invite email → candidate dashboard (read-only) |
| Phase 4 | 🔨 Active | Candidate Dashboard v1 — editable profile, avatar upload, portfolio, settings |
| Phase 5 | 🔒 Blocked | Employer Dashboard |
| Phase 6 | 🔒 Blocked | Swipe / Scout Mode |

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

### Phase 3 baseline (frozen)
- `services/sheets.service.ts` — Google Sheets API (RS256 JWT, no googleapis package)
- `services/sync-mapper.ts` — flexible column matching, role mapping
- `services/admin.service.ts` — approve (creates profile + invite), reject, suspend, reinstate
- `lib/auth/require-admin.ts` — admin auth guard
- `app/api/sync/` — run + status endpoints
- `app/api/admin/` — candidates CRUD + approve/reject/suspend/reinstate
- `app/api/auth/callback/` — invite acceptance → links user_id, sets APPROVED
- `app/dashboard/admin/` — layout, sidebar, topbar, overview, candidates list + detail

### Next.js 16 breaking changes (always apply)
- Proxy file: `proxy.ts` not `middleware.ts`, export `proxy` not `middleware`
- `params` and `searchParams` in pages/routes are `Promise<{...}>` — always `await`
- `cookies()` is async — always `await cookies()`
- Read `node_modules/next/dist/docs/` before using any App Router API

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
```

### Service client vs session client
- **Service client** (`createServiceClient()`): bypasses RLS. Use in admin routes and server components that need unrestricted access.
- **Session client** (`createClient()` from `@/lib/supabase/server`): uses the caller's auth cookie. Use in candidate-facing routes — always filter by `user_id`.

---

## Phase 4 — Candidate Dashboard v1

### Features
1. Dashboard home — profile completion indicator, approval status, stats
2. Editable profile — personal info, bio, role, location, links
3. Avatar upload — Supabase Storage → `candidate_profiles.avatar_url`
4. Portfolio management — `candidate_portfolio_items` table (title, description, media_url, media_type, sort_order)
5. Account settings — change password, danger zone
6. Notification settings — `candidate_preferences` table
7. "Coming Soon" — Scout Mode section (deferred to Phase 6)

### Key tables (Phase 4 scope)
- `candidate_profiles` — core profile (editable by candidate)
- `candidate_portfolio_items` — portfolio pieces (add/edit/delete/reorder)
- `candidate_specialties` — skills/tags (add/remove)
- `candidate_preferences` — work preferences + notifications

### Route structure
```
/dashboard/candidate                 ← home (completion indicator, status)
/dashboard/candidate/profile         ← edit profile
/dashboard/candidate/portfolio       ← manage portfolio items
/dashboard/candidate/settings        ← account + notifications
```
