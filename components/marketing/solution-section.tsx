'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { X, Check, ArrowRight } from 'lucide-react'
import { fadeUpVariants, transitions } from '@/lib/tokens'
import { SectionHeader } from './section-header'

const comparisons = [
  { old: 'Keywords over talent', new: 'Skills and portfolio first' },
  { old: 'Open applications, anyone applies', new: 'Verified, curated candidates only' },
  { old: 'Resume-based matching', new: 'Work-based discovery' },
  { old: 'Slow, multi-week hiring cycles', new: 'Direct connections' },
  
]

export function SolutionSection() {
  const prefersReduced = useReducedMotion()

  return (
    <section
      data-color-scheme="light"
      className="py-16 lg:py-24"
      aria-label="The solution"
      style={{ background: 'var(--color-background)' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-8">
          <SectionHeader
            eyebrow="The solution"
            heading="We built something different."
            subtext="Not a job board. Not a recruiter. Not an algorithm. A platform where every candidate is reviewed, every employer is verified, and every match is based on quality and mutual interest."
          />
        </div>

        <div className="flex flex-col md:flex-row items-stretch gap-4 max-w-3xl mx-auto">
          {/* Old way */}
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ ...transitions.normal, delay: 0.1 }}
            className="flex-1 rounded-2xl p-8"
            style={{
              background: 'var(--color-card)',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: '#8A8070' }}>
              The old way
            </p>
            <ul className="space-y-4">
              {comparisons.map(({ old }) => (
                <li key={old} className="flex items-center gap-3">
                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)' }}>
                    <X size={12} style={{ color: 'rgba(239,68,68,0.7)' }} />
                  </span>
                  <span className="text-sm" style={{ color: '#8A8070' }}>{old}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <motion.div
              animate={prefersReduced ? {} : { x: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-muted rotate-90 md:rotate-0"
            >
              <ArrowRight size={24} style={{ color: 'var(--color-primary)' }} />
            </motion.div>
          </div>

          {/* ScouttOpp way */}
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ ...transitions.normal, delay: 0.2 }}
            className="flex-1 rounded-2xl p-8"
            style={{
              background: 'var(--color-card)',
              border: '1px solid rgba(124,58,237,0.25)',
              boxShadow: '0 1px 3px rgba(124,58,237,0.08)',
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: '#A78BFA' }}>
              ScouttOpp
            </p>
            <ul className="space-y-4">
              {comparisons.map(({ new: newWay }) => (
                <li key={newWay} className="flex items-center gap-3">
                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.15)' }}>
                    <Check size={12} style={{ color: '#7C3AED' }} />
                  </span>
                  <span className="text-sm font-medium" style={{ color: '#2C2620' }}>{newWay}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
