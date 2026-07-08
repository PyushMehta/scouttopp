'use client'

import { useState, useRef, useEffect } from 'react'
import { MapPin, Briefcase, Bookmark, BookmarkX, ChevronDown, StickyNote } from 'lucide-react'
import { toast }                        from 'sonner'
import { Avatar }                       from '@/components/ui/avatar'
import { cn }                           from '@/lib/utils'

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

export interface SavedCandidate {
  id:               string
  full_name:        string
  primary_role:     string | null
  location_city:    string | null
  location_country: string | null
  years_experience: number | null
  bio:              string | null
  avatar_url:       string | null
  has_portfolio:    boolean
  specialties:      { name: string; level: string | null }[]
  saved_at:         string
  note:             string
}

interface SavedCandidateRowProps {
  candidate:     SavedCandidate
  onUnsave:      (id: string) => void
  onViewProfile: (id: string) => void
}

export function SavedCandidateRow({ candidate, onUnsave, onViewProfile }: SavedCandidateRowProps) {
  const [noteOpen,    setNoteOpen]    = useState(false)
  const [noteText,    setNoteText]    = useState(candidate.note)
  const [noteSaving,  setNoteSaving]  = useState(false)
  const [unsaving,    setUnsaving]    = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-save note 1s after user stops typing
  useEffect(() => {
    if (noteText === candidate.note) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setNoteSaving(true)
      try {
        const res  = await fetch('/api/discovery/note', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ candidate_id: candidate.id, note: noteText }),
        })
        const json = await res.json() as { success: boolean }
        if (!json.success) throw new Error()
      } catch {
        toast.error('Failed to save note.')
      } finally {
        setNoteSaving(false)
      }
    }, 1000)
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [noteText, candidate.id, candidate.note])

  const handleUnsave = async () => {
    setUnsaving(true)
    try {
      const res  = await fetch('/api/discovery/save', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ candidate_id: candidate.id }),
      })
      const json = await res.json() as { success: boolean }
      if (json.success) {
        onUnsave(candidate.id)
        toast.success('Candidate unsaved.')
      }
    } catch {
      toast.error('Failed to unsave. Try again.')
    } finally {
      setUnsaving(false)
    }
  }

  const role     = candidate.primary_role ? (ROLE_LABELS[candidate.primary_role] ?? candidate.primary_role) : null
  const location = [candidate.location_city, candidate.location_country].filter(Boolean).join(', ')
  const savedDate = new Date(candidate.saved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-sm">
      {/* Main row */}
      <div className="flex items-start gap-4 px-5 py-4">
        {/* Avatar */}
        <button
          type="button"
          onClick={() => onViewProfile(candidate.id)}
          className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`View ${candidate.full_name}'s profile`}
        >
          <Avatar
            src={candidate.avatar_url ?? undefined}
            name={candidate.full_name}
            size="md"
            className="ring-2 ring-border"
          />
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => onViewProfile(candidate.id)}
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors text-left"
              >
                {candidate.full_name}
              </button>
              {role && (
                <p className="text-xs text-muted mt-0.5">{role}{candidate.years_experience !== null ? ` · ${candidate.years_experience}y` : ''}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setNoteOpen(o => !o)}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-md text-xs border transition-colors',
                  noteOpen || noteText
                    ? 'border-amber-500/30 text-amber-400 bg-amber-500/8 hover:bg-amber-500/12'
                    : 'border-border text-muted hover:text-foreground hover:border-border/70',
                )}
                aria-label={noteOpen ? 'Hide note' : 'Add / edit note'}
                aria-expanded={noteOpen}
              >
                <StickyNote size={12} aria-hidden="true" />
                Note
                {noteText && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5" aria-hidden="true" />}
                <ChevronDown size={11} className={cn('transition-transform', noteOpen && 'rotate-180')} aria-hidden="true" />
              </button>

              <button
                type="button"
                disabled={unsaving}
                onClick={handleUnsave}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-border text-muted hover:border-destructive/40 hover:text-destructive hover:bg-destructive/8 transition-colors disabled:opacity-40"
                aria-label={`Unsave ${candidate.full_name}`}
              >
                <BookmarkX size={12} aria-hidden="true" />
                {unsaving ? '…' : 'Unsave'}
              </button>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {location && (
              <div className="flex items-center gap-1">
                <MapPin size={11} className="text-muted/50" aria-hidden="true" />
                <span className="text-[11px] text-muted/70">{location}</span>
              </div>
            )}
            {candidate.specialties.slice(0, 3).map(s => (
              <span
                key={s.name}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                style={{ background: 'rgba(107,95,174,0.12)', color: '#8B81C3' }}
              >
                {s.name}
              </span>
            ))}
            {candidate.specialties.length > 3 && (
              <span className="text-[10px] text-muted/60">+{candidate.specialties.length - 3} more</span>
            )}
          </div>

          {/* Saved date */}
          <p className="text-[10px] text-muted/40 mt-1.5 flex items-center gap-1">
            <Bookmark size={10} aria-hidden="true" />
            Saved {savedDate}
          </p>
        </div>
      </div>

      {/* Note area */}
      {noteOpen && (
        <div className="border-t border-border/50 px-5 py-3 bg-amber-500/3">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-amber-400/70">
              Private note
            </label>
            {noteSaving && (
              <span className="text-[10px] text-muted/50">Saving…</span>
            )}
            {!noteSaving && noteText && noteText === candidate.note && (
              <span className="text-[10px] text-muted/40">Saved</span>
            )}
          </div>
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Add a private note about this candidate…"
            rows={3}
            maxLength={1000}
            className="w-full text-xs text-foreground placeholder:text-muted/50 bg-transparent resize-none focus:outline-none leading-relaxed"
            aria-label={`Private note for ${candidate.full_name}`}
          />
          <p className="text-[10px] text-muted/30 text-right mt-1">{noteText.length}/1000</p>
        </div>
      )}
    </div>
  )
}
