'use client'

import { useState }     from 'react'
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { Button }       from '@/components/ui/button'
import { cn }           from '@/lib/utils'

interface LastSync {
  id:           string
  status:       string
  started_at:   string
  rows_fetched: number | null
}

interface SyncResult {
  rowsFetched:  number
  rowsNew:      number
  rowsSkipped:  number
  rowsErrored:  number
  completedAt:  string
  status:       string
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'complete') return <CheckCircle2 size={16} className="text-success" aria-hidden="true" />
  if (status === 'failed')   return <XCircle      size={16} className="text-destructive" aria-hidden="true" />
  return <AlertTriangle size={16} className="text-warning" aria-hidden="true" />
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function SyncPanel({ lastSync }: { lastSync: LastSync | null }) {
  const [running, setRunning]   = useState(false)
  const [result,  setResult]    = useState<SyncResult | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleSync = async () => {
    setRunning(true)
    setResult(null)
    setApiError(null)

    try {
      const res  = await fetch('/api/sync/run', { method: 'POST' })
      const json = await res.json() as {
        success: boolean
        data?:   SyncResult
        error?:  { message: string }
      }

      if (!json.success || !json.data) {
        setApiError(json.error?.message ?? 'Sync failed.')
      } else {
        setResult(json.data)
      }
    } catch {
      setApiError('Network error — could not reach the server.')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">Google Sheets Sync</h2>
          <p className="mt-0.5 text-xs text-muted">
            Fetches new form submissions and queues them for review.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          loading={running}
          onClick={handleSync}
          leftIcon={!running ? <RefreshCw size={15} /> : undefined}
        >
          {running ? 'Syncing…' : 'Run Sync'}
        </Button>
      </div>

      {/* Last sync info */}
      {!result && lastSync && (
        <div className="flex items-center gap-2 text-xs text-muted border-t border-border pt-4">
          <StatusIcon status={lastSync.status} />
          <span>
            Last sync: <span className="text-foreground font-medium">{fmtDate(lastSync.started_at)}</span>
            {' — '}{lastSync.rows_fetched != null ? `${lastSync.rows_fetched} rows fetched` : lastSync.status}
          </span>
        </div>
      )}

      {!result && !lastSync && (
        <p className="text-xs text-muted border-t border-border pt-4">No syncs have been run yet.</p>
      )}

      {/* API error */}
      {apiError && (
        <div
          className="flex items-start gap-2 rounded-xl border p-3 text-xs mt-4"
          style={{ background: 'rgba(196,58,58,0.06)', borderColor: 'rgba(196,58,58,0.3)', color: '#C43A3A' }}
          role="alert"
        >
          <XCircle size={14} className="shrink-0 mt-0.5" />
          {apiError}
        </div>
      )}

      {/* Result summary */}
      {result && (
        <div className="border-t border-border pt-4 mt-1">
          <div className="flex items-center gap-2 mb-3">
            <StatusIcon status={result.status} />
            <span className="text-xs font-medium text-foreground capitalize">{result.status}</span>
            <span className="text-xs text-muted ml-auto">{fmtDate(result.completedAt)}</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Fetched',  value: result.rowsFetched,  color: 'text-foreground' },
              { label: 'New',      value: result.rowsNew,      color: 'text-success' },
              { label: 'Skipped',  value: result.rowsSkipped,  color: 'text-muted' },
              { label: 'Errors',   value: result.rowsErrored,  color: result.rowsErrored > 0 ? 'text-destructive' : 'text-muted' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-lg bg-surface border border-border px-3 py-2 text-center">
                <p className={cn('text-lg font-bold tabular-nums', color)}>{value}</p>
                <p className="text-[10px] font-medium text-muted mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-3">
            <a href="/dashboard/admin/candidates" className="text-secondary underline-offset-2 hover:underline">
              {result.rowsNew > 0
                ? `Review ${result.rowsNew} new ${result.rowsNew === 1 ? 'candidate' : 'candidates'} →`
                : 'View all candidates →'}
            </a>
          </p>
        </div>
      )}
    </div>
  )
}
