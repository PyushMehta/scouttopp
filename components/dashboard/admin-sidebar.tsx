'use client'

import Link               from 'next/link'
import { usePathname }    from 'next/navigation'
import { LayoutDashboard, Users, LogOut } from 'lucide-react'
import { cn }             from '@/lib/utils'
import { createClient }   from '@/lib/supabase/client'
import { useRouter }      from 'next/navigation'

const NAV_ITEMS = [
  { label: 'Overview',   href: '/dashboard/admin',            icon: LayoutDashboard },
  { label: 'Candidates', href: '/dashboard/admin/candidates', icon: Users },
]

export function AdminSidebar() {
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
        <span className="text-base font-extrabold tracking-tight text-foreground">
          ScouttOpp
        </span>
        <span
          className="ml-2 text-xs font-medium px-1.5 py-0.5 rounded-md border"
          style={{ color: '#A78BFA', borderColor: 'rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.1)' }}
        >
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5" aria-label="Admin navigation">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard/admin' && pathname.startsWith(href))
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

      {/* Sign out */}
      <div className="p-3 border-t border-border">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-white/5 transition-colors duration-150"
        >
          <LogOut size={16} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
