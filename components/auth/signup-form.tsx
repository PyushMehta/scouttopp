'use client'

import { useState, useId } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { signupSchema, type SignupValues } from '@/lib/validations'
import { APP_URL, ROUTES } from '@/constants'
import { Input }              from '@/components/ui/input'
import { PasswordInput }      from '@/components/ui/password-input'
import { Checkbox }           from '@/components/ui/checkbox'
import { Button }             from '@/components/ui/button'
import { GoogleButton }       from '@/components/auth/google-button'
import { AuthDivider }        from '@/components/auth/auth-divider'
import { PasswordStrength }   from '@/components/auth/password-strength'
import { cn }                 from '@/lib/utils'

/* ─── Server error banner ───────────────────────────────────────────────── */

function ServerError({ message }: { message: string }) {
  return (
    <AnimatePresence>
      <motion.div
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
        <p className="text-sm leading-snug" style={{ color: '#C43A3A' }}>
          {message}
        </p>
      </motion.div>
    </AnimatePresence>
  )
}

/* ─── Invite code expander ──────────────────────────────────────────────── */

function InviteCodeSection({ register, error }: {
  register: ReturnType<typeof useForm<SignupValues>>['register']
  error?: string
}) {
  const [open, setOpen] = useState(false)
  const inputId = useId()

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs font-medium transition-colors duration-150 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm"
        style={{ color: '#6B5FAE' }}
        aria-expanded={open}
        aria-controls={inputId}
      >
        Have an invite code?
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <ChevronDown size={13} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={inputId}
            key="invite-input"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pt-0.5">
              <Input
                label="Invite code"
                type="text"
                placeholder="XXXXX-XXXXX"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                error={error}
                aria-label="Invite code (optional)"
                {...register('inviteCode')}
              />
              <p className="mt-1.5 text-xs text-muted">
                If you were referred by a team member, enter their code here. It&apos;s optional.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function SignupForm() {
  const router   = useRouter()
  const formId   = useId()
  const supabase = createClient()

  const [serverError, setServerError]  = useState<string | null>(null)
  const [shaking, setShaking]          = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onTouched',
    defaultValues: {
      email:      '',
      password:   '',
      inviteCode: '',
    },
  })

  /* Watch password for the strength meter */
  const passwordValue = useWatch({ control, name: 'password', defaultValue: '' })

  /* ── Shake helper ── */
  const triggerShake = () => {
    setShaking(true)
    setTimeout(() => setShaking(false), 400)
  }

  /* ── Form submission ── */
  const onSubmit = async (values: SignupValues) => {
    setServerError(null)
    try {
      // Validate invite code first if provided
      if (values.inviteCode?.trim()) {
        const res = await fetch(ROUTES.api.inviteValidate, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ code: values.inviteCode.trim() }),
        })
        if (!res.ok) {
          const json = await res.json()
          setServerError(json.error?.message ?? 'Invalid invite code.')
          triggerShake()
          return
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email:    values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${APP_URL}${ROUTES.api.authCallback}`,
        },
      })

      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          setServerError('An account with this email already exists. Try signing in.')
        } else {
          setServerError(error.message)
        }
        triggerShake()
        return
      }

      // identities being empty means email already exists (Supabase security feature)
      if (data.user && !data.user.identities?.length) {
        setServerError('An account with this email already exists. Try signing in.')
        triggerShake()
        return
      }

      router.push(`${ROUTES.auth.verifyEmail}?email=${encodeURIComponent(values.email)}`)
    } catch {
      setServerError('Something went wrong. Please try again.')
      triggerShake()
    }
  }

  /* ── Google OAuth ── */
  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo:          `${APP_URL}${ROUTES.api.authCallback}`,
          skipBrowserRedirect: true,
        },
      })
      if (error) throw error
      if (!data.url) throw new Error('Google sign-up is not available right now.')
      window.location.href = data.url
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Google sign-up failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-16">
      <div className="w-full max-w-110 space-y-8">

        {/* ── Header ── */}
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Create your account.
          </h1>
          <p className="text-base text-muted">
            Join ScouttOpp and connect with top creative opportunities.
          </p>
        </div>

        {/* ── Google OAuth ── */}
        <div className="space-y-2">
          <GoogleButton
            label="Sign up with Google"
            loading={googleLoading}
            onClick={handleGoogle}
          />
          <p className="text-xs text-center text-muted leading-relaxed">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline underline-offset-2 hover:text-foreground" target="_blank" rel="noopener noreferrer">
              Terms &amp; Conditions
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </Link>.
          </p>
        </div>

        <AuthDivider />

        {/* ── Server error banner ── */}
        {serverError && <ServerError message={serverError} />}

        {/* ── Signup form ── */}
        <motion.form
          id={formId}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className={cn('space-y-5', shaking && 'animate-shake')}
          aria-label="Create account form"
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

          <div className="space-y-2">
            <PasswordInput
              label="Password"
              placeholder="Create a password"
              autoComplete="new-password"
              required
              aria-required="true"
              error={errors.password?.message}
              {...register('password')}
            />
            <PasswordStrength password={passwordValue ?? ''} />
          </div>

          <InviteCodeSection register={register} error={errors.inviteCode?.message} />

          <div className="space-y-1.5">
            <Checkbox
              label={
                <>
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    className="font-semibold hover:underline"
                    style={{ color: '#2B3875' }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms &amp; Conditions
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/privacy"
                    className="font-semibold hover:underline"
                    style={{ color: '#2B3875' }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </Link>
                </>
              }
              {...register('terms')}
            />
            {errors.terms && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs pl-7"
                style={{ color: '#C43A3A' }}
                role="alert"
              >
                {errors.terms.message}
              </motion.p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            className="w-full"
            aria-label="Create account"
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </motion.form>

        {/* ── Sign-in link ── */}
        <p className="text-sm text-center text-muted">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-semibold transition-colors duration-150 hover:underline"
            style={{ color: '#2B3875' }}
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}
