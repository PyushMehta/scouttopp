'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { fadeUpVariants, transitions } from '@/lib/tokens'
import { SectionHeader } from './section-header'

const benefits = [
  'Pre-vetted candidates only — no noise',
  'Filter by role, location, and availability',
  'Swipe to express interest instantly',
  'Connect directly when there\'s a match',
]

function EmployerDiscoveryMockup() {
  const cards = [
    { name: 'Jordan K.', role: 'Creative Director', tags: ['Brand', 'Strategy'] },
    { name: 'Sam L.', role: 'Art Director', tags: ['Editorial', 'Digital'] },
  ]

  return (
    <div className="space-y-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.name}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ ...transitions.normal, delay: 0.2 + i * 0.1 }}
          className="rounded-2xl p-5 flex items-center gap-4"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)' }}
          >
            {card.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{card.name}</p>
            <p className="text-xs text-muted">{card.role}</p>
            <div className="flex gap-1.5 mt-1.5">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2 py-0.5 text-xs"
                  style={{
                    background: 'rgba(124,58,237,0.12)',
                    color: '#A78BFA',
                    border: '1px solid rgba(124,58,237,0.18)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)' }}
              aria-label="Pass"
            >
              ✕
            </button>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs"
              style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.2)' }}
              aria-label="Like"
            >
              ♥
            </button>
          </div>
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ ...transitions.normal, delay: 0.4 }}
        className="rounded-2xl p-4 text-center"
        style={{
          background: 'rgba(124,58,237,0.06)',
          border: '1px solid rgba(124,58,237,0.15)',
        }}
      >
        <p className="text-xs text-muted">
          <span style={{ color: '#A78BFA' }}>12 more candidates</span> match your profile
        </p>
      </motion.div>
    </div>
  )
}

export function ForEmployersSection() {
  return (
    <section
      id="for-employers"
      className="py-32 lg:py-40"
      aria-label="For employers"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — mockup */}
          <div className="order-2 lg:order-1">
            <EmployerDiscoveryMockup />
          </div>

          {/* Right — copy */}
          <div className="order-1 lg:order-2">
            <SectionHeader
              eyebrow="For employers"
              heading="Hire talent you can't find elsewhere."
              align="left"
              className="mb-8"
            />
            <motion.p
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ ...transitions.normal, delay: 0.2 }}
              className="text-muted leading-relaxed mb-8"
            >
              Our candidate pool is hand-selected. Every profile has been reviewed,
              every portfolio verified. You only see talent that&rsquo;s been greenlit
              by our team.
            </motion.p>
            <motion.ul
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ ...transitions.normal, delay: 0.28 }}
              className="space-y-3 mb-10"
            >
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle
                    size={18}
                    className="shrink-0 mt-0.5"
                    style={{ color: 'var(--color-secondary)' }}
                  />
                  <span className="text-sm text-muted">{benefit}</span>
                </li>
              ))}
            </motion.ul>
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ ...transitions.normal, delay: 0.36 }}
            >
              <Link
                href="/contact?type=employer"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 group"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                  boxShadow: '0 0 24px rgba(124,58,237,0.3)',
                }}
              >
                Request employer access
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
