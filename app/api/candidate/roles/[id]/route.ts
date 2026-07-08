import { NextResponse, type NextRequest } from 'next/server'
import { requireCandidate }               from '@/lib/auth/require-candidate'
import { createServiceClient }            from '@/lib/supabase/server'
import { updateCompleteness }             from '@/lib/candidate-completeness'

interface Params { params: Promise<{ id: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireCandidate()
  if (!auth.ok) return auth.response

  const { id } = await params
  const service = createServiceClient()

  // Verify ownership and read is_primary before deleting
  const { data: role, error: fetchErr } = await service
    .from('candidate_roles')
    .select('id, role_name, is_primary')
    .eq('id', id)
    .eq('candidate_id', auth.candidateProfileId)
    .single()

  if (fetchErr || !role) {
    return NextResponse.json({ success: false, error: { message: 'Role not found.' } }, { status: 404 })
  }

  const { error } = await service
    .from('candidate_roles')
    .delete()
    .eq('id', id)
    .eq('candidate_id', auth.candidateProfileId)

  if (error) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 })
  }

  // If we deleted the primary role, promote the next role and sync the profile field
  if (role.is_primary) {
    const { data: remaining } = await service
      .from('candidate_roles')
      .select('id, role_name')
      .eq('candidate_id', auth.candidateProfileId)
      .order('sort_order')
      .limit(1)

    if (remaining && remaining.length > 0) {
      await service
        .from('candidate_roles')
        .update({ is_primary: true })
        .eq('id', remaining[0].id)
      await service
        .from('candidate_profiles')
        .update({ primary_role: remaining[0].role_name })
        .eq('id', auth.candidateProfileId)
    } else {
      await service
        .from('candidate_profiles')
        .update({ primary_role: null })
        .eq('id', auth.candidateProfileId)
    }
  }

  await updateCompleteness(auth.candidateProfileId).catch(console.error)

  return NextResponse.json({ success: true })
}

// PATCH /api/candidate/roles/[id] — set this role as primary
export async function PATCH(_req: NextRequest, { params }: Params) {
  const auth = await requireCandidate()
  if (!auth.ok) return auth.response

  const { id } = await params
  const service = createServiceClient()

  // Verify ownership
  const { data: role, error: fetchErr } = await service
    .from('candidate_roles')
    .select('id, role_name, is_primary')
    .eq('id', id)
    .eq('candidate_id', auth.candidateProfileId)
    .single()

  if (fetchErr || !role) {
    return NextResponse.json({ success: false, error: { message: 'Role not found.' } }, { status: 404 })
  }

  if (role.is_primary) {
    return NextResponse.json({ success: true }) // already primary, no-op
  }

  // Clear old primary
  await service
    .from('candidate_roles')
    .update({ is_primary: false })
    .eq('candidate_id', auth.candidateProfileId)
    .eq('is_primary', true)

  // Set new primary
  const { error } = await service
    .from('candidate_roles')
    .update({ is_primary: true })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 })
  }

  // Sync denormalized field — DB trigger handles updated_at
  await service
    .from('candidate_profiles')
    .update({ primary_role: role.role_name })
    .eq('id', auth.candidateProfileId)

  await updateCompleteness(auth.candidateProfileId).catch(console.error)

  return NextResponse.json({ success: true })
}
