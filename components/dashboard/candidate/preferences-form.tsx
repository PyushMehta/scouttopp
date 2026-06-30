'use client'

import { useForm } from 'react-hook-form'
import { Save }     from 'lucide-react'
import { Input }    from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button }   from '@/components/ui/button'
import { toast }    from '@/components/ui/toast'

export interface PreferencesData {
  open_to_remote:     boolean
  open_to_onsite:     boolean
  open_to_hybrid:     boolean
  open_to_contract:   boolean
  open_to_fulltime:   boolean
  rate_min_hourly:    number | null
  rate_max_hourly:    number | null
  available_from:     string | null
  notice_period_days: number | null
}

interface FormValues {
  open_to_remote:     boolean
  open_to_onsite:     boolean
  open_to_hybrid:     boolean
  open_to_contract:   boolean
  open_to_fulltime:   boolean
  rate_min_hourly:    string
  rate_max_hourly:    string
  available_from:     string
  notice_period_days: string
}

export function PreferencesForm({ preferences }: { preferences: PreferencesData }) {
  const {
    register,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      open_to_remote:     preferences.open_to_remote,
      open_to_onsite:     preferences.open_to_onsite,
      open_to_hybrid:     preferences.open_to_hybrid,
      open_to_contract:   preferences.open_to_contract,
      open_to_fulltime:   preferences.open_to_fulltime,
      rate_min_hourly:    preferences.rate_min_hourly?.toString() ?? '',
      rate_max_hourly:    preferences.rate_max_hourly?.toString() ?? '',
      available_from:     preferences.available_from ?? '',
      notice_period_days: preferences.notice_period_days?.toString() ?? '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    const payload = {
      open_to_remote:     values.open_to_remote,
      open_to_onsite:     values.open_to_onsite,
      open_to_hybrid:     values.open_to_hybrid,
      open_to_contract:   values.open_to_contract,
      open_to_fulltime:   values.open_to_fulltime,
      rate_min_hourly:    values.rate_min_hourly    ? parseInt(values.rate_min_hourly, 10)    : null,
      rate_max_hourly:    values.rate_max_hourly    ? parseInt(values.rate_max_hourly, 10)    : null,
      available_from:     values.available_from     || null,
      notice_period_days: values.notice_period_days ? parseInt(values.notice_period_days, 10) : null,
    }

    try {
      const res  = await fetch('/api/candidate/preferences', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const json = await res.json() as { success: boolean; error?: { message: string } }
      if (!json.success) throw new Error(json.error?.message ?? 'Failed to save.')
      toast.success('Preferences saved.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="rounded-2xl border border-border bg-card px-6 py-5">
        <h2 className="text-sm font-semibold text-foreground">Work preferences</h2>
        <p className="text-xs text-muted mt-0.5 mb-4">Help us tailor opportunities for you.</p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Checkbox label="Open to remote"    defaultChecked={preferences.open_to_remote}   {...register('open_to_remote')} />
            <Checkbox label="Open to onsite"    defaultChecked={preferences.open_to_onsite}   {...register('open_to_onsite')} />
            <Checkbox label="Open to hybrid"    defaultChecked={preferences.open_to_hybrid}   {...register('open_to_hybrid')} />
            <Checkbox label="Open to contract"  defaultChecked={preferences.open_to_contract} {...register('open_to_contract')} />
            <Checkbox label="Open to full-time" defaultChecked={preferences.open_to_fulltime} {...register('open_to_fulltime')} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Min hourly rate (USD)" type="number" min={0} placeholder="25" {...register('rate_min_hourly')} />
            <Input label="Max hourly rate (USD)" type="number" min={0} placeholder="75" {...register('rate_max_hourly')} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Available from" type="date" {...register('available_from')} />
            <Input label="Notice period (days)" type="number" min={0} max={365} placeholder="14" {...register('notice_period_days')} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {isDirty && <p className="text-xs text-muted">Unsaved changes</p>}
        <Button type="submit" loading={isSubmitting} disabled={!isDirty} leftIcon={<Save size={14} aria-hidden="true" />}>
          Save preferences
        </Button>
      </div>
    </form>
  )
}
