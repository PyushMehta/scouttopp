import { createClient }        from '@/lib/supabase/server'
import { createServiceClient }  from '@/lib/supabase/server'
import { redirect }             from 'next/navigation'
import { ProfileForm }          from '@/components/dashboard/candidate/profile-form'
import { RolesEditor }          from '@/components/dashboard/candidate/roles-editor'
import { ROUTES }               from '@/constants'

export const metadata = { title: 'Edit Profile | ScouttOpp' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.auth.login)

  const service = createServiceClient()

  // Verify role + approval state
  const { data: profile } = await service
    .from('profiles')
    .select('role, auth_state')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'candidate' || profile?.auth_state !== 'APPROVED') {
    redirect(ROUTES.auth.login)
  }

  // Fetch candidate profile
  const { data: candidateProfile, error } = await service
    .from('candidate_profiles')
    .select('id, full_name, pronouns, bio, primary_role, years_experience, location_city, location_country, timezone, phone, portfolio_url, linkedin_url, instagram_url, website_url, resume_url, avatar_url')
    .eq('user_id', user.id)
    .single()

  if (error || !candidateProfile) redirect(ROUTES.auth.login)

  // Fetch existing roles (after we have the profile id)
  const { data: candidateRoles } = await service
    .from('candidate_roles')
    .select('id, role_name, is_primary, sort_order')
    .eq('candidate_id', candidateProfile.id)
    .order('sort_order')
    .order('created_at')

  return (
    <div className="px-6 lg:px-8 py-6 lg:py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Edit profile</h1>
        <p className="mt-1 text-sm text-muted">
          Changes are saved to your profile immediately — employers won't see drafts.
        </p>
      </div>

      <div className="space-y-5">
        <ProfileForm profile={candidateProfile} />
        <RolesEditor initialRoles={candidateRoles ?? []} />
      </div>
    </div>
  )
}
