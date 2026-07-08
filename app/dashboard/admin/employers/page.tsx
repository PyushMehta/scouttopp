import { createServiceClient }      from '@/lib/supabase/server'
import { requireAdmin }             from '@/lib/auth/require-admin'
import { redirect }                 from 'next/navigation'
import { Badge }                    from '@/components/ui/badge'
import { EmployerApproveButton }    from '@/components/dashboard/employer-approve-button'

export const metadata = { title: 'Employers | Admin' }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const STATE_BADGE: Record<string, { variant: 'warning' | 'success' | 'destructive' | 'default'; label: string }> = {
  PENDING_APPROVAL: { variant: 'warning',     label: 'Pending' },
  APPROVED:         { variant: 'success',     label: 'Approved' },
  SUSPENDED:        { variant: 'destructive', label: 'Suspended' },
}

export default async function AdminEmployersPage() {
  const auth = await requireAdmin()
  if (!auth.ok) redirect('/auth/login')

  const supabase = createServiceClient()

  const [{ data: employers }, { data: empProfiles }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, email, auth_state, created_at')
      .eq('role', 'employer')
      .order('created_at', { ascending: false }),
    supabase
      .from('employer_profiles')
      .select('user_id, company_name, company_url'),
  ])

  const profileMap = new Map(
    (empProfiles ?? []).map(p => [p.user_id, p]),
  )

  return (
    <div className="px-6 lg:px-8 py-6 lg:py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Employers</h1>
        <p className="mt-1 text-sm text-muted">
          All employer accounts — approve pending requests here.
        </p>
      </div>

      {!employers?.length ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted">No employer accounts yet.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Company</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Joined</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {employers.map(emp => {
                const badge   = STATE_BADGE[emp.auth_state ?? ''] ?? { variant: 'default' as const, label: emp.auth_state ?? '—' }
                const empProf = profileMap.get(emp.id)
                return (
                  <tr key={emp.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4 text-foreground">{emp.email}</td>
                    <td className="px-5 py-4">
                      {empProf?.company_name ? (
                        <div>
                          <span className="text-foreground font-medium">{empProf.company_name}</span>
                          {empProf.company_url && (
                            <a
                              href={empProf.company_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-xs text-muted hover:text-foreground truncate max-w-50"
                            >
                              {empProf.company_url.replace(/^https?:\/\//, '')}
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted italic">Not submitted yet</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
                    </td>
                    <td className="px-5 py-4 text-muted tabular-nums">
                      {emp.created_at ? fmtDate(emp.created_at) : '—'}
                    </td>
                    <td className="px-5 py-4">
                      {emp.auth_state === 'PENDING_APPROVAL' ? (
                        <EmployerApproveButton profileId={emp.id} />
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
