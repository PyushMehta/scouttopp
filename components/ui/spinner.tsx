import { cn } from '@/lib/utils'

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface SpinnerProps {
  size?: SpinnerSize
  className?: string
  label?: string
}

const sizeMap: Record<SpinnerSize, number> = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
}

const strokeMap: Record<SpinnerSize, number> = {
  xs: 2.5,
  sm: 2.5,
  md: 2,
  lg: 2,
  xl: 1.5,
}

export function Spinner({ size = 'md', className, label = 'Loading…' }: SpinnerProps) {
  const px = sizeMap[size]
  const strokeWidth = strokeMap[size]
  const r = (px - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * r

  return (
    <span role="status" aria-label={label} className={cn('inline-flex', className)}>
      <svg
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        fill="none"
        aria-hidden="true"
        className="animate-spin"
        style={{ animationDuration: '0.75s' }}
      >
        {/* Track */}
        <circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          opacity={0.2}
        />
        {/* Arc */}
        <circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.75}
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  )
}
