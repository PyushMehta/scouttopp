import { Ratelimit }    from '@upstash/ratelimit'
import { Redis }        from '@upstash/redis'
import { NextResponse } from 'next/server'
import { RL }           from './config'

// ── Redis client ───────────────────────────────────────────────────────────────

let _redis: Redis | null | undefined

function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis

  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[rate-limit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — rate limiting disabled')
    }
    _redis = null
    return null
  }

  _redis = new Redis({ url, token })
  return _redis
}

// ── Sliding-window limiters (one instance per tier) ────────────────────────────

type Tier = 'auth:ip' | 'auth:account' | 'public' | 'authed' | 'admin'
const _limiters = new Map<Tier, Ratelimit>()

function limiter(tier: Tier, requests: number, windowSeconds: number): Ratelimit | null {
  const redis = getRedis()
  if (!redis) return null

  if (!_limiters.has(tier)) {
    _limiters.set(tier, new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
      prefix:  `rl:${tier}`,
    }))
  }

  return _limiters.get(tier)!
}

// ── Public API ─────────────────────────────────────────────────────────────────

export type RLResult = { ok: true } | { ok: false; retryAfter: number }

async function check(tier: Tier, requests: number, windowSeconds: number, id: string): Promise<RLResult> {
  const l = limiter(tier, requests, windowSeconds)
  if (!l) return { ok: true }

  const { success, reset } = await l.limit(id)
  if (success) return { ok: true }

  return { ok: false, retryAfter: Math.max(1, Math.ceil((reset - Date.now()) / 1000)) }
}

/** Per-IP limit on auth-sensitive paths (login page, invite validate, auth/*). */
export function checkAuthIP(ip: string): Promise<RLResult> {
  return check('auth:ip', RL.auth.ipRequests, RL.auth.windowSeconds, ip)
}

/**
 * Per-account limit for auth actions.
 * identifier = invite code, email, or other account key.
 */
export function checkAuthAccount(identifier: string): Promise<RLResult> {
  return check('auth:account', RL.auth.accountRequests, RL.auth.windowSeconds, identifier)
}

/** Per-IP limit for unauthenticated public API calls. */
export function checkPublic(ip: string): Promise<RLResult> {
  return check('public', RL.public.requests, RL.public.windowSeconds, ip)
}

/** Per-user limit for authenticated candidate/employer API calls. */
export function checkAuthed(userId: string): Promise<RLResult> {
  return check('authed', RL.authed.requests, RL.authed.windowSeconds, userId)
}

/** Per-user limit for admin and sync API calls. */
export function checkAdmin(userId: string): Promise<RLResult> {
  return check('admin', RL.admin.requests, RL.admin.windowSeconds, userId)
}

// ── Exponential backoff (for auth brute-force tracking) ───────────────────────
// Tracks consecutive failures per IP. Retry-After grows as base * 2^(n-1),
// capped at backoffMax. Counter TTL = 4× backoffMax so stale entries expire.
// Returns 0 (no wait) if Redis is not configured or no prior failures.

export async function getBackoffSeconds(ip: string): Promise<number> {
  const redis = getRedis()
  if (!redis) return 0

  const failures = (await redis.get<number>(`backoff:${ip}`)) ?? 0
  if (failures === 0) return 0

  return Math.min(RL.auth.backoffBase * Math.pow(2, failures - 1), RL.auth.backoffMax)
}

export async function recordBackoffFailure(ip: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  const key = `backoff:${ip}`
  await redis.incr(key)
  await redis.expire(key, RL.auth.backoffMax * 4)
}

export async function clearBackoff(ip: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  await redis.del(`backoff:${ip}`)
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Extract the caller's IP from standard Vercel/proxy headers. */
export function getClientIP(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}

/** 429 JSON response with Retry-After header. */
export function rateLimitResponse(retryAfter: number): NextResponse {
  return new NextResponse(
    JSON.stringify({
      success: false,
      error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' },
    }),
    {
      status:  429,
      headers: {
        'Content-Type':      'application/json',
        'Retry-After':       String(retryAfter),
        'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + retryAfter),
      },
    },
  )
}
