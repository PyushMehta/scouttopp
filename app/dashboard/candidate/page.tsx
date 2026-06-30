import Link                    from 'next/link'
import { createClient }        from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { redirect }            from 'next/navigation'
import { CheckCircle2, AlertCircle, User, Briefcase, Link2, MapPin, Zap, ChevronRight, Eye } from 'lucide-react'
import { Badge }               from '@/components/ui/badge'
import { Avatar }              from '@/components/ui/avatar'
import { ROUTES }              from '@/constants'

function fmtRole(role: string | null) {
  if (!role) return null
  return role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

interface CompletionField {
  label: string
  done:  boolean
  href:  string
  icon:  React.ElementType
}

function calcCompletion(profile: Record<string, unknown>, portfolioCount: number): CompletionField[] {
  return [
    { label: 'full name',     done: !!profile.full_name,    href: '/dashboard/candidate/profile',  icon: User },
    { label: 'bio',           done: !!profile.bio,           href: '/dashboard/candidate/profile',  icon: User },
    { label: 'role',          done: !!profile.primary_role,  href: '/dashboard/candidate/profile',  icon: User },
    { label: 'location',      done: !!(profile.location_city || profile.location_country), href: '/dashboard/candidate/profile', icon: MapPin },
    { label: 'avatar',        done: !!profile.avatar_url,   href: '/dashboard/candidate/profile',  icon: User },
    { label: 'portfolio link or item', done: !!(profile.portfolio_url || portfolioCount > 0), href: '/dashboard/candidate/portfolio', icon: Briefcase },
    { label: 'social link',   done: !!(profile.linkedin_url || profile.instagram_url || profile.website_url), href: '/dashboard/candidate/profile', icon: Link2 },
  ]
}

export default async function CandidateDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.auth.login)

  const service = createServiceClient()

  const { data: profile } = await service
    .from('candidate_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect(ROUTES.auth.login)

  const { count: portfolioCount } = await service
    .from('candidate_portfolio_items')
    .select('id', { count: 'exact', head: true })
    .eq('candidate_id', profile.id)

  const fields     = calcCompletion(profile as unknown as Record<string, unknown>, portfolioCount ?? 0)
  const doneCount  = fields.filter(f => f.done).length
  const pct        = Math.round((doneCount / fields.length) * 100)
  const incomplete = fields.filter(f => !f.done)

  return (
    <div className="px-6 lg:px-8 py-6 lg:py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
          Welcome back{profile.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-1 text-sm text-muted">Here's what's happening with your profile.</p>
      </div>

      {/* Status + Avatar card */}
      <div className="rounded-2xl border border-border bg-card px-6 py-5 mb-5 flex items-start gap-5">
        <Avatar
          src={profile.avatar_url ?? undefined}
          name={profile.full_name ?? '?'}
          size="xl"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg font-bold text-foreground">{profile.full_name ?? 'Your Name'}</h2>
            <Badge variant="success" size="sm" dot>Approved</Badge>
            {profile.is_discoverable && (
              <span className="inline-flex items-center gap-1 text-xs text-muted">
                <Eye size={12} aria-hidden="true" /> Visible to employers
              </span>
            )}
          </div>
          {profile.primary_role && (
            <p className="text-sm text-secondary mt-0.5">{fmtRole(profile.primary_role)}</p>
          )}
          {(profile.location_city || profile.location_country) && (
            <p className="text-xs text-muted mt-1 flex items-center gap-1">
              <MapPin size={11} aria-hidden="true" />
              {[profile.location_city, profile.location_country].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
        <Link
          href="/dashboard/candidate/profile"
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
            Your profile is complete — employers can see all your details.
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted mb-3">Complete these to improve your profile:</p>
            {incomplete.slice(0, 3).map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-surface hover:bg-white/5 transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(124,58,237,0.1)' }}>
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
          href="/dashboard/candidate/portfolio"
          className="rounded-2xl border border-border bg-card px-5 py-4 hover:bg-white/3 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.1)' }}>
              <Briefcase size={16} style={{ color: '#A78BFA' }} aria-hidden="true" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Portfolio</h3>
            <ChevronRight size={14} className="text-muted group-hover:text-foreground transition-colors ml-auto" aria-hidden="true" />
          </div>
          <p className="text-xs text-muted">
            {portfolioCount ? `${portfolioCount} item${portfolioCount === 1 ? '' : 's'}` : 'No items yet'} — add your best work
          </p>
        </Link>

        <Link
          href="/dashboard/candidate/settings"
          className="rounded-2xl border border-border bg-card px-5 py-4 hover:bg-white/3 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.1)' }}>
              <AlertCircle size={16} style={{ color: '#A78BFA' }} aria-hidden="true" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Settings</h3>
            <ChevronRight size={14} className="text-muted group-hover:text-foreground transition-colors ml-auto" aria-hidden="true" />
          </div>
          <p className="text-xs text-muted">Account, password, notifications</p>
        </Link>
      </div>

      {/* Scout Mode coming soon */}
      <div className="rounded-2xl border px-6 py-5"
        style={{ borderColor: 'rgba(124,58,237,0.2)', background: 'rgba(124,58,237,0.03)' }}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(124,58,237,0.12)' }}>
            <Zap size={18} style={{ color: '#A78BFA' }} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-foreground">Scout Mode</h3>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA' }}>
                Coming Soon
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Employers will discover and match with you through Scout Mode — a curated swipe experience for creative talent.
              Keep your profile complete to be first in the queue.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
