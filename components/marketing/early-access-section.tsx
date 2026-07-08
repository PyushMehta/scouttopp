'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, Star } from 'lucide-react'
import { fadeUpVariants, transitions } from '@/lib/tokens'
import { SectionHeader } from './section-header'

const perks = [
  'Free to apply — always',
  'Personal review within 5 business days',
  'Full control of your portfolio and visibility',
  'Founding Creative status — shape the platform',
  'First access to employer matching when it launches',
]

export function EarlyAccessSection() {
  return (
    <section
      className="py-32 lg:py-40"
      aria-label="Early access"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(124,58,237,0.08) 0%, transparent 70%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-14">
          <SectionHeader
            eyebrow="Founding Creative"
            heading="Be part of the first cohort."
            subtext="We're hand-building this community. The creatives who join now will shape what ScouttOpp becomes."
          />
        </div>

        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ ...transitions.normal, delay: 0.1 }}
          className="max-w-xl mx-auto rounded-2xl p-8 md:p-10 flex flex-col items-center text-center"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold mb-6"
            style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.25)' }}
          >
            <Star size={11} fill="currentColor" aria-hidden="true" />
            Candidate Beta — Now Open
          </div>

          <h3 className="text-2xl font-bold text-foreground mb-3">Creative Professional Access</h3>
          <p className="text-sm text-muted leading-relaxed mb-8 max-w-sm">
            Apply once. Get personally reviewed. Be discovered by intentional employers
            who value craft over keywords.
          </p>

          <ul className="space-y-3 mb-10 w-full max-w-sm text-left">
            {perks.map((perk) => (
              <li key={perk} className="flex items-start gap-3">
                <CheckCircle
                  size={16}
                  className="shrink-0 mt-0.5"
                  style={{ color: 'var(--color-secondary)' }}
                  aria-hidden="true"
                />
                <span className="text-sm text-muted">{perk}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/auth/signup?role=candidate"
            className="flex items-center justify-center gap-2 w-full max-w-xs rounded-full py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 group"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              boxShadow: '0 0 24px rgba(124,58,237,0.3)',
            }}
          >
            Apply as a creative
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </Link>

          <p className="mt-4 text-xs text-muted/60">Free forever during beta · No credit card needed</p>
        </motion.div>
      </div>
    </section>
  )
}
