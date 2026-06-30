'use client'

import Link            from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, User, Briefcase, Settings, LogOut } from 'lucide-react'
import { cn }          from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter }   from 'next/navigation'

const NAV_ITEMS = [
  { label: 'Home',      href: '/dashboard/candidate',           icon: LayoutDashboard, exact: true },
  { label: 'Profile',   href: '/dashboard/candidate/profile',   icon: User },
  { label: 'Portfolio', href: '/dashboard/candidate/portfolio',  icon: Briefcase },
  { label: 'Settings',  href: '/dashboard/candidate/settings',  icon: Settings },
]

export function CandidateTopBar() {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="lg:hidden flex items-center justify-between h-14 px-4 border-b border-border bg-surface shrink-0">
      <span className="text-sm font-extrabold tracking-tight text-foreground">ScouttOpp</span>
      <nav className="flex items-center gap-0.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
                active ? 'bg-primary/15 text-secondary' : 'text-muted hover:text-foreground hover:bg-white/5',
              )}
            >
              <Icon size={16} aria-hidden="true" />
            </Link>
          )
        })}
        <button
          type="button"
          onClick={handleSignOut}
          aria-label="Sign out"
          className="flex items-center justify-center w-9 h-9 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors"
        >
          <LogOut size={16} aria-hidden="true" />
        </button>
      </nav>
    </header>
  )
}
