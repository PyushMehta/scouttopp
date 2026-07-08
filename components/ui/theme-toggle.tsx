'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
  size?: number
}

export function ThemeToggle({ className, size = 16 }: ThemeToggleProps) {
  const { theme, toggle } = useTheme()

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-150',
        'text-muted hover:text-foreground hover:bg-foreground/8',
        className,
      )}
    >
      {theme === 'dark' ? (
        <Sun size={size} aria-hidden="true" />
      ) : (
        <Moon size={size} aria-hidden="true" />
      )}
    </button>
  )
}
