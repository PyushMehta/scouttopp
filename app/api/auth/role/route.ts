import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { validateTransition, getCanonicalRoute } from '@/lib/auth/machine'

const schema = z.object({
  role: z.enum(['candidate', 'employer']),
})

/**
 * POST /api/auth/role
 *
 * Sets the user's role and transitions their auth_state from
 * VERIFIED_NO_ROLE → PENDING_APPROVAL.
 *
 * Called by role-select-form.tsx after the user picks an account type.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not signed in.' } },
      { status: 401 },
    )
  }

  // Parse and validate request body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON body.' } },
      { status: 400 },
    )
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid role.' } },
      { status: 400 },
    )
  }

  const { role } = parsed.data

  // Fetch current profile state
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('auth_state, role')
    .eq('id', user.id)
    .single()

  if (fetchError || !profile) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Profile not found.' } },
      { status: 404 },
    )
  }

  // Only allow transition from VERIFIED_NO_ROLE or INVITED
  if (
    profile.auth_state !== 'VERIFIED_NO_ROLE' &&
    profile.auth_state !== 'INVITED'
  ) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Role can only be set once during initial onboarding.',
        },
      },
      { status: 409 },
    )
  }

  if (!validateTransition(profile.auth_state, 'PENDING_APPROVAL')) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INVALID_STATE_TRANSITION', message: 'Invalid state transition.' },
      },
      { status: 422 },
    )
  }

  // Update role and auth_state atomically
  const { data: updated, error: updateError } = await supabase
    .from('profiles')
    .update({ role, auth_state: 'PENDING_APPROVAL' })
    .eq('id', user.id)
    .select('auth_state, role')
    .single()

  if (updateError || !updated) {
    console.error('[api/auth/role] update error:', updateError?.message)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update role.' } },
      { status: 500 },
    )
  }

  return NextResponse.json({
    success: true,
    data: {
      role:         updated.role,
      authState:    updated.auth_state,
      redirectTo:   getCanonicalRoute(updated),
    },
  })
}
