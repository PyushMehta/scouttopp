import Link from 'next/link'
import { Zap, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Container } from '@/components/layout/container'
import { Divider } from '@/components/ui/divider'

/* ─── Types ─────────────────────────────────────────────────────────────── */

export interface FooterLink {
  href: string
  label: string
  external?: boolean
}

export interface FooterColumn {
  heading: string
  links: FooterLink[]
}

export interface FooterProps {
  columns?: FooterColumn[]
  className?: string
}

/* ─── Defaults ──────────────────────────────────────────────────────────── */

const defaultColumns: FooterColumn[] = [
  {
    heading: 'Product',
    links: [
      { href: '/jobs',      label: 'Browse Jobs' },
      { href: '/employers', label: 'For Employers' },
      { href: '/pricing',   label: 'Pricing' },
      { href: '/changelog', label: 'Changelog' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/about',   label: 'About' },
      { href: '/blog',    label: 'Blog' },
      { href: '/careers', label: 'Careers' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms',   label: 'Terms of Service' },
      { href: '/cookies', label: 'Cookie Policy' },
    ],
  },
]

/* Social links use inline SVGs to avoid dependency on brand icons */
const socialLinks = [
  {
    href:  'https://github.com',
    label: 'GitHub',
    svg: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
      </svg>
    ),
  },
  {
    href:  'https://twitter.com',
    label: 'X / Twitter',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    href:  'https://linkedin.com',
    label: 'LinkedIn',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
]

/* ─── Component ─────────────────────────────────────────────────────────── */

export function Footer({ columns = defaultColumns, className }: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer
      className={cn('bg-surface border-t border-border', className)}
      aria-label="Site footer"
    >
      <Container>
        <div className="py-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link
              href="/"
              aria-label="ScouttOpp home"
              className="flex items-center gap-2 font-bold text-foreground w-fit"
            >
              <span
                className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"
                aria-hidden="true"
              >
                <Zap size={16} className="text-white" />
              </span>
              <span className="text-base tracking-tight">ScouttOpp</span>
            </Link>

            <p className="text-sm text-muted max-w-xs leading-relaxed">
              The modern platform connecting top talent with the companies that matter.
              Find your next opportunity today.
            </p>

            <div className="flex items-center gap-3 mt-1" role="list" aria-label="Social links">
              {socialLinks.map(({ href, label, svg }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  role="listitem"
                  className="w-8 h-8 rounded-lg bg-white/5 border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-primary/40 hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {svg}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.heading} className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-widest">
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-2" role="list">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
                    >
                      {link.label}
                      {link.external && (
                        <ExternalLink size={11} aria-hidden="true" className="shrink-0" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Divider />

        <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted">
            © {year} ScouttOpp, Inc. All rights reserved.
          </p>
          <p className="text-xs text-muted">
            Built with care for candidates and employers.
          </p>
        </div>
      </Container>
    </footer>
  )
}
