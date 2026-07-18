import { NextRequest, NextResponse } from 'next/server'
import { z }                         from 'zod'
import { requireEmployer }           from '@/lib/auth/require-employer'
import { createServiceClient }       from '@/lib/supabase/server'
import { serverError }               from '@/lib/api-error'

const updateSchema = z.object({
  company_name:    z.string().min(1).max(200).optional(),
  company_size:    z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).nullable().optional(),
  industry:        z.string().max(100).nullable().optional(),
  company_url:     z.string().url().nullable().optional().or(z.literal('')),
  linkedin_url:    z.string().url().nullable().optional().or(z.literal('')),
  bio:             z.string().max(1000).nullable().optional(),
  location_city:   z.string().max(100).nullable().optional(),
  location_country:z.string().max(100).nullable().optional(),
  founded_year:    z.number().int().min(1800).max(new Date().getFullYear()).nullable().optional(),
})

export async function GET() {
  const auth = await requireEmployer()
  if (!auth.ok) return auth.response

  const service = createServiceClient()
  const { data, error } = await service
    .from('employer_profiles')
    .select('*')
    .eq('id', auth.employerProfileId)
    .single()

  if (error) return serverError('employer/profile GET', error)
  return NextResponse.json({ success: true, data })
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

  const d = parsed.data
  const update = {
    company_name:     d.company_name,
    company_size:     d.company_size,
    industry:         d.industry     === '' ? null : d.industry,
    company_url:      d.company_url  === '' ? null : d.company_url,
    linkedin_url:     d.linkedin_url === '' ? null : d.linkedin_url,
    bio:              d.bio,
    location_city:    d.location_city,
    location_country: d.location_country,
    founded_year:     d.founded_year,
  }

  const service = createServiceClient()
  const { data, error } = await service
    .from('employer_profiles')
    .update(update)
    .eq('id', auth.employerProfileId)
    .select()
    .single()

  if (error) return serverError('employer/profile PATCH', error)
  return NextResponse.json({ success: true, data })
}
