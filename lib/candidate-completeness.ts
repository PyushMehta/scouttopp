/**
 * Candidate profile completeness checker.
 * Computes a 0–100 score based on how many key profile fields are filled.
 * Used to gate discovery visibility: only candidates with
 * score >= MIN_DISCOVERY_COMPLETENESS appear in the employer feed.
 *
 * Call updateCompleteness(candidateId) after any write to profile, roles,
 * specialties, portfolio items, portfolio links, or preferences.
 */

import { createServiceClient } from '@/lib/supabase/server'
import { MIN_DISCOVERY_COMPLETENESS } from '@/constants'

export { MIN_DISCOVERY_COMPLETENESS }

// ── Weights (must sum to 100) ────────────────────────────────────────────────
const WEIGHTS = {
  has_avatar:       15,  // avatar_url is set
  has_bio:          15,  // bio is >50 characters
  has_roles:        15,  // at least 1 entry in candidate_roles
  has_skills:       15,  // at least 3 entries in candidate_specialties
  has_portfolio:    20,  // at least 1 portfolio item OR 1 portfolio link
  has_location:     10,  // location_city AND location_country are set
  has_preferences:  10,  // candidate_preferences row exists
} as const

type ChecklistKey = keyof typeof WEIGHTS

export interface CompletenessResult {
  score:     number
  checklist: Record<ChecklistKey, boolean>
}

export async function computeCompleteness(candidateId: string): Promise<CompletenessResult> {
  const service = createServiceClient()

  const [
    { data: profile },
    { count: roleCount },
    { count: skillCount },
    { count: itemCount },
    { count: linkCount },
    { data: prefs },
  ] = await Promise.all([
    service
      .from('candidate_profiles')
      .select('avatar_url, bio, location_city, location_country')
      .eq('id', candidateId)
      .single(),
    service
      .from('candidate_roles')
      .select('*', { count: 'exact', head: true })
      .eq('candidate_id', candidateId),
    service
      .from('candidate_specialties')
      .select('*', { count: 'exact', head: true })
      .eq('candidate_id', candidateId),
    service
      .from('candidate_portfolio_items')
      .select('*', { count: 'exact', head: true })
      .eq('candidate_id', candidateId),
    service
      .from('candidate_portfolio_links')
      .select('*', { count: 'exact', head: true })
      .eq('candidate_id', candidateId),
    service
      .from('candidate_preferences')
      .select('candidate_id')
      .eq('candidate_id', candidateId)
      .maybeSingle(),
  ])

  const checklist: Record<ChecklistKey, boolean> = {
    has_avatar:      Boolean(profile?.avatar_url),
    has_bio:         Boolean(profile?.bio && profile.bio.length > 50),
    has_roles:       (roleCount ?? 0) > 0,
    has_skills:      (skillCount ?? 0) >= 3,
    has_portfolio:   (itemCount ?? 0) > 0 || (linkCount ?? 0) > 0,
    has_location:    Boolean(profile?.location_city && profile?.location_country),
    has_preferences: Boolean(prefs),
  }

  const score = (Object.keys(checklist) as ChecklistKey[]).reduce(
    (sum, key) => sum + (checklist[key] ? WEIGHTS[key] : 0),
    0,
  )

  return { score, checklist }
}

/** Recomputes and persists the completeness score for a candidate. Returns the new score. */
export async function updateCompleteness(candidateId: string): Promise<number> {
  const service = createServiceClient()
  const { score } = await computeCompleteness(candidateId)
  await service
    .from('candidate_profiles')
    .update({ profile_completeness: score })
    .eq('id', candidateId)
  return score
}

/** Returns true if the candidate's stored completeness meets the discovery threshold. */
export function meetsDiscoveryThreshold(score: number): boolean {
  return score >= MIN_DISCOVERY_COMPLETENESS
}
