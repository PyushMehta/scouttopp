'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams }                from 'next/navigation'
import { Search, Users2, RefreshCw }                 from 'lucide-react'
import { toast }                                     from 'sonner'
import { CandidateCard }                             from './candidate-card'
import { CandidateCardSkeletonGrid }                 from './candidate-card-skeleton'
import { CandidateProfilePanel }                     from './candidate-profile-panel'
import {
  FilterSidebar, FilterDrawer, FilterDrawerButton,
  countActiveFilters, EMPTY_FILTERS,
  type DiscoveryFilters,
} from './filter-panel'
import { Button }                                    from '@/components/ui/button'
import type { CandidateCardPayload }                 from '@/app/api/discovery/route'

/* ─── URL ↔ Filter helpers ───────────────────────────────────────────────── */

function filtersFromParams(params: URLSearchParams): DiscoveryFilters {
  return {
    q:                params.get('q')                ?? '',
    role:             params.get('role')?.split(',').filter(Boolean) ?? [],
    skills:           params.get('skills')?.split(',').filter(Boolean) ?? [],
    location_country: params.get('location_country') ?? '',
    location_city:    params.get('location_city')    ?? '',
    remote:           params.get('remote')   === '1',
    hybrid:           params.get('hybrid')   === '1',
    onsite:           params.get('onsite')   === '1',
    contract:         params.get('contract') === '1',
    fulltime:         params.get('fulltime') === '1',
    rate_max:         params.get('rate_max') ?? '',
    exp_min:          params.get('exp_min')  ?? '',
    exp_max:          params.get('exp_max')  ?? '',
    available_now:    params.get('available_now')  === '1',
    has_portfolio:    params.get('has_portfolio')  === '1',
  }
}

function filtersToParams(f: DiscoveryFilters): URLSearchParams {
  const p = new URLSearchParams()
  if (f.q)                p.set('q',                f.q)
  if (f.role.length)      p.set('role',             f.role.join(','))
  if (f.skills.length)    p.set('skills',           f.skills.join(','))
  if (f.location_country) p.set('location_country', f.location_country)
  if (f.location_city)    p.set('location_city',    f.location_city)
  if (f.remote)           p.set('remote',   '1')
  if (f.hybrid)           p.set('hybrid',   '1')
  if (f.onsite)           p.set('onsite',   '1')
  if (f.contract)         p.set('contract', '1')
  if (f.fulltime)         p.set('fulltime', '1')
  if (f.rate_max)         p.set('rate_max', f.rate_max)
  if (f.exp_min)          p.set('exp_min',  f.exp_min)
  if (f.exp_max)          p.set('exp_max',  f.exp_max)
  if (f.available_now)    p.set('available_now',  '1')
  if (f.has_portfolio)    p.set('has_portfolio',  '1')
  return p
}

function buildApiUrl(f: DiscoveryFilters, cursor?: string) {
  const p = filtersToParams(f)
  if (cursor) p.set('cursor', cursor)
  return `/api/discovery?${p.toString()}`
}

/* ─── Component ─────────────────────────────────────────────────────────── */

interface DiscoveryFeedProps {
  initialFilters: DiscoveryFilters
}

export function DiscoveryFeed({ initialFilters }: DiscoveryFeedProps) {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [filters,       setFilters]       = useState<DiscoveryFilters>(initialFilters)
  const [candidates,    setCandidates]    = useState<CandidateCardPayload[]>([])
  const [nextCursor,    setNextCursor]    = useState<string | null>(null)
  const [total,         setTotal]         = useState<number | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [loadingMore,   setLoadingMore]   = useState(false)
  const [error,         setError]         = useState(false)
  const [drawerOpen,    setDrawerOpen]    = useState(false)
  const [profileId,     setProfileId]     = useState<string | null>(null)

  // Optimistic save/pass state — maps candidateId → 'saved' | 'passed'
  const [actions, setActions] = useState<Map<string, 'saved' | 'passed'>>(new Map())
  // Pending API calls
  const [pendingSave, setPendingSave] = useState<Set<string>>(new Set())
  const [pendingPass, setPendingPass] = useState<Set<string>>(new Set())

  const filtersRef = useRef(filters)
  filtersRef.current = filters

  /* ── Fetch feed ─────────────────────────────────────────────────────── */
  const fetchFeed = useCallback(async (f: DiscoveryFilters) => {
    setLoading(true)
    setError(false)
    try {
      const res  = await fetch(buildApiUrl(f))
      const json = await res.json() as { data: CandidateCardPayload[]; nextCursor: string | null; total: number | null }
      setCandidates(json.data ?? [])
      setNextCursor(json.nextCursor)
      setTotal(json.total)
      setActions(new Map())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  /* ── Load more ──────────────────────────────────────────────────────── */
  const loadMore = async () => {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const res  = await fetch(buildApiUrl(filtersRef.current, nextCursor))
      const json = await res.json() as { data: CandidateCardPayload[]; nextCursor: string | null }
      setCandidates(prev => [...prev, ...(json.data ?? [])])
      setNextCursor(json.nextCursor)
    } catch {
      toast.error('Failed to load more candidates.')
    } finally {
      setLoadingMore(false)
    }
  }

  /* ── Filter change: update URL + re-fetch ───────────────────────────── */
  const handleFilterChange = useCallback((f: DiscoveryFilters) => {
    setFilters(f)
    const qs = filtersToParams(f).toString()
    router.replace(qs ? `?${qs}` : '?', { scroll: false })
    fetchFeed(f)
  }, [router, fetchFeed])

  /* ── Debounced search ─────────────────────────────────────────────── */
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleSearchChange = (q: string) => {
    const updated = { ...filtersRef.current, q }
    setFilters(updated)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      const qs = filtersToParams(updated).toString()
      router.replace(qs ? `?${qs}` : '?', { scroll: false })
      fetchFeed(updated)
    }, 350)
  }

  /* ── Reset filters ──────────────────────────────────────────────────── */
  const handleReset = () => handleFilterChange({ ...EMPTY_FILTERS, q: filtersRef.current.q })

  /* ── Save candidate ─────────────────────────────────────────────────── */
  const handleSave = async (id: string) => {
    const alreadySaved = actions.get(id) === 'saved'

    // Optimistic
    setActions(prev => {
      const next = new Map(prev)
      if (alreadySaved) next.delete(id)
      else next.set(id, 'saved')
      return next
    })
    setPendingSave(prev => new Set(prev).add(id))

    try {
      const res  = await fetch('/api/discovery/save', {
        method:  alreadySaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ candidate_id: id }),
      })
      const json = await res.json() as { success: boolean }
      if (!json.success) throw new Error()
      if (!alreadySaved) toast.success('Candidate saved.')
    } catch {
      // Rollback
      setActions(prev => {
        const next = new Map(prev)
        if (alreadySaved) next.set(id, 'saved')
        else next.delete(id)
        return next
      })
      toast.error('Failed to save. Please try again.')
    } finally {
      setPendingSave(prev => { const s = new Set(prev); s.delete(id); return s })
    }
  }

  /* ── Pass candidate ─────────────────────────────────────────────────── */
  const handlePass = async (id: string) => {
    // Optimistic: remove from feed immediately
    setCandidates(prev => prev.filter(c => c.id !== id))
    setActions(prev => { const next = new Map(prev); next.set(id, 'passed'); return next })
    setPendingPass(prev => new Set(prev).add(id))

    try {
      const res  = await fetch('/api/discovery/pass', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ candidate_id: id }),
      })
      const json = await res.json() as { success: boolean }
      if (!json.success) throw new Error()
    } catch {
      // Rollback — re-add candidate. We don't have the object here so just re-fetch.
      toast.error('Failed to pass. Please try again.')
      fetchFeed(filtersRef.current)
    } finally {
      setPendingPass(prev => { const s = new Set(prev); s.delete(id); return s })
    }
  }

  /* ── Initial load ────────────────────────────────────────────────────── */
  useEffect(() => {
    fetchFeed(initialFilters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeFilterCount = countActiveFilters(filters)
  const visibleCandidates = candidates.filter(c => actions.get(c.id) !== 'passed')

  return (
    <div className="flex gap-6 items-start">
      {/* Desktop filter sidebar */}
      <FilterSidebar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
      />

      <div className="flex flex-col gap-4 flex-1 min-w-0">
      {/* Search + filter row */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-input focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Search size={14} className="text-muted shrink-0" aria-hidden="true" />
          <input
            type="search"
            value={filters.q}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search by name, role, or bio…"
            className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted focus:outline-none"
            aria-label="Search candidates"
          />
          {filters.q && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="text-muted hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <span className="text-xs">✕</span>
            </button>
          )}
        </div>

        {/* Mobile filter button */}
        <div className="lg:hidden">
          <FilterDrawerButton activeCount={activeFilterCount} onClick={() => setDrawerOpen(true)} />
        </div>
      </div>

      {/* Total count */}
      {total !== null && !loading && (
        <p className="text-xs text-muted">
          {total === 0 ? 'No candidates match your filters.' : `${total} candidate${total === 1 ? '' : 's'} found`}
        </p>
      )}

      {/* Feed content */}
      {loading ? (
        <CandidateCardSkeletonGrid count={6} />
      ) : error ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center space-y-4">
          <p className="text-sm text-muted">Something went wrong loading candidates.</p>
          <Button variant="outline" size="sm" onClick={() => fetchFeed(filtersRef.current)}>
            <RefreshCw size={14} className="mr-2" aria-hidden="true" /> Try again
          </Button>
        </div>
      ) : visibleCandidates.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center space-y-3">
          <Users2 size={32} className="text-muted/30 mx-auto" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">
            {activeFilterCount > 0 ? 'No candidates match your filters.' : 'You\'ve reviewed all available candidates.'}
          </p>
          <p className="text-xs text-muted">
            {activeFilterCount > 0
              ? 'Try adjusting or clearing your filters.'
              : 'Check back soon — new candidates are added regularly.'
            }
          </p>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-secondary hover:underline mt-2"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {visibleCandidates.map(candidate => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                isSaved={actions.get(candidate.id) === 'saved'}
                onSave={handleSave}
                onPass={handlePass}
                onViewProfile={id => setProfileId(id)}
                savePending={pendingSave.has(candidate.id)}
                passPending={pendingPass.has(candidate.id)}
              />
            ))}
          </div>

          {nextCursor && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="md"
                loading={loadingMore}
                onClick={loadMore}
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Profile panel */}
      <CandidateProfilePanel
        candidateId={profileId}
        onClose={() => setProfileId(null)}
        onSave={handleSave}
        onPass={handlePass}
        isSaved={profileId ? actions.get(profileId) === 'saved' : false}
        isPassed={profileId ? actions.get(profileId) === 'passed' : false}
      />

      {/* Mobile filter drawer */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
      />
      </div>
    </div>
  )
}
