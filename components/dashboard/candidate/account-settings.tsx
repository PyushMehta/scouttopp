'use client'

import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z }            from 'zod'
import { KeyRound }     from 'lucide-react'
import { Input }         from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Button }        from '@/components/ui/button'
import { toast }         from '@/components/ui/toast'
import { createClient }  from '@/lib/supabase/client'
import { passwordSchema } from '@/lib/validations'
import { PasswordStrength } from '@/components/auth/password-strength'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    password:        passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match.',
    path:    ['confirmPassword'],
  })

type Values = z.infer<typeof changePasswordSchema>

export function AccountSettings({ email }: { email: string }) {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(changePasswordSchema) })

  const passwordValue = useWatch({ control, name: 'password', defaultValue: '' })

  const onSubmit = async (values: Values) => {
    setServerError(null)
    try {
      const supabase = createClient()

      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password: values.currentPassword,
      })
      if (signInErr) {
        setServerError('Current password is incorrect.')
        return
      }

      const { error: updateErr } = await supabase.auth.updateUser({ password: values.password })
      if (updateErr) {
        setServerError(updateErr.message)
        return
      }

      toast.success('Password updated.')
      reset()
    } catch {
      setServerError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card px-6 py-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Account</h2>
        <Input label="Email" value={email} disabled readOnly />
      </div>

      <div className="rounded-2xl border border-border bg-card px-6 py-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Change password</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {serverError && (
            <p role="alert" className="text-xs text-destructive">{serverError}</p>
          )}

          <PasswordInput
            label="Current password"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />

          <div className="space-y-2">
            <PasswordInput
              label="New password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <PasswordStrength password={passwordValue ?? ''} />
          </div>

          <PasswordInput
            label="Confirm new password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <div className="flex justify-end">
            <Button type="submit" loading={isSubmitting} leftIcon={<KeyRound size={14} aria-hidden="true" />}>
              Update password
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
