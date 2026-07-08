import { redirect }            from 'next/navigation'
import { createClient }        from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { CompanyForm }         from '@/components/dashboard/employer/company-form'
import { HiringForm }          from '@/components/dashboard/employer/hiring-form'
import { ROUTES }              from '@/constants'

export const metadata = { title: 'Company Profile | ScouttOpp' }

export default async function EmployerProfilePage() {
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

  const { data: employer, error } = await service
    .from('employer_profiles')
    .select('id, company_name, bio, industry, company_size, company_url, linkedin_url, founded_year, location_city, location_country, logo_url')
    .eq('user_id', user.id)
    .single()

  if (error || !employer) redirect(ROUTES.auth.login)

  const { data: hiring } = await service
    .from('employer_hiring_profiles')
    .select('typically_hires, contract_preferred, fulltime_preferred, remote_ok, onsite_ok, budget_min_hourly, budget_max_hourly, hiring_urgency')
    .eq('employer_id', employer.id)
    .maybeSingle()

  const logoSignedUrl = employer.logo_url
    ? (await service.storage.from('avatars').createSignedUrl(employer.logo_url, 3600)).data?.signedUrl ?? null
    : null

  return (
    <div className="px-6 lg:px-8 py-6 lg:py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Company profile</h1>
        <p className="mt-1 text-sm text-muted">
          Your company details and hiring preferences. Visible to candidates once matching launches.
        </p>
      </div>

      <div className="space-y-10">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted/60 mb-4">Company information</h2>
          <CompanyForm profile={employer} logoSignedUrl={logoSignedUrl} />
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted/60 mb-4">Hiring preferences</h2>
          <HiringForm hiring={hiring ?? null} />
        </div>
      </div>
    </div>
  )
}
