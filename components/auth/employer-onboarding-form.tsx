'use client'

import { useState }            from 'react'
import { useForm, useWatch }   from 'react-hook-form'
import { Building2, Clock, CheckCircle2 } from 'lucide-react'
import { Input }         from '@/components/ui/input'
import { Textarea }      from '@/components/ui/textarea'
import { Select }        from '@/components/ui/select'
import { Button }        from '@/components/ui/button'

const SIZE_OPTIONS = [
  { value: '1-10',    label: '1–10 employees' },
  { value: '11-50',   label: '11–50 employees' },
  { value: '51-200',  label: '51–200 employees' },
  { value: '201-500', label: '201–500 employees' },
  { value: '500+',    label: '500+ employees' },
]

interface FormValues {
  company_name: string
  company_url:  string
  industry:     string
  company_size: string
  note:         string
}

interface EmployerOnboardingFormProps {
  email?: string
}

export function EmployerOnboardingForm({ email }: EmployerOnboardingFormProps) {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { company_name: '', company_url: '', industry: '', company_size: '', note: '' },
  })

  const noteValue = useWatch({ control, name: 'note', defaultValue: '' })

  const onSubmit = async (values: FormValues) => {
    const res  = await fetch('/api/employer/onboarding', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(values),
    })
    const json = await res.json() as { success: boolean; error?: { message: string } }
    if (json.success) {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-16">
        <div className="w-full max-w-110 space-y-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.1)' }}
            aria-hidden="true"
          >
            <CheckCircle2 size={28} strokeWidth={1.5} style={{ color: '#10B981' }} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Request submitted.</h1>
            <p className="text-base text-muted leading-relaxed">
              {email && (
                <>We&apos;ll reach out to <span className="font-semibold text-foreground">{email}</span> within 1–2 business days.</>
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-flax bg-cream/40 p-5 space-y-3">
            <p className="text-sm font-semibold text-charcoal">What happens next</p>
            <ol className="space-y-2 text-sm text-stone list-none">
              {[
                'Our team reviews your company details',
                'You receive a login link by email within 1–2 business days',
                'Approved? Your employer dashboard unlocks instantly',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mt-0.5"
                    style={{ background: 'rgba(107,95,174,0.12)', color: '#6B5FAE' }}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-16">
      <div className="w-full max-w-110 space-y-8">

        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(43,56,117,0.1)' }}
          aria-hidden="true"
        >
          <Building2 size={28} strokeWidth={1.5} style={{ color: '#2B3875' }} />
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Tell us about your company.
          </h1>
          <p className="text-base text-muted leading-relaxed">
            Our team reviews every employer request. Fill in your company details so we can vet your account.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Company name"
            placeholder="Acme Studio"
            error={errors.company_name?.message}
            {...register('company_name', { required: 'Company name is required', maxLength: { value: 100, message: 'Max 100 characters' } })}
          />

          <Input
            label="Company website"
            type="url"
            placeholder="https://acmestudio.com"
            error={errors.company_url?.message}
            {...register('company_url', {
              validate: v => !v || /^https?:\/\/.+/.test(v) || 'Must start with https://',
            })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Industry"
              placeholder="Design & Advertising"
              {...register('industry', { maxLength: { value: 100, message: 'Max 100 characters' } })}
            />
            <Select
              label="Company size"
              placeholder="Select size"
              options={SIZE_OPTIONS}
              {...register('company_size')}
            />
          </div>

          <Textarea
            label="What are you looking for?"
            placeholder="e.g. We're a boutique branding agency hiring motion designers and brand designers on a project basis…"
            rows={3}
            maxLength={500}
            showCount
            value={noteValue}
            {...register('note', { maxLength: { value: 500, message: 'Max 500 characters' } })}
          />

          <Button type="submit" variant="primary" size="md" loading={isSubmitting} className="w-full">
            Submit request
          </Button>
        </form>

        {/* Note */}
        <div className="flex items-start gap-3 text-xs text-muted">
          <Clock size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
          We review every employer account within 1–2 business days.
        </div>
      </div>
    </div>
  )
}
