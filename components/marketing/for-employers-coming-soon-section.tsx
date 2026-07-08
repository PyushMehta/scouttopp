'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, Search, SlidersHorizontal, BookOpen, Zap, MessageCircle } from 'lucide-react'
import { fadeUpVariants, transitions } from '@/lib/tokens'

const capabilities = [
  {
    icon: Search,
    title: 'Verified talent discovery',
    description: 'Browse a curated pool of manually reviewed creative professionals — no bots, no bulk applicants.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Role and skills filters',
    description: 'Filter by discipline, location, availability, and rate range to surface exactly who you need.',
  },
  {
    icon: BookOpen,
    title: 'Portfolio-first profiles',
    description: 'See the work before the CV. Every candidate leads with their best projects, not a bullet list.',
  },
  {
    icon: Zap,
    title: 'Scout Mode',
    description: 'A swipe-based discovery interface that lets you signal interest in seconds, not hours.',
  },
  {
    icon: MessageCircle,
    title: 'Direct connections',
    description: 'When there is mutual interest, you connect directly — no agency fees, no recruitment intermediaries.',
  },
]

export function ForEmployersComingSoonSection() {
  return (
    <section
      className="py-32 lg:py-40 relative overflow-hidden"
      aria-label="For employers — coming soon"
    >
      {/* Subtle bottom glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-96"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(124,58,237,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex justify-center mb-6"
          >
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              <Clock size={11} aria-hidden="true" />
              Coming Soon
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ ...transitions.normal, delay: 0.08 }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4"
          >
            For Employers
          </motion.h2>
          <motion.p
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ ...transitions.normal, delay: 0.16 }}
            className="text-base text-muted leading-relaxed max-w-xl mx-auto"
          >
            We&apos;re building the candidate community first. Once we&apos;ve established
            a high-quality talent base, we&apos;ll open access to the employers who deserve it.
          </motion.p>
        </div>

        {/* Capabilities grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {capabilities.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ ...transitions.normal, delay: 0.08 * (i + 1) }}
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(124,58,237,0.08)' }}
              >
                <Icon size={18} style={{ color: '#A78BFA' }} aria-hidden="true" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1.5">{title}</h3>
              <p className="text-sm text-muted leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>

        {/* Employer contact note */}
        <motion.p
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ ...transitions.normal, delay: 0.5 }}
          className="text-center text-sm mt-12"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          Interested in early employer access?{' '}
          <Link
            href="/contact?type=employer"
            className="underline underline-offset-4 transition-colors hover:text-foreground"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Get in touch
          </Link>
        </motion.p>
      </div>
    </section>
  )
}
