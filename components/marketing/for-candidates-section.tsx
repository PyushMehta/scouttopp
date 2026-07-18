'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { fadeUpVariants, transitions } from '@/lib/tokens'
import { SectionHeader } from './section-header'

const benefits = [
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
      {/* Header */}
      <div className="h-20 w-full" style={{ background: 'linear-gradient(135deg, #2B3875 0%, #6B5FAE 100%)' }} />
      <div className="px-6 pb-6">
        <div
          className="w-16 h-16 rounded-full border-4 border-white -mt-8 mb-3 flex items-center justify-center font-bold text-white text-xl"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)' }}
        >
        </div>
        <p className="font-bold text-lg" style={{ color: 'var(--color-charcoal)' }}>Soham P.</p>
        <p className="text-sm mb-4" style={{ color: 'var(--color-stone)' }}>Founder · Mumbai</p>
        {/* Portfolio grid */}
        <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden mb-4">
          {[
            'rgba(124,58,237,0.2)',
            'rgba(107,95,174,0.25)',
            'rgba(155,141,196,0.2)',
            'rgba(43,56,117,0.18)',
            'rgba(167,139,250,0.2)',
            'rgba(124,58,237,0.15)',
          ].map((bg, i) => (
            <div key={i} className="h-14 rounded-sm" style={{ background: bg }} />
          ))}
        </div>
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {['Motion', 'Brand', '3D', 'UI'].map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                background: 'rgba(43,56,117,0.07)',
                color: 'var(--color-navy)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ForCandidatesSection() {
  return (
    <section
      data-color-scheme="light"
      id="for-candidates"
      className="py-32 lg:py-40"
      aria-label="For creatives"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div>
            <SectionHeader
              eyebrow="For candidates"
              heading="Your work speaks first."
              align="left"
              light
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
              Whether you are looking for your first online job, exploring internship opportunities,
              or searching for your next role — Scoutt Opp helps you get discovered through your work,
              not just your resume. Employers come to you based on your skills and portfolio.
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
                    style={{ color: 'var(--color-brand-success)' }}
                  />
                  <span className="text-sm" style={{ color: 'var(--color-charcoal)' }}>{benefit}</span>
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
                href="/auth/signup?role=candidate"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 group"
                style={{
                  background: 'linear-gradient(135deg, #2B3875 0%, #6B5FAE 100%)',
                  boxShadow: '0 4px 16px rgba(43,56,117,0.25)',
                }}
              >
                Apply as a candidate
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Right — profile card */}
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ ...transitions.normal, delay: 0.1 }}
          >
            <ProfileCardMockup />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
