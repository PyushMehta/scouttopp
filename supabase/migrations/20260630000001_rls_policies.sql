-- =============================================================================
-- ScouttOpp — Row-Level Security Policies
-- Migration: 20260630000001_rls_policies.sql
-- Default posture: DENY ALL. Every table requires explicit policies.
-- Idempotent: DROP POLICY IF EXISTS before each CREATE POLICY.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER FUNCTIONS  (SECURITY DEFINER → bypass RLS on profiles)
-- A bare EXISTS (SELECT 1 FROM profiles …) inside an RLS policy re-evaluates
-- the policies on profiles, which in turn runs the same EXISTS, causing
-- infinite recursion (42P17).  Wrapping the check in a SECURITY DEFINER
-- function makes the inner query run as the function's owner (postgres),
-- which has BYPASSRLS, breaking the cycle.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_approved_employer()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'employer' AND auth_state = 'APPROVED'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_approved_candidate()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'candidate' AND auth_state = 'APPROVED'
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own profile"    ON profiles;
DROP POLICY IF EXISTS "users update own profile"  ON profiles;
DROP POLICY IF EXISTS "admins read all profiles"  ON profiles;
DROP POLICY IF EXISTS "admins update any profile" ON profiles;

CREATE POLICY "users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "admins read all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "admins update any profile"
  ON profiles FOR UPDATE
  USING (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- invite_codes
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone read invite codes"   ON invite_codes;
DROP POLICY IF EXISTS "admins manage invite codes" ON invite_codes;

CREATE POLICY "anyone read invite codes"
  ON invite_codes FOR SELECT
  USING (true);

CREATE POLICY "admins manage invite codes"
  ON invite_codes FOR ALL
  USING (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- sync_runs
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE sync_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins full access sync_runs" ON sync_runs;

CREATE POLICY "admins full access sync_runs"
  ON sync_runs FOR ALL
  USING (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- candidate_sync_staging
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE candidate_sync_staging ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins full access staging" ON candidate_sync_staging;

CREATE POLICY "admins full access staging"
  ON candidate_sync_staging FOR ALL
  USING (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- candidate_profiles
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "candidates read own profile"           ON candidate_profiles;
DROP POLICY IF EXISTS "candidates update own profile"         ON candidate_profiles;
DROP POLICY IF EXISTS "admins read all candidate profiles"    ON candidate_profiles;
DROP POLICY IF EXISTS "admins full access candidate profiles" ON candidate_profiles;
DROP POLICY IF EXISTS "employers read discoverable candidates" ON candidate_profiles;

CREATE POLICY "candidates read own profile"
  ON candidate_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "candidates update own profile"
  ON candidate_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "admins read all candidate profiles"
  ON candidate_profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "admins full access candidate profiles"
  ON candidate_profiles FOR ALL
  USING (public.is_admin());

CREATE POLICY "employers read discoverable candidates"
  ON candidate_profiles FOR SELECT
  USING (
    is_discoverable = true
    AND discovery_paused = false
    AND public.is_approved_employer()
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- candidate_specialties
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE candidate_specialties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "candidates manage own specialties"       ON candidate_specialties;
DROP POLICY IF EXISTS "admins full access specialties"          ON candidate_specialties;
DROP POLICY IF EXISTS "employers read discoverable specialties" ON candidate_specialties;

CREATE POLICY "candidates manage own specialties"
  ON candidate_specialties FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM candidate_profiles
      WHERE id = candidate_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "admins full access specialties"
  ON candidate_specialties FOR ALL
  USING (public.is_admin());

CREATE POLICY "employers read discoverable specialties"
  ON candidate_specialties FOR SELECT
  USING (
    public.is_approved_employer()
    AND EXISTS (
      SELECT 1 FROM candidate_profiles cp
      WHERE cp.id = candidate_id
        AND cp.is_discoverable = true
        AND cp.discovery_paused = false
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- candidate_portfolio_items
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE candidate_portfolio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "candidates manage own portfolio"       ON candidate_portfolio_items;
DROP POLICY IF EXISTS "admins full access portfolio"          ON candidate_portfolio_items;
DROP POLICY IF EXISTS "employers read discoverable portfolio" ON candidate_portfolio_items;

CREATE POLICY "candidates manage own portfolio"
  ON candidate_portfolio_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM candidate_profiles
      WHERE id = candidate_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "admins full access portfolio"
  ON candidate_portfolio_items FOR ALL
  USING (public.is_admin());

CREATE POLICY "employers read discoverable portfolio"
  ON candidate_portfolio_items FOR SELECT
  USING (
    public.is_approved_employer()
    AND EXISTS (
      SELECT 1 FROM candidate_profiles cp
      WHERE cp.id = candidate_id
        AND cp.is_discoverable = true
        AND cp.discovery_paused = false
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- candidate_preferences
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE candidate_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "candidates manage own preferences"        ON candidate_preferences;
DROP POLICY IF EXISTS "admins full access candidate preferences" ON candidate_preferences;

CREATE POLICY "candidates manage own preferences"
  ON candidate_preferences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM candidate_profiles
      WHERE id = candidate_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "admins full access candidate preferences"
  ON candidate_preferences FOR ALL
  USING (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- employer_profiles
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "employers read own profile"           ON employer_profiles;
DROP POLICY IF EXISTS "employers update own profile"         ON employer_profiles;
DROP POLICY IF EXISTS "employers insert own profile"         ON employer_profiles;
DROP POLICY IF EXISTS "admins full access employer profiles" ON employer_profiles;

CREATE POLICY "employers read own profile"
  ON employer_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "employers update own profile"
  ON employer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "employers insert own profile"
  ON employer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins full access employer profiles"
  ON employer_profiles FOR ALL
  USING (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- employer_hiring_profiles
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE employer_hiring_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "employers manage own hiring profile" ON employer_hiring_profiles;
DROP POLICY IF EXISTS "admins full access hiring profiles"  ON employer_hiring_profiles;

CREATE POLICY "employers manage own hiring profile"
  ON employer_hiring_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employer_profiles
      WHERE id = employer_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "admins full access hiring profiles"
  ON employer_hiring_profiles FOR ALL
  USING (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- employer_showcase_items
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE employer_showcase_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "employers manage own showcase"              ON employer_showcase_items;
DROP POLICY IF EXISTS "approved candidates read employer showcase" ON employer_showcase_items;

CREATE POLICY "employers manage own showcase"
  ON employer_showcase_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employer_profiles
      WHERE id = employer_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "approved candidates read employer showcase"
  ON employer_showcase_items FOR SELECT
  USING (public.is_approved_candidate());

-- ─────────────────────────────────────────────────────────────────────────────
-- employer_preferences
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE employer_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "employers manage own preferences"        ON employer_preferences;
DROP POLICY IF EXISTS "admins full access employer preferences" ON employer_preferences;

CREATE POLICY "employers manage own preferences"
  ON employer_preferences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employer_profiles
      WHERE id = employer_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "admins full access employer preferences"
  ON employer_preferences FOR ALL
  USING (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- swipe_actions
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE swipe_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "employers insert own swipe actions" ON swipe_actions;
DROP POLICY IF EXISTS "employers read own swipe actions"   ON swipe_actions;
DROP POLICY IF EXISTS "admins full access swipe actions"   ON swipe_actions;

CREATE POLICY "employers insert own swipe actions"
  ON swipe_actions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employer_profiles
      WHERE id = employer_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "employers read own swipe actions"
  ON swipe_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employer_profiles
      WHERE id = employer_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "admins full access swipe actions"
  ON swipe_actions FOR ALL
  USING (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- matches
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parties read own matches"   ON matches;
DROP POLICY IF EXISTS "employers insert matches"   ON matches;
DROP POLICY IF EXISTS "admins full access matches" ON matches;

CREATE POLICY "parties read own matches"
  ON matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employer_profiles
      WHERE id = employer_id AND user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM candidate_profiles
      WHERE id = candidate_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "employers insert matches"
  ON matches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employer_profiles
      WHERE id = employer_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "admins full access matches"
  ON matches FOR ALL
  USING (public.is_admin());
