# ScouttOpp — Deployment Guide
### Production Deployment on Vercel + Supabase v1.0

> **Status:** Not yet deployed. Follow this guide for first deployment after Phase 2.  
> Keep this document updated as infrastructure evolves.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Supabase Setup](#2-supabase-setup)
3. [Environment Variables](#3-environment-variables)
4. [Database Migrations](#4-database-migrations)
5. [Vercel Deployment](#5-vercel-deployment)
6. [Post-Deployment Checklist](#6-post-deployment-checklist)
7. [Preview Deployments](#7-preview-deployments)
8. [Rollback Procedure](#8-rollback-procedure)
9. [Monitoring](#9-monitoring)

---

## 1. Prerequisites

- Supabase account and project created
- Vercel account with project created (or GitHub integration)
- Custom domain configured in Vercel
- Supabase CLI installed: `npm install -g supabase`
- Node.js 20+ and npm installed locally
- Access to the GitHub repository

---

## 2. Supabase Setup

### Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Set:
   - **Name:** `scouttopp-prod`
   - **Region:** Choose closest to your primary user base
   - **Database password:** Generate a strong password, save in 1Password/team vault
4. Wait for provisioning (~2 minutes)

### Enable Auth Providers

Navigate to **Authentication → Providers**:

**Email provider:**
- Enable: ✅
- Confirm email: ✅ (required — auth state machine depends on this)
- Secure email change: ✅
- Min password length: 8

**Google provider (Phase 2):**
- Enable: ✅
- Client ID and Secret: from Google Cloud Console OAuth credentials
- Callback URL (copy from Supabase dashboard): `https://<project-ref>.supabase.co/auth/v1/callback`

### Configure Email Templates

In **Authentication → Email Templates**, customise:
- **Confirm signup:** Update subject and body to match ScouttOpp brand
- **Reset password:** Update subject, body, and redirect URL to `https://scouttopp.com/auth/reset-password`
- **Magic link:** Update if used

**Important:** Set Site URL in **Authentication → URL Configuration**:
- Site URL: `https://scouttopp.com`
- Redirect URLs (whitelist): `https://scouttopp.com/auth/confirm`, `https://scouttopp.com/auth/reset-password`

---

## 3. Environment Variables

### Required Variables

Create `.env.local` for local development. **Never commit this file.**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>     # Server-only, never expose to client

# Google Sheets Sync (Phase 3)
GOOGLE_SHEETS_API_KEY=<api-key>
GOOGLE_SHEETS_SPREADSHEET_ID=<sheet-id>

# Application
NEXT_PUBLIC_APP_URL=https://scouttopp.com        # Or http://localhost:3000 for dev
```

### Variable Security Rules

| Variable | Prefix | Where accessible |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `NEXT_PUBLIC_` | Client + Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_` | Client + Server |
| `SUPABASE_SERVICE_ROLE_KEY` | *(none)* | Server only (API routes, services) |
| `GOOGLE_SHEETS_API_KEY` | *(none)* | Server only |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | *(none)* | Server only |
| `NEXT_PUBLIC_APP_URL` | `NEXT_PUBLIC_` | Client + Server |

**`SUPABASE_SERVICE_ROLE_KEY` bypasses RLS.** It must ONLY be used in server-side code (API route handlers, services). It must NEVER be referenced in any Client Component or passed to the browser.

### Vercel Environment Variables

Set all the above in Vercel: **Project → Settings → Environment Variables**.  
Assign each to the correct environments (Production, Preview, Development).

---

## 4. Database Migrations

### Initial Setup

```bash
# Log in to Supabase CLI
supabase login

# Link local CLI to your Supabase project
supabase link --project-ref <project-ref>

# Run all pending migrations
supabase db push
```

### Running Migrations

Migrations live in `supabase/migrations/`. They are SQL files run in alphabetical (date) order.

```bash
# Create a new migration file
supabase migration new <description>

# Preview what would be applied
supabase db diff

# Apply to production
supabase db push

# Reset local dev DB to match production
supabase db reset
```

### Generating TypeScript Types

After any schema change, regenerate types:

```bash
supabase gen types typescript --project-id <project-ref> > lib/supabase/types.ts
```

Commit the updated `types.ts` with the migration. The CI/CD pipeline should fail if they're out of sync.

---

## 5. Vercel Deployment

### First Deployment

1. Connect GitHub repository to Vercel project
2. Framework preset: **Next.js** (auto-detected)
3. Build command: `npm run build` (default)
4. Output directory: `.next` (default)
5. Install command: `npm install` (default)
6. Node.js version: **20.x**
7. Add all environment variables (see Section 3)
8. Click **Deploy**

### `next.config.ts` for Production

Before deploying, add production configuration:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage (avatars, portfolio images)
      { protocol: 'https', hostname: '*.supabase.co' },
      // Google (OAuth avatars)
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  // Strict mode helps catch issues early
  reactStrictMode: true,
}

export default nextConfig
```

### Deployment Triggers

| Event | Environment | Behaviour |
|---|---|---|
| Push to `main` | Production | Auto-deploy |
| Push to any branch | Preview | Deploy to preview URL |
| Pull request | Preview | Deploy to PR-specific URL |

---

## 6. Post-Deployment Checklist

After first production deployment:

**Auth:**
- [ ] Sign up with a new email — confirm email is received and verification works
- [ ] Sign in with correct credentials — dashboard access works
- [ ] Sign in with incorrect credentials — error state shows correctly
- [ ] Forgot password flow — reset email arrives and link works
- [ ] Google OAuth — redirects correctly and creates profile

**Admin:**
- [ ] Create an admin account (directly in Supabase Auth + set `profiles.role = 'admin'`)
- [ ] Admin can log in and access `/dashboard/admin`
- [ ] Sync can be triggered and completes

**Security:**
- [ ] Service role key is NOT in `NEXT_PUBLIC_` vars
- [ ] Supabase RLS is enabled on all tables
- [ ] `/api/*` routes that require admin return 403 for non-admin users
- [ ] `/dashboard/*` routes redirect unauthenticated users to `/auth/login`

**Performance:**
- [ ] Lighthouse score on auth pages: Accessibility ≥ 95
- [ ] Core Web Vitals in green on Vercel

---

## 7. Preview Deployments

Vercel creates a preview URL for every branch and PR. These share nothing with production by default.

**Preview environment variables:** Configure a separate Supabase project (`scouttopp-staging`) for preview environments. This prevents preview deployments from touching production data.

Add preview-specific env vars in Vercel under **Environment Variables → Preview** environment:
```
NEXT_PUBLIC_SUPABASE_URL      = https://<staging-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = <staging-anon-key>
SUPABASE_SERVICE_ROLE_KEY     = <staging-service-role-key>
```

---

## 8. Rollback Procedure

### Application Rollback

In Vercel dashboard: **Deployments** → select a previous deployment → **Promote to Production**.  
This is instant (no rebuild) — CDN switches to previous build artifact.

### Database Rollback

Migrations are not automatically reversible. For rollback:
1. Write a compensating migration (undo the schema change)
2. Test it in staging
3. Apply via `supabase db push`

For serious data loss issues: restore from Supabase automated backup (available in Supabase dashboard under **Database → Backups**). Supabase Pro plan includes daily backups; point-in-time recovery is available on higher plans.

---

## 9. Monitoring

### Vercel

- **Analytics:** Enable Vercel Analytics for Web Vitals monitoring
- **Logs:** Real-time function logs in Vercel dashboard → **Logs** tab
- **Errors:** Consider adding Sentry (future): `npm install @sentry/nextjs`

### Supabase

- **Database:** Supabase dashboard → **Database → Reports** — query performance, slow queries
- **Auth:** Supabase dashboard → **Authentication → Logs** — sign in/up events, errors
- **API:** Supabase dashboard → **API → Logs** — REST/RPC call logs

### Uptime

Consider adding an uptime monitor (e.g., Better Uptime, UptimeRobot) to ping `https://scouttopp.com` and `https://scouttopp.com/api/health` (future health endpoint).
