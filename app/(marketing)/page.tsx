import { type Metadata } from 'next'
import { HeroSection } from '@/components/marketing/hero-section'
import { ProblemSection } from '@/components/marketing/problem-section'
import { SolutionSection } from '@/components/marketing/solution-section'
import { HowItWorksSection } from '@/components/marketing/how-it-works-section'
import { ForYouSection } from '@/components/marketing/for-you-section'
import { FeaturesSection } from '@/components/marketing/features-section'
import { TestimonialsSection } from '@/components/marketing/testimonials-section'
import { FaqSection } from '@/components/marketing/faq-section'
import { FinalCtaSection } from '@/components/marketing/final-cta-section'

export const metadata: Metadata = {
  title: 'ScouttOpp — The Creative Talent Platform',
  description:
    'The invitation-only platform for creative professionals. Apply, get personally reviewed, and build a profile that lets your work speak for itself. Now open for Founding Creatives.',
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <ForYouSection />
      <FeaturesSection />
      <TestimonialsSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  )
}
