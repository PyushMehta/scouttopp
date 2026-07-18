'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, CheckCircle, Clock,
  Search, SlidersHorizontal, BookOpen, Zap, MessageCircle,
} from 'lucide-react'
import { fadeUpVariants, transitions } from '@/lib/tokens'
import { SectionHeader } from './section-header'

/* ─── Candidates tab ─────────────────────────────────────────────────────── */

const candidateBenefits = [
  'One profile — works for jobs, internships, and freelance',
  'Get discovered through your portfolio, not keywords',
  'Full control over who sees your work and when',
  'Pause your visibility whenever you need to',
  'No cold outreach, no agency middlemen',
]

function ProfileCardMockup() {
  return (
    <div
      className="rounded-2xl overflow-hidden w-full max-w-sm mx-auto"
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(43,56,117,0.1)',
        boxShadow: '0 4px 24px rgba(43,56,117,0.1)',
      }}
    >
      <div className="h-20 w-full" style={{ background: 'linear-gradient(135deg, #2B3875 0%, #6B5FAE 100%)' }} />
      <div className="px-6 pb-6">
        <div
          className="w-16 h-16 rounded-full border-4 border-white -mt-8 mb-3 flex items-center justify-center font-bold text-white text-xl"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)' }}
        >
          S
        </div>
        <p className="font-bold text-lg" style={{ color: 'var(--color-charcoal)' }}>Soham P.</p>
        <p className="text-sm mb-4" style={{ color: 'var(--color-stone)' }}>Founder · Mumbai</p>
        <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden mb-4">
          {[
            'rgba(124,58,237,0.2)', 'rgba(107,95,174,0.25)', 'rgba(155,141,196,0.2)',
            'rgba(43,56,117,0.18)', 'rgba(167,139,250,0.2)', 'rgba(124,58,237,0.15)',
          ].map((bg, i) => (
            <div key={i} className="h-14 rounded-sm" style={{ background: bg }} />
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['Motion', 'Brand', '3D', 'UI'].map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ background: 'rgba(43,56,117,0.07)', color: 'var(--color-navy)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function CandidatesContent() {
  return (
    <div className="grid lg:grid-cols-2 gap-16 items-center">
      <div>
        <motion.p
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          transition={{ ...transitions.normal, delay: 0.05 }}
          className="text-muted leading-relaxed mb-8"
        >
          Whether you are looking for your first online job, exploring internship opportunities,
          or searching for your next role — Scoutt Opp helps you get discovered through your work,
          not just your resume. Employers come to you based on your skills and portfolio.
        </motion.p>
        <motion.ul
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          transition={{ ...transitions.normal, delay: 0.12 }}
          className="space-y-3 mb-10"
        >
          {candidateBenefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3">
              <CheckCircle size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--color-brand-success)' }} />
              <span className="text-sm" style={{ color: 'var(--color-charcoal)' }}>{benefit}</span>
            </li>
          ))}
        </motion.ul>
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          transition={{ ...transitions.normal, delay: 0.2 }}
        >
          <Link
            href="/auth/signup?role=candidate"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 group"
            style={{
              background: 'linear-gradient(135deg, #2B3875 0%, #6B5FAE 100%)',
              boxShadow: '0 4px 16px rgba(43,56,117,0.25)',
            }}
          >
            Apply as a candidate
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        transition={{ ...transitions.normal, delay: 0.08 }}
      >
        <ProfileCardMockup />
      </motion.div>
    </div>
  )
}

/* ─── Employers tab ──────────────────────────────────────────────────────── */

const employerCapabilities = [
  {
    Icon: Search,
    title: 'Verified talent discovery',
    description: 'Browse a curated pool of manually reviewed professionals — no bots, no bulk applicants.',
  },
  {
    Icon: SlidersHorizontal,
    title: 'Role and skills filters',
    description: 'Filter by discipline, location, availability, and rate range to surface exactly who you need.',
  },
  {
    Icon: BookOpen,
    title: 'Portfolio-first profiles',
    description: 'See the work before the CV. Every candidate leads with their best projects, not a bullet list.',
  },
  {
    Icon: Zap,
    title: 'Scout Mode',
    description: 'A swipe-based discovery interface that lets you signal interest in seconds, not hours.',
  },
  {
    Icon: MessageCircle,
    title: 'Direct connections',
    description: 'When there is mutual interest, you connect directly — no agency fees, no intermediaries.',
  },
]

function EmployersContent() {
  return (
    <div>
      {/* Coming soon badge + description */}
      <div className="text-center mb-8">
        <motion.span
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-5"
          style={{
            background: 'rgba(43,56,117,0.08)',
            border: '1px solid rgba(43,56,117,0.15)',
            color: 'var(--color-navy)',
          }}
        >
          <Clock size={11} aria-hidden="true" />
          Coming Soon
        </motion.span>
        <motion.p
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          transition={{ ...transitions.normal, delay: 0.08 }}
          className="text-base text-muted leading-relaxed max-w-xl mx-auto mt-4"
        >
          We&apos;re building the candidate community first. Once we&apos;ve established a
          high-quality talent base, we&apos;ll open access to the employers who deserve it.
        </motion.p>
      </div>

      {/* Capabilities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
        {employerCapabilities.map(({ Icon, title, description }, i) => (
          <motion.div
            key={title}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ ...transitions.normal, delay: 0.06 * (i + 1) }}
            className="rounded-2xl p-6"
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(43,56,117,0.08)',
              boxShadow: '0 1px 3px rgba(43,56,117,0.06)',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(43,56,117,0.06)' }}
            >
              <Icon size={18} style={{ color: 'var(--color-navy)' }} aria-hidden="true" />
            </div>
            <h3 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--color-charcoal)' }}>{title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-stone)' }}>{description}</p>
          </motion.div>
        ))}
      </div>

      <motion.p
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        transition={{ ...transitions.normal, delay: 0.4 }}
        className="text-center text-sm mt-10"
        style={{ color: 'var(--color-stone)' }}
      >
        Interested in early employer access?{' '}
        <Link
          href="/contact?type=employer"
          className="underline underline-offset-4 transition-colors hover:text-foreground"
          style={{ color: 'var(--color-navy)' }}
        >
          Get in touch
        </Link>
      </motion.p>
    </div>
  )
}

/* ─── Combined section ───────────────────────────────────────────────────── */

type Tab = 'candidates' | 'employers'

const tabs: { id: Tab; label: string }[] = [
  { id: 'candidates', label: 'For Candidates' },
  { id: 'employers',  label: 'For Employers' },
]

export function ForYouSection() {
  const [active, setActive] = useState<Tab>('candidates')

  return (
    <section
      data-color-scheme="light"
      id="for-you"
      className="py-16 lg:py-24"
      aria-label="For candidates and employers"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-8">
          <SectionHeader
            eyebrow="Built for both sides"
            heading="Your work speaks first."
            light
          />
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center mb-8">
          <div
            className="relative flex rounded-full p-1 gap-1"
            style={{ background: 'rgba(43,56,117,0.07)', border: '1px solid rgba(43,56,117,0.1)' }}
          >
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActive(id)}
                className="relative z-10 rounded-full px-6 py-2 text-sm font-semibold transition-colors duration-200"
                style={{
                  color: active === id ? '#FFFFFF' : 'var(--color-stone)',
                }}
                aria-pressed={active === id}
              >
                {active === id && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #2B3875 0%, #6B5FAE 100%)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={transitions.normal}
          >
            {active === 'candidates' ? <CandidatesContent /> : <EmployersContent />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
