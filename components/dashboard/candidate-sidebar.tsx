'use client'

import Link            from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, User, Briefcase, Settings, LogOut } from 'lucide-react'
import { cn }          from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter }   from 'next/navigation'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const NAV_ITEMS = [
  { label: 'Home',      href: '/dashboard/candidate',           icon: LayoutDashboard, exact: true },
  { label: 'Profile',   href: '/dashboard/candidate/profile',   icon: User },
  { label: 'Portfolio', href: '/dashboard/candidate/portfolio',  icon: Briefcase },
  { label: 'Settings',  href: '/dashboard/candidate/settings',  icon: Settings },
]

export function CandidateSidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-border bg-surface">
      {/* Logo */}
      <div className="flex items-center h-16 px-5 border-b border-border">
        <span className="text-base font-extrabold tracking-tight text-foreground">ScouttOpp</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5" aria-label="Candidate navigation">
        {NAV_ITEMS.map(({ label, href, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
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
        })}

      </nav>

      {/* Theme + Sign out */}
      <div className="p-3 border-t border-border space-y-0.5">
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
    </aside>
  )
}
