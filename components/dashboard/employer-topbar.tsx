'use client'

import { useState }            from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X }             from 'lucide-react'
import { EmployerNavContent }  from './employer-sidebar'
import { ThemeToggle }         from '@/components/ui/theme-toggle'

export function EmployerTopBar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile header bar */}
      <header className="lg:hidden flex items-center justify-between h-14 px-4 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold tracking-tight text-foreground">ScouttOpp</span>
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
            style={{ background: 'rgba(43,56,117,0.15)', color: '#6B5FAE' }}
          >
            Employer
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle size={16} />
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={open}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
          >
            <Menu size={18} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Mobile slide-in nav */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="absolute top-0 left-0 h-full w-60 bg-surface border-r border-border flex flex-col"
            >
              {/* Logo row */}
              <div className="flex items-center justify-between h-16 px-5 border-b border-border shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold tracking-tight text-foreground">ScouttOpp</span>
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                    style={{ background: 'rgba(43,56,117,0.15)', color: '#6B5FAE' }}
                  >
                    Employer
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation menu"
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>

              {/* Nav links */}
              <EmployerNavContent onNavigate={() => setOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
