import { type Metadata } from 'next'
import { HeroSection } from '@/components/marketing/hero-section'
import { ProblemSection } from '@/components/marketing/problem-section'
import { SolutionSection } from '@/components/marketing/solution-section'
import { HowItWorksSection } from '@/components/marketing/how-it-works-section'
import { ForYouSection } from '@/components/marketing/for-you-section'
import { FeaturesSection } from '@/components/marketing/features-section'
import { FaqSection } from '@/components/marketing/faq-section'
import { FinalCtaSection } from '@/components/marketing/final-cta-section'

const BASE = 'https://scouttopp.com'

export const metadata: Metadata = {
  title: 'ScouttOpp — Invitation-Only Creative Talent Platform',
  description:
    'The invitation-only platform for creative professionals. Apply, get personally reviewed, and build a portfolio-first profile that lets your work speak for itself. Open for Founding Creatives.',
  keywords: [
    'creative talent platform', 'creative jobs', 'portfolio hiring', 'invitation only jobs',
    'creative professionals', 'motion designer jobs', 'graphic designer jobs', 'fresher creative jobs',
    'creative internships India', 'portfolio based hiring',
  ],
  openGraph: {
    title: 'ScouttOpp — Invitation-Only Creative Talent Platform',
    description: 'Get discovered through your portfolio, not your resume. The invitation-only network for creative professionals.',
    url: BASE,
    siteName: 'ScouttOpp',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScouttOpp — Invitation-Only Creative Talent Platform',
    description: 'Get discovered through your portfolio, not your resume.',
  },
  alternates: { canonical: BASE },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ScouttOpp',
  url: BASE,
  logo: `${BASE}/scoutt.png`,
  description: 'The invitation-only platform for creative professionals. Portfolio-first hiring that connects verified talent with verified employers.',
  contactPoint: { '@type': 'ContactPoint', email: 'support@scouttopp.com', contactType: 'customer support' },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ScouttOpp',
  url: BASE,
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is ScouttOpp free for candidates?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Creating a profile and applying is completely free for candidates.' } },
    { '@type': 'Question', name: 'What kind of jobs are available on ScouttOpp?', acceptedAnswer: { '@type': 'Answer', text: 'ScouttOpp features full-time jobs, freelance projects, contract roles, remote work, and internships from verified employers.' } },
    { '@type': 'Question', name: 'Is ScouttOpp only for creative professionals?', acceptedAnswer: { '@type': 'Answer', text: 'We started with creatives because portfolios matter, but ScouttOpp is expanding to help professionals across multiple industries.' } },
    { '@type': 'Question', name: 'How does ScouttOpp review candidates?', acceptedAnswer: { '@type': 'Answer', text: 'Every application is reviewed by our team. We evaluate portfolios, experience, and overall quality before approving profiles.' } },
    { '@type': 'Question', name: 'How long does the review process take?', acceptedAnswer: { '@type': 'Answer', text: 'Most applications are reviewed within a few business days. We\'ll notify you as soon as your profile has been evaluated.' } },
    { '@type': 'Question', name: 'Can freshers apply to ScouttOpp?', acceptedAnswer: { '@type': 'Answer', text: 'Absolutely. ScouttOpp supports fresher hiring and encourages students, graduates, and early-career professionals to apply.' } },
    { '@type': 'Question', name: 'Does ScouttOpp offer internships?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Companies regularly post internship opportunities, making ScouttOpp an excellent platform for students and graduates.' } },
    { '@type': 'Question', name: 'Can I hide my profile on ScouttOpp?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. You control your visibility and can pause your profile whenever you\'re not looking for opportunities.' } },
  ],
}

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <ForYouSection />
      <FeaturesSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  )
}
