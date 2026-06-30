'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, ShieldAlert, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { resetPasswordSchema, type ResetPasswordValues } from '@/lib/validations'
import { ROUTES } from '@/constants'
import { PasswordInput }   from '@/components/ui/password-input'
import { Button }          from '@/components/ui/button'
import { PasswordStrength } from '@/components/auth/password-strength'

type Values = ResetPasswordValues

/* ─── Component ─────────────────────────────────────────────────────────── */

export function ResetPasswordForm() {
  const router = useRouter()

  const [sessionChecked, setSessionChecked]       = useState(false)
  const [hasRecoverySession, setHasRecoverySession] = useState(false)
  const [success, setSuccess]                     = useState(false)
  const [serverError, setServerError]             = useState<string | null>(null)

  // Check for an active recovery session on mount.
  // The /api/auth/callback route exchanges the PKCE code and sets the session
  // cookie before redirecting here, so getSession() should return a user.
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasRecoverySession(!!session?.user)
      setSessionChecked(true)
    })
  }, [])

  // Always call hooks unconditionally — early returns come after hooks
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(resetPasswordSchema),
    mode:     'onTouched',
  })

  const passwordValue = useWatch({ control, name: 'password', defaultValue: '' })

  const onSubmit = async (values: Values) => {
    setServerError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: values.password })
      if (error) {
        setServerError(error.message)
        return
      }
      // Sign out so the recovery session is cleared; user signs in fresh
      await supabase.auth.signOut()
      setSuccess(true)
    } catch {
      setServerError('Something went wrong. Please try again.')
    }
  }

  /* ── Loading while checking session ── */
  if (!sessionChecked) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-5"
        role="status"
        aria-live="polite"
        aria-label="Verifying reset link"
      >
        <Loader2
          size={36}
          className="animate-spin"
          style={{ color: '#2B3875' }}
          aria-hidden="true"
        />
        <p className="text-base font-semibold text-foreground">Verifying reset link…</p>
      </div>
    )
  }

  /* ── No recovery session — link expired or invalid ── */
  if (!hasRecoverySession) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-16">
        <div className="w-full max-w-110 space-y-8">

          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(196, 58, 58, 0.08)' }}
            aria-hidden="true"
          >
            <ShieldAlert size={28} strokeWidth={1.5} style={{ color: '#C43A3A' }} />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
              Link expired or invalid.
            </h1>
            <p className="text-base text-muted leading-relaxed">
              This password reset link is no longer valid. Links expire after 1 hour
              and can only be used once.
            </p>
          </div>

          <Link href={ROUTES.auth.forgotPassword} className="block">
            <Button variant="primary" size="lg" className="w-full" type="button">
              Request a new link
            </Button>
          </Link>

          <p className="text-sm text-center text-muted">
            <Link
              href={ROUTES.auth.login}
              className="font-semibold transition-colors duration-150 hover:underline"
              style={{ color: '#6B5FAE' }}
            >
              Back to sign in
            </Link>
          </p>

        </div>
      </div>
    )
  }

  /* ── Success state ── */
  if (success) {
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
              Password updated.
            </h1>
            <p className="text-base text-muted">
              Your password has been changed successfully. Sign in with your new password.
            </p>
          </div>

          <Link href={ROUTES.auth.login} className="block">
            <Button variant="primary" size="lg" className="w-full" type="button">
              Sign in
            </Button>
          </Link>

        </div>
      </div>
    )
  }

  /* ── Form ── */
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-16">
      <div className="w-full max-w-110 space-y-8">

        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Create new password.
          </h1>
          <p className="text-base text-muted">
            Choose a strong password for your ScouttOpp account.
          </p>
        </div>

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
              <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: '#C43A3A' }} aria-hidden="true" />
              <p className="text-sm" style={{ color: '#C43A3A' }}>{serverError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5"
          aria-label="Create new password form"
        >
          <div className="space-y-2">
            <PasswordInput
              label="New password"
              placeholder="Create a strong password"
              autoComplete="new-password"
              required
              aria-required="true"
              error={errors.password?.message}
              {...register('password')}
            />
            <PasswordStrength password={passwordValue ?? ''} />
          </div>

          <PasswordInput
            label="Confirm new password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            required
            aria-required="true"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Updating password…' : 'Update password'}
          </Button>
        </form>

      </div>
    </div>
  )
}
