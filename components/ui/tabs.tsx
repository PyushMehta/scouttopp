'use client'

import { useState, useCallback, type ReactNode, type KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

/* ─── Types ─────────────────────────────────────────────────────────────── */

export interface TabItem {
  id: string
  label: ReactNode
  content: ReactNode
  disabled?: boolean
  badge?: ReactNode
}

type TabsVariant     = 'underline' | 'pill' | 'bordered'
type TabsOrientation = 'horizontal' | 'vertical'

export interface TabsProps {
  items: TabItem[]
  defaultTab?: string
  activeTab?: string
  onChange?: (id: string) => void
  variant?: TabsVariant
  orientation?: TabsOrientation
  className?: string
  listClassName?: string
  panelClassName?: string
}

/* ─── Variant styles ─────────────────────────────────────────────────────── */

const listVariantClasses: Record<TabsVariant, string> = {
  underline: 'border-b border-border gap-0',
  pill:      'bg-surface rounded-xl p-1 gap-1',
  bordered:  'border border-border rounded-xl p-1 gap-1',
}

const triggerBase =
  'relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg select-none cursor-pointer'

const triggerVariantClasses: Record<TabsVariant, { active: string; inactive: string }> = {
  underline: {
    active:   'text-foreground',
    inactive: 'text-muted hover:text-foreground rounded-t-lg',
  },
  pill: {
    active:   'text-foreground',
    inactive: 'text-muted hover:text-foreground',
  },
  bordered: {
    active:   'text-foreground',
    inactive: 'text-muted hover:text-foreground',
  },
}

const indicatorVariantClasses: Record<TabsVariant, string> = {
  underline: 'absolute -bottom-px left-0 right-0 h-0.5 bg-primary rounded-full',
  pill:      'absolute inset-0 bg-card rounded-[10px] shadow-sm',
  bordered:  'absolute inset-0 bg-primary/10 border border-primary/30 rounded-[10px]',
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function Tabs({
  items,
  defaultTab,
  activeTab: controlledTab,
  onChange,
  variant      = 'underline',
  orientation  = 'horizontal',
  className,
  listClassName,
  panelClassName,
}: TabsProps) {
  const firstEnabled = items.find((t) => !t.disabled)?.id ?? items[0]?.id
  const [internal, setInternal] = useState(defaultTab ?? firstEnabled)

  const active = controlledTab ?? internal

  const handleChange = useCallback(
    (id: string) => {
      setInternal(id)
      onChange?.(id)
    },
    [onChange],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const enabled = items.filter((t) => !t.disabled)
      const currentIndex = enabled.findIndex((t) => t.id === active)
      const isHorizontal = orientation === 'horizontal'

      let nextIndex: number | null = null

      if ((isHorizontal && e.key === 'ArrowRight') || (!isHorizontal && e.key === 'ArrowDown')) {
        nextIndex = (currentIndex + 1) % enabled.length
      } else if ((isHorizontal && e.key === 'ArrowLeft') || (!isHorizontal && e.key === 'ArrowUp')) {
        nextIndex = (currentIndex - 1 + enabled.length) % enabled.length
      } else if (e.key === 'Home') {
        nextIndex = 0
      } else if (e.key === 'End') {
        nextIndex = enabled.length - 1
      }

      if (nextIndex !== null) {
        e.preventDefault()
        const next = enabled[nextIndex]
        handleChange(next.id)
        document.getElementById(`tab-${next.id}`)?.focus()
      }
    },
    [active, items, orientation, handleChange],
  )

  const activePanel = items.find((t) => t.id === active)

  return (
    <div
      className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-row gap-4' : 'flex-col gap-4',
        className,
      )}
    >
      {/* Tab list */}
      <div
        role="tablist"
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex',
          orientation === 'vertical' ? 'flex-col' : 'flex-row items-center',
          listVariantClasses[variant],
          listClassName,
        )}
      >
        {items.map((item) => {
          const isActive = item.id === active
          const classes  = triggerVariantClasses[variant]

          return (
            <button
              key={item.id}
              role="tab"
              type="button"
              id={`tab-${item.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${item.id}`}
              aria-disabled={item.disabled}
              disabled={item.disabled}
              tabIndex={isActive ? 0 : -1}
              onClick={() => !item.disabled && handleChange(item.id)}
              className={cn(
                triggerBase,
                isActive ? classes.active : classes.inactive,
                item.disabled && 'opacity-40 cursor-not-allowed',
              )}
            >
              {/* Background/underline indicator */}
              {isActive && (
                <motion.span
                  layoutId={`tab-indicator-${variant}`}
                  aria-hidden="true"
                  className={indicatorVariantClasses[variant]}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {item.label}
                {item.badge && (
                  <span className="z-10">{item.badge}</span>
                )}
              </span>
            </button>
          )
        })}
      </div>

      {/* Tab panel */}
      <div className={cn('flex-1 min-w-0', panelClassName)}>
        <AnimatePresence mode="wait">
          {activePanel && (
            <motion.div
              key={active}
              role="tabpanel"
              id={`panel-${active}`}
              aria-labelledby={`tab-${active}`}
              tabIndex={0}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="focus-visible:outline-none"
            >
              {activePanel.content}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
