'use client'

import { useState, useId, useRef, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence, type TargetAndTransition } from 'framer-motion'
import { cn } from '@/lib/utils'

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  content: ReactNode
  placement?: TooltipPlacement
  delay?: number
  children: ReactNode
  className?: string
  contentClassName?: string
}

const placementClasses: Record<TooltipPlacement, string> = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full    left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full  top-1/2  -translate-y-1/2  mr-2',
  right:  'left-full   top-1/2  -translate-y-1/2  ml-2',
}

const placementInitial: Record<TooltipPlacement, TargetAndTransition> = {
  top:    { opacity: 0, y: 6,  scale: 0.95 },
  bottom: { opacity: 0, y: -6, scale: 0.95 },
  left:   { opacity: 0, x: 6,  scale: 0.95 },
  right:  { opacity: 0, x: -6, scale: 0.95 },
}

const placementAnimate: Record<TooltipPlacement, TargetAndTransition> = {
  top:    { opacity: 1, y: 0, scale: 1 },
  bottom: { opacity: 1, y: 0, scale: 1 },
  left:   { opacity: 1, x: 0, scale: 1 },
  right:  { opacity: 1, x: 0, scale: 1 },
}

export function Tooltip({
  content,
  placement  = 'top',
  delay      = 400,
  children,
  className,
  contentClassName,
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const tooltipId             = useId()
  const timerRef              = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay)
  }

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
  }

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <span aria-describedby={visible ? tooltipId : undefined}>
        {children}
      </span>

      <AnimatePresence>
        {visible && (
          <motion.div
            id={tooltipId}
            role="tooltip"
            initial={placementInitial[placement]}
            animate={placementAnimate[placement]}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              'pointer-events-none absolute z-50 whitespace-nowrap',
              'px-2.5 py-1.5 rounded-lg',
              'bg-surface border border-border',
              'text-xs text-foreground font-medium',
              'shadow-md',
              placementClasses[placement],
              contentClassName,
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}
