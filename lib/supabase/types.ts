/**
 * Hand-authored database types matching the schema in supabase/migrations/.
 * Replace this file by running: supabase gen types typescript --project-id <ref> > lib/supabase/types.ts
 */

export type AuthStateEnum =
  | 'UNVERIFIED'
  | 'VERIFIED_NO_ROLE'
  | 'ONBOARDING'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'INVITED'

export type CandidateRoleEnum =
  | 'motion_designer'
  | 'graphic_designer'
  | 'ux_designer'
  | 'brand_designer'
  | 'illustrator'
  | 'photographer'
  | 'videographer'
  | 'creative_director'
  | 'art_director'
  | 'copywriter'
  | 'social_media'
  | 'other'

export type DataSourceEnum = 'google_sheets_sync' | 'native_onboarding'
export type SwipeActionEnum = 'like' | 'pass' | 'super_like' | 'scout'
export type MatchStatusEnum = 'pending' | 'active' | 'closed'
export type UserRole = 'candidate' | 'employer' | 'admin'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: UserRole | null
          auth_state: AuthStateEnum
          invite_code_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: UserRole | null
          auth_state?: AuthStateEnum
          invite_code_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: UserRole | null
          auth_state?: AuthStateEnum
          invite_code_id?: string | null
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: 'profiles_id_fkey'; columns: ['id']; referencedRelation: 'users'; referencedColumns: ['id'] },
          { foreignKeyName: 'profiles_invite_code_id_fkey'; columns: ['invite_code_id']; referencedRelation: 'invite_codes'; referencedColumns: ['id'] }
        ]
      }
      invite_codes: {
        Row: {
          id: string
          code: string
          role: UserRole
          max_uses: number
          uses: number
          expires_at: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          role: UserRole
          max_uses?: number
          uses?: number
          expires_at?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          code?: string
          role?: UserRole
          max_uses?: number
          uses?: number
          expires_at?: string | null
        }
        Relationships: []
      }
      candidate_sync_staging: {
        Row: {
          id: string
          sync_run_id: string
          google_sheets_row: number
          raw_data: Record<string, unknown>
          mapped_data: Record<string, unknown> | null
          status: 'pending' | 'promoted' | 'rejected' | 'duplicate' | 'error'
          candidate_profile_id: string | null
          error_message: string | null
          created_at: string
          promoted_at: string | null
        }
        Insert: {
          id?: string
          sync_run_id: string
          google_sheets_row: number
          raw_data: Record<string, unknown>
          mapped_data?: Record<string, unknown> | null
          status?: 'pending' | 'promoted' | 'rejected' | 'duplicate' | 'error'
          candidate_profile_id?: string | null
          error_message?: string | null
          created_at?: string
          promoted_at?: string | null
        }
        Update: {
          mapped_data?: Record<string, unknown> | null
          status?: 'pending' | 'promoted' | 'rejected' | 'duplicate' | 'error'
          candidate_profile_id?: string | null
          error_message?: string | null
          promoted_at?: string | null
        }
        Relationships: [
          { foreignKeyName: 'candidate_sync_staging_sync_run_id_fkey'; columns: ['sync_run_id']; referencedRelation: 'sync_runs'; referencedColumns: ['id'] }
        ]
      }
      sync_runs: {
        Row: {
          id: string
          triggered_by: string | null
          status: 'running' | 'complete' | 'failed' | 'partial'
          rows_fetched: number | null
          rows_promoted: number | null
          rows_skipped: number | null
          rows_errored: number | null
          error_message: string | null
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          triggered_by?: string | null
          status?: 'running' | 'complete' | 'failed' | 'partial'
          rows_fetched?: number | null
          rows_promoted?: number | null
          rows_skipped?: number | null
          rows_errored?: number | null
          error_message?: string | null
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          status?: 'running' | 'complete' | 'failed' | 'partial'
          rows_fetched?: number | null
          rows_promoted?: number | null
          rows_skipped?: number | null
          rows_errored?: number | null
          error_message?: string | null
          completed_at?: string | null
        }
        Relationships: []
      }
      candidate_profiles: {
        Row: {
          id: string
          user_id: string | null
          data_source: DataSourceEnum
          full_name: string
          email: string
          phone: string | null
          location_city: string | null
          location_country: string | null
          timezone: string | null
          pronouns: string | null
          bio: string | null
          avatar_url: string | null
          primary_role: string | null
          years_experience: number | null
          portfolio_url: string | null
          linkedin_url: string | null
          instagram_url: string | null
          website_url: string | null
          resume_url: string | null
          is_discoverable: boolean
          discovery_paused: boolean
          discovery_score: number | null
          profile_completeness: number
          approved_by: string | null
          approved_at: string | null
          rejected_by: string | null
          rejected_at: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          data_source?: DataSourceEnum
          full_name: string
          email: string
          phone?: string | null
          location_city?: string | null
          location_country?: string | null
          timezone?: string | null
          pronouns?: string | null
          bio?: string | null
          avatar_url?: string | null
          primary_role?: string | null
          years_experience?: number | null
          portfolio_url?: string | null
          linkedin_url?: string | null
          instagram_url?: string | null
          website_url?: string | null
          resume_url?: string | null
          is_discoverable?: boolean
          discovery_paused?: boolean
          discovery_score?: number | null
          profile_completeness?: number
          approved_by?: string | null
          approved_at?: string | null
          rejected_by?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
        }
        Update: {
          user_id?: string | null
          full_name?: string
          email?: string
          phone?: string | null
          location_city?: string | null
          location_country?: string | null
          timezone?: string | null
          pronouns?: string | null
          bio?: string | null
          avatar_url?: string | null
          primary_role?: string | null
          years_experience?: number | null
          portfolio_url?: string | null
          linkedin_url?: string | null
          instagram_url?: string | null
          website_url?: string | null
          resume_url?: string | null
          is_discoverable?: boolean
          discovery_paused?: boolean
          discovery_score?: number | null
          profile_completeness?: number
          approved_by?: string | null
          approved_at?: string | null
          rejected_by?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      candidate_roles: {
        Row: {
          id:           string
          candidate_id: string
          role_name:    string
          is_primary:   boolean
          sort_order:   number
          created_at:   string
        }
        Insert: {
          id?:          string
          candidate_id: string
          role_name:    string
          is_primary?:  boolean
          sort_order?:  number
          created_at?:  string
        }
        Update: {
          role_name?:  string
          is_primary?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      candidate_portfolio_links: {
        Row: {
          id:           string
          candidate_id: string
          platform:     'behance' | 'dribbble' | 'website' | 'instagram' | 'youtube' | 'vimeo' | 'github' | 'pdf' | 'other'
          url:          string
          label:        string | null
          sort_order:   number
          created_at:   string
        }
        Insert: {
          id?:          string
          candidate_id: string
          platform:     'behance' | 'dribbble' | 'website' | 'instagram' | 'youtube' | 'vimeo' | 'github' | 'pdf' | 'other'
          url:          string
          label?:       string | null
          sort_order?:  number
          created_at?:  string
        }
        Update: {
          platform?:   'behance' | 'dribbble' | 'website' | 'instagram' | 'youtube' | 'vimeo' | 'github' | 'pdf' | 'other'
          url?:        string
          label?:      string | null
          sort_order?: number
        }
        Relationships: []
      }
      candidate_specialties: {
        Row: {
          id: string
          candidate_id: string
          name: string
          level: 'beginner' | 'intermediate' | 'expert' | null
          created_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          name: string
          level?: 'beginner' | 'intermediate' | 'expert' | null
        }
        Update: {
          name?: string
          level?: 'beginner' | 'intermediate' | 'expert' | null
        }
        Relationships: [
          { foreignKeyName: 'candidate_specialties_candidate_id_fkey'; columns: ['candidate_id']; referencedRelation: 'candidate_profiles'; referencedColumns: ['id'] }
        ]
      }
      candidate_portfolio_items: {
        Row: {
          id: string
          candidate_id: string
          title: string
          description: string | null
          media_url: string
          media_type: 'image' | 'video' | 'link' | 'pdf' | null
          thumbnail_url: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          title: string
          description?: string | null
          media_url: string
          media_type?: 'image' | 'video' | 'link' | 'pdf' | null
          thumbnail_url?: string | null
          sort_order?: number
        }
        Update: {
          title?: string
          description?: string | null
          media_url?: string
          media_type?: 'image' | 'video' | 'link' | 'pdf' | null
          thumbnail_url?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      candidate_preferences: {
        Row: {
          id: string
          candidate_id: string
          open_to_remote: boolean
          open_to_onsite: boolean
          open_to_hybrid: boolean
          open_to_contract: boolean
          open_to_fulltime: boolean
          rate_min_hourly: number | null
          rate_max_hourly: number | null
          available_from: string | null
          notice_period_days: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          open_to_remote?: boolean
          open_to_onsite?: boolean
          open_to_hybrid?: boolean
          open_to_contract?: boolean
          open_to_fulltime?: boolean
          rate_min_hourly?: number | null
          rate_max_hourly?: number | null
          available_from?: string | null
          notice_period_days?: number | null
        }
        Update: {
          open_to_remote?: boolean
          open_to_onsite?: boolean
          open_to_hybrid?: boolean
          open_to_contract?: boolean
          open_to_fulltime?: boolean
          rate_min_hourly?: number | null
          rate_max_hourly?: number | null
          available_from?: string | null
          notice_period_days?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      employer_profiles: {
        Row: {
          id: string
          user_id: string
          company_name: string
          company_size: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null
          industry: string | null
          company_url: string | null
          linkedin_url: string | null
          logo_url: string | null
          bio: string | null
          location_city: string | null
          location_country: string | null
          founded_year: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null
          industry?: string | null
          company_url?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          bio?: string | null
          location_city?: string | null
          location_country?: string | null
          founded_year?: number | null
        }
        Update: {
          company_name?: string
          company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null
          industry?: string | null
          company_url?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          bio?: string | null
          location_city?: string | null
          location_country?: string | null
          founded_year?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      employer_hiring_profiles: {
        Row: {
          id: string
          employer_id: string
          typically_hires: CandidateRoleEnum[] | null
          contract_preferred: boolean | null
          fulltime_preferred: boolean | null
          remote_ok: boolean | null
          onsite_ok: boolean | null
          budget_min_hourly: number | null
          budget_max_hourly: number | null
          hiring_urgency: 'immediately' | 'within_month' | 'within_quarter' | 'exploring' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employer_id: string
          typically_hires?: CandidateRoleEnum[] | null
          contract_preferred?: boolean | null
          fulltime_preferred?: boolean | null
          remote_ok?: boolean | null
          onsite_ok?: boolean | null
          budget_min_hourly?: number | null
          budget_max_hourly?: number | null
          hiring_urgency?: 'immediately' | 'within_month' | 'within_quarter' | 'exploring' | null
        }
        Update: {
          typically_hires?: CandidateRoleEnum[] | null
          contract_preferred?: boolean | null
          fulltime_preferred?: boolean | null
          remote_ok?: boolean | null
          onsite_ok?: boolean | null
          budget_min_hourly?: number | null
          budget_max_hourly?: number | null
          hiring_urgency?: 'immediately' | 'within_month' | 'within_quarter' | 'exploring' | null
          updated_at?: string
        }
        Relationships: []
      }
      employer_showcase_items: {
        Row: {
          id: string
          employer_id: string
          title: string
          media_url: string
          media_type: 'image' | 'video' | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          employer_id: string
          title: string
          media_url: string
          media_type?: 'image' | 'video' | null
          sort_order?: number
        }
        Update: {
          title?: string
          media_url?: string
          media_type?: 'image' | 'video' | null
          sort_order?: number
        }
        Relationships: []
      }
      employer_preferences: {
        Row: {
          id: string
          employer_id: string
          notify_new_match: boolean
          notify_email: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employer_id: string
          notify_new_match?: boolean
          notify_email?: boolean
        }
        Update: {
          notify_new_match?: boolean
          notify_email?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      employer_saved_candidates: {
        Row: {
          id:           string
          employer_id:  string
          candidate_id: string
          saved_at:     string
        }
        Insert: {
          id?:          string
          employer_id:  string
          candidate_id: string
          saved_at?:    string
        }
        Update: {
          saved_at?: string
        }
        Relationships: []
      }
      employer_passed_candidates: {
        Row: {
          id:                    string
          employer_id:           string
          candidate_id:          string
          passed_at:             string
          pass_type:             'temporary' | 'forever'
          expires_at:            string | null
          candidate_updated_at:  string | null
        }
        Insert: {
          id?:                   string
          employer_id:           string
          candidate_id:          string
          passed_at?:            string
          pass_type?:            'temporary' | 'forever'
          expires_at?:           string | null
          candidate_updated_at?: string | null
        }
        Update: {
          pass_type?:            'temporary' | 'forever'
          expires_at?:           string | null
          candidate_updated_at?: string | null
        }
        Relationships: []
      }
      candidate_views: {
        Row: {
          id:           string
          employer_id:  string
          candidate_id: string
          viewed_at:    string
        }
        Insert: {
          id?:          string
          employer_id:  string
          candidate_id: string
          viewed_at?:   string
        }
        Update: {
          viewed_at?: string
        }
        Relationships: []
      }
      candidate_notes: {
        Row: {
          id:           string
          employer_id:  string
          candidate_id: string
          note:         string
          created_at:   string
          updated_at:   string
        }
        Insert: {
          id?:          string
          employer_id:  string
          candidate_id: string
          note?:        string
          created_at?:  string
          updated_at?:  string
        }
        Update: {
          note?:      string
          updated_at?: string
        }
        Relationships: []
      }
      swipe_actions: {
        Row: {
          id: string
          employer_id: string
          candidate_id: string
          action: SwipeActionEnum
          created_at: string
        }
        Insert: {
          id?: string
          employer_id: string
          candidate_id: string
          action: SwipeActionEnum
        }
        Update: {
          action?: SwipeActionEnum
        }
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          employer_id: string
          candidate_id: string
          status: MatchStatusEnum
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employer_id: string
          candidate_id: string
          status?: MatchStatusEnum
        }
        Update: {
          status?: MatchStatusEnum
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      auth_state_enum: AuthStateEnum
      candidate_role_enum: CandidateRoleEnum
      data_source_enum: DataSourceEnum
      swipe_action_enum: SwipeActionEnum
      match_status_enum: MatchStatusEnum
    }
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
