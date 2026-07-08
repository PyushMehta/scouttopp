'use client'

import { useState }      from 'react'
import { X, SlidersHorizontal } from 'lucide-react'
import { Drawer }        from '@/components/ui/drawer'
import { Button }        from '@/components/ui/button'
import { cn }            from '@/lib/utils'

export type WorkType   = 'remote' | 'hybrid' | 'onsite'
export type EngageType = 'contract' | 'fulltime'

export interface DiscoveryFilters {
  q:               string
  role:            string[]
  skills:          string[]
  location_country: string
  location_city:   string
  remote:          boolean
  hybrid:          boolean
  onsite:          boolean
  contract:        boolean
  fulltime:        boolean
  rate_max:        string
  exp_min:         string
  exp_max:         string
  available_now:   boolean
  has_portfolio:   boolean
}

export const EMPTY_FILTERS: DiscoveryFilters = {
  q: '', role: [], skills: [], location_country: '', location_city: '',
  remote: false, hybrid: false, onsite: false, contract: false, fulltime: false,
  rate_max: '', exp_min: '', exp_max: '', available_now: false, has_portfolio: false,
}

// Values must match candidate_roles.role_name (free-text, from PRESET_ROLES — Phase 6.5)
const ROLES = [
  'UI/UX Designer', 'Graphic Designer', 'Brand Designer', 'Motion Designer',
  'Video Editor', 'Photographer', 'Illustrator', 'Copywriter',
  'Social Media Designer', 'Frontend Developer', 'Product Designer',
  'Animator', '3D Artist', 'Creative Director', 'Marketing Designer',
]

const COMMON_SKILLS = [
  'Figma', 'After Effects', 'Illustrator', 'Photoshop', 'Premiere Pro',
  'Cinema 4D', 'Blender', 'Procreate', 'Sketch', 'InVision',
  'Branding', 'Typography', 'UI Design', 'Motion Graphics',
]

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted/50 mb-2">{children}</p>
  )
}

function ToggleChip({
  label, active, onToggle,
}: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
        active
          ? 'bg-primary/15 border-primary/40 text-secondary'
          : 'bg-transparent border-border text-muted hover:border-border/80 hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}

export function countActiveFilters(f: DiscoveryFilters): number {
  return (
    (f.role.length > 0   ? 1 : 0) +
    (f.skills.length > 0 ? 1 : 0) +
    (f.location_country || f.location_city ? 1 : 0) +
    (f.remote || f.hybrid || f.onsite     ? 1 : 0) +
    (f.contract || f.fulltime             ? 1 : 0) +
    (f.rate_max                           ? 1 : 0) +
    (f.exp_min || f.exp_max               ? 1 : 0) +
    (f.available_now                      ? 1 : 0) +
    (f.has_portfolio                      ? 1 : 0)
  )
}

interface FilterContentProps {
  filters:   DiscoveryFilters
  onChange:  (f: DiscoveryFilters) => void
  onReset:   () => void
}

export function FilterContent({ filters, onChange, onReset }: FilterContentProps) {
  const [skillInput, setSkillInput] = useState('')

  const toggle = (key: keyof DiscoveryFilters) =>
    onChange({ ...filters, [key]: !filters[key] })

  const toggleRole = (role: string) =>
    onChange({
      ...filters,
      role: filters.role.includes(role)
        ? filters.role.filter(r => r !== role)
        : [...filters.role, role],
    })

  const toggleSkill = (skill: string) =>
    onChange({
      ...filters,
      skills: filters.skills.includes(skill)
        ? filters.skills.filter(s => s !== skill)
        : [...filters.skills, skill],
    })

  const addCustomSkill = () => {
    const s = skillInput.trim()
    if (s && !filters.skills.includes(s)) {
      onChange({ ...filters, skills: [...filters.skills, s] })
    }
    setSkillInput('')
  }

  const activeCount = countActiveFilters(filters)

  return (
    <div className="space-y-6">
      {/* Reset */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Filters</p>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-muted hover:text-foreground transition-colors flex items-center gap-1"
          >
            <X size={11} aria-hidden="true" />
            Clear all ({activeCount})
          </button>
        )}
      </div>

      {/* Role */}
      <div>
        <SectionLabel>Role</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {ROLES.map(r => (
            <ToggleChip
              key={r}
              label={r}
              active={filters.role.includes(r)}
              onToggle={() => toggleRole(r)}
            />
          ))}
        </div>
      </div>

      {/* Work type */}
      <div>
        <SectionLabel>Work location</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {(['remote', 'hybrid', 'onsite'] as WorkType[]).map(t => (
            <ToggleChip
              key={t}
              label={t.charAt(0).toUpperCase() + t.slice(1)}
              active={filters[t]}
              onToggle={() => toggle(t)}
            />
          ))}
        </div>
      </div>

      {/* Engagement type */}
      <div>
        <SectionLabel>Engagement</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          <ToggleChip label="Contract"  active={filters.contract}  onToggle={() => toggle('contract')} />
          <ToggleChip label="Full-time" active={filters.fulltime}  onToggle={() => toggle('fulltime')} />
        </div>
      </div>

      {/* Availability */}
      <div>
        <SectionLabel>Availability</SectionLabel>
        <ToggleChip label="Available now" active={filters.available_now} onToggle={() => toggle('available_now')} />
      </div>

      {/* Portfolio */}
      <div>
        <SectionLabel>Portfolio</SectionLabel>
        <ToggleChip label="Has portfolio" active={filters.has_portfolio} onToggle={() => toggle('has_portfolio')} />
      </div>

      {/* Skills */}
      <div>
        <SectionLabel>Skills</SectionLabel>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {COMMON_SKILLS.map(s => (
            <ToggleChip
              key={s}
              label={s}
              active={filters.skills.includes(s)}
              onToggle={() => toggleSkill(s)}
            />
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill() } }}
            placeholder="Add skill…"
            className="flex-1 h-8 px-3 text-xs rounded-lg border border-border bg-input text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
          <button
            type="button"
            onClick={addCustomSkill}
            className="px-3 h-8 text-xs rounded-lg border border-border text-muted hover:text-foreground transition-colors"
          >
            Add
          </button>
        </div>
        {filters.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {filters.skills.map(s => (
              <span
                key={s}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs"
                style={{ background: 'rgba(107,95,174,0.12)', color: '#8B81C3' }}
              >
                {s}
                <button type="button" onClick={() => toggleSkill(s)} aria-label={`Remove ${s}`}>
                  <X size={10} aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Location */}
      <div>
        <SectionLabel>Location</SectionLabel>
        <div className="space-y-2">
          <input
            type="text"
            value={filters.location_country}
            onChange={e => onChange({ ...filters, location_country: e.target.value })}
            placeholder="Country"
            className="w-full h-8 px-3 text-xs rounded-lg border border-border bg-input text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
          <input
            type="text"
            value={filters.location_city}
            onChange={e => onChange({ ...filters, location_city: e.target.value })}
            placeholder="City"
            className="w-full h-8 px-3 text-xs rounded-lg border border-border bg-input text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>
      </div>

      {/* Experience */}
      <div>
        <SectionLabel>Experience (years)</SectionLabel>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={filters.exp_min}
            onChange={e => onChange({ ...filters, exp_min: e.target.value })}
            placeholder="Min"
            className="w-full h-8 px-3 text-xs rounded-lg border border-border bg-input text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
          <span className="text-muted text-xs shrink-0">–</span>
          <input
            type="number"
            min={0}
            value={filters.exp_max}
            onChange={e => onChange({ ...filters, exp_max: e.target.value })}
            placeholder="Max"
            className="w-full h-8 px-3 text-xs rounded-lg border border-border bg-input text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>
      </div>

      {/* Max rate */}
      <div>
        <SectionLabel>Max hourly rate ($)</SectionLabel>
        <input
          type="number"
          min={0}
          value={filters.rate_max}
          onChange={e => onChange({ ...filters, rate_max: e.target.value })}
          placeholder="e.g. 150"
          className="w-full h-8 px-3 text-xs rounded-lg border border-border bg-input text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
      </div>
    </div>
  )
}

/* ── Desktop filter sidebar ──────────────────────────────────────────────── */

export function FilterSidebar({ filters, onChange, onReset }: FilterContentProps) {
  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-0 max-h-screen overflow-y-auto pb-8 pr-2">
        <FilterContent filters={filters} onChange={onChange} onReset={onReset} />
      </div>
    </aside>
  )
}

/* ── Mobile filter drawer ────────────────────────────────────────────────── */

export function FilterDrawerButton({
  activeCount,
  onClick,
}: { activeCount: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-3 h-9 rounded-lg border border-border text-sm text-muted hover:text-foreground hover:border-border/80 transition-colors shrink-0"
    >
      <SlidersHorizontal size={14} aria-hidden="true" />
      Filters
      {activeCount > 0 && (
        <span
          className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
          style={{ background: 'rgba(43,56,117,0.9)', color: '#fff' }}
        >
          {activeCount}
        </span>
      )}
    </button>
  )
}

export function FilterDrawer({
  open, onClose, filters, onChange, onReset,
}: FilterContentProps & { open: boolean; onClose: () => void }) {
  return (
    <Drawer side="bottom" open={open} onClose={onClose} title="Filters">
      <FilterContent filters={filters} onChange={onChange} onReset={onReset} />
      <div className="mt-6">
        <Button variant="primary" size="md" className="w-full" onClick={onClose}>
          Show results
        </Button>
      </div>
    </Drawer>
  )
}
