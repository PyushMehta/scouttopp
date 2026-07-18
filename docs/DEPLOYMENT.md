# ScouttOpp — Deployment Guide
### Production Deployment on Vercel + Supabase

> **Status:** Candidate Beta — v0.7.0. Employer features are disabled in production (`NEXT_PUBLIC_EMPLOYER_ENABLED` defaults to `false`). All public CTAs target creative professionals. Follow this guide for production deployment.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Supabase Setup](#2-supabase-setup)
3. [Google Cloud Setup](#3-google-cloud-setup)
4. [Vercel Deployment](#4-vercel-deployment)
5. [Environment Variables Reference](#5-environment-variables-reference)
6. [Post-Deployment Checklist](#6-post-deployment-checklist)
7. [Database Migrations](#7-database-migrations)
8. [Rollback Procedure](#8-rollback-procedure)

---

## 1. Prerequisites

- [Supabase account](https://supabase.com) — Pro plan recommended for production (daily backups, connection pooler)
- [Vercel account](https://vercel.com) — Hobby tier is sufficient for MVP
- [Google Cloud project](https://console.cloud.google.com) with Google Sheets API enabled
- Supabase CLI installed: `npm install -g supabase`
- GitHub repo connected to Vercel

---

## 2. Supabase Setup

### Create Project

1. Create a new Supabase project
2. Note your **Project URL** and **anon key** (Settings → API)
3. Note your **Service Role key** (Settings → API → Secret keys) — treat as a password

### Run Migrations

Run each file **in order** via **Supabase Dashboard → SQL Editor → New query**. Paste and run one at a time, clicking "Run and enable RLS" when prompted.

| Order | File | What it does |
|---|---|---|
| 1 | `20260630000000_initial_schema.sql` | Tables, enums, triggers, indexes |
| 2 | `20260630000001_rls_policies.sql` | RLS deny-by-default policies |
| 3 | `20260630000002_employer_profile_fields.sql` | `linkedin_url`, `founded_year` on employer_profiles |
| 4 | `20260701000000_phase6_schema.sql` | Discovery tables (saved, passed, views, notes) |
| 5 | `20260701000001_phase6_rls.sql` | RLS policies for Phase 6 tables |
| 6 | `20260701000002_phase6_5_arch.sql` | Multi-role, portfolio links, pass expiry, completeness score |

> **Note:** Migration 6 contains `ALTER TYPE ADD VALUE` — if your runner wraps in a transaction, run it outside one.

### Configure Auth

In Supabase Dashboard → Authentication → URL Configuration:

| Setting | Value |
|---|---|
| Site URL | `https://your-domain.com` |
| Redirect URLs | `https://your-domain.com/**` |

In Authentication → Providers:
- **Email:** Enabled (with "Confirm email" on)
- **Google:** Add OAuth credentials (Client ID + Secret from Google Cloud Console). The callback URL to register in Google Cloud is: `https://<project-ref>.supabase.co/auth/v1/callback`

> **Note:** Google OAuth credentials are currently hosted in the personal Google Cloud project (`pyush063@gmail.com`). Migrate to the company Google Cloud org when Workspace admin access is available.

### Storage Buckets

Create three buckets in Storage:

| Bucket | Access | File size limit | MIME types | Purpose |
|---|---|---|---|---|
| `marketing` | **Public** | 200 MB | `video/mp4, image/jpeg, image/png` | Hero video and marketing assets |
| `avatars` | Private (signed URLs only) | 5 MB | `image/jpeg, image/png, image/webp` | Candidate avatar images |
| `portfolio` | Private (signed URLs only) | 50 MB | `image/jpeg, image/png, image/webp, video/mp4` | Portfolio media files |

Always use `createSignedUrl()` for `avatars` and `portfolio` — never `getPublicUrl()`.

---

## 3. Google Cloud Setup

### Enable Google Sheets API

1. Go to Google Cloud Console → APIs & Services → Library
2. Search "Google Sheets API" → Enable

### Create Service Account

1. APIs & Services → Credentials → Create Credentials → Service account
2. Name: `sheets-sync`
3. No roles needed on project level
4. Download JSON key file

### Share Spreadsheet

Share your Google Sheets spreadsheet with the service account email:  
`sheets-sync@<your-project>.iam.gserviceaccount.com`  
Role: **Viewer** (read-only)

### Extract Key Values

From the downloaded JSON:

```json
{
  "client_email": "sheets-sync@<project>.iam.gserviceaccount.com",
  "private_key": "-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
}
```

These become `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`.

> **Note:** The implementation uses RS256 JWT directly (no `googleapis` package). The private key must be the full PEM string including headers and `\n` characters.

---

## 4. Vercel Deployment

### Connect Repository

1. Vercel Dashboard → Add New → Project → Import from GitHub
2. Select your `scouttopp` repo
3. Framework: Next.js (auto-detected)
4. Build command: `npm run build`
5. Output directory: `.next`

### Set Environment Variables

In Vercel → Settings → Environment Variables, add each variable from Section 5 below.

Set each to: **Production**, **Preview**, and **Development** environments (or production-only for secrets).

### Deploy

```bash
git push origin main
# Vercel auto-deploys on push to main
```

Or trigger manually in Vercel Dashboard → Deployments → Redeploy.

---

## 5. Environment Variables Reference

```bash
# ─── Supabase ───────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Server-only — NEVER prefix with NEXT_PUBLIC_
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ─── App ────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://your-domain.com

# ─── Feature flags ──────────────────────────────────
# Candidate Beta: leave unset or set to "false".
# Set to "true" to re-enable employer dashboard, discovery APIs, and employer sign-up.
NEXT_PUBLIC_EMPLOYER_ENABLED=false

# ─── Candidate onboarding form ──────────────────────
NEXT_PUBLIC_CANDIDATE_FORM_URL=https://forms.google.com/...

# ─── Google Sheets Sync (Phase 3+) ──────────────────
GOOGLE_SERVICE_ACCOUNT_EMAIL=sheets-sync@<project>.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
GOOGLE_SHEETS_RANGE=Sheet1

# ─── Rate limiting (Upstash Redis) ──────────────────
# Required for production rate limiting. Without these, rate limiting is
# disabled (a warning is logged). Get credentials at https://upstash.com
# (free tier: 10,000 commands/day, no credit card required).
UPSTASH_REDIS_REST_URL=https://<your-db>.upstash.io
UPSTASH_REDIS_REST_TOKEN=AX...

# All thresholds below are optional — shown values are production defaults.
# Auth tier (invite/validate, /api/auth/*): per-IP sliding window
RATE_LIMIT_AUTH_IP_REQUESTS=10       # max requests per window from one IP
RATE_LIMIT_AUTH_WINDOW_SECONDS=900   # 15-minute window
# Auth tier: per-code/account sliding window (inside route handler)
RATE_LIMIT_AUTH_ACCOUNT_REQUESTS=5   # max tries per invite code per window
# Exponential backoff on invalid invite codes
RATE_LIMIT_AUTH_BACKOFF_BASE=2       # seconds before first retry after failure
RATE_LIMIT_AUTH_BACKOFF_MAX=300      # maximum backoff cap (5 min)
# Public API tier (unauthenticated callers)
RATE_LIMIT_PUBLIC_REQUESTS=60        # requests per window
RATE_LIMIT_PUBLIC_WINDOW_SECONDS=60  # 1-minute window
# Authenticated user tier (candidate/employer/discovery routes)
RATE_LIMIT_AUTHED_REQUESTS=300       # requests per window per user
RATE_LIMIT_AUTHED_WINDOW_SECONDS=60  # 1-minute window
# Admin tier (admin/* and sync/* routes)
RATE_LIMIT_ADMIN_REQUESTS=600        # requests per window per admin user
RATE_LIMIT_ADMIN_WINDOW_SECONDS=60   # 1-minute window
```

### Variable Security Rules

| Prefix | Exposed to browser | Use for |
|---|---|---|
| `NEXT_PUBLIC_` | Yes | Supabase URL + anon key (safe to expose) |
| _(no prefix)_ | No | Service role key, Google credentials |

**`SUPABASE_SERVICE_ROLE_KEY` must never be in a `NEXT_PUBLIC_` variable.** It bypasses RLS and grants full database access.

---

## 6. Post-Deployment Checklist

### Functional Tests

- [ ] Visit `https://your-domain.com` — redirects to `/auth/login`
- [ ] Sign up with email — receive verification email
- [ ] Click verify link — lands on `/auth/role-select`
- [ ] Sign in with Google OAuth
- [ ] Admin: log in to `/dashboard/admin`, trigger sync
- [ ] Candidate: accept invite email, log into `/dashboard/candidate`
- [ ] Avatar upload works (check for signed URL in response)
- [ ] Portfolio upload works (image and PDF)
- [ ] Account deletion removes all rows

### Configuration

- [ ] Supabase Redirect URL includes production domain
- [ ] Storage buckets are private (not public)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is not in any `NEXT_PUBLIC_` variable
- [ ] Google Sheets API enabled in Google Cloud project
- [ ] Service account has access to spreadsheet

---

## 7. Database Migrations

### Adding a New Migration

```bash
supabase migration new <migration-name>
# Edit supabase/migrations/<timestamp>_<migration-name>.sql
supabase db push
```

### Reverting a Migration

Supabase does not support automatic rollback. To revert:
1. Write a new `_rollback.sql` migration that undoes the changes
2. Push the rollback migration

### Checking Migration Status

```bash
supabase db diff          # Show diff between local and remote
supabase migration list   # List applied migrations
```

---

## 8. Rollback Procedure

### Code Rollback

```bash
# In Vercel Dashboard: Deployments → select previous → Promote to Production
# OR
git revert HEAD
git push origin main
```

### Database Rollback

For schema changes, write a compensation migration:

```sql
-- supabase/migrations/<timestamp>_rollback_<name>.sql
-- Example: re-add a dropped column
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS legacy_field text;
```

Push via `supabase db push`.

### Emergency: Restore from Backup

Supabase Pro includes daily backups. Restore via:
Supabase Dashboard → Settings → Backups → Select backup → Restore
