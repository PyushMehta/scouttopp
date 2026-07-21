'use client'

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { fadeUpVariants, transitions } from '@/lib/tokens'
import { SectionHeader } from './section-header'

const testimonials = [
  {
    quote:
      'Within two weeks of joining I had three conversations with brands I\'d been trying to reach for years.',
    name: 'Maya R.',
    role: 'Art Director',
    company: 'Freelance',
    initials: 'M',
    color: '#7C3AED',
  },
  {
    quote:
      'We found our Head of Design in four days. The quality of candidates is unlike anything on the usual platforms.',
    name: 'James K.',
    role: 'VP Creative',
    company: 'Studio Co.',
    initials: 'J',
    color: '#2B3875',
  },
  {
    quote:
      'I love that I control who sees my profile. No spam, no random recruiters — just real opportunities.',
    name: 'Aisha T.',
    role: 'Motion Designer',
    company: 'Freelance',
    initials: 'A',
    color: '#6B5FAE',
  },
]

export function TestimonialsSection() {
  return (
    <section
      data-color-scheme="light"
      className="py-32 lg:py-40"
      aria-label="Testimonials"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-14">
          <SectionHeader
            heading="Trusted by creative teams."
            light
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ quote, name, role, company, initials, color }, i) => (
            <motion.div
              key={name}
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ ...transitions.normal, delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 30 } }}
              className="rounded-2xl p-8 flex flex-col cursor-default transition-shadow duration-200"
              style={{
                background: 'var(--color-card)',
                border: '1px solid rgba(0,0,0,0.07)',
                boxShadow: '0 1px 3px rgba(43,56,117,0.06)',
              }}
            >
              <Quote
                size={28}
                className="mb-5 shrink-0"
                strokeWidth={1}
                style={{ color: 'rgba(43,56,117,0.2)' }}
              />
              <p className="text-sm leading-relaxed flex-1 mb-6" style={{ color: 'var(--color-charcoal)' }}>
                &ldquo;{quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
                  style={{ background: color }}
                >
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-charcoal)' }}>{name}</p>
                  <p className="text-xs" style={{ color: 'var(--color-stone)' }}>
                    {role} · {company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
