import { cn } from '@/lib/utils'

interface EyebrowBadgeProps {
  children: React.ReactNode
  className?: string
}

export function EyebrowBadge({ children, className }: EyebrowBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5',
        'text-xs font-semibold uppercase tracking-widest',
        'text-secondary border',
        className,
      )}
      style={{
        background: 'rgba(124, 58, 237, 0.08)',
        borderColor: 'rgba(124, 58, 237, 0.22)',
      }}
    >
      {children}
    </span>
  )
}
