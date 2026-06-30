'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { toast }    from '@/components/ui/toast'

export function VisibilitySection({ initialPaused }: { initialPaused: boolean }) {
  const [paused, setPaused] = useState(initialPaused)
  const [saving, setSaving] = useState(false)

  const handleChange = async (checked: boolean) => {
    const prev = paused
    setPaused(checked)
    setSaving(true)
    try {
      const res  = await fetch('/api/candidate/visibility', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ discovery_paused: checked }),
      })
      const json = await res.json() as { success: boolean; error?: { message: string } }
      if (!json.success) throw new Error(json.error?.message ?? 'Failed to update.')
      toast.success(checked ? 'Profile visibility paused.' : 'Profile visibility resumed.')
    } catch (err) {
      setPaused(prev)
      toast.error(err instanceof Error ? err.message : 'Failed to update.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(124,58,237,0.1)' }}
          >
            {paused
              ? <EyeOff size={16} style={{ color: '#A78BFA' }} aria-hidden="true" />
              : <Eye size={16} style={{ color: '#A78BFA' }} aria-hidden="true" />}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Profile visibility</h2>
            <p className="text-xs text-muted mt-0.5 max-w-sm">
              Pause your profile to hide it from employers without affecting your approval status.
            </p>
          </div>
        </div>
        <Checkbox
          checked={paused}
          disabled={saving}
          onChange={(e) => handleChange(e.target.checked)}
          aria-label="Pause profile visibility"
        />
      </div>
    </div>
  )
}
