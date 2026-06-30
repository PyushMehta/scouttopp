import { Sparkles, Users, Shield, Zap } from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'Portfolio-first profiles',
    body:  'Showcase your best work the moment you apply — no résumé needed.',
  },
  {
    icon: Users,
    title: 'Curated creative community',
    body:  'Every profile is reviewed by a human. Quality over quantity, always.',
  },
  {
    icon: Shield,
    title: 'Verified companies only',
    body:  'Every employer is identity-verified before they can contact you.',
  },
  {
    icon: Zap,
    title: 'Matched, not broadcast',
    body:  'Opportunities find you based on your actual work, not keyword searches.',
  },
] as const

export function BrandPanel() {
  return (
    <div className="flex flex-col justify-between h-full px-12 py-16 select-none">

      {/* Logo */}
      <div className="flex items-center gap-3">
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(155, 141, 196, 0.25)' }}
          aria-hidden="true"
        >
          {/* S-mark: stylised letter S */}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path
              d="M13 4.5C13 3.12 11.88 2 10.5 2h-3A3.5 3.5 0 0 0 4 5.5c0 1.38.79 2.58 2 3.14L12 11a2 2 0 0 1 1 1.76A2.24 2.24 0 0 1 10.76 15H7.5A2.5 2.5 0 0 1 5 12.5"
              stroke="white"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="text-white font-bold text-lg tracking-tight">ScouttOpp</span>
      </div>

      {/* Hero text */}
      <div className="space-y-4">
        <h1 className="text-white font-extrabold text-4xl leading-tight tracking-tight">
          The platform where<br />
          <span style={{ color: '#9B8DC4' }}>creative work</span><br />
          speaks for itself.
        </h1>
        <p style={{ color: 'rgba(245,237,224,0.7)' }} className="text-base leading-relaxed max-w-xs">
          Join thousands of designers, directors, and creative professionals
          who found their best opportunities on ScouttOpp.
        </p>
      </div>

      {/* Feature list */}
      <ul className="space-y-5" role="list">
        {features.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex gap-4 items-start">
            <span
              className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5"
              style={{ background: 'rgba(155, 141, 196, 0.2)' }}
              aria-hidden="true"
            >
              <Icon size={15} color="#9B8DC4" strokeWidth={1.75} />
            </span>
            <span>
              <span className="block text-white font-semibold text-sm leading-snug">{title}</span>
              <span className="block text-sm leading-relaxed" style={{ color: 'rgba(245,237,224,0.6)' }}>
                {body}
              </span>
            </span>
          </li>
        ))}
      </ul>

      {/* Testimonial */}
      <figure className="space-y-3">
        <blockquote
          className="text-sm leading-relaxed italic"
          style={{ color: 'rgba(245,237,224,0.75)' }}
        >
          &ldquo;I had three interviews with companies I actually wanted to work at
          within two weeks of joining. ScouttOpp understood what I do in
          a way job boards never have.&rdquo;
        </blockquote>
        <figcaption className="flex items-center gap-3">
          {/* Avatar placeholder */}
          <span
            className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
            style={{ background: 'rgba(107, 95, 174, 0.4)', color: '#D8C5F0' }}
            aria-hidden="true"
          >
            MR
          </span>
          <span>
            <span className="block text-sm font-semibold text-white">Maya R.</span>
            <span className="block text-xs" style={{ color: 'rgba(245,237,224,0.5)' }}>
              Senior Motion Designer · Los Angeles
            </span>
          </span>
        </figcaption>
      </figure>

    </div>
  )
}
