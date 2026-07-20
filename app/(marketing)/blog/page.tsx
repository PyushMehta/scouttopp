import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Insights on creative hiring, talent discovery, and the future of creative work — from the ScouttOpp team.',
}

const posts = [
  {
    slug: 'why-creative-hiring-is-broken-2026',
    title: 'Why Creative Hiring Is Broken in 2026 (And What Needs to Change)',
    excerpt:
      'The creative industry has never been bigger — yet hiring creative talent remains surprisingly difficult. We break down why the system is broken and what the future should look like.',
    category: 'Hiring & Industry',
    date: '20 July 2026',
    dateIso: '2026-07-20',
  },
]

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen py-16 lg:py-24" data-color-scheme="light">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="mb-14">
          <span
            className="inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest border mb-5"
            style={{
              background:  'rgba(43,56,117,0.06)',
              borderColor: 'rgba(43,56,117,0.18)',
              color:       'var(--color-navy)',
            }}
          >
            From the team
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-charcoal mb-4">
            ScouttOpp Blog
          </h1>
          <p className="text-lg text-stone leading-relaxed max-w-xl">
            Insights on creative hiring, talent discovery, and the future of creative work.
          </p>
        </div>

        {/* Post list */}
        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex flex-col sm:flex-row gap-5 p-6 rounded-2xl border transition-shadow hover:shadow-md"
                style={{ borderColor: 'var(--color-flax)', background: '#FFFFFF' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border"
                      style={{
                        background:  'rgba(107,95,174,0.07)',
                        borderColor: 'rgba(107,95,174,0.2)',
                        color:       '#6B5FAE',
                      }}
                    >
                      {post.category}
                    </span>
                    <time className="text-xs text-stone" dateTime={post.dateIso}>{post.date}</time>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-charcoal leading-snug mb-2 group-hover:text-navy transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-stone leading-relaxed line-clamp-2">{post.excerpt}</p>
                </div>
                <div className="flex items-center shrink-0 text-stone group-hover:text-navy transition-colors">
                  <ArrowRight size={18} aria-hidden="true" />
                </div>
              </Link>
            </li>
          ))}
        </ul>

      </div>
    </div>
  )
}
