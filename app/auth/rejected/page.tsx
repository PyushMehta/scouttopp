import type { Metadata } from 'next'
import { RejectedScreen } from '@/components/auth/rejected-screen'

export const metadata: Metadata = {
  title: 'Application Not Approved',
  description: 'Your ScouttOpp application could not be approved at this time.',
}

export default function RejectedPage() {
  return <RejectedScreen />
}
