# ScouttOpp — Security Model
### Threat Model, Controls, and Vulnerability Handling v1.0

> **Status:** Applies from Phase 2 onward (when Supabase is live).  
> Review and update this document whenever the auth model, data model, or infrastructure changes.

---

## Table of Contents

1. [Security Model Overview](#1-security-model-overview)
2. [Authentication Security](#2-authentication-security)
3. [Authorization — Row-Level Security](#3-authorization--row-level-security)
4. [Secrets and Credentials](#4-secrets-and-credentials)
5. [Input Validation](#5-input-validation)
6. [Injection Prevention](#6-injection-prevention)
7. [Cross-Site Scripting (XSS)](#7-cross-site-scripting-xss)
8. [Cross-Site Request Forgery (CSRF)](#8-cross-site-request-forgery-csrf)
9. [API Security](#9-api-security)
10. [Data Privacy](#10-data-privacy)
11. [Dependency Security](#11-dependency-security)
12. [Vulnerability Handling](#12-vulnerability-handling)
13. [Security Checklist](#13-security-checklist)

---

## 1. Security Model Overview

ScouttOpp is a multi-tenant creative talent marketplace with three distinct user roles. The security model is enforced at two levels:

| Level | Mechanism | Protects against |
|---|---|---|
| **Application** | Middleware route guards, Zod validation | Unauthorized page access, malformed input |
| **Database** | Supabase RLS policies | Data leakage, cross-user data access, direct API abuse |

**The database is the last line of defense.** Even if a route guard fails or an API route has a logic error, RLS ensures a user can never read or write data they don't own.

### Trust Levels

| Actor | Trust level | What they can do |
|---|---|---|
| Unauthenticated | None | Access public auth pages only |
| `UNVERIFIED` user | Very low | View `/auth/verify-email` only |
| `VERIFIED_NO_ROLE` user | Low | Select role |
| `PENDING_APPROVAL` user | Low | View pending screen only |
| `APPROVED` candidate | Standard | Own profile + dashboard |
| `APPROVED` employer | Standard | Own profile + discoverable candidates |
| `REJECTED` / `SUSPENDED` user | Read-only | View their status screen only |
| Admin | Elevated | All data, all transitions, sync operations |
| Server (Service Role) | Full | All data, bypass RLS (restricted to server-side code only) |

---

## 2. Authentication Security

### Session Tokens

- Supabase issues JWTs signed with HS256 (secret managed by Supabase)
- Access tokens expire in **1 hour**
- Refresh tokens are rotated on each use (Supabase default)
- Sessions stored in **httpOnly, Secure, SameSite=Lax** cookies — not localStorage
- `httpOnly` cookies cannot be read by JavaScript, mitigating XSS token theft

### Password Security

- Minimum length: 8 characters (enforced in Zod + Supabase Auth)
- Supabase hashes passwords with bcrypt before storage
- Password strength UI guides users to stronger passwords (design nudge, not enforcement)
- Password reset links expire after **1 hour** (Supabase default, configurable)

### Email Verification

- All email-based signups require email confirmation before any access beyond `UNVERIFIED` state
- Email verification tokens are single-use (Supabase enforces this)
- Resend rate-limited at the infrastructure level by Supabase (3 resends per hour)

### Google OAuth

- OAuth state parameter is managed by Supabase (CSRF protection built in)
- After OAuth callback, we verify the user exists in `profiles` before granting access
- Google account email is trusted as verified (Google verifies it before issuing tokens)

### Brute Force Protection

- Supabase Auth enforces rate limits on sign-in attempts per IP
- Captcha can be enabled in Supabase Auth settings for additional protection (consider for Phase 2)
- Application-layer: login form has a 2-second artificial delay on credential errors (UX + mild rate limiting)

---

## 3. Authorization — Row-Level Security

All Supabase tables have RLS **enabled** with a **deny-by-default** posture. No data is accessible without an explicit policy.

### Policy Principles

1. **Users only access their own data** via `auth.uid() = user_id` checks
2. **Admins access all data** via a sub-select on `profiles.role = 'admin'`
3. **Employers access discoverable candidates** only via the `is_discoverable` + `discovery_paused` filter
4. **Staging/sync tables are admin-only** — candidates and employers never touch these tables
5. **The `invite_codes` table** allows public reads (code validation at signup) but admin-only writes

### Service Role Key Policy

The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS entirely. Rules:
- **Never** reference it in any `NEXT_PUBLIC_` variable
- **Never** import it in any file that gets bundled for the browser
- **Only** use it in `services/*.ts` files called from API route handlers
- Audit: search for `SERVICE_ROLE_KEY` in browser bundle should return 0 results

Full RLS policy definitions: see [DATABASE.md](DATABASE.md#6-row-level-security-policies).

---

## 4. Secrets and Credentials

### What is a Secret

Any value that, if exposed, would allow unauthorized access or data exfiltration:
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_SHEETS_API_KEY`
- Database password
- Future: Stripe secret key, SendGrid API key

### Secret Management Rules

| Rule | Detail |
|---|---|
| Never in source code | All secrets via environment variables |
| Never in `.env` committed to git | `.env.local` is in `.gitignore` |
| Never in `NEXT_PUBLIC_` vars | Would be bundled and sent to the browser |
| Never in logs | `console.log(process.env.SUPABASE_SERVICE_ROLE_KEY)` is forbidden |
| Rotate if leaked | Immediately regenerate in Supabase/Google Cloud dashboards |

### `.gitignore` Verification

Ensure these are in `.gitignore`:
```
.env
.env.local
.env.*.local
```

---

## 5. Input Validation

**All user input is validated with Zod before any business logic runs.**

### Validation Layers

| Layer | Mechanism | Validates |
|---|---|---|
| Client (UX) | react-hook-form + Zod | Immediate feedback; not security-critical |
| API route | Zod schema parse | **Security-critical.** First thing that runs in every handler. |
| Database | NOT NULL, CHECK constraints, foreign keys | Last resort; schema-level enforcement |

### API Route Validation Pattern

```ts
// Every API route handler:
const body = await request.json()
const parsed = RequestSchema.safeParse(body)
if (!parsed.success) {
  return Response.json(
    { success: false, error: { code: 'VALIDATION_ERROR', ...formatZodError(parsed.error) } },
    { status: 400 }
  )
}
// Use parsed.data, never the raw body
```

Never use `body.field` directly — always use `parsed.data.field`.

---

## 6. Injection Prevention

### SQL Injection

Not applicable. We never write raw SQL strings in the application layer. Supabase client uses parameterized queries exclusively.

```ts
// Safe — parameterized
const { data } = await supabase
  .from('candidate_profiles')
  .select('*')
  .eq('user_id', userId)

// Forbidden — never do this
const { data } = await supabase.rpc('raw_query', { sql: `WHERE id = '${userId}'` })
```

### Path Traversal

Next.js handles route parameterization. When using `[id]` from route params in Supabase queries, always validate the format first:

```ts
const { id } = await params
const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
if (!isValidUUID) return Response.json({ error: ... }, { status: 400 })
```

### Command Injection

No shell commands are executed in the application. The Google Sheets sync uses the Sheets API client, not shell commands.

---

## 7. Cross-Site Scripting (XSS)

React's JSX auto-escapes all string values rendered via `{variable}`. This prevents the vast majority of XSS attacks.

**Specific risks:**

| Risk | Mitigation |
|---|---|
| `dangerouslySetInnerHTML` | Forbidden. Never use it. |
| User-generated rich text | Not implemented yet — if added, use a sanitization library (DOMPurify) |
| Open redirect via `?redirect=` | Validate redirect target: must start with `/`, no `//`, no `http://` |
| Stored URLs (portfolio, website) | Validate scheme (`https://` only) via Zod; render as `<a href>` with `rel="noopener noreferrer"` |

### Open Redirect Fix

```ts
// Safe redirect validation
function isSafeRedirect(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//')
}
const redirectTo = searchParams.get('redirect')
const destination = redirectTo && isSafeRedirect(redirectTo)
  ? redirectTo
  : getCanonicalRoute(profile)
```

---

## 8. Cross-Site Request Forgery (CSRF)

### Why We're Protected

- Auth uses cookies with `SameSite=Lax` (Supabase default)
- `SameSite=Lax` blocks cross-origin POST requests from external sites
- API routes validate `Content-Type: application/json` — HTML form submissions send `application/x-www-form-urlencoded`
- State-changing operations require an authenticated session (cookie)

No additional CSRF token is needed given the above protections. If `SameSite=None` is ever required (cross-origin iframe embedding), CSRF tokens must be added.

---

## 9. API Security

### Authentication Check (Every Protected Route)

```ts
// Pattern: every protected API route starts with this
const supabase = createServerClient(...)
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  return Response.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 })
}

// Role check for admin routes
const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
if (profile?.role !== 'admin') {
  return Response.json({ success: false, error: { code: 'FORBIDDEN' } }, { status: 403 })
}
```

### Rate Limiting

| Endpoint | Limit | Enforcement |
|---|---|---|
| `/api/sync/run` | 5/minute per admin | Application layer (check `sync_runs` recency) |
| `/api/invite/validate` | 20/minute per IP | Future: Vercel Edge middleware |
| Auth endpoints | Supabase-managed | Infrastructure |

### Error Information Leakage

In API error responses, never reveal:
- Database structure (table names, column names)
- Internal error stack traces
- Whether a user exists (for auth endpoints — use generic "Invalid credentials")
- Admin-only data in non-admin responses

Production builds: set `NODE_ENV=production` which suppresses Next.js detailed error pages.

---

## 10. Data Privacy

### PII Inventory

| Table | PII Columns |
|---|---|
| `profiles` | `email` |
| `candidate_profiles` | `full_name`, `email`, `phone`, `location_city`, `avatar_url`, `bio` |
| `candidate_sync_staging` | `raw_data` (contains all Sheets fields including PII) |
| `employer_profiles` | `company_name` (not personal PII) |

### Access to PII

- Candidates access their own PII (RLS)
- Employers see candidate `full_name`, `primary_role`, `location_city`, `bio`, `portfolio_url` when discoverable — **not** email or phone
- Email and phone are shared only after a match is accepted (Phase 6 feature)
- Admins see all PII (required for review workflow)

### Data Retention

Staging rows (`candidate_sync_staging`) are never deleted — they are the audit trail.  
If a candidate requests data deletion: delete their `candidate_profiles` row (cascades to specialties, portfolio, preferences). Their staging row remains (anonymized if required by request).

### GDPR Considerations (Future)

Before launching in the EU:
- [ ] Privacy policy published at `/privacy`
- [ ] Cookie consent banner (if using analytics cookies)
- [ ] "Delete my data" endpoint implemented
- [ ] Data processing agreements with Supabase and Google

---

## 11. Dependency Security

### Policy

- Run `npm audit` before every production deployment
- Fix `critical` and `high` severity vulnerabilities before deploying
- `moderate` severity: address within 2 weeks
- `low` severity: address in next regular update cycle

### Dependency Review

When adding a new dependency:
1. Check npm download count (< 100K/week warrants extra scrutiny)
2. Check last publish date (not maintained in 2+ years = risk)
3. Check open issues for known vulnerabilities
4. Prefer packages with a clear maintainer or corporate backing

### Automated Scanning

Consider enabling Dependabot on the GitHub repository for automated PR-based vulnerability fixes.

---

## 12. Vulnerability Handling

### Responsible Disclosure

Security vulnerabilities should be reported to: `security@scouttopp.com` (set up before launch).  
Do not open public GitHub issues for security vulnerabilities.

### Response SLAs

| Severity | Initial response | Resolution |
|---|---|---|
| Critical (auth bypass, data breach) | 4 hours | 24 hours |
| High (privilege escalation) | 24 hours | 72 hours |
| Medium | 72 hours | 2 weeks |
| Low | 1 week | Next release |

### When a Breach Occurs

1. Rotate all secrets immediately (Supabase service role key, API keys)
2. Revoke all active sessions (`supabase.auth.admin.signOut()` for affected users)
3. Identify the scope — which tables, which users
4. Notify affected users within 72 hours (GDPR requirement)
5. Document the incident in a post-mortem

---

## 13. Security Checklist

Verify before each production release:

**Authentication:**
- [ ] Email verification required for all non-OAuth signups
- [ ] Password minimum 8 characters enforced server-side
- [ ] Session cookies are httpOnly and Secure
- [ ] `?redirect=` parameter validated before use

**Authorization:**
- [ ] RLS enabled on ALL Supabase tables
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is not in any `NEXT_PUBLIC_` variable
- [ ] Admin routes return 403 for non-admin authenticated users
- [ ] Dashboard routes return 401/redirect for unauthenticated users

**Input:**
- [ ] All API route handlers validate request body with Zod before use
- [ ] Route param UUIDs are validated with regex before use in queries
- [ ] URL fields (portfolio, website) validated for `https://` scheme

**Data:**
- [ ] Employer API responses do not include candidate email/phone
- [ ] API error messages do not leak database structure
- [ ] No `dangerouslySetInnerHTML` usage anywhere

**Dependencies:**
- [ ] `npm audit` returns no critical or high vulnerabilities
