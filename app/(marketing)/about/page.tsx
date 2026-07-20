import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'ScouttOpp is a curated creative talent marketplace built on intention — connecting verified creative professionals with the employers who value their work.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="mb-14">
          <span
            className="inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest border mb-6"
            style={{ background: 'rgba(107,95,174,0.08)', borderColor: 'rgba(107,95,174,0.2)', color: 'var(--color-secondary)' }}
          >
            Our story
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-foreground mb-5">
            Built for the creative who does the work
          </h1>
          <p className="text-lg leading-relaxed text-muted">
            ScouttOpp was founded on a simple belief: the best creative talent rarely gets discovered through a resume.
          </p>
        </div>

        {/* Body */}
        <div className="space-y-8 text-base leading-relaxed text-muted">

          <p>
            The hiring system for creative professionals is broken. Talented designers, filmmakers,
            writers, and artists spend months applying to jobs that never get back to them — while
            employers scroll through hundreds of irrelevant applications that don&apos;t show any actual work.
          </p>

          <p>
            We built ScouttOpp to fix that by putting the work first. Every candidate on ScouttOpp has
            been personally reviewed by our team. Every employer has been verified as a legitimate,
            professional company. The platform exists to make one thing happen: meaningful connections
            between creative talent and the employers who genuinely value it.
          </p>

          <div className="rounded-2xl border border-border bg-card p-8 my-10">
            <p className="text-xl font-bold text-foreground leading-snug mb-3">
              &ldquo;Finding the right opportunity shouldn&apos;t depend on luck.<br />
              It should depend on talent.&rdquo;
            </p>
            <p className="text-sm text-muted">— The ScouttOpp Team</p>
          </div>

          <h2 className="text-xl font-bold text-foreground pt-4">What we believe</h2>

          <ul className="space-y-4">
            {[
              { h: 'Work over résumé', b: 'A portfolio tells you far more about a designer than where they went to school or what their job title was.' },
              { h: 'Curation over volume', b: 'A smaller pool of genuinely talented, verified candidates is worth more than a million unreviewed applications.' },
              { h: 'Intention over algorithm', b: 'Every decision on our platform — who gets in, who sees what — is made with human judgement, not a black-box ranking system.' },
              { h: 'Access for everyone', b: "Great creative talent doesn't only come from big cities or well-connected networks. We want to find it everywhere." },
            ].map(({ h, b }) => (
              <li key={h} className="flex gap-4">
                <span className="w-1.5 h-1.5 rounded-full mt-2.5 shrink-0 bg-primary" />
                <div>
                  <p className="font-semibold text-foreground mb-1">{h}</p>
                  <p>{b}</p>
                </div>
              </li>
            ))}
          </ul>

          <h2 className="text-xl font-bold text-foreground pt-4">Where we are</h2>
          <p>
            ScouttOpp is currently in its Founding Creative phase — we&apos;re onboarding our first
            cohort of creative professionals before opening to employers. If you&apos;re a creative
            professional who&apos;s serious about being discovered for your work, now is the best time
            to apply.
          </p>

          <div className="pt-6">
            <a
              href="mailto:support@scouttopp.com"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Get in touch → support@scouttopp.com
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
