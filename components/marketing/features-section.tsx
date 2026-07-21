'use client'

import { motion } from 'framer-motion'
import { LayoutGrid, Shield, Users, Briefcase, Lock } from 'lucide-react'
import { fadeUpVariants, transitions } from '@/lib/tokens'
import { SectionHeader } from './section-header'

const features = [
  {
    Icon: LayoutGrid,
    title: 'Portfolio First',
    body: 'Your work tells your story better than a CV. Showcase the projects that actually represent your skills.',
  },
  {
    Icon: Shield,
    title: 'Invitation-Only Network',
    body: 'Every profile is manually reviewed before joining. That means fewer irrelevant introductions — and more meaningful ones.',
  },
  {
    Icon: Users,
    title: 'For Every Stage',
    body: 'Whether you are a fresher, seeking an internship, or looking for your next full-time role — ScouttOpp supports your journey.',
  },
  {
    Icon: Briefcase,
    title: 'Jobs & Internships',
    body: 'Full-time roles, freelance projects, contract work, and internships — all from verified, growing companies.',
  },
  {
    Icon: Lock,
    title: 'Your Visibility, Your Terms',
    body: 'Control exactly who can see your profile and when. Pause discovery any time — no explanation needed.',
  },
]

export function FeaturesSection() {
  return (
    <section
      data-color-scheme="light"
      id="features"
      className="py-16 lg:py-24"
      aria-label="Platform features"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-8">
          <SectionHeader
            eyebrow="Features"
            heading="Everything you need to get hired."
            subtext="Built for quality over quantity — from freshers to senior creative professionals."
            light
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ Icon, title, body }, i) => (
            <motion.div
              key={title}
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ ...transitions.normal, delay: i * 0.06 }}
              whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 30 } }}
              className="rounded-2xl p-7 group cursor-default transition-shadow duration-200"
              style={{
                background: 'var(--color-card)',
                border: '1px solid rgba(0,0,0,0.07)',
                boxShadow: '0 1px 3px rgba(43,56,117,0.06)',
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ background: 'rgba(43,56,117,0.06)' }}
              >
                <Icon size={20} style={{ color: 'var(--color-navy)' }} />
              </div>
              <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--color-charcoal)' }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-stone)' }}>
                {body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
