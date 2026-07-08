'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  AnimatePresence,
} from 'framer-motion'
import { MapPin, Briefcase, Clock, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { cn }    from '@/lib/utils'
import type { CandidateCardPayload } from '@/app/api/discovery/route'

export interface CardPortfolioItem {
  id:            string
  title:         string
  media_url:     string
  thumbnail_url: string | null
  media_type:    string | null
}

export type SwipeDir = 'scout' | 'pass'

export interface ScoutCardProps {
  candidate:       CandidateCardPayload
  portfolioItems?: CardPortfolioItem[] | null  // null = loading, [] = no items
  isActive:        boolean
  forceDismiss:    SwipeDir | null
  onAction:        (dir: SwipeDir) => void     // fires immediately when threshold crossed
  onDismissed:     () => void                  // fires after exit animation completes
  onViewProfile:   () => void
}

const SWIPE_THRESHOLD = 90    // px offset
const SWIPE_VELOCITY  = 450   // px/s
const EXIT_X          = 680   // px

export function ScoutCard({
  candidate,
  portfolioItems,
  isActive,
  forceDismiss,
  onAction,
  onDismissed,
  onViewProfile,
}: ScoutCardProps) {
  const [portfolioIdx, setPortfolioIdx] = useState(0)
  const hasCommitted = useRef(false)

  const x        = useMotionValue(0)
  const rotate   = useTransform(x, [-260, 0, 260], [-18, 0, 18])
  const scoutOpacity = useTransform(x, [0, 45, 120], [0, 0.7, 1])
  const passOpacity  = useTransform(x, [-120, -45, 0], [1, 0.7, 0])
  const controls = useAnimation()

  // Hero images: portfolio thumbnails if loaded, else avatar
  const heroImages = portfolioItems
    ?.filter(p =>
      (p.thumbnail_url || p.media_url) &&
      p.media_type !== 'link' &&
      p.media_type !== 'pdf'
    )
    .map(p => p.thumbnail_url ?? p.media_url)
    .slice(0, 8)
    ?? []
  const heroCount = heroImages.length

  // Reset portfolio index when items change
  useEffect(() => {
    setPortfolioIdx(0)
  }, [candidate.id])

  // Respond to external forceDismiss
  useEffect(() => {
    if (!forceDismiss || hasCommitted.current) return
    hasCommitted.current = true

    const targetX = forceDismiss === 'scout' ? EXIT_X : -EXIT_X
    controls.start({
      x:       targetX,
      opacity: 0,
      rotate:  forceDismiss === 'scout' ? 20 : -20,
      transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] },
    }).then(() => onDismissed())
  }, [forceDismiss, controls, onDismissed])

  const commitSwipe = useCallback((dir: SwipeDir) => {
    if (hasCommitted.current) return
    hasCommitted.current = true
    onAction(dir)
    const targetX = dir === 'scout' ? EXIT_X : -EXIT_X
    controls.start({
      x:       targetX,
      opacity: 0,
      rotate:  dir === 'scout' ? 20 : -20,
      transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] },
    }).then(() => onDismissed())
  }, [controls, onAction, onDismissed])

  const handleDragEnd = useCallback((_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > SWIPE_VELOCITY) {
      commitSwipe('scout')
    } else if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -SWIPE_VELOCITY) {
      commitSwipe('pass')
    }
    // else spring back (dragConstraints handles this)
  }, [commitSwipe])

  const prevPortfolio = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPortfolioIdx(i => Math.max(0, i - 1))
  }
  const nextPortfolio = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPortfolioIdx(i => Math.min(heroCount - 1, i + 1))
  }

  // Candidate info
  const role      = candidate.primary_role
  const allRoles  = candidate.roles ?? []
  const secondary = allRoles.filter(r => !r.is_primary).map(r => r.role_name).slice(0, 2)
  const location  = [candidate.location_city, candidate.location_country].filter(Boolean).join(', ')
  const topSkills = (candidate.specialties ?? []).slice(0, 5)
  const extraSkills = Math.max(0, (candidate.specialties ?? []).length - 5)

  const workChips: string[] = []
  if (candidate.preferences?.open_to_remote)   workChips.push('Remote')
  if (candidate.preferences?.open_to_hybrid)   workChips.push('Hybrid')
  if (candidate.preferences?.open_to_onsite)   workChips.push('On-site')
  if (candidate.preferences?.open_to_fulltime) workChips.push('Full-time')
  if (candidate.preferences?.open_to_contract) workChips.push('Contract')

  const availability = (() => {
    const af = candidate.preferences?.available_from
    if (!af) return null
    return new Date(af) <= new Date()
      ? 'Available now'
      : `From ${new Date(af).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
  })()

  const completeness = candidate.profile_completeness ?? 0
  const completenessColor =
    completeness >= 80 ? '#10B981' :
    completeness >= 50 ? '#F59E0B' : '#6B7280'

  return (
    <motion.div
      drag={isActive && !forceDismiss ? 'x' : false}
      dragElastic={0.15}
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, rotate }}
      animate={controls}
      onDragEnd={handleDragEnd}
      className={cn(
        'w-full select-none',
        isActive ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none',
      )}
      aria-label={`${candidate.full_name}${role ? `, ${role}` : ''}`}
    >
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xl shadow-black/40 w-full">
        {/* ── Hero area ──────────────────────────────────────────────────── */}
        <div className="relative" style={{ height: 300 }}>
          {/* Image or avatar */}
          {heroCount > 0 ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={`${candidate.id}-${portfolioIdx}`}
                src={heroImages[portfolioIdx]}
                alt={`${candidate.full_name} portfolio item ${portfolioIdx + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.6 }}
                transition={{ duration: 0.12 }}
                draggable={false}
              />
            </AnimatePresence>
          ) : candidate.avatar_url ? (
            <img
              src={candidate.avatar_url}
              alt={candidate.full_name}
              className="w-full h-full object-cover object-top"
              draggable={false}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(43,56,117,0.35) 0%, rgba(107,95,174,0.35) 100%)' }}
            >
              <Avatar name={candidate.full_name} size="xl" className="ring-4 ring-border/40 shadow-xl" />
            </div>
          )}

          {/* Top gradient */}
          <div
            className="absolute inset-x-0 top-0 h-20 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45), transparent)' }}
            aria-hidden="true"
          />
          {/* Bottom gradient */}
          <div
            className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
            style={{ background: 'linear-gradient(to top, var(--color-card, #111), transparent)' }}
            aria-hidden="true"
          />

          {/* Portfolio dot strip */}
          {heroCount > 1 && (
            <div className="absolute top-2.5 inset-x-0 flex justify-center gap-1 pointer-events-none" aria-hidden="true">
              {heroImages.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-[3px] rounded-full transition-all duration-300',
                    i === portfolioIdx ? 'w-6 bg-white' : 'w-2 bg-white/35',
                  )}
                />
              ))}
            </div>
          )}

          {/* Portfolio nav buttons */}
          {heroCount > 1 && isActive && (
            <>
              <button
                type="button"
                onClick={prevPortfolio}
                disabled={portfolioIdx === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/60 transition-colors disabled:opacity-0"
                aria-label="Previous portfolio image"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={nextPortfolio}
                disabled={portfolioIdx === heroCount - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/60 transition-colors disabled:opacity-0"
                aria-label="Next portfolio image"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </>
          )}

          {/* SCOUT overlay */}
          <motion.div
            style={{ opacity: scoutOpacity }}
            className="absolute inset-0 flex items-center justify-start pl-5 pb-8 pointer-events-none"
            aria-hidden="true"
          >
            <div className="px-3 py-1.5 rounded-xl font-extrabold text-lg tracking-[0.15em] rotate-[-22deg]"
              style={{ border: '2.5px solid #10B981', color: '#10B981', textShadow: '0 0 20px rgba(16,185,129,0.5)' }}>
              SCOUT
            </div>
          </motion.div>

          {/* PASS overlay */}
          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute inset-0 flex items-center justify-end pr-5 pb-8 pointer-events-none"
            aria-hidden="true"
          >
            <div className="px-3 py-1.5 rounded-xl font-extrabold text-lg tracking-[0.15em] rotate-[22deg]"
              style={{ border: '2.5px solid #EF4444', color: '#EF4444', textShadow: '0 0 20px rgba(239,68,68,0.5)' }}>
              PASS
            </div>
          </motion.div>

          {/* Completeness badge (top-right) */}
          {completeness > 0 && (
            <div className="absolute top-2.5 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/50 backdrop-blur-sm text-white/90 pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: completenessColor }} aria-hidden="true" />
              {completeness}%
            </div>
          )}
        </div>

        {/* ── Info section ──────────────────────────────────────────────── */}
        <div className="px-5 pt-4 pb-4">
          {/* Name + roles */}
          <div className="mb-3">
            <h3 className="text-[18px] font-extrabold text-foreground leading-tight tracking-tight">
              {candidate.full_name}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {role && (
                <span className="text-sm font-medium text-muted">{role}</span>
              )}
              {secondary.map(r => (
                <span
                  key={r}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium"
                  style={{ background: 'rgba(107,95,174,0.14)', color: '#8B81C3' }}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* Meta row: location, exp, availability */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {location && (
              <div className="flex items-center gap-1">
                <MapPin size={11} className="text-muted/60 shrink-0" aria-hidden="true" />
                <span className="text-[11px] text-muted">{location}</span>
              </div>
            )}
            {candidate.years_experience !== null && (
              <div className="flex items-center gap-1">
                <Briefcase size={11} className="text-muted/60 shrink-0" aria-hidden="true" />
                <span className="text-[11px] text-muted">{candidate.years_experience}y exp</span>
              </div>
            )}
            {availability && (
              <div className="flex items-center gap-1">
                <Clock size={11} className="text-muted/60 shrink-0" aria-hidden="true" />
                <span className="text-[11px] text-muted">{availability}</span>
              </div>
            )}
          </div>

          {/* Skills */}
          {topSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {topSkills.map(s => (
                <span
                  key={s.name}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium"
                  style={{ background: 'rgba(107,95,174,0.12)', color: '#8B81C3' }}
                >
                  {s.name}
                </span>
              ))}
              {extraSkills > 0 && (
                <span className="text-[11px] text-muted/50">+{extraSkills}</span>
              )}
            </div>
          )}

          {/* Work type chips */}
          {workChips.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {workChips.slice(0, 4).map(chip => (
                <span
                  key={chip}
                  className="text-[10px] text-muted/70 bg-white/4 px-1.5 py-0.5 rounded-md border border-border/50"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}

          {/* View full profile CTA */}
          {isActive && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onViewProfile() }}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold border border-border/60 text-muted hover:text-foreground hover:border-border transition-colors"
              aria-label={`View ${candidate.full_name}'s full profile`}
            >
              <ExternalLink size={12} aria-hidden="true" />
              View full profile
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ── Static card preview (rendered behind active card) ───────────────────── */

interface StaticCardPreviewProps {
  candidate: CandidateCardPayload
}

export function StaticCardPreview({ candidate }: StaticCardPreviewProps) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden w-full" aria-hidden="true">
      <div className="relative" style={{ height: 300 }}>
        {candidate.avatar_url ? (
          <img
            src={candidate.avatar_url}
            alt=""
            className="w-full h-full object-cover object-top opacity-80"
            draggable={false}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: 'linear-gradient(135deg, rgba(43,56,117,0.25) 0%, rgba(107,95,174,0.25) 100%)' }}
          />
        )}
        <div
          className="absolute inset-x-0 bottom-0 h-28"
          style={{ background: 'linear-gradient(to top, var(--color-card, #111), transparent)' }}
        />
      </div>
      <div className="px-5 pt-4 pb-4">
        <p className="text-[18px] font-extrabold text-foreground leading-tight truncate">{candidate.full_name}</p>
        {candidate.primary_role && (
          <p className="text-sm text-muted mt-1 truncate">{candidate.primary_role}</p>
        )}
      </div>
    </div>
  )
}
