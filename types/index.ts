export type {
  AuthStateEnum,
  UserRole,
  CandidateRoleEnum,
  DataSourceEnum,
  SwipeActionEnum,
  MatchStatusEnum,
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
} from '@/lib/supabase/types'

export type { AuthState, ProfileSnapshot } from '@/lib/auth/machine'

/** Convenience alias for the profiles row */
export type Profile = import('@/lib/supabase/types').Tables<'profiles'>
