import { redirect }            from 'next/navigation'
import { createClient }        from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Bell, Heart, Users2, MessageSquare, Zap, CheckCircle2 } from 'lucide-react'
import { EmployerPageHeader }  from '@/components/dashboard/employer/employer-page-header'
import { ROUTES }              from '@/constants'

export const metadata = { title: 'Notifications | ScouttOpp' }

const NOTIFICATION_TYPES = [
  {
    icon: Heart,
    label: 'New match',
    description: 'When a candidate matches with your company after discovery launches.',
    iconColor: '#F59E0B',
    iconBg:    'rgba(245,158,11,0.1)',
  },
  {
    icon: MessageSquare,
    label: 'New message',
    description: 'When a matched candidate sends you a message.',
    iconColor: '#3B82F6',
    iconBg:    'rgba(59,130,246,0.1)',
  },
  {
    icon: Users2,
    label: 'Candidate activity',
    description: 'When candidates you saved update their profiles.',
    iconColor: '#10B981',
    iconBg:    'rgba(16,185,129,0.1)',
  },
  {
    icon: Zap,
    label: 'Platform updates',
    description: 'Feature launches and product announcements from ScouttOpp.',
    iconColor: '#A78BFA',
    iconBg:    'rgba(124,58,237,0.1)',
  },
]

export default async function EmployerNotificationsPage() {
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
    <div className="px-6 lg:px-8 py-6 lg:py-8 max-w-2xl">
      <EmployerPageHeader
        title="Notifications"
        subtitle="You have no notifications yet. Here's what you'll hear about when features launch."
      />

      {/* Empty state */}
      <div className="rounded-2xl border border-border bg-card px-6 py-10 flex flex-col items-center text-center mb-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(124,58,237,0.1)' }}
          aria-hidden="true"
        >
          <Bell size={24} strokeWidth={1.5} style={{ color: '#A78BFA' }} />
        </div>
        <h2 className="text-base font-bold text-foreground mb-1.5">All caught up</h2>
        <p className="text-sm text-muted max-w-xs leading-relaxed">
          Notifications will appear here as you match with candidates and receive messages.
        </p>
      </div>

      {/* Upcoming notification types */}
      <div className="rounded-2xl border border-border bg-card px-6 py-5">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-semibold text-foreground">You&rsquo;ll be notified when</h2>
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
            style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA' }}
          >
            Coming Soon
          </span>
        </div>
        <div className="space-y-4">
          {NOTIFICATION_TYPES.map(({ icon: Icon, label, description, iconColor, iconBg }) => (
            <div key={label} className="flex items-start gap-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: iconBg }}
                aria-hidden="true"
              >
                <Icon size={15} style={{ color: iconColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted mt-0.5 leading-relaxed">{description}</p>
              </div>
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-1"
                style={{ borderColor: 'rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.06)' }}
                aria-label="Coming soon"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notification preferences hint */}
      <div
        className="mt-4 rounded-2xl border px-5 py-4 flex items-center gap-3"
        style={{ borderColor: 'rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.04)' }}
      >
        <CheckCircle2 size={16} className="text-success shrink-0" aria-hidden="true" />
        <p className="text-xs text-muted leading-relaxed">
          Manage your notification preferences in{' '}
          <a href="/dashboard/employer/settings" className="font-medium text-foreground hover:underline">
            Settings → Notifications
          </a>
          .
        </p>
      </div>
    </div>
  )
}
