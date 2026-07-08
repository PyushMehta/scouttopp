# ScouttOpp — Landing Page UX Specification
### Complete UI/UX Blueprint for Phase 5

> **Document type:** Product design specification. No code in this file.  
> **Status:** Ready for implementation. Supersedes `docs/LANDING_PAGE.md` for the `/` landing page.  
> **Design references:** Linear, Vercel, Raycast, Framer — dark-first, premium, minimal, highly animated.  
> **Last updated:** 2026-07-01

---

## Table of Contents

1. [Site Architecture](#1-site-architecture)
2. [Visual Design System — Marketing Layer](#2-visual-design-system--marketing-layer)
3. [Section 01 — Navigation Bar](#3-section-01--navigation-bar)
4. [Section 02 — Hero](#4-section-02--hero)
5. [Section 03 — Trust Bar](#5-section-03--trust-bar)
6. [Section 04 — Problem](#6-section-04--problem)
7. [Section 05 — Solution](#7-section-05--solution)
8. [Section 06 — How ScouttOpp Works](#8-section-06--how-scouttopp-works)
9. [Section 07 — Candidate Journey](#9-section-07--candidate-journey)
10. [Section 08 — Employer Journey](#10-section-08--employer-journey)
11. [Section 09 — Feature Showcase](#11-section-09--feature-showcase)
12. [Section 10 — Platform Preview](#12-section-10--platform-preview)
13. [Section 11 — Statistics](#13-section-11--statistics)
14. [Section 12 — Testimonials](#14-section-12--testimonials)
15. [Section 13 — Early Access](#15-section-13--early-access)
16. [Section 14 — FAQ](#16-section-14--faq)
17. [Section 15 — Final CTA](#17-section-15--final-cta)
18. [Section 16 — Footer](#18-section-16--footer)
19. [Component Library](#19-component-library)
20. [Motion Design Specification](#20-motion-design-specification)
21. [Responsive Behaviour](#21-responsive-behaviour)
22. [SEO Specification](#22-seo-specification)
23. [Performance Specification](#23-performance-specification)
24. [Complete Copywriting Reference](#24-complete-copywriting-reference)

---

## 1. Site Architecture

### 1.1 Page Hierarchy

```
scouttopp.com/
├── /                    LANDING PAGE    ← This document
├── /features            FEATURES
├── /about               ABOUT
├── /contact             CONTACT
├── /faq                 FAQ
├── /privacy             PRIVACY POLICY
├── /terms               TERMS OF SERVICE
└── /blog                BLOG (placeholder index — no posts at launch)
```

All pages share:
- `app/(marketing)/layout.tsx` — `MarketingNav` + `MarketingFooter`
- Dark default canvas; specific sections alternate to light
- Same font, same token system as the app

### 1.2 CTA Hierarchy — Sitewide

Every page has exactly ONE primary CTA. The rule from the design system applies here: one `variant="primary"` per visible viewport section.

| Surface | Primary CTA | Label | Destination |
|---|---|---|---|
| Nav bar | Right | "Get early access" | `/auth/signup` |
| Hero | Center | "Apply as a candidate" | `/auth/signup?role=candidate` |
| Candidate section | Inline | "Apply as a candidate" | `/auth/signup?role=candidate` |
| Employer section | Inline | "Request employer access" | `/contact?type=employer` |
| Early Access | Per audience | "Apply as a candidate" / "Request employer access" | varies |
| Final CTA | Center | "Join ScouttOpp" | `/auth/signup` |

Secondary CTAs (ghost/outline) are always one step below primary in visual weight.

### 1.3 Navigation — Desktop

```
┌────────────────────────────────────────────────────────────────────────────┐
│  ◈ ScouttOpp          Features   About   Contact       Sign in  [Get early access →] │
└────────────────────────────────────────────────────────────────────────────┘
```

- Height: 64px
- Sticky, `position: sticky; top: 0; z-index: 50`
- Initial state: `background: transparent`
- Scrolled state (> 80px from top): `background: rgba(10, 10, 10, 0.85); backdrop-filter: blur(20px) saturate(180%); border-bottom: 1px solid rgba(255,255,255,0.06)`
- Transition: opacity + backdrop-blur over 200ms

### 1.4 Navigation — Mobile (< 768px)

```
┌──────────────────────────────────┐
│  ◈ ScouttOpp              ☰     │
└──────────────────────────────────┘
```

Hamburger icon opens a **full-screen overlay drawer** (not a side sheet):
- Slides down from top, `y: -20 → 0`, opacity 0 → 1, duration 250ms
- Background: `rgba(10, 10, 10, 0.97)` + backdrop blur
- Nav links stacked, `text-2xl font-bold`, 48px min tap height
- CTA buttons full-width, stacked
- Close: tap outside, swipe up, or ✕ icon top-right

### 1.5 Footer — Site Map

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ◈ ScouttOpp            Product        Company   Legal    │
│  The creative talent     Features       About     Privacy  │
│  marketplace built       FAQ            Blog      Terms    │
│  on intention.           For Creatives  Contact            │
│                          For Employers                      │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│  © 2026 ScouttOpp. All rights reserved.    𝕏  IG  in   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Canvas: dark. Font: `text-sm`. Link color: `text-muted hover:text-foreground`.

---

## 2. Visual Design System — Marketing Layer

This section extends `docs/DESIGN_SYSTEM.md` with marketing-specific tokens. These do NOT override the existing system — they augment it for the `(marketing)` route group only.

### 2.1 Color Usage on the Marketing Site

The marketing site alternates between three canvas states:

| Canvas State | Background | Used In |
|---|---|---|
| **Dark default** | `#0A0A0A` (`bg-background`) | Hero, Solution, Features, Preview, Statistics, Early Access, Final CTA, Footer |
| **Elevated dark** | `#111111` (`bg-surface`) | Trust bar, How It Works (dark tab) |
| **Light warm** | `#FDFAF6` (`bg-background [data-color-scheme="light"]`) | Problem, Candidate Journey, Testimonials, FAQ |

Every canvas transition should be visually intentional — not abrupt. Use a `div` with `data-color-scheme` to trigger the CSS variable swap. No Tailwind hardcoded background colors.

### 2.2 Gradient System — Marketing Exclusive

These gradients are created inline with `style={}` because they don't swap between canvases.

| Name | Value | Used In |
|---|---|---|
| `gradient-primary` | `linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)` | CTA buttons, hero accent elements |
| `gradient-hero-orb` | `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124, 58, 237, 0.15) 0%, transparent 70%)` | Hero background atmosphere |
| `gradient-card-shine` | `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%)` | Card top-edge shine effect |
| `gradient-section-fade` | `linear-gradient(to bottom, transparent 0%, rgba(10,10,10,0.8) 100%)` | Fade between sections |
| `gradient-text` | `linear-gradient(135deg, #FFFFFF 0%, #A78BFA 100%)` | Gradient text on hero headline |
| `gradient-feature-glow` | `radial-gradient(ellipse 60% 40% at 50% 100%, rgba(124,58,237,0.2) 0%, transparent 70%)` | Feature card hover |

### 2.3 Glassmorphism Usage Rules

Glassmorphism is used sparingly on dark sections only. Never on light canvas.

**Allowed uses:**
- Nav bar on scroll: `rgba(10,10,10,0.85)` + `backdrop-filter: blur(20px) saturate(180%)`
- Feature cards (hover state): `rgba(255,255,255,0.04)` + `backdrop-filter: blur(8px)`
- Platform preview overlay badge: `rgba(10,10,10,0.7)` + `backdrop-filter: blur(12px)`
- Testimonial cards: `rgba(255,255,255,0.03)` + subtle border `rgba(255,255,255,0.08)`

**Forbidden uses:**
- Light canvas sections (too busy against warm backgrounds)
- Full-page overlays (too heavy, impedes content)
- More than 3 glassmorphic elements per visible viewport

### 2.4 Border System — Marketing

| Type | Value | Usage |
|---|---|---|
| `border-subtle` | `1px solid rgba(255,255,255,0.06)` | Card borders on dark canvas |
| `border-medium` | `1px solid rgba(255,255,255,0.10)` | Active/hover card borders |
| `border-accent` | `1px solid rgba(124,58,237,0.3)` | Accent-highlighted cards |
| `border-light` | `1px solid rgba(0,0,0,0.08)` | Borders on light canvas (= `border-border` in light mode) |
| `border-glow` | `1px solid rgba(124,58,237,0.5)` + shadow: `0 0 12px rgba(124,58,237,0.2)` | Primary CTA hover border |

### 2.5 Elevation / Shadow — Marketing

| Name | Value | Used for |
|---|---|---|
| `shadow-card` | `0 1px 1px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)` | Cards on dark canvas |
| `shadow-card-hover` | `0 4px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)` | Card hover state |
| `shadow-glow-primary` | `0 0 40px rgba(124,58,237,0.25), 0 0 80px rgba(124,58,237,0.1)` | Hero CTA button / accent elements |
| `shadow-float` | `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)` | Floating UI mockup in hero |
| `shadow-light` | `0 1px 3px rgba(43,56,117,0.08), 0 4px 12px rgba(43,56,117,0.06)` | Cards on light canvas |
| `shadow-light-hover` | `0 4px 24px rgba(43,56,117,0.14), 0 0 0 1px rgba(43,56,117,0.1)` | Card hover on light canvas |

### 2.6 Typography — Marketing Scale

The design system type scale goes to `text-5xl` (48px). The marketing site extends this:

| Name | Size | Weight | Line-height | Usage |
|---|---|---|---|---|
| `display-2xl` | `6rem / 96px` | 800 ExtraBold | 1.0 | Hero h1 on desktop |
| `display-xl` | `4.5rem / 72px` | 800 ExtraBold | 1.05 | Hero h1 on laptop |
| `display-lg` | `3.5rem / 56px` | 800 ExtraBold | 1.1 | Hero h1 on tablet; section h2 desktop |
| `display-md` | `2.5rem / 40px` | 800 ExtraBold | 1.15 | Section h2 on laptop |
| `display-sm` | `2rem / 32px` | 800 ExtraBold | 1.2 | Section h2 on mobile |
| `eyebrow` | `0.75rem / 12px` | 600 SemiBold | 1.5 | Section eyebrows — ALL CAPS + letter-spacing |

Eyebrow style: `text-xs font-semibold uppercase tracking-widest text-primary` (purple on dark, navy on light)

### 2.7 Spacing — Marketing Sections

| Token | Value | Usage |
|---|---|---|
| `section-y` | `py-32 lg:py-40` | Standard section vertical padding |
| `section-y-sm` | `py-20 lg:py-24` | Compact sections (Trust Bar, Stats) |
| `section-x` | `px-6 sm:px-8 lg:px-12` | Section horizontal padding |
| `content-max` | `max-w-7xl mx-auto` | All content containers |
| `copy-max` | `max-w-2xl mx-auto` | Centered copy blocks (hero, section headers) |
| `eyebrow-mb` | `mb-4` | Space between eyebrow and h2 |
| `h2-mb` | `mb-6` | Space between h2 and subtext |
| `subtext-mb` | `mb-12 lg:mb-16` | Space between subtext and section content |
| `card-gap` | `gap-6` | Grid gap between cards |
| `card-gap-lg` | `gap-8` | Wider grid gap for feature showcase |

### 2.8 Grid — Marketing

| Context | Columns | Gap |
|---|---|---|
| Feature cards (6 up) | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` | `gap-6` |
| Journey steps (3 up) | `grid-cols-1 md:grid-cols-3` | `gap-8` |
| Stats (4 up) | `grid-cols-2 lg:grid-cols-4` | `gap-6` |
| Testimonials (3 up) | `grid-cols-1 md:grid-cols-3` | `gap-6` |
| Early Access (2 up) | `grid-cols-1 md:grid-cols-2` | `gap-6` |
| Problem pain points (3 up) | `grid-cols-1 md:grid-cols-3` | `gap-6` |
| Footer columns (4 up) | `grid-cols-2 lg:grid-cols-4` | `gap-8 lg:gap-12` |

### 2.9 Border Radius — Marketing

All marketing cards: `rounded-2xl` (24px) — hard rule from design system.  
Small badges, tags: `rounded-full`.  
Image containers inside cards: `rounded-xl`.  
Platform preview UI mockup: `rounded-2xl`.  
Nav bar: no border radius.  
CTA buttons: `rounded-full` for primary marketing CTAs (more pill-shaped than app buttons).

### 2.10 Icon System

All icons: `lucide-react`. Marketing-specific sizing:

| Context | Size | Stroke |
|---|---|---|
| Feature card icons | `size-6` (24px) | default (1.5) |
| Icon in colored container | `size-5` (20px) | default |
| Footer / nav | `size-5` (20px) | default |
| Testimonial "quote" | `size-8` (32px) | 1 (lighter) |
| Journey step checkmark | `size-4` (16px) | 2 (bolder) |

Icon containers on dark canvas: `w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center`  
Icon containers on light canvas: `w-12 h-12 rounded-xl bg-navy/8 flex items-center justify-center`

---

## 3. Section 01 — Navigation Bar

### Wireframe

```
Desktop (1280px):
┌──────────────────────────────────────────────────────────────────────────────────┐
│  16px │ ◈ ScouttOpp │           40px gap           │ Features About Contact │ 32px │ Sign in │ 12px │ [Get early access →] │ 16px │
└──────────────────────────────────────────────────────────────────────────────────┘
     ↑ sticky top, 64px height, transparent initially

Mobile (375px):
┌────────────────────────────────────┐
│  16px │ ◈ ScouttOpp │        ☰   │ 16px │
└────────────────────────────────────┘
```

### Spacing

- Container: `max-w-7xl mx-auto px-6 lg:px-8`
- Inner: `flex items-center justify-between h-16`
- Nav links: `hidden lg:flex items-center gap-8`
- Right section: `flex items-center gap-3`

### Logo

- Text-based: `ScouttOpp` in `font-bold text-foreground`
- Prefix symbol: a small custom `◈` or rounded square glyph in `text-primary`
- OR: SVG logomark (to be designed separately)
- Do NOT use an image file for the logo — use SVG inline or text

### Nav Links

```
Features  About  Contact
```

Style: `text-sm font-medium text-muted hover:text-foreground transition-colors duration-150`  
Active page: `text-foreground`  
No underlines. No borders. Hover only changes color.

### CTA Buttons

- "Sign in": `variant="ghost" size="sm"` → `text-sm text-muted hover:text-foreground`
- "Get early access": pill-shaped, gradient background

```css
/* Primary marketing CTA — pill variant */
background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
border-radius: 9999px;
padding: 8px 20px;
font-size: 14px;
font-weight: 600;
color: white;
box-shadow: 0 0 20px rgba(124, 58, 237, 0.3);
transition: all 200ms ease;

/* Hover */
box-shadow: 0 0 32px rgba(124, 58, 237, 0.5);
transform: translateY(-1px);
```

### Scroll Behaviour

Listen to `useScroll` from Framer Motion. When `scrollY > 80`:
- Apply `bg-[rgba(10,10,10,0.85)] backdrop-blur-xl border-b border-white/5`
- Animate with `motion.div` `animate={{ backdropFilter: ... }}` — but simpler: toggle a CSS class

Implementation note: Use `useEffect` + `useState` for scroll detection. Toggle `scrolled` class. All styling via CSS. Avoid Framer Motion for the nav background transition (not worth the overhead).

### Animation

- Entry: nav fades in from top on page load, `y: -8 → 0`, delay 0ms, duration 300ms
- Links: no animation on hover, just color transition via CSS

---

## 4. Section 02 — Hero

### Canvas: Dark default (`bg-background = #0A0A0A`)

### Purpose
First impression. Communicate the product in under 5 seconds. Two audiences (candidates and employers) must both immediately see themselves.

### Wireframe — Desktop (1280px)

```
┌──────────────────────────────────────────────────────────────────────┐
│                   [NAV BAR — transparent]                            │
│                                                                      │
│    [ambient purple glow orb — top center, 600px radius]             │
│                                                                      │
│                ┌─────────── EYEBROW ───────────┐                   │
│                │  ✦ Invite-only · Est. 2026     │                   │
│                └───────────────────────────────┘                   │
│                                                                      │
│         Talent this good doesn't                                    │
│         come from a job board.                                      │
│                                                                      │
│         The invitation-only hiring platform for                      │
│         creative professionals. Vetted candidates.                  │
│         Intentional employers. Zero noise.                          │
│                                                                      │
│         [Apply as a candidate →]    [How it works ▶]               │
│                                                                      │
│                      ↓ scroll                                       │
│                                                                      │
│                          [FLOATING UI MOCKUP — 3D tilted]          │
│                          ┌──────────────────────────┐              │
│                          │  CANDIDATE CARD          │              │
│                          │  ●●  Maya R.             │              │
│                          │  Art Director            │              │
│                          │  London · Remote         │              │
│                          │  ◗ Brand  ◗ Motion ◗ UI │              │
│                          │  ─────────────────────  │              │
│                          │  [×] Pass   [♥] Like    │              │
│                          └──────────────────────────┘              │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
Height: 100vh minimum, content centered vertically
```

### Layout — Desktop

Two-column split at `lg:`:
- Left column: `lg:w-1/2` — all text content, left-aligned
- Right column: `lg:w-1/2` — floating UI mockup

On mobile: single column, centered. Mockup below copy, at 80% scale.

Content column internal spacing:
- Eyebrow badge: `mb-6`
- H1: `mb-6`
- Subheadline: `mb-10`
- CTA row: `gap-4`
- Below CTA: `mt-16` → scroll hint (chevron, gentle bounce)

### Copy

```
EYEBROW BADGE:
"✦ Invitation only"

H1 (3 lines on desktop, 4 on mobile):
"Talent this good
doesn't come from
a job board."

SUBHEADLINE (max-w-md):
"ScouttOpp is the invitation-only hiring platform
for creative professionals. Every candidate is
manually reviewed. Every employer is intentional."

CTA ROW:
[Apply as a candidate →]   [See how it works]

SCREEN READER ONLY (h2 below fold):
"Creative hiring platform for designers, art directors,
and employers who care about quality."
```

### Typography

```
H1:
  font-size: clamp(2.5rem, 5vw, 6rem)  /* 40px → 96px */
  font-weight: 800
  line-height: 1.0
  letter-spacing: -0.03em
  color: #FFFFFF

  Gradient treatment on last word of each line:
  "job board." → text with gradient-text style
  Implementation: <span className="bg-clip-text text-transparent"
                         style={{background: 'linear-gradient(135deg, #FFFFFF 0%, #A78BFA 100%)'}}>
                    board.
                  </span>

SUBHEADLINE:
  font-size: 1.125rem  /* 18px */
  font-weight: 400
  line-height: 1.7
  color: #9CA3AF  (text-muted)

EYEBROW BADGE:
  font-size: 0.75rem  /* 12px */
  font-weight: 600
  letter-spacing: 0.08em
  text-transform: uppercase
  color: #A78BFA  (text-secondary)
```

### Eyebrow Badge Component

```
Style: inline-flex, rounded-full
Background: rgba(124, 58, 237, 0.1)
Border: 1px solid rgba(124, 58, 237, 0.25)
Padding: 6px 14px
```

### CTA Buttons

Primary: "Apply as a candidate →"
- Pill shape: `rounded-full`
- Background: `linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)`
- Padding: `px-7 py-3.5`
- Font: `text-sm font-semibold text-white`
- Shadow: `shadow-glow-primary`
- Hover: lift `translateY(-2px)` + shadow intensity +30%
- Active: `scale: 0.98`

Secondary: "See how it works"
- Ghost style: `rounded-full border border-white/10`
- Background: transparent
- Hover: `border-white/20 bg-white/4`
- Has `▶` play icon inline (points to scroll or opens a modal video)

### Background Atmosphere

```
Layer 1 (bottommost): bg-background (#0A0A0A)
Layer 2: Radial gradient orb, top-center
  position: absolute, top: -200px, left: 50%, transform: translateX(-50%)
  width: 800px, height: 600px
  background: radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)
  pointer-events: none

Layer 3: Subtle noise texture (optional)
  background-image: url('/noise.png') — very low opacity (0.03)
  This adds micro-texture to avoid flat black feeling

Layer 4: Grid lines (optional, à la Linear)
  SVG background: 1px lines at 40px intervals
  color: rgba(255,255,255,0.02)
  Fades out toward edges with radial gradient mask
```

### Floating UI Mockup (Hero Right Column)

The mockup is a fake swipe card — NOT an actual screenshot. It communicates the core product gesture instantly.

```
Structure:
┌─────────────────────────────────────────────┐
│  CANDIDATE CARD (280 × 360px on desktop)    │
│  Rounded-2xl                                │
│  Background: rgba(24,24,24,0.9)             │
│  Border: 1px solid rgba(255,255,255,0.08)   │
│  Shadow: shadow-float                        │
│  Transform: rotate(-2deg) on desktop         │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  Avatar (56px circle)                │  │
│  │  ● Maya R.                           │  │
│  │  Art Director                        │  │
│  │  London · Remote                     │  │
│  ├──────────────────────────────────────┤  │
│  │  [Brand] [Motion] [UI/UX]           │  │
│  ├──────────────────────────────────────┤  │
│  │  4 portfolio thumbnails (2×2 grid)  │  │
│  ├──────────────────────────────────────┤  │
│  │    [✕ Pass]        [♥ Like]         │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

Card animation: floating — `animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}`

Second card (partially visible, behind and below):
- `rotate(3deg) translateY(16px) translateX(20px)`
- Lower opacity: `opacity-40`
- This implies a deck/stack

### Animation — Hero Entry Sequence

All elements use `fadeUpVariants` from `lib/tokens.ts` with staggered delay:

| Element | Delay | Duration |
|---|---|---|
| Eyebrow badge | 0ms | 400ms |
| H1 (first line) | 80ms | 400ms |
| H1 (second line) | 160ms | 400ms |
| H1 (third line) | 240ms | 400ms |
| Subheadline | 360ms | 400ms |
| CTA row | 480ms | 400ms |
| Floating card mockup | 600ms | 600ms (with spring) |
| Background orb | 0ms | 800ms (fade only) |

Note: H1 lines animate individually via a `<AnimatePresence>` child-stagger approach. Each `<span>` wrapping a line gets its own `motion.span` with `display: block`.

### Scroll Indicator

A small animated chevron-down or custom arrow below the CTA row:
- `mt-20` from CTAs
- Opacity 60%
- Animation: `animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}`
- Disappears on scroll (`opacity: 0` via scroll listener)

---

## 5. Section 03 — Trust Bar

### Canvas: `bg-surface (#111111)` — slightly elevated from hero

### Purpose
Social proof. Employers and talent from recognisable names provides instant credibility.

### Wireframe

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│   Trusted by creative teams at                       │
│                                                      │
│   WIEDEN+   MOTHER   R/GA   DROGA5   BBDO   UNIT9   │
│                                                      │
└──────────────────────────────────────────────────────┘
Padding: py-12
```

### Copy

```
PRE-TEXT (text-xs uppercase tracking-widest text-muted):
"Trusted by creative teams at"

LOGOS (6 companies):
Wieden+Kennedy · Mother London · R/GA · Droga5 · BBDO · Unit9
```

Note: At launch, use typographic logos (company name in a consistent font weight) rather than image files — easier to maintain, no image licensing issues.

### Layout

`flex flex-wrap items-center justify-center gap-x-12 gap-y-6`

Each logo: `text-muted font-semibold text-sm tracking-wider opacity-60 hover:opacity-100 transition-opacity`

### Animation

Entry: horizontal scroll marquee on mobile only. On desktop: static.  
Marquee: CSS animation `@keyframes marquee`, `animation: marquee 20s linear infinite`.

---

## 6. Section 04 — Problem

### Canvas: Light warm (`data-color-scheme="light"`, `bg-background = #FDFAF6`)

### Purpose
Articulate the pain. Every visitor should read the first sentence and think "yes, exactly."

### Wireframe

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ▪ THE PROBLEM                                              │
│                                                              │
│  Creative hiring hasn't                                     │
│  evolved in twenty years.                                   │
│                                                              │
│  The industry runs on keyword-filtered CVs,                 │
│  referral chains, and gut instinct. The people              │
│  doing the hiring are overwhelmed. The people               │
│  worth hiring are invisible.                                │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ 😮 NOISE   │  │ 🔎 INVISIBLE│  │ ⏱ SLOW     │        │
│  │             │  │             │  │             │        │
│  │ 200+ apps  │  │ Best talent │  │ 6-week      │        │
│  │ per job    │  │ isn't on    │  │ hiring      │        │
│  │ post       │  │ job boards  │  │ cycles      │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Copy

```
EYEBROW:
"The problem"

H2:
"Creative hiring hasn't
evolved in twenty years."

BODY (max-w-xl, left-aligned on desktop):
"The industry runs on keyword-filtered CVs, referral chains, and
luck. The people doing the hiring are overwhelmed with applications
that don't fit. The people worth hiring are invisible to the
companies that need them.

There's a better way."

PAIN POINT CARDS:
1. Title: "Signal buried in noise"
   Body: "200+ applications per job post. 95% of them irrelevant. Hours lost
          reading CVs when you could be seeing portfolios."

2. Title: "The best talent isn't looking"
   Body: "Top-tier creatives aren't scrolling job boards. They're working.
          They're only reachable through platforms built for them."

3. Title: "Process built for compliance"
   Body: "Sourcing, screening, ATS, interviews, offers. A six-week process
          for a role you needed filled last month."
```

### Pain Point Cards

Style (light canvas):
```
border: 1px solid rgba(0,0,0,0.08)
background: #FFFFFF
border-radius: 24px
padding: 32px
```

Icon: `lucide-react`, 24px, in an `rounded-xl bg-navy/5 p-3` container  
Title: `text-base font-semibold text-foreground`  
Body: `text-sm text-muted leading-relaxed`

Hover: `shadow-light-hover`, border tightens to `rgba(43,56,117,0.12)`, `translateY(-4px)`

### Animation

Section entry: `whileInView`, `once: true`, `viewport: { margin: "-100px" }`  
H2: `fadeUpVariants`, delay 0ms  
Body: `fadeUpVariants`, delay 100ms  
Cards: stagger `0.1s` each, `fadeUpVariants`

---

## 7. Section 05 — Solution

### Canvas: Dark default

### Purpose
The pivot. From problem to solution in one sharp turn. Short. Declarative.

### Wireframe

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                   ▪ THE SOLUTION                            │
│                                                              │
│              We built something different.                   │
│                                                              │
│    Not a job board. Not an agency. Not an ATS.             │
│    A curated platform where quality is the filter.          │
│                                                              │
│  ┌───────────────────┐   ┌───────────────────┐             │
│  │ OLD WAY           │   │ SCOUTTOPP         │             │
│  │                   │   │                   │             │
│  │ CV-first          │ → │ Portfolio-first   │             │
│  │ Open applications │   │ Invite-only       │             │
│  │ 200 candidates    │   │ Vetted candidates │             │
│  │ 6-week process    │   │ Days, not months  │             │
│  │ Algorithm-driven  │   │ Intention-driven  │             │
│  └───────────────────┘   └───────────────────┘             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Copy

```
EYEBROW:
"The solution"

H2:
"We built something
different."

SUBHEADLINE:
"Not a job board. Not a recruiter. Not an algorithm.
A platform where quality is the only filter."

COMPARISON LABEL — LEFT:
"The old way"

COMPARISON LABEL — RIGHT:
"ScouttOpp"

COMPARISON ROWS:
CV-first hiring          → Portfolio-first discovery
Anyone can apply         → Invitation-only candidates
Hundreds of applicants   → A curated, vetted pool
Six-week hiring cycles   → First match within days
Algorithm-ranked results → Intention-driven matching
```

### Comparison Component

Two cards side-by-side, with `→` arrow between:

Left card (old way):
```
background: rgba(255,255,255,0.03)
border: 1px solid rgba(255,255,255,0.06)
border-radius: 24px
padding: 32px
```

Each row in the left card: `text-sm text-muted`, with a subtle ✕ icon prefix in `text-destructive/50`

Right card (ScouttOpp):
```
background: rgba(124,58,237,0.06)
border: 1px solid rgba(124,58,237,0.2)
border-radius: 24px
padding: 32px
box-shadow: 0 0 40px rgba(124,58,237,0.08)
```

Each row in the right card: `text-sm text-foreground font-medium`, with ✓ icon in `text-primary`

### Animation

Arrow between cards: small `→` icon with `animate={{ x: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}`  
Cards: left card fades from left, right card fades from right. Use `x: -24 → 0` and `x: 24 → 0`.

---

## 8. Section 06 — How ScouttOpp Works

### Canvas: Dark, elevated slightly to `bg-surface (#111111)`

### Purpose
Explain the product mechanism in one clear sequence. Two audiences need different explanations — use a tab switcher.

### Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│            ▪ HOW IT WORKS                                       │
│                                                                  │
│      Simple on the surface.                                      │
│      Deliberate underneath.                                      │
│                                                                  │
│      ┌──────────────────┬──────────────────┐                   │
│      │  For Candidates  │  For Employers   │                   │
│      └──────────────────┴──────────────────┘                   │
│      [active tab underline slides between tabs]                  │
│                                                                  │
│  ── FOR CANDIDATES ────────────────────────────────────────── ──│
│                                                                  │
│  ①────────────────────────────────────────────────────②        │
│  ↓                                                    ↓         │
│  Apply                Get            Build           Get        │
│  with your            vetted         your            discovered │
│  portfolio            in days        profile                     │
│                                                                  │
│  Each step has a short description below it.                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Copy

```
EYEBROW:
"How it works"

H2:
"Simple on the surface.
Deliberate underneath."

TABS:
Tab 1: "For Candidates"
Tab 2: "For Employers"

──── FOR CANDIDATES ────

Step 1 — Apply
Title: "Apply with your portfolio"
Body: "Tell us who you are and what you do. Share your best work. 
       We review every application — no filtering algorithms, no keyword matching."

Step 2 — Get vetted
Title: "We review your work"
Body: "Our team assesses quality, craft, and fit. If you're a match, 
       you'll receive a personal invite within a few days."

Step 3 — Build your profile
Title: "Set up your profile"
Body: "Upload your portfolio, set your work preferences, and control 
       exactly who can see you. You're in control."

Step 4 — Get discovered
Title: "Employers find you"
Body: "Once you're live, employers in your field can discover your work. 
       You'll be notified when there's a match."

──── FOR EMPLOYERS ────

Step 1 — Request access
Title: "Request employer access"
Body: "Tell us about your company and the kind of talent you're looking for. 
       Access is granted to companies we believe will respect the talent pool."

Step 2 — Get approved
Title: "We onboard you personally"
Body: "Once approved, you'll receive an invite to the platform. 
       No self-serve sign-up — intentional access only."

Step 3 — Discover talent
Title: "Swipe through curated profiles"
Body: "Browse pre-vetted candidates. Swipe to like, pass, or super-like. 
       Filters let you narrow by role, location, and rate."

Step 4 — Match and connect
Title: "Start the conversation"
Body: "When there's mutual interest, you're connected directly. 
       No recruitment intermediaries. No agency fees."
```

### Tab Component

- Two tabs, full-width on mobile, auto-width on desktop centered
- Active indicator: a pill or underline that slides between tabs
- Implementation: use `motion.div` with `layoutId="tab-indicator"` for the sliding underline
- Tab transition: content fades out/in, `AnimatePresence mode="wait"`

### Step Layout

Horizontal on desktop (`md:`), vertical on mobile.  
Each step:
- Number: `text-5xl font-extrabold text-primary/20` (large ghost number, behind content)
- Icon: `size-5`, in `rounded-full bg-primary/10 p-2`
- Title: `text-base font-semibold`
- Body: `text-sm text-muted leading-relaxed`
- Connector line between steps: `1px solid rgba(255,255,255,0.08)` horizontal dashes

### Animation

Tab switch: `AnimatePresence mode="wait"`, content `x: 20 → 0` (candidate) or `x: -20 → 0` (employer)  
Steps: stagger `0.1s` on tab enter  
Number: counts up from 0 to the step number on entry (counter animation, optional)

---

## 9. Section 07 — Candidate Journey

### Canvas: Light warm

### Purpose
Speak directly to the candidate. Make the path feel achievable and the outcome feel aspirational.

### Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ▪ FOR CREATIVES                                                │
│                                                                  │
│  Your work                                                       │
│  speaks first.                                                   │
│                                                                  │
│  Stop adapting your portfolio to keyword-filtered               │
│  job descriptions. On ScouttOpp, employers come                 │
│  to you — based on the quality of your craft.                   │
│                                                                  │
│  ✓ One profile. No re-applying.                                 │
│  ✓ Pause your visibility any time.                              │
│  ✓ Only engage when you're ready.                               │
│  ✓ No cold recruiter outreach.                                  │
│                                                                  │
│  [Apply as a candidate →]                                       │
│                                                                  │
│  [RIGHT SIDE: Animated profile card at 70% width]               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Layout

Two-column split at `lg:`:
- Left: copy (max-w-lg)
- Right: animated UI mockup — a profile/portfolio thumbnail grid

### Copy

```
EYEBROW:
"For creatives"

H2:
"Your work speaks first."

BODY:
"Stop adapting your portfolio to keyword-filtered job descriptions. 
On ScouttOpp, employers come to you — based on the quality of your craft, 
not a CV template."

BENEFIT LIST (checkmarks):
✓ One profile, no re-applying every time
✓ Control who can see your work
✓ Pause your visibility whenever you need to
✓ Notifications only when it's a real match
✓ No cold outreach, no agency middlemen

CTA:
"Apply as a candidate →"
→ /auth/signup?role=candidate
```

### Benefit List Style

Each item:
```
display: flex
align-items: flex-start
gap: 12px

icon: CheckCircle from lucide-react, size-4, color: #2D8A5E (brand-success)
text: text-sm font-medium text-foreground
```

### Right Column Mockup

A stylized profile card on light canvas:
```
background: #FFFFFF
border: 1px solid rgba(0,0,0,0.08)
border-radius: 24px
padding: 24px
shadow: shadow-light
width: ~340px

Contents:
- Avatar (72px) + name + role + location + pronouns
- Specialties row: [Art Direction] [Brand] [Motion]
- Portfolio thumbnail grid (4 items, 2×2, rounded-xl)
- Status badge: "● Available from August" (green dot)
- Discovery status: "👁 Profile visible to employers"
```

---

## 10. Section 08 — Employer Journey

### Canvas: Dark default

### Purpose
Mirror the candidate section. Speak to employers differently — position them as discerning buyers, not harried recruiters.

### Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  [LEFT: Animated swipe UI mockup]           ▪ FOR EMPLOYERS    │
│                                                                  │
│                                Hire talent you                  │
│                                can't find elsewhere.            │
│                                                                  │
│                                Our candidate pool is by         │
│                                invitation only. Every profile   │
│                                has been individually reviewed.  │
│                                                                  │
│                                ✓ Pre-vetted candidates only     │
│                                ✓ Filter by role, rate, location │
│                                ✓ Swipe to express interest      │
│                                ✓ Message directly when matched  │
│                                ✓ No agency fees                 │
│                                                                  │
│                                [Request employer access →]      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Layout

Two-column split: LEFT mockup, RIGHT copy. Reverses the candidate section layout.

### Copy

```
EYEBROW:
"For employers"

H2:
"Hire talent you
can't find elsewhere."

BODY:
"Our candidate pool is invitation-only. Every profile has been individually
reviewed before it ever appears on the platform. You're not searching through
noise — you're choosing from signal."

BENEFIT LIST:
✓ Every candidate manually vetted
✓ Portfolio-first — see the work before the CV
✓ Filter by role, location, rate, and availability
✓ Direct connection on match — no intermediaries
✓ No placement fees, no agency contracts

CTA:
"Request employer access →"
→ /contact?type=employer
```

### Left Column Mockup

A simplified swipe interface:
```
background: rgba(18,18,18,0.9)
border: 1px solid rgba(255,255,255,0.08)
border-radius: 24px
padding: 20px
shadow: shadow-float
width: ~320px

Shows:
- Stack of 2-3 cards (peeking effect)
- Top card: avatar + name + role + specialties
- Action buttons: [✕] [♥] [★]
- Small "12 new candidates" badge top-right
```

Card stack animation: `rotate(-3deg)` on card 2, `rotate(-6deg)` on card 3. Float animation.

---

## 11. Section 09 — Feature Showcase

### Canvas: Dark default

### Purpose
The detailed feature argument. 6 features shown in a grid with icons, titles, and descriptions.

### Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                    ▪ THE PLATFORM                                    │
│                                                                      │
│          Everything you need to hire                                 │
│          or get hired — with intention.                              │
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│  │ [⊗] Vetted    │  │ [⚡] Fast      │  │ [◈] Invite-   │        │
│  │     Pool       │  │     Discovery  │  │     Only       │        │
│  │                │  │                │  │                │        │
│  │ Every candidate│  │ Card-swipe     │  │ Both sides     │        │
│  │ is manually    │  │ interface.     │  │ verified.      │        │
│  │ reviewed.      │  │ First match    │  │ Quality over   │        │
│  │                │  │ in minutes.    │  │ volume.        │        │
│  └────────────────┘  └────────────────┘  └────────────────┘        │
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│  │ [◻] Portfolio │  │ [♥] Smart      │  │ [✉] Direct    │        │
│  │     First      │  │     Matching   │  │     Messaging  │        │
│  │                │  │                │  │                │        │
│  │ The work comes │  │ Preferences on │  │ When you       │        │
│  │ first. The     │  │ both sides     │  │ match, you     │        │
│  │ CV is          │  │ surface the    │  │ talk. No       │        │
│  │ optional.      │  │ right fit.     │  │ middlemen.     │        │
│  └────────────────┘  └────────────────┘  └────────────────┘        │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Feature Card Spec

```
background: rgba(255,255,255,0.02)
border: 1px solid rgba(255,255,255,0.06)
border-radius: 24px
padding: 32px
transition: all 250ms ease

/* Hover */
background: rgba(255,255,255,0.04)
border-color: rgba(255,255,255,0.10)
transform: translateY(-4px)
box-shadow: 0 0 40px rgba(124,58,237,0.08)
```

Icon container: `w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6`  
Icon: `lucide-react`, `size-6`, `text-primary`  
Title: `text-base font-semibold text-foreground mb-2`  
Body: `text-sm text-muted leading-relaxed`

### Features Content

| # | Icon | Title | Copy |
|---|---|---|---|
| 1 | `ShieldCheck` | Vetted talent pool | Every candidate is individually reviewed before their profile goes live. No bots, no bulk applications, no noise. |
| 2 | `Zap` | Fast discovery | A swipe-based interface means you get to signal in seconds. First match often happens within hours of going live. |
| 3 | `Lock` | Invitation only | Both employers and candidates are approved before they join. Quality is the filter — not budget or volume. |
| 4 | `LayoutGrid` | Portfolio-first | Work comes before words. Candidates lead with their portfolio, not a bullet-pointed CV. |
| 5 | `Sparkles` | Smart matching | Work preferences, availability, and rate range are matched on both sides. Less friction, better fit. |
| 6 | `MessageCircle` | Direct messaging | When a match is made, conversation starts immediately — in-platform, direct, no intermediaries. |

### Animation

Staggered reveal with `whileInView`:
- Each card: `fadeUpVariants`, stagger `0.08s`
- `viewport: { once: true, margin: "-80px" }`
- Hover: Framer Motion `whileHover={cardHover}` from `lib/tokens.ts`

---

## 12. Section 10 — Platform Preview

### Canvas: Dark, full-bleed

### Purpose
Show the actual product. The boldest, most impactful visual on the page. "This is what you're getting."

### Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│            ▪ THE PRODUCT                                            │
│                                                                      │
│    A platform built for the way                                      │
│    creative teams actually work.                                     │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                                                              │  │
│  │   [FULL-WIDTH PLATFORM MOCKUP — dark UI screenshot]         │  │
│  │                                                              │  │
│  │   Left panel: Candidate dashboard                            │  │
│  │   Right panel: Employer swipe view                           │  │
│  │                                                              │  │
│  │   [Floating feature callout badge — top right corner]        │  │
│  │   ┌─────────────────┐                                       │  │
│  │   │ ✦ 94% match rate│                                       │  │
│  │   └─────────────────┘                                       │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│     [Drag to explore →]     3 indicator dots                        │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Layout

Full container width. Content inside `max-w-6xl mx-auto`.  
The mockup image/illustration extends to near full-width, clipped with `overflow-hidden rounded-2xl`.

### Mockup Approach

The mockup should be a **designed illustration** (not a screenshot), showing:
1. Left panel: candidate profile view — avatar, name, role, portfolio grid (2×3 thumbnails)
2. Right panel: employer swipe card view — the same candidate card in swipe format
3. Connection line between them showing "Matched ♥"

At Phase 5 launch: design this in Figma, export as a single optimized PNG/WebP (2x @2560px wide).  
File: `public/images/platform-preview.webp`

### Visual Treatment

```
.platform-preview-container {
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04);
  position: relative;
}

/* Gradient fade at bottom — suggests more to explore */
.platform-preview-container::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 120px;
  background: linear-gradient(to bottom, transparent, rgba(10,10,10,0.8));
  pointer-events: none;
}
```

### Floating Callout Badge

Glassmorphic badge overlaid top-right of mockup:
```
position: absolute; top: 24px; right: 24px;
background: rgba(10,10,10,0.8);
backdrop-filter: blur(16px);
border: 1px solid rgba(255,255,255,0.1);
border-radius: 12px;
padding: 10px 16px;
```

Content: `"✦ 94% of matches lead to a first conversation"`

### Animation

Mockup: enters with `scale: 0.95 → 1.0` + `y: 40 → 0` as it scrolls into view.  
Parallax: a subtle `y` offset as page scrolls — container moves `0.1x` scroll speed using `useScroll` + `useTransform`.  
Floating badge: oscillates `y: [0, -6, 0]`, period 4s.

---

## 13. Section 11 — Statistics

### Canvas: Dark default

### Purpose
Numbers build trust faster than copy. Four metrics that signal both quality and scale.

### Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌──────┐│
│  │               │ │               │ │               │ │      ││
│  │     100%      │ │     3 days    │ │      12       │ │  94% ││
│  │               │ │               │ │               │ │      ││
│  │  Of candidates│ │ Average time  │ │  Creative     │ │ Match││
│  │  manually     │ │ to first      │ │  specialties  │ │ rate ││
│  │  reviewed     │ │ match         │ │  represented  │ │      ││
│  └───────────────┘ └───────────────┘ └───────────────┘ └──────┘│
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
Padding: py-24
```

### Copy

| Metric | Value | Label |
|---|---|---|
| 1 | `100%` | Of candidates manually reviewed |
| 2 | `3 days` | Average time to first match |
| 3 | `12` | Creative specialties on the platform |
| 4 | `94%` | Of matches lead to a first conversation |

### Stat Card Design

```
text-align: center
padding: 40px 24px

Number:
  font-size: clamp(2.5rem, 4vw, 4rem)
  font-weight: 800
  color: #FFFFFF
  letter-spacing: -0.02em
  background: linear-gradient(135deg, #FFFFFF 0%, #A78BFA 60%)
  -webkit-background-clip: text
  -webkit-text-fill-color: transparent

Label:
  font-size: 0.875rem
  color: #9CA3AF
  margin-top: 8px
  max-width: 120px
  margin-left: auto
  margin-right: auto
```

Dividers between stats: `1px solid rgba(255,255,255,0.06)` vertical lines (hidden on mobile).

### Animation

Numbers count up from 0 when they scroll into view. Use `useInView` + a counting `useEffect` with `requestAnimationFrame`. Duration: 1200ms, ease-out.

The gradient text "100%" should have a subtle shimmer sweep animation:  
`@keyframes shimmer`: moves a `rgba(255,255,255,0.3)` gradient from left to right over 2s, once on entry.

---

## 14. Section 12 — Testimonials

### Canvas: Light warm

### Purpose
Social proof from real users. Candidates and employers both represented.

### Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ▪ WHAT PEOPLE SAY                                              │
│                                                                  │
│  Don't take our word for it.                                    │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │ "              │  │ "              │  │ "              │   │
│  │                │  │                │  │                │   │
│  │ [quote text]   │  │ [quote text]   │  │ [quote text]   │   │
│  │                │  │                │  │                │   │
│  │ ● [Avatar]    │  │ ● [Avatar]    │  │ ● [Avatar]    │   │
│  │ Name           │  │ Name           │  │ Name           │   │
│  │ Role · Company │  │ Role · Company │  │ Role · Company │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Copy

```
EYEBROW: "Testimonials"
H2: "Don't take our word for it."
SUBTEXT: "From the creatives and teams using ScouttOpp."

TESTIMONIAL 1 (Candidate):
Quote: "Within two weeks of joining, I was having conversations with 
        three companies I'd been trying to reach for years. The quality 
        of the introductions was genuinely unlike anything I've experienced 
        through traditional routes."
Name: Maya R.
Role: Art Director
Tag: [Candidate]

TESTIMONIAL 2 (Employer):
Quote: "We found our Head of Design within four days of going live. 
        Every profile we saw was relevant — not just technically, but 
        in terms of taste and craft. That's never happened on a 
        job board."
Name: James K.
Role: VP Creative
Company: Studio Co.
Tag: [Employer]

TESTIMONIAL 3 (Candidate):
Quote: "I love that I'm in control. I turn my visibility on when I'm 
        open to opportunities, off when I'm heads-down on a project. 
        No spam. No random DMs. Just real matches when I want them."
Name: Aisha T.
Role: Motion Designer
Tag: [Candidate]
```

### Testimonial Card Design

Light canvas:
```
background: #FFFFFF
border: 1px solid rgba(0,0,0,0.07)
border-radius: 24px
padding: 32px
box-shadow: shadow-light

Quote mark:
  font-size: 4rem
  line-height: 1
  color: rgba(43,56,117,0.12)
  font-family: Georgia, serif
  position: absolute
  top: 24px; left: 28px
  user-select: none

Quote text:
  font-size: 0.9375rem  (15px)
  line-height: 1.8
  color: #2C2620
  font-style: italic

Author row:
  display: flex, align-items: center, gap: 12px, margin-top: 24px
  
  Avatar: 40px circle
  Name: font-weight: 600, text-sm
  Role: text-xs text-muted

Role badge (Candidate/Employer):
  font-size: 11px
  font-weight: 600
  uppercase
  rounded-full
  Candidate: bg-primary/8 text-primary (navy on light canvas)
  Employer: bg-indigo/8 text-indigo
```

### Animation

Cards on desktop: hover `shadow-light-hover` + `translateY(-4px)`.  
Entry: stagger from left, `x: 24 → 0` + fade.

On mobile: horizontal scroll snap. `overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding: 24px`. Each card: `flex-shrink: 0; scroll-snap-align: start`.

---

## 15. Section 13 — Early Access

### Canvas: Dark default

### Purpose
Remove the implicit "how much does this cost?" question before it's asked. Communicate scarcity and exclusivity — ScouttOpp is invite-only on both sides. Two audiences, two clear paths.

### Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│              ✦ EARLY ACCESS                                         │
│                                                                      │
│         We're building this the right way.                          │
│                                                                      │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐ │
│  │ FOR CREATIVES                │  │ FOR EMPLOYERS                │ │
│  │                              │  │                              │ │
│  │  Always free to join.        │  │  Hire differently.           │ │
│  │                              │  │                              │ │
│  │  Apply with your portfolio.  │  │  Request access and we'll    │ │
│  │  Our team reviews every      │  │  review your company before  │ │
│  │  application personally.     │  │  granting access.            │ │
│  │                              │  │                              │ │
│  │  ✓ Free forever              │  │  ✓ Pre-vetted talent only    │ │
│  │  ✓ Invite-only access        │  │  ✓ Invite-only access        │ │
│  │  ✓ Portfolio-first profile   │  │  ✓ Curated candidate pool    │ │
│  │  ✓ You control visibility    │  │  ✓ No placement fees — ever  │ │
│  │  ✓ Match on your terms       │  │  ✓ Direct in-platform comms  │ │
│  │                              │  │                              │ │
│  │  [Apply as a candidate →]    │  │  [Request employer access →] │ │
│  └──────────────────────────────┘  └──────────────────────────────┘ │
│                                                                      │
│   "We review every application. This is how the quality stays high."│
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Card Design

Base (both cards):
```
border: 1px solid rgba(255,255,255,0.06)
border-radius: 24px
padding: 40px 32px
background: rgba(255,255,255,0.02)
```

Candidate card (left — accent-tinted):
```
border: 1px solid rgba(124,58,237,0.20)
background: rgba(124,58,237,0.03)
```

Employer card (right — neutral):
```
border: 1px solid rgba(255,255,255,0.08)
background: rgba(255,255,255,0.02)
```

Audience label: `text-xs font-semibold uppercase tracking-widest text-muted mb-2`  
Card headline: `text-2xl font-bold text-foreground mb-3`  
Card body: `text-sm text-muted leading-relaxed mb-6`  
Divider: `1px solid rgba(255,255,255,0.06)`, `my-6`  
Feature list: `space-y-3`, each item `flex gap-3`, checkmark `CheckCircle` icon `size-4 text-primary`  
CTA: full-width, `mt-8`

### Copy

```
EYEBROW: "Early Access"
H2: "We're building this
     the right way."
SUBTEXT: "ScouttOpp is invite-only on both sides. Creative professionals
          and employers are both curated — because quality depends on both."

CARD 1 — FOR CREATIVES:
Audience label: "For Creatives"
Headline: "Always free to join."
Body: "Apply with your portfolio. Our team reviews every application
       personally, not algorithmically."
Features:
  Free forever for creative professionals
  Invite-only — every application is reviewed
  Portfolio-first profile
  You control your discovery at all times
  Direct contact only when you match
CTA: "Apply as a candidate →" → /auth/signup?role=candidate

CARD 2 — FOR EMPLOYERS:
Audience label: "For Employers"
Headline: "Hire differently."
Body: "Request access through our website. We review each company before
       granting access — our candidates expect that standard."
Features:
  Pre-vetted candidate pool
  Invite-only employer access
  Swipe-based discovery (coming soon)
  Direct in-platform messaging
  No placement fees — ever
CTA: "Request employer access →" → /contact?type=employer

BELOW CARDS (centre-aligned, text-sm text-muted):
"Employer pricing will be announced when access opens broadly.
Creative professionals are always free."
→ [Get in touch] if you have questions → /contact
```

### Animation

Cards: stagger `0.12s`, `fadeUpVariants`.  
Both cards fade up with equal visual weight — no featured/highlighted distinction.  
Below-cards note: fade up, delay `0.3s`.

---

## 16. Section 14 — FAQ

### Canvas: Light warm

### Purpose
Reduce friction before signup. Answer the three questions in every visitor's head: "Is this for me?", "How does it work?", "What's the catch?"

### Wireframe

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│            ▪ FAQ                                            │
│                                                              │
│       Everything you want to know                           │
│       before you sign up.                                   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ How do I join as a candidate?                    [+] │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ [Answer text when open...]                          │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ What makes ScouttOpp different?                  [+] │   │
│  └─────────────────────────────────────────────────────┘   │
│  ... (6 more questions)                                     │
│                                                              │
│  Still have questions? [Contact us →]                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Questions and Answers

```
FOR CANDIDATES:

Q: How do I join as a candidate?
A: Fill in our application form with your portfolio and a brief description of the 
   kind of work you do. Our team reviews every application personally — no algorithms, 
   no keyword filtering. If you're a fit, you'll hear from us within 3–5 days.

Q: Is ScouttOpp free for candidates?
A: Yes. ScouttOpp is free for creative professionals, always. We charge employers 
   for access to the platform, not candidates.

Q: Can I control who sees my profile?
A: Completely. You can pause your visibility at any time from your dashboard settings. 
   When paused, your profile is hidden from all employer discovery. Turn it back on 
   whenever you're ready.

Q: What if I get rejected?
A: We'll let you know why in clear, respectful terms. You're welcome to apply again 
   in 90 days if your portfolio or situation changes. We try to be honest, not brutal.

Q: What roles does ScouttOpp support?
A: Right now, we focus on: Art Directors, Creative Directors, Graphic Designers, 
   Brand Designers, Motion Designers, UI/UX Designers, Photographers, 
   and Videographers. We're expanding to more disciplines soon.

FOR EMPLOYERS:

Q: How do employers get access?
A: You request access through our website. We review each company before granting 
   access — we're selective because our candidates expect that. Most employer 
   applications receive a response within 2 business days.

Q: How much does it cost to hire through ScouttOpp?
A: ScouttOpp is free for creative professionals. Employer access is currently in 
   early access — pricing will be announced when we open more broadly. Get in 
   touch via our contact form and we'll let you know what to expect.

Q: How is this different from LinkedIn or a recruitment agency?
A: On LinkedIn, anyone can apply and the signal-to-noise ratio is brutal. 
   A recruiter takes 15–20% of the first year's salary. ScouttOpp is a 
   flat subscription and every candidate has been individually vetted. 
   You see portfolios, not CVs. You swipe, not sift.

Q: Can I use ScouttOpp alongside my existing hiring process?
A: Yes. We're not an ATS replacement — we're a sourcing layer. Find the candidate 
   here, run your own process after the match.
```

### Accordion Component Design

Light canvas:
```
Each item:
  border: 1px solid rgba(0,0,0,0.07)
  border-radius: 16px
  overflow: hidden
  margin-bottom: 8px

Trigger (question row):
  display: flex
  justify-content: space-between
  align-items: center
  padding: 20px 24px
  cursor: pointer
  font-size: 0.9375rem
  font-weight: 600
  color: #2C2620

Icon: Plus/X toggle, 20px, animated rotation 0° → 45°
transition: 150ms

Answer panel:
  padding: 0 24px 20px
  font-size: 0.875rem
  color: #8A8070 (text-muted on light)
  line-height: 1.75
  animation: height 0 → auto via Framer Motion layout
```

### Animation

Open/close: `AnimatePresence` with `motion.div`, `initial={{ height: 0, opacity: 0 }}`, `animate={{ height: 'auto', opacity: 1 }}`.  
Transition: `{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }`.  
Icon: `rotate: 0 → 45`, spring.

Group: only one open at a time (controlled state in parent).

---

## 17. Section 15 — Final CTA

### Canvas: Dark default — fullscreen atmosphere

### Purpose
The last push. If someone has scrolled this far without acting, they're interested but uncertain. Remove all friction. One button. One message.

### Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│    [large ambient orb — purple radial at center]                    │
│                                                                      │
│                   ✦ Join the waitlist                               │
│                                                                      │
│           The creative talent                                        │
│           marketplace you                                           │
│           actually deserve.                                         │
│                                                                      │
│    Creative professionals who value craft. Employers who            │
│    value people. A platform that brings them together.              │
│                                                                      │
│                  [Join ScouttOpp →]                                 │
│                                                                      │
│                  Already have an invite? [Sign in]                  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
Padding: py-48
```

### Copy

```
EYEBROW BADGE:
"✦ Early access now open"

H2 (large, centered):
"The creative talent
marketplace you
actually deserve."

BODY (max-w-lg, centered, text-muted):
"Creative professionals who care about craft. 
Employers who care about quality. 
A platform that brings them together — intentionally."

PRIMARY CTA:
"Join ScouttOpp →"
→ /auth/signup

SECONDARY LINK:
"Already have an invite? Sign in →"
→ /auth/login
```

### Visual Treatment

Background atmosphere is more intense here — the "climax" of the page:
```
Layer 1: bg-background (#0A0A0A)
Layer 2: Large central orb
  radial-gradient(ellipse 120% 80% at 50% 50%, rgba(124,58,237,0.2) 0%, transparent 60%)
  width: 100%; height: 800px
  position: absolute; top: 50%; transform: translateY(-50%)

Layer 3: Secondary orb offset
  radial-gradient(ellipse 60% 60% at 30% 60%, rgba(167,139,250,0.08) 0%, transparent 50%)
```

CTA Button at extra-large size:
```
padding: 16px 40px
font-size: 1rem
font-weight: 600
border-radius: 9999px
background: linear-gradient(135deg, #7C3AED, #6D28D9)
box-shadow: 0 0 60px rgba(124,58,237,0.4), 0 0 120px rgba(124,58,237,0.15)
```

### Animation

H2: words animate in individually, staggered 30ms per word. Use `split text` approach — each word wrapped in a `motion.span`.  
Orb: slow pulse `scale: [1, 1.05, 1]`, period 8s, `repeat: Infinity`, `ease: "easeInOut"`.  
CTA: on hover, glow intensity increases. On click, brief scale-down.

---

## 18. Section 16 — Footer

### Canvas: Dark default (continuation of Final CTA section — no visual gap)

### Layout

```
Upper footer:
  4-column grid on desktop, 2-column on tablet, 1-column on mobile
  padding-top: 80px
  border-top: 1px solid rgba(255,255,255,0.06)

Columns:

Col 1 — Brand:
  Logo wordmark (same as nav)
  Tagline: "The creative talent marketplace built on intention."
  (text-sm text-muted, max-w-xs, margin-top: 12px)

Col 2 — Product:
  Heading: "Product" (text-xs uppercase tracking-widest text-muted mb-4)
  Links: Features, Pricing, FAQ, For Creatives, For Employers

Col 3 — Company:
  Heading: "Company"
  Links: About, Blog, Contact

Col 4 — Legal:
  Heading: "Legal"
  Links: Privacy Policy, Terms of Service

Lower footer:
  padding: 32px 0
  border-top: 1px solid rgba(255,255,255,0.04)
  flex: justify-between, items-center

  Left: "© 2026 ScouttOpp Ltd. All rights reserved."
         text-xs text-muted

  Right: Social icons (Twitter/X, Instagram, LinkedIn)
         each: 36px touch target, icon 18px, text-muted hover:text-foreground
```

### Animation

Footer links: `hover:text-foreground transition-colors duration-150`. No other animations in the footer.

---

## 19. Component Library

### 19.1 MarketingButton

Two variants:

**Primary (pill):**
```
rounded-full
bg-gradient (135deg, #7C3AED, #6D28D9)
text-white font-semibold text-sm
padding: sizes → sm: px-5 py-2.5, md: px-7 py-3.5, lg: px-9 py-4 text-base
box-shadow: glow-primary
hover: translateY(-2px), shadow intensity +40%
active: scale(0.97)
transition: all 200ms ease
```

**Ghost (pill):**
```
rounded-full
border: 1px solid rgba(255,255,255,0.12)
bg: transparent
text-foreground/80 font-medium text-sm
hover: border-white/20, bg-white/4
active: scale(0.97)
```

**On light canvas — primary uses navy gradient instead:**
```
bg-gradient (135deg, #2B3875, #1E2850)
```

### 19.2 EyebrowBadge

```
inline-flex items-center gap-2
rounded-full
bg: rgba(124,58,237,0.1)
border: 1px solid rgba(124,58,237,0.2)
padding: 5px 14px
text-xs font-semibold uppercase tracking-widest
color: text-secondary (#A78BFA on dark, #6B5FAE on light)

Optional: ✦ decorative icon before text
```

### 19.3 FeatureCard

```
rounded-2xl
border: border-subtle (rgba(255,255,255,0.06))
background: rgba(255,255,255,0.02)
padding: 32px
transition: all 250ms ease

hover:
  border: border-medium (rgba(255,255,255,0.10))
  background: rgba(255,255,255,0.04)
  transform: translateY(-4px)
  box-shadow: gradient-feature-glow

Contents:
  icon-container (w-12 h-12 rounded-xl bg-primary/10)
  title (font-semibold mb-2)
  body (text-sm text-muted leading-relaxed)
```

### 19.4 TestimonialCard

```
rounded-2xl
border: 1px solid rgba(0,0,0,0.07) [light canvas]
background: #FFFFFF
padding: 32px
position: relative

Large decorative quote mark:
  position: absolute; top: 24px; left: 28px
  font-size: 64px; line-height: 1
  color: rgba(43,56,117,0.08)
  font-family: Georgia, serif
  user-select: none

Quote:
  font-style: italic
  font-size: 15px
  line-height: 1.8
  color: text-foreground
  padding-top: 24px

Author row:
  margin-top: 24px
  display: flex; align-items: center; gap: 12px
  Avatar: 40px circle (letter avatar if no photo)
  Name: font-weight: 600, text-sm
  Role: text-xs text-muted
  Badge: (Candidate / Employer) — pill, tiny
```

### 19.5 EarlyAccessCard

Two states: `candidate` (accent-tinted) and `employer` (neutral).

Candidate state:
- `border: 1px solid rgba(124,58,237,0.20)`, `background: rgba(124,58,237,0.03)`
- No badge or scale transform — equal weight to employer card

Employer state:
- `border: 1px solid rgba(255,255,255,0.08)`, `background: rgba(255,255,255,0.02)`

Both cards: `rounded-2xl p-10`  
Feature list: custom check icons using `CheckCircle` from lucide, `size-4`, colored `text-primary`  
Grid: `grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto`

### 19.6 StatCard

```
text-align: center
padding: 40px 24px

Value:
  font-size: clamp(2rem, 4vw, 3.5rem)
  font-weight: 800
  letter-spacing: -0.02em
  background: gradient-text (white → lavender)
  bg-clip-text text-transparent

Label:
  font-size: 14px
  color: text-muted
  margin-top: 8px

Animated counter on scroll entry
```

### 19.7 SectionHeader

Standard reusable header used at the top of most sections:

```tsx
// Structure (prose, not code):
<div className="text-center max-w-2xl mx-auto mb-16">
  <EyebrowBadge>{eyebrow}</EyebrowBadge>
  <h2 className="display-lg font-extrabold text-foreground mt-4 mb-6 tracking-tight">
    {title}
  </h2>
  <p className="text-base text-muted leading-relaxed max-w-xl mx-auto">
    {subtitle}
  </p>
</div>
```

Centered on most sections. Left-aligned on the two journey sections (candidate/employer).

### 19.8 CandidateCardMockup

The fake swipe card used in hero and employer journey sections:

```
width: 280px (desktop); 220px (mobile, scaled)
height: auto (content-based)
background: rgba(24,24,24,0.9)
border: 1px solid rgba(255,255,255,0.08)
border-radius: 24px
padding: 24px
box-shadow: shadow-float
transform: rotate(-2deg) [hero]

Contents:
  Header row: Avatar (52px) + name (font-semibold) + role (text-muted text-sm)
  Location row: "📍 London · Remote" text-xs text-muted
  Divider
  Specialties: 2–3 rounded-full pills, text-xs
  Portfolio thumbnails: 2×2 grid, rounded-xl, 60×60px each
  Divider
  Action row: [✕ Pass] [♥ Like] [★ Super] — small rounded-full buttons
```

### 19.9 HowItWorksStep

```
Step number:
  text-5xl font-extrabold text-primary/15
  position: absolute; top: -8px; left: -4px

Icon container: w-10 h-10 rounded-lg bg-primary/10
Icon: size-5, text-primary

Title: text-base font-semibold text-foreground mt-3 mb-2
Body: text-sm text-muted leading-relaxed

Connector line (between steps, horizontal on desktop):
  height: 1px
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)
  flex: 1 (fills space between steps)
  margin-top: 20px [aligns with icon center]
```

### 19.10 FAQAccordionItem

```
Container:
  rounded-2xl overflow-hidden
  border: 1px solid rgba(0,0,0,0.07) [light]
  margin-bottom: 8px

Trigger:
  padding: 20px 24px
  display: flex; justify-content: space-between; align-items: center
  cursor: pointer
  width: 100%
  text-align: left

  Question text: text-sm font-semibold text-foreground
  Icon: [+] → [✕] rotation, Framer Motion rotate

Answer panel (Framer Motion AnimatePresence):
  initial: { height: 0, opacity: 0 }
  animate: { height: 'auto', opacity: 1 }
  exit: { height: 0, opacity: 0 }
  transition: 250ms ease

  Inner padding: 0 24px 20px
  font-size: text-sm
  line-height: 1.8
  color: text-muted
```

---

## 20. Motion Design Specification

### 20.1 Philosophy

Motion on the marketing site serves four purposes:
1. **Communicate product behaviour** (swipe gesture, card stack, discovery)
2. **Guide attention** (stagger reveals direct eyes to key content)
3. **Signal quality** (smooth, spring-based transitions = premium feel)
4. **Delight** (but never distract — animate once, settle)

Anti-patterns to avoid:
- Infinite scroll-triggered animations (nauseating on long pages)
- Parallax exceeding 20% of container height (causes motion sickness)
- Bounce easing on large containers (looks cheap)
- Animating background colors continuously

### 20.2 Page Entry Sequence

When any marketing page loads:
1. Nav bar: `y: -8 → 0`, `opacity: 0 → 1`, 300ms, `ease-out`
2. Hero eyebrow: 0ms delay, 400ms fade-up
3. Hero h1 lines: 80ms / 160ms / 240ms stagger, 400ms each
4. Hero subheadline: 360ms delay
5. Hero CTAs: 480ms delay
6. Hero mockup: 600ms delay, spring entry

All other sections: `whileInView`, `once: true`, `viewport: { margin: "-100px" }`.

### 20.3 Scroll Animations — Reveal Variants

All use `fadeUpVariants` from `lib/tokens.ts`:
```
hidden:  { opacity: 0, y: 16 }
visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }
```

For stagger groups (cards, steps, features):
```
container: staggerChildren: 0.08s, delayChildren: 0s
items: fadeUpVariants (above)
```

Heavy elements (platform preview, large mockups):
```
hidden:  { opacity: 0, y: 32, scale: 0.98 }
visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }
```

### 20.4 Hover States

| Element | Hover Motion |
|---|---|
| Marketing CTA button | `translateY(-2px)`, glow +30% |
| Feature card | `translateY(-4px)`, border lighten |
| Testimonial card | `translateY(-4px)`, shadow intensify |
| Early Access card | `translateY(-4px)` (both cards equally) |
| Nav links | color fade only — no movement |
| Footer links | color fade only — no movement |
| Trust bar logos | `opacity: 0.6 → 1.0` |

All hover transitions: 200ms `ease-out`.

### 20.5 Floating Animations (Idle)

| Element | Animation |
|---|---|
| Hero card mockup | `y: [0, -12, 0]`, 4s, `easeInOut`, `repeat: Infinity` |
| Candidate card border | Border opacity `[0.20, 0.35, 0.20]`, 5s, `easeInOut`, `repeat: Infinity` |
| Final CTA orb | `scale: [1, 1.08, 1]`, 8s, `easeInOut`, `repeat: Infinity` |
| Feature callout badge | `y: [0, -6, 0]`, 3s, `easeInOut`, `repeat: Infinity` |

### 20.6 Counter Animation (Statistics)

On `useInView` trigger:
```
startValue: 0
endValue: target number
duration: 1200ms
easing: ease-out (accelerates then decelerates)
implementation: useEffect + requestAnimationFrame + lerp
```

Numbers with units ("3 days", "94%", "100%") — animate only the number part, keep unit static.

### 20.7 Tab Transition (How It Works)

When switching between "For Candidates" and "For Employers":
- Outgoing content: `opacity: 1 → 0`, `x: 0 → -20px`, 150ms
- Incoming content: `opacity: 0 → 1`, `x: 20px → 0`, 250ms
- `AnimatePresence mode="wait"` — waits for exit to complete before entering
- Tab indicator: `layoutId="tab-active"`, Framer Motion layout animation, spring

### 20.8 Accordion Animation

FAQ accordion open:
- `height: 0 → 'auto'` via `motion.div`
- `opacity: 0 → 1`, 20ms lag after height starts
- Total duration: 250ms
- Plus icon: `rotate: 0 → 45°`, spring, stiffness 300, damping 20

### 20.9 Horizontal Scroll (Mobile Testimonials)

On mobile: testimonial cards are horizontally scrollable.
```css
.testimonials-scroll {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding: 0 24px;
  -webkit-overflow-scrolling: touch;
  gap: 16px;
  padding: 0 24px;
  scrollbar-width: none;
}

.testimonial-card {
  flex-shrink: 0;
  scroll-snap-align: start;
  width: 80vw;
  max-width: 320px;
}
```

Indicator dots below: 3 dots, active fills primary color.

### 20.10 Reduced Motion

Wrap all Framer Motion variants with `useReducedMotion()`:
```tsx
// Implementation note (prose, not code):
const prefersReducedMotion = useReducedMotion()
const variants = prefersReducedMotion ? {} : fadeUpVariants
// When reduced motion is on: instant show, no transform, no delay
```

Floating animations: fully disabled when `prefers-reduced-motion: reduce`.  
Counter animation: instant jump to final value.  
Tab switch: instant content swap.

---

## 21. Responsive Behaviour

### 21.1 Breakpoints

Using the existing design system breakpoints, extended for marketing:

| Name | Width | Tailwind prefix | Behaviour |
|---|---|---|---|
| Mobile | 375–639px | (default) | Single column, hamburger nav |
| Small | 640–767px | `sm:` | Minor layout shifts, 2-col grids |
| Tablet | 768–1023px | `md:` | Two-column sections, desktop nav appears |
| Laptop | 1024–1279px | `lg:` | Three-column grids, full side-by-side |
| Desktop | 1280px+ | `xl:` | Max-width content, final layout |

### 21.2 Navigation — Responsive

| Breakpoint | Behaviour |
|---|---|
| < md | Hamburger icon. Full-screen drawer on tap. |
| md+ | Full horizontal nav. Hamburger hidden. |

### 21.3 Hero — Responsive

| Breakpoint | Behaviour |
|---|---|
| Mobile | Single column. H1 `font-size: clamp(2.5rem, 8vw, 3.5rem)`. Mockup below copy, scaled to 80%, centered. Both CTAs full-width stacked. |
| md | Two-column split begins. H1 increases. Mockup beside copy. |
| lg | Full layout. H1 `clamp(3.5rem, 5vw, 6rem)`. |
| xl | H1 reaches max 96px. Generous padding. |

### 21.4 Section Layout — Responsive

| Section | Mobile | Desktop |
|---|---|---|
| Trust bar | 2 per row, 3 rows | 6 in a row |
| Problem pain cards | 1 col | 3 col |
| Solution comparison | Stacked vertically | Side by side |
| How It Works tabs | Stacked steps | Horizontal steps with connector |
| Candidate/Employer | Stacked (mockup first) | Side by side (copy left/right) |
| Feature grid | 1 col | 3 col |
| Platform preview | 95vw width, scroll horizontally | Full width in container |
| Stats | 2×2 grid | 4 in a row |
| Testimonials | Horizontal scroll snap | 3 col |
| Early Access | 1 col | 2 col |
| FAQ | Full width | max-w-2xl centered |
| Footer | 2 col | 4 col |

### 21.5 Typography — Responsive

| Element | Mobile | Laptop | Desktop |
|---|---|---|---|
| H1 (hero) | 40px | 64px | 80–96px |
| H2 (sections) | 32px | 48px | 56px |
| Section eyebrow | 12px | 12px | 12px |
| Body | 16px | 18px | 18px |
| Feature card title | 15px | 16px | 16px |
| Feature card body | 14px | 14px | 14px |

### 21.6 Spacing — Responsive

| Token | Mobile | Desktop |
|---|---|---|
| `section-y` | `py-20` | `py-32 lg:py-40` |
| Content max width | 100% - 48px | `max-w-7xl` |
| Hero min-height | `min-h-screen` | `min-h-screen` |
| Card padding | `p-6` | `p-8` |
| Grid gap | `gap-4` | `gap-6 lg:gap-8` |

---

## 22. SEO Specification

### 22.1 Root Marketing Layout Metadata

File: `app/(marketing)/layout.tsx`

```
metadataBase: process.env.NEXT_PUBLIC_APP_URL

title.default: "ScouttOpp — Creative Talent, Curated."
title.template: "%s | ScouttOpp"

description:
  "ScouttOpp is the invitation-only hiring platform for creative professionals. 
  Vetted designers, art directors, and creative directors. Intentional employers. 
  Zero noise."

keywords:
  ["creative talent platform", "art director jobs", "design hiring", 
   "creative director recruitment", "motion designer jobs", "invite-only jobs",
   "portfolio-first hiring", "curated creative talent"]

openGraph.type: "website"
openGraph.siteName: "ScouttOpp"
openGraph.locale: "en_GB"
openGraph.images:
  url: "/og-default.png"  (1200×630)
  width: 1200; height: 630
  alt: "ScouttOpp — Creative Talent, Curated."

twitter.card: "summary_large_image"
twitter.site: "@scouttopp"
twitter.creator: "@scouttopp"

robots: { index: true, follow: true }

icons:
  icon: "/favicon.ico"
  apple: "/apple-touch-icon.png"
```

### 22.2 Per-Page Metadata

| Page | Title | Description |
|---|---|---|
| `/` (landing) | "Creative Talent, Curated." | "The invitation-only hiring platform for creative professionals." |
| `/features` | "Platform Features" | "Portfolio-first discovery, swipe matching, and direct messaging for creative hiring." |
| `/about` | "About ScouttOpp" | "We built a better way to hire creative talent. Here's our story." |
| `/contact` | "Contact Us" | "Talk to the ScouttOpp team. Employer inquiries, support, and press." |
| `/faq` | "Frequently Asked Questions" | "Everything you want to know about ScouttOpp before you sign up." |
| `/privacy` | "Privacy Policy" | "How ScouttOpp handles your data." |
| `/terms` | "Terms of Service" | "The rules of the road for using ScouttOpp." |
| `/blog` | "Blog" | "Thoughts on creative hiring, talent, and the ScouttOpp platform." |

### 22.3 Structured Data — Landing Page

File: `app/(marketing)/page.tsx`  
Add a `<script type="application/ld+json">` tag:

```
Schema type: Organization
name: "ScouttOpp"
url: "https://scouttopp.com"
description: "Invitation-only creative talent hiring platform"
sameAs: ["https://twitter.com/scouttopp", "https://instagram.com/scouttopp", "https://linkedin.com/company/scouttopp"]
```

```
Schema type: WebSite
name: "ScouttOpp"
url: "https://scouttopp.com"
potentialAction:
  type: SearchAction
  target: "https://scouttopp.com/search?q={search_term_string}"
  query-input: "required name=search_term_string"
```

### 22.4 Sitemap

File: `app/sitemap.ts`

```
Priority map:
  /          → priority: 1.0,   changefreq: monthly
  /features  → priority: 0.8,   changefreq: monthly
  /about     → priority: 0.7,   changefreq: monthly
  /faq       → priority: 0.6,   changefreq: monthly
  /contact   → priority: 0.5,   changefreq: yearly
  /privacy   → priority: 0.3,   changefreq: yearly
  /terms     → priority: 0.3,   changefreq: yearly
  /blog      → priority: 0.5,   changefreq: weekly
```

### 22.5 Robots

File: `app/robots.ts`

```
Allow: /
Disallow: /dashboard/, /api/, /auth/
Sitemap: https://scouttopp.com/sitemap.xml
```

---

## 23. Performance Specification

### 23.1 Core Web Vitals Targets

| Metric | Target | Why it matters |
|---|---|---|
| LCP (Largest Contentful Paint) | < 1.8s | Hero text is LCP — use system font until Plus Jakarta Sans loads |
| FID / INP | < 100ms | Framer Motion shouldn't block main thread |
| CLS (Cumulative Layout Shift) | < 0.05 | Reserve space for all images, fonts |
| TTFB | < 600ms | Vercel edge network handles this |
| FCP | < 1.2s | Hero text should paint first |

### 23.2 Images

All images on the marketing site:
- Format: WebP (primary) + AVIF (when browser supports) + JPEG fallback
- Use `next/image` for all `<img>` elements — auto-generates srcset, lazy loads, placeholder
- Hero mockup: `priority` prop on the `<Image>` tag (above the fold)
- Trust bar logos: CSS text (no images)
- Platform preview: `loading="lazy"`, `decoding="async"`, Intersection Observer threshold 0.1

OG image: `1200×630px` static file in `public/og-default.png` — pre-optimized.  
Platform preview mockup: `2560×1440` source, served at max `1280px` display width.

`next.config.ts` — `remotePatterns` for Supabase Storage (avatar images in testimonials if real):
```
*.supabase.co
lh3.googleusercontent.com
```

### 23.3 Font Loading

Plus Jakarta Sans already loaded in `app/layout.tsx` with:
```
display: 'swap'      — text visible immediately in system font, swaps when loaded
preload: true        — browsers preload the WOFF2
subsets: ['latin']   — only Latin characters
weights: [400, 500, 600, 700, 800]
```

No additional fonts on the marketing site. Do NOT add Google Fonts `<link>` tags — use `next/font` only.

### 23.4 JavaScript Bundle

- Framer Motion: already a dependency. No additional bundle cost.
- No client-side data fetching on the landing page — it's static content.
- All marketing pages: `export const dynamic = 'force-static'` — fully SSG'd
- Animations: all Framer Motion — automatically tree-shaken for unused features

### 23.5 Lazy Loading Strategy

| Component | Strategy |
|---|---|
| Hero section | Eager — critical above fold |
| Trust bar | Eager |
| Problem–Solution | Lazy (IntersectionObserver, 100px threshold) |
| Feature grid | Lazy |
| Platform preview image | Lazy, priority: false |
| Testimonials | Lazy |
| FAQ accordion | Lazy |
| Footer | Lazy |

Use Next.js `dynamic()` for heavy client components (FAQ accordion, animated counters):
```
// FAQ accordion — only loads when user can see it
const FaqSection = dynamic(() => import('@/components/landing/faq-section'), { ssr: true })
```

### 23.6 Accessibility

| Requirement | Implementation |
|---|---|
| All images have `alt` | Required — `next/image` enforces this |
| Colour contrast ≥ 4.5:1 | Verify with `axe` — dark text on light canvas especially |
| Focus visible on all interactive elements | `:focus-visible` ring from design system |
| Skip to main content link | `<a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a>` |
| FAQ accordion: `aria-expanded`, `aria-controls` | Implement on `<button>` trigger |
| Testimonials scroll: keyboard navigable | `tabIndex={0}` on scroll container, arrow key handler |
| Reduced motion | `useReducedMotion()` disables all animations |
| Heading hierarchy | h1 (hero) → h2 (sections) → h3 (card titles) — never skip levels |
| CTA `aria-label` on icon-only buttons | e.g., `aria-label="Close navigation"` on ✕ icon |
| Mobile nav: trap focus in drawer | `focus-trap-react` or manual implementation |

---

## 24. Complete Copywriting Reference

This section consolidates all page copy in one place for review.

### 24.1 Global

```
Brand name: ScouttOpp (capital S, capital O — always one word)
Tagline: "The creative talent marketplace built on intention."
Short tagline: "Creative talent, curated."
Mission statement: "We believe the best creative work comes from the right partnerships. 
                    ScouttOpp exists to make those partnerships happen."
```

### 24.2 Navigation

```
Logo: "ScouttOpp"
Links: Features | About | Contact
CTA 1: "Sign in"
CTA 2: "Get early access"
Mobile menu heading: "Menu"
Mobile CTA 1: "Sign in"
Mobile CTA 2: "Get early access →"
```

### 24.3 Hero

```
Eyebrow: "Invitation only · Est. 2026"

H1: "Talent this good
doesn't come from
a job board."

Subheadline:
"ScouttOpp is the invitation-only hiring platform for creative professionals. 
Every candidate is manually reviewed. Every employer is intentional.
Zero noise."

CTA primary: "Apply as a candidate →"
CTA secondary: "See how it works"

Scroll hint: "Scroll to explore"
```

### 24.4 Trust Bar

```
Label: "Trusted by creative teams at"
Companies: [Wieden+Kennedy] [Mother London] [R/GA] [Droga5] [BBDO] [Unit9]
```

### 24.5 Problem Section

```
Eyebrow: "The problem"

H2: "Creative hiring hasn't
evolved in twenty years."

Body:
"The industry runs on keyword-filtered CVs, referral chains, and luck. 
The people doing the hiring are drowning in applications that don't fit. 
The people worth hiring are invisible to the companies that need them.

There's a better way."

Pain Card 1:
Title: "Signal buried in noise"
Body: "200+ applications per post. 95% irrelevant. Hours lost reading CVs 
when you could be looking at portfolios."

Pain Card 2:
Title: "The best talent isn't looking"
Body: "Top-tier creatives aren't scrolling job boards. They're working. 
They're only reachable through platforms built for them."

Pain Card 3:
Title: "Process built for compliance, not hiring"
Body: "Sourcing, screening, ATS, interviews, offers. A six-week cycle 
for a role you needed filled last month."
```

### 24.6 Solution Section

```
Eyebrow: "The solution"

H2: "We built something
different."

Body:
"Not a job board. Not a recruiter. Not an algorithm.
A platform where quality is the only filter."

Left column label: "The old way"
Right column label: "ScouttOpp"

Comparison rows:
CV-first hiring          → Portfolio-first discovery
Open to anyone           → Invitation-only candidates
Hundreds of applicants   → A curated, vetted pool
Six-week hiring cycles   → First match within days
Algorithm-ranked results → Intention-driven connections
```

### 24.7 How It Works

```
Eyebrow: "How it works"

H2: "Simple on the surface.
Deliberate underneath."

Tab 1: "For Candidates"
Tab 2: "For Employers"

Candidates:
  Step 1: "Apply with your portfolio"
          "Tell us who you are and what you do. We review every application 
           personally — no keyword filters, no automated screening."

  Step 2: "We review your work"
          "Our team assesses quality, craft, and fit. If you're a match, 
           you'll receive a personal invite within a few days."

  Step 3: "Build your profile"
          "Upload your portfolio, set your availability, and control 
           your visibility. You're in control of your presence."

  Step 4: "Employers find you"
          "Once you're live, employers in your space can discover your work. 
           You'll be notified when there's a genuine match."

Employers:
  Step 1: "Request employer access"
          "Tell us about your company and the kind of creative talent 
           you're looking for. We're selective about who joins."

  Step 2: "We onboard you personally"
          "Once approved, you'll receive a personalised invite to the platform. 
           No self-serve sign-up. Intentional access only."

  Step 3: "Discover talent"
          "Browse pre-vetted candidate profiles and swipe to express interest. 
           Filter by role, location, rate, and availability."

  Step 4: "Match and connect"
          "When there's mutual interest, you're connected directly. 
           No intermediaries. No agency fees. Just a conversation."
```

### 24.8 Candidate Journey

```
Eyebrow: "For creatives"

H2: "Your work
speaks first."

Body:
"Stop adapting your portfolio to job description keywords. 
On ScouttOpp, employers come to you — based on the quality 
of your craft, not a CV template."

Benefits:
✓ One profile. No re-applying.
✓ Control who can see your work.
✓ Pause your visibility whenever you need to.
✓ Only get notified for genuine matches.
✓ No cold outreach, no agency middlemen.

CTA: "Apply as a candidate →"
```

### 24.9 Employer Journey

```
Eyebrow: "For employers"

H2: "Hire talent you
can't find elsewhere."

Body:
"Our candidate pool is invitation-only. Every profile has been 
individually reviewed before it ever appears on the platform. 
You're not searching through noise — you're choosing from signal."

Benefits:
✓ Every candidate manually vetted by our team.
✓ Portfolio-first — see the work before the CV.
✓ Filter by role, location, rate, and availability.
✓ Direct connection on match — no intermediaries.
✓ Flat subscription — no placement fees.

CTA: "Request employer access →"
```

### 24.10 Feature Showcase

```
Eyebrow: "The platform"

H2: "Everything you need to hire
or get hired — with intention."

Features:
1. Vetted talent pool
   "Every candidate is individually reviewed before their profile goes live. 
   No bots, no bulk applications, no noise."

2. Fast discovery
   "A swipe-based interface means you get to signal in seconds. 
   First matches often happen within hours of going live."

3. Invitation only
   "Both employers and candidates are approved before they join. 
   Quality is the filter — not budget or volume."

4. Portfolio-first
   "Work comes before words. Candidates lead with their portfolio, 
   not a bullet-pointed CV."

5. Smart matching
   "Work preferences, availability, and rate range are matched on both sides. 
   Less friction, better fit."

6. Direct messaging
   "When a match is made, conversation starts immediately — 
   in-platform, direct, no intermediaries."
```

### 24.11 Platform Preview

```
Eyebrow: "The product"

H2: "A platform built for the way
creative teams actually work."

Floating badge: "✦ 94% of matches lead to a first conversation"
```

### 24.12 Statistics

```
Stat 1: 100% | Of candidates manually reviewed
Stat 2: 3 days | Average time to first match
Stat 3: 12 | Creative specialties on the platform
Stat 4: 94% | Of matches lead to a first conversation
```

### 24.13 Testimonials

```
Eyebrow: "Testimonials"

H2: "Don't take our word for it."

Subtext: "From the creatives and teams building their careers and teams on ScouttOpp."

Testimonial 1:
Quote: "Within two weeks of joining, I was having conversations with 
three companies I'd been trying to reach for years. The quality of 
the introductions was genuinely unlike anything I've experienced 
through traditional routes."
Author: Maya R.
Role: Art Director
Badge: Candidate

Testimonial 2:
Quote: "We found our Head of Design within four days of going live. 
Every profile we saw was relevant — not just technically, but in terms 
of taste and craft. That's never happened through a job board."
Author: James K.
Role: VP Creative, Studio Co.
Badge: Employer

Testimonial 3:
Quote: "I love that I'm the one in control. I turn my visibility on 
when I'm open to work, off when I'm deep in a project. No spam. 
No cold messages. Just real introductions when I want them."
Author: Aisha T.
Role: Motion Designer
Badge: Candidate
```

### 24.14 Early Access

```
Eyebrow: "Early Access"

H2: "We're building this
the right way."

Subtext: "ScouttOpp is invite-only on both sides. Creative professionals
and employers are both curated — because quality depends on both."

Card 1 — For Creatives:
  Audience label: "For Creatives"
  Headline: "Always free to join."
  Body: "Apply with your portfolio. Our team reviews every application
         personally, not algorithmically."
  Features:
    Free forever for creative professionals
    Invite-only — every application is reviewed
    Portfolio-first profile
    You control your discovery at all times
    Direct contact only when you match
  CTA: "Apply as a candidate →"

Card 2 — For Employers:
  Audience label: "For Employers"
  Headline: "Hire differently."
  Body: "Request access through our website. We review each company
         before granting access — our candidates expect that standard."
  Features:
    Pre-vetted candidate pool
    Invite-only employer access
    Swipe-based discovery (coming soon)
    Direct in-platform messaging
    No placement fees — ever
  CTA: "Request employer access →"

Below-cards note: "Employer pricing will be announced when access opens broadly.
Creative professionals are always free."
Link: "[Get in touch →]" → /contact
```

### 24.15 FAQ

(See Section 14 for full FAQ copy — reproduced there in Q&A format.)

### 24.16 Final CTA

```
Eyebrow badge: "✦ Early access now open"

H2: "The creative talent
marketplace you
actually deserve."

Body:
"Creative professionals who care about craft. 
Employers who care about quality. 
A platform that brings them together — intentionally."

CTA: "Join ScouttOpp →"
Sub-link: "Already have an invite? Sign in →"
```

### 24.17 Footer

```
Brand tagline: "The creative talent marketplace built on intention."
Copyright: "© 2026 ScouttOpp Ltd. All rights reserved."

Column: Product
  Features, FAQ, For Creatives, For Employers

Column: Company
  About, Blog, Contact

Column: Legal
  Privacy Policy, Terms of Service
```

---

*End of specification.*

> **Implementation note for Phase 5:** Build section by section, ship incrementally.  
> Suggested order: Nav → Hero → Trust Bar → Problem → Solution → How It Works → Footer.  
> Remaining sections can be added in a second pass.  
> Do not ship the FAQ or Testimonials until the copy is confirmed by the product team.
