'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, CheckCircle, User, Sparkles, Building2, Search, Star, Zap } from 'lucide-react'
import { transitions } from '@/lib/tokens'
import { SectionHeader } from './section-header'

const candidateSteps = [
  {
    number: '01',
    Icon: FileText,
    title: 'Apply',
    body: 'Create your profile and submit your portfolio through our online job application process.',
  },
  {
    number: '02',
    Icon: CheckCircle,
    title: 'We Review',
    body: 'Every application is manually evaluated to maintain the quality of our talent network.',
  },
  {
    number: '03',
    Icon: User,
    title: 'Get Approved',
    body: 'Once accepted, your profile becomes visible to verified employers actively hiring.',
  },
  {
    number: '04',
    Icon: Sparkles,
    title: 'Get Matched',
    body: 'Employers discover your work, express interest, and connect directly with you.',
  },
]

const employerSteps = [
  {
    number: '01',
    Icon: Building2,
    title: 'Request Access',
    body: 'Tell us about your company and hiring needs.',
  },
  {
    number: '02',
    Icon: Search,
    title: 'Browse Verified Talent',
    body: 'Search candidates by skills, location, availability, experience, and portfolio quality.',
  },
  {
    number: '03',
    Icon: Star,
    title: 'Connect',
    body: 'Express interest in candidates who fit your requirements.',
  },
  {
    number: '04',
    Icon: Zap,
    title: 'Hire Faster',
    body: 'Start conversations immediately when there\'s mutual interest and make hiring decisions with confidence.',
  },
]

type Tab = 'candidates' | 'employers'

const tabs: { id: Tab; label: string }[] = [
  { id: 'candidates', label: 'For Candidates' },
  { id: 'employers',  label: 'For Employers' },
]

function StepsGrid({ steps }: { steps: typeof candidateSteps }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {steps.map(({ number, Icon, title, body }, i) => (
        <motion.div
          key={number}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transitions.normal, delay: i * 0.09 }}
          className="relative"
        >
          {i < steps.length - 1 && (
            <div
              className="hidden lg:block absolute top-5 h-px"
              style={{
                background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
                left: 'calc(50% + 24px)',
                right: 0,
              }}
            />
          )}
          <span
            className="block text-6xl font-extrabold mb-2 select-none"
            style={{ color: 'rgba(124,58,237,0.12)', lineHeight: 1 }}
          >
            {number}
          </span>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}
          >
            <Icon size={18} style={{ color: 'var(--color-secondary)' }} aria-hidden="true" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted leading-relaxed">{body}</p>
        </motion.div>
      ))}
    </div>
  )
}

export function HowItWorksSection() {
  const [active, setActive] = useState<Tab>('candidates')

  return (
    <section
      id="how-it-works"
      className="py-32 lg:py-40"
      style={{ background: 'var(--color-surface)' }}
      aria-label="How it works"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-10">
          <SectionHeader
            eyebrow="How it works"
            heading="Simple on the surface. Deliberate underneath."
          />
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center mb-10">
          <div
            className="relative flex rounded-full p-1 gap-1"
            style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.14)' }}
          >
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActive(id)}
                className="relative rounded-full px-6 py-2 text-sm font-semibold transition-colors duration-200"
                style={{ color: active === id ? '#FFFFFF' : 'var(--color-muted)' }}
                aria-pressed={active === id}
              >
                {active === id && (
                  <motion.span
                    layoutId="hiw-tab-pill"
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'rgba(124,58,237,0.35)', border: '1px solid rgba(124,58,237,0.4)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={transitions.normal}
          >
            <StepsGrid steps={active === 'candidates' ? candidateSteps : employerSteps} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
