'use client'

import { type ReactNode } from 'react'
import { motion, AnimatePresence, type TargetAndTransition } from 'framer-motion'
import { usePathname } from 'next/navigation'

type TransitionStyle = 'fade' | 'slide-up' | 'slide-down' | 'scale'

export interface PageTransitionProps {
  children: ReactNode
  style?: TransitionStyle
  duration?: number
  className?: string
}

const variants: Record<
  TransitionStyle,
  { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition }
> = {
  'fade': {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit:    { opacity: 0 },
  },
  'slide-up': {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: -12 },
  },
  'slide-down': {
    initial: { opacity: 0, y: -24 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: 12 },
  },
  'scale': {
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1 },
    exit:    { opacity: 0, scale: 0.97 },
  },
}

export function PageTransition({
  children,
  style    = 'fade',
  duration = 0.25,
  className,
}: PageTransitionProps) {
  const pathname = usePathname()
  const v        = variants[style]

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={v.initial}
        animate={v.animate}
        exit={v.exit}
        transition={{ duration, ease: [0.4, 0, 0.2, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
