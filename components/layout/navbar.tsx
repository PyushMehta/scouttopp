'use client'

import { useState, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Container } from '@/components/layout/container'

/* ─── Types ─────────────────────────────────────────────────────────────── */

export interface NavLink {
  href: string
  label: string
  external?: boolean
}

export interface NavbarProps {
  logo?: ReactNode
  links?: NavLink[]
  ctaHref?: string
  ctaLabel?: string
  loginHref?: string
  className?: string
}

const defaultLinks: NavLink[] = [
  { href: '/',          label: 'Home' },
  { href: '/jobs',      label: 'Jobs' },
  { href: '/employers', label: 'Employers' },
  { href: '/about',     label: 'About' },
]

/* ─── Shared link-button style ──────────────────────────────────────────── */
const ctaLinkClass = cn(
  'inline-flex items-center justify-center gap-2 font-medium text-sm',
  'h-8 px-3 rounded-lg',
  'bg-primary text-white transition-colors duration-150',
  'hover:bg-primary-hover',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
)

/* ─── Component ─────────────────────────────────────────────────────────── */

export function Navbar({
  logo,
  links     = defaultLinks,
  ctaHref   = '/auth/signup',
  ctaLabel  = 'Get Started',
  loginHref = '/auth/login',
  className,
}: NavbarProps) {
  const pathname              = usePathname()
  const [open, setOpen]       = useState(false)
  const [scrolled, setScroll] = useState(false)

  useEffect(() => {
    const onScroll = () => setScroll(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-40 transition-all duration-300',
          scrolled
            ? 'bg-background/80 backdrop-blur-md border-b border-border shadow-sm'
            : 'bg-transparent',
          className,
        )}
      >
        <Container>
          <nav
            className="flex items-center justify-between h-16"
            aria-label="Primary navigation"
          >
            {/* Logo */}
            <Link
              href="/"
              aria-label="ScouttOpp home"
              className="flex items-center gap-2 font-bold text-foreground"
            >
              {logo ?? (
                <>
                  <motion.span
                    whileHover={{ rotate: 20, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <Zap size={16} className="text-white" />
                  </motion.span>
                  <span className="text-base tracking-tight">ScouttOpp</span>
                </>
              )}
            </Link>

            {/* Desktop nav links */}
            <ul className="hidden md:flex items-center gap-1" role="list">
              {links.map((link) => {
                const isActive = pathname === link.href
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        isActive
                          ? 'text-foreground bg-white/8'
                          : 'text-muted hover:text-foreground hover:bg-white/5',
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href={loginHref}
                className="text-sm font-medium text-muted hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Log in
              </Link>
              <Link href={ctaHref} className={ctaLinkClass}>
                {ctaLabel}
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="md:hidden p-2 rounded-lg text-muted hover:text-foreground hover:bg-white/8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0,   opacity: 1 }}
                    exit={{ rotate: 90,    opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X size={20} aria-hidden="true" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ rotate: 90,  opacity: 0 }}
                    animate={{ rotate: 0,   opacity: 1 }}
                    exit={{ rotate: -90,   opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu size={20} aria-hidden="true" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </nav>
        </Container>
      </header>

      {/* Mobile slide-down menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="navigation"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0  }}
            exit={{ opacity: 0,  y: -8  }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-x-0 top-16 z-30 md:hidden bg-surface border-b border-border shadow-lg"
          >
            <Container>
              <ul className="flex flex-col py-4 gap-1" role="list">
                {links.map((link) => {
                  const isActive = pathname === link.href
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        aria-current={isActive ? 'page' : undefined}
                        onClick={() => setOpen(false)}
                        className={cn(
                          'block px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150',
                          isActive
                            ? 'text-foreground bg-white/8'
                            : 'text-muted hover:text-foreground hover:bg-white/5',
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>

              <div className="flex flex-col gap-3 py-4 border-t border-border">
                <Link
                  href={loginHref}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  Log in
                </Link>
                <Link href={ctaHref} onClick={() => setOpen(false)} className={cn(ctaLinkClass, 'w-full justify-center h-10')}>
                  {ctaLabel}
                </Link>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
