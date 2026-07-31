import type { Metadata } from 'next'
import { FaqSection } from '@/components/marketing/faq-section'
import { FinalCtaSection } from '@/components/marketing/final-cta-section'

const BASE = 'https://scouttopp.com'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions — Creative Jobs & Hiring | ScouttOpp',
  description: 'Common questions about ScouttOpp: how to apply, what jobs are available, fresher eligibility, internships, and how employers hire creative talent.',
  alternates: { canonical: `${BASE}/faq` },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is ScouttOpp free for candidates?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Creating a profile and applying is completely free for candidates.' } },
    { '@type': 'Question', name: 'What kind of jobs are available on ScouttOpp?', acceptedAnswer: { '@type': 'Answer', text: 'ScouttOpp features full-time jobs, freelance projects, contract roles, remote work, and internships from verified employers.' } },
    { '@type': 'Question', name: 'Is ScouttOpp only for creative professionals?', acceptedAnswer: { '@type': 'Answer', text: 'We started with creatives because portfolios matter, but ScouttOpp is expanding to help professionals across multiple industries connect with the right employers.' } },
    { '@type': 'Question', name: 'How does ScouttOpp review candidates?', acceptedAnswer: { '@type': 'Answer', text: 'Every application is reviewed by our team. We evaluate portfolios, experience, and overall quality before approving profiles.' } },
    { '@type': 'Question', name: 'How long does the review process take?', acceptedAnswer: { '@type': 'Answer', text: 'Most applications are reviewed within a few business days. We\'ll notify you as soon as your profile has been evaluated.' } },
    { '@type': 'Question', name: 'Can freshers apply to ScouttOpp?', acceptedAnswer: { '@type': 'Answer', text: 'Absolutely. ScouttOpp supports fresher hiring and encourages students, graduates, and early-career professionals to apply.' } },
    { '@type': 'Question', name: 'Does ScouttOpp offer internships?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Companies regularly post internship opportunities, making ScouttOpp an excellent platform for students and graduates looking to gain real-world experience.' } },
    { '@type': 'Question', name: 'How do employers hire through ScouttOpp?', acceptedAnswer: { '@type': 'Answer', text: 'Employers request access, browse verified candidates, express interest, and connect directly when there\'s a mutual match.' } },
    { '@type': 'Question', name: 'Can I hide my profile on ScouttOpp?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. You control your visibility and can pause your profile whenever you\'re not looking for opportunities.' } },
    { '@type': 'Question', name: 'Can I apply for jobs online through ScouttOpp?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Every opportunity on ScouttOpp can be accessed through a simple online application, allowing employers to review your profile and portfolio together.' } },
  ],
}

export default function FaqPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
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
