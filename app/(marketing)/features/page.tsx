import type { Metadata } from 'next'
import { FeaturesSection } from '@/components/marketing/features-section'
import { ForYouSection } from '@/components/marketing/for-you-section'
import { FinalCtaSection } from '@/components/marketing/final-cta-section'

export const metadata: Metadata = {
  title: 'Features',
  description: 'How ScouttOpp works — invitation-only candidate profiles, portfolio-first discovery, and verified employers.',
}

export default function FeaturesPage() {
  return (
    <>
      <div className="py-16 lg:py-20 text-center" data-color-scheme="light" style={{ background: 'var(--color-warm-white)' }}>
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <span
            className="inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest border mb-6"
            style={{ background: 'rgba(43,56,117,0.06)', borderColor: 'rgba(43,56,117,0.18)', color: 'var(--color-navy)' }}
          >
            Platform
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-charcoal mb-4">
            Everything built around the work
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--color-stone)' }}>
            ScouttOpp is designed from the ground up for creative talent — where portfolios lead and
            resumes follow.
          </p>
        </div>
      </div>
      <FeaturesSection />
      <ForYouSection />
      <FinalCtaSection />
    </>
  )
}
