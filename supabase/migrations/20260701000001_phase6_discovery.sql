-- =============================================================================
-- ScouttOpp — Phase 6: Employer Discovery Engine
-- Migration: 20260701000001_phase6_discovery.sql
-- Idempotent: safe to run multiple times.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: employer_saved_candidates
-- Employers explicitly save (bookmark) candidates they're interested in.
-- Separate from swipe_actions to keep Phase 6 concerns clean.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employer_saved_candidates (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id  UUID        NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  candidate_id UUID        NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  saved_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (employer_id, candidate_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: employer_passed_candidates
-- Employers explicitly pass on a candidate — removes from discovery feed.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employer_passed_candidates (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id  UUID        NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  candidate_id UUID        NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  passed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (employer_id, candidate_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: candidate_views
-- Tracks when an employer opens a full candidate profile.
-- No UNIQUE constraint — same employer can view the same candidate many times.
-- Used for "recently viewed" filter and future AI ranking signals.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidate_views (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id  UUID        NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  candidate_id UUID        NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  viewed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: candidate_notes
-- Private employer notes about a candidate. One note per employer-candidate pair.
-- Only visible to the employer who created it.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidate_notes (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id  UUID        NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  candidate_id UUID        NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  note         TEXT        NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (employer_id, candidate_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGERS — auto-update updated_at on candidate_notes
-- ─────────────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS set_updated_at_candidate_notes ON candidate_notes;
CREATE TRIGGER set_updated_at_candidate_notes
  BEFORE UPDATE ON candidate_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────────────────────

-- Discovery feed: exclude already-saved candidates for a given employer
CREATE INDEX IF NOT EXISTS idx_saved_employer_candidate
  ON employer_saved_candidates (employer_id, candidate_id);

-- Saved list ordered by most-recently-saved
CREATE INDEX IF NOT EXISTS idx_saved_employer_date
  ON employer_saved_candidates (employer_id, saved_at DESC);

-- Discovery feed: exclude already-passed candidates for a given employer
CREATE INDEX IF NOT EXISTS idx_passed_employer_candidate
  ON employer_passed_candidates (employer_id, candidate_id);

-- Candidate views: fetch most-recent N views for a given employer
CREATE INDEX IF NOT EXISTS idx_views_employer_recent
  ON candidate_views (employer_id, viewed_at DESC);

-- Candidate views: count views per candidate (admin analytics)
CREATE INDEX IF NOT EXISTS idx_views_candidate
  ON candidate_views (candidate_id);

-- Notes lookup by employer
CREATE INDEX IF NOT EXISTS idx_notes_employer_candidate
  ON candidate_notes (employer_id, candidate_id);

-- Discovery feed ordering: score + created_at cursor
-- Partial index over only discoverable candidates
CREATE INDEX IF NOT EXISTS idx_candidate_discovery_feed
  ON candidate_profiles (discovery_score DESC NULLS LAST, created_at DESC, id ASC)
  WHERE is_discoverable = true AND discovery_paused = false;

-- Location filter
CREATE INDEX IF NOT EXISTS idx_candidate_location_country
  ON candidate_profiles (location_country);

-- Experience filter
CREATE INDEX IF NOT EXISTS idx_candidate_experience
  ON candidate_profiles (years_experience);

-- Specialty name search (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_specialty_name_lower
  ON candidate_specialties (lower(name));

-- Preferences: work type + rate + availability (for filter subqueries)
CREATE INDEX IF NOT EXISTS idx_pref_candidate
  ON candidate_preferences (candidate_id);
