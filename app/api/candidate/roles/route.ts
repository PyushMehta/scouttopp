import { NextResponse, type NextRequest } from 'next/server'
import { requireCandidate }               from '@/lib/auth/require-candidate'
import { createServiceClient }            from '@/lib/supabase/server'
import { updateCompleteness }             from '@/lib/candidate-completeness'
import { z }                              from 'zod'
import { serverError }                    from '@/lib/api-error'

const MAX_ROLES = 5

const addSchema = z.object({
  role_name:  z.string().min(1, 'Role name is required').max(100, 'Max 100 characters'),
  is_primary: z.boolean().default(false),
})

export async function GET() {
  const auth = await requireCandidate()
  if (!auth.ok) return auth.response

  const service = createServiceClient()
  const { data, error } = await service
    .from('candidate_roles')
    .select('id, role_name, is_primary, sort_order')
    .eq('candidate_id', auth.candidateProfileId)
    .order('sort_order')
    .order('created_at')

  if (error) {
    return serverError('candidate/roles GET', error)
  }

  return NextResponse.json({ success: true, data: data ?? [] })
}

export async function POST(req: NextRequest) {
  const auth = await requireCandidate()
  if (!auth.ok) return auth.response

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ success: false, error: { message: 'Invalid JSON.' } }, { status: 400 })
  }

  const parsed = addSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { message: 'Invalid fields.' } }, { status: 422 })
  }

  const { role_name, is_primary } = parsed.data
  const trimmedName = role_name.trim()
  const service = createServiceClient()

  // Check how many roles the candidate already has
  const { count } = await service
    .from('candidate_roles')
    .select('id', { count: 'exact', head: true })
    .eq('candidate_id', auth.candidateProfileId)

  if ((count ?? 0) >= MAX_ROLES) {
    return NextResponse.json(
      { success: false, error: { code: 'LIMIT_REACHED', message: `You can add up to ${MAX_ROLES} roles.` } },
      { status: 422 },
    )
  }

  const sort_order = count ?? 0
  // Auto-promote to primary if this is the candidate's first role
  const effectiveIsPrimary = is_primary || sort_order === 0

  // Clear existing primary before setting a new one
  if (effectiveIsPrimary) {
    await service
      .from('candidate_roles')
      .update({ is_primary: false })
      .eq('candidate_id', auth.candidateProfileId)
      .eq('is_primary', true)
  }

  const { data, error } = await service
    .from('candidate_roles')
    .insert({
      candidate_id: auth.candidateProfileId,
      role_name:    trimmedName,
      is_primary:   effectiveIsPrimary,
      sort_order,
    })
    .select('id, role_name, is_primary, sort_order')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: { code: 'DUPLICATE', message: 'You already have this role.' } },
        { status: 409 },
      )
    }
    return serverError('candidate/roles POST', error)
  }

  // Keep candidate_profiles.primary_role in sync
  if (effectiveIsPrimary) {
    await service
      .from('candidate_profiles')
      .update({ primary_role: trimmedName })
      .eq('id', auth.candidateProfileId)
  }

  await updateCompleteness(auth.candidateProfileId).catch(console.error)

  return NextResponse.json({ success: true, data })
}
