'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

const RESEND_COOLDOWN = 60

interface VerifyEmailPromptProps {
  email?: string
}

export function VerifyEmailPrompt({ email }: VerifyEmailPromptProps) {
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent]       = useState(false)
  const [cooldown, setCooldown]           = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  const handleResend = useCallback(async () => {
    if (resendLoading || cooldown > 0 || !email) return
    setResendLoading(true)
    setResendSent(false)
    try {
      const supabase = createClient()
      await supabase.auth.resend({ type: 'signup', email })
      setResendSent(true)
      setCooldown(RESEND_COOLDOWN)
    } finally {
      setResendLoading(false)
    }
  }, [resendLoading, cooldown, email])

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-16">
      <div className="w-full max-w-110 space-y-8">

        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(43, 56, 117, 0.08)' }}
          aria-hidden="true"
        >
          <Mail size={28} strokeWidth={1.5} style={{ color: '#2B3875' }} />
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Check your inbox.
          </h1>
          <p className="text-base text-muted leading-relaxed">
            We&apos;ve sent a verification link to{' '}
            {email ? (
              <span className="font-semibold text-foreground">{email}</span>
            ) : (
              'your email address'
            )}
            {'. '}
            Click the link to activate your account.
          </p>
        </div>

        {/* Resend success banner */}
        <AnimatePresence>
          {resendSent && (
            <motion.div
              key="resend-success"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              role="status"
              aria-live="polite"
              className="flex items-center gap-3 rounded-xl border p-4"
              style={{
                background:  'rgba(45, 138, 94, 0.06)',
                borderColor: 'rgba(45, 138, 94, 0.3)',
              }}
            >
              <CheckCircle2
                size={16}
                className="shrink-0"
                style={{ color: '#2D8A5E' }}
                aria-hidden="true"
              />
              <p className="text-sm" style={{ color: '#2D8A5E' }}>
                Verification email resent. Check your inbox.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="space-y-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            loading={resendLoading}
            disabled={cooldown > 0}
            onClick={handleResend}
            aria-label={
              cooldown > 0
                ? `Resend available in ${cooldown} seconds`
                : 'Resend verification email'
            }
          >
            {resendLoading
              ? 'Sending…'
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : 'Resend verification email'}
          </Button>

          <p className="text-sm text-center text-muted">
            Wrong email?{' '}
            <Link
              href="/auth/signup"
              className="font-semibold transition-colors duration-150 hover:underline"
              style={{ color: '#2B3875' }}
            >
              Start over
            </Link>
          </p>
        </div>

        {/* Help box */}
        <div className="rounded-xl border border-flax bg-cream/40 p-4">
          <p className="text-xs text-stone leading-relaxed">
            <span className="font-semibold text-charcoal">Can&apos;t find the email?</span>{' '}
            Check your spam or junk folder. The email comes from{' '}
            <span className="font-medium text-charcoal">noreply@scouttopp.com</span>.
          </p>
        </div>

      </div>
    </div>
  )
}
