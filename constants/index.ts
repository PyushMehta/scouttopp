export const APP_NAME    = 'ScouttOpp'

/**
 * Preset creative roles. Stored as TEXT in candidate_roles.role_name.
 * Candidates may also enter a custom role not in this list.
 */
export const PRESET_ROLES = [
  'UI/UX Designer',
  'Graphic Designer',
  'Brand Designer',
  'Motion Designer',
  'Video Editor',
  'Photographer',
  'Illustrator',
  'Copywriter',
  'Social Media Designer',
  'Frontend Developer',
  'Product Designer',
  'Animator',
  '3D Artist',
  'Creative Director',
  'Marketing Designer',
] as const

export type PresetRole = typeof PRESET_ROLES[number]

/**
 * Minimum profile_completeness score (0–100) required for a candidate
 * to appear in the employer discovery feed.
 * Set to 0 during development. Raise to 60 before production launch.
 */
export const MIN_DISCOVERY_COMPLETENESS = 0
export const APP_URL     = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
export const SUPPORT_EMAIL = 'support@scouttopp.com'

/** Seconds before the resend-email button re-enables */
export const RESEND_COOLDOWN_SECONDS = 60

/** Maximum portfolio items a candidate can upload */
export const MAX_PORTFOLIO_ITEMS = 12

/** Maximum specialties a candidate can list */
export const MAX_SPECIALTIES = 10

/** The Supabase auth callback path — must be whitelisted in Supabase redirect URLs */
export const AUTH_CALLBACK_PATH = '/api/auth/callback'

export const ROUTES = {
  root: '/',
  auth: {
    login:          '/auth/login',
    signup:         '/auth/signup',
    verifyEmail:    '/auth/verify-email',
    confirm:        '/auth/confirm',
    roleSelect:     '/auth/role-select',
    forgotPassword: '/auth/forgot-password',
    resetPassword:  '/auth/reset-password',
    pending:        '/auth/pending',
    rejected:       '/auth/rejected',
    suspended:      '/auth/suspended',
  },
  dashboard: {
    candidate: '/dashboard/candidate',
    employer:  '/dashboard/employer',
    admin:     '/dashboard/admin',
  },
  onboarding: '/onboarding',
  api: {
    authCallback:    '/api/auth/callback',
    inviteValidate:  '/api/invite/validate',
    authRole:        '/api/auth/role',
    syncRun:         '/api/sync/run',
    syncStatus:      '/api/sync/status',
    adminCandidates: '/api/admin/candidates',
    adminUsers:      '/api/admin/users',
  },
} as const
