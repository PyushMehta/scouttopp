'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, Building2, AlertCircle, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const EMPLOYER_ENABLED = process.env.NEXT_PUBLIC_EMPLOYER_ENABLED === 'true'

type Role = 'candidate' | 'employer'

interface RoleOption {
  id:          Role
  Icon:        LucideIcon
  title:       string
  description: string
  badge:       string
}

const ALL_ROLES: RoleOption[] = [
  {
    id:          'candidate',
    Icon:        Sparkles,
    title:       "I'm a Creative",
    description: 'Showcase your portfolio and get discovered by top studios, agencies, and creative teams.',
    badge:       'Creative Professional',
  },
  {
    id:          'employer',
    Icon:        Building2,
    title:       "I'm Hiring",
    description: 'Find exceptional creative talent for your team, studio, or next project.',
    badge:       'Studio / Agency',
  },
]

const ROLES = EMPLOYER_ENABLED ? ALL_ROLES : ALL_ROLES.filter(r => r.id !== 'employer')

export function RoleSelectForm() {
  const router   = useRouter()
  const [selected, setSelected] = useState<Role | null>(null)
  const [loading, setLoading]   = useState(false)

  const [serverError, setServerError] = useState<string | null>(null)

  const handleContinue = async () => {
    if (!selected || loading) return
    setServerError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/role', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ role: selected }),
      })
      const json = await res.json()
      if (!res.ok) {
        setServerError(json.error?.message ?? 'Something went wrong. Please try again.')
        return
      }
      router.push(json.data.redirectTo)
    } catch {
      setServerError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-16">
      <div className="w-full max-w-110 space-y-8">

        {/* Header */}
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            What brings you here?
          </h1>
          <p className="text-base text-muted">
            Choose your account type. This can&apos;t be changed later.
          </p>
        </div>

        {/* Server error */}
        {serverError && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex items-start gap-3 rounded-xl border p-4"
            style={{
              background:  'rgba(196, 58, 58, 0.06)',
              borderColor: 'rgba(196, 58, 58, 0.3)',
            }}
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: '#C43A3A' }} aria-hidden="true" />
            <p className="text-sm leading-snug" style={{ color: '#C43A3A' }}>{serverError}</p>
          </div>
        )}

        {/* Role cards */}
        <div
          className="space-y-3"
          role="radiogroup"
          aria-label="Account type"
          aria-required="true"
        >
          {ROLES.map(({ id, Icon, title, description, badge }) => {
            const isSelected = selected === id
            return (
              <motion.button
                key={id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelected(id)}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.12 }}
                className={cn(
                  'w-full text-left rounded-2xl border-2 p-5',
                  'transition-colors duration-200 cursor-pointer select-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  isSelected
                    ? 'border-navy bg-navy/[0.04]'
                    : 'border-flax bg-card hover:border-stone/50 hover:bg-vellum/40',
                )}
              >
                <div className="flex items-start gap-4">

                  {/* Icon badge */}
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                      'transition-colors duration-200',
                      isSelected ? 'bg-navy' : 'bg-flax',
                    )}
                    aria-hidden="true"
                  >
                    <Icon
                      size={22}
                      strokeWidth={1.75}
                      className={cn(
                        'transition-colors duration-200',
                        isSelected ? 'text-white' : 'text-stone',
                      )}
                    />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0 pt-0.5 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          'text-base font-bold leading-tight transition-colors duration-200',
                          isSelected ? 'text-navy' : 'text-foreground',
                        )}
                      >
                        {title}
                      </span>
                      <span
                        className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded-full border transition-colors duration-200',
                          isSelected
                            ? 'border-navy/25 bg-navy/8 text-navy'
                            : 'border-flax bg-vellum text-stone',
                        )}
                      >
                        {badge}
                      </span>
                    </div>
                    <p
                      className={cn(
                        'text-sm leading-relaxed transition-colors duration-200',
                        isSelected ? 'text-charcoal' : 'text-muted',
                      )}
                    >
                      {description}
                    </p>
                  </div>

                  {/* Radio indicator */}
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 shrink-0 mt-0.5',
                      'flex items-center justify-center',
                      'transition-all duration-200',
                      isSelected ? 'border-navy bg-navy' : 'border-flax bg-white',
                    )}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                        className="w-2 h-2 rounded-full bg-white"
                      />
                    )}
                  </div>

                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Continue */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!selected}
          loading={loading}
          onClick={handleContinue}
          aria-label={
            selected
              ? `Continue as ${selected === 'candidate' ? 'creative professional' : 'employer'}`
              : 'Select an account type to continue'
          }
        >
          {loading ? 'Continuing…' : 'Continue'}
        </Button>

        {/* Footer */}
        <p className="text-xs text-center text-muted">
          Not sure which to choose?{' '}
          <a
            href="mailto:support@scouttopp.com"
            className="font-medium transition-colors duration-150 hover:underline"
            style={{ color: '#6B5FAE' }}
          >
            Contact us
          </a>
        </p>

      </div>
    </div>
  )
}
