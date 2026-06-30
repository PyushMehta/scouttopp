import { createServiceClient }  from '@/lib/supabase/server'
import { SyncPanel }            from '@/components/dashboard/sync-panel'

async function getStats() {
  const supabase = createServiceClient()

  const [stagingRes, canonicalRes, syncRes] = await Promise.all([
    supabase.from('candidate_sync_staging').select('status', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('sync_runs').select('id, status, started_at, rows_fetched').order('started_at', { ascending: false }).limit(1).single(),
  ])

  return {
    pendingReview:    stagingRes.count   ?? 0,
    totalCandidates:  canonicalRes.count ?? 0,
    lastSync:         syncRes.data       ?? null,
  }
}

export default async function AdminOverviewPage() {
  const stats = await getStats()

  const statCards = [
    { label: 'Pending Review',    value: stats.pendingReview,   description: 'Staged candidates awaiting your decision' },
    { label: 'Total Candidates',  value: stats.totalCandidates, description: 'Approved candidates in the talent pool' },
  ]

  return (
    <div className="px-8 py-8 max-w-5xl">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted">Manage your candidate pipeline and sync from Google Sheets.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {statCards.map(({ label, value, description }) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-card px-6 py-5"
          >
            <p className="text-xs font-medium text-muted uppercase tracking-wide">{label}</p>
            <p className="mt-1 text-3xl font-extrabold text-foreground tabular-nums">{value}</p>
            <p className="mt-1 text-xs text-muted">{description}</p>
          </div>
        ))}
      </div>

      {/* Sync panel */}
      <SyncPanel lastSync={stats.lastSync} />
    </div>
  )
}
