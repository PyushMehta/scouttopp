'use client'

import { useState }    from 'react'
import { Bell }        from 'lucide-react'
import { toast }       from '@/components/ui/toast'
import { cn }          from '@/lib/utils'

function Toggle({ label, desc, checked, onChange }: {
  label:    string
  desc:     string
  checked:  boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted mt-0.5">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 mt-0.5',
          checked ? 'bg-primary' : 'bg-border',
        )}
      >
        <span
          className={cn(
            'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 translate-y-0.5',
            checked ? 'translate-x-4' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  )
}

export interface NotificationPrefs {
  notify_new_match: boolean
  notify_email:     boolean
}

export function EmployerNotifications({ prefs }: { prefs: NotificationPrefs }) {
  const [values, setValues]   = useState(prefs)
  const [saving, setSaving]   = useState(false)

  const update = async (patch: Partial<NotificationPrefs>) => {
    const next = { ...values, ...patch }
    setValues(next)
    setSaving(true)
    try {
      const res  = await fetch('/api/employer/preferences', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(patch),
      })
      const json = await res.json() as { success: boolean; error?: { message: string } }
      if (!json.success) throw new Error(json.error?.message ?? 'Failed to save.')
      toast.success('Preferences saved.')
    } catch (err) {
      setValues(values)
      toast.error(err instanceof Error ? err.message : 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-5">
      <div className="flex items-center gap-2 mb-5">
        <Bell size={15} className="text-muted" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
        {saving && <span className="text-xs text-muted ml-auto">Saving…</span>}
      </div>
      <div className="space-y-5">
        <Toggle
          label="New matches"
          desc="Get notified when a candidate matches your hiring preferences."
          checked={values.notify_new_match}
          onChange={v => update({ notify_new_match: v })}
        />
        <Toggle
          label="Email notifications"
          desc="Receive match and activity updates via email."
          checked={values.notify_email}
          onChange={v => update({ notify_email: v })}
        />
      </div>
    </div>
  )
}
