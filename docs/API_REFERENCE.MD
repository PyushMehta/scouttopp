# ScouttOpp — API Reference
### All Endpoints v1.0

> **Status:** Phase 2 endpoints ✅ implemented. Phase 3–4 endpoints pending.  
> This document is the authoritative reference for every API route. Update it before implementing or changing any endpoint. "Future" endpoints are documented for awareness — do not implement them until their phase begins.

---

## Table of Contents

1. [Conventions](#1-conventions)
2. [Authentication](#2-authentication)
3. [Error Format](#3-error-format)
4. [Phase 2 — Auth Endpoints](#4-phase-2--auth-endpoints)
5. [Phase 3 — Sync & Admin Endpoints](#5-phase-3--sync--admin-endpoints)
6. [Phase 4 — Candidate & Employer Endpoints](#6-phase-4--candidate--employer-endpoints)
7. [Future Endpoints — Phase 5 & 6](#7-future-endpoints--phase-5--6)

---

## 1. Conventions

### Base URL

- Development: `http://localhost:3000/api`
- Production: `https://scouttopp.com/api`

### Request Format

- All request bodies are JSON (`Content-Type: application/json`).
- All responses are JSON.
- `GET` requests use URL query parameters, never a body.

### Response Envelope

All responses use a consistent envelope:

```ts
// Success
{
  "success": true,
  "data": { ... }          // the response payload
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": { ... }     // optional — field-level errors on validation failures
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Created |
| `400` | Bad request (validation error, invalid input) |
| `401` | Unauthenticated (no session) |
| `403` | Forbidden (authenticated but wrong role/permissions) |
| `404` | Not found |
| `409` | Conflict (duplicate, state transition violation) |
| `422` | Unprocessable entity (valid format, invalid business logic) |
| `429` | Rate limited |
| `500` | Internal server error |

### Rate Limiting

Admin sync endpoints: `5 requests per minute` per admin user.  
Auth endpoints: Supabase enforces their own limits (email: 3/hour, OTP: 60/hour).

---

## 2. Authentication

All non-public endpoints require a valid Supabase session.

The server reads the session from the `sb-<project-ref>-auth-token` cookie.  
The middleware (`middleware.ts`) validates the session before the API route handler runs.

**Admin endpoints additionally check:** `profiles.role = 'admin'`  
**Candidate endpoints additionally check:** `profiles.role = 'candidate'` + `profiles.auth_state = 'APPROVED'`  
**Employer endpoints additionally check:** `profiles.role = 'employer'` + `profiles.auth_state = 'APPROVED'`

---

## 3. Error Format

### Standard Error Codes

| Code | When |
|---|---|
| `UNAUTHORIZED` | No valid session |
| `FORBIDDEN` | Session valid, insufficient role or state |
| `VALIDATION_ERROR` | Request body failed Zod schema |
| `NOT_FOUND` | Resource doesn't exist |
| `CONFLICT` | Duplicate create, or invalid state transition |
| `RATE_LIMITED` | Too many requests |
| `INTERNAL_ERROR` | Unexpected server error |
| `SYNC_FAILED` | Google Sheets API unreachable or returned an error |
| `INVALID_INVITE_CODE` | Code not found, exhausted, or expired |
| `INVALID_STATE_TRANSITION` | Attempted illegal auth_state change |

### Validation Error Detail

When `code = 'VALIDATION_ERROR'`, the `details` field contains field-level errors:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request body is invalid.",
    "details": {
      "email": ["Invalid email address."],
      "role": ["Required."]
    }
  }
}
```

---

## 4. Phase 2 — Auth Endpoints

### `GET /api/auth/callback`

**Purpose:** Exchanges a Supabase authorization code for a session after email confirmation or OAuth.  
**Auth required:** No (public — user has no session yet)  
**Phase:** 2

**Query parameters:**
| Param | Type | Required | Notes |
|---|---|---|---|
| `code` | string | Yes | Authorization code from Supabase |
| `next` | string | No | Redirect destination after auth |

**Flow:**
1. Calls `supabase.auth.exchangeCodeForSession(code)`
2. Fetches `profiles.auth_state` for the newly-authenticated user
3. Redirects to `getCanonicalRoute(profile)` or `next` if provided and valid

**Responses:**

| Outcome | HTTP | Behaviour |
|---|---|---|
| Code exchanged, profile found | `302` | Redirect to canonical route |
| Code invalid/expired | `302` | Redirect to `/auth/login?error=link_expired` |
| Exchange error | `302` | Redirect to `/auth/login?error=auth_error` |

*Note: This is a redirect handler, not a JSON API. It does not use the standard response envelope.*

---

### `POST /api/invite/validate`

**Purpose:** Validates an invite code before signup proceeds.  
**Auth required:** No (public — user is signing up)  
**Phase:** 2

**Request body:**
```json
{
  "code": "STUDIO-2026"
}
```

**Success response `200`:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "role": "employer",
    "remainingUses": 4
  }
}
```

**Error responses:**

| Scenario | Code | Error code |
|---|---|---|
| Code not found | `404` | `INVALID_INVITE_CODE` |
| Code exhausted | `422` | `INVALID_INVITE_CODE` |
| Code expired | `422` | `INVALID_INVITE_CODE` |
| Missing `code` field | `400` | `VALIDATION_ERROR` |

---

## 5. Phase 3 — Sync & Admin Endpoints

### `POST /api/sync/run`

**Purpose:** Triggers a Google Sheets sync. Fetches all rows from the configured sheet, inserts them into `candidate_sync_staging`.  
**Auth required:** Yes — admin role  
**Phase:** 3

**Request body:** *(empty)*

**Success response `202`:**
```json
{
  "success": true,
  "data": {
    "syncRunId": "uuid",
    "status": "running",
    "startedAt": "2026-06-30T12:00:00Z"
  }
}
```

**Notes:**
- Sync runs asynchronously. Poll `/api/sync/status/[runId]` for completion.
- Only one sync can run at a time. If one is running, returns `409 CONFLICT`.

**Error responses:**

| Scenario | Code | Error code |
|---|---|---|
| Another sync running | `409` | `CONFLICT` |
| Sheets API unreachable | `502` | `SYNC_FAILED` |
| Not admin | `403` | `FORBIDDEN` |

---

### `GET /api/sync/status/[runId]`

**Purpose:** Returns the current status of a sync run.  
**Auth required:** Yes — admin role  
**Phase:** 3

**Path parameters:**
| Param | Type | Notes |
|---|---|---|
| `runId` | UUID | ID from `/api/sync/run` response |

**Success response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "complete",
    "rowsFetched": 47,
    "rowsPromoted": 0,
    "rowsSkipped": 12,
    "rowsErrored": 2,
    "startedAt": "2026-06-30T12:00:00Z",
    "completedAt": "2026-06-30T12:00:14Z"
  }
}
```

**Status values:** `running` | `complete` | `failed` | `partial`

---

### `GET /api/admin/candidates`

**Purpose:** Returns the list of candidates in the staging queue (pending review) and the canonical list (approved/rejected).  
**Auth required:** Yes — admin role  
**Phase:** 3

**Query parameters:**
| Param | Type | Default | Notes |
|---|---|---|---|
| `queue` | `staging \| canonical` | `staging` | Which dataset to return |
| `status` | string | `pending` | Filter by status within that queue |
| `page` | int | `1` | Pagination |
| `limit` | int | `25` | Max `100` |
| `search` | string | — | Full-text search on name/email |

**Success response `200`:**
```json
{
  "success": true,
  "data": {
    "candidates": [
      {
        "id": "uuid",
        "fullName": "Maya Rodriguez",
        "email": "maya@example.com",
        "primaryRole": "motion_designer",
        "location": "Los Angeles, CA",
        "status": "pending",
        "dataSource": "google_sheets_sync",
        "createdAt": "2026-06-30T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 83,
      "totalPages": 4
    }
  }
}
```

---

### `GET /api/admin/candidates/[id]`

**Purpose:** Returns the full profile of a single candidate (staging or canonical).  
**Auth required:** Yes — admin role  
**Phase:** 3

**Success response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "source": "staging",             // "staging" | "canonical"
    "stagingId": "uuid",             // present when source = "staging"
    "fullName": "Maya Rodriguez",
    "email": "maya@example.com",
    "phone": "+1 213 555 0100",
    "locationCity": "Los Angeles",
    "locationCountry": "US",
    "primaryRole": "motion_designer",
    "yearsExperience": 6,
    "portfolioUrl": "https://maya.design",
    "bio": "...",
    "specialties": ["After Effects", "Cinema 4D"],
    "rawData": { ... },              // present when source = "staging"
    "mappedData": { ... }            // present when source = "staging"
  }
}
```

---

### `POST /api/admin/candidates/[id]/approve`

**Purpose:** Promotes a staging candidate to `candidate_profiles` (or approves an existing canonical candidate), sets `auth_state → APPROVED`, sets `is_discoverable = true`.  
**Auth required:** Yes — admin role  
**Phase:** 3

**Request body:**
```json
{
  "notes": "Strong portfolio, great fit for motion design."   // optional
}
```

**Success response `200`:**
```json
{
  "success": true,
  "data": {
    "candidateProfileId": "uuid",
    "authState": "APPROVED",
    "isDiscoverable": true,
    "approvedAt": "2026-06-30T13:00:00Z"
  }
}
```

**Error responses:**

| Scenario | Code | Error code |
|---|---|---|
| Candidate not found | `404` | `NOT_FOUND` |
| Already approved | `409` | `CONFLICT` |
| Invalid state for approval | `422` | `INVALID_STATE_TRANSITION` |

---

### `POST /api/admin/candidates/[id]/reject`

**Purpose:** Rejects a candidate (staging or canonical). Sets `auth_state → REJECTED`.  
**Auth required:** Yes — admin role  
**Phase:** 3

**Request body:**
```json
{
  "reason": "Portfolio does not meet current requirements."
}
```

**Success response `200`:**
```json
{
  "success": true,
  "data": {
    "candidateProfileId": "uuid",
    "authState": "REJECTED",
    "rejectedAt": "2026-06-30T13:00:00Z"
  }
}
```

---

### `POST /api/admin/users/[id]/suspend`

**Purpose:** Temporarily suspends a user. Sets `auth_state → SUSPENDED`.  
**Auth required:** Yes — admin role  
**Phase:** 3

**Request body:**
```json
{
  "reason": "Violation of community guidelines."    // optional
}
```

**Success response `200`:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "authState": "SUSPENDED"
  }
}
```

---

### `POST /api/admin/users/[id]/reinstate`

**Purpose:** Reinstates a suspended user. Sets `auth_state → APPROVED`.  
**Auth required:** Yes — admin role  
**Phase:** 3

**Request body:** *(empty)*

**Success response `200`:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "authState": "APPROVED"
  }
}
```

---

## 6. Phase 4 — Candidate & Employer Endpoints

### `GET /api/candidates/me`

**Purpose:** Returns the current candidate's full profile.  
**Auth required:** Yes — approved candidate  
**Phase:** 4

**Success response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "Maya Rodriguez",
    "primaryRole": "motion_designer",
    "bio": "...",
    "isDiscoverable": true,
    "discoveryPaused": false,
    "specialties": [...],
    "portfolioItems": [...],
    "preferences": { ... }
  }
}
```

---

### `PATCH /api/candidates/me`

**Purpose:** Updates the current candidate's profile.  
**Auth required:** Yes — approved candidate  
**Phase:** 4

**Request body:** Any subset of updatable fields:
```json
{
  "bio": "Updated bio...",
  "locationCity": "New York",
  "discoveryPaused": true
}
```

**Success response `200`:** Updated profile (same shape as `GET /api/candidates/me`).

---

### `GET /api/employers/me`

**Purpose:** Returns the current employer's full profile.  
**Auth required:** Yes — approved employer  
**Phase:** 4

---

### `PATCH /api/employers/me`

**Purpose:** Updates the current employer's profile.  
**Auth required:** Yes — approved employer  
**Phase:** 4

---

## 7. Future Endpoints — Phase 5 & 6

*Do not implement until these phases begin. Documented here for planning awareness.*

### Phase 5 — Native Onboarding

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/candidates/onboarding/profile` | Save onboarding profile data |
| `POST` | `/api/candidates/onboarding/specialties` | Save specialty selections |
| `POST` | `/api/candidates/onboarding/portfolio` | Upload portfolio item |
| `DELETE` | `/api/candidates/onboarding/portfolio/[itemId]` | Remove portfolio item |
| `POST` | `/api/candidates/onboarding/preferences` | Save work preferences |
| `POST` | `/api/candidates/onboarding/submit` | Submit for admin review (ONBOARDING → PENDING_APPROVAL) |

### Phase 6 — Swipe Feature

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/swipe/candidates` | Returns next batch of discoverable candidates for swipe deck |
| `POST` | `/api/swipe/actions` | Records a swipe action (like/pass/super_like) |
| `GET` | `/api/matches` | Returns all matches for current user |
| `PATCH` | `/api/matches/[matchId]` | Updates match status (close, etc.) |

**Swipe query design:**
```sql
SELECT cp.* FROM candidate_profiles cp
WHERE cp.is_discoverable = true
  AND cp.discovery_paused = false
  AND cp.id NOT IN (
    SELECT candidate_id FROM swipe_actions WHERE employer_id = $employerProfileId
  )
ORDER BY cp.discovery_score DESC NULLS LAST
LIMIT 20;
```
