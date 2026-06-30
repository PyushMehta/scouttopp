'use client'

import { useState, useId } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginValues } from '@/lib/validations'
import { APP_URL, ROUTES } from '@/constants'
import { AlertCircle } from 'lucide-react'
import { Input }         from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Checkbox }      from '@/components/ui/checkbox'
import { Button }        from '@/components/ui/button'
import { GoogleButton }  from '@/components/auth/google-button'
import { AuthDivider }   from '@/components/auth/auth-divider'
import { cn }            from '@/lib/utils'

/* ─── Credential error banner ───────────────────────────────────────────── */

function CredentialError({ message }: { message: string }) {
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
          background:   'rgba(196, 58, 58, 0.06)',
          borderColor:  'rgba(196, 58, 58, 0.3)',
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

/* ─── Component ─────────────────────────────────────────────────────────── */

export function LoginForm() {
  const router = useRouter()
  const formId = useId()
  const supabase = createClient()

  const [credentialError, setCredentialError] = useState<string | null>(null)
  const [shaking, setShaking]                  = useState(false)
  const [googleLoading, setGoogleLoading]      = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  })

  /* ── Shake helper ── */
  const triggerShake = () => {
    setShaking(true)
    setTimeout(() => setShaking(false), 400)
  }

  /* ── Form submission ── */
  const onSubmit = async (values: LoginValues) => {
    setCredentialError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email:    values.email,
        password: values.password,
      })

      if (error) {
        if (
          error.message.toLowerCase().includes('invalid') ||
          error.message.toLowerCase().includes('credentials') ||
          error.message.toLowerCase().includes('password')
        ) {
          setCredentialError('The email or password you entered is incorrect. Please try again.')
        } else {
          setCredentialError(error.message)
        }
        triggerShake()
        return
      }

      // Middleware will redirect to canonical route based on auth_state.
      // router.refresh() triggers the middleware to re-evaluate.
      router.refresh()
    } catch {
      setCredentialError('Something went wrong. Please try again.')
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
      if (!data.url) throw new Error('Google sign-in is not available right now.')
      window.location.href = data.url
    } catch (err) {
      setCredentialError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-16">
      <div className="w-full max-w-110 space-y-8">

        {/* ── Header ── */}
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Welcome back.
          </h1>
          <p className="text-base text-muted">
            Sign in to your ScouttOpp account.
          </p>
        </div>

        {/* ── Google OAuth ── */}
        <GoogleButton
          label="Continue with Google"
          loading={googleLoading}
          onClick={handleGoogle}
        />

        <AuthDivider />

        {/* ── Credential error banner ── */}
        {credentialError && <CredentialError message={credentialError} />}

        {/* ── Email / password form ── */}
        <motion.form
          id={formId}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className={cn('space-y-5', shaking && 'animate-shake')}
          aria-label="Sign in form"
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

          <div className="space-y-1.5">
            <PasswordInput
              label="Password"
              placeholder="Your password"
              autoComplete="current-password"
              required
              aria-required="true"
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-xs font-medium transition-colors duration-150 hover:underline"
                style={{ color: '#6B5FAE' }}
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Checkbox
            label="Remember me for 30 days"
            {...register('remember')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            className="w-full"
            aria-label="Sign in"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </motion.form>

        {/* ── Sign-up link ── */}
        <p className="text-sm text-center text-muted">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/signup"
            className="font-semibold transition-colors duration-150 hover:underline"
            style={{ color: '#2B3875' }}
          >
            Create one
          </Link>
        </p>

      </div>
    </div>
  )
}
