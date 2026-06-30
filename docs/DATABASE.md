# ScouttOpp — Database Reference
### Supabase / PostgreSQL Schema v1.0

> **Status:** ✅ Migrations written in Phase 2. Run `supabase db push` to deploy. See `supabase/migrations/`.  
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
   - [employer_profiles](#39-employer_profiles)
   - [employer_hiring_profiles](#310-employer_hiring_profiles)
   - [employer_showcase_items](#311-employer_showcase_items)
   - [employer_preferences](#312-employer_preferences)
   - [swipe_actions](#313-swipe_actions)
   - [matches](#314-matches)
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
  'like',
  'pass',
  'super_like'
);
```

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
  primary_role         candidate_role_enum,
  years_experience     INT,
  portfolio_url        TEXT,
  linkedin_url         TEXT,
  instagram_url        TEXT,
  website_url          TEXT,
  resume_url           TEXT,

  -- Discovery (Swipe feature)
  is_discoverable      BOOLEAN NOT NULL DEFAULT false,
  discovery_paused     BOOLEAN NOT NULL DEFAULT false,
  discovery_score      FLOAT,           -- computed ranking signal (future)

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

**Key design decision:** `user_id` is nullable for synced candidates who don't yet have a Supabase Auth account. When a synced candidate later signs up, their `profiles.id` (= `auth.users.id`) is linked here. This enables a seamless transition from "sync-only" to "fully registered user" without data migration.

`is_discoverable` is set to `true` by the admin approval action. Candidates can pause discovery via `discovery_paused`. The swipe query combines both: `is_discoverable = true AND discovery_paused = false`.

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

### 3.9 `employer_profiles`

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

### 3.10 `employer_hiring_profiles`

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

### 3.11 `employer_showcase_items`

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

### 3.12 `employer_preferences`

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

### 3.13 `swipe_actions`

Records every swipe decision an employer makes on a candidate card. **Defined now, empty until Phase 6.**

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

### 3.14 `matches`

Created when an employer `like`s or `super_like`s a discoverable candidate. **Defined now, empty until Phase 6.**

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
    │                   ├─── candidate_preferences (1:1, cascade)
    │                   └─── swipe_actions (1:many as target, cascade)
    │                               │
    │                               └─── matches
    │
    └─── employer_profiles (1:1 via user_id, cascade delete)
                │
                ├─── employer_hiring_profiles (1:1, cascade)
                ├─── employer_showcase_items (1:many, cascade)
                ├─── employer_preferences (1:1, cascade)
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
| `candidate_profiles` | specialties, portfolio, preferences, swipe targets all deleted |
| `employer_profiles` | hiring profile, showcase, preferences, swipe actions all deleted |
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

-- candidate_profiles — swipe discovery query
CREATE INDEX idx_candidate_discoverable
  ON candidate_profiles (is_discoverable, discovery_paused)
  WHERE is_discoverable = true AND discovery_paused = false;

CREATE INDEX idx_candidate_user_id   ON candidate_profiles (user_id);
CREATE INDEX idx_candidate_role      ON candidate_profiles (primary_role);

-- candidate_sync_staging — admin review queue
CREATE INDEX idx_staging_status      ON candidate_sync_staging (status);
CREATE INDEX idx_staging_sync_run    ON candidate_sync_staging (sync_run_id);

-- swipe_actions — deduplication check
CREATE INDEX idx_swipe_employer      ON swipe_actions (employer_id);
CREATE INDEX idx_swipe_candidate     ON swipe_actions (candidate_id);

-- matches — dashboard query
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

| Migration | Content |
|---|---|
| `*_initial_schema.sql` | All enums, all tables, all triggers, all indexes |
| `*_rls_policies.sql` | All RLS policies (separate for readability) |
| `*_seed_admin.sql` | Admin invite code, initial admin account setup |

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
