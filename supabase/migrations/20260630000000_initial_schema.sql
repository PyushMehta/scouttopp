-- =============================================================================
-- ScouttOpp — Initial Schema
-- Migration: 20260630000000_initial_schema.sql
-- Idempotent: safe to run multiple times.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS  (idempotent via DO/EXCEPTION)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE auth_state_enum AS ENUM (
    'UNVERIFIED',
    'VERIFIED_NO_ROLE',
    'ONBOARDING',
    'PENDING_APPROVAL',
    'APPROVED',
    'REJECTED',
    'SUSPENDED',
    'INVITED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
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
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE data_source_enum AS ENUM (
    'google_sheets_sync',
    'native_onboarding'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE swipe_action_enum AS ENUM (
    'like',
    'pass',
    'super_like'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE match_status_enum AS ENUM (
    'pending',
    'active',
    'closed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLES  (idempotent via IF NOT EXISTS)
-- ─────────────────────────────────────────────────────────────────────────────

-- invite_codes must come before profiles (profiles FK → invite_codes)
CREATE TABLE IF NOT EXISTS invite_codes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         TEXT NOT NULL UNIQUE,
  role         TEXT NOT NULL CHECK (role IN ('candidate', 'employer', 'admin')),
  max_uses     INT NOT NULL DEFAULT 1,
  uses         INT NOT NULL DEFAULT 0,
  expires_at   TIMESTAMPTZ,
  created_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  role            TEXT CHECK (role IN ('candidate', 'employer', 'admin')),
  auth_state      auth_state_enum NOT NULL DEFAULT 'UNVERIFIED',
  invite_code_id  UUID REFERENCES invite_codes(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sync_runs (
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

CREATE TABLE IF NOT EXISTS candidate_profiles (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  data_source          data_source_enum NOT NULL DEFAULT 'google_sheets_sync',
  full_name            TEXT NOT NULL,
  email                TEXT NOT NULL,
  phone                TEXT,
  location_city        TEXT,
  location_country     TEXT,
  timezone             TEXT,
  pronouns             TEXT,
  bio                  TEXT,
  avatar_url           TEXT,
  primary_role         candidate_role_enum,
  years_experience     INT,
  portfolio_url        TEXT,
  linkedin_url         TEXT,
  instagram_url        TEXT,
  website_url          TEXT,
  resume_url           TEXT,
  is_discoverable      BOOLEAN NOT NULL DEFAULT false,
  discovery_paused     BOOLEAN NOT NULL DEFAULT false,
  discovery_score      FLOAT,
  approved_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at          TIMESTAMPTZ,
  rejected_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rejected_at          TIMESTAMPTZ,
  rejection_reason     TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- candidate_sync_staging depends on sync_runs and candidate_profiles
CREATE TABLE IF NOT EXISTS candidate_sync_staging (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_run_id          UUID NOT NULL REFERENCES sync_runs(id),
  google_sheets_row    INT NOT NULL,
  raw_data             JSONB NOT NULL,
  mapped_data          JSONB,
  status               TEXT NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'promoted', 'rejected', 'duplicate', 'error')),
  candidate_profile_id UUID REFERENCES candidate_profiles(id),
  error_message        TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  promoted_at          TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS candidate_specialties (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id  UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  level         TEXT CHECK (level IN ('beginner', 'intermediate', 'expert')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (candidate_id, name)
);

CREATE TABLE IF NOT EXISTS candidate_portfolio_items (
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

CREATE TABLE IF NOT EXISTS candidate_preferences (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id       UUID NOT NULL UNIQUE REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  open_to_remote     BOOLEAN NOT NULL DEFAULT true,
  open_to_onsite     BOOLEAN NOT NULL DEFAULT false,
  open_to_hybrid     BOOLEAN NOT NULL DEFAULT true,
  open_to_contract   BOOLEAN NOT NULL DEFAULT true,
  open_to_fulltime   BOOLEAN NOT NULL DEFAULT false,
  rate_min_hourly    INT,
  rate_max_hourly    INT,
  available_from     DATE,
  notice_period_days INT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employer_profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name     TEXT NOT NULL,
  company_size     TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  industry         TEXT,
  company_url      TEXT,
  logo_url         TEXT,
  bio              TEXT,
  location_city    TEXT,
  location_country TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employer_hiring_profiles (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id        UUID NOT NULL UNIQUE REFERENCES employer_profiles(id) ON DELETE CASCADE,
  typically_hires    TEXT[],
  contract_preferred BOOLEAN DEFAULT true,
  fulltime_preferred BOOLEAN DEFAULT false,
  remote_ok          BOOLEAN DEFAULT true,
  onsite_ok          BOOLEAN DEFAULT false,
  budget_min_hourly  INT,
  budget_max_hourly  INT,
  hiring_urgency     TEXT CHECK (hiring_urgency IN ('immediately', 'within_month', 'within_quarter', 'exploring')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employer_showcase_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  media_url   TEXT NOT NULL,
  media_type  TEXT CHECK (media_type IN ('image', 'video')),
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employer_preferences (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id      UUID NOT NULL UNIQUE REFERENCES employer_profiles(id) ON DELETE CASCADE,
  notify_new_match BOOLEAN NOT NULL DEFAULT true,
  notify_email     BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS swipe_actions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id  UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  action       swipe_action_enum NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (employer_id, candidate_id)
);

CREATE TABLE IF NOT EXISTS matches (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id  UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  status       match_status_enum NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (employer_id, candidate_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCTIONS & TRIGGERS  (functions use CREATE OR REPLACE; triggers drop first)
-- ─────────────────────────────────────────────────────────────────────────────

-- Universal updated_at setter
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_profiles              ON profiles;
DROP TRIGGER IF EXISTS set_updated_at_candidate_profiles    ON candidate_profiles;
DROP TRIGGER IF EXISTS set_updated_at_candidate_portfolio_items ON candidate_portfolio_items;
DROP TRIGGER IF EXISTS set_updated_at_candidate_preferences ON candidate_preferences;
DROP TRIGGER IF EXISTS set_updated_at_employer_profiles     ON employer_profiles;
DROP TRIGGER IF EXISTS set_updated_at_employer_hiring_profiles ON employer_hiring_profiles;
DROP TRIGGER IF EXISTS set_updated_at_employer_preferences  ON employer_preferences;
DROP TRIGGER IF EXISTS set_updated_at_matches               ON matches;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_candidate_profiles
  BEFORE UPDATE ON candidate_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_candidate_portfolio_items
  BEFORE UPDATE ON candidate_portfolio_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_candidate_preferences
  BEFORE UPDATE ON candidate_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_employer_profiles
  BEFORE UPDATE ON employer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_employer_hiring_profiles
  BEFORE UPDATE ON employer_hiring_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_employer_preferences
  BEFORE UPDATE ON employer_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_matches
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profiles row on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  initial_state auth_state_enum;
BEGIN
  -- OAuth providers (Google etc.) set email_confirmed_at at creation time,
  -- so handle_email_verified never fires for them. Start them at VERIFIED_NO_ROLE.
  IF NEW.email_confirmed_at IS NOT NULL THEN
    initial_state := 'VERIFIED_NO_ROLE';
  ELSE
    initial_state := 'UNVERIFIED';
  END IF;

  INSERT INTO public.profiles (id, email, auth_state)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', ''),
    initial_state
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Transition UNVERIFIED → VERIFIED_NO_ROLE when email is confirmed
CREATE OR REPLACE FUNCTION handle_email_verified()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE public.profiles
    SET auth_state = 'VERIFIED_NO_ROLE', updated_at = now()
    WHERE id = NEW.id AND auth_state = 'UNVERIFIED';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_email_verified ON auth.users;
CREATE TRIGGER on_email_verified
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_email_verified();

-- Set is_discoverable = true when candidate is approved
CREATE OR REPLACE FUNCTION set_discoverable_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.auth_state = 'APPROVED' AND OLD.auth_state != 'APPROVED' THEN
    UPDATE public.candidate_profiles
    SET is_discoverable = true, updated_at = now()
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_candidate_approved ON profiles;
CREATE TRIGGER on_candidate_approved
  AFTER UPDATE OF auth_state ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_discoverable_on_approval();

-- ─────────────────────────────────────────────────────────────────────────────
-- INDEXES  (idempotent via IF NOT EXISTS)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_profiles_auth_state ON profiles (auth_state);
CREATE INDEX IF NOT EXISTS idx_profiles_role       ON profiles (role);

CREATE INDEX IF NOT EXISTS idx_candidate_discoverable
  ON candidate_profiles (is_discoverable, discovery_paused)
  WHERE is_discoverable = true AND discovery_paused = false;

CREATE INDEX IF NOT EXISTS idx_candidate_user_id   ON candidate_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_role      ON candidate_profiles (primary_role);

CREATE INDEX IF NOT EXISTS idx_staging_status      ON candidate_sync_staging (status);
CREATE INDEX IF NOT EXISTS idx_staging_sync_run    ON candidate_sync_staging (sync_run_id);

CREATE INDEX IF NOT EXISTS idx_swipe_employer      ON swipe_actions (employer_id);
CREATE INDEX IF NOT EXISTS idx_swipe_candidate     ON swipe_actions (candidate_id);

CREATE INDEX IF NOT EXISTS idx_matches_employer    ON matches (employer_id, status);
CREATE INDEX IF NOT EXISTS idx_matches_candidate   ON matches (candidate_id, status);
