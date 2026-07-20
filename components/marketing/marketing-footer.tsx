import Link from 'next/link'

const productLinks = [
  { label: 'Features', href: '/features' },
  { label: 'FAQ', href: '/faq' },
  { label: 'For Creatives', href: '/#for-you' },
  { label: 'For Employers', href: '/contact?type=employer' },
]

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

const legalLinks = [
  { label: 'Privacy Policy',   href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Trust & Safety',   href: '/trust' },
]

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/scoutt.opp',
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
]

export function MarketingFooter() {
  return (
    <footer className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity mb-3">
              <img src="/scoutt.png" alt="ScouttOpp" className="h-8 w-auto" />
            </Link>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              The creative talent marketplace built on intention.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">Product</p>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-foreground transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">Company</p>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-foreground transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">Legal</p>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-foreground transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} ScouttOpp. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map(({ label, href, svg }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-muted hover:text-foreground transition-colors duration-150"
              >
                {svg}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
