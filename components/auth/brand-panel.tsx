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
        <img src="/Scoutt.png" alt="" className="h-8 w-auto" aria-hidden="true" />
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

    </div>
  )
}
