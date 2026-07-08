import { redirect }           from 'next/navigation'
import { Suspense }            from 'react'
import { createClient }        from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { ScoutMode }           from '@/components/discovery/scout-mode'
import { Skeleton }            from '@/components/ui/skeleton'
import { ROUTES }              from '@/constants'
import type { DiscoveryFilters } from '@/components/discovery/filter-panel'

export const metadata = { title: 'Scout Talent | ScouttOpp' }

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function parseFilters(params: Record<string, string | string[] | undefined>): DiscoveryFilters {
  const str  = (k: string) => typeof params[k] === 'string' ? (params[k] as string) : ''
  const arr  = (k: string) => str(k).split(',').filter(Boolean)
  const bool = (k: string) => str(k) === '1'

  return {
    q:                str('q'),
    role:             arr('role'),
    skills:           arr('skills'),
    location_country: str('location_country'),
    location_city:    str('location_city'),
    remote:           bool('remote'),
    hybrid:           bool('hybrid'),
    onsite:           bool('onsite'),
    contract:         bool('contract'),
    fulltime:         bool('fulltime'),
    rate_max:         str('rate_max'),
    exp_min:          str('exp_min'),
    exp_max:          str('exp_max'),
    available_now:    bool('available_now'),
    has_portfolio:    bool('has_portfolio'),
  }
}

function ScoutModeSkeleton() {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <Skeleton width={80} height={80} rounded="xl" />
      <div className="flex flex-col items-center gap-2">
        <Skeleton width={180} height={28} />
        <Skeleton width={260} height={14} />
      </div>
      <div className="grid grid-cols-3 gap-3 w-72">
        {[0, 1, 2].map(i => <Skeleton key={i} height={80} rounded="xl" />)}
      </div>
      <div className="flex flex-col gap-2 w-72">
        <Skeleton height={48} rounded="xl" />
        <Skeleton height={40} rounded="xl" />
      </div>
    </div>
  )
}

export default async function EmployerCandidatesPage({ searchParams }: PageProps) {
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

  const params         = await searchParams
  const initialFilters = parseFilters(params)

  return (
    <div className="px-5 lg:px-6 py-6 h-full overflow-y-auto">
      <Suspense fallback={<ScoutModeSkeleton />}>
        <ScoutMode initialFilters={initialFilters} />
      </Suspense>
    </div>
  )
}
