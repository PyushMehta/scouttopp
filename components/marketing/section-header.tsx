'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fadeUpVariants, transitions } from '@/lib/tokens'
import { EyebrowBadge } from './eyebrow-badge'

interface SectionHeaderProps {
  eyebrow?: string
  heading: string
  subtext?: string
  align?: 'left' | 'center'
  className?: string
  light?: boolean
}

export function SectionHeader({
  eyebrow,
  heading,
  subtext,
  align = 'center',
  className,
  light = false,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && (
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-3"
        >
          {light ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest border"
              style={{
                background: 'rgba(43, 56, 117, 0.06)',
                borderColor: 'rgba(43, 56, 117, 0.18)',
                color: 'var(--color-navy)',
              }}
            >
              {eyebrow}
            </span>
          ) : (
            <EyebrowBadge>{eyebrow}</EyebrowBadge>
          )}
        </motion.div>
      )}
      <motion.h2
        variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ ...transitions.normal, delay: 0.08 }}
        className={cn(
          'font-extrabold tracking-tight leading-tight mb-4',
          'text-3xl sm:text-4xl lg:text-5xl',
        )}
      >
        {heading}
      </motion.h2>
      {subtext && (
        <motion.p
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ ...transitions.normal, delay: 0.16 }}
          className="text-muted text-base sm:text-lg leading-relaxed"
        >
          {subtext}
        </motion.p>
      )}
    </div>
  )
}
