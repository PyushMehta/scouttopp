'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { fadeUpVariants, transitions } from '@/lib/tokens'

export function FinalCtaSection() {
  return (
    <section
      className="py-16 lg:py-24 relative overflow-hidden"
      aria-label="Call to action"
    >
      {/* Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124,58,237,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <motion.p
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-xs font-semibold uppercase tracking-widest mb-6"
          style={{ color: '#A78BFA' }}
        >
          Your spot is waiting
        </motion.p>
        <motion.h2
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ ...transitions.normal, delay: 0.08 }}
          className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6"
        >
          Stop applying. Start being found.
        </motion.h2>
        <motion.p
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ ...transitions.normal, delay: 0.16 }}
          className="text-lg text-muted leading-relaxed mb-12 max-w-xl mx-auto"
        >
          Scoutt Opp is built for ambitious professionals at every stage — freshers, interns,
          and experienced hires. Apply once, get reviewed by our team, and let your work do the rest.
        </motion.p>
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ ...transitions.normal, delay: 0.24 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/auth/signup?role=candidate"
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 group"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              boxShadow: '0 0 32px rgba(124,58,237,0.35)',
            }}
          >
            Apply as a creative
            <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-medium text-muted hover:text-foreground transition-all duration-200"
            style={{ border: '1px solid var(--color-border)' }}
          >
            Sign in
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
