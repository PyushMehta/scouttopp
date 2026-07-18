import { NextResponse, type NextRequest } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  company_name:  z.string().min(1, 'Company name is required').max(100),
  company_url:   z.string().url('Must be a valid URL').optional().or(z.literal('')),
  industry:      z.string().max(100).optional(),
  company_size:  z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),
  note:          z.string().max(500).optional(),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false, error: { message: 'Unauthorised.' } }, { status: 401 })
  }

  const service = createServiceClient()

  const { data: profile } = await service
    .from('profiles')
    .select('role, auth_state')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'employer') {
    return NextResponse.json({ success: false, error: { message: 'Employer accounts only.' } }, { status: 403 })
  }
  if (profile?.auth_state !== 'PENDING_APPROVAL') {
    return NextResponse.json({ success: false, error: { message: 'Account is not pending.' } }, { status: 409 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ success: false, error: { message: 'Invalid JSON body.' } }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { message: parsed.error.issues[0]?.message ?? 'Invalid input.' } },
      { status: 400 },
    )
  }

  const { company_name, company_url, industry, company_size, note } = parsed.data

  const { error } = await service
    .from('employer_profiles')
    .upsert(
      {
        user_id:      user.id,
        company_name,
        company_url:  company_url || null,
        industry:     industry    || null,
        company_size: company_size ?? null,
        bio:          note         || null,
      },
      { onConflict: 'user_id' },
    )

  if (error) {
    console.error('[employer/onboarding]', error.message)
    return NextResponse.json({ success: false, error: { message: 'Failed to save. Try again.' } }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
