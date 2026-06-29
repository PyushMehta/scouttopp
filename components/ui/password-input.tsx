'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { Input, type InputProps } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type PasswordInputProps = Omit<InputProps, 'type' | 'rightIcon'>

export function PasswordInput({ className, autoComplete = 'current-password', ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  const toggle = () => setVisible((v) => !v)

  const toggleButton = (
    <button
      type="button"
      onClick={toggle}
      tabIndex={-1}
      aria-label={visible ? 'Hide password' : 'Show password'}
      className="pointer-events-auto text-muted hover:text-foreground transition-colors focus-visible:outline-none"
    >
      <AnimatePresence mode="wait" initial={false}>
        {visible ? (
          <motion.span
            key="off"
            initial={{ opacity: 0, rotate: -10 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 10 }}
            transition={{ duration: 0.15 }}
          >
            <EyeOff size={16} aria-hidden="true" />
          </motion.span>
        ) : (
          <motion.span
            key="on"
            initial={{ opacity: 0, rotate: 10 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: -10 }}
            transition={{ duration: 0.15 }}
          >
            <Eye size={16} aria-hidden="true" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )

  return (
    <Input
      type={visible ? 'text' : 'password'}
      rightIcon={toggleButton}
      autoComplete={autoComplete}
      className={cn('pr-10', className)}
      {...props}
    />
  )
}
