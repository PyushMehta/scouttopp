'use client'

import { useState, useCallback }  from 'react'
import { Star, X, Plus, Loader2 } from 'lucide-react'
import { toast }                   from '@/components/ui/toast'
import { cn }                      from '@/lib/utils'
import { PRESET_ROLES }            from '@/constants'

/* ─── Types ─────────────────────────────────────────────────────────────── */

export interface CandidateRole {
  id:         string
  role_name:  string
  is_primary: boolean
  sort_order: number
}

interface RolesEditorProps {
  initialRoles: CandidateRole[]
}

const MAX_ROLES = 5

/* ─── Component ─────────────────────────────────────────────────────────── */

export function RolesEditor({ initialRoles }: RolesEditorProps) {
  const [roles,        setRoles]        = useState<CandidateRole[]>(initialRoles)
  const [pending,      setPending]      = useState<Set<string>>(new Set())
  const [adding,       setAdding]       = useState(false)
  const [selectedRole, setSelectedRole] = useState('')
  const [customRole,   setCustomRole]   = useState('')
  const [addLoading,   setAddLoading]   = useState(false)

  const markPending = (id: string, on: boolean) =>
    setPending(prev => { const next = new Set(prev); on ? next.add(id) : next.delete(id); return next })

  const existingNames = new Set(roles.map(r => r.role_name.toLowerCase()))
  const availablePresets = PRESET_ROLES.filter(r => !existingNames.has(r.toLowerCase()))

  /* ── Remove ───────────────────────────────────────────────────────────── */

  const handleRemove = useCallback(async (id: string) => {
    markPending(id, true)
    const snapshot = [...roles]
    setRoles(r => r.filter(x => x.id !== id))

    try {
      const res  = await fetch(`/api/candidate/roles/${id}`, { method: 'DELETE' })
      const json = await res.json() as { success: boolean; error?: { message: string } }
      if (!json.success) throw new Error(json.error?.message)
      toast.success('Role removed.')
    } catch (err) {
      setRoles(snapshot)
      toast.error(err instanceof Error ? err.message : 'Failed to remove role.')
    } finally {
      markPending(id, false)
    }
  }, [roles])

  /* ── Set primary ──────────────────────────────────────────────────────── */

  const handleSetPrimary = useCallback(async (id: string, role_name: string) => {
    if (roles.find(r => r.id === id)?.is_primary) return
    markPending(id, true)
    const snapshot = [...roles]
    setRoles(r => r.map(x => ({ ...x, is_primary: x.id === id })))

    try {
      const res  = await fetch(`/api/candidate/roles/${id}`, { method: 'PATCH' })
      const json = await res.json() as { success: boolean; error?: { message: string } }
      if (!json.success) throw new Error(json.error?.message)
      toast.success(`${role_name} is now your primary role.`)
    } catch (err) {
      setRoles(snapshot)
      toast.error(err instanceof Error ? err.message : 'Failed to set primary role.')
    } finally {
      markPending(id, false)
    }
  }, [roles])

  /* ── Add ──────────────────────────────────────────────────────────────── */

  const handleAdd = useCallback(async () => {
    const name = selectedRole === 'custom' ? customRole.trim() : selectedRole.trim()
    if (!name) return
    if (roles.length >= MAX_ROLES) {
      toast.error(`Maximum ${MAX_ROLES} roles allowed.`)
      return
    }
    if (existingNames.has(name.toLowerCase())) {
      toast.error('You already have this role.')
      return
    }

    setAddLoading(true)
    const isFirst = roles.length === 0

    try {
      const res  = await fetch('/api/candidate/roles', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ role_name: name, is_primary: isFirst }),
      })
      const json = await res.json() as { success: boolean; data?: CandidateRole; error?: { message: string } }
      if (!json.success) throw new Error(json.error?.message)

      setRoles(prev => {
        const updated = json.data!.is_primary
          ? prev.map(r => ({ ...r, is_primary: false }))
          : prev
        return [...updated, json.data!]
      })
      setSelectedRole('')
      setCustomRole('')
      setAdding(false)
      toast.success(`${name} added.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add role.')
    } finally {
      setAddLoading(false)
    }
  }, [selectedRole, customRole, roles, existingNames])

  const isCustom = selectedRole === 'custom'

  /* ── Render ───────────────────────────────────────────────────────────── */

  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <h2 className="text-sm font-semibold text-foreground">Roles</h2>
        {roles.length < MAX_ROLES && !adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
          >
            <Plus size={13} aria-hidden="true" />
            Add role
          </button>
        )}
      </div>
      <p className="text-xs text-muted mb-4">
        Add up to {MAX_ROLES} roles. Tap any role to make it primary — employers see that first.
      </p>

      {/* Existing roles */}
      {roles.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {roles.map(role => (
            <button
              key={role.id}
              type="button"
              disabled={pending.has(role.id)}
              onClick={() => handleSetPrimary(role.id, role.role_name)}
              className={cn(
                'group flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-xl border text-xs font-medium transition-all select-none',
                role.is_primary
                  ? 'border-secondary/50 text-secondary'
                  : 'border-border text-muted hover:border-border/80 hover:text-foreground cursor-pointer',
                pending.has(role.id) && 'opacity-50 pointer-events-none',
              )}
              style={role.is_primary ? { background: 'rgba(107,95,174,0.10)' } : undefined}
              aria-label={
                role.is_primary
                  ? `${role.role_name} (primary role)`
                  : `Set ${role.role_name} as primary role`
              }
            >
              {role.is_primary && (
                <Star size={11} fill="currentColor" aria-hidden="true" />
              )}
              <span>{role.role_name}</span>

              {pending.has(role.id) ? (
                <Loader2 size={12} className="animate-spin ml-0.5" aria-hidden="true" />
              ) : (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={e => { e.stopPropagation(); void handleRemove(role.id) }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      void handleRemove(role.id)
                    }
                  }}
                  className="ml-0.5 opacity-30 hover:opacity-80 transition-opacity"
                  aria-label={`Remove ${role.role_name}`}
                >
                  <X size={12} aria-hidden="true" />
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted/50 italic mb-4">No roles added yet.</p>
      )}

      {/* Add role panel */}
      {adding && (
        <div className="border border-border/60 rounded-xl p-4 space-y-3 bg-surface/30">
          <div className="flex items-center gap-2">
            {/* Preset dropdown */}
            <div className="relative flex-1">
              <select
                value={selectedRole}
                onChange={e => { setSelectedRole(e.target.value); setCustomRole('') }}
                className="w-full h-9 px-3 pr-8 text-xs rounded-lg border border-border bg-input text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                aria-label="Select a role"
              >
                <option value="">Select a role…</option>
                {availablePresets.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
                <option value="custom">Custom role…</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Add button (only when not in custom mode) */}
            {!isCustom && (
              <button
                type="button"
                disabled={!selectedRole || addLoading}
                onClick={handleAdd}
                className={cn(
                  'h-9 px-4 text-xs font-semibold rounded-lg transition-all',
                  'bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:pointer-events-none',
                )}
              >
                {addLoading ? <Loader2 size={13} className="animate-spin" aria-hidden="true" /> : 'Add'}
              </button>
            )}

            {/* Cancel */}
            <button
              type="button"
              onClick={() => { setAdding(false); setSelectedRole(''); setCustomRole('') }}
              className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg text-muted hover:text-foreground transition-colors"
              aria-label="Cancel adding role"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>

          {/* Custom role input */}
          {isCustom && (
            <div className="flex gap-2">
              <input
                type="text"
                value={customRole}
                onChange={e => setCustomRole(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void handleAdd() } }}
                placeholder="e.g. Brand Strategist"
                maxLength={100}
                autoFocus
                className="flex-1 h-9 px-3 text-xs rounded-lg border border-border bg-input text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                aria-label="Custom role name"
              />
              <button
                type="button"
                disabled={!customRole.trim() || addLoading}
                onClick={handleAdd}
                className={cn(
                  'h-9 px-4 text-xs font-semibold rounded-lg transition-all shrink-0',
                  'bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:pointer-events-none',
                )}
              >
                {addLoading ? <Loader2 size={13} className="animate-spin" aria-hidden="true" /> : 'Add'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Limit note */}
      {roles.length >= MAX_ROLES && !adding && (
        <p className="text-[11px] text-muted/50 mt-2">Maximum {MAX_ROLES} roles reached.</p>
      )}
    </div>
  )
}
