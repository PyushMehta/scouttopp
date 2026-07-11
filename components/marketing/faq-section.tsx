'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { fadeUpVariants, transitions } from '@/lib/tokens'
import { SectionHeader } from './section-header'

const faqs = [
  {
    group: 'General',
    items: [
      {
        q: 'Is Scoutt Opp free for candidates?',
        a: 'Yes. Creating a profile and applying is completely free for candidates.',
      },
      {
        q: 'What kind of jobs are available?',
        a: 'Scoutt Opp features full-time jobs, freelance projects, contract roles, remote work, and internships from verified employers.',
      },
      {
        q: 'Is Scoutt Opp only for creative professionals?',
        a: 'We started with creatives because portfolios matter, but Scoutt Opp is expanding to help professionals across multiple industries connect with the right employers.',
      },
      {
        q: 'How does Scoutt Opp review candidates?',
        a: 'Every application is reviewed by our team. We evaluate portfolios, experience, and overall quality before approving profiles.',
      },
      {
        q: 'How long does the review process take?',
        a: 'Most applications are reviewed within a few business days. We\'ll notify you as soon as your profile has been evaluated.',
      },
      {
        q: 'Can freshers apply?',
        a: 'Absolutely. Scoutt Opp supports fresher hiring and encourages students, graduates, and early-career professionals to apply.',
      },
      {
        q: 'Does Scoutt Opp offer internships?',
        a: 'Yes. Companies regularly post internship opportunities, making Scoutt Opp an excellent platform for students and graduates looking to gain real-world experience.',
      },
      {
        q: 'How do employers hire through Scoutt Opp?',
        a: 'Employers request access, browse verified candidates, express interest, and connect directly when there\'s a mutual match.',
      },
      {
        q: 'Can I hide my profile?',
        a: 'Yes. You control your visibility and can pause your profile whenever you\'re not looking for opportunities.',
      },
      {
        q: 'Can I apply for jobs online?',
        a: 'Yes. Every opportunity on Scoutt Opp can be accessed through a simple online application, allowing employers to review your profile and portfolio together.',
      },
      {
        q: 'Does Scoutt Opp help with Google hiring?',
        a: 'Many users search for Google hiring and other top companies. While Scoutt Opp is not affiliated with Google, we help candidates build strong profiles and portfolios that improve their chances of getting noticed by leading employers across industries.',
      },
    ],
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--color-charcoal)' }}>
          {q}
        </span>
        <span
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-150"
          style={{
            background: open ? 'rgba(43,56,117,0.1)' : 'rgba(43,56,117,0.05)',
          }}
        >
          {open ? (
            <Minus size={14} style={{ color: 'var(--color-navy)' }} />
          ) : (
            <Plus size={14} style={{ color: 'var(--color-navy)' }} />
          )}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transitions.normal}
            className="overflow-hidden"
          >
            <p className="text-sm leading-relaxed pb-5" style={{ color: 'var(--color-stone)' }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FaqSection() {
  return (
    <section
      data-color-scheme="light"
      id="faq"
      className="py-16 lg:py-24"
      aria-label="Frequently asked questions"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-8">
          <SectionHeader heading="FAQs" light />
        </div>

        <div className="max-w-2xl mx-auto space-y-10">
          {faqs.map(({ group, items }, gi) => (
            <motion.div
              key={group}
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ ...transitions.normal, delay: gi * 0.08 }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: 'var(--color-navy)' }}
              >
                {group}
              </p>
              <div
                className="rounded-2xl overflow-hidden px-6"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.07)',
                  boxShadow: '0 1px 3px rgba(43,56,117,0.06)',
                }}
              >
                {items.map(({ q, a }) => (
                  <FaqItem key={q} q={q} a={a} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
