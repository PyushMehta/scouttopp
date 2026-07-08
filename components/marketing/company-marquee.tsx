'use client'

const companies = [
  'Ogilvy', 'Droga5', 'Wieden+Kennedy', 'BBDO', 'R/GA',
  'Mother London', 'Leo Burnett', 'McCann', 'DDB Worldwide',
  'Publicis', 'Havas', 'Saatchi & Saatchi', 'TBWA', 'Grey Group', 'Unit9',
]

export function CompanyMarquee() {
  const items = [...companies, ...companies]

  return (
    <div
      className="relative overflow-hidden py-5 border-y"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <style>{`
        @keyframes scroll-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: scroll-marquee 35s linear infinite;
          display: flex;
          width: max-content;
        }
        .marquee-track:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>

      {/* Edge fade left */}
      <div
        className="absolute inset-y-0 left-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, var(--color-background), transparent)' }}
      />
      {/* Edge fade right */}
      <div
        className="absolute inset-y-0 right-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, var(--color-background), transparent)' }}
      />

      <div className="marquee-track" aria-hidden="true">
        {items.map((name, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2.5 px-8 text-sm font-semibold whitespace-nowrap"
            style={{ color: 'var(--color-muted)' }}
          >
            <span
              className="w-1 h-1 rounded-full shrink-0"
              style={{ background: 'var(--color-muted)', opacity: 0.4 }}
            />
            {name}
          </span>
        ))}
      </div>

      {/* Label overlay — sits on the left */}
      <div
        className="absolute left-0 inset-y-0 z-20 flex items-center pl-6 pr-16 pointer-events-none"
        style={{ background: 'linear-gradient(to right, var(--color-background) 60%, transparent)' }}
      >
        <span className="text-xs font-semibold uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--color-muted)', opacity: 0.6 }}>
          Trusted by teams at
        </span>
      </div>
    </div>
  )
}
