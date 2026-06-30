'use client'

import { useForm }       from 'react-hook-form'
import { useState }      from 'react'
import { Save }          from 'lucide-react'
import { Input }         from '@/components/ui/input'
import { Textarea }      from '@/components/ui/textarea'
import { Select }        from '@/components/ui/select'
import { Button }        from '@/components/ui/button'
import { toast }         from '@/components/ui/toast'
import { AvatarUpload }  from './avatar-upload'
import type { CandidateRoleEnum } from '@/lib/supabase/types'

/* ─── Constants ─────────────────────────────────────────────────────────── */

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

const URL_PATTERN = /^https?:\/\/.+/

function isValidUrl(v: string) {
  return !v || URL_PATTERN.test(v) || 'Must start with https://'
}

/* ─── Types ─────────────────────────────────────────────────────────────── */

export interface ProfileData {
  id: string
  full_name: string | null
  pronouns: string | null
  bio: string | null
  primary_role: CandidateRoleEnum | null
  years_experience: number | null
  location_city: string | null
  location_country: string | null
  timezone: string | null
  phone: string | null
  portfolio_url: string | null
  linkedin_url: string | null
  instagram_url: string | null
  website_url: string | null
  resume_url: string | null
  avatar_url: string | null
}

interface FormValues {
  full_name: string
  pronouns: string
  bio: string
  primary_role: string
  years_experience: string
  location_city: string
  location_country: string
  timezone: string
  phone: string
  portfolio_url: string
  linkedin_url: string
  instagram_url: string
  website_url: string
  resume_url: string
}

/* ─── Section wrapper ───────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-5">
      <h2 className="text-sm font-semibold text-foreground mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function ProfileForm({ profile }: { profile: ProfileData }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      full_name:        profile.full_name        ?? '',
      pronouns:         profile.pronouns         ?? '',
      bio:              profile.bio              ?? '',
      primary_role:     profile.primary_role     ?? '',
      years_experience: profile.years_experience?.toString() ?? '',
      location_city:    profile.location_city    ?? '',
      location_country: profile.location_country ?? '',
      timezone:         profile.timezone         ?? '',
      phone:            profile.phone            ?? '',
      portfolio_url:    profile.portfolio_url    ?? '',
      linkedin_url:     profile.linkedin_url     ?? '',
      instagram_url:    profile.instagram_url    ?? '',
      website_url:      profile.website_url      ?? '',
      resume_url:       profile.resume_url       ?? '',
    },
  })

  const bioValue = watch('bio')

  const onSubmit = async (values: FormValues) => {
    const payload: Record<string, unknown> = {
      full_name:        values.full_name        || undefined,
      pronouns:         values.pronouns         || undefined,
      bio:              values.bio              || undefined,
      primary_role:     values.primary_role     || null,
      years_experience: values.years_experience ? parseInt(values.years_experience, 10) : null,
      location_city:    values.location_city    || undefined,
      location_country: values.location_country || undefined,
      timezone:         values.timezone         || undefined,
      phone:            values.phone            || undefined,
      portfolio_url:    values.portfolio_url,
      linkedin_url:     values.linkedin_url,
      instagram_url:    values.instagram_url,
      website_url:      values.website_url,
      resume_url:       values.resume_url,
    }

    try {
      const res  = await fetch('/api/candidate/profile', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const json = await res.json() as { success: boolean; error?: { message: string } }

      if (!json.success) {
        toast.error(json.error?.message ?? 'Failed to save. Try again.')
        return
      }

      toast.success('Profile saved.')
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Avatar */}
      <div className="rounded-2xl border border-border bg-card px-6 py-5">
        <AvatarUpload
          currentUrl={avatarUrl}
          name={profile.full_name ?? ''}
          onUploaded={setAvatarUrl}
        />
      </div>

      {/* Personal info */}
      <Section title="Personal info">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full name"
            placeholder="Jane Doe"
            error={errors.full_name?.message}
            {...register('full_name', { required: 'Name is required', maxLength: { value: 100, message: 'Max 100 characters' } })}
          />
          <Input
            label="Pronouns"
            placeholder="she/her"
            {...register('pronouns', { maxLength: { value: 50, message: 'Max 50 characters' } })}
          />
        </div>
        <Input
          label="Phone"
          type="tel"
          placeholder="+91 98765 43210"
          {...register('phone', { maxLength: { value: 30, message: 'Max 30 characters' } })}
        />
      </Section>

      {/* About */}
      <Section title="About you">
        <Textarea
          label="Bio"
          placeholder="Tell employers a bit about yourself and what you're looking for…"
          rows={4}
          maxLength={600}
          showCount
          value={bioValue}
          {...register('bio', { maxLength: { value: 600, message: 'Max 600 characters' } })}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Primary role"
            placeholder="Select a role"
            options={ROLE_OPTIONS}
            {...register('primary_role')}
          />
          <Input
            label="Years of experience"
            type="number"
            min={0}
            max={50}
            placeholder="3"
            {...register('years_experience', {
              min: { value: 0,  message: 'Min 0' },
              max: { value: 50, message: 'Max 50' },
            })}
          />
        </div>
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
        <Input
          label="Timezone"
          placeholder="Asia/Kolkata"
          {...register('timezone', { maxLength: { value: 100, message: 'Max 100 characters' } })}
        />
      </Section>

      {/* Links */}
      <Section title="Links">
        <Input
          label="Portfolio URL"
          type="url"
          placeholder="https://myportfolio.com"
          error={errors.portfolio_url?.message}
          {...register('portfolio_url', { validate: isValidUrl })}
        />
        <Input
          label="LinkedIn"
          type="url"
          placeholder="https://linkedin.com/in/yourname"
          error={errors.linkedin_url?.message}
          {...register('linkedin_url', { validate: isValidUrl })}
        />
        <Input
          label="Instagram"
          type="url"
          placeholder="https://instagram.com/yourhandle"
          error={errors.instagram_url?.message}
          {...register('instagram_url', { validate: isValidUrl })}
        />
        <Input
          label="Website"
          type="url"
          placeholder="https://yourwebsite.com"
          error={errors.website_url?.message}
          {...register('website_url', { validate: isValidUrl })}
        />
        <Input
          label="Resume / CV URL"
          type="url"
          placeholder="https://drive.google.com/..."
          error={errors.resume_url?.message}
          {...register('resume_url', { validate: isValidUrl })}
        />
      </Section>

      {/* Save */}
      <div className="flex items-center justify-end gap-3 pt-1">
        {isDirty && (
          <p className="text-xs text-muted">Unsaved changes</p>
        )}
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={!isDirty}
          leftIcon={<Save size={14} aria-hidden="true" />}
        >
          Save profile
        </Button>
      </div>
    </form>
  )
}
