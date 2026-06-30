import type { Metadata } from 'next'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your ScouttOpp account and connect with top creative opportunities.',
}

export default function SignupPage() {
  return <SignupForm />
}
