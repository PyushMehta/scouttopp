'use client'

import { useState }          from 'react'
import { motion }            from 'framer-motion'
import { MapPin, Briefcase, Bookmark, BookmarkCheck, X, Layers, Clock } from 'lucide-react'
import { Avatar }            from '@/components/ui/avatar'
import { Badge }             from '@/components/ui/badge'
import { cn }                from '@/lib/utils'
import type { CandidateCardPayload } from '@/app/api/discovery/route'

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

export interface CandidateCardProps {
  candidate:  CandidateCardPayload
  isSaved:    boolean
  onSave:     (id: string) => void
  onPass:     (id: string) => void
  onViewProfile: (id: string) => void
  savePending?: boolean
  passPending?: boolean
}

export function CandidateCard({
  candidate,
  isSaved,
  onSave,
  onPass,
  onViewProfile,
  savePending,
  passPending,
}: CandidateCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const role = candidate.primary_role ? (ROLE_LABELS[candidate.primary_role] ?? candidate.primary_role) : null
  const topSpecialties = candidate.specialties.slice(0, 3)

  const workChips: string[] = []
  if (candidate.preferences?.open_to_remote)   workChips.push('Remote')
  if (candidate.preferences?.open_to_hybrid)   workChips.push('Hybrid')
  if (candidate.preferences?.open_to_onsite)   workChips.push('Onsite')
  if (candidate.preferences?.open_to_contract) workChips.push('Contract')
  if (candidate.preferences?.open_to_fulltime) workChips.push('Full-time')

  const location = [candidate.location_city, candidate.location_country].filter(Boolean).join(', ')

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative rounded-2xl border border-border bg-card flex flex-col overflow-hidden cursor-pointer transition-shadow hover:shadow-lg hover:shadow-black/20 hover:border-border/70"
      onClick={() => onViewProfile(candidate.id)}
      role="article"
      aria-label={`${candidate.full_name}${role ? `, ${role}` : ''}`}
    >
      {/* Avatar area */}
      <div className="relative pt-6 px-5 pb-4 flex items-start gap-4">
        <Avatar
          src={candidate.avatar_url ?? undefined}
          name={candidate.full_name}
          size="lg"
          className="shrink-0 ring-2 ring-border"
        />
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="font-semibold text-sm text-foreground leading-snug truncate">
            {candidate.full_name}
          </p>
          {role && (
            <p className="text-xs text-muted mt-0.5 truncate">{role}</p>
          )}
          {location && (
            <div className="flex items-center gap-1 mt-1.5">
              <MapPin size={11} className="text-muted/60 shrink-0" aria-hidden="true" />
              <span className="text-[11px] text-muted/70 truncate">{location}</span>
            </div>
          )}
        </div>

        {/* Save indicator badge */}
        {isSaved && (
          <span className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <BookmarkCheck size={12} style={{ color: '#10B981' }} aria-label="Saved" />
          </span>
        )}
      </div>

      {/* Bio snippet */}
      {candidate.bio && (
        <p className="px-5 text-xs text-muted leading-relaxed line-clamp-2 mb-3">
          {candidate.bio}
        </p>
      )}

      {/* Specialties */}
      {topSpecialties.length > 0 && (
        <div className="px-5 mb-3 flex flex-wrap gap-1.5">
          {topSpecialties.map(s => (
            <span
              key={s.name}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium"
              style={{ background: 'rgba(107,95,174,0.12)', color: '#8B81C3' }}
            >
              {s.name}
            </span>
          ))}
          {candidate.specialties.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium text-muted/60">
              +{candidate.specialties.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Work type + exp row */}
      <div className="px-5 pb-4 flex items-center gap-3 flex-wrap mt-auto">
        {candidate.years_experience !== null && (
          <div className="flex items-center gap-1">
            <Briefcase size={11} className="text-muted/50" aria-hidden="true" />
            <span className="text-[11px] text-muted/70">{candidate.years_experience}y exp</span>
          </div>
        )}
        {candidate.has_portfolio && (
          <div className="flex items-center gap-1">
            <Layers size={11} className="text-muted/50" aria-hidden="true" />
            <span className="text-[11px] text-muted/70">Portfolio</span>
          </div>
        )}
        {candidate.preferences?.available_from && (
          <div className="flex items-center gap-1">
            <Clock size={11} className="text-muted/50" aria-hidden="true" />
            <span className="text-[11px] text-muted/70">
              {new Date(candidate.preferences.available_from) <= new Date() ? 'Available now' : `From ${new Date(candidate.preferences.available_from).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
            </span>
          </div>
        )}
        {workChips.slice(0, 2).map(chip => (
          <span key={chip} className="text-[10px] text-muted/60 bg-white/4 px-1.5 py-0.5 rounded-md border border-border/50">
            {chip}
          </span>
        ))}
      </div>

      {/* Action bar — appears on hover */}
      <div
        className={cn(
          'absolute bottom-0 inset-x-0 flex items-center gap-2 px-4 py-3 border-t border-border/50 bg-card/95 backdrop-blur-sm transition-all duration-200',
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none',
        )}
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          disabled={passPending}
          onClick={() => onPass(candidate.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-muted border border-border hover:border-destructive/40 hover:text-destructive hover:bg-destructive/8 transition-colors disabled:opacity-40"
          aria-label="Pass on this candidate"
        >
          <X size={13} aria-hidden="true" />
          Pass
        </button>
        <button
          type="button"
          disabled={savePending}
          onClick={() => onSave(candidate.id)}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40',
            isSaved
              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15'
              : 'text-secondary border-secondary/30 bg-secondary/10 hover:bg-secondary/20',
          )}
          aria-label={isSaved ? 'Unsave this candidate' : 'Save this candidate'}
        >
          {isSaved
            ? <><BookmarkCheck size={13} aria-hidden="true" /> Saved</>
            : <><Bookmark size={13} aria-hidden="true" /> Save</>
          }
        </button>
      </div>

      {/* Bottom padding so hover actions don't overlap content */}
      <div className="h-1" aria-hidden="true" />
    </motion.div>
  )
}
