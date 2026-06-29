'use client'

import { type ElementType, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fadeUpVariants } from '@/lib/tokens'

type SectionSize = 'sm' | 'md' | 'lg' | 'xl' | 'none'

export interface SectionProps extends Omit<HTMLMotionProps<'section'>, 'children'> {
  size?: SectionSize
  animate?: boolean
  as?: ElementType
  children?: ReactNode
}

const sizeClasses: Record<SectionSize, string> = {
  sm:   'py-8  sm:py-10',
  md:   'py-12 sm:py-16',
  lg:   'py-16 sm:py-24',
  xl:   'py-20 sm:py-32',
  none: '',
}

export function Section({
  size    = 'lg',
  animate = true,
  as: Tag = 'section',
  className,
  children,
  ...props
}: SectionProps) {
  const classes = cn(sizeClasses[size], className)

  if (animate) {
    return (
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-64px' }}
        variants={fadeUpVariants}
        className={classes}
        {...props}
      >
        {children}
      </motion.section>
    )
  }

  return (
    // `as` is a polymorphic escape hatch — HTMLMotionProps can't be narrowed to the runtime Tag type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag className={classes} {...(props as any)}>
      {children}
    </Tag>
  )
}
