'use client'

import Link            from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, LogOut } from 'lucide-react'
import { cn }          from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter }   from 'next/navigation'

const NAV_ITEMS = [
  { label: 'Overview',   href: '/dashboard/admin',            icon: LayoutDashboard },
  { label: 'Candidates', href: '/dashboard/admin/candidates', icon: Users },
]

export function AdminTopBar() {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="lg:hidden flex items-center justify-between h-14 px-4 border-b border-border bg-surface shrink-0">
      <span className="text-sm font-extrabold tracking-tight text-foreground">
        ScouttOpp
        <span
          className="ml-2 text-xs font-medium px-1.5 py-0.5 rounded-md border"
          style={{ color: '#A78BFA', borderColor: 'rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.1)' }}
        >
          Admin
        </span>
      </span>

      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                active ? 'bg-primary/15 text-secondary' : 'text-muted hover:text-foreground hover:bg-white/5',
              )}
            >
              <Icon size={14} aria-hidden="true" />
              {label}
            </Link>
          )
        })}
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-foreground hover:bg-white/5 transition-colors"
        >
          <LogOut size={14} aria-hidden="true" />
          Sign out
        </button>
      </nav>
    </header>
  )
}
