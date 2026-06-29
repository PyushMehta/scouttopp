import { type ComponentProps } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'outline'
type BadgeSize    = 'sm' | 'md'

export interface BadgeProps extends ComponentProps<'span'> {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  onDismiss?: () => void
}

const variantClasses: Record<BadgeVariant, string> = {
  default:     'bg-white/8  text-muted     border border-border',
  primary:     'bg-primary/15 text-secondary border border-primary/30',
  success:     'bg-success/15 text-success   border border-success/30',
  warning:     'bg-warning/15 text-warning   border border-warning/30',
  destructive: 'bg-destructive/15 text-destructive border border-destructive/30',
  outline:     'bg-transparent text-muted border border-border',
}

const dotVariantClasses: Record<BadgeVariant, string> = {
  default:     'bg-muted',
  primary:     'bg-secondary',
  success:     'bg-success',
  warning:     'bg-warning',
  destructive: 'bg-destructive',
  outline:     'bg-muted',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2   py-0.5 text-xs  gap-1   rounded-md',
  md: 'px-2.5 py-1   text-xs  gap-1.5 rounded-lg',
}

export function Badge({
  variant  = 'default',
  size     = 'md',
  dot      = false,
  onDismiss,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotVariantClasses[variant])}
        />
      )}
      {children}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="ml-0.5 -mr-0.5 rounded-sm opacity-60 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current"
        >
          <X size={10} aria-hidden="true" />
        </button>
      )}
    </span>
  )
}
