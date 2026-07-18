import { NextRequest, NextResponse } from 'next/server'
import { z }                         from 'zod'
import { requireEmployer }           from '@/lib/auth/require-employer'
import { createServiceClient }       from '@/lib/supabase/server'
import { serverError }               from '@/lib/api-error'

const updateSchema = z.object({
  notify_new_match: z.boolean().optional(),
  notify_email:     z.boolean().optional(),
})

export async function GET() {
  const auth = await requireEmployer()
  if (!auth.ok) return auth.response

  const service = createServiceClient()
  const { data } = await service
    .from('employer_preferences')
    .select('*')
    .eq('employer_id', auth.employerProfileId)
    .maybeSingle()

  return NextResponse.json({ success: true, data: data ?? { notify_new_match: true, notify_email: true } })
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
    .from('employer_preferences')
    .upsert({ employer_id: auth.employerProfileId, ...parsed.data }, { onConflict: 'employer_id' })
    .select()
    .single()

  if (error) return serverError('employer/preferences PATCH', error)
  return NextResponse.json({ success: true, data })
}
