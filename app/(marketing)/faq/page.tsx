import type { Metadata } from 'next'
import { FaqSection } from '@/components/marketing/faq-section'
import { FinalCtaSection } from '@/components/marketing/final-cta-section'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Common questions about ScouttOpp — for candidates and employers.',
}

export default function FaqPage() {
  return (
    <>
      <div className="py-16 lg:py-20 text-center">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <span
            className="inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest border mb-6"
            style={{ background: 'rgba(43,56,117,0.06)', borderColor: 'rgba(43,56,117,0.18)', color: 'var(--color-navy)' }}
          >
            Help
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            Frequently asked questions
          </h1>
          <p className="text-lg leading-relaxed text-muted">
            Everything you need to know about ScouttOpp.
          </p>
        </div>
      </div>
      <FaqSection />
      <FinalCtaSection />
    </>
  )
}
