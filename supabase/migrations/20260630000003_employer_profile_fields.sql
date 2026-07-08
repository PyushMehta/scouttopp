-- =============================================================================
-- ScouttOpp — Employer Profile Extended Fields
-- Migration: 20260630000003_employer_profile_fields.sql
-- Adds linkedin_url and founded_year to employer_profiles.
-- Idempotent: uses ADD COLUMN IF NOT EXISTS.
-- =============================================================================

ALTER TABLE employer_profiles
  ADD COLUMN IF NOT EXISTS linkedin_url  TEXT,
  ADD COLUMN IF NOT EXISTS founded_year  SMALLINT;
