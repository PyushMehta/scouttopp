import { notFound }         from 'next/navigation'
import Link                  from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { Badge }             from '@/components/ui/badge'
import { CandidateActions }  from '@/components/dashboard/candidate-actions'
import { ChevronLeft, ExternalLink } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

const STATUS_BADGE: Record<string, { variant: 'default' | 'success' | 'destructive' | 'warning' }> = {
  pending:   { variant: 'warning' },
  promoted:  { variant: 'success' },
  rejected:  { variant: 'destructive' },
  duplicate: { variant: 'default' },
  error:     { variant: 'destructive' },
}

function fmtRole(role: string | null) {
  if (!role) return null
  return role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function ProfileField({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value && value !== 0) return null
  return (
    <div>
      <dt className="text-xs font-medium text-muted mb-0.5">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  )
}

function LinkField({ label, url }: { label: string; url: string | null | undefined }) {
  if (!url) return null
  const isAbsolute = /^https?:\/\//i.test(url)
  const display = url.replace(/^https?:\/\//i, '').slice(0, 50) + (url.length > 53 ? '…' : '')
  return (
    <div>
      <dt className="text-xs font-medium text-muted mb-0.5">{label}</dt>
      <dd>
        {isAbsolute ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-secondary hover:underline underline-offset-2"
          >
            {display}
            <ExternalLink size={11} />
          </a>
        ) : (
          <span className="text-sm text-foreground">{url}</span>
        )}
      </dd>
    </div>
  )
}

export default async function CandidateDetailPage({ params }: PageProps) {
  const { id }   = await params
  const supabase = createServiceClient()

  const { data: staging } = await supabase
    .from('candidate_sync_staging')
    .select('*')
    .eq('id', id)
    .single()

  if (!staging) notFound()

  const mapped = staging.mapped_data as Record<string, unknown> | null
  const raw    = staging.raw_data    as Record<string, unknown>

  const name    = (mapped?.full_name    ?? raw?.['Full Name'] ?? raw?.['Name'] ?? '') as string
  const email   = (mapped?.email        ?? raw?.['Email']                        ?? '') as string
  const phone   = (mapped?.phone        ?? null) as string | null
  const city    = (mapped?.location_city    ?? null) as string | null
  const country = (mapped?.location_country ?? null) as string | null
  const role    = fmtRole((mapped?.primary_role ?? null) as string | null)
  const years   = (mapped?.years_experience ?? null) as number | null
  const bio     = (mapped?.bio  ?? null) as string | null
  const badge   = STATUS_BADGE[staging.status] ?? { variant: 'default' as const }

  return (
    <div className="px-8 py-8 max-w-3xl">
      {/* Back link */}
      <Link
        href="/dashboard/admin/candidates"
        className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft size={14} /> Back to candidates
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border border-border bg-card px-6 py-5 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">{name || '(No name)'}</h1>
            <p className="text-sm text-muted mt-0.5">{email}</p>
            {role && <p className="text-sm text-secondary mt-1">{role}</p>}
          </div>
          <Badge variant={badge.variant} dot>
            {staging.status.charAt(0).toUpperCase() + staging.status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-2xl border border-border bg-card px-6 py-5 mb-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Decision</h2>
        <CandidateActions stagingId={staging.id} status={staging.status} />
      </div>

      {/* Profile details */}
      <div className="rounded-2xl border border-border bg-card px-6 py-5 mb-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Profile Details</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <ProfileField label="Full Name"         value={name} />
          <ProfileField label="Email"             value={email} />
          <ProfileField label="Phone"             value={phone} />
          <ProfileField label="City"              value={city} />
          <ProfileField label="Country"           value={country} />
          <ProfileField label="Role"              value={role} />
          <ProfileField label="Years Experience"  value={years != null ? `${years} yrs` : null} />
          {bio && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-muted mb-0.5">Bio</dt>
              <dd className="text-sm text-foreground leading-relaxed whitespace-pre-line">{bio}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Links */}
      {!!(mapped?.portfolio_url || mapped?.linkedin_url || mapped?.instagram_url || mapped?.website_url || mapped?.resume_url) && (
        <div className="rounded-2xl border border-border bg-card px-6 py-5 mb-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Links</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <LinkField label="Portfolio"  url={mapped?.portfolio_url as string | null} />
            <LinkField label="LinkedIn"   url={mapped?.linkedin_url  as string | null} />
            <LinkField label="Instagram"  url={mapped?.instagram_url as string | null} />
            <LinkField label="Website"    url={mapped?.website_url   as string | null} />
            <LinkField label="Resume"     url={mapped?.resume_url    as string | null} />
          </dl>
        </div>
      )}

      {/* Raw data (collapsible via details/summary) */}
      <details className="rounded-2xl border border-border bg-card px-6 py-4">
        <summary className="text-xs font-medium text-muted cursor-pointer select-none">
          Raw sheet data
        </summary>
        <pre className="mt-3 text-xs text-muted font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
          {JSON.stringify(raw, null, 2)}
        </pre>
      </details>
    </div>
  )
}
