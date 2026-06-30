'use client'

import { useState }      from 'react'
import { useRouter }     from 'next/navigation'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Button }        from '@/components/ui/button'

interface CandidateActionsProps {
  stagingId: string
  status:    string
}

export function CandidateActions({ stagingId, status }: CandidateActionsProps) {
  const router = useRouter()

  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [reason, setReason]       = useState('')
  const [error, setError]         = useState<string | null>(null)

  const isDone = status === 'promoted' || status === 'rejected'

  const handleApprove = async () => {
    setApproving(true)
    setError(null)
    try {
      const res  = await fetch(`/api/admin/candidates/${stagingId}/approve`, { method: 'POST' })
      const json = await res.json() as { success: boolean; error?: { message: string } }
      if (!json.success) { setError(json.error?.message ?? 'Approve failed.'); return }
      router.push('/dashboard/admin/candidates?status=promoted')
      router.refresh()
    } catch {
      setError('Network error.')
    } finally {
      setApproving(false)
    }
  }

  const handleReject = async () => {
    setRejecting(true)
    setError(null)
    try {
      const res  = await fetch(`/api/admin/candidates/${stagingId}/reject`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ reason }),
      })
      const json = await res.json() as { success: boolean; error?: { message: string } }
      if (!json.success) { setError(json.error?.message ?? 'Reject failed.'); return }
      router.push('/dashboard/admin/candidates?status=rejected')
      router.refresh()
    } catch {
      setError('Network error.')
    } finally {
      setRejecting(false)
      setShowReject(false)
    }
  }

  if (isDone) {
    return (
      <div
        className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border"
        style={
          status === 'promoted'
            ? { color: 'var(--color-success)', borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.08)' }
            : { color: 'var(--color-destructive)', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)' }
        }
      >
        {status === 'promoted' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
        {status === 'promoted' ? 'Approved — invite sent' : 'Rejected'}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {showReject ? (
        <div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-xs font-medium text-foreground">Reason for rejection (optional)</p>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Portfolio does not meet current requirements."
            rows={3}
            className="w-full text-xs bg-card border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted resize-none focus:outline-none focus:ring-2 focus:ring-destructive/50"
          />
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" loading={rejecting} onClick={handleReject}>
              Confirm Reject
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowReject(false)} disabled={rejecting}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button variant="primary" size="md" loading={approving} onClick={handleApprove}
            leftIcon={<CheckCircle2 size={15} />}>
            Approve & Invite
          </Button>
          <Button variant="destructive" size="md" onClick={() => setShowReject(true)}
            leftIcon={<XCircle size={15} />}>
            Reject
          </Button>
        </div>
      )}
    </div>
  )
}
