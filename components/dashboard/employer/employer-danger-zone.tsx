'use client'

import { useState }         from 'react'
import { useRouter }        from 'next/navigation'
import { AlertTriangle }    from 'lucide-react'
import { Modal }            from '@/components/ui/modal'
import { Input }            from '@/components/ui/input'
import { Button }           from '@/components/ui/button'
import { toast }            from '@/components/ui/toast'
import { createClient }     from '@/lib/supabase/client'
import { ROUTES }           from '@/constants'

export function EmployerDangerZone() {
  const router = useRouter()
  const [open, setOpen]               = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting]       = useState(false)

  const close = () => {
    if (deleting) return
    setOpen(false)
    setConfirmText('')
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res  = await fetch('/api/employer/account', { method: 'DELETE' })
      const json = await res.json() as { success: boolean; error?: { message: string } }
      if (!json.success) throw new Error(json.error?.message ?? 'Failed to delete account.')

      const supabase = createClient()
      await supabase.auth.signOut()
      toast.success('Account deleted.')
      router.push(ROUTES.auth.login)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete account.')
      setDeleting(false)
    }
  }

  return (
    <div
      className="rounded-2xl border px-6 py-5"
      style={{ borderColor: 'rgba(196,58,58,0.3)', background: 'rgba(196,58,58,0.03)' }}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="text-destructive shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-foreground">Delete account</h2>
          <p className="text-xs text-muted mt-0.5 mb-4 max-w-md">
            Permanently delete your employer account and all company data. This cannot be undone.
          </p>
          <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
            Delete my account
          </Button>
        </div>
      </div>

      <Modal
        open={open}
        onClose={close}
        title="Delete employer account?"
        size="sm"
        closable={!deleting}
        footer={
          <>
            <Button variant="ghost" onClick={close} disabled={deleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={deleting}
              disabled={confirmText !== 'DELETE'}
            >
              Delete account
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            This will permanently delete your employer account, company profile, and hiring data. Candidates you&rsquo;ve previously seen will not be notified.
          </p>
          <Input
            label='Type "DELETE" to confirm'
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
          />
        </div>
      </Modal>
    </div>
  )
}
