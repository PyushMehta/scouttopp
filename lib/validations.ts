import { z } from 'zod'

// Zod v4: .email() on ZodString is deprecated — use z.email() standalone for format check
export const emailSchema = z
  .string()
  .min(1, 'Email is required.')
  .refine((v) => z.email().safeParse(v).success, 'Enter a valid email address.')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')

export const loginSchema = z.object({
  email:    emailSchema,
  password: z.string().min(1, 'Password is required.'),
  remember: z.boolean().optional(),
})

export const signupSchema = z.object({
  email:      emailSchema,
  password:   passwordSchema,
  inviteCode: z.string().optional(),
  terms:      z.literal(true, {
    error: () => ({ message: 'You must accept the terms to continue.' }),
  }),
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z
  .object({
    password:        passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match.',
    path:    ['confirmPassword'],
  })

export const inviteCodeSchema = z.object({
  code: z.string().min(1, 'Invite code is required.'),
})

export type LoginValues         = z.infer<typeof loginSchema>
export type SignupValues         = z.infer<typeof signupSchema>
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordValues  = z.infer<typeof resetPasswordSchema>
