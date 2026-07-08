'use client'

import { motion } from 'framer-motion'
import { fadeUpVariants, transitions } from '@/lib/tokens'

const agencies = [
  'Wieden+Kennedy',
  'Mother London',
  'R/GA',
  'Droga5',
  'BBDO',
  'Unit9',
]

export function TrustBar() {
  return (
    <section
      className="py-12 border-y"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'rgba(255,255,255,0.06)',
      }}
      aria-label="Trusted by"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.p
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-xs font-semibold uppercase tracking-widest text-muted text-center mb-8"
        >
          Trusted by creative teams at
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {agencies.map((agency, i) => (
            <motion.span
              key={agency}
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ ...transitions.normal, delay: i * 0.05 }}
              className="text-sm font-semibold tracking-wider opacity-40 hover:opacity-80 transition-opacity duration-200 cursor-default select-none"
              style={{ color: 'var(--color-foreground)' }}
            >
              {agency}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  )
}
