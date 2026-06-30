import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
  title: 'Create New Password',
  description: 'Set a new password for your ScouttOpp account.',
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
