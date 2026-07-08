import { redirect }            from 'next/navigation'
import { createClient }        from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { MessageSquare, Search, Lock } from 'lucide-react'
import { EmployerEmptyState }  from '@/components/dashboard/employer/employer-empty-state'
import { ROUTES }              from '@/constants'

export const metadata = { title: 'Messages | ScouttOpp' }

export default async function EmployerMessagesPage() {
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
    <div className="flex h-full min-h-[560px]">
      {/* ── Thread list panel ─────────────────────────────────────────── */}
      <div className="flex flex-col w-full md:w-72 lg:w-80 shrink-0 border-r border-border">
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
          <h1 className="text-sm font-semibold text-foreground">Messages</h1>
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
            style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA' }}
          >
            Coming Soon
          </span>
        </div>

        {/* Search box (placeholder) */}
        <div className="px-3 py-2.5 border-b border-border shrink-0">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-input opacity-50 cursor-not-allowed select-none"
            aria-hidden="true"
          >
            <Search size={13} className="text-muted shrink-0" />
            <span className="text-xs text-muted">Search conversations…</span>
          </div>
        </div>

        {/* Thread list empty state */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
            style={{ background: 'rgba(124,58,237,0.1)' }}
            aria-hidden="true"
          >
            <MessageSquare size={18} strokeWidth={1.5} style={{ color: '#A78BFA' }} />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">No conversations</p>
          <p className="text-xs text-muted leading-relaxed">
            Conversations with matched candidates will appear here.
          </p>
        </div>
      </div>

      {/* ── Message content panel ──────────────────────────────────────── */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center px-8 py-12 text-center">
        <EmployerEmptyState
          icon={Lock}
          title="Messaging is coming"
          description="Once you've matched with a candidate, you'll be able to message them directly from here. Matches unlock after candidate discovery launches."
          badge="Coming Soon"
          iconColor="#3B82F6"
          iconBg="rgba(59,130,246,0.1)"
        />

        {/* Feature hints */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-md">
          {[
            { label: 'Real-time chat',   desc: 'Instant message delivery' },
            { label: 'File sharing',     desc: 'Send portfolios and briefs' },
            { label: 'Read receipts',    desc: 'Know when messages are seen' },
          ].map(({ label, desc }) => (
            <div
              key={label}
              className="rounded-xl border px-3 py-2.5 text-left"
              style={{ borderColor: 'rgba(124,58,237,0.12)', background: 'rgba(124,58,237,0.02)' }}
            >
              <p className="text-xs font-semibold text-foreground mb-0.5">{label}</p>
              <p className="text-[10px] text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
