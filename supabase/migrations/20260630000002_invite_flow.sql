-- =============================================================================
-- ScouttOpp — Invite Flow Trigger Update
-- Migration: 20260630000002_invite_flow.sql
-- Updates handle_new_user to seed role from invite metadata so that
-- profiles.role is set at account creation time for invited candidates.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  initial_state auth_state_enum;
  seeded_role   TEXT;
BEGIN
  -- Read role seeded by inviteUserByEmail({ data: { role: 'candidate' } })
  seeded_role := NEW.raw_user_meta_data->>'role';

  -- OAuth providers (Google etc.) set email_confirmed_at at creation time,
  -- so handle_email_verified never fires for them. Start at VERIFIED_NO_ROLE.
  -- Invited users (via inviteUserByEmail) have no email_confirmed_at yet
  -- but carry a candidate_profile_id in metadata → start at INVITED.
  IF NEW.email_confirmed_at IS NOT NULL THEN
    initial_state := 'VERIFIED_NO_ROLE';
  ELSIF NEW.raw_user_meta_data ? 'candidate_profile_id' THEN
    initial_state := 'INVITED';
  ELSE
    initial_state := 'UNVERIFIED';
  END IF;

  INSERT INTO public.profiles (id, email, auth_state, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', ''),
    initial_state,
    CASE
      WHEN seeded_role IN ('candidate', 'employer', 'admin') THEN seeded_role
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
