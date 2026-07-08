'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter }                                 from 'next/navigation'
import { BookmarkCheck, Search, Users2, RefreshCw }  from 'lucide-react'
import { toast }                                     from 'sonner'
import { SavedCandidateRow }                         from '@/components/discovery/saved-candidate-row'
import { CandidateProfilePanel }                     from '@/components/discovery/candidate-profile-panel'
import { Button }                                    from '@/components/ui/button'
import { Skeleton }                                  from '@/components/ui/skeleton'
import type { SavedCandidate }                       from '@/components/discovery/saved-candidate-row'

interface SavedPage {
  data:       SavedCandidate[]
  nextCursor: string | null
}

export default function SavedCandidatesPage() {
  const router = useRouter()
  const [candidates,  setCandidates]  = useState<SavedCandidate[]>([])
  const [nextCursor,  setNextCursor]  = useState<string | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error,       setError]       = useState(false)
  const [query,       setQuery]       = useState('')
  const [profileId,   setProfileId]   = useState<string | null>(null)

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const queryRef    = useRef(query)
  queryRef.current  = query

  const fetchSaved = useCallback(async (q = '') => {
    setLoading(true)
    setError(false)
    try {
      const res  = await fetch(`/api/discovery/saved${q ? `?q=${encodeURIComponent(q)}` : ''}`)
      if (res.status === 401 || res.status === 403) { router.push('/auth/login'); return }
      const json = await res.json() as SavedPage
      setCandidates(json.data ?? [])
      setNextCursor(json.nextCursor)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchSaved() }, [fetchSaved])

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const q   = queryRef.current
      const url = `/api/discovery/saved?cursor=${encodeURIComponent(nextCursor)}${q ? `&q=${encodeURIComponent(q)}` : ''}`
      const res  = await fetch(url)
      const json = await res.json() as SavedPage
      setCandidates(prev => [...prev, ...(json.data ?? [])])
      setNextCursor(json.nextCursor)
    } catch {
      toast.error('Failed to load more.')
    } finally {
      setLoadingMore(false)
    }
  }

  const handleSearch = (q: string) => {
    setQuery(q)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => fetchSaved(q), 350)
  }

  const handleUnsave = (id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="px-5 lg:px-8 py-6 lg:py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Saved</h1>
            {!loading && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}
              >
                {candidates.length}{nextCursor ? '+' : ''}
              </span>
            )}
          </div>
          <p className="text-sm text-muted">Candidates you&apos;ve bookmarked — add private notes to keep track of your thoughts.</p>
        </div>
        <BookmarkCheck size={24} className="text-emerald-400/60 shrink-0 mt-1" aria-hidden="true" />
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-input focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all mb-5">
        <Search size={14} className="text-muted shrink-0" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search saved candidates…"
          className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted focus:outline-none"
          aria-label="Search saved candidates"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
              <Skeleton width={40} height={40} rounded="full" className="shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton height={14} className="w-2/5" />
                <Skeleton height={11} className="w-1/3" />
                <Skeleton height={10} className="w-3/5 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center space-y-4">
          <p className="text-sm text-muted">Something went wrong loading your saved candidates.</p>
          <Button variant="outline" size="sm" onClick={() => fetchSaved(query)}>
            <RefreshCw size={14} className="mr-2" aria-hidden="true" /> Try again
          </Button>
        </div>
      ) : candidates.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center space-y-3">
          <Users2 size={32} className="text-muted/30 mx-auto" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">
            {query ? 'No saved candidates match your search.' : 'No saved candidates yet.'}
          </p>
          <p className="text-xs text-muted">
            {query
              ? 'Try a different search term.'
              : 'Head to the Discover page and start saving candidates you’re interested in.'}
          </p>
          {!query && (
            <Button
              variant="primary"
              size="sm"
              className="mt-2"
              onClick={() => router.push('/dashboard/employer/candidates')}
            >
              Browse candidates
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {candidates.map(c => (
            <SavedCandidateRow
              key={c.id}
              candidate={c}
              onUnsave={handleUnsave}
              onViewProfile={setProfileId}
            />
          ))}

          {nextCursor && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" size="md" loading={loadingMore} onClick={loadMore}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Profile panel */}
      <CandidateProfilePanel
        candidateId={profileId}
        onClose={() => setProfileId(null)}
        onSave={() => {}}
        onPass={() => {}}
      />
    </div>
  )
}
