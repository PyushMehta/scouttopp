'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence }           from 'framer-motion'
import {
  X, MapPin, Briefcase, Clock, Globe, Link2,
  ExternalLink, FileText, Bookmark, BookmarkCheck, ChevronRight,
  Layers, DollarSign,
} from 'lucide-react'
import { createPortal } from 'react-dom'
import { Avatar }       from '@/components/ui/avatar'
import { Badge }        from '@/components/ui/badge'
import { Skeleton }     from '@/components/ui/skeleton'
import { cn }           from '@/lib/utils'
import { overlayVariants } from '@/lib/tokens'

const ROLE_LABELS: Record<string, string> = {
  motion_designer:   'Motion Designer',
  graphic_designer:  'Graphic Designer',
  ux_designer:       'UX Designer',
  brand_designer:    'Brand Designer',
  illustrator:       'Illustrator',
  photographer:      'Photographer',
  videographer:      'Videographer',
  creative_director: 'Creative Director',
  art_director:      'Art Director',
  copywriter:        'Copywriter',
  social_media:      'Social Media',
  other:             'Creative',
}

const LEVEL_VARIANT: Record<string, 'default' | 'primary' | 'success'> = {
  beginner:     'default',
  intermediate: 'primary',
  expert:       'success',
}

export interface CandidateProfile {
  id:               string
  full_name:        string
  pronouns:         string | null
  location_city:    string | null
  location_country: string | null
  timezone:         string | null
  bio:              string | null
  avatar_url:       string | null
  primary_role:     string | null
  years_experience: number | null
  portfolio_url:    string | null
  linkedin_url:     string | null
  instagram_url:    string | null
  website_url:      string | null
  has_portfolio:    boolean
  specialties:      { name: string; level: string | null }[]
  preferences: {
    open_to_remote:   boolean
    open_to_onsite:   boolean
    open_to_hybrid:   boolean
    open_to_contract: boolean
    open_to_fulltime: boolean
    rate_min_hourly:  number | null
    rate_max_hourly:  number | null
    available_from:   string | null
    notice_period_days: number | null
  } | null
  portfolio_items: {
    id: string; title: string; description: string | null
    media_url: string; thumbnail_url: string | null
    media_type: string | null; sort_order: number
  }[]
  swipe_state: 'none' | 'saved' | 'passed'
  note: string
}

interface CandidateProfilePanelProps {
  candidateId: string | null
  onClose:     () => void
  onSave:      (id: string) => void
  onPass:      (id: string) => void
  isSaved?:    boolean
  isPassed?:   boolean
}

export function CandidateProfilePanel({
  candidateId,
  onClose,
  onSave,
  onPass,
  isSaved,
  isPassed,
}: CandidateProfilePanelProps) {
  const [profile,    setProfile]    = useState<CandidateProfile | null>(null)
  const [loading,    setLoading]    = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const [savePending, setSavePending] = useState(false)
  const [passPending, setPassPending] = useState(false)

  const open = Boolean(candidateId)

  useEffect(() => {
    if (!candidateId) { setProfile(null); return }
    setLoading(true)
    setProfile(null)
    fetch(`/api/discovery/${candidateId}`)
      .then(r => r.json() as Promise<{ data: CandidateProfile }>)
      .then(json => setProfile(json.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [candidateId])

  // Lock body scroll when open
  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden' }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (lightboxIdx !== null) setLightboxIdx(null)
      else onClose()
    }
  }, [lightboxIdx, onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [handleEscape])

  const handleSave = async () => {
    if (!candidateId || savePending) return
    setSavePending(true)
    onSave(candidateId)
    setSavePending(false)
  }

  const handlePass = async () => {
    if (!candidateId || passPending) return
    setPassPending(true)
    onPass(candidateId)
    setPassPending(false)
    onClose()
  }

  const saved  = isSaved  ?? profile?.swipe_state === 'saved'
  const passed = isPassed ?? profile?.swipe_state === 'passed'

  const location = profile
    ? [profile.location_city, profile.location_country].filter(Boolean).join(', ')
    : ''

  const workTypes: string[] = []
  if (profile?.preferences?.open_to_remote)   workTypes.push('Remote')
  if (profile?.preferences?.open_to_hybrid)   workTypes.push('Hybrid')
  if (profile?.preferences?.open_to_onsite)   workTypes.push('Onsite')

  const engTypes: string[] = []
  if (profile?.preferences?.open_to_contract) engTypes.push('Contract')
  if (profile?.preferences?.open_to_fulltime) engTypes.push('Full-time')

  if (typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={profile?.full_name ?? 'Candidate profile'}>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className="relative z-10 flex flex-col bg-card border-l border-border w-full max-w-lg h-full overflow-hidden"
          >
            {/* Sticky header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors"
                aria-label="Back to discovery"
              >
                <ChevronRight size={14} className="rotate-180" aria-hidden="true" />
                Back
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={passPending || passed}
                  onClick={handlePass}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted border border-border hover:border-destructive/40 hover:text-destructive hover:bg-destructive/8 transition-colors disabled:opacity-40"
                  aria-label="Pass on this candidate"
                >
                  <X size={13} aria-hidden="true" />
                  {passed ? 'Passed' : 'Pass'}
                </button>
                <button
                  type="button"
                  disabled={savePending}
                  onClick={handleSave}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40',
                    saved
                      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15'
                      : 'text-secondary border-secondary/30 bg-secondary/10 hover:bg-secondary/20',
                  )}
                  aria-label={saved ? 'Unsave candidate' : 'Save candidate'}
                >
                  {saved
                    ? <><BookmarkCheck size={13} aria-hidden="true" />Saved</>
                    : <><Bookmark size={13} aria-hidden="true" />Save</>
                  }
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="p-6 space-y-5">
                  <div className="flex items-start gap-4">
                    <Skeleton width={64} height={64} rounded="full" className="shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <Skeleton height={18} className="w-2/3" />
                      <Skeleton height={13} className="w-1/3" />
                      <Skeleton height={11} className="w-1/4" />
                    </div>
                  </div>
                  <Skeleton height={12} className="w-full" />
                  <Skeleton height={12} className="w-4/5" />
                  <Skeleton height={12} className="w-3/5" />
                </div>
              )}

              {!loading && profile && (
                <>
                  {/* Profile header */}
                  <div className="px-6 pt-6 pb-5 border-b border-border/50">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar
                        src={profile.avatar_url ?? undefined}
                        name={profile.full_name}
                        size="xl"
                        className="shrink-0 ring-2 ring-border"
                      />
                      <div className="flex-1 min-w-0 pt-1">
                        <h2 className="text-lg font-extrabold text-foreground leading-tight">
                          {profile.full_name}
                          {profile.pronouns && (
                            <span className="ml-2 text-sm font-normal text-muted">({profile.pronouns})</span>
                          )}
                        </h2>
                        {profile.primary_role && (
                          <p className="text-sm text-muted mt-0.5">
                            {ROLE_LABELS[profile.primary_role] ?? profile.primary_role}
                            {profile.years_experience !== null && ` · ${profile.years_experience}y exp`}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-2">
                          {location && (
                            <div className="flex items-center gap-1">
                              <MapPin size={12} className="text-muted/60" aria-hidden="true" />
                              <span className="text-xs text-muted">{location}</span>
                            </div>
                          )}
                          {profile.timezone && (
                            <div className="flex items-center gap-1">
                              <Clock size={12} className="text-muted/60" aria-hidden="true" />
                              <span className="text-xs text-muted">{profile.timezone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                      <p className="text-sm text-muted leading-relaxed">{profile.bio}</p>
                    )}
                  </div>

                  {/* Specialties */}
                  {profile.specialties.length > 0 && (
                    <section className="px-6 py-5 border-b border-border/50" aria-label="Skills">
                      <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.specialties.map(s => (
                          <span key={s.name} className="flex items-center gap-1.5">
                            <span
                              className="px-2.5 py-1 rounded-lg text-xs font-medium"
                              style={{ background: 'rgba(107,95,174,0.12)', color: '#8B81C3' }}
                            >
                              {s.name}
                            </span>
                            {s.level && (
                              <Badge variant={LEVEL_VARIANT[s.level] ?? 'default'} size="sm">
                                {s.level}
                              </Badge>
                            )}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Work preferences */}
                  {profile.preferences && (
                    <section className="px-6 py-5 border-b border-border/50" aria-label="Work preferences">
                      <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Preferences</h3>
                      <div className="space-y-3">
                        {workTypes.length > 0 && (
                          <div className="flex items-start gap-2">
                            <MapPin size={13} className="text-muted/50 mt-0.5 shrink-0" aria-hidden="true" />
                            <div>
                              <p className="text-xs text-muted mb-1">Work location</p>
                              <div className="flex flex-wrap gap-1.5">
                                {workTypes.map(t => (
                                  <span key={t} className="text-xs font-medium px-2 py-0.5 rounded-md bg-white/6 border border-border text-foreground">{t}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        {engTypes.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Briefcase size={13} className="text-muted/50 mt-0.5 shrink-0" aria-hidden="true" />
                            <div>
                              <p className="text-xs text-muted mb-1">Engagement type</p>
                              <div className="flex flex-wrap gap-1.5">
                                {engTypes.map(t => (
                                  <span key={t} className="text-xs font-medium px-2 py-0.5 rounded-md bg-white/6 border border-border text-foreground">{t}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        {(profile.preferences.rate_min_hourly !== null || profile.preferences.rate_max_hourly !== null) && (
                          <div className="flex items-center gap-2">
                            <DollarSign size={13} className="text-muted/50 shrink-0" aria-hidden="true" />
                            <div>
                              <p className="text-xs text-muted">Hourly rate</p>
                              <p className="text-xs font-medium text-foreground mt-0.5">
                                {profile.preferences.rate_min_hourly !== null ? `$${profile.preferences.rate_min_hourly}` : '—'}
                                {' – '}
                                {profile.preferences.rate_max_hourly !== null ? `$${profile.preferences.rate_max_hourly}` : '—'}
                                /hr
                              </p>
                            </div>
                          </div>
                        )}
                        {profile.preferences.available_from !== null && (
                          <div className="flex items-center gap-2">
                            <Clock size={13} className="text-muted/50 shrink-0" aria-hidden="true" />
                            <div>
                              <p className="text-xs text-muted">Availability</p>
                              <p className="text-xs font-medium text-foreground mt-0.5">
                                {new Date(profile.preferences.available_from) <= new Date()
                                  ? 'Available now'
                                  : `From ${new Date(profile.preferences.available_from).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
                                {profile.preferences.notice_period_days != null && ` · ${profile.preferences.notice_period_days}d notice`}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {/* Portfolio */}
                  {profile.portfolio_items.length > 0 && (
                    <section className="px-6 py-5 border-b border-border/50" aria-label="Portfolio">
                      <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Portfolio</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {profile.portfolio_items.map((item, idx) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setLightboxIdx(idx)}
                            className="aspect-square rounded-lg overflow-hidden bg-surface border border-border hover:border-primary/40 transition-colors group/item"
                            aria-label={item.title}
                          >
                            {(item.thumbnail_url ?? item.media_url) && item.media_type !== 'link' && item.media_type !== 'pdf' ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.thumbnail_url ?? item.media_url}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Layers size={18} className="text-muted/40" aria-hidden="true" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Links */}
                  {(profile.portfolio_url || profile.linkedin_url || profile.instagram_url || profile.website_url) && (
                    <section className="px-6 py-5" aria-label="Links">
                      <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Links</h3>
                      <div className="space-y-2">
                        {profile.portfolio_url && (
                          <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-foreground hover:text-primary transition-colors">
                            <Layers size={14} className="text-muted shrink-0" aria-hidden="true" />
                            <span className="truncate">Portfolio</span>
                            <ExternalLink size={11} className="text-muted/50 shrink-0 ml-auto" aria-hidden="true" />
                          </a>
                        )}
                        {profile.linkedin_url && (
                          <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-foreground hover:text-primary transition-colors">
                            <Link2 size={14} className="text-muted shrink-0" aria-hidden="true" />
                            <span className="truncate">LinkedIn</span>
                            <ExternalLink size={11} className="text-muted/50 shrink-0 ml-auto" aria-hidden="true" />
                          </a>
                        )}
                        {profile.instagram_url && (
                          <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-foreground hover:text-primary transition-colors">
                            <Link2 size={14} className="text-muted shrink-0" aria-hidden="true" />
                            <span className="truncate">Instagram</span>
                            <ExternalLink size={11} className="text-muted/50 shrink-0 ml-auto" aria-hidden="true" />
                          </a>
                        )}
                        {profile.website_url && (
                          <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-foreground hover:text-primary transition-colors">
                            <Globe size={14} className="text-muted shrink-0" aria-hidden="true" />
                            <span className="truncate">Website</span>
                            <ExternalLink size={11} className="text-muted/50 shrink-0 ml-auto" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>

            {/* Messaging placeholder footer */}
            <div className="px-6 py-4 border-t border-border shrink-0">
              <button
                type="button"
                disabled
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-border/40 text-muted/40 cursor-not-allowed select-none"
                title="Messaging launches in a future update"
              >
                <FileText size={15} aria-hidden="true" />
                Message — Coming soon
              </button>
            </div>
          </motion.div>

          {/* Portfolio lightbox */}
          <AnimatePresence>
            {lightboxIdx !== null && profile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-black/90 flex items-center justify-center p-4"
                onClick={() => setLightboxIdx(null)}
                aria-label="Portfolio item viewer"
              >
                <button
                  type="button"
                  onClick={() => setLightboxIdx(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  aria-label="Close lightbox"
                >
                  <X size={20} aria-hidden="true" />
                </button>
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="max-w-2xl w-full"
                  onClick={e => e.stopPropagation()}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.portfolio_items[lightboxIdx].media_url}
                    alt={profile.portfolio_items[lightboxIdx].title}
                    className="w-full rounded-xl max-h-[70dvh] object-contain"
                  />
                  <p className="text-white text-sm font-medium mt-3 text-center">
                    {profile.portfolio_items[lightboxIdx].title}
                  </p>
                  {profile.portfolio_items[lightboxIdx].description && (
                    <p className="text-white/60 text-xs mt-1 text-center">
                      {profile.portfolio_items[lightboxIdx].description}
                    </p>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
