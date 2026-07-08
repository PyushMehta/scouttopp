'use client'

import { useState }    from 'react'
import { useRouter }   from 'next/navigation'
import { CheckCircle2, Copy, Check } from 'lucide-react'
import { Button }      from '@/components/ui/button'

interface EmployerApproveButtonProps {
  profileId: string
}

interface ApproveResult {
  success: boolean
  data?:   { actionLink?: string | null }
  error?:  { message: string }
}

export function EmployerApproveButton({ profileId }: EmployerApproveButtonProps) {
  const router = useRouter()
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [actionLink, setActionLink] = useState<string | null>(null)
  const [copied,     setCopied]     = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch(`/api/admin/employers/${profileId}/approve`, { method: 'POST' })
      const json = await res.json() as ApproveResult
      if (!json.success) { setError(json.error?.message ?? 'Approve failed.'); return }
      if (json.data?.actionLink) {
        setActionLink(json.data.actionLink)
      } else {
        router.refresh()
      }
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!actionLink) return
    await navigator.clipboard.writeText(actionLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (actionLink) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--color-success)' }}>
          <CheckCircle2 size={13} aria-hidden="true" />
          Approved — share login link
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs text-foreground bg-surface border border-border rounded-lg px-2 py-1.5 truncate max-w-xs">
            {actionLink}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-white/5 transition-colors"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button
        variant="primary"
        size="sm"
        loading={loading}
        onClick={handleApprove}
        leftIcon={<CheckCircle2 size={13} />}
      >
        Approve
      </Button>
    </div>
  )
}
