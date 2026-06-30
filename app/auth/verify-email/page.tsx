import type { Metadata } from 'next'
import { VerifyEmailPrompt } from '@/components/auth/verify-email-prompt'

export const metadata: Metadata = {
  title: 'Verify Your Email',
  description: 'Check your inbox to verify your ScouttOpp account.',
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function VerifyEmailPage({ searchParams }: Props) {
  const params = await searchParams
  const email  = typeof params?.email === 'string' ? params.email : undefined
  return <VerifyEmailPrompt email={email} />
}
