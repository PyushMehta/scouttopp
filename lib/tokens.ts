import type { Variants, Transition } from 'framer-motion'

/* ─── Instant (reduced-motion) variants ───────────────────────────────── */
// Use these when useReducedMotion() returns true. Content is immediately
// visible; only the transform is skipped, not the opacity gate.

export const instantVariants: Variants = {
  hidden:  { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
  exit:    { opacity: 0 },
}

/* ─── Transitions ──────────────────────────────────────────────────────── */

export const transitions = {
  fast:   { duration: 0.15, ease: [0.4, 0, 0.2, 1] } satisfies Transition,
  normal: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } satisfies Transition,
  slow:   { duration: 0.4,  ease: [0.4, 0, 0.2, 1] } satisfies Transition,
  spring: { type: 'spring', stiffness: 400, damping: 30 } satisfies Transition,
  springBouncy: { type: 'spring', stiffness: 300, damping: 20 } satisfies Transition,
} as const

/* ─── Reusable animation variants ─────────────────────────────────────── */

export const fadeVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: transitions.normal },
  exit:    { opacity: 0, transition: transitions.fast },
}

export const fadeUpVariants: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: transitions.normal },
  exit:    { opacity: 0, y: 8,  transition: transitions.fast },
}

export const fadeDownVariants: Variants = {
  hidden:  { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0,   transition: transitions.normal },
  exit:    { opacity: 0, y: -8,  transition: transitions.fast },
}

export const scaleVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1,    transition: transitions.spring },
  exit:    { opacity: 0, scale: 0.95, transition: transitions.fast },
}

export const slideRightVariants: Variants = {
  hidden:  { opacity: 0, x: '100%' },
  visible: { opacity: 1, x: 0,      transition: { ...transitions.spring, damping: 25 } },
  exit:    { opacity: 0, x: '100%', transition: transitions.fast },
}

export const slideLeftVariants: Variants = {
  hidden:  { opacity: 0, x: '-100%' },
  visible: { opacity: 1, x: 0,       transition: { ...transitions.spring, damping: 25 } },
  exit:    { opacity: 0, x: '-100%', transition: transitions.fast },
}

export const overlayVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: transitions.normal },
  exit:    { opacity: 0, transition: { ...transitions.fast, delay: 0.05 } },
}

/* ─── Hover / tap effects (used directly on motion elements) ──────────── */

export const buttonTap = { scale: 0.97 }

export const cardHover = { y: -4, transition: transitions.spring }

export const iconHover = { rotate: 15, scale: 1.1, transition: transitions.spring }
