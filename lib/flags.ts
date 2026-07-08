/**
 * Runtime feature flags.
 *
 * EMPLOYER_ENABLED — set NEXT_PUBLIC_EMPLOYER_ENABLED=true to re-enable the
 * employer dashboard, discovery APIs, and employer sign-up flow.
 * Default: false (Candidate Beta launch).
 */
export const EMPLOYER_ENABLED =
  process.env.NEXT_PUBLIC_EMPLOYER_ENABLED === 'true'
