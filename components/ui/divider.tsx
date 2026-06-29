import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface DividerProps {
  label?: ReactNode
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function Divider({ label, orientation = 'horizontal', className }: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn('self-stretch w-px bg-border', className)}
      />
    )
  }

  if (label) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={cn('flex items-center gap-3 w-full', className)}
      >
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted font-medium whitespace-nowrap shrink-0 px-1">
          {label}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
    )
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn('w-full h-px bg-border', className)}
    />
  )
}
