import Link              from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { Badge }         from '@/components/ui/badge'
import { ExternalLink }  from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

const STAGING_BADGE: Record<string, { variant: 'default' | 'success' | 'destructive' | 'warning'; label: string }> = {
  pending:   { variant: 'warning',     label: 'Pending' },
  rejected:  { variant: 'destructive', label: 'Rejected' },
  duplicate: { variant: 'default',     label: 'Duplicate' },
  error:     { variant: 'destructive', label: 'Error' },
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtRole(role: string | null) {
  if (!role) return '—'
  return role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

type StagingStatus = 'pending' | 'rejected' | 'duplicate' | 'error'
const VALID_STAGING: StagingStatus[] = ['pending', 'rejected', 'duplicate', 'error']

async function getStagingRows(status: StagingStatus, page: number) {
  const supabase = createServiceClient()
  const limit  = 25
  const offset = (page - 1) * limit
  const { data, count } = await supabase
    .from('candidate_sync_staging')
    .select('id, raw_data, mapped_data, status, created_at', { count: 'exact' })
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  return { rows: data ?? [], total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) }
}

async function getApprovedCandidates(page: number) {
  const supabase = createServiceClient()
  const limit  = 25
  const offset = (page - 1) * limit
  const { data, count } = await supabase
    .from('candidate_profiles')
    .select('id, full_name, email, primary_role, location_city, location_country, approved_at, is_discoverable', { count: 'exact' })
    .order('approved_at', { ascending: false })
    .range(offset, offset + limit - 1)
  return { rows: data ?? [], total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) }
}

async function getCounts() {
  const supabase = createServiceClient()
  const [pending, rejected, duplicate, approved] = await Promise.all([
    supabase.from('candidate_sync_staging').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('candidate_sync_staging').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
    supabase.from('candidate_sync_staging').select('id', { count: 'exact', head: true }).eq('status', 'duplicate'),
    supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }),
  ])
  return {
    pending:   pending.count   ?? 0,
    rejected:  rejected.count  ?? 0,
    duplicate: duplicate.count ?? 0,
    approved:  approved.count  ?? 0,
  }
}

export default async function AdminCandidatesPage({ searchParams }: PageProps) {
  const { status = 'pending', page: pageStr = '1' } = await searchParams
  const page = Math.max(1, parseInt(pageStr, 10))

  const isApproved   = status === 'approved'
  const stagingStatus: StagingStatus = VALID_STAGING.includes(status as StagingStatus)
    ? (status as StagingStatus)
    : 'pending'

  const [stagingResult, approvedResult, counts] = await Promise.all([
    isApproved ? Promise.resolve({ rows: [], total: 0, totalPages: 0 }) : getStagingRows(stagingStatus, page),
    isApproved ? getApprovedCandidates(page) : Promise.resolve({ rows: [], total: 0, totalPages: 0 }),
    getCounts(),
  ])

  const { rows: stagingRows, total: stagingTotal, totalPages: stagingTotalPages } = stagingResult
  const { rows: approvedRows, total: approvedTotal, totalPages: approvedTotalPages } = approvedResult

  const total      = isApproved ? approvedTotal      : stagingTotal
  const totalPages = isApproved ? approvedTotalPages : stagingTotalPages

  const tabs = [
    { key: 'pending',   label: 'Pending',   count: counts.pending },
    { key: 'approved',  label: 'Approved',  count: counts.approved },
    { key: 'rejected',  label: 'Rejected',  count: counts.rejected },
    { key: 'duplicate', label: 'Duplicate', count: counts.duplicate },
  ]

  return (
    <div className="px-8 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Candidates</h1>
        <p className="mt-1 text-sm text-muted">Review synced candidates from Google Sheets.</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {tabs.map(({ key, label, count }) => (
          <Link
            key={key}
            href={`/dashboard/admin/candidates?status=${key}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-150 ${
              status === key
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            {label}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-md ${
              status === key ? 'bg-primary/15 text-secondary' : 'bg-white/8 text-muted'
            }`}>
              {count}
            </span>
          </Link>
        ))}
      </div>

      {/* Approved tab — canonical candidate_profiles */}
      {isApproved && (
        approvedRows.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-8 py-16 text-center">
            <p className="text-sm text-muted">No approved candidates yet.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Approved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {approvedRows.map(row => (
                  <tr key={row.id} className="hover:bg-white/2 transition-colors duration-100">
                    <td className="px-5 py-3.5 font-medium text-foreground">{row.full_name ?? '—'}</td>
                    <td className="px-5 py-3.5 text-muted">{row.email ?? '—'}</td>
                    <td className="px-5 py-3.5 text-muted">{fmtRole(row.primary_role)}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant="success" size="sm" dot>
                        {row.is_discoverable ? 'Live' : 'Hidden'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-muted">{row.approved_at ? fmtDate(row.approved_at) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                <p className="text-xs text-muted">Showing {((page - 1) * 25) + 1}–{Math.min(page * 25, total)} of {total}</p>
                <div className="flex gap-2">
                  {page > 1 && <Link href={`/dashboard/admin/candidates?status=approved&page=${page - 1}`} className="text-xs font-medium text-secondary hover:underline">← Previous</Link>}
                  {page < totalPages && <Link href={`/dashboard/admin/candidates?status=approved&page=${page + 1}`} className="text-xs font-medium text-secondary hover:underline">Next →</Link>}
                </div>
              </div>
            )}
          </div>
        )
      )}

      {/* Staging tabs — pending / rejected / duplicate */}
      {!isApproved && (
        stagingRows.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-8 py-16 text-center">
            <p className="text-sm text-muted">No {status} candidates.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Synced</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-muted uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stagingRows.map(row => {
                  const mapped = row.mapped_data as Record<string, unknown> | null
                  const raw    = row.raw_data    as Record<string, unknown>
                  const name   = (mapped?.full_name ?? raw?.['Full Name'] ?? raw?.['Name'] ?? '—') as string
                  const email  = (mapped?.email     ?? raw?.['Email']                       ?? '—') as string
                  const role   = (mapped?.primary_role ?? null) as string | null
                  const badge  = STAGING_BADGE[row.status] ?? { variant: 'default' as const, label: row.status }
                  return (
                    <tr key={row.id} className="hover:bg-white/2 transition-colors duration-100">
                      <td className="px-5 py-3.5 font-medium text-foreground">{name}</td>
                      <td className="px-5 py-3.5 text-muted">{email}</td>
                      <td className="px-5 py-3.5 text-muted">{fmtRole(role)}</td>
                      <td className="px-5 py-3.5"><Badge variant={badge.variant} size="sm" dot>{badge.label}</Badge></td>
                      <td className="px-5 py-3.5 text-muted">{fmtDate(row.created_at)}</td>
                      <td className="px-5 py-3.5 text-right">
                        {status === 'pending' ? (
                          <Link href={`/dashboard/admin/candidates/${row.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-secondary hover:underline">
                            Review <ExternalLink size={11} />
                          </Link>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                <p className="text-xs text-muted">Showing {((page - 1) * 25) + 1}–{Math.min(page * 25, total)} of {total}</p>
                <div className="flex gap-2">
                  {page > 1 && <Link href={`/dashboard/admin/candidates?status=${status}&page=${page - 1}`} className="text-xs font-medium text-secondary hover:underline">← Previous</Link>}
                  {page < totalPages && <Link href={`/dashboard/admin/candidates?status=${status}&page=${page + 1}`} className="text-xs font-medium text-secondary hover:underline">Next →</Link>}
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  )
}
