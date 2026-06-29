'use client'

import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { Input, type InputProps } from '@/components/ui/input'

type SearchInputProps = Omit<InputProps, 'leftIcon' | 'rightIcon' | 'type'> & {
  onClear?: () => void
  value?: string
}

export function SearchInput({ onClear, value, onChange, className, ...props }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const hasValue = Boolean(value && String(value).length > 0)

  const handleClear = () => {
    onClear?.()
    inputRef.current?.focus()
  }

  const clearButton = (
    <AnimatePresence>
      {hasValue && (
        <motion.button
          key="clear"
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className="pointer-events-auto text-muted hover:text-foreground transition-colors focus-visible:outline-none rounded-sm"
        >
          <X size={14} aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  )

  return (
    <Input
      ref={inputRef}
      type="search"
      leftIcon={<Search size={16} />}
      rightIcon={clearButton}
      value={value}
      onChange={onChange}
      className={className}
      {...props}
    />
  )
}
