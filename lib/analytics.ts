import posthog from 'posthog-js'

export const analytics = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  identify(userId: string, traits?: Record<string, unknown>) {
    posthog.identify(userId, traits)
  },

  reset() {
    posthog.reset()
  },

  signUp(role: 'candidate' | 'employer') {
    posthog.capture('sign_up', { role })
  },

  signIn(role: 'candidate' | 'employer') {
    posthog.capture('sign_in', { role })
  },

  signOut() {
    posthog.capture('sign_out')
  },

  // ── Marketing ─────────────────────────────────────────────────────────────
  ctaClicked(location: string) {
    posthog.capture('marketing_cta_clicked', { location })
  },

  // ── Candidate profile ─────────────────────────────────────────────────────
  profileUpdated(section: string) {
    posthog.capture('candidate_profile_updated', { section })
  },

  portfolioItemAdded(mediaType: string) {
    posthog.capture('candidate_portfolio_item_added', { media_type: mediaType })
  },

  portfolioItemDeleted() {
    posthog.capture('candidate_portfolio_item_deleted')
  },

  portfolioLinkAdded(platform: string) {
    posthog.capture('candidate_portfolio_link_added', { platform })
  },

  roleAdded() {
    posthog.capture('candidate_role_added')
  },

  avatarUploaded() {
    posthog.capture('candidate_avatar_uploaded')
  },

  discoveryToggled(enabled: boolean) {
    posthog.capture('candidate_discovery_toggled', { enabled })
  },

  // ── Employer discovery ────────────────────────────────────────────────────
  candidateScouted() {
    posthog.capture('employer_candidate_scouted')
  },

  candidatePassed(passType: 'temporary' | 'forever') {
    posthog.capture('employer_candidate_passed', { pass_type: passType })
  },

  candidateUnsaved() {
    posthog.capture('employer_candidate_unsaved')
  },

  candidateProfileOpened() {
    posthog.capture('employer_candidate_profile_opened')
  },

  noteAdded() {
    posthog.capture('employer_note_added')
  },

  filterApplied(filters: Record<string, unknown>) {
    posthog.capture('employer_filter_applied', filters)
  },

  scoutModeStarted() {
    posthog.capture('employer_scout_mode_started')
  },

  undoAction() {
    posthog.capture('employer_undo_action')
  },
}
