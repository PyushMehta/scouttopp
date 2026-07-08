import { createServiceClient } from '@/lib/supabase/server'
import type { MappedCandidate } from './sync-mapper'

export class AdminError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'AdminError'
  }
}

// ─── Approve ────────────────────────────────────────────────────────────────

export async function approveCandidate(stagingId: string, adminUserId: string) {
  const supabase = createServiceClient()

  const { data: staging, error: stagingErr } = await supabase
    .from('candidate_sync_staging')
    .select('*')
    .eq('id', stagingId)
    .single()

  if (stagingErr || !staging) {
    throw new AdminError('Staging row not found', 'NOT_FOUND', 404)
  }
  if (staging.status === 'promoted') {
    throw new AdminError('Candidate already approved', 'CONFLICT', 409)
  }
  if (staging.status === 'rejected') {
    throw new AdminError('Cannot approve a rejected candidate', 'INVALID_STATE_TRANSITION', 422)
  }

  const mapped = staging.mapped_data as MappedCandidate | null
  if (!mapped?.full_name || !mapped?.email) {
    throw new AdminError('Staging row has no valid mapped_data', 'INTERNAL_ERROR', 500)
  }

  const now = new Date().toISOString()

  // Create canonical candidate_profiles row (user_id=null until invite is accepted)
  const { data: profile, error: profileErr } = await supabase
    .from('candidate_profiles')
    .insert({
      data_source:      'google_sheets_sync',
      full_name:        mapped.full_name,
      email:            mapped.email,
      phone:            mapped.phone,
      location_city:    mapped.location_city,
      location_country: mapped.location_country,
      timezone:         mapped.timezone,
      pronouns:         mapped.pronouns,
      bio:              mapped.bio,
      avatar_url:       mapped.avatar_url,
      primary_role:     mapped.primary_role,
      years_experience: mapped.years_experience,
      portfolio_url:    mapped.portfolio_url,
      linkedin_url:     mapped.linkedin_url,
      instagram_url:    mapped.instagram_url,
      website_url:      mapped.website_url,
      resume_url:       mapped.resume_url,
      is_discoverable:  true,
      approved_by:      adminUserId,
      approved_at:      now,
    })
    .select('id')
    .single()

  if (profileErr || !profile) {
    throw new AdminError(
      `Failed to create candidate profile: ${profileErr?.message}`,
      'INTERNAL_ERROR',
      500,
    )
  }

  // Mark this staging row as promoted, plus any other pending rows for the same email
  await supabase
    .from('candidate_sync_staging')
    .update({ status: 'promoted', candidate_profile_id: profile.id, promoted_at: now })
    .in('status', ['pending'])
    .filter('mapped_data->>email', 'eq', mapped.email)

  // Check if this candidate already has a Supabase account (signed up via the new flow).
  // inviteUserByEmail silently fails for existing users, so we handle both paths explicitly.
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, auth_state')
    .eq('email', mapped.email)
    .maybeSingle()

  let inviteSent  = false
  let actionLink: string | null = null
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (existingProfile) {
    // Existing account — link profile and approve directly
    await supabase
      .from('candidate_profiles')
      .update({ user_id: existingProfile.id })
      .eq('id', profile.id)

    await supabase
      .from('profiles')
      .update({ auth_state: 'APPROVED' })
      .eq('id', existingProfile.id)

    // Generate a magic link the admin can share with the candidate
    const { data: linkData, error: magicErr } = await supabase.auth.admin.generateLink({
      type:    'magiclink',
      email:   mapped.email,
      options: { redirectTo: `${appUrl}/dashboard/candidate` },
    })

    if (magicErr) {
      console.error('[admin.service] generateLink failed:', magicErr.message)
    } else {
      actionLink = linkData.properties?.action_link ?? null
      inviteSent = true
    }
  } else {
    // No existing account — send the usual invite email
    const { error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(mapped.email, {
      data: { role: 'candidate', candidate_profile_id: profile.id },
    })

    if (inviteErr) {
      console.error('[admin.service] inviteUserByEmail failed:', inviteErr.message)
    } else {
      inviteSent    = true
    }
  }

  return {
    candidateProfileId: profile.id,
    authState:          'APPROVED' as const,
    isDiscoverable:     true,
    approvedAt:         now,
    inviteSent,
    actionLink,
  }
}

// ─── Reject ─────────────────────────────────────────────────────────────────

export async function rejectCandidate(stagingId: string, reason: string) {
  const supabase = createServiceClient()

  const { data: staging, error } = await supabase
    .from('candidate_sync_staging')
    .select('id, status')
    .eq('id', stagingId)
    .single()

  if (error || !staging) throw new AdminError('Staging row not found', 'NOT_FOUND', 404)
  if (staging.status === 'rejected') throw new AdminError('Already rejected', 'CONFLICT', 409)
  if (staging.status === 'promoted') {
    throw new AdminError('Cannot reject an already approved candidate', 'INVALID_STATE_TRANSITION', 422)
  }

  await supabase
    .from('candidate_sync_staging')
    .update({ status: 'rejected', error_message: reason || null })
    .eq('id', stagingId)

  return { stagingId, authState: 'REJECTED' as const, rejectedAt: new Date().toISOString() }
}

// ─── Suspend ─────────────────────────────────────────────────────────────────

export async function suspendUser(userId: string) {
  const supabase = createServiceClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('auth_state')
    .eq('id', userId)
    .single()

  if (error || !profile) throw new AdminError('User not found', 'NOT_FOUND', 404)
  if (profile.auth_state === 'SUSPENDED') {
    throw new AdminError('User is already suspended', 'CONFLICT', 409)
  }

  await supabase.from('profiles').update({ auth_state: 'SUSPENDED' }).eq('id', userId)

  return { userId, authState: 'SUSPENDED' as const }
}

// ─── Reinstate ───────────────────────────────────────────────────────────────

export async function reinstateUser(userId: string) {
  const supabase = createServiceClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('auth_state')
    .eq('id', userId)
    .single()

  if (error || !profile) throw new AdminError('User not found', 'NOT_FOUND', 404)
  if (profile.auth_state !== 'SUSPENDED') {
    throw new AdminError('User is not suspended', 'INVALID_STATE_TRANSITION', 422)
  }

  await supabase.from('profiles').update({ auth_state: 'APPROVED' }).eq('id', userId)

  return { userId, authState: 'APPROVED' as const }
}
