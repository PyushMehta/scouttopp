# ScouttOpp Design System
### Visual Source of Truth — v1.0

> This document is the single source of truth for all visual decisions in ScouttOpp.  
> Every screen — auth, onboarding, dashboard, admin, employer, candidate, and swipe — must conform to this system.  
> When a decision is not covered here, extend the system and update this document before shipping.

---

## Table of Contents

1. [Brand Foundations](#1-brand-foundations)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing System](#4-spacing-system)
5. [Grid & Layout](#5-grid--layout)
6. [Responsive Breakpoints](#6-responsive-breakpoints)
7. [Shape — Border Radius](#7-shape--border-radius)
8. [Shadows & Elevation](#8-shadows--elevation)
9. [Iconography](#9-iconography)
10. [Animation & Motion](#10-animation--motion)
11. [Components](#11-components)
    - [Buttons](#111-buttons)
    - [Form Inputs](#112-form-inputs)
    - [Password Input](#113-password-input)
    - [Password Strength](#114-password-strength)
    - [Checkbox](#115-checkbox)
    - [Radio Cards](#116-radio-cards)
    - [Select](#117-select)
    - [Textarea](#118-textarea)
    - [Cards](#119-cards)
    - [Badges](#1110-badges)
    - [Chips / Tags](#1111-chips--tags)
    - [Tables](#1112-tables)
    - [Modals](#1113-modals)
    - [Alerts & Banners](#1114-alerts--banners)
    - [Toasts](#1115-toasts)
    - [Spinner](#1116-spinner)
    - [Skeleton Loaders](#1117-skeleton-loaders)
    - [Empty States](#1118-empty-states)
    - [Avatars](#1119-avatars)
    - [Dividers](#1120-dividers)
12. [Navigation Patterns](#12-navigation-patterns)
13. [Page Layout Patterns](#13-page-layout-patterns)
14. [Accessibility Standards](#14-accessibility-standards)
15. [Future Patterns — Swipe UI](#15-future-patterns--swipe-ui)

---

## 1. Brand Foundations

### 1.1 Personality

ScouttOpp is a curated creative talent platform. The visual language must feel:

| Quality | Meaning in UI |
|---|---|
| **Warm** | Cream/vellum backgrounds, not cold grays. Charcoal text, not pure black. |
| **Authoritative** | Navy as the primary action colour. Every CTA commands attention without shouting. |
| **Refined** | Generous whitespace. Clean type hierarchy. No decorative chrome. |
| **Trustworthy** | Consistent behaviour. Predictable states. No surprise motion. |
| **Creative** | Indigo/lavender accents. Plus Jakarta Sans with expressive extrabold headings. |

### 1.2 Design Principles

1. **Surface over decoration.** Background colours and whitespace carry weight. Reserve borders and shadows for genuine hierarchy.
2. **Type does the heavy lifting.** The heading is the hero element on every screen. Support it; don't compete with it.
3. **Warm neutrals, always.** The neutral scale is cream → vellum → flax → stone → charcoal. Cold grays (#6B7280, #9CA3AF) exist only in the dark dashboard canvas.
4. **One primary action per view.** Every screen has exactly one `variant="primary"` CTA. Secondary actions are `outline` or `ghost`.
5. **Motion with purpose.** Animate state changes, not decorations. Never animate something the user didn't trigger.
6. **Accessible first.** Contrast, focus rings, ARIA roles, and keyboard paths are required, not optional.

---

## 2. Color System

### 2.1 Two-Surface Architecture

ScouttOpp uses two distinct visual contexts. All CSS variables are automatically swapped between them.

| Context | Selector | When Used |
|---|---|---|
| **Dark Canvas** | `:root` (default) | Dashboard, admin, future swipe UI |
| **Light Canvas** | `[data-color-scheme="light"]` | Auth screens, onboarding forms, modals on light pages |

Apply `data-color-scheme="light"` to a container element. All descendant components automatically adopt light values — no component changes required.

---

### 2.2 Brand Palette (Always Available)

These tokens are always present regardless of canvas. They are absolute colour values, not semantic roles.

```css
/* In app/globals.css @theme block */
--color-navy:       #2B3875;   /* Primary brand authority */
--color-navy-deep:  #1E2850;   /* Navy hover / pressed state */
--color-indigo:     #6B5FAE;   /* Secondary interactive, links */
--color-lavender:   #9B8DC4;   /* Decorative accent, light UI */
--color-lilac:      #C4B4E0;   /* Subtle highlight, tag borders */

--color-cream:      #F9F0E3;   /* Warm surface, info boxes */
--color-warm-white: #FDFAF6;   /* Primary light background */
--color-vellum:     #F0E8D8;   /* Card hover on light canvas */
--color-flax:       #D8CFC0;   /* Borders and dividers on light canvas */
--color-stone:      #8A8070;   /* Muted text on light canvas */
--color-charcoal:   #2C2620;   /* Primary foreground on light canvas */

--color-brand-success: #2D8A5E;   /* Success states (brand-tuned) */
--color-brand-warning: #C47C1A;   /* Warning states (brand-tuned) */
--color-brand-error:   #C43A3A;   /* Error states (brand-tuned) */
```

Tailwind classes generated automatically: `bg-navy`, `text-navy`, `border-navy`, `bg-charcoal`, `text-stone`, `bg-flax`, etc.

---

### 2.3 Dark Canvas — Semantic Tokens (Default `:root`)

| CSS Variable | Value | Tailwind Class | Role |
|---|---|---|---|
| `--color-background` | `#0A0A0A` | `bg-background` | Page background |
| `--color-surface` | `#111111` | `bg-surface` | Sidebar, table header |
| `--color-card` | `#181818` | `bg-card` | Cards, modals, dropdowns |
| `--color-primary` | `#7C3AED` | `bg-primary`, `text-primary` | Primary CTA (dashboard) |
| `--color-primary-hover` | `#6D28D9` | `bg-primary-hover` | Primary CTA hover |
| `--color-secondary` | `#A78BFA` | `text-secondary` | Secondary accents |
| `--color-foreground` | `#FFFFFF` | `text-foreground` | Primary body text |
| `--color-muted` | `#9CA3AF` | `text-muted` | Secondary text |
| `--color-border` | `#262626` | `border-border` | All borders |
| `--color-input` | `#1A1A1A` | `bg-input` | Form field backgrounds |
| `--color-destructive` | `#EF4444` | `text-destructive` | Error text/icon |
| `--color-success` | `#10B981` | `text-success` | Success text/icon |
| `--color-warning` | `#F59E0B` | `text-warning` | Warning text/icon |
| `--color-info` | `#3B82F6` | `text-info` | Info text/icon |

---

### 2.4 Light Canvas — Semantic Tokens (`[data-color-scheme="light"]`)

| CSS Variable | Value | Role |
|---|---|---|
| `--color-background` | `#FDFAF6` | Page background (Warm White) |
| `--color-surface` | `#F9F0E3` | Section backgrounds (Cream) |
| `--color-card` | `#FFFFFF` | Cards, inputs, modals |
| `--color-primary` | `#2B3875` | Primary CTA → Navy replaces purple |
| `--color-primary-hover` | `#1E2850` | Navy deep hover |
| `--color-secondary` | `#6B5FAE` | Secondary → Indigo |
| `--color-foreground` | `#2C2620` | Primary text (Charcoal) |
| `--color-muted` | `#8A8070` | Secondary text (Stone) |
| `--color-border` | `#D8CFC0` | Borders (Flax) |
| `--color-input` | `#FFFFFF` | Input backgrounds |
| `--color-destructive` | `#C43A3A` | Error (brand-tuned warm red) |
| `--color-success` | `#2D8A5E` | Success (brand-tuned green) |
| `--color-warning` | `#C47C1A` | Warning (brand-tuned amber) |
| `--color-info` | `#3B82F6` | Info (unchanged) |

Light shadows:
```css
--shadow-sm: 0 1px 3px 0 rgb(43 56 117 / 0.08);    /* Navy-tinted */
--shadow-md: 0 4px 12px -2px rgb(43 56 117 / 0.10);
--shadow-lg: 0 8px 24px -4px rgb(43 56 117 / 0.12);
```

---

### 2.5 Colour Usage Rules

- **Never use brand hex values directly in component className.** Use CSS variable utilities (`text-foreground`, `bg-card`, etc.) so they adapt between canvases.
- **Exception:** Brand panel background, icon containers, and semantic status colours (error/warning/success) in static screens use hardcoded hex via `style={}` because they must not change between canvases.
- **Alpha utilities:** `bg-navy/8`, `bg-primary/15`, `border-navy/25` — use slash notation for opacity. Works with Tailwind v4 and CSS variables.
- **Selection highlight:** `rgb(107 95 174 / 0.2)` — indigo at 20% (set globally in globals.css).

---

## 3. Typography

### 3.1 Font Family

**Primary:** Plus Jakarta Sans — the ScouttOpp brand typeface.  
**Mono:** Geist Mono — code blocks, timestamps, numeric data.

```css
/* @theme inline in globals.css */
--font-sans: var(--font-plus-jakarta-sans), ui-sans-serif, system-ui, sans-serif;
--font-mono: var(--font-geist-mono), ui-monospace, monospace;
```

Loaded via `next/font/google` in `app/layout.tsx` with weights: `400, 500, 600, 700, 800`.  
Font display: `swap`. Subsets: `latin`.

---

### 3.2 Type Scale

| Name | Size | px (at 16px root) | Weight | Usage |
|---|---|---|---|---|
| `text-5xl` | 3rem | 48px | 800 ExtraBold | Marketing hero headings |
| `text-4xl` | 2.25rem | 36px | 800 ExtraBold | Landing page section heads |
| `text-3xl` | 1.875rem | 30px | 800 ExtraBold | **Auth page headings** |
| `text-2xl` | 1.5rem | 24px | 700 Bold | Dashboard section headings |
| `text-xl` | 1.25rem | 20px | 600 SemiBold | Card headings, modal titles |
| `text-lg` | 1.125rem | 18px | 600 SemiBold | Subsection headings, stat labels |
| `text-base` | 1rem | 16px | 400 Regular | Body copy, button text (lg) |
| `text-sm` | 0.875rem | 14px | 400 Regular | **Default body**, form labels, button text (md) |
| `text-xs` | 0.75rem | 12px | 500 Medium | Captions, helper text, badges, button text (sm) |
| `text-[10px]` | 0.625rem | 10px | 500 Medium | Timestamps, avatar initials (xs) |

---

### 3.3 Font Weight Usage

| Weight | Value | Name | Used For |
|---|---|---|---|
| `font-normal` | 400 | Regular | Body text, descriptions, muted copy |
| `font-medium` | 500 | Medium | Form labels, badge text, nav items (inactive) |
| `font-semibold` | 600 | SemiBold | Card titles, active nav, link text, button labels |
| `font-bold` | 700 | Bold | Secondary headings, data values |
| `font-extrabold` | 800 | ExtraBold | **All page-level h1 headings** (`text-3xl font-extrabold`) |

---

### 3.4 Line Heights

| Tailwind | Value | Used For |
|---|---|---|
| `leading-tight` | 1.25 | All headings (`h1`, `h2`) |
| `leading-snug` | 1.375 | Sub-headings, card titles |
| `leading-normal` | 1.5 | Default (set on `body`) |
| `leading-relaxed` | 1.625 | Long-form descriptive paragraphs, muted subtext |

---

### 3.5 Letter Spacing

| Tailwind | Value | Used For |
|---|---|---|
| `tracking-tight` | -0.025em | Page headings (`text-3xl` and above) |
| `tracking-normal` | 0 | All body text |
| `tracking-wide` | 0.025em | Badge labels, pill text |
| `tracking-wider` | 0.05em | — |
| `tracking-widest` | 0.1em | `OR` divider text, micro-caps overlines |

---

### 3.6 Typography Rules

- All auth page headings: `text-3xl font-extrabold text-foreground tracking-tight`
- All auth page subheadings: `text-base text-muted leading-relaxed`
- Form labels: `text-sm font-medium text-foreground`
- Helper text: `text-xs text-muted`
- Error text: `text-xs text-destructive` with `role="alert"`
- Link text inline: `font-semibold hover:underline` + `style={{ color: '#2B3875' }}` on light canvas
- Heading + subtext pairing always uses `space-y-1.5` or `space-y-2` between them

---

## 4. Spacing System

### 4.1 Base Unit

`4px` (0.25rem). All spacing values are multiples of this unit.

### 4.2 Scale Reference

| Tailwind | rem | px | Common Use |
|---|---|---|---|
| `0.5` | 0.125rem | 2px | Fine gaps between related elements |
| `1` | 0.25rem | 4px | Icon-to-label gap (xs) |
| `1.5` | 0.375rem | 6px | Form field internal gap (label → input) |
| `2` | 0.5rem | 8px | Badge padding y, tight component gaps |
| `2.5` | 0.625rem | 10px | Chip padding, small icon padding |
| `3` | 0.75rem | 12px | — |
| `3.5` | 0.875rem | 14px | — |
| `4` | 1rem | 16px | Card header/footer gap, default icon padding |
| `5` | 1.25rem | 20px | **Default card padding** |
| `6` | 1.5rem | 24px | **Section padding, modal body/header padding** |
| `7` | 1.75rem | 28px | — |
| `8` | 2rem | 32px | Vertical space between form sections |
| `10` | 2.5rem | 40px | — |
| `12` | 3rem | 48px | Auth form top/bottom padding (mobile) |
| `16` | 4rem | 64px | Auth form top/bottom padding (desktop) |

### 4.3 Component Spacing Rules

| Component | Rule |
|---|---|
| Form label → input | `gap-1.5` (6px) |
| Input → helper/error | `gap-1` (4px) |
| Form field → next field | `space-y-5` (20px) |
| Icon → text in button | `gap-2` (md), `gap-2.5` (lg), `gap-1.5` (sm) |
| Card header → body | `mb-4` (16px) |
| Card body → footer | `mt-4 pt-4 border-t` |
| Section heading → content | `space-y-1.5` to `space-y-2` |
| Badge clusters | `gap-1.5` or `gap-2` |
| Modal header padding | `px-6 pt-6 pb-4` |
| Modal body padding | `px-6 py-5` |
| Modal footer padding | `px-6 pb-6 pt-4` |

### 4.4 Page-Level Spacing

| Context | Horizontal padding | Vertical padding |
|---|---|---|
| Auth form container | `px-6` | `py-12` (mobile) / `py-16` (lg+) |
| Auth form max-width | `max-w-110` (440px) | — |
| Dashboard content | `px-6` (mobile) / `px-8` (lg+) | `py-6` to `py-8` |
| Dashboard max-width | `max-w-7xl mx-auto` | — |
| Admin table page | `px-6` | `py-6` |

---

## 5. Grid & Layout

### 5.1 Auth Layout (Two-Panel)

```
┌──────────────────────────────────────────────────────────┐
│         Left Panel (hidden < lg)      │  Right Panel     │
│         42% width (lg) / 40% (xl+)   │  flex-1          │
│         background: #2B3875 (Navy)    │  bg: #FDFAF6     │
│         data-color-scheme: [none]     │  data-color-     │
│                                       │  scheme="light"  │
│  BrandPanel (Server Component)        │  {children}      │
│  - Logo + S-mark                      │  Centred form    │
│  - Hero text                          │  max-w-110       │
│  - Feature list                       │                  │
│  - Testimonial                        │                  │
└──────────────────────────────────────────────────────────┘
```

Implementation: `app/auth/layout.tsx`  
Left panel hides entirely below `lg` (1024px). A mobile header with logo appears at the top of the right panel on small screens.

### 5.2 Dashboard Layout

```
┌──────────────────────────────────────────────────────────┐
│                   Top Bar (h-16 / 64px)                  │
│  [Logo]  [Nav breadcrumb]             [User avatar/menu] │
├──────────────┬───────────────────────────────────────────┤
│              │                                           │
│   Sidebar    │         Main Content Area                 │
│  (w-60/     │  (flex-1, overflow-y-auto)                │
│   240px,     │  px-6–px-8, py-6–py-8                   │
│   fixed)     │  max-w-7xl mx-auto                       │
│              │                                           │
│  [Nav items] │                                           │
│              │                                           │
└──────────────┴───────────────────────────────────────────┘
```

- Sidebar collapses to a drawer (off-canvas) below `lg`.
- Content area has its own `overflow-y-auto` — page never scroll the sidebar.
- All dashboard pages are wrapped in `bg-background` (dark canvas default).

### 5.3 Admin Layout

Same as Dashboard Layout. Admin sidebar items differ; the admin shell reuses the same layout components.

### 5.4 Content Column Grid

Inside the content area, use CSS grid for multi-column layouts:

| Columns | Class | When Used |
|---|---|---|
| 1 | (default) | Detail pages, forms |
| 2 | `grid grid-cols-2 gap-6` | Stat cards, side-by-side panels |
| 3 | `grid grid-cols-3 gap-6` | Stat cards row (desktop) |
| 4 | `grid grid-cols-4 gap-4` | Compact metric tiles |
| Responsive | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6` | Card grids |

### 5.5 Max Widths

| Token | Value | Used For |
|---|---|---|
| `max-w-sm` | 384px | Small modals |
| `max-w-md` | 448px | Medium modals, narrow forms |
| `max-w-110` | 440px | Auth form container |
| `max-w-lg` | 512px | Large modals |
| `max-w-2xl` | 672px | XL modals |
| `max-w-3xl` | 768px | Detail panel content |
| `max-w-5xl` | 1024px | Wide content pages |
| `max-w-7xl` | 1280px | Dashboard content max width |

---

## 6. Responsive Breakpoints

| Breakpoint | Width | Behaviour |
|---|---|---|
| *(default)* | 0px | Single column, all panels stacked, sidebar hidden |
| `sm` | 640px | Minor layout adjustments, some 2-column grids begin |
| `md` | 768px | Tablet layout, card grids expand |
| `lg` | 1024px | **Key breakpoint:** auth left panel appears, sidebar becomes fixed |
| `xl` | 1280px | Auth left panel narrows to 40%, grid expands |
| `2xl` | 1536px | Max-width containers kick in, ultra-wide handled |

### Mobile-First Rules

- Write base styles for mobile, override at `lg:` for desktop.
- Auth left panel: `hidden lg:flex`
- Sidebar: `hidden lg:block` (drawer on mobile, fixed on desktop)
- Form widths: `w-full` always — max-width on the container, not the field.
- Touch targets: minimum `h-10` (40px) for all interactive elements. Prefer `h-12` (48px) for primary CTAs.

---

## 7. Shape — Border Radius

Defined in `@theme` in `globals.css`.

| Token | Value | px | Tailwind Equivalent | Used For |
|---|---|---|---|---|
| `--radius-xs` | 0.25rem | 4px | `rounded-sm` | Badge dots, fine details |
| `--radius-sm` | 0.375rem | 6px | `rounded` | Small badges (sm size), dismiss buttons |
| `--radius-md` | 0.5rem | 8px | `rounded-md` | Badges (md size), tooltips |
| `--radius-lg` | 0.75rem | 12px | `rounded-lg` | Buttons (md size), input fields, menu items |
| `--radius-xl` | 1rem | 16px | `rounded-xl` | Buttons (lg size), alert banners, toast |
| `--radius-2xl` | 1.5rem | 24px | `rounded-2xl` | **Cards, modals, role-select cards, info boxes** |
| `--radius-full` | 9999px | — | `rounded-full` | Avatars, status dots, pills |

### Usage Rules

- **Cards always `rounded-2xl`.** This is the primary shape signature of ScouttOpp.
- **Interactive form elements (inputs, selects) `rounded-lg`.**
- **Buttons:** `rounded-md` (sm), `rounded-lg` (md), `rounded-xl` (lg).
- **Modals `rounded-2xl`** — matches cards.
- **Badges:** `rounded-md` (sm), `rounded-lg` (md).
- **Avatars always `rounded-full`.**
- **Icon containers (square accent blocks) `rounded-xl` or `rounded-2xl`** depending on size.

---

## 8. Shadows & Elevation

### 8.1 Dark Canvas Shadows

```css
--shadow-sm:   0 1px 2px 0 rgb(0 0 0 / 0.5);
--shadow-md:   0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5);
--shadow-lg:   0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5);
--shadow-xl:   0 20px 25px -5px rgb(0 0 0 / 0.6), 0 8px 10px -6px rgb(0 0 0 / 0.5);
--shadow-glow: 0 0 24px rgb(124 58 237 / 0.35);   /* Purple glow — primary on dark canvas */
```

### 8.2 Light Canvas Shadows

Navy-tinted (not black-tinted) — feel warmer and brand-consistent.

```css
--shadow-sm: 0 1px 3px 0 rgb(43 56 117 / 0.08);
--shadow-md: 0 4px 12px -2px rgb(43 56 117 / 0.10);
--shadow-lg: 0 8px 24px -4px rgb(43 56 117 / 0.12);
```

### 8.3 Elevation Layers

| Layer | Shadow | Used For |
|---|---|---|
| 0 — Flat | none | Default cards, table rows |
| 1 — Raised | `shadow-sm` | Hovered table rows, focus states |
| 2 — Floating | `shadow-md` | Dropdowns, tooltips |
| 3 — Overlay | `shadow-lg` | Modals, drawers |
| 4 — Top | `shadow-xl` | Full-screen modals, critical overlays |
| Glow | `shadow-glow` | Active/highlighted cards on dark canvas |

### 8.4 Interactive Card Hover

```tsx
// Interactive cards use Framer Motion (from card.tsx):
whileHover={{ y: -4, boxShadow: '0 12px 24px -4px rgb(0 0 0 / 0.5)' }}
transition={{ type: 'spring', stiffness: 400, damping: 30 }}
```

---

## 9. Iconography

### 9.1 Library

**lucide-react v1** — the sole icon library. Import named exports.

```tsx
import { Mail, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react'
```

### 9.2 Brand Icons

`lucide-react` v1 **does not include brand logos** (Google, LinkedIn, GitHub, etc.). Use inline SVG for all brand marks.

```tsx
// Google logo — always inline SVG (4 paths, brand colours)
// See: components/auth/google-button.tsx
// See: components/auth/brand-panel.tsx (S-mark logo)
```

### 9.3 Icon Sizes

| Size | px | `size` prop | Used For |
|---|---|---|---|
| Micro | 12px | `size={12}` | Badge dismiss button |
| XSmall | 14px | `size={14}` | Inline text icons (xs text) |
| Small | 16px | `size={16}` | Alert/banner icons, form helper icons |
| Default | 18px | `size={18}` | Navigation items, modal close |
| Medium | 20px | `size={20}` | Card action icons |
| Large | 22px–24px | `size={22}` | Role-select card icons |
| Hero | 28px | `size={28}` | Auth screen status icons (in 64px container) |
| XLarge | 36px | `size={36}` | Full-page loading states |

### 9.4 Stroke Width

Default `strokeWidth` is `2`. Use `strokeWidth={1.5}` for hero/large icons (28px+) — lighter weight reads better at size.

### 9.5 Usage Rules

- **Icon-only buttons must have `aria-label`** describing the action.
- **Decorative icons must have `aria-hidden="true"`.**
- **Never use colour alone** to convey icon meaning — always pair with a label or tooltip.
- Icons within text must be `aria-hidden="true"` with label provided by surrounding text.

---

## 10. Animation & Motion

### 10.1 Motion Principles

1. **Purposeful.** Only animate things that communicate a state change (loading, error, selection, completion).
2. **Fast.** UI animations under 250ms. Data animations under 400ms. Never use long durations for UI.
3. **Spring for interactive, ease-out for data.** Button taps and card lifts use spring. Toasts and page fades use cubic-bezier.
4. **Exit fast.** Exit animations are always shorter than enter. Users are impatient to leave.
5. **Reduced motion respected.** All keyframe CSS respects `prefers-reduced-motion`. Framer Motion handles this natively.

### 10.2 Duration Scale (`lib/tokens.ts`)

| Token | Duration | Easing | Used For |
|---|---|---|---|
| `transitions.fast` | 150ms | `[0.4, 0, 0.2, 1]` | Hover/focus colour changes, exits |
| `transitions.normal` | 250ms | `[0.4, 0, 0.2, 1]` | Fade in, banner appear, page elements |
| `transitions.slow` | 400ms | `[0.4, 0, 0.2, 1]` | Complex multi-step transitions |
| `transitions.spring` | — | `stiffness: 400, damping: 30` | Checkbox check, button tap, card lift |
| `transitions.springBouncy` | — | `stiffness: 300, damping: 20` | Playful interactions (future swipe) |

### 10.3 Framer Motion Variants (`lib/tokens.ts`)

| Variant | Effect | Use Case |
|---|---|---|
| `fadeVariants` | opacity 0→1 | Overlay fades, content panels |
| `fadeUpVariants` | opacity + y: 16→0 | Staggered list items, page content |
| `fadeDownVariants` | opacity + y: -16→0 | Dropdowns, banner appearing |
| `scaleVariants` | opacity + scale: 0.95→1 | **Modals, popups** |
| `slideRightVariants` | x: 100%→0 | Drawers from right |
| `slideLeftVariants` | x: -100%→0 | Drawers from left |
| `overlayVariants` | opacity 0→1 (slightly delayed exit) | **Modal backdrop** |

### 10.4 Micro-Interaction Tokens

```ts
buttonTap  = { scale: 0.97 }                          // All button whileTap
cardHover  = { y: -4, transition: transitions.spring } // Interactive card whileHover
iconHover  = { rotate: 15, scale: 1.1, ... }           // Icon button whileHover (use sparingly)
```

Button hover: `whileHover={{ scale: 1.01 }}` — subtle, never `1.05`.

### 10.5 CSS Keyframe Animations

Defined in `globals.css`. Applied via utility classes.

| Class | Keyframe | Duration | Use Case |
|---|---|---|---|
| `animate-shake` | `shake` | 350ms ease-out | Credential error — form shakes horizontally |
| `animate-pulse-ring` | `pulse-ring` | 2s infinite | Timeline step indicators, live status |
| `animate-spin` | (Tailwind built-in) | 750ms | Spinner, loading icons |
| `.skeleton` | `shimmer` | 1.5s infinite | All skeleton loaders |

### 10.6 AnimatePresence Pattern

Always wrap conditionally rendered UI in `AnimatePresence`. Use `key` to force re-mount on content change.

```tsx
<AnimatePresence>
  {showError && (
    <motion.div
      key="error-banner"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* error content */}
    </motion.div>
  )}
</AnimatePresence>
```

### 10.7 Reduced Motion

```css
/* globals.css — prefers-reduced-motion block */
@media (prefers-reduced-motion: reduce) {
  .skeleton           { animation: none; background: var(--color-surface); }
  .animate-shake      { animation: none; }
  .animate-pulse-ring { animation: none; }
}
```

Framer Motion automatically disables animations when the user has enabled "reduce motion" in their OS. No additional work required in components.

---

## 11. Components

### 11.1 Buttons

**File:** `components/ui/button.tsx`  
**Type:** Client Component (Framer Motion)

#### Variants

| Variant | Light Canvas | Dark Canvas | Use Case |
|---|---|---|---|
| `primary` | Navy bg, white text | Purple bg, white text | **One per view** — main CTA |
| `secondary` | Indigo tint bg, indigo border | Purple tint, purple border | Secondary paired action |
| `outline` | Transparent, flax border | Transparent, dark border | Tertiary actions |
| `ghost` | Transparent, no border | Transparent, no border | Contextual low-priority |
| `destructive` | Red tint, red border | Red tint, red border | Irreversible actions |
| `icon` | Transparent, square, rounded-full | Same | Icon-only buttons |

#### Sizes

| Size | Height | Padding | Font | Radius | Use Case |
|---|---|---|---|---|---|
| `sm` | `h-8` (32px) | `px-3` | `text-xs` | `rounded-md` | Dense UIs, table actions |
| `md` | `h-10` (40px) | `px-4` | `text-sm` | `rounded-lg` | Default |
| `lg` | `h-12` (48px) | `px-6` | `text-base` | `rounded-xl` | Auth forms, primary CTAs |

#### States

- **loading:** Shows `Loader2` spinner + children. `aria-busy="true"`. Pointer events disabled.
- **disabled:** `opacity-40`, `pointer-events-none`, `aria-disabled="true"`.
- **hover:** `scale: 1.01` (Framer Motion).
- **tap:** `scale: 0.97` (`buttonTap` from tokens).
- **focus-visible:** `ring-2 ring-primary ring-offset-2 ring-offset-background`.

#### Usage Rules

- Exactly **one `variant="primary"` button per screen**.
- `size="lg"` is required for all auth form submit buttons.
- Loading text should end with `…` (e.g., `"Signing in…"`, `"Saving…"`).
- Button width: `w-full` in forms; auto-width in toolbars and card footers.

---

### 11.2 Form Inputs

**File:** `components/ui/input.tsx`  
**Type:** Server Component (no client hooks except `useId`)

```tsx
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  autoComplete="email"
  required
  error={errors.email?.message}
  helperText="We'll never share your email."
  leftIcon={<Mail size={16} />}
  {...register('email')}
/>
```

#### Anatomy

```
[Label]  (* if required)
[icon] [                input field                ] [icon]
[error message] or [helper text]
```

- Height: `h-10` (40px)
- Border: `border-border`, hover: `border-muted/50`, focus: `border-primary + ring-2 ring-primary/50`
- Error: `border-destructive`, ring: `ring-destructive/40`
- `aria-invalid` set when error present
- `aria-describedby` points to error or helper text id
- Error text: `role="alert"` for screen readers

#### States

| State | Visual |
|---|---|
| Default | `border-border bg-input` |
| Hover | `border-muted/50` |
| Focus | `border-primary ring-2 ring-primary/50` |
| Error | `border-destructive ring-destructive/40` — error message below |
| Disabled | `opacity-50 cursor-not-allowed` |

---

### 11.3 Password Input

**File:** `components/ui/password-input.tsx`  
**Type:** Client Component

Wraps `Input`. Adds an `Eye` / `EyeOff` toggle icon in the right slot. `type` toggles between `"password"` and `"text"`. Toggle button has `aria-label="Show/Hide password"`.

---

### 11.4 Password Strength

**File:** `components/auth/password-strength.tsx`

4-segment animated bar beneath password fields. Renders `null` when password is empty.

| Score | Label | Colour | Condition |
|---|---|---|---|
| 0 | *(empty)* | — | No input |
| 1 | Weak | `#C43A3A` | Only length ≥ 8 |
| 2 | Fair | `#C47C1A` | Length + case mix OR length ≥ 12 |
| 3 | Good | `#2D8A5E` | Length + case mix + numbers+symbols |
| 4 | Strong | `#2D8A5E` | All criteria + length ≥ 12 |

Segments animate colour via `motion.span animate={{ backgroundColor }}`.  
`role="status"` `aria-live="polite"` for screen reader announcements.

---

### 11.5 Checkbox

**File:** `components/ui/checkbox.tsx`  
**Type:** Client Component

```tsx
<Checkbox
  label="Remember me for 30 days"       // string or ReactNode
  description="Optional helper below"   // optional
  error="Required"                       // optional
/>
```

- Visual: 20×20px box, `rounded-md`, `border-2`.
- Checked: `bg-primary border-primary` + animated `Check` icon (spring scale 0→1).
- Error state: `border-destructive bg-destructive`.
- `label` accepts `ReactNode` — enables inline links (terms checkbox).

---

### 11.6 Radio Cards

**File:** `components/auth/role-select-form.tsx` (implementation reference)  
**Pattern:** `motion.button role="radio"` grouped in `div role="radiogroup"`

#### Anatomy

```
[Icon container 48×48px rounded-xl]  [Title + Badge chip]
                                      [Description text]
                                                        [Radio dot 20×20px]
```

#### Selected State

- Border: `border-2 border-navy`
- Background: `bg-navy/[0.04]`
- Icon container: `bg-navy` (white icon)
- Title: `text-navy font-bold`
- Radio dot: `bg-navy border-navy` + inner white dot (spring animated)

#### Unselected State

- Border: `border-2 border-flax`
- Hover: `border-stone/50 bg-vellum/40`
- Icon container: `bg-flax` (stone icon)

---

### 11.7 Select

**File:** `components/ui/select.tsx`

Styled native `<select>` element with custom chevron. Matches Input height and border behaviour. On light canvas, background is `bg-input` (white). Accessible via OS-native keyboard navigation.

---

### 11.8 Textarea

**File:** `components/ui/textarea.tsx`

Extends Input patterns. `resize-y` only (never `resize-x`). Character count displayed below when `maxLength` is set: `text-xs text-muted` right-aligned. Error state matches Input.

---

### 11.9 Cards

**File:** `components/ui/card.tsx`  
**Type:** Client Component (interactive variant), Server Component (static)

```tsx
// Static card
<Card>
  <CardHeader>
    <CardTitle>Card heading</CardTitle>
    <CardDescription>Supporting text</CardDescription>
  </CardHeader>
  <CardBody>Content</CardBody>
  <CardFooter>
    <Button variant="outline" size="sm">Action</Button>
  </CardFooter>
</Card>

// Interactive (hover lift)
<Card interactive>…</Card>

// Glow (dark canvas highlight)
<Card glow>…</Card>

// No padding (for media cards)
<Card noPadding>…</Card>
```

#### Specs

| Property | Value |
|---|---|
| Background | `bg-card` |
| Border | `border border-border` |
| Radius | `rounded-xl` (base) — use `rounded-2xl` for featured/large cards |
| Padding | `p-5` (20px) default |
| Hover lift | `y: -4`, `shadow` (spring transition) |

#### Card Variants (semantic, not props)

| Variant | When | Treatment |
|---|---|---|
| Default | List items, stat tiles | `bg-card border-border` |
| Featured | Hero section, primary content | `rounded-2xl`, larger padding |
| Info box | Explanatory content in forms | `bg-cream/40 border-flax rounded-xl` on light canvas |
| Warning box | Destructive action warnings | `border-warning/25 bg-warning/4` |
| Error box | Inline error explanations | `border-destructive/30 bg-destructive/6` |
| Success box | Completion confirmation | `border-success/30 bg-success/6` |

---

### 11.10 Badges

**File:** `components/ui/badge.tsx`  
**Type:** Server Component

```tsx
<Badge variant="success" size="md" dot>Active</Badge>
<Badge variant="warning" onDismiss={() => remove(id)}>Pending</Badge>
```

#### Variants

| Variant | Background | Text | Border |
|---|---|---|---|
| `default` | `bg-white/8` | `text-muted` | `border-border` |
| `primary` | `bg-primary/15` | `text-secondary` | `border-primary/30` |
| `success` | `bg-success/15` | `text-success` | `border-success/30` |
| `warning` | `bg-warning/15` | `text-warning` | `border-warning/30` |
| `destructive` | `bg-destructive/15` | `text-destructive` | `border-destructive/30` |
| `outline` | transparent | `text-muted` | `border-border` |

On the **light canvas**, these same variant classes resolve to brand-warm colours via the CSS variable override.

#### Sizes

| Size | Height | Padding | Radius |
|---|---|---|---|
| `sm` | ~20px | `px-2 py-0.5` | `rounded-md` |
| `md` | ~24px | `px-2.5 py-1` | `rounded-lg` |

#### Optional Features

- `dot`: coloured status dot before label.
- `onDismiss`: adds × button with `aria-label="Dismiss"`.

---

### 11.11 Chips / Tags

Chips are dismissible badges used for selected filters, specialties, and tags. They use `Badge` with `onDismiss` prop and `variant="primary"` or `variant="outline"`.

```tsx
// Specialty chip
<Badge variant="primary" size="sm" onDismiss={() => removeSpecialty(id)}>
  Motion Graphics
</Badge>

// Filter chip (inactive/active toggle)
<button className={cn(
  'h-7 px-3 rounded-full text-xs font-medium border transition-colors duration-150',
  active
    ? 'bg-navy text-white border-navy'
    : 'bg-transparent text-muted border-flax hover:border-stone',
)}>
  Remote
</button>
```

---

### 11.12 Tables

No dedicated component file yet. Use this pattern consistently across all table screens (admin, candidate list, employer list).

#### Structure

```tsx
<div className="w-full overflow-x-auto rounded-2xl border border-border">
  <table className="w-full text-sm">
    <thead>
      <tr className="bg-surface border-b border-border">
        <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
          Name
        </th>
        {/* … */}
      </tr>
    </thead>
    <tbody className="divide-y divide-border">
      <tr className="hover:bg-surface/50 transition-colors duration-100 cursor-pointer">
        <td className="px-4 py-3.5 text-foreground">Maya Rodriguez</td>
        {/* … */}
      </tr>
    </tbody>
  </table>
</div>
```

#### Column Alignment Rules

- Text columns: `text-left`
- Numeric/date columns: `text-right`
- Status badges: `text-center`
- Action columns: `text-right`

#### Responsive

Wrap the entire table in `overflow-x-auto`. On mobile, tables scroll horizontally — they do not collapse to cards (use cards if mobile-first design is required).

#### Empty Table State

When no rows exist, replace `<tbody>` rows with a single full-width empty state cell:

```tsx
<tr>
  <td colSpan={columnCount} className="py-16 text-center">
    <EmptyState icon={Users} heading="No candidates yet" />
  </td>
</tr>
```

---

### 11.13 Modals

**File:** `components/ui/modal.tsx`  
**Type:** Client Component (portal, focus trap, Framer Motion)

```tsx
<Modal
  open={isOpen}
  onClose={() => setOpen(false)}
  title="Confirm approval"
  description="This action cannot be undone."
  size="md"
  footer={
    <>
      <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={handleApprove}>Approve</Button>
    </>
  }
>
  <p className="text-sm text-muted">Are you sure you want to approve this candidate?</p>
</Modal>
```

#### Sizes

| Size | Max Width |
|---|---|
| `sm` | 384px |
| `md` | 448px |
| `lg` | 512px |
| `xl` | 672px |
| `full` | `calc(100vw - 2rem)` |

#### Behaviour

- Renders via `createPortal` into `document.body`.
- Backdrop: `bg-black/70 backdrop-blur-sm` — blocks scroll.
- Focus trap: Tab cycles within modal, Shift+Tab reverses.
- Escape closes (when `closable={true}`, the default).
- On open: auto-focuses first focusable element.
- On close: returns focus to the triggering element.
- Body scroll: locked while open (`overflow: hidden`).
- Animations: backdrop uses `overlayVariants`, panel uses `scaleVariants`.

---

### 11.14 Alerts & Banners

Not a separate component file yet. Use this pattern consistently.

#### Inline Alert (inside forms, within content)

```tsx
// Error
<div
  className="flex items-start gap-3 rounded-xl border p-4"
  style={{ background: 'rgba(196, 58, 58, 0.06)', borderColor: 'rgba(196, 58, 58, 0.3)' }}
  role="alert"
  aria-live="assertive"
>
  <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: '#C43A3A' }} aria-hidden="true" />
  <p className="text-sm" style={{ color: '#C43A3A' }}>{message}</p>
</div>

// Success
// Replace: color #2D8A5E, icon CheckCircle2
// Warning: color #C47C1A, icon AlertTriangle
// Info: color #3B82F6, icon Info
```

#### Alpha Values for Alert Backgrounds (by variant)

| Variant | Background | Border |
|---|---|---|
| Error | `rgba(196, 58, 58, 0.06)` | `rgba(196, 58, 58, 0.30)` |
| Success | `rgba(45, 138, 94, 0.06)` | `rgba(45, 138, 94, 0.30)` |
| Warning | `rgba(196, 124, 26, 0.06)` | `rgba(196, 124, 26, 0.30)` |
| Info | `rgba(59, 130, 246, 0.06)` | `rgba(59, 130, 246, 0.30)` |

#### Page Banner (full-width, above content)

```tsx
<div className="border-b border-warning/25 bg-warning/5 px-6 py-3 flex items-center gap-3">
  <AlertTriangle size={16} className="text-warning shrink-0" />
  <p className="text-sm text-foreground">
    Your account is under review. Some features are restricted.
  </p>
</div>
```

Wrap all animated banners in `AnimatePresence` with `motion.div initial={{ opacity: 0, y: -6 }}`.

---

### 11.15 Toasts

**File:** `components/ui/toast.tsx`  
**Library:** Sonner v2

#### Setup

Add `<Toaster />` once in the root layout (`app/layout.tsx`):

```tsx
import { Toaster } from '@/components/ui/toast'
// In the layout JSX:
<Toaster position="bottom-right" richColors duration={4000} />
```

#### Triggering Toasts

```tsx
import { toast } from '@/components/ui/toast'

toast.success('Candidate approved.')
toast.error('Failed to save. Please try again.')
toast.warning('Your session expires in 5 minutes.')
toast.info('Sync complete — 12 new candidates imported.')
toast.loading('Syncing from Google Sheets…')

// Promise pattern (replaces loading state automatically)
toast.promise(syncSheets(), {
  loading: 'Syncing…',
  success: (data) => `${data.count} candidates imported.`,
  error: 'Sync failed.',
})
```

#### Styling Spec (dark canvas defaults)

```
background:    #181818
border:        1px solid #262626
border-radius: 0.75rem (rounded-xl)
font-family:   inherit (Plus Jakarta Sans)
shadow:        shadow-lg
title:         text-sm font-semibold text-white
description:   text-xs text-[#9CA3AF]
```

---

### 11.16 Spinner

**File:** `components/ui/spinner.tsx`  
**Type:** Server Component

Custom SVG spinner — a 75% arc rotating at 750ms.

```tsx
<Spinner size="md" label="Loading candidates…" />
```

| Size | px | Stroke |
|---|---|---|
| `xs` | 12 | 2.5 |
| `sm` | 16 | 2.5 |
| `md` | 24 | 2.0 |
| `lg` | 32 | 2.0 |
| `xl` | 48 | 1.5 |

Always includes `role="status"` and `aria-label`. Inner text is visually hidden via `sr-only`.

---

### 11.17 Skeleton Loaders

**Class:** `.skeleton` (defined in `globals.css`)  
**Pattern:** Match the shape/size of the content that will replace it.

```tsx
// Text line
<div className="skeleton h-4 w-48 rounded-md" />

// Heading
<div className="skeleton h-7 w-64 rounded-md" />

// Avatar
<div className="skeleton w-10 h-10 rounded-full" />

// Card
<div className="skeleton w-full h-32 rounded-2xl" />

// Button
<div className="skeleton h-10 w-28 rounded-lg" />

// Table row (repeat 5×)
<div className="flex items-center gap-4 px-4 py-3.5 border-b border-border">
  <div className="skeleton w-8 h-8 rounded-full" />
  <div className="skeleton h-4 w-40 rounded-md" />
  <div className="skeleton h-4 w-24 rounded-md ml-auto" />
</div>
```

Shimmer animation: `1.5s ease-in-out infinite`. Disabled with `prefers-reduced-motion`.

#### Skeleton Screen Rules

- Show skeleton for **any content that takes > 200ms to load**.
- Skeleton must **match the exact layout** of the loaded content — same height, same width, same spacing. Users should feel the content "fills in".
- Never mix skeleton and loaded content in the same view.

---

### 11.18 Empty States

No component file yet. Use this pattern.

#### Three Empty State Types

**1. No Content Yet**
```tsx
<div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
  <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center">
    <Users size={28} className="text-muted" strokeWidth={1.5} />
  </div>
  <div className="space-y-1.5 max-w-xs">
    <p className="text-base font-semibold text-foreground">No candidates yet</p>
    <p className="text-sm text-muted">
      Candidates will appear here after they&apos;ve been approved.
    </p>
  </div>
  <Button variant="primary" size="md">Sync from Sheets</Button>
</div>
```

**2. No Search Results**
```tsx
<div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
  <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center">
    <Search size={28} className="text-muted" strokeWidth={1.5} />
  </div>
  <div className="space-y-1.5 max-w-xs">
    <p className="text-base font-semibold text-foreground">
      No results for &ldquo;{query}&rdquo;
    </p>
    <p className="text-sm text-muted">Try different keywords or clear your filters.</p>
  </div>
  <Button variant="outline" size="md" onClick={clearSearch}>Clear search</Button>
</div>
```

**3. Error / Failed to Load**
```tsx
<div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
       style={{ background: 'rgba(196, 58, 58, 0.08)' }}>
    <AlertCircle size={28} strokeWidth={1.5} style={{ color: '#C43A3A' }} />
  </div>
  <div className="space-y-1.5 max-w-xs">
    <p className="text-base font-semibold text-foreground">Failed to load</p>
    <p className="text-sm text-muted">Something went wrong. Please try again.</p>
  </div>
  <Button variant="outline" size="md" onClick={retry}>Try again</Button>
</div>
```

#### Empty State Rules

- Icon container: always `w-16 h-16 rounded-2xl`.
- Heading: `text-base font-semibold text-foreground`.
- Description: `text-sm text-muted max-w-xs`.
- CTA: `size="md"`. Use primary only for "create first item" actions.
- Never show an empty state while data is still loading — show skeleton instead.

---

### 11.19 Avatars

**File:** `components/ui/avatar.tsx`  
**Type:** Client Component

```tsx
<Avatar src={user.avatarUrl} name="Maya Rodriguez" size="md" online />
<AvatarGroup avatars={members} size="sm" max={4} />
```

#### Sizes

| Size | Dimensions | Font |
|---|---|---|
| `xs` | 24×24px | 10px |
| `sm` | 32×32px | text-xs |
| `md` | 40×40px | text-sm |
| `lg` | 48×48px | text-base |
| `xl` | 64×64px | text-lg |

- Fallback: coloured initials background, seeded by name's first character.
- `online` prop: green/gray dot, `border-2 border-background`.
- Error handling: tracks failed `src` in state — falls back to initials without infinite retry loop.
- `AvatarGroup`: `-ml-2` overlap, `ring-2 ring-background`, overflow count as `+N` span.

---

### 11.20 Dividers

**File:** `components/auth/auth-divider.tsx`  
**Type:** Server Component

```tsx
// Horizontal with label
<AuthDivider label="or" />

// Plain horizontal rule (use inline TW)
<hr className="border-border" />

// Vertical divider
<div className="w-px h-6 bg-border" aria-hidden="true" />
```

---

## 12. Navigation Patterns

### 12.1 Auth Nav (Mobile-Only Header)

Visible only below `lg`. Rendered in `app/auth/layout.tsx`.

```
┌──────────────────────────────────────┐
│  [S-mark logo]  ScouttOpp            │
│                              px-6 py-5│
└──────────────────────────────────────┘
```

- Height: natural (`py-5` = 20px top+bottom, plus logo height)
- Border-bottom: `border-b border-flax`
- Logo: 32×32px navy square, rounded-lg, white S-mark SVG

### 12.2 Dashboard Sidebar

**Not yet implemented — spec for Phase 5.**

```
Width:        w-60 (240px) fixed, hidden on mobile
Background:   bg-surface
Border-right: border-r border-border
Padding:      px-3 py-4

Header:
  - Logo mark + "ScouttOpp" wordmark
  - px-3 pb-4 border-b border-border

Nav section:
  - Section label: text-xs font-medium text-muted uppercase tracking-wider px-3 mb-1
  - Nav item:      h-9 flex items-center gap-3 px-3 rounded-lg text-sm font-medium
    - Inactive:    text-muted hover:text-foreground hover:bg-white/5
    - Active:      bg-primary/15 text-primary font-semibold

Footer:
  - User avatar + name + role badge
  - Logout button (ghost, sm)
```

### 12.3 Dashboard Top Bar

```
Height:       h-16 (64px)
Background:   bg-surface
Border-bottom: border-b border-border
Padding:      px-6
Layout:       flex items-center justify-between

Left:  Page title (text-lg font-semibold text-foreground)
Right: Notification bell + Avatar (with dropdown)
```

---

## 13. Page Layout Patterns

### 13.1 Auth Form Pages

```tsx
// Every auth page uses this wrapper
<div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-16">
  <div className="w-full max-w-110 space-y-8">
    {/* icon (optional) */}
    {/* heading + subtext */}
    {/* error banner (AnimatePresence) */}
    {/* form or content */}
    {/* footer link */}
  </div>
</div>
```

Section spacing within the form container: `space-y-8` between all top-level sections.  
Form fields internally: `space-y-5`.

### 13.2 Dashboard Content Pages

```tsx
<div className="px-6 lg:px-8 py-6 lg:py-8">
  <div className="max-w-7xl mx-auto space-y-6">
    {/* Page header: title + actions */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Candidates</h1>
        <p className="text-sm text-muted mt-0.5">12 pending review</p>
      </div>
      <Button variant="primary" size="md">Sync</Button>
    </div>

    {/* Stats row */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Stat cards */}
    </div>

    {/* Main content */}
    <Card noPadding>
      {/* Table */}
    </Card>
  </div>
</div>
```

### 13.3 Static Info Screens (Rejected / Suspended)

Same as auth form page pattern but without a form. Content max-width `max-w-110`. Primary action is an `<a>` styled as a button (Server Component, no client bundle).

---

## 14. Accessibility Standards

### 14.1 Keyboard Navigation

Every interactive element must be reachable and operable via keyboard alone.

| Element | Keys |
|---|---|
| Buttons, links | `Tab` to focus, `Enter` / `Space` to activate |
| Custom radio cards | `Tab` to move focus, `Space` to select |
| Modals | `Tab` cycles within trap, `Shift+Tab` reverses, `Escape` closes |
| Dropdown menus | `↑↓` to navigate, `Enter` to select, `Escape` to close |
| Toast dismiss | `Tab` to focus dismiss button, `Enter`/`Space` to dismiss |

### 14.2 Focus Rings

**Global default (globals.css):**
```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

Component-level overrides use Tailwind's `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`.

- Focus ring colour: `--color-primary` (Navy on light canvas, Purple on dark canvas).
- Offset: 2px. Never 0.
- Never suppress focus rings with `outline: none` without a visible replacement.

### 14.3 ARIA Roles and Patterns

| Pattern | ARIA |
|---|---|
| Custom radio group | `role="radiogroup"` on container, `role="radio" aria-checked` on each option |
| Form errors | `role="alert" aria-live="assertive"` |
| Success/loading states | `role="status" aria-live="polite"` |
| Modal | `role="dialog" aria-modal="true" aria-labelledby={titleId}` |
| Icon-only buttons | `aria-label="Action description"` |
| Decorative icons | `aria-hidden="true"` |
| Avatar images | `role="img" aria-label={name}` |
| Loading spinner | `role="status" aria-label="Loading…"` + `<span className="sr-only">` |
| Dismiss buttons | `aria-label="Dismiss"` |
| Required fields | `aria-required="true"` on `<input>`, `*` indicator with `aria-hidden="true"` |
| Invalid fields | `aria-invalid={hasError || undefined}` + `aria-describedby` pointing to error |
| Progress | `role="progressbar" aria-valuenow aria-valuemin aria-valuemax aria-valuetext` |

### 14.4 Color Contrast Requirements

| Context | Minimum Ratio |
|---|---|
| Normal text (< 18pt) | 4.5:1 (WCAG AA) |
| Large text (≥ 18pt bold or 24pt) | 3:1 |
| UI components (borders, icons) | 3:1 |
| Focus ring | 3:1 against adjacent colours |

**Never convey information through colour alone.** Always pair with icon, label, or pattern.

#### Verified Pairs (Light Canvas)

| Text | Background | Ratio |
|---|---|---|
| `#2C2620` (Charcoal) on `#FDFAF6` (Warm White) | ✅ ~15:1 |
| `#2B3875` (Navy) on `#FDFAF6` | ✅ ~8.5:1 |
| `#8A8070` (Stone) on `#FDFAF6` | ✅ ~4.6:1 |
| `#C43A3A` (Error) on `rgba(196,58,58,0.06)` | ✅ 4.7:1 |
| `#2D8A5E` (Success) on `rgba(45,138,94,0.06)` | ✅ 4.5:1 |

### 14.5 Motion Safety

All CSS keyframe animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .skeleton, .animate-shake, .animate-pulse-ring {
    animation: none;
  }
}
```

Framer Motion: automatically reduces motion when the OS setting is enabled. No additional code required.

### 14.6 Screen Reader Patterns

- **Toasts:** Sonner renders with `role="region"` and `aria-live`. Don't add extra live regions.
- **Page transitions:** Use `role="status"` on the confirm/loading screen.
- **Resend cooldown:** Use `aria-label` on the button to announce current state: `"Resend available in 42 seconds"`.
- **Verify email page:** Cooldown countdown is conveyed via button `aria-label`, not an additional live region.
- **Form submission loading:** `aria-busy="true"` on the button. Screen readers announce "Signing in…" from button text.

---

## 15. Future Patterns — Swipe UI

These patterns are defined now so they can be implemented in Phase 6 without design decisions. The database schema already supports them (`swipe_actions`, `matches`, `is_discoverable`).

### 15.1 Swipe Card

A candidate profile card presented in a full-screen or near-full-screen format to employers.

```
┌────────────────────────────────┐
│                                │  <- Full-bleed image/video
│       [Avatar or portfolio]    │     (aspect-ratio: 3/4 or 4/5)
│                                │
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  <- Gradient overlay
│ Maya Rodriguez                 │     (linear from transparent to
│ Senior Motion Designer         │      charcoal/80%)
│ Los Angeles, CA                │
│                                │
│ [Motion Graphics] [After FX]   │  <- Specialty chips (white/outline)
│ [3D Animation] +2 more         │
│                                │
│ Remote · $120–150/hr           │
└────────────────────────────────┘
```

#### Swipe Card Specs

| Property | Value |
|---|---|
| Border radius | `rounded-3xl` |
| Shadow | `shadow-xl` |
| Gradient overlay | `linear-gradient(to top, rgba(44,38,32,0.85), transparent 60%)` |
| Name | `text-2xl font-bold text-white` |
| Role | `text-base text-white/80` |
| Location | `text-sm text-white/60` |
| Chips | White outline style: `border-white/40 text-white bg-white/10` |
| Rate | `text-sm text-white/70` |

#### Action Buttons

| Action | Icon | Colour | Size |
|---|---|---|---|
| Pass (left) | `X` | Stone/white | 56×56px circle, ghost |
| Super Like (up) | `Star` | Navy | 48×48px circle |
| Like (right) | `Heart` | Brand success | 56×56px circle, filled |

### 15.2 Match Event

When a like results in a match (employer liked candidate + candidate is discoverable):

```
Framer Motion: scale from 0.8 → 1.05 → 1 with springBouncy
Brief overlay: "It's a match!" with both avatars
Duration: ~2s then auto-dismiss
```

### 15.3 Discoverable Flag Behaviour

Candidates become discoverable automatically on admin approval:

```sql
-- Triggered by admin approval action:
UPDATE candidate_profiles SET is_discoverable = true WHERE id = profile_id;
```

Candidates can pause their visibility:
```sql
UPDATE candidate_profiles SET discovery_paused = true WHERE id = auth.uid();
```

Swipe query:
```sql
SELECT * FROM candidate_profiles
WHERE is_discoverable = true
  AND discovery_paused = false
  AND id NOT IN (
    SELECT candidate_id FROM swipe_actions WHERE employer_id = current_employer_id
  )
ORDER BY discovery_score DESC NULLS LAST;
```

---

## Appendix — Quick Reference

### CSS Variable Cheat Sheet

```
Background:   var(--color-background)   bg-background
Surface:      var(--color-surface)      bg-surface
Card:         var(--color-card)         bg-card
Primary:      var(--color-primary)      bg-primary  text-primary
Secondary:    var(--color-secondary)    text-secondary
Foreground:   var(--color-foreground)   text-foreground
Muted:        var(--color-muted)        text-muted
Border:       var(--color-border)       border-border
Input:        var(--color-input)        bg-input
Destructive:  var(--color-destructive)  text-destructive  bg-destructive
Success:      var(--color-success)      text-success
Warning:      var(--color-warning)      text-warning

Brand (always):
Navy:         #2B3875    bg-navy  text-navy  border-navy
Indigo:       #6B5FAE    text-indigo
Charcoal:     #2C2620    text-charcoal
Stone:        #8A8070    text-stone
Flax:         #D8CFC0    border-flax  bg-flax
Cream:        #F9F0E3    bg-cream
Vellum:       #F0E8D8    bg-vellum
```

### Component Import Paths

```tsx
import { Button }          from '@/components/ui/button'
import { Input }           from '@/components/ui/input'
import { PasswordInput }   from '@/components/ui/password-input'
import { Checkbox }        from '@/components/ui/checkbox'
import { Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter }
                           from '@/components/ui/card'
import { Badge }           from '@/components/ui/badge'
import { Modal }           from '@/components/ui/modal'
import { Avatar, AvatarGroup } from '@/components/ui/avatar'
import { Spinner }         from '@/components/ui/spinner'
import { toast, Toaster }  from '@/components/ui/toast'
import { GoogleButton }    from '@/components/auth/google-button'
import { AuthDivider }     from '@/components/auth/auth-divider'
import { PasswordStrength } from '@/components/auth/password-strength'

import {
  transitions, fadeVariants, fadeUpVariants, fadeDownVariants,
  scaleVariants, slideRightVariants, overlayVariants,
  buttonTap, cardHover, iconHover,
} from '@/lib/tokens'

import { cn } from '@/lib/utils'
```
