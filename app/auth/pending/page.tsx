import type { Metadata } from 'next'
import { createClient }          from '@/lib/supabase/server'
import { createServiceClient }   from '@/lib/supabase/server'
import { checkEmailInSheet }     from '@/services/sheets.service'
import { PendingScreen }         from '@/components/auth/pending-screen'
import { EmployerOnboardingForm } from '@/components/auth/employer-onboarding-form'

export const metadata: Metadata = {
  title: 'Application Under Review',
  description: 'Your ScouttOpp application is being reviewed by our team.',
}

export default async function PendingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let hasFilledForm = true

  if (user?.email) {
    const service = createServiceClient()

    const { data: profile } = await service
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'employer') {
      // Check if the employer has already submitted their company details
      const { data: empProfile } = await service
        .from('employer_profiles')
        .select('id, company_name')
        .eq('user_id', user.id)
        .maybeSingle()

      // No profile row, or row exists but company_name is blank → show form
      const hasSubmittedDetails = !!(empProfile && empProfile.company_name)

      if (!hasSubmittedDetails) {
        return <EmployerOnboardingForm email={user.email} />
      }

      // Profile submitted — show "under review" screen
      return (
        <PendingScreen
          email={user.email}
          role="employer"
          hasFilledForm={false}
        />
      )
    }

    if (profile?.role === 'candidate') {
      // 1. Already synced by admin
      const { data: stagingRow } = await service
        .from('candidate_sync_staging')
        .select('id')
        .filter('mapped_data->>email', 'ilike', user.email)
        .neq('status', 'rejected')
        .limit(1)
        .maybeSingle()

      if (stagingRow) {
        hasFilledForm = true
      } else {
        // 2. Admin already approved (profile exists before invite accepted)
        const { data: candidateProfile } = await service
          .from('candidate_profiles')
          .select('id')
          .ilike('email', user.email)
          .limit(1)
          .maybeSingle()

        if (candidateProfile) {
          hasFilledForm = true
        } else {
          // 3. Form submitted but sync not yet run — check Google Sheets directly
          hasFilledForm = await checkEmailInSheet(user.email)
        }
      }
    }
  }

  return (
    <PendingScreen
      email={user?.email}
      hasFilledForm={hasFilledForm}
      formUrl={process.env.NEXT_PUBLIC_CANDIDATE_FORM_URL}
    />
  )
}
