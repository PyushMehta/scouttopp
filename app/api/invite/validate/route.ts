import { NextResponse, type NextRequest } from 'next/server'
import { z }                              from 'zod'
import { createClient }                  from '@/lib/supabase/server'
import {
  checkAuthAccount,
  getClientIP,
  getBackoffSeconds,
  recordBackoffFailure,
  clearBackoff,
  rateLimitResponse,
} from '@/lib/rate-limit'

const schema = z.object({
  code: z.string().min(1, 'Invite code is required.'),
})

/**
 * POST /api/invite/validate
 *
 * Validates an invite code before signup proceeds.
 * Does NOT increment the use count — that happens at signup.
 *
 * Rate limiting (layered):
 *   1. Per-IP sliding window — enforced in proxy (checkAuthIP)
 *   2. Per-IP exponential backoff — grows on each failed attempt from this IP
 *   3. Per-code sliding window — limits how many times one code can be tried
 */
export async function POST(request: NextRequest) {
  const ip = getClientIP(request)

  // Layer 2: exponential backoff — check before touching the DB
  const backoffSecs = await getBackoffSeconds(ip)
  if (backoffSecs > 0) {
    return rateLimitResponse(backoffSecs)
  }

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

  const code = parsed.data.code.toUpperCase()

  // Layer 3: per-code limit — catches distributed brute-force against one code
  const codeLimit = await checkAuthAccount(code)
  if (!codeLimit.ok) {
    return rateLimitResponse(codeLimit.retryAfter)
  }

  const supabase = await createClient()

  const { data: invite } = await supabase
    .from('invite_codes')
    .select('id, role, max_uses, uses, expires_at')
    .ilike('code', code)
    .single()

  if (!invite) {
    // Invalid code — increment per-IP backoff counter
    await recordBackoffFailure(ip)
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_INVITE_CODE', message: 'This invite code is not valid.' } },
      { status: 404 },
    )
  }

  if (invite.uses >= invite.max_uses) {
    await recordBackoffFailure(ip)
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_INVITE_CODE', message: 'This invite code has already been used.' } },
      { status: 422 },
    )
  }

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    await recordBackoffFailure(ip)
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_INVITE_CODE', message: 'This invite code has expired.' } },
      { status: 422 },
    )
  }

  // Valid — reset backoff so legitimate users aren't penalised
  await clearBackoff(ip)

  return NextResponse.json({
    success: true,
    data: {
      valid:         true,
      role:          invite.role,
      remainingUses: invite.max_uses - invite.uses,
    },
  })
}
