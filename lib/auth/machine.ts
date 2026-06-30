import type { AuthStateEnum, UserRole } from '@/lib/supabase/types'

export type AuthState = AuthStateEnum

export const ALLOWED_TRANSITIONS: Record<AuthState, AuthState[]> = {
  UNVERIFIED:        ['VERIFIED_NO_ROLE'],
  VERIFIED_NO_ROLE:  ['ONBOARDING', 'PENDING_APPROVAL'],
  ONBOARDING:        ['PENDING_APPROVAL'],
  PENDING_APPROVAL:  ['APPROVED', 'REJECTED'],
  APPROVED:          ['SUSPENDED'],
  REJECTED:          [],
  SUSPENDED:         ['APPROVED'],
  INVITED:           ['VERIFIED_NO_ROLE'],
}

export function validateTransition(from: AuthState, to: AuthState): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
}

export const STATE_ROUTES: Record<AuthState, string> = {
  UNVERIFIED:        '/auth/verify-email',
  VERIFIED_NO_ROLE:  '/auth/role-select',
  ONBOARDING:        '/onboarding',
  PENDING_APPROVAL:  '/auth/pending',
  APPROVED:          '/dashboard',
  REJECTED:          '/auth/rejected',
  SUSPENDED:         '/auth/suspended',
  INVITED:           '/auth/role-select',
}

export interface ProfileSnapshot {
  auth_state: AuthState
  role: UserRole | null
}

export function getCanonicalRoute(profile: ProfileSnapshot): string {
  if (profile.auth_state !== 'APPROVED') {
    return STATE_ROUTES[profile.auth_state]
  }
  switch (profile.role) {
    case 'candidate': return '/dashboard/candidate'
    case 'employer':  return '/dashboard/employer'
    case 'admin':     return '/dashboard/admin'
    default:          return '/auth/role-select'
  }
}
