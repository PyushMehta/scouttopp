'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default to dark for SSR — the inline script in <head> sets the correct
  // data-theme on <html> before React hydrates, so there is no visual flash.
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    // Sync React state with whatever the anti-flash script set on <html>
    const current = document.documentElement.getAttribute('data-theme') as Theme | null
    if (current === 'light' || current === 'dark') setTheme(current)

    // Keep in sync if the OS preference changes and no explicit user choice was saved
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onOsChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        const next: Theme = e.matches ? 'dark' : 'light'
        document.documentElement.setAttribute('data-theme', next)
        setTheme(next)
      }
    }
    mq.addEventListener('change', onOsChange)
    return () => mq.removeEventListener('change', onOsChange)
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
    setTheme(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
