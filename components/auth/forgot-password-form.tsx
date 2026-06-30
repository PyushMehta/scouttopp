'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/lib/validations'
import { APP_URL, ROUTES } from '@/constants'
import { Input }  from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Values = ForgotPasswordValues

/* ─── Success state ─────────────────────────────────────────────────────── */

function SuccessView({ email }: { email: string }) {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-16">
      <div className="w-full max-w-110 space-y-8">

        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(45, 138, 94, 0.08)' }}
          aria-hidden="true"
        >
          <CheckCircle2 size={28} strokeWidth={1.5} style={{ color: '#2D8A5E' }} />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Check your inbox.
          </h1>
          <p className="text-base text-muted leading-relaxed">
            If an account exists for{' '}
            <span className="font-semibold text-foreground">{email}</span>
            {', '}you&apos;ll receive a password reset link within a few minutes.
          </p>
        </div>

        <div className="rounded-xl border border-flax bg-cream/40 p-4">
          <p className="text-xs text-stone leading-relaxed">
            <span className="font-semibold text-charcoal">Can&apos;t find the email?</span>{' '}
            Check your spam or junk folder. The link expires after 1 hour.
          </p>
        </div>

        <Link
          href="/auth/login"
          className="block text-sm font-semibold text-center transition-colors duration-150 hover:underline"
          style={{ color: '#2B3875' }}
        >
          ← Back to sign in
        </Link>

      </div>
    </div>
  )
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function ForgotPasswordForm() {
  const [successEmail, setSuccessEmail] = useState<string | null>(null)
  const [serverError, setServerError]   = useState<string | null>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(forgotPasswordSchema),
    mode:     'onTouched',
  })

  const onSubmit = async (values: Values) => {
    setServerError(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${APP_URL}${ROUTES.api.authCallback}?type=recovery`,
      })
      // Always show success to avoid email enumeration
      if (error && !error.message.toLowerCase().includes('rate limit')) {
        setServerError('Something went wrong. Please try again.')
        return
      }
      setSuccessEmail(values.email)
    } catch {
      setServerError('Something went wrong. Please try again.')
    }
  }

  if (successEmail) return <SuccessView email={successEmail} />

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-16">
      <div className="w-full max-w-110 space-y-8">

        {/* Header */}
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Reset your password.
          </h1>
          <p className="text-base text-muted">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {/* Server error */}
        <AnimatePresence>
          {serverError && (
            <motion.div
              key="server-error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-3 rounded-xl border p-4"
              style={{
                background:  'rgba(196, 58, 58, 0.06)',
                borderColor: 'rgba(196, 58, 58, 0.3)',
              }}
            >
              <AlertCircle
                size={16}
                className="shrink-0 mt-0.5"
                style={{ color: '#C43A3A' }}
                aria-hidden="true"
              />
              <p className="text-sm" style={{ color: '#C43A3A' }}>{serverError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5"
          aria-label="Password reset form"
        >
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            aria-required="true"
            error={errors.email?.message}
            {...register('email')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Sending reset link…' : 'Send reset link'}
          </Button>
        </form>

        {/* Back link */}
        <p className="text-sm text-center text-muted">
          Remembered it?{' '}
          <Link
            href="/auth/login"
            className="font-semibold transition-colors duration-150 hover:underline"
            style={{ color: '#2B3875' }}
          >
            Back to sign in
          </Link>
        </p>

      </div>
    </div>
  )
}
