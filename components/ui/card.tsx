'use client'

import { type ComponentProps } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/* ─── Root card ─────────────────────────────────────────────────────────── */

export interface CardProps extends ComponentProps<'div'> {
  interactive?: boolean
  glow?: boolean
  noPadding?: boolean
}

export function Card({
  interactive = false,
  glow = false,
  noPadding = false,
  className,
  children,
  ...props
}: CardProps) {
  const base = cn(
    'rounded-xl bg-card border border-border',
    !noPadding && 'p-5',
    glow && 'shadow-glow',
    interactive && 'cursor-pointer',
    className,
  )

  if (interactive) {
    return (
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 12px 24px -4px rgb(0 0 0 / 0.5)' }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={base}
        {...(props as ComponentProps<typeof motion.div>)}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={base} {...props}>
      {children}
    </div>
  )
}

/* ─── Card sub-components ───────────────────────────────────────────────── */

export function CardHeader({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-1 mb-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: ComponentProps<'h3'>) {
  return (
    <h3 className={cn('text-base font-semibold text-foreground leading-tight', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }: ComponentProps<'p'>) {
  return (
    <p className={cn('text-sm text-muted', className)} {...props}>
      {children}
    </p>
  )
}

export function CardBody({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('text-sm text-muted', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex items-center gap-3 mt-4 pt-4 border-t border-border', className)}
      {...props}
    >
      {children}
    </div>
  )
}
