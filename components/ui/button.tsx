'use client'

import { type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonTap } from '@/lib/tokens'

/* ─── Types ─────────────────────────────────────────────────────────────── */

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'icon'
type Size    = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children?: ReactNode
}

/* ─── Variant / size maps ───────────────────────────────────────────────── */

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover active:bg-primary-hover shadow-sm hover:shadow-glow',
  secondary:
    'bg-secondary/15 text-secondary border border-secondary/30 hover:bg-secondary/25',
  outline:
    'border border-border text-foreground bg-transparent hover:border-primary hover:text-primary',
  ghost:
    'text-muted hover:text-foreground hover:bg-white/5 bg-transparent',
  destructive:
    'bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/25',
  icon:
    'bg-transparent text-muted hover:text-foreground hover:bg-white/8 rounded-full aspect-square',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8  px-3   text-xs  gap-1.5 rounded-md',
  md: 'h-10 px-4   text-sm  gap-2   rounded-lg',
  lg: 'h-12 px-6   text-base gap-2.5 rounded-xl',
}

const iconSizeClasses: Record<Size, string> = {
  sm: 'h-8  w-8  text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function Button({
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading
  const isIcon     = variant === 'icon'

  return (
    <motion.button
      whileTap={isDisabled ? undefined : buttonTap}
      whileHover={isDisabled ? undefined : { scale: 1.01 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={cn(
        'relative inline-flex items-center justify-center font-medium',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-40',
        'select-none cursor-pointer',
        isIcon ? iconSizeClasses[size] : sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <Loader2
            size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}
            className="animate-spin"
            aria-hidden="true"
          />
          {!isIcon && <span className="ml-1.5">{children}</span>}
        </>
      ) : (
        <>
          {leftIcon && (
            <span aria-hidden="true" className="shrink-0">{leftIcon}</span>
          )}
          {children}
          {rightIcon && (
            <span aria-hidden="true" className="shrink-0">{rightIcon}</span>
          )}
        </>
      )}
    </motion.button>
  )
}
