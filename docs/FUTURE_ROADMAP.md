# ScouttOpp — Future Roadmap
### Deferred Features, Future Phases, and Long-Term Vision v1.0

> This document captures everything that is deliberately out of scope for the current build phases, and why. It is the reference for what "coming next" means, preventing scope creep while keeping the vision documented.

---

## Table of Contents

1. [MVP Scope (Phases 1–4)](#1-mvp-scope-phases-14)
2. [Phase 5 — Native Onboarding (Deferred)](#2-phase-5--native-onboarding-deferred)
3. [Phase 6 — Swipe Feature (Deferred)](#3-phase-6--swipe-feature-deferred)
4. [Post-Launch Features](#4-post-launch-features)
5. [Infrastructure Scaling](#5-infrastructure-scaling)
6. [Product Decisions for Later](#6-product-decisions-for-later)

---

## 1. MVP Scope (Phases 1–4)

The MVP proves the core proposition: curated creative talent, vetted by admins, matched with employers. The simplest implementation avoids a complex onboarding form for candidates.

### MVP Data Flow

```
Candidate → Google Form → Google Sheets → Sheets API → Supabase (staging) → Admin Review → Approved → Dashboard
```

### What MVP Delivers

- Complete authentication system (Phase 1–2)
- Admin dashboard with Google Sheets sync (Phase 3)
- Candidate and employer dashboards (Phase 4)
- Candidate is discoverable to employers once approved

### What MVP Explicitly Does NOT Do

- In-app candidate onboarding form (Phase 5)
- Swipe/match UI (Phase 6)
- Real-time messaging
- Payments / subscription management
- Mobile app
- Email notifications (beyond Supabase Auth built-ins)

---

## 2. Phase 5 — Native Onboarding (Deferred)

**Prerequisites:** MVP is live and validated. The Google Form/Sheets flow has onboarded the first batch of candidates. The team decides to open direct signups.

### What Changes

The Google Form becomes optional. Candidates can sign up directly, complete their profile in-app, and submit for admin review.

### Candidate Onboarding Flow

```
Signup → Email verify → Role select (candidate) → Onboarding steps → Submit → PENDING_APPROVAL → Admin approves → Dashboard
```

### Multi-Step Onboarding Form

Step 1: **Personal Info**
- Full name, location, timezone, pronouns
- Bio (500 chars max)
- Profile photo upload (Supabase Storage)

Step 2: **Professional**
- Primary role (dropdown from `candidate_role_enum`)
- Years of experience
- Portfolio URL, LinkedIn, Instagram, website

Step 3: **Portfolio**
- Upload up to 12 items (`candidate_portfolio_items`)
- Drag-to-reorder
- Item types: image, video (YouTube/Vimeo link), PDF, external link

Step 4: **Specialties**
- Tag input — type to add
- Up to 10 specialties
- Optional: proficiency level (beginner / intermediate / expert)

Step 5: **Preferences**
- Open to: remote / onsite / hybrid (checkboxes)
- Contract / full-time / both
- Hourly rate range (slider)
- Available from (date picker)

Step 6: **Review & Submit**
- Preview of profile as employers will see it
- Confirm and submit → `PENDING_APPROVAL`

### New UI Components Required (Phase 5)

| Component | File | Description |
|---|---|---|
| `FileUpload` | `components/ui/file-upload.tsx` | Drag-and-drop + click to upload, Supabase Storage |
| `TagInput` | `components/ui/tag-input.tsx` | Add/remove tags with keyboard |
| `AvatarUpload` | `components/ui/avatar-upload.tsx` | Profile photo crop + upload |
| `Slider` | `components/ui/slider.tsx` | Rate range slider (min/max) |
| `Progress` | `components/ui/progress.tsx` | Multi-step form progress indicator |
| `OnboardingLayout` | `components/onboarding/layout.tsx` | Step sidebar + form panel |
| `StepIndicator` | `components/onboarding/step-indicator.tsx` | Visual step tracker |

### Database Impact

No schema changes required. The tables are already defined:
- `candidate_profiles` — `user_id` is nullable; native onboarding sets it
- `candidate_specialties`, `candidate_portfolio_items`, `candidate_preferences` — all defined
- `data_source` enum includes `'native_onboarding'`

The only new DB item might be `candidate_onboarding_progress` to persist multi-step form state across sessions.

### New API Routes (Phase 5)

```
POST  /api/candidates/onboarding/profile
POST  /api/candidates/onboarding/specialties
POST  /api/candidates/onboarding/portfolio
DELETE /api/candidates/onboarding/portfolio/[itemId]
PATCH  /api/candidates/onboarding/portfolio/[itemId]/reorder
POST  /api/candidates/onboarding/preferences
POST  /api/candidates/onboarding/submit
```

### Supabase Storage Buckets (Phase 5)

| Bucket | Access | Contents |
|---|---|---|
| `avatars` | Public read, owner write | Profile photos |
| `portfolio` | Public read, owner write | Portfolio images and PDFs |
| `company-logos` | Public read, admin/employer write | Employer company logos |

### Transition: Synced Candidates to Native

A candidate who was synced from Google Sheets and then later signs up natively:
1. Admin matches their email to the existing `candidate_profiles` row
2. Admin links `candidate_profiles.user_id` to their new `auth.users.id`
3. `data_source` remains `'google_sheets_sync'` (original source)
4. The candidate can now log in and edit their profile in-app

---

## 3. Phase 6 — Swipe Feature (Deferred)

**Prerequisites:** Phase 5 complete. A meaningful number of approved, discoverable candidates in the database.

### What it Does

Employers see a deck of candidate cards. They swipe (or click) to like, pass, or super-like. When an employer likes a candidate, a match is created and both parties can communicate.

### Swipe Deck

The employer's swipe interface:
- Cards presented one at a time (or stacked with peek)
- Each card shows: photo, name, role, location, specialties, rate range
- Actions: Pass (×), Like (♥), Super Like (★)
- Keyboard support: ← → ↑ arrow keys
- Infinite-ish: fetch next batch when deck has < 5 remaining

### Candidate Discovery Card

Full spec in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md#15-future-patterns--swipe-ui).

### Match Event

When an employer likes a discoverable candidate:
1. Record in `swipe_actions` (employer_id, candidate_id, action: 'like')
2. Create row in `matches` (status: 'pending')
3. Show match celebration animation to employer
4. Notify candidate (email / in-app notification — TBD)

### Candidate Side

From the candidate's dashboard:
- See who liked them (optional — product decision)
- Accept / decline interest
- View their match list

### Discovery Algorithm

Initial scoring is simple: `discovery_score` set manually by admin or computed as:
- Profile completeness %
- Portfolio item count
- Last active date
- Approval recency

Future: more sophisticated signals (employer category match, location match, rate range overlap).

### Database Readiness

`swipe_actions` and `matches` tables are already defined (empty until Phase 6).  
`is_discoverable` and `discovery_paused` on `candidate_profiles` are already defined.

### New UI Components (Phase 6)

| Component | Description |
|---|---|
| `SwipeCard` | Full-bleed candidate card with gradient overlay |
| `SwipeDeck` | Stack of cards with drag gesture (Framer Motion drag) |
| `SwipeActions` | Pass / Like / Super Like button row |
| `MatchCelebration` | Overlay animation when a match occurs |
| `MatchList` | Employer's list of matches |

---

## 4. Post-Launch Features

These are features that make sense after the platform has active users.

### In-App Messaging

Once a match is active, both parties communicate in-app.
- Supabase Realtime subscriptions for live messages
- Message threads attached to `matches.id`
- File sharing (portfolio items, resumes)
- Email notifications for new messages

### Email Notifications

Transactional emails beyond Supabase Auth built-ins:
- "Your application has been approved" → candidate
- "New match" → employer and candidate
- "Sync complete" → admin
- Weekly digest for employers (new candidates in their categories)

Tooling: Resend or SendGrid. Template engine: React Email.

### Candidate Availability Status

Candidates can mark themselves as:
- `available` — open to work now
- `open` — open to the right opportunity
- `busy` — not looking currently

This becomes a filter for employers in the swipe deck.

### Employer Verification

Before employers can access the swipe deck, verify they are a real company:
- LinkedIn company URL verification
- Optional: manual admin review of employer profile
- Verified badge on employer card

### Analytics Dashboard

For admins:
- Sync stats (candidates imported per month, approval rate)
- Engagement metrics (swipes, matches, messages)
- Conversion funnel (synced → approved → matched → contacted)

For candidates:
- Profile views
- Times liked/super liked (anonymized until match)
- Discovery score trend

### Mobile App

Phase 7+ (well after web platform is proven):
- React Native with Expo
- Shared Supabase backend
- The swipe deck is the native killer feature
- Employer can swipe on mobile during commute

---

## 5. Infrastructure Scaling

Currently using Supabase free tier. Scaling path:

| Milestone | Infra change |
|---|---|
| Launch | Supabase Pro plan (for daily backups, more connections) |
| 500+ candidates | Add `discovery_score` index, review slow query log |
| 1000+ swipes/day | Consider caching the swipe deck query (Redis or Supabase Edge Functions) |
| Real-time messages | Supabase Realtime channel per match — monitor connection limits |
| Files (avatars, portfolio) | Supabase Storage is fine to ~50K files. Beyond: consider Cloudflare R2 |
| High traffic | Vercel handles scaling automatically. DB connections: use Supabase connection pooler (PgBouncer) |

---

## 6. Product Decisions for Later

These decisions are deliberately deferred — they require user research and traction data.

| Decision | Options | When to decide |
|---|---|---|
| **Do candidates see who liked them?** | Yes (transparent) / No (hidden until match) / Partially (count only) | After Phase 6 launches |
| **Can employers filter candidates before swiping?** | Yes (filters reduce serendipity) / No (algorithm does it) | After testing swipe UX |
| **Subscription model** | Free for candidates, paid for employers / Freemium / Commission on hires | Before launch |
| **Is onboarding (Phase 5) invite-only or open?** | Invite-only (quality control) / Open (growth) | After MVP validation |
| **What happens to Google Form?** | Keep as fallback / Deprecate after Phase 5 / Keep forever for non-tech candidates | After Phase 5 adoption |
| **Admin-to-admin delegation** | Can admins create sub-admins? / Role hierarchy | When team grows |
| **Candidate profile public URL** | `scouttopp.com/c/maya-rodriguez` shareable link | When employers request it |
