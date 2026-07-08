# ScouttOpp — Landing Page Design Specification
### Phase 5 — Public Marketing Website

> This document is the complete visual and copy specification for the landing page at `/`. It supplements `docs/DESIGN_SYSTEM.md` with page-specific composition decisions.

> **v0.7.1 Amendment (2026-07-06 — Candidate Beta):** Hero section updated to full-screen looping video background (`/public/videos/hero-bg.mp4`) with dark overlay; two-column layout replaced by centered single-column; `CandidateCardMockup` removed. `ForEmployersSection` replaced by `ForEmployersComingSoonSection` (badge + planned-capabilities grid, no interactive UI). `ForEmployersSection` preserved in `components/marketing/for-employers-section.tsx` for Employer Beta reactivation. FAQ employer group removed; candidate-only questions remain.

---

## Table of Contents

1. [Page Hierarchy & Navigation](#1-page-hierarchy--navigation)
2. [Global Layout Rules](#2-global-layout-rules)
3. [Navigation Bar](#3-navigation-bar)
4. [Hero Section](#4-hero-section)
5. [Features Section](#5-features-section)
6. [How It Works Section](#6-how-it-works-section)
7. [For Candidates Section](#7-for-candidates-section)
8. [For Employers Section](#8-for-employers-section)
9. [Testimonials Section](#9-testimonials-section)
10. [FAQ Section](#10-faq-section)
11. [Final CTA Section](#11-final-cta-section)
12. [Footer](#12-footer)
13. [SEO](#13-seo)
14. [Animations](#14-animations)
15. [Responsive Behaviour](#15-responsive-behaviour)

---

## 1. Page Hierarchy & Navigation

### Site Pages (Phase 5)

| Route | Nav Label | In Top Nav |
|---|---|---|
| `/` | Home | No (logo links here) |
| `/features` | Features | Yes |
| `/about` | About | Yes |
| `/contact` | Contact | Yes |
| `/privacy` | Privacy Policy | Footer only |
| `/terms` | Terms of Service | Footer only |
| `/faq` | FAQ | Footer + /contact |
| `/blog` | Blog | Footer only (placeholder) |

### Primary CTAs by Page

| Page | Primary CTA | Secondary CTA |
|---|---|---|
| `/` (landing) | "Get early access" → `/auth/signup` | "Sign in" → `/auth/login` |
| `/features` | "Get early access" → `/auth/signup` | — |
| `/about` | "Join the waitlist" → `/auth/signup` | — |
| `/contact` | "Send message" (form submit) | — |

---

## 2. Global Layout Rules

- **Max content width:** `max-w-7xl` (1280 px) centered with `mx-auto px-6 lg:px-8`
- **Section vertical padding:** `py-24` desktop, `py-16` mobile
- **Canvas alternation:** Light canvas (`bg-canvas`) → Dark canvas (`bg-canvas-dark`) → Light → Dark. Never two consecutive identical canvases.
- **One primary CTA per section.** No competing calls to action.
- **Cards:** always `rounded-2xl`. No rounded-lg or rounded-xl in marketing pages.
- **No cold grays.** Use `text-foreground`, `text-muted`, `border-border` — not Tailwind's `gray-*`.

---

## 3. Navigation Bar

### Layout

```
[Logo] ──────────── [Features] [About] [Contact] ──────────── [Sign in] [Get early access ▶]
```

- Fixed at top: `sticky top-0 z-50`
- Background: `bg-canvas/80 backdrop-blur-md border-b border-border`
- Height: 64 px
- Logo: `ScouttOpp` wordmark in `text-foreground font-bold`

### Behaviour

| State | Behaviour |
|---|---|
| Scrolled past hero | Background becomes fully opaque |
| Mobile (< lg) | Hamburger menu → slide-down drawer with nav links + CTAs |
| Authenticated user | "Sign in" → "Dashboard"; "Get early access" hidden |

### CTA Buttons

- "Sign in" → `<Button variant="ghost">Sign in</Button>` → `/auth/login`
- "Get early access" → `<Button variant="primary">Get early access</Button>` → `/auth/signup`

---

## 4. Hero Section

### Canvas
Dark canvas (`bg-canvas-dark`)

### Layout
Full-viewport height (`min-h-screen`), vertically centered content, no background image.  
Content column: `max-w-2xl mx-auto text-center`

### Copy

```
EYEBROW (small caps, accent color):
"Creative talent, curated."

HEADLINE (h1, large):
"Where great creative talent
meets the right opportunity."

SUBHEADLINE (text-muted, max-w-lg):
"ScouttOpp is the invite-only platform connecting
vetted designers, art directors, and creative directors
with employers who are ready to hire."

PRIMARY CTA:
[Get early access →]    [Watch how it works ▶]
```

### Visual Element
Right side (desktop split layout at `lg:`): mock candidate card — avatar, name, role badge, specialties tags, "Match score 94%" — subtle glow, slight rotation (`rotate-2`), floating animation.

### Notes
- `h1` font size: `text-5xl lg:text-7xl`, `font-bold`
- Sub-headline: `text-lg text-muted max-w-md mx-auto`
- Eyebrow: `text-xs font-semibold uppercase tracking-widest text-accent`
- CTA row gap: `gap-4`

---

## 5. Features Section

### Canvas
Light canvas (`bg-canvas`)

### Heading

```
EYEBROW: "The platform"
H2: "Everything you need to hire or get hired."
SUBTEXT: "Built for quality over quantity."
```

### Feature Grid
3 columns desktop, 1 column mobile. 6 cards total.

| Icon | Title | Body |
|---|---|---|
| Shield | Vetted talent only | Every candidate is manually reviewed before appearing on the platform. |
| Zap | Fast discovery | Swipe-based interface surfaces the right talent in minutes, not days. |
| Lock | Invite-only | Both sides are verified — employers and candidates are curated. |
| Star | Portfolio-first | Candidates lead with their work, not their CV. |
| Heart | Smart matching | Preferences on both sides surface the most relevant connections. |
| MessageSquare | Direct messaging | When there's a match, conversation starts immediately. |

### Card Design
`rounded-2xl border border-border bg-card p-8`  
Icon: `lucide-react`, `size-6`, in a `rounded-xl bg-accent/10 p-3` wrapper.  
Title: `text-lg font-semibold`  
Body: `text-sm text-muted`

---

## 6. How It Works Section

### Canvas
Dark canvas (`bg-canvas-dark`)

### Heading

```
EYEBROW: "The process"
H2: "Simple. Intentional. Fast."
```

### Two-Column Layout (desktop)

Left tab: **For Candidates** | **For Employers**  
Right: steps change based on active tab

#### For Candidates Steps

1. **Apply via form** — Share your portfolio and background. We review every application.
2. **Get approved** — Our team reviews your work. If it's a fit, you'll receive an invite.
3. **Complete your profile** — Upload your best work, set your preferences, and control your visibility.
4. **Get discovered** — Employers find you. You choose who to engage with.

#### For Employers Steps

1. **Request access** — Tell us about your company and hiring needs.
2. **Get invited** — Once approved, you'll have full access to our candidate pool.
3. **Discover talent** — Browse curated profiles and swipe on candidates that excite you.
4. **Connect and hire** — When there's a match, start the conversation directly.

### Step Design
Numbered step indicator (large `01`, `02`…) in accent colour, left-aligned.  
Title: `font-semibold`  
Body: `text-sm text-muted`  
Steps connected by a vertical line on desktop.

---

## 7. For Candidates Section

### Canvas
Light canvas, full-bleed image or illustration on right

### Copy

```
EYEBROW: "For creatives"
H2: "Your work speaks first."
BODY: "Forget keyword-stuffed CVs. ScouttOpp puts your portfolio front-and-centre.
       Get discovered by employers who are looking for exactly what you do."

BULLET LIST:
✓ One profile, no re-applying
✓ Control your visibility at any time
✓ Only engage when you're ready
✓ No cold outreach — matches come to you

CTA: [Apply as a candidate →]
```

### Visual
Right column: animated profile card mock-up (avatar, role, specialties, portfolio thumbnails).

---

## 8. For Employers Section

### Canvas
Dark canvas, illustration on left

### Copy

```
EYEBROW: "For employers"
H2: "Hire talent you can't find elsewhere."
BODY: "Our candidate pool is hand-selected. Every profile has been reviewed,
       every portfolio verified. You only see talent that's been greenlit."

BULLET LIST:
✓ Pre-vetted candidates only
✓ Filter by role, location, and rate
✓ Swipe to express interest
✓ Message directly when matched

CTA: [Request employer access →]
```

---

## 9. Testimonials Section

### Canvas
Light canvas

### Heading

```
H2: "Trusted by creative teams."
```

### Layout
3-column grid (desktop), 1-column (mobile). Quotes from candidates and employers.

### Card Design
`rounded-2xl border border-border bg-card p-8`

```
"[Quote text]"

[Avatar] [Name]
         [Role] · [Company or "Freelance Creative Director"]
```

### Placeholder Copy (replace with real quotes at launch)

| Quote | Name | Role |
|---|---|---|
| "Within two weeks of joining I had three conversations with brands I'd been trying to reach for years." | Maya R. | Art Director |
| "We found our Head of Design in four days. The quality of candidates is unlike anything on the usual platforms." | James K. | VP Creative, Studio Co. |
| "I love that I control who sees my profile. No spam, no random recruiters — just real opportunities." | Aisha T. | Motion Designer |

---

## 10. FAQ Section

### Canvas
Light canvas

### Heading

```
H2: "Common questions."
```

### Layout
Single column, accordion (expand/collapse). Max-width `max-w-2xl mx-auto`.

### Questions

**For Candidates**

- **How do I apply?** Fill out our application form with your portfolio link. We review every submission.
- **How long does review take?** Usually 3–5 business days. You'll hear from us either way.
- **Is it free to be a candidate?** Yes — ScouttOpp is always free for candidates.
- **Can I hide my profile?** Yes. Toggle "Pause discovery" in your dashboard settings at any time.
- **What roles are listed?** We currently focus on: Art Directors, Creative Directors, Motion Designers, Graphic Designers, UI/UX Designers, Brand Designers, Photographers, and Videographers.

**For Employers**

- **How do I get access?** Request access via our contact form. We'll review and send an invite.
- **Is it free for employers?** We're currently in early access — pricing will be announced soon.
- **How many candidates are there?** Quality over quantity. Every candidate has been individually approved.
- **What if I don't find a match?** We're continuously adding new talent. New candidates are approved every week.

### Accordion Component
Use the `Tabs` or a custom accordion from `components/ui/`. Animate open/close with Framer Motion `AnimatePresence`.

---

## 11. Final CTA Section

### Canvas
Dark canvas with subtle gradient or texture

### Layout
Centred, generous whitespace

### Copy

```
H2: "The right talent is waiting."
BODY: "Join a platform built for quality, not volume.
       Whether you're hiring or looking, ScouttOpp is your edge."

CTA row:
[Get early access →]    [Sign in]
```

---

## 12. Footer

### Canvas
Dark canvas (same as above, no visual break)

### Layout

```
[Logo + tagline]          [Product]        [Company]        [Legal]
ScouttOpp                Features          About            Privacy
"Curated creative         FAQ               Blog             Terms
 talent marketplace."     For Candidates    Contact
                          For Employers

────────────────────────────────────────────────────────────────────
© 2026 ScouttOpp. All rights reserved.    [Twitter] [Instagram] [LinkedIn]
```

### Rules
- Footer links: `text-sm text-muted hover:text-foreground`
- Social icons: `lucide-react` variants, 20 px
- Copyright line: `text-xs text-muted`

---

## 13. SEO

### Root Layout Metadata (`app/(marketing)/layout.tsx`)

```typescript
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
  title: {
    default: 'ScouttOpp — Curated Creative Talent',
    template: '%s | ScouttOpp',
  },
  description: 'The invite-only platform connecting vetted designers, art directors, and creative directors with employers who are ready to hire.',
  openGraph: {
    type: 'website',
    siteName: 'ScouttOpp',
  },
  twitter: {
    card: 'summary_large_image',
  },
}
```

### Per-Page Metadata

Each page exports its own `metadata` object overriding `title` and `description`.

### Sitemap (`app/sitemap.ts`)

```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: '/', changeFrequency: 'monthly', priority: 1 },
    { url: '/features', changeFrequency: 'monthly', priority: 0.8 },
    { url: '/about', changeFrequency: 'monthly', priority: 0.6 },
    { url: '/faq', changeFrequency: 'monthly', priority: 0.6 },
    { url: '/contact', changeFrequency: 'yearly', priority: 0.5 },
    { url: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { url: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  ]
}
```

### Robots (`app/robots.ts`)

```typescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard/', '/api/'] },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  }
}
```

---

## 14. Animations

All animations use existing Framer Motion tokens from `lib/tokens.ts`. Do not introduce new spring configs.

| Element | Animation | Token |
|---|---|---|
| Hero headline | Fade-up on mount | `fadeUp` variant |
| Hero subheadline | Fade-up, 100 ms delay | `fadeUp` + `delay: 0.1` |
| Hero CTA buttons | Fade-up, 200 ms delay | `fadeUp` + `delay: 0.2` |
| Hero candidate card | Float (subtle y-axis loop) | Custom `animate={{ y: [0, -8, 0] }}` repeat |
| Feature cards | Staggered fade-up on scroll | `staggerChildren: 0.08` |
| How It Works steps | Sequential fade-in | `staggerChildren: 0.15` |
| FAQ accordion | Height expand/collapse | `AnimatePresence` + `height: 'auto'` |
| Nav background | Opacity 0 → 1 on scroll | `useScroll` + `useMotionValue` |
| Section entrances | Fade-up when in view | `whileInView` + `viewport={{ once: true }}` |

### Rules

- `viewport={{ once: true }}` — animate once, no repeat on scroll back
- Reduced-motion: wrap every motion component with `useReducedMotion()` check
- No jank: avoid animating `height` on large containers. Use `max-height` trick or `layout` prop.

---

## 15. Responsive Behaviour

| Breakpoint | Key Changes |
|---|---|
| `< sm` (375–639 px) | Single column throughout. Nav → hamburger drawer. Hero → no split, card mock hidden. |
| `sm–lg` (640–1023 px) | 2-column feature grid. Hero still single-column. |
| `lg+` (1024 px+) | Hero: left text + right card. 3-column feature grid. How-It-Works: tab panel layout. |

### Mobile-First Rules

- Build mobile-first (`sm:`, `lg:` breakpoints add complexity, don't fight defaults)
- Touch targets minimum 44 × 44 px
- Font sizes: body `text-base` (16 px minimum), never below 14 px in marketing copy
- Tap targets on FAQ accordion: full-width rows, not icon-only toggles
