'use client'

import { motion } from 'framer-motion'
import { Inbox, EyeOff, Clock } from 'lucide-react'
import { fadeUpVariants, transitions } from '@/lib/tokens'
import { SectionHeader } from './section-header'

const painPoints = [
  {
    Icon: Inbox,
    title: 'Keywords are not talent',
    body: 'Traditional hiring filters people through keyword-matched CVs, missing the candidates whose work speaks louder than their resume.',
  },
  {
    Icon: EyeOff,
    title: 'Real talent stays invisible',
    body: 'The best professionals are not on job boards. They are working. They are only reachable through platforms designed for them.',
  },
  {
    Icon: Clock,
    title: 'Hiring takes too long',
    body: 'Sourcing, screening, endless back-and-forth. Roles that needed filling last month are still open because the process was built for compliance, not speed.',
  },
]

export function ProblemSection() {
  return (
    <section
      data-color-scheme="light"
      className="py-16 lg:py-24"
      aria-label="The problem"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left — copy */}
          <div>
            <SectionHeader
              eyebrow="The problem"
              heading="Hiring hasn't caught up with real talent."
              align="left"
              light
              className="mb-8"
            />
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ ...transitions.normal, delay: 0.2 }}
            >
              <p className="text-muted leading-relaxed mb-4">
                The industry still runs on keyword-filtered CVs, referral chains, and luck.
                Employers are overwhelmed with applications that don&rsquo;t fit.
                Talented professionals — freshers, interns, and experienced hires alike —
                are invisible to the companies that need them.
              </p>
              <p className="font-semibold" style={{ color: 'var(--color-navy)' }}>
                There&rsquo;s a better way.
              </p>
            </motion.div>
          </div>

          {/* Right — pain cards */}
          <div className="grid gap-5">
            {painPoints.map(({ Icon, title, body }, i) => (
              <motion.div
                key={title}
                variants={fadeUpVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ ...transitions.normal, delay: 0.1 + i * 0.1 }}
                whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 30 } }}
                className="rounded-2xl p-7 cursor-default transition-shadow duration-200"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 1px 3px rgba(43,56,117,0.06)',
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(43, 56, 117, 0.06)' }}
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
      </div>
    </section>
  )
}
