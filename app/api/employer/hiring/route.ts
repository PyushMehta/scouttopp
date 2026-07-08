import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireEmployer } from '@/lib/auth/require-employer'
import { createServiceClient } from '@/lib/supabase/server'

const ROLE_VALUES = [
  'motion_designer', 'graphic_designer', 'ux_designer', 'brand_designer',
  'illustrator', 'photographer', 'videographer', 'creative_director',
  'art_director', 'copywriter', 'social_media', 'other',
] as const

const updateSchema = z.object({
  typically_hires:    z.array(z.enum(ROLE_VALUES)).nullable().optional(),
  contract_preferred: z.boolean().nullable().optional(),
  fulltime_preferred: z.boolean().nullable().optional(),
  remote_ok:          z.boolean().nullable().optional(),
  onsite_ok:          z.boolean().nullable().optional(),
  budget_min_hourly:  z.number().int().min(0).max(10000).nullable().optional(),
  budget_max_hourly:  z.number().int().min(0).max(10000).nullable().optional(),
  hiring_urgency:     z.enum(['immediately', 'within_month', 'within_quarter', 'exploring']).nullable().optional(),
})

export async function GET() {
  const auth = await requireEmployer()
  if (!auth.ok) return auth.response

  const service = createServiceClient()
  const { data } = await service
    .from('employer_hiring_profiles')
    .select('*')
    .eq('employer_id', auth.employerProfileId)
    .maybeSingle()

  return NextResponse.json({ success: true, data: data ?? null })
}

export async function PATCH(req: NextRequest) {
  const auth = await requireEmployer()
  if (!auth.ok) return auth.response

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Invalid JSON body.' } }, { status: 400 })
  }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid input.' } }, { status: 422 })
  }

  const service = createServiceClient()
  const { data, error } = await service
    .from('employer_hiring_profiles')
    .upsert({ employer_id: auth.employerProfileId, ...parsed.data }, { onConflict: 'employer_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ success: false, error: { code: 'DB_ERROR', message: error.message } }, { status: 500 })
  return NextResponse.json({ success: true, data })
}
