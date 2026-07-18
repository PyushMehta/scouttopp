import React from 'react'

export function LegalPageShell({
  title,
  date,
  intro,
  children,
}: {
  title: string
  date: string
  intro: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen py-24 lg:py-32" data-color-scheme="light">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="mb-14">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest border mb-6"
            style={{ background: 'rgba(43,56,117,0.06)', borderColor: 'rgba(43,56,117,0.18)', color: 'var(--color-navy)' }}
          >
            Legal
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-charcoal mb-4">
            {title}
          </h1>
          <p className="text-stone text-sm">Effective date: {date}</p>
          <p className="mt-4 text-base text-stone leading-relaxed max-w-xl">{intro}</p>
        </div>

        <div
          className="rounded-2xl border p-5 mb-12 flex gap-3 items-start"
          style={{ borderColor: 'rgba(196,124,26,0.3)', background: 'rgba(196,124,26,0.05)' }}
        >
          <span className="text-base shrink-0 mt-0.5">⚠️</span>
          <p className="text-sm leading-relaxed" style={{ color: '#7a4e0a' }}>
            This document was drafted as a starting point and should be reviewed by a qualified legal
            professional before going live. It is not a substitute for legal advice.
          </p>
        </div>

        <div
          className="space-y-10"
          style={{ color: 'var(--color-charcoal)', lineHeight: '1.75', fontSize: '0.9375rem' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2
        className="text-xl font-bold mb-4 pb-3 border-b"
        style={{ color: 'var(--color-charcoal)', borderColor: 'var(--color-flax)' }}
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <div className="space-y-4 [&_ul]:pl-5 [&_ul]:space-y-2 [&_li]:list-disc [&_a]:underline [&_a]:decoration-dotted [&_strong]:font-semibold [&_table]:w-full [&_table]:text-sm [&_table]:border-collapse [&_th]:text-left [&_th]:pb-2 [&_th]:font-semibold [&_th]:border-b [&_th]:border-[rgba(43,56,117,0.12)] [&_td]:py-2 [&_td]:pr-6 [&_td]:align-top [&_tr]:border-b [&_tr]:border-[rgba(43,56,117,0.06)]">
        {children}
      </div>
    </section>
  )
}

export function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-navy)' }}>
        {title}
      </h3>
      <div className="space-y-2 [&_ul]:pl-5 [&_ul]:space-y-2 [&_li]:list-disc [&_strong]:font-semibold">
        {children}
      </div>
    </div>
  )
}
