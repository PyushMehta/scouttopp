'use client'

import { useForm, useWatch } from 'react-hook-form'
import { Save }                             from 'lucide-react'
import { Input }                            from '@/components/ui/input'
import { Select }                           from '@/components/ui/select'
import { Button }                           from '@/components/ui/button'
import { toast }                            from '@/components/ui/toast'
import { cn }                               from '@/lib/utils'

const ROLE_OPTIONS = [
  { value: 'motion_designer',   label: 'Motion Designer' },
  { value: 'graphic_designer',  label: 'Graphic Designer' },
  { value: 'ux_designer',       label: 'UX Designer' },
  { value: 'brand_designer',    label: 'Brand Designer' },
  { value: 'illustrator',       label: 'Illustrator' },
  { value: 'photographer',      label: 'Photographer' },
  { value: 'videographer',      label: 'Videographer' },
  { value: 'creative_director', label: 'Creative Director' },
  { value: 'art_director',      label: 'Art Director' },
  { value: 'copywriter',        label: 'Copywriter' },
  { value: 'social_media',      label: 'Social Media' },
  { value: 'other',             label: 'Other' },
]

const URGENCY_OPTIONS = [
  { value: 'immediately',     label: 'Immediately' },
  { value: 'within_month',    label: 'Within a month' },
  { value: 'within_quarter',  label: 'Within a quarter' },
  { value: 'exploring',       label: 'Just exploring' },
]

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-5">
      <h2 className="text-sm font-semibold text-foreground mb-0.5">{title}</h2>
      {desc && <p className="text-xs text-muted mb-4">{desc}</p>}
      {!desc && <div className="mb-4" />}
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200',
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
      <span className="text-sm text-foreground">{label}</span>
    </label>
  )
}

function RoleMultiSelect({
  value,
  onChange,
}: {
  value:    string[]
  onChange: (v: string[]) => void
}) {
  const toggle = (role: string) => {
    onChange(
      value.includes(role) ? value.filter(r => r !== role) : [...value, role],
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ROLE_OPTIONS.map(({ value: v, label }) => {
        const selected = value.includes(v)
        return (
          <button
            key={v}
            type="button"
            onClick={() => toggle(v)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              selected
                ? 'border-primary bg-primary/15 text-secondary'
                : 'border-border bg-surface text-muted hover:border-primary/50 hover:text-foreground',
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

export interface HiringData {
  typically_hires:    string[] | null
  contract_preferred: boolean | null
  fulltime_preferred: boolean | null
  remote_ok:          boolean | null
  onsite_ok:          boolean | null
  budget_min_hourly:  number | null
  budget_max_hourly:  number | null
  hiring_urgency:     string | null
}

interface FormValues {
  typically_hires:    string[]
  contract_preferred: boolean
  fulltime_preferred: boolean
  remote_ok:          boolean
  onsite_ok:          boolean
  budget_min_hourly:  string
  budget_max_hourly:  string
  hiring_urgency:     string
}

export function HiringForm({ hiring }: { hiring: HiringData | null }) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { isDirty, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      typically_hires:    (hiring?.typically_hires ?? []) as string[],
      contract_preferred: hiring?.contract_preferred ?? false,
      fulltime_preferred: hiring?.fulltime_preferred ?? false,
      remote_ok:          hiring?.remote_ok          ?? false,
      onsite_ok:          hiring?.onsite_ok          ?? false,
      budget_min_hourly:  hiring?.budget_min_hourly?.toString() ?? '',
      budget_max_hourly:  hiring?.budget_max_hourly?.toString() ?? '',
      hiring_urgency:     hiring?.hiring_urgency     ?? '',
    },
  })

  const rolesValue          = useWatch({ control, name: 'typically_hires',    defaultValue: (hiring?.typically_hires ?? []) as string[] })
  const contractValue       = useWatch({ control, name: 'contract_preferred', defaultValue: hiring?.contract_preferred ?? false })
  const fulltimeValue       = useWatch({ control, name: 'fulltime_preferred', defaultValue: hiring?.fulltime_preferred ?? false })
  const remoteValue         = useWatch({ control, name: 'remote_ok',          defaultValue: hiring?.remote_ok ?? false })
  const onsiteValue         = useWatch({ control, name: 'onsite_ok',          defaultValue: hiring?.onsite_ok ?? false })

  const onSubmit = async (values: FormValues) => {
    const payload: Record<string, unknown> = {
      typically_hires:    values.typically_hires.length > 0 ? values.typically_hires : null,
      contract_preferred: values.contract_preferred,
      fulltime_preferred: values.fulltime_preferred,
      remote_ok:          values.remote_ok,
      onsite_ok:          values.onsite_ok,
      budget_min_hourly:  values.budget_min_hourly ? parseInt(values.budget_min_hourly, 10) : null,
      budget_max_hourly:  values.budget_max_hourly ? parseInt(values.budget_max_hourly, 10) : null,
      hiring_urgency:     values.hiring_urgency    || null,
    }

    try {
      const res  = await fetch('/api/employer/hiring', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const json = await res.json() as { success: boolean; error?: { message: string } }

      if (!json.success) {
        toast.error(json.error?.message ?? 'Failed to save. Try again.')
        return
      }

      toast.success('Hiring preferences saved.')
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Roles */}
      <Section title="Roles you hire for" desc="Select all creative roles your company typically hires.">
        <RoleMultiSelect
          value={rolesValue}
          onChange={v => setValue('typically_hires', v, { shouldDirty: true })}
        />
      </Section>

      {/* Work type */}
      <Section title="Work arrangement" desc="What types of engagements are you open to?">
        <div className="space-y-3">
          <Toggle
            label="Full-time"
            checked={fulltimeValue}
            onChange={v => setValue('fulltime_preferred', v, { shouldDirty: true })}
          />
          <Toggle
            label="Contract / freelance"
            checked={contractValue}
            onChange={v => setValue('contract_preferred', v, { shouldDirty: true })}
          />
          <Toggle
            label="Remote work"
            checked={remoteValue}
            onChange={v => setValue('remote_ok', v, { shouldDirty: true })}
          />
          <Toggle
            label="On-site"
            checked={onsiteValue}
            onChange={v => setValue('onsite_ok', v, { shouldDirty: true })}
          />
        </div>
      </Section>

      {/* Budget */}
      <Section title="Budget range (hourly)" desc="Approximate hourly rate range in USD. Used for candidate matching only.">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Min ($/hr)"
            type="number"
            min={0}
            max={10000}
            placeholder="25"
            {...register('budget_min_hourly', {
              min: { value: 0,     message: 'Min 0' },
              max: { value: 10000, message: 'Max 10000' },
            })}
          />
          <Input
            label="Max ($/hr)"
            type="number"
            min={0}
            max={10000}
            placeholder="150"
            {...register('budget_max_hourly', {
              min: { value: 0,     message: 'Min 0' },
              max: { value: 10000, message: 'Max 10000' },
            })}
          />
        </div>
      </Section>

      {/* Urgency */}
      <Section title="Hiring timeline">
        <Select
          label="When do you plan to hire?"
          placeholder="Select timeline"
          options={URGENCY_OPTIONS}
          {...register('hiring_urgency')}
        />
      </Section>

      {/* Save */}
      <div className="flex items-center justify-end gap-3 pt-1">
        {isDirty && <p className="text-xs text-muted">Unsaved changes</p>}
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={!isDirty}
          leftIcon={<Save size={14} aria-hidden="true" />}
        >
          Save hiring preferences
        </Button>
      </div>
    </form>
  )
}
