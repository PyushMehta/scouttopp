import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Request a password reset link for your ScouttOpp account.',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
