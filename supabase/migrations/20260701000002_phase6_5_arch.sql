-- =============================================================================
-- ScouttOpp — Phase 6.5: Architecture Refinement
-- Migration: 20260701000002_phase6_5_arch.sql
-- Idempotent: safe to run multiple times (except ALTER TYPE — see note below).
-- NOTE: Run this outside a transaction if your migration runner wraps in one,
--       because ALTER TYPE ADD VALUE cannot run inside a transaction.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. candidate_profiles — change primary_role from enum to TEXT
--    Allows storing both preset and custom role names.
--    Existing enum values are preserved verbatim (e.g. 'motion_designer').
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE candidate_profiles
  ALTER COLUMN primary_role TYPE TEXT USING primary_role::TEXT;

-- Drop the old index that typed on the enum column
DROP INDEX IF EXISTS idx_candidate_role;
CREATE INDEX IF NOT EXISTS idx_candidate_primary_role
  ON candidate_profiles (primary_role);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. candidate_profiles — add profile_completeness (0–100)
--    Computed and stored by the application via lib/candidate-completeness.ts.
--    Raise MIN_DISCOVERY_COMPLETENESS to 60 before production launch.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE candidate_profiles
  ADD COLUMN IF NOT EXISTS profile_completeness SMALLINT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_candidate_completeness
  ON candidate_profiles (profile_completeness)
  WHERE is_discoverable = true;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TABLE: candidate_roles
--    Relational multi-role support. One row per role per candidate.
--    candidate_profiles.primary_role is a denormalised TEXT cache of the
--    role where is_primary = true — updated by the application on write.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidate_roles (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID        NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  role_name    TEXT        NOT NULL,
  is_primary   BOOLEAN     NOT NULL DEFAULT false,
  sort_order   INT         NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- At most one primary role per candidate
CREATE UNIQUE INDEX IF NOT EXISTS idx_candidate_roles_primary
  ON candidate_roles (candidate_id)
  WHERE is_primary = true;

-- No duplicate role names per candidate (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_candidate_roles_unique
  ON candidate_roles (candidate_id, lower(role_name));

CREATE INDEX IF NOT EXISTS idx_candidate_roles_candidate
  ON candidate_roles (candidate_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. TABLE: candidate_portfolio_links
--    External portfolio links (Behance, Dribbble, YouTube, etc.).
--    Separate from candidate_portfolio_items which holds uploaded media.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidate_portfolio_links (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID        NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  platform     TEXT        NOT NULL
                             CHECK (platform IN (
                               'behance', 'dribbble', 'website', 'instagram',
                               'youtube', 'vimeo', 'github', 'pdf', 'other'
                             )),
  url          TEXT        NOT NULL,
  label        TEXT,
  sort_order   INT         NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_links_candidate
  ON candidate_portfolio_links (candidate_id, sort_order);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. employer_passed_candidates — add pass_type, expiry, candidate snapshot
--    'temporary' passes expire after 30 days OR when the candidate updates
--    their profile. 'forever' passes are permanent (Hide Forever).
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE employer_passed_candidates
  ADD COLUMN IF NOT EXISTS pass_type TEXT NOT NULL DEFAULT 'temporary'
    CHECK (pass_type IN ('temporary', 'forever')),
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS candidate_updated_at TIMESTAMPTZ;

-- Backfill existing rows as temporary passes expiring 30 days from now
UPDATE employer_passed_candidates
  SET expires_at           = now() + INTERVAL '30 days',
      candidate_updated_at = now()
  WHERE expires_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_passed_type_expiry
  ON employer_passed_candidates (employer_id, pass_type, expires_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. swipe_action_enum — add 'scout' (replaces 'like' in ScouttOpp branding)
--    'like' value remains in the enum for legacy compatibility; new code
--    should use 'scout' exclusively. Cannot remove enum values in PostgreSQL.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TYPE swipe_action_enum ADD VALUE IF NOT EXISTS 'scout';
