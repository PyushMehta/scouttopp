import { cn } from '@/lib/utils'

export interface SkeletonProps {
  className?: string
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  width?: string | number
  height?: string | number
}

const roundedClasses = {
  none: 'rounded-none',
  sm:   'rounded-sm',
  md:   'rounded-md',
  lg:   'rounded-lg',
  xl:   'rounded-xl',
  full: 'rounded-full',
}

export function Skeleton({ className, rounded = 'md', width, height }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      aria-busy="true"
      className={cn(
        'relative overflow-hidden bg-surface',
        roundedClasses[rounded],
        className,
      )}
      style={{ width, height }}
    >
      {/* Shimmer sweep */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"
      />
      <span className="sr-only">Loading…</span>
    </div>
  )
}

/* ─── Pre-built skeleton presets ──────────────────────────────────────── */

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          height={16}
          rounded="md"
          className={i === lines - 1 ? 'w-3/4' : 'w-full'}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl bg-card border border-border p-4 space-y-3', className)}>
      <div className="flex items-center gap-3">
        <Skeleton width={40} height={40} rounded="full" />
        <div className="flex-1 space-y-2">
          <Skeleton height={14} className="w-1/2" />
          <Skeleton height={12} className="w-1/3" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  )
}
