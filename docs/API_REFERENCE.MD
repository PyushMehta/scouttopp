# ScouttOpp — API Reference
### All Endpoints v1.0

> **Status:** Phases 2–6.6 endpoints ✅ implemented. Phase 6.6 introduced no new API routes — `ScoutMode` calls the same discovery endpoints as the Phase 6 `DiscoveryFeed`. Phase 7+ endpoints are listed in `docs/FUTURE_ROADMAP.md` — do not implement until their phase begins.

---

## Table of Contents

1. [Auth Guards](#1-auth-guards)
2. [Auth Endpoints](#2-auth-endpoints)
3. [Admin Endpoints](#3-admin-endpoints)
4. [Sync Endpoints](#4-sync-endpoints)
5. [Candidate Endpoints](#5-candidate-endpoints)
6. [Employer Endpoints](#6-employer-endpoints)
7. [Discovery Endpoints](#7-discovery-endpoints)
8. [Response Format](#8-response-format)
9. [Error Codes](#9-error-codes)

---

## 1. Auth Guards

### `requireCandidate()`

File: `lib/auth/require-candidate.ts`

```typescript
type OkResult   = { ok: true;  userId: string; candidateProfileId: string }
type FailResult = { ok: false; response: NextResponse }
export async function requireCandidate(): Promise<OkResult | FailResult>
```

Checks (in order):
1. JWT is valid — `createClient().auth.getUser()` → 401 if missing/expired
2. `profiles.role = 'candidate'` — 403 if wrong role
3. `profiles.auth_state = 'APPROVED'` — 403 if not approved
4. `candidate_profiles` row exists — 404 if missing

Usage in API routes:
```typescript
const auth = await requireCandidate()
if (!auth.ok) return auth.response
const { userId, candidateProfileId } = auth
```

### `requireAdmin()`

File: `lib/auth/require-admin.ts`

Checks: valid JWT + `profiles.role = 'admin'`.  
Returns `{ ok: true, userId }` or `{ ok: false, response: NextResponse }`.

### `requireEmployer()`

File: `lib/auth/require-employer.ts`

```typescript
type OkResult   = { ok: true;  userId: string; employerProfileId: string }
type FailResult = { ok: false; response: NextResponse }
export async function requireEmployer(): Promise<OkResult | FailResult>
```

Checks (in order):
1. JWT is valid — 401 if missing/expired
2. `profiles.role = 'employer'` — 403 if wrong role
3. `profiles.auth_state = 'APPROVED'` — 403 if not approved
4. `employer_profiles` row exists — 404 if missing

Usage in API routes:
```typescript
const auth = await requireEmployer()
if (!auth.ok) return auth.response
const { userId, employerProfileId } = auth
```

---

## 2. Auth Endpoints

### `GET /api/auth/callback`

**Auth:** None (public)  
**Purpose:** PKCE code exchange after email verification, OAuth sign-in, and invite acceptance.

Handles three flows by inspecting the auth result:
- **New user / email verify:** redirects to `STATE_ROUTES[auth_state]` via machine
- **Invite acceptance:** sets `auth_state = APPROVED`, links `candidate_profiles.user_id`, redirects to `/dashboard/candidate`
- **Password reset:** redirects to `/auth/reset-password`

**Query params:**

| Param | Required | Description |
|---|---|---|
| `code` | Yes (OAuth / PKCE) | Auth code from Supabase |
| `token_hash` | Yes (email confirm) | Token from magic link |
| `next` | No | Override redirect target |

**Errors:**

| Status | Code | When |
|---|---|---|
| 302 | — | Always redirects (success or error) |
| 302 → `/auth/login?error=...` | — | Invalid or expired code |

---

### `POST /api/auth/role`

**Auth:** Authenticated (any state)  
**Purpose:** Sets user role (`candidate` or `employer`) and transitions `VERIFIED_NO_ROLE → PENDING_APPROVAL`.

**Request body:**

```json
{ "role": "candidate" }
```

| Field | Type | Validation |
|---|---|---|
| `role` | `"candidate" \| "employer"` | Required |

**Response `200`:**

```json
{ "authState": "PENDING_APPROVAL" }
```

**Errors:**

| Status | Code | When |
|---|---|---|
| 400 | `INVALID_ROLE` | `role` not `candidate` or `employer` |
| 400 | `INVALID_TRANSITION` | Not in `VERIFIED_NO_ROLE` state |
| 401 | `UNAUTHORIZED` | Not authenticated |

---

### `GET /api/invite/validate`

**Auth:** None (public)  
**Purpose:** Validates an invite code before the signup form submits.

**Query params:**

| Param | Required | Description |
|---|---|---|
| `code` | Yes | The invite code (case-insensitive) |

**Response `200`:**

```json
{ "valid": true, "email": "candidate@example.com" }
```

**Errors:**

| Status | Code | When |
|---|---|---|
| 400 | `MISSING_CODE` | No `code` param |
| 404 | `NOT_FOUND` | Code doesn't exist |
| 410 | `EXPIRED` | Code past expiry date |
| 410 | `EXHAUSTED` | Code used maximum times |

---

## 3. Admin Endpoints

> All admin endpoints require `requireAdmin()`. Non-admin callers receive `401` or `403`.

### `GET /api/admin/candidates`

**Purpose:** List candidates in staging or canonical tables. Supports filter/search/paginate.

**Query params:**

| Param | Default | Options |
|---|---|---|
| `source` | `staging` | `staging`, `profiles` |
| `status` | — | `PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `SUSPENDED` |
| `search` | — | Full-text search on name / email |
| `page` | `1` | Integer ≥ 1 |
| `limit` | `20` | Integer 1–100 |

**Response `200`:**

```json
{
  "candidates": [...],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

---

### `GET /api/admin/candidates/[id]`

**Purpose:** Full candidate detail — staging row or canonical profile + related data.

**Response `200`:**

```json
{
  "candidate": { ...fullRow },
  "specialties": [...],
  "portfolioItems": [...],
  "preferences": {...}
}
```

**Errors:** `404 NOT_FOUND`

---

### `POST /api/admin/candidates/[id]/approve`

**Purpose:** Promote staging candidate → `candidate_profiles` + send Supabase invite email.

Steps (inside `admin.service.ts`):
1. Read staging row
2. INSERT into `candidate_profiles` (`user_id = null`, `auth_state = INVITED`)
3. `supabase.auth.admin.inviteUserByEmail({ email, data: { role: 'candidate' } })`
4. Update staging row `status = 'approved'`

**Request body:** None

**Response `200`:**

```json
{ "profileId": "<uuid>", "inviteSent": true }
```

**Errors:** `404 NOT_FOUND`, `409 ALREADY_APPROVED`

---

### `POST /api/admin/candidates/[id]/reject`

**Request body:**

```json
{ "reason": "Portfolio does not meet quality bar." }
```

**Response `200`:** `{ "ok": true }`

---

### `POST /api/admin/users/[id]/suspend`

**Request body:** None

**Response `200`:** `{ "ok": true }`

Sets `profiles.auth_state = 'SUSPENDED'`. User is immediately locked out via `proxy.ts`.

---

### `POST /api/admin/users/[id]/reinstate`

**Request body:** None

**Response `200`:** `{ "ok": true }`

Sets `profiles.auth_state = 'APPROVED'`.

---

## 4. Sync Endpoints

> All sync endpoints require `requireAdmin()`.

### `POST /api/sync/run`

**Purpose:** Triggers a Google Sheets sync. Reads the configured spreadsheet range and writes rows to `candidate_sync_staging`.

**Request body:** None

**Response `200`:**

```json
{ "runId": "<uuid>", "rowsProcessed": 14, "newRows": 3, "updatedRows": 11 }
```

**Errors:**

| Status | Code | When |
|---|---|---|
| 500 | `SHEETS_ERROR` | Google Sheets API failed |
| 429 | `RATE_LIMITED` | (Phase 11) Too many sync requests |

---

### `GET /api/sync/status/[runId]`

**Purpose:** Poll the status of a specific sync run.

**Response `200`:**

```json
{
  "runId": "<uuid>",
  "status": "complete",
  "rowsProcessed": 14,
  "errors": [],
  "completedAt": "2026-07-01T12:00:00Z"
}
```

`status` values: `"pending"`, `"running"`, `"complete"`, `"failed"`

---

## 5. Candidate Endpoints

> All candidate endpoints require `requireCandidate()`. Callers that are not approved candidates receive `401`/`403`.

### `GET /api/candidate/profile`

**Purpose:** Fetch the authenticated candidate's full profile.

**Response `200`:** Full `candidate_profiles` row:

```json
{
  "id": "<uuid>",
  "userId": "<uuid>",
  "fullName": "Maya Rodriguez",
  "bio": "...",
  "primaryRole": "art_director",
  "yearsExperience": 5,
  "locationCity": "London",
  "locationCountry": "GB",
  "timezone": "Europe/London",
  "phone": null,
  "portfolioUrl": null,
  "linkedinUrl": null,
  "instagramUrl": null,
  "websiteUrl": null,
  "resumeUrl": null,
  "avatarUrl": null,
  "isDiscoverable": false,
  "discoveryPaused": false,
  "createdAt": "2026-07-01T00:00:00Z",
  "updatedAt": "2026-07-01T00:00:00Z"
}
```

---

### `PATCH /api/candidate/profile`

**Purpose:** Update personal info, professional info, or link fields.

**Request body (all fields optional):**

```json
{
  "fullName": "Maya Rodriguez",
  "bio": "...",
  "primaryRole": "UI/UX Designer",
  "yearsExperience": 5,
  "locationCity": "London",
  "locationCountry": "GB",
  "timezone": "Europe/London",
  "phone": "+44...",
  "portfolioUrl": "https://...",
  "linkedinUrl": "https://...",
  "instagramUrl": "https://...",
  "websiteUrl": "https://...",
  "resumeUrl": "https://..."
}
```

Empty string URL values are coerced to `null` before writing.

**Response `200`:** Updated `candidate_profiles` row.

**Errors:** `422 VALIDATION_ERROR` (Zod schema mismatch)

---

### `POST /api/candidate/avatar`

**Purpose:** Upload or replace avatar image.

**Request:** `multipart/form-data`, field name `file`

**Constraints:**
- Max size: 5 MB
- Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`

**Storage path:** `avatars/{candidateProfileId}/avatar.{ext}` (upsert = true)

**Response `200`:**

```json
{ "avatarUrl": "https://...supabase.co/storage/v1/...signed..." }
```

The URL is a 1-year signed URL from `createSignedUrl()`.

**Errors:**

| Status | Code | When |
|---|---|---|
| 400 | `NO_FILE` | No file in request |
| 400 | `INVALID_TYPE` | File type not allowed |
| 413 | `FILE_TOO_LARGE` | File exceeds 5 MB |
| 500 | `UPLOAD_FAILED` | Supabase Storage error |

---

### `GET /api/candidate/portfolio`

**Purpose:** List all portfolio items for the authenticated candidate.

**Response `200`:**

```json
{
  "items": [
    {
      "id": "<uuid>",
      "title": "Brand Refresh",
      "description": "...",
      "mediaUrl": "https://...signed...",
      "mediaType": "image",
      "thumbnailUrl": null,
      "sortOrder": 0,
      "createdAt": "2026-07-01T00:00:00Z"
    }
  ]
}
```

Items sorted ascending by `sort_order`.

---

### `POST /api/candidate/portfolio`

**Purpose:** Add a new portfolio item. Enforces `MAX_PORTFOLIO_ITEMS = 12`.

**Request body:**

```json
{
  "title": "Brand Refresh",
  "description": "Optional description",
  "mediaUrl": "https://...signed...",
  "mediaType": "image",
  "thumbnailUrl": null
}
```

**Response `201`:** Created item row.

**Errors:**

| Status | Code | When |
|---|---|---|
| 422 | `LIMIT_REACHED` | Already has 12 items |
| 422 | `VALIDATION_ERROR` | Missing required fields |

---

### `PATCH /api/candidate/portfolio/[id]`

**Purpose:** Update title, description, or other metadata for a specific item.

**Params:** `id` — portfolio item UUID (awaited per Next.js 16)

**Request body (all optional):**

```json
{ "title": "New Title", "description": "Updated desc" }
```

**Response `200`:** Updated item row.

**Errors:** `403 FORBIDDEN` if item doesn't belong to this candidate; `404 NOT_FOUND`

---

### `DELETE /api/candidate/portfolio/[id]`

**Purpose:** Remove a portfolio item.

**Params:** `id` — portfolio item UUID

**Response `200`:** `{ "ok": true }`

**Errors:** `403 FORBIDDEN` if item doesn't belong to this candidate; `404 NOT_FOUND`

---

### `POST /api/candidate/portfolio/reorder`

**Purpose:** Persist new `sort_order` after drag-and-drop reorder.

**Request body:**

```json
{ "orderedIds": ["<uuid-1>", "<uuid-2>", "<uuid-3>"] }
```

`orderedIds` is the full ordered array of item UUIDs. Index 0 gets `sort_order = 0`, etc.

**Response `200`:** `{ "ok": true }`

**Errors:** `422 VALIDATION_ERROR` if `orderedIds` is not an array of UUIDs

---

### `POST /api/candidate/portfolio/upload`

**Purpose:** Upload a media file to the `portfolio` bucket and get a signed URL back.

**Request:** `multipart/form-data`, field name `file`

**Constraints:**
- Max size: 20 MB
- Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `video/mp4`, `video/webm`, `video/quicktime`, `application/pdf`

**Storage path:** `portfolio/{candidateProfileId}/{randomUUID()}.{ext}`

**Response `200`:**

```json
{
  "mediaUrl": "https://...signed...",
  "mediaType": "image",
  "thumbnailUrl": null
}
```

`mediaType` values: `"image"` | `"video"` | `"pdf"`.  
`thumbnailUrl` is `null` for non-image types.  
URLs are 1-year signed URLs from `createSignedUrl()`.

**Errors:**

| Status | Code | When |
|---|---|---|
| 400 | `NO_FILE` | No file in request |
| 400 | `INVALID_TYPE` | File type not allowed |
| 413 | `FILE_TOO_LARGE` | File exceeds 20 MB |
| 500 | `UPLOAD_FAILED` | Supabase Storage error |

---

### `GET /api/candidate/preferences`

**Purpose:** Fetch work preferences. If no row exists, returns default values (does NOT insert a row).

**Response `200`:**

```json
{
  "workArrangement": ["remote"],
  "contractType": ["contract"],
  "hourlyRateMin": null,
  "hourlyRateMax": null,
  "availableFrom": null,
  "notifyNewMatches": true,
  "notifyEmail": true
}
```

---

### `PATCH /api/candidate/preferences`

**Purpose:** Update (upsert) work preferences.

**Request body (all optional):**

```json
{
  "workArrangement": ["remote", "hybrid"],
  "contractType": ["fulltime"],
  "hourlyRateMin": 50,
  "hourlyRateMax": 150,
  "availableFrom": "2026-08-01",
  "notifyNewMatches": true,
  "notifyEmail": false
}
```

Do NOT pass `updatedAt` — DB trigger updates it automatically.

**Response `200`:** Upserted preferences row.

---

### `PATCH /api/candidate/visibility`

**Purpose:** Toggle discovery visibility.

**Request body:**

```json
{ "discoveryPaused": true }
```

**Response `200`:** `{ "discoveryPaused": true }`

**Errors:** `422 VALIDATION_ERROR` if `discoveryPaused` is not a boolean

---

### `DELETE /api/candidate/account`

**Purpose:** Permanently delete the authenticated candidate's account and all associated data.

Calls `createServiceClient().auth.admin.deleteUser(auth.userId)`.  
Cascade FK deletes remove all child rows automatically:  
`auth.users → profiles → candidate_profiles → candidate_specialties / candidate_portfolio_items / candidate_preferences`

**Request body:** None

**Response `200`:** `{ "ok": true }`

**Errors:** `500 DELETE_FAILED` if Supabase Admin API returns an error

---

## 6. Employer Endpoints

All require `requireEmployer()` — valid JWT + `role = employer` + `auth_state = APPROVED` + `employer_profiles` row.

---

### `GET /api/employer/profile`

**Auth:** Employer  
**Purpose:** Fetch the authenticated employer's company profile.

**Response `200`:**
```json
{ "success": true, "data": { "id": "...", "company_name": "...", "bio": "...", "industry": "...", "company_size": "1-10", "company_url": "...", "linkedin_url": "...", "founded_year": 2019, "location_city": "Mumbai", "location_country": "India", "logo_url": "employer-logos/..." } }
```

---

### `PATCH /api/employer/profile`

**Auth:** Employer  
**Purpose:** Update company info.

**Body (all optional):**
```json
{
  "company_name": "Acme Studio",
  "bio": "We build great things.",
  "industry": "Software & Technology",
  "company_size": "11-50",
  "company_url": "https://acme.com",
  "linkedin_url": "https://linkedin.com/company/acme",
  "founded_year": 2019,
  "location_city": "Mumbai",
  "location_country": "India"
}
```

**Errors:** `422 VALIDATION_ERROR`, `500 DB_ERROR`

---

### `POST /api/employer/logo`

**Auth:** Employer  
**Content-Type:** `multipart/form-data`  
**Body:** `file` — JPEG, PNG, WebP, or GIF, max 5 MB.  
**Purpose:** Upload company logo. Stored at `avatars` bucket → `employer-logos/{employerProfileId}/logo.{ext}`. Returns signed URL.

**Response `200`:**
```json
{ "success": true, "data": { "logo_url": "employer-logos/...", "signed_url": "https://..." } }
```

**Errors:** `400 MISSING_FILE`, `422 INVALID_TYPE`, `422 TOO_LARGE`, `500 UPLOAD_ERROR`, `500 DB_ERROR`

---

### `GET /api/employer/hiring`

**Auth:** Employer  
**Purpose:** Fetch hiring preferences. Returns `null` data if no row yet.

---

### `PATCH /api/employer/hiring`

**Auth:** Employer  
**Purpose:** Upsert hiring preferences.

**Body (all optional):**
```json
{
  "typically_hires": ["ux_designer", "motion_designer"],
  "contract_preferred": true,
  "fulltime_preferred": false,
  "remote_ok": true,
  "onsite_ok": false,
  "budget_min_hourly": 25,
  "budget_max_hourly": 150,
  "hiring_urgency": "within_month"
}
```

`hiring_urgency` enum: `immediately | within_month | within_quarter | exploring`

---

### `GET /api/employer/preferences`

**Auth:** Employer  
**Purpose:** Fetch notification preferences. Returns `{ notify_new_match: true, notify_email: true }` if no row yet.

---

### `PATCH /api/employer/preferences`

**Auth:** Employer  
**Body:** `{ "notify_new_match": boolean, "notify_email": boolean }` (both optional).

---

### `DELETE /api/employer/account`

**Auth:** Employer  
**Purpose:** Delete employer account and all data via `auth.admin.deleteUser()` cascade.

**Response `200`:** `{ "success": true }`

**Errors:** `500 DELETE_ERROR`

---

## 7. Discovery Endpoints

All require `requireEmployer()` — valid JWT + `role = employer` + `auth_state = APPROVED` + `employer_profiles` row.

The discovery feed excludes candidates already in `employer_saved_candidates` or effectively in `employer_passed_candidates` (see pass logic below).  
Save overrides pass (removes from passed list); pass overrides save (removes from saved list).

**Pass exclusion logic (Phase 6.5):**
- `pass_type = 'forever'` — always excluded
- `pass_type = 'temporary'` within 30-day window AND candidate hasn't updated profile since pass — excluded
- 30 days elapsed OR `candidate.updated_at > pass.candidate_updated_at` — re-enters feed

---

### `GET /api/discovery`

**Purpose:** Paginated discovery feed — approved, discoverable candidates, excluding already-actioned ones.

**Query params:**

| Param | Type | Description |
|---|---|---|
| `cursor` | string | Base64-encoded `{ createdAt, id }` — omit for first page |
| `q` | string | Full-text search on `full_name` or `bio` |
| `role` | string | Comma-separated role name values (matches `candidate_roles.role_name`; multi-select AND logic) |
| `skills` | string | Comma-separated skill names (AND match) |
| `location_country` | string | Exact country match (case-insensitive) |
| `location_city` | string | Partial city match |
| `remote` | `1` | Candidate open to remote |
| `hybrid` | `1` | Candidate open to hybrid |
| `onsite` | `1` | Candidate open to onsite |
| `contract` | `1` | Candidate open to contract |
| `fulltime` | `1` | Candidate open to full-time |
| `rate_max` | number | Candidate's `rate_max_hourly` ≤ this value |
| `exp_min` | number | Minimum years of experience |
| `exp_max` | number | Maximum years of experience |
| `available_now` | `1` | `available_from` is null or in the past |
| `has_portfolio` | `1` | Candidate has a `portfolio_url` |

**Response `200`:**

```json
{
  "data": [
    {
      "id": "<uuid>",
      "full_name": "Maya Rodriguez",
      "primary_role": "art_director",
      "location_city": "London",
      "location_country": "GB",
      "years_experience": 5,
      "bio": "First 220 chars...",
      "avatar_url": "https://...signed...",
      "has_portfolio": true,
      "discovery_score": 87,
      "profile_completeness": 85,
      "created_at": "2026-07-01T00:00:00Z",
      "specialties": [{ "name": "Branding", "level": "expert" }],
      "roles": [
        { "role_name": "UI/UX Designer", "is_primary": true },
        { "role_name": "Product Designer", "is_primary": false }
      ],
      "preferences": {
        "open_to_remote": true,
        "open_to_onsite": false,
        "open_to_hybrid": true,
        "open_to_contract": true,
        "open_to_fulltime": false,
        "rate_min_hourly": 80,
        "rate_max_hourly": 150,
        "available_from": null
      }
    }
  ],
  "nextCursor": "<base64>",
  "total": 42
}
```

`total` is only included on the first page (`cursor` absent). Subsequent pages return `"total": null`.  
Page size: 20 candidates.  
`profile_completeness` is a 0–100 integer. Candidates below `MIN_DISCOVERY_COMPLETENESS` are excluded from the feed (gate inactive in dev — set to `60` before launch).  
`roles` comes from the `candidate_roles` table (batch-fetched per page, not a JOIN).

**Errors:** `400 INVALID_CURSOR`, `500 INTERNAL_ERROR`

---

### `GET /api/discovery/[candidateId]`

**Purpose:** Full candidate profile — all sections + employer's interaction state. Also records a view (fire-and-forget).

**Params:** `candidateId` — UUID of a `candidate_profiles` row

**Response `200`:**

```json
{
  "id": "<uuid>",
  "full_name": "Maya Rodriguez",
  "primary_role": "art_director",
  "bio": "Full bio...",
  "years_experience": 5,
  "location_city": "London",
  "location_country": "GB",
  "timezone": "Europe/London",
  "portfolio_url": "https://...",
  "linkedin_url": "https://...",
  "instagram_url": null,
  "website_url": null,
  "avatar_url": "https://...signed...",
  "discovery_score": 87,
  "profile_completeness": 85,
  "created_at": "2026-07-01T00:00:00Z",
  "specialties": [{ "name": "Branding", "level": "expert" }],
  "roles": [
    { "role_name": "UI/UX Designer", "is_primary": true },
    { "role_name": "Product Designer", "is_primary": false }
  ],
  "preferences": { "open_to_remote": true, ... },
  "portfolio": [
    {
      "id": "<uuid>",
      "title": "Brand Refresh",
      "description": "...",
      "media_url": "https://...signed...",
      "media_type": "image",
      "thumbnail_url": null,
      "sort_order": 0
    }
  ],
  "swipe_state": "none",
  "note": ""
}
```

`swipe_state` values: `"none"` | `"saved"` | `"passed"`

**Errors:** `404 NOT_FOUND`, `500 INTERNAL_ERROR`

---

### `POST /api/discovery/save`

**Purpose:** Save a candidate. If the candidate was previously passed, removes them from `employer_passed_candidates`.

**Request body:**

```json
{ "candidateId": "<uuid>" }
```

**Response `200`:** `{ "ok": true }`

**Errors:** `400 MISSING_CANDIDATE_ID`, `500 INTERNAL_ERROR`

---

### `DELETE /api/discovery/save`

**Purpose:** Unsave a candidate — returns them to the discovery feed.

**Request body:**

```json
{ "candidateId": "<uuid>" }
```

**Response `200`:** `{ "ok": true }`

**Errors:** `400 MISSING_CANDIDATE_ID`, `500 INTERNAL_ERROR`

---

### `POST /api/discovery/pass`

**Purpose:** Pass on a candidate. If previously saved, removes from `employer_saved_candidates`. Temporary passes expire after 30 days or when the candidate updates their profile; forever passes are permanent.

**Request body:**

```json
{ "candidateId": "<uuid>", "forever": false }
```

| Field | Type | Default | Description |
|---|---|---|---|
| `candidateId` | string | required | UUID of the candidate profile |
| `forever` | boolean | `false` | `true` = permanent hide ("Hide Forever"); `false` = temporary 30-day pass |

**Response `200`:** `{ "ok": true }`

**Errors:** `400 MISSING_CANDIDATE_ID`, `500 INTERNAL_ERROR`

---

### `GET /api/discovery/saved`

**Purpose:** Paginated list of all saved candidates with their private notes.

**Query params:**

| Param | Description |
|---|---|
| `cursor` | Base64-encoded `{ savedAt, candidateId }` — omit for first page |
| `q` | Search on `full_name` (client-filtered after fetch) |

**Response `200`:**

```json
{
  "data": [
    {
      "id": "<uuid>",
      "full_name": "Maya Rodriguez",
      "primary_role": "art_director",
      "location_city": "London",
      "location_country": "GB",
      "avatar_url": "https://...signed...",
      "specialties": [{ "name": "Branding", "level": "expert" }],
      "saved_at": "2026-07-01T10:00:00Z",
      "note": "Strong portfolio, follow up next week."
    }
  ],
  "nextCursor": "<base64>"
}
```

**Errors:** `500 INTERNAL_ERROR`

---

### `POST /api/discovery/note`

**Purpose:** Create or update the employer's private note for a candidate. Upserts on `(employer_id, candidate_id)`.

**Request body:**

```json
{ "candidateId": "<uuid>", "note": "Strong portfolio." }
```

**Response `200`:** `{ "ok": true }`

**Errors:** `400 MISSING_CANDIDATE_ID`, `500 INTERNAL_ERROR`

---

## 8. Response Format

All API responses are JSON. Success responses use `200` or `201`. Error responses follow:

```json
{
  "error": "HUMAN_READABLE_MESSAGE",
  "code": "MACHINE_READABLE_CODE"
}
```

---

## 9. Error Codes

| HTTP | Code | Meaning |
|---|---|---|
| 400 | `BAD_REQUEST` | Missing or malformed request |
| 401 | `UNAUTHORIZED` | Not authenticated |
| 403 | `FORBIDDEN` | Authenticated but not permitted |
| 404 | `NOT_FOUND` | Resource doesn't exist |
| 409 | `CONFLICT` | Resource already exists in target state |
| 410 | `GONE` | Resource exists but is no longer valid |
| 413 | `FILE_TOO_LARGE` | Upload exceeds size limit |
| 422 | `VALIDATION_ERROR` | Zod schema failure |
| 422 | `LIMIT_REACHED` | Count limit enforced server-side |
| 500 | `INTERNAL_ERROR` | Unexpected server error |
