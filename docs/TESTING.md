# ScouttOpp — Testing Strategy
### Approach, Patterns, and Standards v1.0

> **Status:** Testing infrastructure not yet set up. Add tests as each phase is implemented — start with Phase 2.  
> This document defines what to test, how to test it, and what tools to use. Update when new patterns or decisions are made.

---

## Table of Contents

1. [Testing Philosophy](#1-testing-philosophy)
2. [Test Stack](#2-test-stack)
3. [Test Types](#3-test-types)
4. [Coverage Standards](#4-coverage-standards)
5. [Unit Tests](#5-unit-tests)
6. [Integration Tests](#6-integration-tests)
7. [End-to-End Tests](#7-end-to-end-tests)
8. [Testing Supabase](#8-testing-supabase)
9. [Accessibility Testing](#9-accessibility-testing)
10. [What NOT to Test](#10-what-not-to-test)
11. [CI/CD Integration](#11-cicd-integration)
12. [Test File Conventions](#12-test-file-conventions)

---

## 1. Testing Philosophy

### What Tests Are For

Tests protect against **regressions** — breaking something that used to work. They are not a certificate of correctness; they're a safety net.

### Priorities

1. **Test the auth state machine.** Every incorrect state transition is a security hole.
2. **Test API route handlers.** Wrong HTTP status codes or responses are bugs that are hard to catch visually.
3. **Test sync-mapper.ts.** Incorrect field mapping silently corrupts candidate data.
4. **Don't test the design system extensively.** UI primitives are low-risk. Test them visually, not with unit tests.

### Test vs. Type vs. Schema

Before writing a test, ask whether a type or schema can give the same guarantee:

| Problem | Solution |
|---|---|
| "Is this a valid AuthState?" | TypeScript union type — no test needed |
| "Does this field exist?" | TypeScript + Supabase generated types — no test needed |
| "Is this state transition valid?" | Unit test — logic, not type |
| "Does this API return the right status code?" | Integration test |
| "Can a user log in and reach the dashboard?" | E2E test |

---

## 2. Test Stack

| Layer | Tool | Why |
|---|---|---|
| Unit / Integration | **Vitest** | Fast, native ESM, compatible with Next.js App Router |
| E2E | **Playwright** | Reliable cross-browser, excellent for auth flows |
| Test DB | **Supabase local dev** | `supabase start` spins up a local Postgres + Auth instance |
| Accessibility | **axe-core** via `@axe-core/playwright` | Automated a11y audit |
| Visual regression | *(future)* Chromatic or Percy | Not set up yet |

### Setup Commands

```bash
# Install testing dependencies (Phase 2)
npm install -D vitest @vitejs/plugin-react vitest-environment-jsdom
npm install -D playwright @playwright/test @axe-core/playwright

# Initialize Playwright
npx playwright install

# Start local Supabase for integration tests
supabase start
```

---

## 3. Test Types

### Unit Tests

- Pure functions with no I/O
- State machine logic
- Validation schemas
- Data transformation (sync-mapper)

### Integration Tests

- API route handlers (using local Supabase)
- Service layer functions
- Middleware auth guard decisions

### End-to-End Tests

- Complete user journeys through the browser
- Auth flows (sign up, verify, select role, log in, log out)
- Admin approval workflow
- Critical paths only — E2E tests are expensive

### Accessibility Tests

- Run axe-core on every auth page in Playwright
- Check for WCAG 2.1 AA violations after each phase

---

## 4. Coverage Standards

Coverage is a **signal, not a goal.** Don't write tests just to hit a coverage number.

| Area | Minimum coverage | Rationale |
|---|---|---|
| `lib/auth/machine.ts` | 100% | Security-critical — every path must be covered |
| `lib/auth/router.ts` | 100% | Every state must map to the correct route |
| `services/*.ts` | 80%+ | Business logic; mock Supabase client |
| API route handlers | 70%+ | Test success + common error paths |
| `sync-mapper.ts` | 90%+ | Data corruption is silent and hard to detect |
| UI components | Not tracked | Visual testing is more appropriate |

---

## 5. Unit Tests

### `lib/auth/machine.ts`

Test every allowed and disallowed transition:

```ts
// tests/unit/auth/machine.test.ts
import { describe, it, expect } from 'vitest'
import { validateTransition, ALLOWED_TRANSITIONS } from '@/lib/auth/machine'

describe('validateTransition', () => {
  it('allows UNVERIFIED → VERIFIED_NO_ROLE', () => {
    expect(validateTransition('UNVERIFIED', 'VERIFIED_NO_ROLE')).toBe(true)
  })

  it('rejects REJECTED → APPROVED (terminal state)', () => {
    expect(validateTransition('REJECTED', 'APPROVED')).toBe(false)
  })

  it('rejects all transitions for REJECTED state', () => {
    expect(ALLOWED_TRANSITIONS.REJECTED).toHaveLength(0)
  })

  it('does not allow skipping states', () => {
    expect(validateTransition('UNVERIFIED', 'APPROVED')).toBe(false)
  })
})
```

### `lib/auth/router.ts`

```ts
describe('getCanonicalRoute', () => {
  it('returns /dashboard/candidate for approved candidate', () => {
    const profile = { auth_state: 'APPROVED', role: 'candidate' }
    expect(getCanonicalRoute(profile)).toBe('/dashboard/candidate')
  })

  it('returns /auth/verify-email for UNVERIFIED user', () => {
    const profile = { auth_state: 'UNVERIFIED', role: null }
    expect(getCanonicalRoute(profile)).toBe('/auth/verify-email')
  })

  it('returns /auth/rejected for REJECTED user regardless of role', () => {
    const profile = { auth_state: 'REJECTED', role: 'candidate' }
    expect(getCanonicalRoute(profile)).toBe('/auth/rejected')
  })
})
```

### `sync-mapper.ts` (Phase 3)

```ts
describe('mapSheetRow', () => {
  it('maps full name correctly', () => {
    const row = { 'Full Name': 'Maya Rodriguez', ... }
    expect(mapSheetRow(row).fullName).toBe('Maya Rodriguez')
  })

  it('handles missing optional fields gracefully', () => {
    const row = { 'Full Name': 'Test User' }  // no phone, no portfolio
    const result = mapSheetRow(row)
    expect(result.phone).toBeNull()
    expect(result.portfolioUrl).toBeNull()
  })

  it('normalises role field to enum value', () => {
    const row = { 'Role': 'Motion Designer' }
    expect(mapSheetRow(row).primaryRole).toBe('motion_designer')
  })
})
```

### Zod Schemas (`lib/validations.ts`)

```ts
describe('loginSchema', () => {
  it('rejects empty email', () => {
    expect(loginSchema.safeParse({ email: '', password: 'test1234' }).success).toBe(false)
  })

  it('accepts valid email and password', () => {
    expect(loginSchema.safeParse({ email: 'test@example.com', password: 'test1234' }).success).toBe(true)
  })
})
```

---

## 6. Integration Tests

Integration tests call real functions with a real (local) Supabase instance. Do **not** mock the database.

> **Rule (from project feedback):** Integration tests must hit a real database. Mocking Supabase clients risks false positives where tests pass but production behaviour differs (e.g., RLS policies not applied in mocks).

### Setup

```ts
// tests/integration/setup.ts
import { createClient } from '@supabase/supabase-js'

// Uses local Supabase (supabase start)
export const supabase = createClient(
  process.env.TEST_SUPABASE_URL!,
  process.env.TEST_SUPABASE_SERVICE_ROLE_KEY!
)

// Reset test data before each test suite
export async function resetTestData() {
  await supabase.from('swipe_actions').delete().neq('id', '')
  await supabase.from('matches').delete().neq('id', '')
  await supabase.from('candidate_profiles').delete().neq('id', '')
  await supabase.from('profiles').delete().neq('id', '')
  await supabase.auth.admin.listUsers().then(({ data }) =>
    Promise.all(data.users.map(u => supabase.auth.admin.deleteUser(u.id)))
  )
}
```

### Admin Service Tests

```ts
describe('approveCandidate', () => {
  it('sets auth_state to APPROVED and is_discoverable to true', async () => {
    // Arrange: create a staging row and a user in PENDING_APPROVAL
    // Act: call approveCandidate(stagingId, adminId)
    // Assert: profile.auth_state === 'APPROVED', candidate_profiles.is_discoverable === true
  })

  it('throws on invalid state transition', async () => {
    // Arrange: user is already APPROVED
    // Act + Assert: approveCandidate throws INVALID_STATE_TRANSITION
  })
})
```

### API Route Handler Tests

```ts
// tests/integration/api/admin-approve.test.ts
describe('POST /api/admin/candidates/[id]/approve', () => {
  it('returns 403 for non-admin authenticated user', async () => {
    const response = await fetch('/api/admin/candidates/test-id/approve', {
      method: 'POST',
      headers: { Cookie: candidateSessionCookie },
      body: JSON.stringify({})
    })
    expect(response.status).toBe(403)
  })

  it('returns 404 for non-existent candidate', async () => {
    const response = await fetch('/api/admin/candidates/non-existent-id/approve', {
      method: 'POST',
      headers: { Cookie: adminSessionCookie },
      body: JSON.stringify({})
    })
    expect(response.status).toBe(404)
  })
})
```

---

## 7. End-to-End Tests

E2E tests cover the most important user journeys only.

### Critical Paths to Cover

**Auth flows:**
```
Sign up → verify email → select role → pending approval
Log in (wrong password) → error state
Log in (correct) → dashboard
Forgot password → reset → log in with new password
```

**Admin workflow:**
```
Admin logs in → triggers sync → views staging queue → approves candidate
Approved candidate logs in → lands on candidate dashboard
```

### Playwright Test Example

```ts
// tests/e2e/auth-signup.test.ts
import { test, expect } from '@playwright/test'

test('signup flow to verify-email screen', async ({ page }) => {
  await page.goto('/auth/signup')

  await page.fill('[name="email"]', 'test+e2e@example.com')
  await page.fill('[name="password"]', 'StrongPass123!')
  await page.check('[name="terms"]')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL(/\/auth\/verify-email/)
  await expect(page.getByText('test+e2e@example.com')).toBeVisible()
})
```

### Playwright Config

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  baseURL: 'http://localhost:3000',
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## 8. Testing Supabase

### Local Supabase

```bash
# Start local Supabase stack (Docker required)
supabase start

# It prints connection details:
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio: http://localhost:54323
# Anon key: <local-anon-key>
# Service role key: <local-service-role-key>
```

Set these in `.env.test.local`:
```bash
TEST_SUPABASE_URL=http://localhost:54321
TEST_SUPABASE_ANON_KEY=<local-anon-key>
TEST_SUPABASE_SERVICE_ROLE_KEY=<local-service-role-key>
```

### RLS in Tests

Integration tests run as the service role (bypasses RLS). To test RLS policies:

```ts
// Create a user-scoped client for RLS tests
const userClient = createClient(url, anonKey)
await userClient.auth.signInWithPassword({ email, password })
// Now queries run as that user, RLS applies
```

### Seed Data

```ts
// tests/fixtures/seed.ts
export async function seedTestCandidate(supabase: SupabaseClient) {
  // Create auth user
  const { data: { user } } = await supabase.auth.admin.createUser({
    email: 'candidate@test.com',
    password: 'TestPass123!',
    email_confirm: true,
  })
  // Set profile state
  await supabase
    .from('profiles')
    .update({ auth_state: 'APPROVED', role: 'candidate' })
    .eq('id', user!.id)
  return user!
}
```

---

## 9. Accessibility Testing

### Automated (Playwright + axe-core)

```ts
import { checkA11y, injectAxe } from '@axe-core/playwright'

test('login page has no a11y violations', async ({ page }) => {
  await page.goto('/auth/login')
  await injectAxe(page)
  await checkA11y(page, undefined, {
    runOnly: ['wcag2a', 'wcag2aa'],
  })
})
```

Run for every auth page after Phase 1 implementation.

### Manual Checks (Before Each Release)

- [ ] Tab through every interactive element in logical order
- [ ] Activate every button/link with keyboard (Enter/Space)
- [ ] Test with screen reader (VoiceOver on Mac / NVDA on Windows)
- [ ] Verify all form errors are announced by screen reader
- [ ] Verify focus is trapped in modals
- [ ] Verify colour contrast meets 4.5:1 for body text

---

## 10. What NOT to Test

**Don't write tests for:**

- Tailwind CSS visual output (test with eyes, not code)
- Third-party library behaviour (trust Supabase, trust Framer Motion)
- TypeScript types (the compiler verifies these)
- Static Server Components with no logic (Rejected screen, Suspended screen)
- Every individual Zod error message (test schema structure, not copy)
- `lib/tokens.ts` animation values (pure data, no logic)
- `lib/utils.ts` → `cn()` (it's clsx + tailwind-merge; they have their own tests)

**Don't mock:**

- The Supabase database client in integration tests (use local Supabase)
- RLS policies (they must be tested, not bypassed)
- The auth state machine in auth-dependent tests (test the machine separately as a unit, then trust it)

---

## 11. CI/CD Integration

Add to GitHub Actions (`.github/workflows/ci.yml`):

```yaml
name: CI
on: [push, pull_request]

jobs:
  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npx tsc --noEmit

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npx vitest run

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
    env:
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
```

CI runs on every push and PR. All checks must pass before merging to `main`.

---

## 12. Test File Conventions

```
tests/
├── unit/
│   ├── auth/
│   │   ├── machine.test.ts
│   │   └── router.test.ts
│   ├── sync/
│   │   └── sync-mapper.test.ts
│   └── lib/
│       └── validations.test.ts
├── integration/
│   ├── api/
│   │   ├── auth-callback.test.ts
│   │   ├── invite-validate.test.ts
│   │   └── admin-candidates.test.ts
│   ├── services/
│   │   ├── admin.service.test.ts
│   │   └── candidate.service.test.ts
│   └── setup.ts
├── e2e/
│   ├── auth-signup.test.ts
│   ├── auth-login.test.ts
│   ├── auth-forgot-password.test.ts
│   └── admin-approval.test.ts
└── fixtures/
    └── seed.ts
```

### Test File Rules

- Test files live in `tests/` (not co-located with source files)
- Name pattern: `<feature>.test.ts`
- Each test file has one `describe` block matching the thing being tested
- Test names use complete sentences: `'returns 403 for non-admin users'` not `'403'`
- Arrange → Act → Assert structure in every test
- No global mutable state between tests — use `beforeEach` to reset
