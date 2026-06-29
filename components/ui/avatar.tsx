'use client'

import { useState, type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface AvatarProps extends Omit<ComponentProps<'div'>, 'children'> {
  src?: string
  name?: string
  alt?: string
  size?: AvatarSize
  online?: boolean
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-6  h-6  text-[10px]',
  sm: 'w-8  h-8  text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

const dotSizeClasses: Record<AvatarSize, string> = {
  xs: 'w-1.5 h-1.5 -bottom-px -right-px',
  sm: 'w-2   h-2   bottom-0  right-0',
  md: 'w-2.5 h-2.5 bottom-0  right-0',
  lg: 'w-3   h-3   bottom-0.5 right-0.5',
  xl: 'w-3.5 h-3.5 bottom-0.5 right-0.5',
}

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getColorFromName(name?: string): string {
  const colors = [
    'bg-purple-600',
    'bg-blue-600',
    'bg-emerald-600',
    'bg-rose-600',
    'bg-amber-600',
    'bg-cyan-600',
    'bg-indigo-600',
    'bg-teal-600',
  ]
  if (!name) return colors[0]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

export function Avatar({ src, name, alt, size = 'md', online, className, ...props }: AvatarProps) {
  // Track which src caused the error — when src changes the error clears automatically
  const [errorSrc, setErrorSrc] = useState<string | undefined>(undefined)
  const initials = getInitials(name)
  const bgColor  = getColorFromName(name)
  const label    = alt ?? name ?? 'User avatar'
  const showImg  = src && errorSrc !== src

  return (
    <div
      role="img"
      aria-label={label}
      className={cn('relative shrink-0 inline-flex', className)}
      {...props}
    >
      <span
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center font-semibold text-white',
          sizeClasses[size],
          !showImg && bgColor,
        )}
      >
        {/* Initials always rendered; hidden by the image layer when loaded */}
        <span aria-hidden="true" className={showImg ? 'hidden' : undefined}>
          {initials}
        </span>

        {src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={label}
            className={cn('absolute inset-0 w-full h-full object-cover', errorSrc === src && 'hidden')}
            onError={() => setErrorSrc(src)}
          />
        )}
      </span>

      {online !== undefined && (
        <span
          aria-label={online ? 'Online' : 'Offline'}
          className={cn(
            'absolute rounded-full border-2 border-background',
            online ? 'bg-success' : 'bg-muted',
            dotSizeClasses[size],
          )}
        />
      )}
    </div>
  )
}

/* ─── Avatar group ──────────────────────────────────────────────────────── */

export interface AvatarGroupProps {
  avatars: Pick<AvatarProps, 'src' | 'name' | 'alt'>[]
  size?: AvatarSize
  max?: number
  className?: string
}

export function AvatarGroup({ avatars, size = 'md', max = 4, className }: AvatarGroupProps) {
  const shown    = avatars.slice(0, max)
  const overflow = avatars.length - max

  return (
    <div className={cn('flex items-center', className)} role="group" aria-label="Avatar group">
      {shown.map((a, i) => (
        <div key={i} className="-ml-2 first:ml-0 ring-2 ring-background rounded-full">
          <Avatar {...a} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            '-ml-2 ring-2 ring-background rounded-full flex items-center justify-center',
            'bg-surface font-medium text-muted',
            sizeClasses[size],
          )}
          aria-label={`+${overflow} more`}
        >
          <span aria-hidden="true" className="text-xs">+{overflow}</span>
        </div>
      )}
    </div>
  )
}
