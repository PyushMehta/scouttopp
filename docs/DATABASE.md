# ScouttOpp — Database Reference
### Supabase / PostgreSQL Schema v1.0

> **Status:** ✅ All 6 migrations written and applied to production Supabase project. Run via SQL Editor (paste each file in order). See `supabase/migrations/` and `docs/DEPLOYMENT.md` for the full migration table.  
> This document is the authoritative reference for every table, column, constraint, relationship, policy, trigger, and migration strategy. Update it before making any schema change.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Enums](#2-enums)
3. [Tables](#3-tables)
   - [profiles](#31-profiles)
   - [invite_codes](#32-invite_codes)
   - [candidate_sync_staging](#33-candidate_sync_staging)
   - [sync_runs](#34-sync_runs)
   - [candidate_profiles](#35-candidate_profiles)
   - [candidate_specialties](#36-candidate_specialties)
   - [candidate_portfolio_items](#37-candidate_portfolio_items)
   - [candidate_preferences](#38-candidate_preferences)
   - [candidate_roles](#39-candidate_roles) ← Phase 6.5
   - [candidate_portfolio_links](#310-candidate_portfolio_links) ← Phase 6.5
   - [employer_profiles](#311-employer_profiles)
   - [employer_hiring_profiles](#312-employer_hiring_profiles)
   - [employer_showcase_items](#313-employer_showcase_items)
   - [employer_preferences](#314-employer_preferences)
   - [employer_saved_candidates](#315-employer_saved_candidates) ← Phase 6
   - [employer_passed_candidates](#316-employer_passed_candidates) ← Phase 6, extended Phase 6.5
   - [candidate_views](#317-candidate_views) ← Phase 6
   - [candidate_notes](#318-candidate_notes) ← Phase 6
   - [swipe_actions](#319-swipe_actions)
   - [matches](#320-matches)
4. [Relationships & ERD](#4-relationships--erd)
5. [Triggers](#5-triggers)
6. [Row-Level Security Policies](#6-row-level-security-policies)
7. [Indexes](#7-indexes)
8. [Migration Strategy](#8-migration-strategy)

---

## 1. Architecture Overview

### Data Flow

```
Google Form → Google Sheets → [Sheets API Sync] → candidate_sync_staging
                                                           │
                                              Admin reviews & approves
                                                           │
                                              candidate_profiles (canonical)
                                                           │
                                          Future: native onboarding writes here too
                                                           │
                                                    swipe_actions
                                                           │
                                                        matches
```

### Source of Truth

| Layer | What it stores | Who writes it |
|---|---|---|
| `candidate_sync_staging` | Raw data from Google Sheets | Sync service only |
| `sync_runs` | Audit log of each sync execution | Sync service only |
| `candidate_profiles` | Canonical candidate data | Admin approval + future native onboarding |
| All `*_profiles` | Canonical user data | Application |
| `profiles` | Auth state machine row | Application + triggers |

Supabase is the **sole source of truth** after sync. The application never queries Google Sheets again once a candidate row is promoted to `candidate_profiles`.

### Design Constraints

- `auth.users` is managed by Supabase Auth — never write to it directly.
- Every table except junction tables has `created_at TIMESTAMPTZ DEFAULT now()`.
- UUIDs are used for all primary keys. They match `auth.users.id` where applicable.
- All PII columns should be encrypted at rest via Supabase Vault in a future hardening pass.

---

## 2. Enums

### `auth_state_enum`

The core state machine driving all routing and access control decisions.

```sql
CREATE TYPE auth_state_enum AS ENUM (
  'UNVERIFIED',        -- just signed up, email not yet confirmed
  'VERIFIED_NO_ROLE',  -- email confirmed, role not yet selected
  'ONBOARDING',        -- role selected, completing profile (FUTURE: native onboarding only)
  'PENDING_APPROVAL',  -- profile submitted, awaiting admin review
  'APPROVED',          -- admin approved — full dashboard access
  'REJECTED',          -- admin rejected — read-only rejection screen
  'SUSPENDED',         -- admin suspended — temporary block
  'INVITED'            -- created via invite code, bypasses some checks
);
```

### `candidate_role_enum`

The specific creative discipline of a candidate.

```sql
CREATE TYPE candidate_role_enum AS ENUM (
  'motion_designer',
  'graphic_designer',
  'ux_designer',
  'brand_designer',
  'illustrator',
  'photographer',
  'videographer',
  'creative_director',
  'art_director',
  'copywriter',
  'social_media',
  'other'
);
```

### `data_source_enum`

Tracks which path created a `candidate_profiles` row.

```sql
CREATE TYPE data_source_enum AS ENUM (
  'google_sheets_sync',   -- promoted from candidate_sync_staging
  'native_onboarding'     -- FUTURE: created via in-app onboarding
);
```

### `swipe_action_enum`

```sql
CREATE TYPE swipe_action_enum AS ENUM (
  'like',       -- legacy; kept for DB compatibility
  'pass',
  'super_like',
  'scout'       -- added Phase 6.5; use this in new code
);
```

> **Branding rule:** Use `'scout'` (not `'like'`) in all new application code. `'like'` remains in the enum for backwards compatibility with any existing rows.

### `match_status_enum`

```sql
CREATE TYPE match_status_enum AS ENUM (
  'pending',    -- employer liked, awaiting candidate interaction
  'active',     -- both parties connected
  'closed'      -- conversation ended
);
```

---

## 3. Tables

### 3.1 `profiles`

One row per authenticated user. Created by trigger on `auth.users` insert.  
This is the core state machine table — all routing decisions derive from `auth_state`.

```sql
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  role            TEXT CHECK (role IN ('candidate', 'employer', 'admin')),
  auth_state      auth_state_enum NOT NULL DEFAULT 'UNVERIFIED',
  invite_code_id  UUID REFERENCES invite_codes(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | FK → `auth.users.id`. Cascade deletes entire profile tree. |
| `email` | TEXT | Copied from `auth.users.email` on create. Mirror only — `auth.users` is canonical. |
| `role` | TEXT | `null` until role-select screen; then `'candidate'` \| `'employer'` \| `'admin'`. |
| `auth_state` | auth_state_enum | Drives all route guards. Default: `UNVERIFIED`. |
| `invite_code_id` | UUID | Set at signup if an invite code was used. Nullable. |
| `created_at` | TIMESTAMPTZ | Immutable after creation. |
| `updated_at` | TIMESTAMPTZ | Updated by trigger on every row change. |

**State transition rules:** See [AUTH_FLOW.md](AUTH_FLOW.md) — `ALLOWED_TRANSITIONS` constant.

---

### 3.2 `invite_codes`

Controls access to the platform. Employer and admin invite codes allow signup without waitlist.

```sql
CREATE TABLE invite_codes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         TEXT NOT NULL UNIQUE,
  role         TEXT NOT NULL CHECK (role IN ('candidate', 'employer', 'admin')),
  max_uses     INT NOT NULL DEFAULT 1,
  uses         INT NOT NULL DEFAULT 0,
  expires_at   TIMESTAMPTZ,
  created_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

| Column | Type | Notes |
|---|---|---|
| `code` | TEXT | Unique. Shown to the user. Case-insensitive comparison in application layer. |
| `role` | TEXT | The role that gets assigned on signup with this code. |
| `max_uses` | INT | How many times this code can be used. `-1` = unlimited. |
| `uses` | INT | Current use count. Incremented atomically. |
| `expires_at` | TIMESTAMPTZ | Nullable — codes with no expiry never expire. |
| `created_by` | UUID | The admin who created this code. |

**Validation logic:** `uses < max_uses AND (expires_at IS NULL OR expires_at > now())`

---

### 3.3 `candidate_sync_staging`

Transit table. Raw data from Google Sheets sync. Rows are never deleted — they serve as a permanent audit trail.

```sql
CREATE TABLE candidate_sync_staging (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_run_id       UUID NOT NULL REFERENCES sync_runs(id),
  google_sheets_row INT NOT NULL,         -- row number in the sheet (for debugging)
  raw_data          JSONB NOT NULL,       -- full unprocessed row from Sheets API
  mapped_data       JSONB,               -- result of sync-mapper.ts transformation
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'promoted', 'rejected', 'duplicate', 'error')),
  candidate_profile_id UUID REFERENCES candidate_profiles(id),  -- set after promotion
  error_message     TEXT,                -- set when status = 'error'
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  promoted_at       TIMESTAMPTZ          -- set when status → 'promoted'
);
```

| Column | Type | Notes |
|---|---|---|
| `raw_data` | JSONB | Verbatim Google Sheets row. Never transformed. |
| `mapped_data` | JSONB | Output of `sync-mapper.ts`. Null until mapping is attempted. |
| `status` | TEXT | Lifecycle: `pending → promoted \| rejected \| duplicate \| error` |
| `candidate_profile_id` | UUID | FK set when this row is promoted to `candidate_profiles`. |

---

### 3.4 `sync_runs`

Audit log for each Google Sheets sync execution.

```sql
CREATE TABLE sync_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'running'
                  CHECK (status IN ('running', 'complete', 'failed', 'partial')),
  rows_fetched  INT,
  rows_promoted INT,
  rows_skipped  INT,
  rows_errored  INT,
  error_message TEXT,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ
);
```

| Column | Type | Notes |
|---|---|---|
| `triggered_by` | UUID | Admin who initiated the sync. Null for automated runs. |
| `status` | TEXT | `running` while in progress, then terminal state. |
| `rows_*` | INT | Populated on completion. |

---

### 3.5 `candidate_profiles`

The canonical, source-of-truth table for candidate data. Designed to receive data from both the Google Sheets sync path (MVP) and the future native onboarding path without schema changes.

```sql
CREATE TABLE candidate_profiles (
  -- Identity
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  data_source          data_source_enum NOT NULL DEFAULT 'google_sheets_sync',

  -- Personal
  full_name            TEXT NOT NULL,
  email                TEXT NOT NULL,
  phone                TEXT,
  location_city        TEXT,
  location_country     TEXT,
  timezone             TEXT,
  pronouns             TEXT,
  bio                  TEXT,
  avatar_url           TEXT,

  -- Professional
  primary_role         TEXT,              -- free-text; denormalised display cache; migrated from candidate_role_enum in Phase 6.5
  years_experience     INT,
  portfolio_url        TEXT,
  linkedin_url         TEXT,
  instagram_url        TEXT,
  website_url          TEXT,
  resume_url           TEXT,

  -- Discovery
  is_discoverable      BOOLEAN NOT NULL DEFAULT false,
  discovery_paused     BOOLEAN NOT NULL DEFAULT false,
  discovery_score      FLOAT,                          -- weighted ranking signal; architect for AI replacement
  profile_completeness SMALLINT NOT NULL DEFAULT 0,   -- 0–100; computed by lib/candidate-completeness.ts; Phase 6.5

  -- Admin
  approved_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at          TIMESTAMPTZ,
  rejected_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rejected_at          TIMESTAMPTZ,
  rejection_reason     TEXT,

  -- Audit
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Key design decisions:**
- `user_id` is nullable for synced candidates who don't yet have a Supabase Auth account. When a synced candidate later signs up, their `profiles.id` (= `auth.users.id`) is linked here.
- `primary_role` is a denormalised TEXT cache for display performance (avoids a JOIN on every feed row). The source of truth for filtering is `candidate_roles` (Phase 6.5).
- `profile_completeness` (0–100) is recomputed by `lib/candidate-completeness.ts` whenever the candidate updates their profile. The discovery feed filters on this column when `MIN_DISCOVERY_COMPLETENESS > 0`.
- `is_discoverable` is set to `true` by admin approval. Candidates can pause discovery via `discovery_paused`. Feed query: `is_discoverable = true AND discovery_paused = false`.

---

### 3.6 `candidate_specialties`

Many-to-many relationship: a candidate has many specialties/skills.

```sql
CREATE TABLE candidate_specialties (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id  UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  level         TEXT CHECK (level IN ('beginner', 'intermediate', 'expert')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (candidate_id, name)
);
```

---

### 3.7 `candidate_portfolio_items`

```sql
CREATE TABLE candidate_portfolio_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id  UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  media_url     TEXT NOT NULL,
  media_type    TEXT CHECK (media_type IN ('image', 'video', 'link', 'pdf')),
  thumbnail_url TEXT,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### 3.8 `candidate_preferences`

One row per candidate. Work style, availability, and compensation preferences.

```sql
CREATE TABLE candidate_preferences (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id      UUID NOT NULL UNIQUE REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  open_to_remote    BOOLEAN NOT NULL DEFAULT true,
  open_to_onsite    BOOLEAN NOT NULL DEFAULT false,
  open_to_hybrid    BOOLEAN NOT NULL DEFAULT true,
  open_to_contract  BOOLEAN NOT NULL DEFAULT true,
  open_to_fulltime  BOOLEAN NOT NULL DEFAULT false,
  rate_min_hourly   INT,                -- USD
  rate_max_hourly   INT,                -- USD
  available_from    DATE,
  notice_period_days INT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### 3.9 `candidate_roles`

Relational multi-role table. A candidate can have many roles; at most one is flagged `is_primary`. Added in Phase 6.5.

```sql
CREATE TABLE IF NOT EXISTS candidate_roles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  role_name    TEXT NOT NULL,
  is_primary   BOOLEAN NOT NULL DEFAULT false,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- At most one primary role per candidate
CREATE UNIQUE INDEX IF NOT EXISTS idx_candidate_roles_primary
  ON candidate_roles (candidate_id) WHERE is_primary = true;

-- No duplicate role names per candidate (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_candidate_roles_unique
  ON candidate_roles (candidate_id, lower(role_name));
```

| Column | Type | Notes |
|---|---|---|
| `role_name` | TEXT | Free-text role label. Use `PRESET_ROLES` in application layer; custom roles allowed. |
| `is_primary` | BOOLEAN | Enforced at most one per candidate via partial UNIQUE index. |
| `sort_order` | INT | Display order of secondary roles. |

---

### 3.10 `candidate_portfolio_links`

External portfolio link URLs separate from uploaded media items (`candidate_portfolio_items`). Added in Phase 6.5.

```sql
CREATE TABLE IF NOT EXISTS candidate_portfolio_links (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  platform     TEXT NOT NULL CHECK (platform IN (
    'behance','dribbble','website','instagram','youtube','vimeo','github','pdf','other'
  )),
  url          TEXT NOT NULL,
  label        TEXT,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

| Column | Type | Notes |
|---|---|---|
| `platform` | TEXT | One of the nine allowed values. Multiple links per platform permitted. |
| `url` | TEXT | Full URL. Application validates `https://` prefix. |
| `label` | TEXT | Optional display label (e.g. "Branding Project 2025"). |

---

### 3.11 `employer_profiles`

```sql
CREATE TABLE employer_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name  TEXT NOT NULL,
  company_size  TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  industry      TEXT,
  company_url   TEXT,
  logo_url      TEXT,
  bio           TEXT,
  location_city TEXT,
  location_country TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### 3.12 `employer_hiring_profiles`

```sql
CREATE TABLE employer_hiring_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id         UUID NOT NULL UNIQUE REFERENCES employer_profiles(id) ON DELETE CASCADE,
  typically_hires     TEXT[],            -- array of candidate_role_enum values
  contract_preferred  BOOLEAN DEFAULT true,
  fulltime_preferred  BOOLEAN DEFAULT false,
  remote_ok           BOOLEAN DEFAULT true,
  onsite_ok           BOOLEAN DEFAULT false,
  budget_min_hourly   INT,
  budget_max_hourly   INT,
  hiring_urgency      TEXT CHECK (hiring_urgency IN ('immediately', 'within_month', 'within_quarter', 'exploring')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### 3.13 `employer_showcase_items`

Company culture content shown to candidates during the (future) match flow.

```sql
CREATE TABLE employer_showcase_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id  UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  media_url    TEXT NOT NULL,
  media_type   TEXT CHECK (media_type IN ('image', 'video')),
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### 3.14 `employer_preferences`

```sql
CREATE TABLE employer_preferences (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id          UUID NOT NULL UNIQUE REFERENCES employer_profiles(id) ON DELETE CASCADE,
  notify_new_match     BOOLEAN NOT NULL DEFAULT true,
  notify_email         BOOLEAN NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### 3.15 `employer_saved_candidates`

Employer bookmarks a candidate. Added in Phase 6.

```sql
CREATE TABLE employer_saved_candidates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id  UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (employer_id, candidate_id)
);
```

---

### 3.16 `employer_passed_candidates`

Employer passes on a candidate. Added in Phase 6; extended with pass type and re-eligibility columns in Phase 6.5.

```sql
CREATE TABLE employer_passed_candidates (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id           UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  candidate_id          UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  pass_type             TEXT NOT NULL DEFAULT 'temporary'
                          CHECK (pass_type IN ('temporary', 'forever')),
  expires_at            TIMESTAMPTZ,    -- null for forever passes; now() + 30 days for temporary
  candidate_updated_at  TIMESTAMPTZ,   -- snapshot of candidate_profiles.updated_at at pass time
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (employer_id, candidate_id)
);
```

| Column | Type | Notes |
|---|---|---|
| `pass_type` | TEXT | `'temporary'`: re-eligible after 30 days or profile update. `'forever'`: permanently hidden. |
| `expires_at` | TIMESTAMPTZ | Only relevant for `'temporary'` passes. Null means the pass never automatically expires (forever). |
| `candidate_updated_at` | TIMESTAMPTZ | Snapshot taken at pass time. If `candidate_profiles.updated_at > this`, the candidate is re-eligible even within the 30-day window. |

**Pass exclusion logic in discovery feed:**
1. `pass_type = 'forever'` → always excluded
2. `pass_type = 'temporary'` and `expires_at > now()` and `candidate.updated_at ≤ candidate_updated_at` → excluded
3. Otherwise (30 days elapsed OR candidate updated) → re-enters feed

---

### 3.17 `candidate_views`

Records each time an employer opens a full candidate profile. No unique constraint — tracks every view separately. Added in Phase 6.

```sql
CREATE TABLE candidate_views (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id  UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Insert is fire-and-forget (non-blocking in API route — errors silently logged).

---

### 3.18 `candidate_notes`

Private employer note per candidate. `UNIQUE(employer_id, candidate_id)` — upserted on write. Added in Phase 6.

```sql
CREATE TABLE candidate_notes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id  UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  note         TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (employer_id, candidate_id)
);
```

---

### 3.19 `swipe_actions`

Records every swipe decision an employer makes on a candidate card. **Defined now, empty until Phase 8 (Scout Mode).**

```sql
CREATE TABLE swipe_actions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id   UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  candidate_id  UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  action        swipe_action_enum NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (employer_id, candidate_id)   -- one decision per pair
);
```

---

### 3.20 `matches`

Created when an employer scouts or super-scouts a discoverable candidate. **Defined now, empty until Phase 8 (Scout Mode).**

```sql
CREATE TABLE matches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id   UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  candidate_id  UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  status        match_status_enum NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (employer_id, candidate_id)
);
```

---

## 4. Relationships & ERD

```
auth.users (Supabase managed)
    │
    ├─── profiles (1:1, cascade delete)
    │       │
    │       ├─── invite_codes (many:1, optional FK)
    │       │
    │       └─── candidate_profiles (1:1 via user_id, nullable — synced rows have no user yet)
    │                   │
    │                   ├─── candidate_specialties (1:many, cascade)
    │                   ├─── candidate_portfolio_items (1:many, cascade)
    │                   ├─── candidate_portfolio_links (1:many, cascade) ← Phase 6.5
    │                   ├─── candidate_roles (1:many, cascade) ← Phase 6.5
    │                   ├─── candidate_preferences (1:1, cascade)
    │                   ├─── candidate_views (1:many as target, cascade) ← Phase 6
    │                   ├─── candidate_notes (1:many as target, cascade) ← Phase 6
    │                   ├─── employer_saved_candidates (1:many as target, cascade) ← Phase 6
    │                   ├─── employer_passed_candidates (1:many as target, cascade) ← Phase 6
    │                   └─── swipe_actions (1:many as target, cascade)
    │                               │
    │                               └─── matches
    │
    └─── employer_profiles (1:1 via user_id, cascade delete)
                │
                ├─── employer_hiring_profiles (1:1, cascade)
                ├─── employer_showcase_items (1:many, cascade)
                ├─── employer_preferences (1:1, cascade)
                ├─── employer_saved_candidates (1:many as actor, cascade) ← Phase 6
                ├─── employer_passed_candidates (1:many as actor, cascade) ← Phase 6
                ├─── candidate_views (1:many as actor, cascade) ← Phase 6
                ├─── candidate_notes (1:many as actor, cascade) ← Phase 6
                └─── swipe_actions (1:many as actor, cascade)
                            │
                            └─── matches

candidate_sync_staging (many:1 → sync_runs, many:1 → candidate_profiles optional)
sync_runs (standalone audit table)
```

### Cascade Rules Summary

| Parent deleted | Child behaviour |
|---|---|
| `auth.users` | `profiles` deleted (cascade) → all nested profile data deleted |
| `candidate_profiles` | specialties, portfolio items, portfolio links, roles, preferences, views, notes, saved/passed records, swipe targets all deleted |
| `employer_profiles` | hiring profile, showcase, preferences, saved/passed records, views, notes, swipe actions all deleted |
| `sync_runs` | `candidate_sync_staging` rows remain (no FK cascade — audit trail preserved) |

---

## 5. Triggers

### `handle_new_user`

Fires `AFTER INSERT ON auth.users`. Creates the `profiles` row automatically.

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, auth_state)
  VALUES (NEW.id, NEW.email, 'UNVERIFIED');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### `handle_email_verified`

Fires when Supabase Auth confirms a user's email (sets `email_confirmed_at`). Transitions auth_state from `UNVERIFIED` to `VERIFIED_NO_ROLE`.

```sql
CREATE OR REPLACE FUNCTION handle_email_verified()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE profiles
    SET auth_state = 'VERIFIED_NO_ROLE', updated_at = now()
    WHERE id = NEW.id AND auth_state = 'UNVERIFIED';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_email_verified
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_email_verified();
```

### `update_updated_at`

Universal `updated_at` trigger applied to every table that has the column.

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied to: profiles, candidate_profiles, candidate_portfolio_items,
-- candidate_preferences, employer_profiles, employer_hiring_profiles,
-- employer_preferences, matches
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON <table_name>
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### `set_discoverable_on_approval`

When an admin approves a candidate (`auth_state` → `APPROVED`), automatically set `is_discoverable = true`.

```sql
CREATE OR REPLACE FUNCTION set_discoverable_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.auth_state = 'APPROVED' AND OLD.auth_state != 'APPROVED' THEN
    UPDATE candidate_profiles
    SET is_discoverable = true, updated_at = now()
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_candidate_approved
  AFTER UPDATE OF auth_state ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_discoverable_on_approval();
```

---

## 6. Row-Level Security Policies

RLS is **enabled on all tables**. The default policy is DENY ALL — every allowed operation requires an explicit policy.

### `profiles`

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (limited columns via application logic)
CREATE POLICY "users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "admins read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admins can update any profile (for state transitions)
CREATE POLICY "admins update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
```

### `candidate_profiles`

```sql
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;

-- Candidates read their own profile
CREATE POLICY "candidates read own profile"
  ON candidate_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Candidates update their own profile
CREATE POLICY "candidates update own profile"
  ON candidate_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins read all candidate profiles
CREATE POLICY "admins read all candidate profiles"
  ON candidate_profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can insert/update/delete (for sync promotion and approval)
CREATE POLICY "admins full access candidate profiles"
  ON candidate_profiles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Approved employers can read discoverable candidates (Phase 6)
CREATE POLICY "employers read discoverable candidates"
  ON candidate_profiles FOR SELECT
  USING (
    is_discoverable = true
    AND discovery_paused = false
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'employer'
      AND auth_state = 'APPROVED'
    )
  );
```

### `candidate_sync_staging`

```sql
ALTER TABLE candidate_sync_staging ENABLE ROW LEVEL SECURITY;

-- Admins only — candidates never touch this table directly
CREATE POLICY "admins full access staging"
  ON candidate_sync_staging FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

### `sync_runs`

```sql
ALTER TABLE sync_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins full access sync_runs"
  ON sync_runs FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

### `invite_codes`

```sql
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can read a code to validate it (application checks validity)
CREATE POLICY "anyone read invite codes"
  ON invite_codes FOR SELECT
  USING (true);

-- Admins can create, update, delete codes
CREATE POLICY "admins manage invite codes"
  ON invite_codes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

### `swipe_actions`

```sql
ALTER TABLE swipe_actions ENABLE ROW LEVEL SECURITY;

-- Employers create their own swipe actions
CREATE POLICY "employers insert own swipe actions"
  ON swipe_actions FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM employer_profiles WHERE id = employer_id AND user_id = auth.uid())
  );

-- Employers read their own swipe history
CREATE POLICY "employers read own swipe actions"
  ON swipe_actions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM employer_profiles WHERE id = employer_id AND user_id = auth.uid())
  );
```

### `matches`

```sql
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Both parties can read their matches
CREATE POLICY "parties read own matches"
  ON matches FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM employer_profiles WHERE id = employer_id AND user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM candidate_profiles WHERE id = candidate_id AND user_id = auth.uid())
  );
```

---

## 7. Indexes

```sql
-- profiles — fast auth state lookups
CREATE INDEX idx_profiles_auth_state ON profiles (auth_state);
CREATE INDEX idx_profiles_role       ON profiles (role);

-- candidate_profiles — discovery feed ordering and filtering
CREATE INDEX idx_candidate_discoverable
  ON candidate_profiles (is_discoverable, discovery_paused)
  WHERE is_discoverable = true AND discovery_paused = false;

CREATE INDEX idx_candidate_user_id           ON candidate_profiles (user_id);
CREATE INDEX idx_candidate_role              ON candidate_profiles (primary_role);
CREATE INDEX idx_candidate_discovery_order   ON candidate_profiles (discovery_score DESC NULLS LAST, created_at DESC, id ASC)
  WHERE is_discoverable = true AND discovery_paused = false;
CREATE INDEX idx_candidate_location_country  ON candidate_profiles (location_country);
CREATE INDEX idx_candidate_experience        ON candidate_profiles (years_experience);
CREATE INDEX idx_candidate_completeness      ON candidate_profiles (profile_completeness);   -- Phase 6.5

-- candidate_roles (Phase 6.5) — role filter
CREATE INDEX idx_candidate_roles_candidate   ON candidate_roles (candidate_id);
CREATE INDEX idx_candidate_roles_role_name   ON candidate_roles (role_name);
-- Partial UNIQUE indexes declared with table DDL (see 3.9 candidate_roles)

-- candidate_portfolio_links (Phase 6.5)
CREATE INDEX idx_portfolio_links_candidate   ON candidate_portfolio_links (candidate_id);

-- candidate_sync_staging — admin review queue
CREATE INDEX idx_staging_status      ON candidate_sync_staging (status);
CREATE INDEX idx_staging_sync_run    ON candidate_sync_staging (sync_run_id);

-- candidate_specialties — skills filter
CREATE INDEX idx_specialties_name    ON candidate_specialties (name);
CREATE INDEX idx_specialties_cand    ON candidate_specialties (candidate_id);

-- candidate_preferences — work type / rate / availability filter
CREATE INDEX idx_prefs_candidate     ON candidate_preferences (candidate_id);

-- Phase 6 discovery tables
CREATE INDEX idx_saved_employer      ON employer_saved_candidates (employer_id);
CREATE INDEX idx_saved_candidate     ON employer_saved_candidates (candidate_id);
CREATE INDEX idx_passed_employer     ON employer_passed_candidates (employer_id);
CREATE INDEX idx_passed_candidate    ON employer_passed_candidates (candidate_id);
CREATE INDEX idx_passed_expires      ON employer_passed_candidates (expires_at)
  WHERE pass_type = 'temporary';
CREATE INDEX idx_views_employer      ON candidate_views (employer_id);
CREATE INDEX idx_views_candidate     ON candidate_views (candidate_id);
CREATE INDEX idx_notes_employer_cand ON candidate_notes (employer_id, candidate_id);

-- swipe_actions — deduplication check (Phase 8)
CREATE INDEX idx_swipe_employer      ON swipe_actions (employer_id);
CREATE INDEX idx_swipe_candidate     ON swipe_actions (candidate_id);

-- matches — dashboard query (Phase 8)
CREATE INDEX idx_matches_employer    ON matches (employer_id, status);
CREATE INDEX idx_matches_candidate   ON matches (candidate_id, status);
```

---

## 8. Migration Strategy

### Versioning Convention

Migrations live in `supabase/migrations/` with the format:
```
YYYYMMDDHHMMSS_description.sql
```

Example: `20260630120000_initial_schema.sql`

### Migration Phases

| Migration file | Phase | Content |
|---|---|---|
| `20260630000000_initial_schema.sql` | 2 | All enums, all tables, all triggers, all indexes |
| `20260630000001_rls_policies.sql` | 2 | All RLS policies (separate for readability) |
| `20260630000002_seed_admin.sql` | 2 | Admin invite code, initial admin account setup |
| `20260630000003_employer_profile_fields.sql` | 5 | `linkedin_url`, `founded_year` on `employer_profiles` |
| `20260701000001_phase6_discovery.sql` | 6 | `employer_saved_candidates`, `employer_passed_candidates`, `candidate_views`, `candidate_notes` + 13 indexes |
| `20260701000002_phase6_5_arch.sql` | 6.5 | `candidate_roles`, `candidate_portfolio_links`; `primary_role TEXT`; `profile_completeness`; `employer_passed_candidates` pass columns; `swipe_action_enum` + `'scout'` |

> **Note:** `ALTER TYPE ... ADD VALUE` cannot run inside a transaction in PostgreSQL. Migration `20260701000002` runs this statement outside any transaction block — use `supabase db push` or run the SQL directly in Supabase SQL Editor.

### Adding Columns

- **Nullable columns:** Add directly — no downtime.
- **NOT NULL columns:** Add as nullable, backfill, then add NOT NULL constraint.
- **New enum values:** `ALTER TYPE enum_name ADD VALUE 'new_value'` — cannot be done inside a transaction in PostgreSQL. Use a separate migration.
- **Dropping columns:** First make them unused in the application, then drop in a subsequent migration.

### Renaming Tables/Columns

Always done in two migrations:
1. Add the new name as an alias (view or generated column) — deploy.
2. Remove old name — deploy after confirming no code uses the old name.

### Future Schema Changes for Native Onboarding (Phase 5)

These changes are already accounted for — no schema migration needed:
- `candidate_profiles.user_id` is already nullable (synced candidates without accounts)
- `data_source` enum already includes `'native_onboarding'`
- `candidate_specialties`, `candidate_portfolio_items`, `candidate_preferences` are already defined
- `is_discoverable` and `discovery_paused` are already defined

The only additions needed in Phase 5:
- Fields added to the onboarding UI that don't yet have columns — add as nullable columns.
- Potentially a `candidate_onboarding_progress` table to track multi-step form state.
