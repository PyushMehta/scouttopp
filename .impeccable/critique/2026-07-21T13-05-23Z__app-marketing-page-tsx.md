---
target: app/(marketing)/page.tsx
total_score: 21
p0_count: 2
p1_count: 3
timestamp: 2026-07-21T13-05-23Z
slug: app-marketing-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Hero video has no poster/fallback; review timeline buried in FAQ |
| 2 | Match System / Real World | 2 | "Invitation only" eyebrow contradicts "Apply as a candidate" CTA; "Scout Mode" unexplained |
| 3 | User Control and Freedom | 3 | Tab states work; no traps; no indication of rejection process |
| 4 | Consistency and Standards | 1 | "Scoutt Opp" (11+ instances) vs "ScouttOpp"; "Apply as a candidate" vs "Apply as a creative"; two identical tab patterns |
| 5 | Error Prevention | 2 | Hero video src has no fallback/poster; employer tab shows full flow for disabled feature |
| 6 | Recognition Rather Than Recall | 3 | Nav is clear; steps numbered; both tab options visible simultaneously |
| 7 | Flexibility and Efficiency | 2 | No skip links; no primary CTA in nav; no keyboard focus visible on hamburger |
| 8 | Aesthetic and Minimalist Design | 1 | 8-card feature grid with zero differentiation; three consecutive identical-rhythm light sections; employer features shown during Candidate Beta |
| 9 | Error Recovery | 2 | Hero video fails silently; FAQ "Google hiring" erodes trust |
| 10 | Help and Documentation | 3 | FAQ is present but 11 questions undifferentiated under one "General" group |
| **Total** | | **21/40** | **Acceptable — significant improvements needed** |

## Anti-Patterns Verdict

**LLM assessment**: The page has several diagnosable AI-generation tells. The `SolutionSection` old-vs-new comparison table with X/checkmark lists is the most overused SaaS pattern available. The `FeaturesSection` is 8 identical-weight icon+title+body cards with zero hierarchy differentiation. The eyebrow → h2 → subtext sequence from `SectionHeader` repeats across every single section — Problem, Solution, HowItWorks, ForYou, Features, FAQ — making every section open identically. Framer Motion `fadeUpVariants whileInView` fires on every element everywhere with no timing priority. The FAQ contains "Does Scoutt Opp help with Google hiring?" — textbook SEO keyword stuffing. The hero headline ("Talent this good doesn't come from a job board.") and the final CTA copy ("Stop applying. Start being found.") are genuinely strong — they tell what the rest of the page doesn't: that someone wrote this.

**Deterministic scan**: The automated detector returned `[]` (clean). This is explained by a systematic audit finding: every styled value in the marketing codebase uses inline `style` prop objects with camelCase CSS property names (`WebkitBackgroundClip`, `backdropFilter`, etc.) rather than Tailwind utility classes. A class-based scanner is blind to this pattern entirely. The following anti-patterns were present but detector-evading:
- **Gradient text** (`hero-section.tsx` hero headline "board."): `WebkitBackgroundClip: 'text'` + `WebkitTextFillColor: 'transparent'` + linear-gradient
- **Identical card grids**: `features-section.tsx` (8 cards), `problem-section.tsx` (3 cards), `for-you-section.tsx` employer content (5 cards) — all identical structure
- **Eyebrow above every section**: 7 consecutive sections all open with the same badge/eyebrow pattern
- **Numbered scaffolding**: `how-it-works-section.tsx` decorative `01`–`04` at 4% purple opacity (effectively invisible)
- **Decorative glassmorphism**: Mobile drawer in `marketing-nav.tsx` applies `backdropFilter: 'blur(20px)'` on a 97%-opaque overlay where blur adds nothing

**Visual overlays**: Browser injection was not available in this session; no user-visible overlays were generated.

## Overall Impression

The page has a strong spine — the hero headline and the final CTA copy carry genuine personality — but the body collapses into SaaS scaffolding between them. Three consecutive light sections with identical rhythm, a features grid that dumps 8 equal items (including disabled employer features), and a page that speaks primarily from the employer's perspective during a Candidate Beta launch. The emotional journey crests at the hero, valleys badly at Features, and partially recovers at the final CTA. The biggest single opportunity: rewrite the middle sections entirely from inside the candidate's perspective, cut the features grid to 4–5 candidate-relevant items, and add at least one real testimonial before asking creative professionals to submit an application to an invisible community.

## What's Working

**1. The hero headline and animated type.** "Talent this good doesn't come from a job board." with the staggered word-by-word animation and `clamp()` typography is the only moment on the page that feels genuinely authored. The "✦ Invitation only" badge earns its placement by signaling scarcity without explaining it away.

**2. The Problem section two-column layout.** Left-copy / right-pain-cards is the only section breaking the centered SectionHeader pattern. The white cards on the light canvas work. The card hover lift is a nice micro-interaction. It has more spatial interest than anything between it and the final CTA.

**3. The ProfileCardMockup in ForYouSection.** The only actual platform UI visualization on the page — gradient header, portfolio color blocks, skill tags — does real trust-building work by showing candidates what a profile looks like. Even imperfectly art-directed ("Soham P., Founder"), it's a stronger signal than abstract copy.

## Priority Issues

**[P0] Hero video has no fallback**
The `<video>` has no `poster` attribute and no static fallback image. If the Supabase URL 404s, loads slowly on mobile (India's 4G latency), or autoplay is blocked, the hero is a dark rectangle. The text overlay is readable because of the dark overlay — but the dark overlay on a transparent video background creates a flat near-black block with no visual character.
**Fix**: Add `poster="/hero-poster.jpg"` to the `<video>` element immediately. Export a static frame from the video and save it at `/public/hero-poster.jpg`. Add a secondary local `<source src="/videos/hero-bg.mp4">` before the Supabase source as a fallback.
**Suggested command**: `/impeccable harden` (production hardening, error states, fallbacks)

**[P0] Employer tab in HowItWorksSection shows a complete 4-step employer flow with no Beta caveat**
During `NEXT_PUBLIC_EMPLOYER_ENABLED=false`, the "For Employers" tab in `HowItWorksSection` shows a full onboarding flow and implies employers can sign up now. `ForYouSection` correctly handles this with a Coming Soon badge and a `/contact` redirect — `HowItWorksSection` does not. Any user who probes both sections (likely, since both exist above the fold) sees inconsistent messaging. Any user who follows the employer tab and tries to sign up hits a 503.
**Fix**: During Candidate Beta, either (a) hide the employer tab entirely in `HowItWorksSection` behind the `NEXT_PUBLIC_EMPLOYER_ENABLED` flag, or (b) add a "Coming Soon" label to the employer tab and replace its content with the same treatment used in `ForYouSection`. One section gate, one decision.
**Suggested command**: `/impeccable harden`

**[P1] No social proof exists on the page**
`testimonials-section.tsx` (and `company-marquee.tsx`, `trusted-companies.tsx`) exist in the codebase but none are imported in the home page. The page has zero validation: no testimonial, no count of approved creatives, no "x Founding Creatives already approved" counter, no company logos. A prospective Founding Creative is being asked to submit a personal application — which may be rejected — to an invisible community with no evidence that anyone else succeeded here.
**Fix**: Import and place `TestimonialsSection` between `ForYouSection` and `FeaturesSection`. If there are no real testimonials yet, a lightweight social proof bar ("43 Founding Creatives approved in the last 30 days") above the final CTA does more work than another feature card.
**Suggested command**: `/impeccable onboard`

**[P1] FAQ "Google hiring" question is a trust liability**
`faq-section.tsx` lines 54–57: "Does Scoutt Opp help with Google hiring? Many users search for Google hiring and other top companies. While Scoutt Opp is not affiliated with Google..." — this is SEO keyword stuffing, it reads exactly that way, and any attentive creative professional will immediately recalibrate their trust level for the entire page.
**Fix**: Delete this question. The SEO value is not worth the credibility cost on the primary conversion surface.
**Suggested command**: `/impeccable clarify`

**[P1] No `prefers-reduced-motion` guard on any Framer Motion animation — systemic**
`lib/tokens.ts` defines `fadeUpVariants` and `transitions`, used across every marketing section. Framer Motion's `useReducedMotion()` hook is imported nowhere. Every `whileInView`, `animate`, and infinite loop animation fires unconditionally for users who have requested reduced motion. `globals.css` guards the three CSS utility animations but Framer Motion is untouched. Additionally, `SectionHeader`'s `<h2>` starts with `initial="hidden"` (opacity 0) — section headings shipped invisible until the intersection observer fires is a content-gating failure for headings that screen readers use for navigation.
**Fix**: In `lib/tokens.ts`, export a `motionSafe` utility: when `useReducedMotion()` returns true, return instant variants (`{ hidden: { opacity: 1 }, visible: { opacity: 1 } }`). Apply this in `SectionHeader` for the heading specifically. For infinite animations (hero scroll hint, solution arrow), add `animate: { ..., repeat: 0 }` under reduced motion.
**Suggested command**: `/impeccable audit`

**[P2] No primary CTA in the navigation**
Desktop nav: Logo | Features | FAQ | Contact | ThemeToggle | Sign in. The primary action ("Apply as a creative") is absent. A user who scrolls up to reorient has no forward path. Mobile drawer is worse: 3 text links + "Sign in" only. For a Candidate Beta whose entire conversion goal is creative applications, the mobile hamburger menu should be the highest-leverage CTA placement on the page.
**Fix**: Add an "Apply →" button to the right of the desktop nav between ThemeToggle and Sign in. Add the same button to the mobile drawer above "Sign in", styled as a filled primary action.
**Suggested command**: `/impeccable layout`

**[P2] FeaturesSection dumps 8 equal cards including disabled employer features**
8 identical-weight cards with no hierarchy. Includes "Employer Dashboard" and employer-facing features that are either disabled or not yet experienced. Advertises disabled features as current platform capabilities.
**Fix**: Cut to 5 candidate-relevant features. Give 1–2 a wider/featured card treatment. Remove or retitle "Employer Dashboard" during Candidate Beta (candidate-perspective reframe: "Portfolio-first discovery" rather than describing the employer-side feature).
**Suggested command**: `/impeccable distill`

**[P3] Brand name "Scoutt Opp" (spaced) used in 11+ instances of body copy**
The correct brand name is "ScouttOpp" (no space). 11+ instances of "Scoutt Opp" appear across `faq-section.tsx` (every FAQ answer), `features-section.tsx`, `final-cta-section.tsx`, `for-you-section.tsx`.
**Fix**: Global find-and-replace "Scoutt Opp" → "ScouttOpp" across all marketing components.
**Suggested command**: `/impeccable clarify`

## Persona Red Flags

**Jordan (Confused First-Timer)** — trying to sign up as a creative:
- "✦ Invitation only" eyebrow immediately below which is "Apply as a candidate" CTA. Jordan doesn't know if they need to be invited or if they can apply.
- Problem section frames pain from the employer's perspective ("companies are overwhelmed"). Jordan is a creative and feels like a bystander.
- HowItWorksSection "For Employers" tab shows a complete 4-step flow. Jordan wonders if they should sign up as an employer instead.
- ForYouSection presents the candidates/employers toggle again — second time making the same decision.
- ProfileCardMockup shows "Soham P., Founder · Mumbai." Jordan is not a founder.
- No testimonials from anyone who looked like Jordan and got in.
- FAQ "How does Scoutt Opp review candidates?" answer: "We evaluate portfolios, experience, and overall quality" gives no bar to aim for.
- Leaves without applying because the threshold is undefined and the community is invisible.

**Casey (Distracted Mobile User)** — browsing on a phone on the go:
- Hero video has no `poster`. On slow 4G (real for much of India), first impression is a dark screen.
- Mobile hamburger opens: 3 text links + "Sign in." No "Apply." Casey closes the drawer.
- HowItWorksSection: 4 stacked full-width cards. FeaturesSection: 8 stacked full-width cards. Back-to-back marathon scroll with no visual reward or CTA mid-page.
- `Sign in` in the mobile drawer is a ghost button (`border border-border`) — does not look like the primary call to action.
- State lost if Casey switches apps mid-page (no scroll position persistence, no mid-page CTA to capture intent before scroll fatigue).

**Riley (Deliberate Stress Tester)** — probing for gaps:
- Contradiction spotted immediately: "Invitation only" + open application.
- SolutionSection "Verified, curated candidates only" — Riley asks: what does "curated" mean? What's the rejection rate? The section gives no answer.
- Tabs to "For Employers" in HowItWorks. Sees complete 4-step flow. Tries to sign up as employer. Hits 503. Confirms the deception.
- FAQ "Does Scoutt Opp help with Google hiring?" — trust recalibration complete.
- Sees "Employer Dashboard" in Features. Tries to access it. Can't.
- HowItWorks Step 3: "your profile becomes visible to verified employers actively hiring." Riley asks: during Candidate Beta, are there actually any employers? The page never says.
- Footer "For Employers" product link implies employers are present now.

## Minor Observations

- The decorative step numbers in HowItWorks (`rgba(124,58,237,0.12)` on `#0A0A0A`) and connecting lines (`rgba(255,255,255,0.08)`) are effectively invisible. Either raise opacity to 0.25+ or remove them.
- Tab panels in HowItWorks and ForYou use `aria-pressed` — wrong semantic. Should use `role="tablist"`, `role="tab"`, `aria-selected`, and `role="tabpanel"` with `aria-labelledby`.
- FAQ accordion buttons have `aria-expanded` but no `aria-controls` linking to the answer panel.
- Mobile drawer has no focus trap, no `aria-modal`, and no Escape key handler — keyboard users can tab through the page behind the overlay.
- `<img src="/scoutt.png">` in nav and footer bypasses Next.js image optimization — use `<Image>` with explicit dimensions to prevent layout shift.
- Token consistency: 10+ categories of hardcoded color values where tokens exist (`#FFFFFF` vs `var(--color-card)`, `#A78BFA` vs `var(--color-secondary)`, `rgba(124,58,237,...)` vs `var(--color-primary)` with opacity). In light mode, the primary purple CTAs render as hardcoded purple instead of navy, breaking the light theme.
- `ThemeToggle` sits second in the desktop nav, advertising an alternate version of the site to every visitor on a dark-first brand.
- Section `py-16 lg:py-24` is applied uniformly — no breathing variation between sections gives the page a flat rhythm.
- Footer links to `/blog` which is currently a placeholder.

## Questions to Consider

1. **Who is this page written for?** The Problem section frames pain from the employer's perspective. HowItWorks Step 3 promises employers will see the candidate. The solution copy says "companies that value talent." During Candidate Beta, every conversion goal is a creative professional applying — so what would the page look like if every sentence were written from inside the candidate's perspective? Their fear of being missed, their frustration with keyword rejection, their desire to be valued for what they've made. The current page reads like a platform pitch. It could read like a creative manifesto.

2. **Is "Invitation only" the mechanism or the aspiration?** The eyebrow says "Invitation only" but the flow is: apply → get reviewed → get approved or rejected. That's selective application, not invitation. The emotional register is different: an invitation implies you were chosen; an application implies you're competing. If it's selective application, is "Invitation only" creating false expectations for candidates who apply and are rejected?

3. **What does this page communicate to a prospective Founding Creative if the hero video fails and there are no testimonials?** Right now: a dark screen, no faces, no quotes, no evidence that any human has ever used this platform. One real testimonial from one approved creative with their name, role, and a specific thing they gained would outperform the entire FeaturesSection.
