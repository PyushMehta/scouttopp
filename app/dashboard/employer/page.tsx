import Link                    from 'next/link'
import { redirect }            from 'next/navigation'
import { createClient }        from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  Building2, Settings, CheckCircle2, ChevronRight,
  Globe, Users, Heart, Search, MapPin, AlertCircle,
} from 'lucide-react'
import { Badge }  from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { ROUTES } from '@/constants'

export const metadata = { title: 'Dashboard | ScouttOpp' }

interface CompletionField {
  label: string
  done:  boolean
  href:  string
  icon:  React.ElementType
}

function calcCompletion(
  p:      Record<string, unknown>,
  hiring: Record<string, unknown> | null,
): CompletionField[] {
  return [
    { label: 'company name',       done: !!p.company_name,  href: '/dashboard/employer/profile', icon: Building2 },
    { label: 'company bio',        done: !!p.bio,            href: '/dashboard/employer/profile', icon: Building2 },
    { label: 'industry',           done: !!p.industry,       href: '/dashboard/employer/profile', icon: Building2 },
    { label: 'location',           done: !!(p.location_city || p.location_country), href: '/dashboard/employer/profile', icon: MapPin },
    { label: 'company website',    done: !!p.company_url,    href: '/dashboard/employer/profile', icon: Globe },
    { label: 'roles you hire for', done: !!(hiring?.typically_hires && (hiring.typically_hires as unknown[]).length > 0), href: '/dashboard/employer/profile', icon: Users },
    { label: 'hiring budget',      done: !!(hiring?.budget_min_hourly || hiring?.budget_max_hourly), href: '/dashboard/employer/profile', icon: Users },
  ]
}

export default async function EmployerDashboardPage() {
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
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!employer) redirect(ROUTES.auth.login)

  const { data: hiring } = await service
    .from('employer_hiring_profiles')
    .select('*')
    .eq('employer_id', employer.id)
    .maybeSingle()

  const fields    = calcCompletion(employer as unknown as Record<string, unknown>, hiring as Record<string, unknown> | null)
  const doneCount = fields.filter(f => f.done).length
  const pct       = Math.round((doneCount / fields.length) * 100)
  const incomplete = fields.filter(f => !f.done)

  const logoSignedUrl = employer.logo_url
    ? (await service.storage.from('avatars').createSignedUrl(employer.logo_url, 3600)).data?.signedUrl
    : null

  return (
    <div className="px-6 lg:px-8 py-6 lg:py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
          Welcome back{employer.company_name ? `, ${employer.company_name}` : ''}
        </h1>
        <p className="mt-1 text-sm text-muted">Here&rsquo;s an overview of your employer account.</p>
      </div>

      {/* Company card */}
      <div className="rounded-2xl border border-border bg-card px-6 py-5 mb-5 flex items-start gap-5">
        <Avatar
          src={logoSignedUrl ?? undefined}
          name={employer.company_name ?? '?'}
          size="xl"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg font-bold text-foreground">{employer.company_name}</h2>
            <Badge variant="success" size="sm" dot>Approved</Badge>
          </div>
          {employer.industry && (
            <p className="text-sm text-secondary mt-0.5">{employer.industry}</p>
          )}
          {(employer.location_city || employer.location_country) && (
            <p className="text-xs text-muted mt-1 flex items-center gap-1">
              <MapPin size={11} aria-hidden="true" />
              {[employer.location_city, employer.location_country].filter(Boolean).join(', ')}
            </p>
          )}
          {employer.company_size && (
            <p className="text-xs text-muted mt-0.5">{employer.company_size} employees</p>
          )}
        </div>
        <Link
          href="/dashboard/employer/profile"
          className="text-xs font-medium text-secondary hover:underline shrink-0"
        >
          Edit profile
        </Link>
      </div>

      {/* Profile completion */}
      <div className="rounded-2xl border border-border bg-card px-6 py-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Profile completion</h3>
          <span className="text-sm font-bold text-foreground tabular-nums">{pct}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-surface overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: pct === 100
                ? 'linear-gradient(to right, #10B981, #2D8A5E)'
                : 'linear-gradient(to right, #7C3AED, #A78BFA)',
            }}
          />
        </div>
        {pct === 100 ? (
          <div className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 size={15} aria-hidden="true" />
            Your company profile is complete.
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted mb-3">Complete these to strengthen your profile:</p>
            {incomplete.slice(0, 3).map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-surface hover:bg-white/5 transition-colors group"
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(124,58,237,0.1)' }}
                >
                  <Icon size={13} style={{ color: '#A78BFA' }} aria-hidden="true" />
                </div>
                <span className="text-sm text-foreground flex-1">Add {label}</span>
                <ChevronRight size={14} className="text-muted group-hover:text-foreground transition-colors" aria-hidden="true" />
              </Link>
            ))}
            {incomplete.length > 3 && (
              <p className="text-xs text-muted pl-1">+{incomplete.length - 3} more to complete</p>
            )}
          </div>
        )}
      </div>

      {/* Quick nav cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <Link
          href="/dashboard/employer/profile"
          className="rounded-2xl border border-border bg-card px-5 py-4 hover:bg-white/3 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.1)' }}
            >
              <Building2 size={16} style={{ color: '#A78BFA' }} aria-hidden="true" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Company Profile</h3>
            <ChevronRight size={14} className="text-muted group-hover:text-foreground transition-colors ml-auto" aria-hidden="true" />
          </div>
          <p className="text-xs text-muted">Company info, logo, and hiring preferences</p>
        </Link>

        <Link
          href="/dashboard/employer/settings"
          className="rounded-2xl border border-border bg-card px-5 py-4 hover:bg-white/3 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.1)' }}
            >
              <Settings size={16} style={{ color: '#A78BFA' }} aria-hidden="true" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Settings</h3>
            <ChevronRight size={14} className="text-muted group-hover:text-foreground transition-colors ml-auto" aria-hidden="true" />
          </div>
          <p className="text-xs text-muted">Account, password, notifications</p>
        </Link>
      </div>

      {/* Coming soon — Discover talent */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {(
          [
            { icon: Search, label: 'Discover Talent',  desc: 'Browse and swipe on pre-vetted creative candidates.' },
            { icon: Heart,  label: 'Saved Candidates', desc: "Candidates you've saved for later review." },
            { icon: Users,  label: 'Matches',          desc: 'Mutual interests turned into direct connections.' },
          ] as const
        ).map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="rounded-2xl border px-5 py-4 opacity-60 cursor-not-allowed"
            style={{ borderColor: 'rgba(124,58,237,0.15)', background: 'rgba(124,58,237,0.02)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(124,58,237,0.08)' }}
              >
                <Icon size={16} style={{ color: '#A78BFA' }} aria-hidden="true" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{label}</h3>
              <span
                className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA' }}
              >
                Soon
              </span>
            </div>
            <p className="text-xs text-muted">{desc}</p>
          </div>
        ))}
      </div>

      {/* Account status */}
      <div className="rounded-2xl border border-border bg-card px-6 py-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Account status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted">
              <CheckCircle2 size={14} className="text-success" aria-hidden="true" />
              Account approved
            </div>
            <Badge variant="success" size="sm">Active</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted">
              <AlertCircle size={14} style={{ color: '#A78BFA' }} aria-hidden="true" />
              Candidate discovery
            </div>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(124,58,237,0.12)', color: '#A78BFA' }}
            >
              Coming soon
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
