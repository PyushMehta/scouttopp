'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/* ─── Strength scorer ───────────────────────────────────────────────────── */

export type StrengthLevel = 0 | 1 | 2 | 3 | 4

interface StrengthResult {
  score:   StrengthLevel
  label:   string
  colour:  string
  hints:   string[]
}

export function scorePassword(pw: string): StrengthResult {
  if (!pw) return { score: 0, label: '', colour: '', hints: [] }

  let score = 0
  const hints: string[] = []

  if (pw.length >= 8)  score++
  else hints.push('Use at least 8 characters')

  if (pw.length >= 12) score++
  else if (pw.length >= 8) hints.push('Use 12+ characters for a stronger password')

  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  else hints.push('Mix uppercase and lowercase letters')

  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++
  else if (/[0-9]/.test(pw)) hints.push('Add a symbol (!@#$…)')
  else hints.push('Add numbers and symbols')

  const clamped = Math.min(score, 4) as StrengthLevel

  const META: Record<StrengthLevel, { label: string; colour: string }> = {
    0: { label: '',         colour: 'transparent' },
    1: { label: 'Weak',     colour: '#C43A3A' },
    2: { label: 'Fair',     colour: '#C47C1A' },
    3: { label: 'Good',     colour: '#2D8A5E' },
    4: { label: 'Strong',   colour: '#2D8A5E' },
  }

  return { score: clamped, ...META[clamped], hints }
}

/* ─── Component ─────────────────────────────────────────────────────────── */

interface PasswordStrengthProps {
  password: string
  className?: string
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const { score, label, colour, hints } = useMemo(() => scorePassword(password), [password])

  if (!password) return null

  return (
    <div className={cn('space-y-2', className)} role="status" aria-live="polite" aria-label={`Password strength: ${label || 'none'}`}>

      {/* 4-segment bar */}
      <div className="flex gap-1.5" aria-hidden="true">
        {([1, 2, 3, 4] as StrengthLevel[]).map((seg) => (
          <motion.span
            key={seg}
            className="h-1 flex-1 rounded-full"
            animate={{
              backgroundColor: seg <= score ? colour : '#D8CFC0',
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        ))}
      </div>

      {/* Label + first hint */}
      <div className="flex items-center justify-between">
        {label && (
          <motion.span
            key={label}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs font-semibold"
            style={{ color: colour }}
          >
            {label}
          </motion.span>
        )}
        {hints[0] && (
          <span className="text-xs text-muted">{hints[0]}</span>
        )}
      </div>

    </div>
  )
}
