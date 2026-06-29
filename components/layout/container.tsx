import { type ElementType, type ReactNode, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  fluid?: boolean
  as?: ElementType
  children?: ReactNode
}

export function Container({
  fluid = false,
  as: Tag = 'div',
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        'w-full mx-auto px-4 sm:px-6 lg:px-8',
        !fluid && 'max-w-7xl',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
