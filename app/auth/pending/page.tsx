import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PendingScreen } from '@/components/auth/pending-screen'

export const metadata: Metadata = {
  title: 'Application Under Review',
  description: 'Your ScouttOpp application is being reviewed by our team.',
}

export default async function PendingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <PendingScreen email={user?.email} />
}
