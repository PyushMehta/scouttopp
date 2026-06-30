import type { Metadata } from 'next'
import { SuspendedScreen } from '@/components/auth/suspended-screen'

export const metadata: Metadata = {
  title: 'Account Suspended',
  description: 'Your ScouttOpp account has been temporarily suspended.',
}

export default function SuspendedPage() {
  return <SuspendedScreen />
}
