'use client'

import Link              from 'next/link'
import { usePathname }   from 'next/navigation'
import { useRouter }     from 'next/navigation'
import {
  LayoutDashboard, Building2, Settings, LogOut,
  Users2, Heart, MessageSquare, BarChart3, Bell,
} from 'lucide-react'
import { cn }            from '@/lib/utils'
import { createClient }  from '@/lib/supabase/client'
import { ThemeToggle }   from '@/components/ui/theme-toggle'

/* ─── Nav config ────────────────────────────────────────────────────────── */

const NAV_MAIN = [
  { label: 'Dashboard',     href: '/dashboard/employer',               icon: LayoutDashboard, exact: true },
  { label: 'Analytics',     href: '/dashboard/employer/analytics',     icon: BarChart3 },
  { label: 'Notifications', href: '/dashboard/employer/notifications', icon: Bell },
]

const NAV_TALENT = [
  { label: 'Candidates', href: '/dashboard/employer/candidates', icon: Users2 },
  { label: 'Saved',      href: '/dashboard/employer/matches',    icon: Heart },
  { label: 'Messages',   href: '/dashboard/employer/messages',   icon: MessageSquare },
]

const NAV_COMPANY = [
  { label: 'Company Profile', href: '/dashboard/employer/profile',   icon: Building2 },
  { label: 'Settings',        href: '/dashboard/employer/settings',  icon: Settings },
]

/* ─── Sub-components ────────────────────────────────────────────────────── */

interface NavLinkProps {
  label:   string
  href:    string
  icon:    React.ElementType
  active:  boolean
  onClick?: () => void
}

function NavLink({ label, href, icon: Icon, active, onClick }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
        active
          ? 'bg-primary/15 text-secondary'
          : 'text-muted hover:text-foreground hover:bg-white/5',
      )}
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={16} aria-hidden="true" />
      {label}
    </Link>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted/40 select-none">
      {children}
    </p>
  )
}

/* ─── Shared nav content (used in sidebar + mobile drawer) ──────────────── */

export interface EmployerNavContentProps {
  onNavigate?: () => void
}

export function EmployerNavContent({ onNavigate }: EmployerNavContentProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <>
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto" aria-label="Employer navigation">
        {NAV_MAIN.map(item => (
          <NavLink
            key={item.href}
            label={item.label}
            href={item.href}
            icon={item.icon}
            active={isActive(item.href, item.exact)}
            onClick={onNavigate}
          />
        ))}

        <SectionLabel>Talent</SectionLabel>
        {NAV_TALENT.map(item => (
          <NavLink
            key={item.href}
            label={item.label}
            href={item.href}
            icon={item.icon}
            active={isActive(item.href)}
            onClick={onNavigate}
          />
        ))}

        <SectionLabel>Company</SectionLabel>
        {NAV_COMPANY.map(item => (
          <NavLink
            key={item.href}
            label={item.label}
            href={item.href}
            icon={item.icon}
            active={isActive(item.href)}
            onClick={onNavigate}
          />
        ))}
      </nav>

      <div className="p-3 border-t border-border shrink-0 space-y-0.5">
        <div className="flex items-center gap-3 px-3 py-2">
          <ThemeToggle size={16} className="w-auto h-auto p-0 hover:bg-transparent" />
          <span className="text-sm font-medium text-muted">Toggle theme</span>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-foreground/5 transition-colors duration-150"
        >
          <LogOut size={16} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </>
  )
}

/* ─── Desktop sidebar ───────────────────────────────────────────────────── */

export function EmployerSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-border bg-surface">
      <div className="flex items-center h-16 px-5 border-b border-border gap-2 shrink-0">
        <span className="text-base font-extrabold tracking-tight text-foreground">ScouttOpp</span>
        <span
          className="ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
          style={{ background: 'rgba(43,56,117,0.15)', color: '#6B5FAE' }}
        >
          Employer
        </span>
      </div>
      <EmployerNavContent />
    </aside>
  )
}
