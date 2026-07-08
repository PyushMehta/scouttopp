'use client'

import { motion }       from 'framer-motion'
import { X, RotateCcw } from 'lucide-react'

interface ScoutActionsProps {
  onPass:   () => void
  onScout:  () => void
  onUndo:   () => void
  canUndo:  boolean
  disabled?: boolean
}

export function ScoutActions({ onPass, onScout, onUndo, canUndo, disabled }: ScoutActionsProps) {
  return (
    <div className="flex items-center justify-center gap-6 py-4" role="group" aria-label="Scout actions">
      {/* Pass */}
      <motion.button
        type="button"
        disabled={disabled}
        onClick={onPass}
        whileTap={{ scale: 0.88 }}
        className="w-[62px] h-[62px] rounded-full border-2 border-border flex items-center justify-center bg-card text-muted hover:border-destructive/50 hover:text-destructive transition-colors disabled:opacity-30 disabled:pointer-events-none shadow-sm"
        aria-label="Pass on this candidate"
      >
        <X size={28} strokeWidth={2.5} aria-hidden="true" />
      </motion.button>

      {/* Undo */}
      <motion.button
        type="button"
        disabled={!canUndo || disabled}
        onClick={onUndo}
        whileTap={{ scale: 0.88 }}
        animate={{ opacity: canUndo ? 1 : 0.25 }}
        transition={{ duration: 0.2 }}
        className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-card text-muted/70 hover:text-foreground hover:border-border/80 transition-colors disabled:cursor-not-allowed shadow-sm"
        aria-label="Undo last action"
      >
        <RotateCcw size={16} aria-hidden="true" />
      </motion.button>

      {/* Scout */}
      <motion.button
        type="button"
        disabled={disabled}
        onClick={onScout}
        whileTap={{ scale: 0.88 }}
        className="w-[62px] h-[62px] rounded-full flex items-center justify-center text-white shadow-lg shadow-secondary/25 disabled:opacity-30 disabled:pointer-events-none hover:shadow-secondary/40 transition-shadow"
        style={{ background: 'linear-gradient(135deg, #2B3875 0%, #6B5FAE 100%)' }}
        aria-label="Scout this candidate"
      >
        {/* Star / Scout icon */}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01z" />
        </svg>
      </motion.button>
    </div>
  )
}
