import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin }    from '@/lib/auth/require-admin'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id: profileId } = await params
  const supabase = createServiceClient()
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // 1. Fetch the pending employer profile
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('id, email, role, auth_state')
    .eq('id', profileId)
    .single()

  if (profileErr || !profile) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'User not found.' } },
      { status: 404 },
    )
  }

  if (profile.role !== 'employer') {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_ROLE', message: 'User is not an employer.' } },
      { status: 422 },
    )
  }

  if (profile.auth_state === 'APPROVED') {
    return NextResponse.json(
      { success: false, error: { code: 'CONFLICT', message: 'Employer already approved.' } },
      { status: 409 },
    )
  }

  // 2. Create employer_profiles row if it doesn't exist
  const { data: existingEmp } = await supabase
    .from('employer_profiles')
    .select('id')
    .eq('user_id', profileId)
    .maybeSingle()

  if (!existingEmp) {
    const { error: empErr } = await supabase
      .from('employer_profiles')
      .insert({ user_id: profileId, company_name: '' })

    if (empErr) {
      console.error('[admin/employers/approve] insert employer_profiles:', empErr.message)
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create employer profile.' } },
        { status: 500 },
      )
    }
  }

  // 3. Approve
  await supabase
    .from('profiles')
    .update({ auth_state: 'APPROVED' })
    .eq('id', profileId)

  // 4. Generate magic link so admin can share it (email unreliable on free tier)
  let actionLink: string | null = null
  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type:    'magiclink',
    email:   profile.email ?? '',
    options: { redirectTo: `${appUrl}/dashboard/employer` },
  })

  if (linkErr) {
    console.error('[admin/employers/approve] generateLink:', linkErr.message)
  } else {
    actionLink = linkData.properties?.action_link ?? null
  }

  return NextResponse.json({ success: true, data: { actionLink } })
}
