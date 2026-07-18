import { redirect }               from 'next/navigation'
import { createClient }           from '@/lib/supabase/server'
import { createServiceClient }    from '@/lib/supabase/server'
import { AccountSettings }        from '@/components/dashboard/candidate/account-settings'
import { EmployerNotifications }  from '@/components/dashboard/employer/employer-notifications'
import { EmployerDangerZone }     from '@/components/dashboard/employer/employer-danger-zone'
import { ROUTES }                 from '@/constants'

export const metadata = { title: 'Settings | ScouttOpp' }

export default async function EmployerSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.auth.login)

  const service = createServiceClient()

  const { data: profile } = await service
    .from('profiles')
    .select('role, auth_state')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'employer' || profile?.auth_state !== 'APPROVED') {
    redirect(ROUTES.auth.login)
  }

  const { data: employer } = await service
    .from('employer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!employer) redirect(ROUTES.auth.login)

  const { data: prefsRow } = await service
    .from('employer_preferences')
    .select('notify_new_match, notify_email')
    .eq('employer_id', employer.id)
    .maybeSingle()

  const prefs = {
    notify_new_match: prefsRow?.notify_new_match ?? true,
    notify_email:     prefsRow?.notify_email     ?? true,
  }

  return (
    <div className="px-6 lg:px-8 py-6 lg:py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your account, notifications, and preferences.</p>
      </div>

      <div className="space-y-5">
        <AccountSettings email={user.email ?? ''} provider={user.app_metadata?.provider ?? 'email'} />
        <EmployerNotifications prefs={prefs} />
        <EmployerDangerZone />
      </div>
    </div>
  )
}
