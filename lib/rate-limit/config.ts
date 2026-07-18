/**
 * Rate-limit thresholds — all configurable via environment variables.
 *
 * Auth tier  (per-IP)      RATE_LIMIT_AUTH_IP_REQUESTS        / RATE_LIMIT_AUTH_WINDOW_SECONDS
 * Auth tier  (per-account) RATE_LIMIT_AUTH_ACCOUNT_REQUESTS   / RATE_LIMIT_AUTH_WINDOW_SECONDS
 * Backoff                  RATE_LIMIT_AUTH_BACKOFF_BASE        / RATE_LIMIT_AUTH_BACKOFF_MAX
 * Public tier              RATE_LIMIT_PUBLIC_REQUESTS          / RATE_LIMIT_PUBLIC_WINDOW_SECONDS
 * Authed tier              RATE_LIMIT_AUTHED_REQUESTS          / RATE_LIMIT_AUTHED_WINDOW_SECONDS
 * Admin tier               RATE_LIMIT_ADMIN_REQUESTS           / RATE_LIMIT_ADMIN_WINDOW_SECONDS
 */

function env(key: string, fallback: number): number {
  const val = process.env[key]
  if (!val) return fallback
  const n = parseInt(val, 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export const RL = {
  auth: {
    ipRequests:      env('RATE_LIMIT_AUTH_IP_REQUESTS',      10),
    accountRequests: env('RATE_LIMIT_AUTH_ACCOUNT_REQUESTS', 5),
    windowSeconds:   env('RATE_LIMIT_AUTH_WINDOW_SECONDS',   900), // 15 min default
    backoffBase:     env('RATE_LIMIT_AUTH_BACKOFF_BASE',     2),   // seconds
    backoffMax:      env('RATE_LIMIT_AUTH_BACKOFF_MAX',      300), // 5 min cap
  },
  public: {
    requests:      env('RATE_LIMIT_PUBLIC_REQUESTS',      60),
    windowSeconds: env('RATE_LIMIT_PUBLIC_WINDOW_SECONDS', 60),
  },
  authed: {
    requests:      env('RATE_LIMIT_AUTHED_REQUESTS',      300),
    windowSeconds: env('RATE_LIMIT_AUTHED_WINDOW_SECONDS', 60),
  },
  admin: {
    requests:      env('RATE_LIMIT_ADMIN_REQUESTS',      600),
    windowSeconds: env('RATE_LIMIT_ADMIN_WINDOW_SECONDS', 60),
  },
} as const
