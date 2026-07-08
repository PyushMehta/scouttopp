import { type ReactNode } from 'react'
import { type Metadata } from 'next'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { MarketingFooter } from '@/components/marketing/marketing-footer'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://scouttopp.com'),
  title: {
    default: 'ScouttOpp — Curated Creative Talent',
    template: '%s | ScouttOpp',
  },
  description:
    'The invitation-only network for creative professionals. Apply, get reviewed by our team, and build a profile that lets your work speak for itself.',
  openGraph: {
    type: 'website',
    siteName: 'ScouttOpp',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  )
}
