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

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

This runs both migrations in order:
- `20260630000000_initial_schema.sql` — tables, enums, triggers, indexes
- `20260630000001_rls_policies.sql` — RLS deny-by-default policies

### Configure Auth

In Supabase Dashboard → Authentication → URL Configuration:

| Setting | Value |
|---|---|
| Site URL | `https://your-domain.com` |
| Redirect URLs | `https://your-domain.com/api/auth/callback` |

In Authentication → Providers:
- **Email:** Enabled (with "Confirm email" on)
- **Google:** Add OAuth credentials (Client ID + Secret from Google Cloud Console)

### Storage Buckets

Create two buckets in Storage:

| Bucket | Access | Purpose |
|---|---|---|
| `avatars` | Private (signed URLs only) | Candidate avatar images |
| `portfolio` | Private (signed URLs only) | Portfolio media files |

Set bucket policies to match `docs/SECURITY.md` — do NOT make buckets public.

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
