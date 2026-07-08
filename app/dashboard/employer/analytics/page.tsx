import { redirect }            from 'next/navigation'
import { createClient }        from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { BarChart3, Users2, Heart, Eye, Zap } from 'lucide-react'
import { EmployerPageHeader }  from '@/components/dashboard/employer/employer-page-header'
import { EmployerStatCard }    from '@/components/dashboard/employer/employer-stat-card'
import { ROUTES }              from '@/constants'

export const metadata = { title: 'Analytics | ScouttOpp' }

/* ─── Mock bar chart ────────────────────────────────────────────────────── */

const BAR_HEIGHTS = [30, 55, 40, 70, 45, 80, 35, 65, 50, 75, 42, 68]
const MONTHS      = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default async function EmployerAnalyticsPage() {
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

  return (
    <div className="px-6 lg:px-8 py-6 lg:py-8 max-w-5xl">
      <EmployerPageHeader
        title="Analytics"
        subtitle="Activity data will become available once candidate discovery launches."
        badge={
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
            style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA' }}
          >
            Coming Soon
          </span>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <EmployerStatCard
          label="Candidates in pool"
          value="—"
          icon={Users2}
          description="Total discoverable candidates"
          comingSoon
        />
        <EmployerStatCard
          label="Profile views"
          value="—"
          icon={Eye}
          description="How many candidates viewed your profile"
          comingSoon
          iconColor="#10B981"
          iconBg="rgba(16,185,129,0.1)"
        />
        <EmployerStatCard
          label="Matches made"
          value="—"
          icon={Heart}
          description="Mutual connections this month"
          comingSoon
          iconColor="#F59E0B"
          iconBg="rgba(245,158,11,0.1)"
        />
        <EmployerStatCard
          label="Response rate"
          value="—"
          icon={Zap}
          description="Candidates who responded to matches"
          comingSoon
          iconColor="#3B82F6"
          iconBg="rgba(59,130,246,0.1)"
        />
      </div>

      {/* Placeholder chart */}
      <div className="rounded-2xl border border-border bg-card px-6 py-5 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Activity overview</h2>
            <p className="text-xs text-muted mt-0.5">Profile views &amp; matches per month</p>
          </div>
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
            style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA' }}
          >
            Coming Soon
          </span>
        </div>

        {/* Bar chart placeholder */}
        <div className="relative">
          <div className="flex items-end gap-1.5 h-36 mb-2" aria-hidden="true">
            {BAR_HEIGHTS.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end">
                <div
                  className="rounded-t-sm w-full opacity-15"
                  style={{ height: `${h}%`, background: 'linear-gradient(to top, #7C3AED, #A78BFA)' }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-1.5">
            {MONTHS.map(m => (
              <div key={m} className="flex-1 text-center text-[9px] text-muted/40 font-medium">{m}</div>
            ))}
          </div>

          {/* Overlay message */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="rounded-xl border px-4 py-2.5 text-center"
              style={{ borderColor: 'rgba(124,58,237,0.2)', background: 'rgba(10,10,10,0.85)' }}
            >
              <BarChart3 size={20} style={{ color: '#A78BFA' }} className="mx-auto mb-1.5" aria-hidden="true" />
              <p className="text-xs font-semibold text-foreground">Launches with candidate discovery</p>
              <p className="text-[10px] text-muted mt-0.5">Data will populate automatically</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two secondary placeholders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card px-6 py-5">
          <h2 className="text-sm font-semibold text-foreground mb-1">Top candidate roles</h2>
          <p className="text-xs text-muted mb-4">Roles of candidates who viewed your profile</p>
          <div className="space-y-2.5">
            {['Motion Designer', 'Brand Designer', 'UX Designer', 'Art Director'].map(role => (
              <div key={role} className="flex items-center gap-3">
                <span className="text-xs text-muted w-32 shrink-0">{role}</span>
                <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
                  <div className="h-full rounded-full opacity-20" style={{ width: '60%', background: '#7C3AED' }} />
                </div>
                <span className="text-xs text-muted/40 tabular-nums w-6 text-right">—</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card px-6 py-5">
          <h2 className="text-sm font-semibold text-foreground mb-1">Engagement funnel</h2>
          <p className="text-xs text-muted mb-4">How candidates interact with your company</p>
          <div className="space-y-3">
            {[
              { label: 'Profile impressions', pct: 100 },
              { label: 'Profile views',        pct: 60 },
              { label: 'Swipe likes received', pct: 35 },
              { label: 'Matches',              pct: 18 },
            ].map(({ label, pct }) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-muted">{label}</span>
                  <span className="text-xs text-muted/40 tabular-nums">—</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                  <div
                    className="h-full rounded-full opacity-15"
                    style={{ width: `${pct}%`, background: 'linear-gradient(to right, #7C3AED, #A78BFA)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
