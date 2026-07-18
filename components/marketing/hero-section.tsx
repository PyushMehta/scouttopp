'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Play, ChevronDown } from 'lucide-react'
import { fadeUpVariants, transitions } from '@/lib/tokens'
import { EyebrowBadge } from './eyebrow-badge'

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Full-screen video background — place video at /public/videos/hero-bg.mp4 */}
      <video
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/marketing/hero-bg.mp4`}
      />

      {/* Dark overlay for readability */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'rgba(10,10,10,0.62)' }}
      />

      {/* Purple accent orb — subtle on top of video */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-125"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124, 58, 237, 0.1) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 pt-24 pb-32 lg:pt-32 lg:pb-40 text-center">
        {/* Eyebrow */}
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="mb-6 flex justify-center"
        >
          <EyebrowBadge>✦ Invitation only</EyebrowBadge>
        </motion.div>

        {/* H1 */}
        <div className="mb-6">
          {[
            { text: 'Talent this good', delay: 0.08 },
            { text: "doesn't come from", delay: 0.16 },
            { text: 'a job ', extraWord: 'board.', delay: 0.24 },
          ].map(({ text, extraWord, delay }) => (
            <motion.span
              key={text}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ ...transitions.normal, delay }}
              className="block font-extrabold text-white leading-none tracking-tight"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 5.5rem)', letterSpacing: '-0.03em' }}
            >
              {text}
              {extraWord && (
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #A78BFA 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {extraWord}
                </span>
              )}
            </motion.span>
          ))}
        </div>

        {/* Subheadline */}
        <motion.p
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          transition={{ ...transitions.normal, delay: 0.36 }}
          className="text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto"
          style={{ color: 'rgba(255,255,255,0.72)' }}
        >
          A modern hiring platform connecting ambitious professionals with companies that value
          talent over keywords. Get discovered through your work — not just your resume.
        </motion.p>

        {/* CTA Row */}
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          transition={{ ...transitions.normal, delay: 0.48 }}
          className="flex flex-col sm:flex-row items-center gap-4 justify-center"
        >
          <Link
            href="/auth/signup?role=candidate"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 group"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              boxShadow: '0 0 28px rgba(124, 58, 237, 0.35)',
            }}
          >
            Apply as a candidate
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium transition-all duration-200"
            style={{ color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <Play size={14} aria-hidden="true" />
            See how it works
          </Link>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="flex items-center justify-center mt-20"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={20} style={{ color: 'rgba(255,255,255,0.4)' }} aria-hidden="true" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
