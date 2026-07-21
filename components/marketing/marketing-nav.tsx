'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fadeDownVariants, transitions } from '@/lib/tokens'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Contact', href: '/contact' },
]

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const drawerRef = useRef<HTMLDivElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Focus trap + Escape key for mobile drawer
  useEffect(() => {
    if (!mobileOpen) return

    const drawer = drawerRef.current
    if (!drawer) return

    // Focus first focusable element when drawer opens
    const focusables = drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    first?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileOpen(false)
        hamburgerRef.current?.focus()
        return
      }
      if (e.key !== 'Tab') return
      if (focusables.length === 0) { e.preventDefault(); return }
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return (
    <>
      <motion.header
        variants={fadeDownVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-200',
          scrolled ? 'border-b' : 'border-b border-transparent',
        )}
        style={
          scrolled
            ? {
                background: 'var(--color-surface)',
                backdropFilter: 'blur(20px) saturate(180%)',
                borderColor: 'var(--color-border)',
                opacity: 0.95,
              }
            : { background: 'transparent' }
        }
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="hover:opacity-80 transition-opacity" aria-label="ScouttOpp home">
              <Image src="/scoutt.png" alt="ScouttOpp" height={36} width={120} className="h-9 w-auto" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors duration-150',
                    pathname === link.href ? 'text-foreground' : 'text-muted hover:text-foreground',
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="/auth/login"
                className="text-sm font-medium text-muted hover:text-foreground transition-colors duration-150 px-3 py-2"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup?role=candidate"
                className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
              >
                Apply →
              </Link>
            </div>

            {/* Mobile: theme toggle + hamburger */}
            <div className="lg:hidden flex items-center gap-1">
              <ThemeToggle />
            <button
              ref={hamburgerRef}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-muted hover:text-foreground transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            ref={drawerRef}
            key="mobile-menu"
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={transitions.normal}
            className="fixed inset-0 z-40 lg:hidden flex flex-col"
            style={{
              background: 'rgba(10, 10, 10, 0.97)',
              backdropFilter: 'blur(20px)',
              paddingTop: '80px',
            }}
          >
            <nav className="flex flex-col px-6 gap-2 pt-6" aria-label="Mobile navigation">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...transitions.normal, delay: i * 0.06 }}
                >
                  <Link
                    href={link.href}
                    onClick={closeMobile}
                    className={cn(
                      'block text-2xl font-bold py-3 transition-colors duration-150',
                      pathname === link.href ? 'text-foreground' : 'text-muted hover:text-foreground',
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="flex flex-col px-6 gap-3 mt-8">
              <Link
                href="/auth/signup?role=candidate"
                onClick={closeMobile}
                className="flex items-center justify-center h-14 rounded-2xl text-base font-semibold text-white transition-all duration-200 active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
              >
                Apply as a creative →
              </Link>
              <Link
                href="/auth/login"
                onClick={closeMobile}
                className="flex items-center justify-center h-14 rounded-2xl border border-border text-base font-medium text-muted hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
