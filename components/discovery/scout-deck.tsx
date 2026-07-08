'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence }                   from 'framer-motion'
import { ScoutCard, StaticCardPreview, type CardPortfolioItem, type SwipeDir } from './scout-card'
import type { CandidateCardPayload } from '@/app/api/discovery/route'

/* ── Stack position config ──────────────────────────────────────────────── */
// Positions for behind-cards: index 0 = directly behind top, index 1 = furthest back
const STACK_BEHIND: { scale: number; y: number; opacity: number }[] = [
  { scale: 0.96, y: 10, opacity: 1 },
  { scale: 0.92, y: 20, opacity: 0.7 },
]

const CARD_HEIGHT = 530 // approximate rendered height in px

interface UndoRecord {
  candidate:  CandidateCardPayload
  portfolioItems: CardPortfolioItem[]
  dir: SwipeDir
}

export interface ScoutDeckProps {
  candidates:    CandidateCardPayload[]
  total:         number | null
  onScout:       (id: string) => Promise<void>
  onPass:        (id: string) => Promise<void>
  onLoadMore:    () => void
  hasMore:       boolean
  onViewProfile: (id: string) => void
}

export function ScoutDeck({
  candidates,
  total,
  onScout,
  onPass,
  onLoadMore,
  hasMore,
  onViewProfile,
}: ScoutDeckProps) {
  // Local stack — we manage removals here so behind cards animate simultaneously
  const [stack,        setStack]        = useState<CandidateCardPayload[]>(candidates)
  const [history,      setHistory]      = useState<UndoRecord[]>([])
  const [dismissDir,   setDismissDir]   = useState<SwipeDir | null>(null)
  const [portfolioCache, setPortfolioCache] = useState<Map<string, CardPortfolioItem[]>>(new Map())

  // Ref mirrors dismissDir so handleDismissed always reads the current direction
  // even when the drag path's .then() closure captured a stale render snapshot.
  const dismissDirRef = useRef<SwipeDir | null>(null)

  // Keep stack in sync when parent candidates list changes (new load batch)
  const prevCandidatesRef = useRef<CandidateCardPayload[]>(candidates)
  useEffect(() => {
    const prev = prevCandidatesRef.current
    prevCandidatesRef.current = candidates
    // Only extend stack with genuinely new items (those not already in stack by id)
    const stackIds = new Set(stack.map(c => c.id))
    const newItems = candidates.filter(c => !stackIds.has(c.id))
    if (newItems.length > 0) {
      setStack(s => [...s, ...newItems])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates])

  // Trigger load-more when stack is getting low
  useEffect(() => {
    if (stack.length <= 3 && hasMore) {
      onLoadMore()
    }
  }, [stack.length, hasMore, onLoadMore])

  // Pre-fetch portfolio items for the top 2 cards
  const fetchPortfolio = useCallback(async (candidateId: string) => {
    if (portfolioCache.has(candidateId)) return
    try {
      const res  = await fetch(`/api/discovery/${candidateId}`)
      const json = await res.json() as { data?: { portfolio_items: CardPortfolioItem[] } }
      setPortfolioCache(prev => {
        const next = new Map(prev)
        next.set(candidateId, json.data?.portfolio_items ?? [])
        return next
      })
    } catch {
      setPortfolioCache(prev => {
        const next = new Map(prev)
        next.set(candidateId, [])
        return next
      })
    }
  }, [portfolioCache])

  useEffect(() => {
    if (stack[0]) fetchPortfolio(stack[0].id)
    if (stack[1]) fetchPortfolio(stack[1].id)
  // Only run when top two card ids change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stack[0]?.id, stack[1]?.id])

  /* ── Action handlers ────────────────────────────────────────────────── */

  // Called immediately when drag threshold crossed (or button pressed)
  const handleAction = useCallback((dir: SwipeDir) => {
    setDismissDir(dir)
    dismissDirRef.current = dir // keep ref in sync for stale-closure safety
  }, [])

  // Called after exit animation completes.
  // Reads direction from ref, not state — the drag path's .then() closure
  // captures an earlier render where dismissDir state is still null.
  const handleDismissed = useCallback(() => {
    const dismissed = stack[0]
    if (!dismissed) return
    const dir = dismissDirRef.current ?? 'pass'

    setHistory(prev => [
      { candidate: dismissed, portfolioItems: portfolioCache.get(dismissed.id) ?? [], dir },
      ...prev.slice(0, 4),
    ])
    setStack(prev => prev.slice(1))
    setDismissDir(null)
    dismissDirRef.current = null

    if (dir === 'scout') onScout(dismissed.id).catch(console.error)
    else                 onPass(dismissed.id).catch(console.error)
  }, [stack, portfolioCache, onScout, onPass])

  /* ── Button-triggered actions (ScoutActions) ────────────────────────── */
  const triggerScout = useCallback(() => {
    if (stack.length === 0 || dismissDir) return
    handleAction('scout')
  }, [stack.length, dismissDir, handleAction])

  const triggerPass = useCallback(() => {
    if (stack.length === 0 || dismissDir) return
    handleAction('pass')
  }, [stack.length, dismissDir, handleAction])

  const triggerUndo = useCallback(() => {
    if (history.length === 0) return
    const [last, ...rest] = history
    setHistory(rest)
    setStack(prev => [last.candidate, ...prev])
    setPortfolioCache(prev => {
      const next = new Map(prev)
      next.set(last.candidate.id, last.portfolioItems)
      return next
    })
  }, [history])

  /* ── Derived ────────────────────────────────────────────────────────── */
  const top    = stack[0] ?? null
  const behind = stack.slice(1, 3) // up to 2 behind cards

  // Progress: total reviewed so far
  const reviewed = (total ?? 0) - stack.length
  const remaining = stack.length

  return (
    <div className="flex flex-col items-center w-full gap-2">
      {/* Progress strip */}
      {total !== null && total > 0 && (
        <div className="w-full max-w-sm px-1 mb-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-muted/60">
              {reviewed > 0 ? `${reviewed} reviewed` : 'Start scouting'}
            </span>
            <span className="text-[11px] text-muted/60">
              {remaining} left
            </span>
          </div>
          <div className="h-0.5 w-full rounded-full bg-border overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #2B3875, #6B5FAE)' }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (reviewed / Math.max(1, total)) * 100)}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </div>
        </div>
      )}

      {/* Card stack */}
      <div
        className="relative w-full max-w-sm"
        style={{ height: CARD_HEIGHT + 40 }} // extra space for stack depth visual
      >
        {/* Behind cards (rendered bottom-up) */}
        {behind.map((candidate, behindIdx) => (
          <motion.div
            key={candidate.id}
            className="absolute inset-x-0 top-0"
            style={{ zIndex: 10 - behindIdx * 5 }}
            animate={
              dismissDir
                ? {
                    scale: STACK_BEHIND[Math.max(0, behindIdx - 1)]?.scale ?? 0.88,
                    y:     STACK_BEHIND[Math.max(0, behindIdx - 1)]?.y     ?? 28,
                    opacity: STACK_BEHIND[Math.max(0, behindIdx - 1)]?.opacity ?? 0.5,
                  }
                : {
                    scale:   STACK_BEHIND[behindIdx]?.scale   ?? 0.88,
                    y:       STACK_BEHIND[behindIdx]?.y       ?? 28,
                    opacity: STACK_BEHIND[behindIdx]?.opacity ?? 0.5,
                  }
            }
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            <StaticCardPreview candidate={candidate} />
          </motion.div>
        ))}

        {/* Active card */}
        <AnimatePresence mode="wait">
          {top && (
            <motion.div
              key={top.id}
              className="absolute inset-x-0 top-0"
              style={{ zIndex: 30 }}
              initial={{ scale: 0.97, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            >
              <ScoutCard
                candidate={top}
                portfolioItems={portfolioCache.get(top.id) ?? null}
                isActive={true}
                forceDismiss={dismissDir}
                onAction={handleAction}
                onDismissed={handleDismissed}
                onViewProfile={() => onViewProfile(top.id)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action bar — exposed as callbacks for parent */}
      <div className="w-full max-w-sm">
        <ActionsBar
          onPass={triggerPass}
          onScout={triggerScout}
          onUndo={triggerUndo}
          canUndo={history.length > 0}
          disabled={!top || !!dismissDir}
        />
      </div>
    </div>
  )
}

/* ── Inline action bar used within the deck ─────────────────────────────── */

import { X, RotateCcw } from 'lucide-react'

function ActionsBar({
  onPass, onScout, onUndo, canUndo, disabled,
}: {
  onPass: () => void; onScout: () => void; onUndo: () => void
  canUndo: boolean; disabled: boolean
}) {
  return (
    <div className="flex items-center justify-center gap-6 py-4" role="group" aria-label="Scout actions">
      <motion.button
        type="button"
        disabled={disabled}
        onClick={onPass}
        whileTap={{ scale: 0.88 }}
        className="w-[62px] h-[62px] rounded-full border-2 border-border flex items-center justify-center bg-card text-muted hover:border-red-500/50 hover:text-red-400 transition-colors disabled:opacity-30 disabled:pointer-events-none shadow-sm"
        aria-label="Pass on this candidate"
      >
        <X size={28} strokeWidth={2.5} aria-hidden="true" />
      </motion.button>

      <motion.button
        type="button"
        disabled={!canUndo || disabled}
        onClick={onUndo}
        whileTap={{ scale: 0.88 }}
        animate={{ opacity: canUndo ? 1 : 0.25 }}
        transition={{ duration: 0.2 }}
        className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-card text-muted/70 hover:text-foreground hover:border-border/80 transition-colors disabled:cursor-not-allowed shadow-sm"
        aria-label="Undo last action"
      >
        <RotateCcw size={16} aria-hidden="true" />
      </motion.button>

      <motion.button
        type="button"
        disabled={disabled}
        onClick={onScout}
        whileTap={{ scale: 0.88 }}
        className="w-[62px] h-[62px] rounded-full flex items-center justify-center text-white shadow-lg shadow-secondary/25 disabled:opacity-30 disabled:pointer-events-none hover:shadow-secondary/40 transition-shadow"
        style={{ background: 'linear-gradient(135deg, #2B3875 0%, #6B5FAE 100%)' }}
        aria-label="Scout this candidate"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01z" />
        </svg>
      </motion.button>
    </div>
  )
}
