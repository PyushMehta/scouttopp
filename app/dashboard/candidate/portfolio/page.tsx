import { createClient }        from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { redirect }            from 'next/navigation'
import { PortfolioGrid }       from '@/components/dashboard/candidate/portfolio-grid'
import { ROUTES }              from '@/constants'

export const metadata = { title: 'Portfolio | ScouttOpp' }

export default async function PortfolioPage() {
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
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!candidateProfile) redirect(ROUTES.auth.login)

  const { data: items } = await service
    .from('candidate_portfolio_items')
    .select('*')
    .eq('candidate_id', candidateProfile.id)
    .order('sort_order', { ascending: true })

  return (
    <div className="px-6 lg:px-8 py-6 lg:py-8 max-w-5xl">
      <PortfolioGrid initialItems={items ?? []} />
    </div>
  )
}
