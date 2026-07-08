'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams }                from 'next/navigation'
import { motion, AnimatePresence }                   from 'framer-motion'
import { SlidersHorizontal, RefreshCw, Users2, Telescope, Star } from 'lucide-react'
import { toast }                                     from 'sonner'
import { ScoutDeck }                                 from './scout-deck'
import { ScoutFilterSheet }                          from './scout-filter-sheet'
import { CandidateProfilePanel }                     from './candidate-profile-panel'
import { countActiveFilters, EMPTY_FILTERS }         from './filter-panel'
import type { DiscoveryFilters }                     from './filter-panel'
import { Button }                                    from '@/components/ui/button'
import { Skeleton }                                  from '@/components/ui/skeleton'
import type { CandidateCardPayload }                 from '@/app/api/discovery/route'
import { fadeUpVariants }                            from '@/lib/tokens'

/* ── URL ↔ Filter helpers ─────────────────────────────────────────────────── */

function filtersToParams(f: DiscoveryFilters): URLSearchParams {
  const p = new URLSearchParams()
  if (f.q)                p.set('q',                f.q)
  if (f.role.length)      p.set('role',             f.role.join(','))
  if (f.skills.length)    p.set('skills',           f.skills.join(','))
  if (f.location_country) p.set('location_country', f.location_country)
  if (f.location_city)    p.set('location_city',    f.location_city)
  if (f.remote)           p.set('remote',    '1')
  if (f.hybrid)           p.set('hybrid',    '1')
  if (f.onsite)           p.set('onsite',    '1')
  if (f.contract)         p.set('contract',  '1')
  if (f.fulltime)         p.set('fulltime',  '1')
  if (f.rate_max)         p.set('rate_max',  f.rate_max)
  if (f.exp_min)          p.set('exp_min',   f.exp_min)
  if (f.exp_max)          p.set('exp_max',   f.exp_max)
  if (f.available_now)    p.set('available_now',  '1')
  if (f.has_portfolio)    p.set('has_portfolio',  '1')
  return p
}

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

function buildApiUrl(f: DiscoveryFilters, cursor?: string) {
  const p = filtersToParams(f)
  if (cursor) p.set('cursor', cursor)
  return `/api/discovery?${p.toString()}`
}

/* ── Component ────────────────────────────────────────────────────────────── */

type ScoutPhase = 'preflight' | 'scouting'

interface ScoutModeProps {
  initialFilters: DiscoveryFilters
}

export function ScoutMode({ initialFilters }: ScoutModeProps) {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [phase,         setPhase]         = useState<ScoutPhase>('preflight')
  const [filterOpen,    setFilterOpen]    = useState(false)
  const [filters,       setFilters]       = useState<DiscoveryFilters>(initialFilters)
  const [candidates,    setCandidates]    = useState<CandidateCardPayload[]>([])
  const [nextCursor,    setNextCursor]    = useState<string | null>(null)
  const [total,         setTotal]         = useState<number | null>(null)
  const [loading,       setLoading]       = useState(false)
  const [loadingMore,   setLoadingMore]   = useState(false)
  const [error,         setError]         = useState(false)
  const [profileId,     setProfileId]     = useState<string | null>(null)

  const filtersRef   = useRef(filters)
  filtersRef.current = filters

  /* ── Fetch ──────────────────────────────────────────────────────────────── */

  const fetchCandidates = useCallback(async (f: DiscoveryFilters, replace = true) => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(buildApiUrl(f))
      if (!res.ok) {
        const body = await res.json().catch(() => null) as { error?: { message?: string } } | null
        console.error('[ScoutMode] /api/discovery returned', res.status, body?.error?.message ?? body)
        throw new Error()
      }
      const json = await res.json() as { data: CandidateCardPayload[]; nextCursor: string | null; total: number | null }
      if (replace) setCandidates(json.data ?? [])
      else         setCandidates(prev => [...prev, ...(json.data ?? [])])
      setNextCursor(json.nextCursor)
      setTotal(json.total)
    } catch (err) {
      console.error('[ScoutMode] fetch failed:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMore = useCallback(async () => {
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
  }, [nextCursor, loadingMore])

  /* ── Start scouting ─────────────────────────────────────────────────────── */

  const handleStartScouting = useCallback(async (confirmedFilters: DiscoveryFilters) => {
    setFilters(confirmedFilters)
    const qs = filtersToParams(confirmedFilters).toString()
    router.replace(qs ? `?${qs}` : '?', { scroll: false })
    setPhase('scouting')
    await fetchCandidates(confirmedFilters)
  }, [router, fetchCandidates])

  const handleOpenFilters = () => {
    setFilters(filtersFromParams(new URLSearchParams(searchParams.toString())))
    setFilterOpen(true)
  }

  /* ── Scout / Pass API calls (called by deck after animation) ────────────── */

  const handleScout = useCallback(async (id: string) => {
    try {
      const res  = await fetch('/api/discovery/save', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ candidate_id: id }),
      })
      const json = await res.json() as { success: boolean }
      if (!json.success) throw new Error()
      toast.success('Scouted! Candidate saved to your list.')
    } catch {
      toast.error('Failed to save. Please try again.')
    }
  }, [])

  const handlePass = useCallback(async (id: string) => {
    try {
      const res  = await fetch('/api/discovery/pass', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ candidate_id: id }),
      })
      const json = await res.json() as { success: boolean }
      if (!json.success) throw new Error()
    } catch {
      // Pass failure is silent (non-blocking UX)
      console.error('Pass failed for', id)
    }
  }, [])

  const activeFilterCount = countActiveFilters(filters)

  /* ── Render: pre-flight ─────────────────────────────────────────────────── */

  if (phase === 'preflight') {
    return (
      <>
        <motion.div
          className="flex flex-col items-center justify-center min-h-[60dvh] gap-8 px-4"
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Icon */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl shadow-secondary/20"
            style={{ background: 'linear-gradient(135deg, #2B3875 0%, #6B5FAE 100%)' }}
          >
            <Telescope size={36} className="text-white" aria-hidden="true" />
          </div>

          {/* Headline */}
          <div className="text-center max-w-sm">
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight mb-2">
              Scout Mode
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Swipe through pre-vetted creative talent. Scout the ones you want, pass on the rest.
            </p>
          </div>

          {/* How it works */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
            {[
              { icon: '←', label: 'Swipe left to pass', color: '#EF4444' },
              { icon: '↩', label: 'Undo last action',   color: '#6B7280' },
              { icon: '→', label: 'Swipe right to scout', color: '#10B981' },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center gap-2 text-center">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                  style={{ background: `${item.color}20`, color: item.color }}
                >
                  {item.icon}
                </div>
                <p className="text-[10px] text-muted leading-tight">{item.label}</p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => handleStartScouting(filters)}
            >
              <Star size={16} className="mr-2" aria-hidden="true" />
              Start Scouting
            </Button>
            <Button
              variant="outline"
              size="md"
              className="w-full"
              onClick={() => setFilterOpen(true)}
            >
              <SlidersHorizontal size={14} className="mr-2" aria-hidden="true" />
              Set Filters
              {activeFilterCount > 0 && (
                <span
                  className="ml-1.5 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ background: 'rgba(43,56,117,0.9)', color: '#fff' }}
                >
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </motion.div>

        <ScoutFilterSheet
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          filters={filters}
          onConfirm={handleStartScouting}
        />
      </>
    )
  }

  /* ── Render: scouting ───────────────────────────────────────────────────── */

  return (
    <>
      {/* Top bar: title + filter button */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-foreground tracking-tight">Scout Mode</h1>
          {total !== null && (
            <p className="text-xs text-muted mt-0.5">
              {total === 0 ? 'No candidates match your filters.' : `${total} candidate${total === 1 ? '' : 's'} in your pool`}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleOpenFilters}
          className="flex items-center gap-2 px-3 h-9 rounded-lg border border-border text-sm text-muted hover:text-foreground hover:border-border/80 transition-colors shrink-0"
          aria-label="Open filters"
        >
          <SlidersHorizontal size={14} aria-hidden="true" />
          Filters
          {activeFilterCount > 0 && (
            <span
              className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
              style={{ background: 'rgba(43,56,117,0.9)', color: '#fff' }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* States */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center w-full max-w-sm mx-auto gap-4"
          >
            <ScoutCardSkeleton />
            <div className="flex items-center justify-center gap-6 py-4 w-full">
              <div className="w-[62px] h-[62px] rounded-full bg-surface animate-pulse" />
              <div className="w-10 h-10 rounded-full bg-surface animate-pulse" />
              <div className="w-[62px] h-[62px] rounded-full bg-surface animate-pulse" />
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-4 py-20 text-center"
          >
            <p className="text-sm text-muted">Something went wrong loading candidates.</p>
            <Button variant="outline" size="sm" onClick={() => fetchCandidates(filtersRef.current)}>
              <RefreshCw size={14} className="mr-2" aria-hidden="true" />
              Try again
            </Button>
          </motion.div>
        ) : candidates.length === 0 ? (
          <motion.div
            key="empty"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-5 py-20 text-center max-w-xs mx-auto"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(107,95,174,0.12)' }}
            >
              <Users2 size={28} className="text-muted/50" aria-hidden="true" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground mb-1">
                {activeFilterCount > 0 ? 'No candidates match your filters.' : 'You\'ve reviewed everyone!'}
              </p>
              <p className="text-xs text-muted leading-relaxed">
                {activeFilterCount > 0
                  ? 'Try adjusting your filters to widen your search.'
                  : 'New talent is added regularly. Check back soon.'
                }
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              {activeFilterCount > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStartScouting(EMPTY_FILTERS)}
                >
                  Clear filters &amp; retry
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPhase('preflight')}
              >
                Back to Scout Mode home
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="deck"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="flex justify-center"
          >
            <ScoutDeck
              candidates={candidates}
              total={total}
              onScout={handleScout}
              onPass={handlePass}
              onLoadMore={loadMore}
              hasMore={!!nextCursor}
              onViewProfile={id => setProfileId(id)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter sheet */}
      <ScoutFilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onConfirm={handleStartScouting}
      />

      {/* Full profile panel */}
      <CandidateProfilePanel
        candidateId={profileId}
        onClose={() => setProfileId(null)}
        onSave={async (id) => { await handleScout(id) }}
        onPass={async (id) => { await handlePass(id) }}
        isSaved={false}
        isPassed={false}
      />
    </>
  )
}

/* ── Scout card loading skeleton ─────────────────────────────────────────── */

function ScoutCardSkeleton() {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card overflow-hidden">
      <Skeleton height={300} className="w-full rounded-none" />
      <div className="px-5 pt-4 pb-5 space-y-3">
        <Skeleton height={22} className="w-2/3" />
        <Skeleton height={14} className="w-1/2" />
        <div className="flex gap-2">
          <Skeleton height={22} className="w-20 rounded-md" />
          <Skeleton height={22} className="w-24 rounded-md" />
          <Skeleton height={22} className="w-16 rounded-md" />
        </div>
        <Skeleton height={38} className="w-full rounded-xl" />
      </div>
    </div>
  )
}
