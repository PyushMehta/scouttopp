'use client'

import { useForm, useWatch }  from 'react-hook-form'
import { useState }           from 'react'
import { Save }               from 'lucide-react'
import { Input }              from '@/components/ui/input'
import { Textarea }           from '@/components/ui/textarea'
import { Select }             from '@/components/ui/select'
import { Button }             from '@/components/ui/button'
import { toast }              from '@/components/ui/toast'
import { LogoUpload }         from './logo-upload'

const COMPANY_SIZE_OPTIONS = [
  { value: '1-10',    label: '1 – 10 employees' },
  { value: '11-50',   label: '11 – 50 employees' },
  { value: '51-200',  label: '51 – 200 employees' },
  { value: '201-500', label: '201 – 500 employees' },
  { value: '500+',    label: '500+ employees' },
]

const INDUSTRY_OPTIONS = [
  { value: 'Advertising & Marketing', label: 'Advertising & Marketing' },
  { value: 'Architecture & Design',   label: 'Architecture & Design' },
  { value: 'Consumer Goods',          label: 'Consumer Goods' },
  { value: 'E-commerce',              label: 'E-commerce' },
  { value: 'Entertainment & Media',   label: 'Entertainment & Media' },
  { value: 'Fashion & Apparel',       label: 'Fashion & Apparel' },
  { value: 'Financial Services',      label: 'Financial Services' },
  { value: 'Food & Beverage',         label: 'Food & Beverage' },
  { value: 'Healthcare',              label: 'Healthcare' },
  { value: 'Hospitality & Travel',    label: 'Hospitality & Travel' },
  { value: 'Non-profit',              label: 'Non-profit' },
  { value: 'Real Estate',             label: 'Real Estate' },
  { value: 'Software & Technology',   label: 'Software & Technology' },
  { value: 'Sports & Fitness',        label: 'Sports & Fitness' },
  { value: 'Other',                   label: 'Other' },
]

const URL_PATTERN = /^https?:\/\/.+/
function isValidUrl(v: string) {
  return !v || URL_PATTERN.test(v) || 'Must start with https://'
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-5">
      <h2 className="text-sm font-semibold text-foreground mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

export interface CompanyProfileData {
  id:               string
  company_name:     string | null
  bio:              string | null
  industry:         string | null
  company_size:     string | null
  company_url:      string | null
  linkedin_url:     string | null
  founded_year:     number | null
  location_city:    string | null
  location_country: string | null
  logo_url:         string | null
}

interface FormValues {
  company_name:     string
  bio:              string
  industry:         string
  company_size:     string
  company_url:      string
  linkedin_url:     string
  founded_year:     string
  location_city:    string
  location_country: string
}

export function CompanyForm({
  profile,
  logoSignedUrl,
}: {
  profile:       CompanyProfileData
  logoSignedUrl: string | null
}) {
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(logoSignedUrl)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      company_name:     profile.company_name     ?? '',
      bio:              profile.bio              ?? '',
      industry:         profile.industry         ?? '',
      company_size:     profile.company_size     ?? '',
      company_url:      profile.company_url      ?? '',
      linkedin_url:     profile.linkedin_url     ?? '',
      founded_year:     profile.founded_year?.toString() ?? '',
      location_city:    profile.location_city    ?? '',
      location_country: profile.location_country ?? '',
    },
  })

  const bioValue = useWatch({ control, name: 'bio', defaultValue: profile.bio ?? '' })

  const onSubmit = async (values: FormValues) => {
    const payload: Record<string, unknown> = {
      company_name:     values.company_name     || null,
      bio:              values.bio              || null,
      industry:         values.industry         || null,
      company_size:     values.company_size     || null,
      company_url:      values.company_url      || null,
      linkedin_url:     values.linkedin_url     || null,
      founded_year:     values.founded_year ? parseInt(values.founded_year, 10) : null,
      location_city:    values.location_city    || null,
      location_country: values.location_country || null,
    }

    try {
      const res  = await fetch('/api/employer/profile', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const json = await res.json() as { success: boolean; error?: { message: string } }

      if (!json.success) {
        toast.error(json.error?.message ?? 'Failed to save. Try again.')
        return
      }

      toast.success('Company profile saved.')
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Logo */}
      <div className="rounded-2xl border border-border bg-card px-6 py-5">
        <LogoUpload
          currentUrl={currentLogoUrl}
          name={profile.company_name ?? '?'}
          onUploaded={setCurrentLogoUrl}
        />
      </div>

      {/* Company info */}
      <Section title="Company info">
        <Input
          label="Company name"
          placeholder="Acme Studio"
          error={errors.company_name?.message}
          {...register('company_name', {
            required: 'Company name is required',
            maxLength: { value: 200, message: 'Max 200 characters' },
          })}
        />
        <Textarea
          label="Company description"
          placeholder="Tell candidates about your company, culture, and what makes you a great place to work…"
          rows={4}
          maxLength={1000}
          showCount
          value={bioValue}
          {...register('bio', { maxLength: { value: 1000, message: 'Max 1000 characters' } })}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Industry"
            placeholder="Select industry"
            options={INDUSTRY_OPTIONS}
            {...register('industry')}
          />
          <Select
            label="Company size"
            placeholder="Select size"
            options={COMPANY_SIZE_OPTIONS}
            {...register('company_size')}
          />
        </div>
        <Input
          label="Founded year"
          type="number"
          min={1800}
          max={new Date().getFullYear()}
          placeholder="2019"
          error={errors.founded_year?.message}
          {...register('founded_year', {
            min: { value: 1800, message: 'Year must be after 1800' },
            max: { value: new Date().getFullYear(), message: 'Year cannot be in the future' },
          })}
        />
      </Section>

      {/* Location */}
      <Section title="Location">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="City"
            placeholder="Mumbai"
            {...register('location_city', { maxLength: { value: 100, message: 'Max 100 characters' } })}
          />
          <Input
            label="Country"
            placeholder="India"
            {...register('location_country', { maxLength: { value: 100, message: 'Max 100 characters' } })}
          />
        </div>
      </Section>

      {/* Links */}
      <Section title="Links">
        <Input
          label="Website"
          type="url"
          placeholder="https://yourcompany.com"
          error={errors.company_url?.message}
          {...register('company_url', { validate: isValidUrl })}
        />
        <Input
          label="LinkedIn"
          type="url"
          placeholder="https://linkedin.com/company/yourcompany"
          error={errors.linkedin_url?.message}
          {...register('linkedin_url', { validate: isValidUrl })}
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
          Save company profile
        </Button>
      </div>
    </form>
  )
}
