import { createClient }        from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { redirect }            from 'next/navigation'
import { AccountSettings }     from '@/components/dashboard/candidate/account-settings'
import { PreferencesForm }     from '@/components/dashboard/candidate/preferences-form'
import { VisibilitySection }   from '@/components/dashboard/candidate/visibility-section'
import { DangerZone }          from '@/components/dashboard/candidate/danger-zone'
import { ROUTES }              from '@/constants'

export const metadata = { title: 'Settings | ScouttOpp' }

const DEFAULT_PREFERENCES = {
  open_to_remote:     true,
  open_to_onsite:     false,
  open_to_hybrid:     true,
  open_to_contract:   true,
  open_to_fulltime:   false,
  rate_min_hourly:    null,
  rate_max_hourly:    null,
  available_from:     null,
  notice_period_days: null,
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.auth.login)

  const service = createServiceClient()

  const { data: profile } = await service
    .from('profiles')
    .select('role, auth_state')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'candidate' || profile?.auth_state !== 'APPROVED') {
    redirect(ROUTES.auth.login)
  }

  const { data: candidateProfile } = await service
    .from('candidate_profiles')
    .select('id, discovery_paused')
    .eq('user_id', user.id)
    .single()

  if (!candidateProfile) redirect(ROUTES.auth.login)

  const { data: preferencesRow } = await service
    .from('candidate_preferences')
    .select('*')
    .eq('candidate_id', candidateProfile.id)
    .maybeSingle()

  const preferences = preferencesRow ?? DEFAULT_PREFERENCES

  return (
    <div className="px-6 lg:px-8 py-6 lg:py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your account, preferences, and visibility.</p>
      </div>

      <div className="space-y-5">
        <AccountSettings email={user.email ?? ''} provider={user.app_metadata?.provider ?? 'email'} />
        <PreferencesForm preferences={preferences} />
        <VisibilitySection initialPaused={candidateProfile.discovery_paused} />
        <DangerZone />
      </div>
    </div>
  )
}
