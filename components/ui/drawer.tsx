'use client'

import {
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, type TargetAndTransition } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { overlayVariants } from '@/lib/tokens'

type DrawerSide = 'left' | 'right' | 'bottom'

export interface DrawerProps {
  open: boolean
  onClose: () => void
  side?: DrawerSide
  title?: string
  description?: string
  closable?: boolean
  children: ReactNode
  footer?: ReactNode
  className?: string
}

const sideHidden: Record<DrawerSide, TargetAndTransition> = {
  right:  { x: '100%', opacity: 0 },
  left:   { x: '-100%', opacity: 0 },
  bottom: { y: '100%', opacity: 0 },
}

const sideVisible: Record<DrawerSide, TargetAndTransition> = {
  right:  { x: 0, opacity: 1 },
  left:   { x: 0, opacity: 1 },
  bottom: { y: 0, opacity: 1 },
}

const sidePanelClass: Record<DrawerSide, string> = {
  right:  'top-0 right-0 h-full w-full max-w-sm border-l',
  left:   'top-0 left-0  h-full w-full max-w-sm border-r',
  bottom: 'bottom-0 left-0 right-0 w-full rounded-t-2xl border-t max-h-[85dvh]',
}

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function Drawer({
  open,
  onClose,
  side = 'right',
  title,
  description,
  closable = true,
  children,
  footer,
  className,
}: DrawerProps) {
  const panelRef   = useRef<HTMLDivElement>(null)
  const previousEl = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    previousEl.current = document.activeElement as HTMLElement
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      previousEl.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)
      first?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [open])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape' && closable) onClose()
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
        )
        if (!focusable.length) return
        const first = focusable[0]
        const last  = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus() }
        } else {
          if (document.activeElement === last)  { e.preventDefault(); first.focus() }
        }
      }
    },
    [closable, onClose],
  )

  if (typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onKeyDown={handleKeyDown}
          className="fixed inset-0 z-50"
        >
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closable ? onClose : undefined}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            ref={panelRef}
            initial={sideHidden[side]}
            animate={sideVisible[side]}
            exit={sideHidden[side]}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className={cn(
              'absolute bg-card border-border flex flex-col shadow-xl',
              sidePanelClass[side],
              className,
            )}
          >
            {/* Drag handle — bottom drawer only */}
            {side === 'bottom' && (
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 bg-border rounded-full" aria-hidden="true" />
              </div>
            )}

            {/* Header */}
            {(title || closable) && (
              <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-border shrink-0">
                <div className="flex flex-col gap-1">
                  {title && (
                    <h2 className="text-base font-semibold text-foreground">{title}</h2>
                  )}
                  {description && (
                    <p className="text-sm text-muted">{description}</p>
                  )}
                </div>
                {closable && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close drawer"
                    className="shrink-0 -mt-1 -mr-2 p-2 rounded-lg text-muted hover:text-foreground hover:bg-white/8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-4 border-t border-border shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
