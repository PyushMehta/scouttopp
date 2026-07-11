'use client'

import { motion } from 'framer-motion'
import { LayoutGrid, Shield, Sparkles, MessageSquare, Users, Briefcase, BarChart3, Lock } from 'lucide-react'
import { fadeUpVariants, transitions } from '@/lib/tokens'
import { SectionHeader } from './section-header'

const features = [
  {
    Icon: LayoutGrid,
    title: 'Portfolio First',
    body: 'Your work tells your story better than a traditional CV. Showcase the projects that actually represent your skills.',
  },
  {
    Icon: Shield,
    title: 'Verified Talent',
    body: 'Every candidate is manually reviewed before joining the platform, creating a trusted community for employers.',
  },
  {
    Icon: Sparkles,
    title: 'Smart Matching',
    body: 'We match talent and employers based on skills, preferences, availability, and role requirements.',
  },
  {
    Icon: MessageSquare,
    title: 'Direct Connections',
    body: 'When both sides are interested, conversations begin immediately. No middlemen. No unnecessary delays.',
  },
  {
    Icon: Users,
    title: 'Built for Every Stage',
    body: 'Whether you are entering through fresher hiring, searching for an internship, or looking for your next full-time role — Scoutt Opp supports your journey.',
  },
  {
    Icon: Briefcase,
    title: 'Jobs & Internships',
    body: 'Discover internships, freelance projects, contract work, and full-time online job opportunities from growing companies.',
  },
  {
    Icon: BarChart3,
    title: 'Employer Dashboard',
    body: 'Review verified profiles, browse portfolios, shortlist candidates, and hire faster from one platform.',
  },
  {
    Icon: Lock,
    title: 'Secure & Private',
    body: 'Control who sees your profile and when you are available for opportunities. Your data, your terms.',
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
            heading="Everything you need to hire or get hired."
            subtext="Built for quality over quantity — from freshers to experienced professionals."
            light
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                background: '#FFFFFF',
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
