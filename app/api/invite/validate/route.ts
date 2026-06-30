import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  code: z.string().min(1, 'Invite code is required.'),
})

/**
 * POST /api/invite/validate
 *
 * Validates an invite code before signup proceeds.
 * Does NOT increment the use count — that happens at signup.
 */
export async function POST(request: NextRequest) {
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
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invite code is required.' } },
      { status: 400 },
    )
  }

  const supabase = await createClient()

  const { data: invite } = await supabase
    .from('invite_codes')
    .select('id, role, max_uses, uses, expires_at')
    .ilike('code', parsed.data.code) // case-insensitive match
    .single()

  if (!invite) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_INVITE_CODE', message: 'This invite code is not valid.' } },
      { status: 404 },
    )
  }

  if (invite.uses >= invite.max_uses) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_INVITE_CODE', message: 'This invite code has already been used.' } },
      { status: 422 },
    )
  }

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_INVITE_CODE', message: 'This invite code has expired.' } },
      { status: 422 },
    )
  }

  return NextResponse.json({
    success: true,
    data: {
      valid:         true,
      role:          invite.role,
      remainingUses: invite.max_uses - invite.uses,
    },
  })
}
