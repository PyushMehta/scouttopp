import { type ReactNode } from 'react'
import { BrandPanel } from '@/components/auth/brand-panel'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex">

      {/* ── Left: Brand panel ── */}
      <aside
        className="hidden lg:flex lg:w-[42%] xl:w-[40%] shrink-0 flex-col"
        style={{ background: '#2B3875' }}
        aria-label="ScouttOpp — welcome"
      >
        <BrandPanel />
      </aside>

      {/* ── Right: Form panel ── */}
      <main
        className="flex-1 flex flex-col overflow-y-auto"
        style={{ background: '#FDFAF6' }}
        data-color-scheme="light"
        id="auth-form-panel"
      >
        {/* Mobile-only logo */}
        <div className="lg:hidden flex items-center gap-2.5 px-6 py-5 border-b border-flax">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: '#2B3875' }}
            aria-hidden="true"
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M13 4.5C13 3.12 11.88 2 10.5 2h-3A3.5 3.5 0 0 0 4 5.5c0 1.38.79 2.58 2 3.14L12 11a2 2 0 0 1 1 1.76A2.24 2.24 0 0 1 10.76 15H7.5A2.5 2.5 0 0 1 5 12.5"
                stroke="white"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="font-bold text-charcoal text-base tracking-tight">ScouttOpp</span>
        </div>

        {/* Form content — each auth page provides its own centred container */}
        {children}
      </main>

    </div>
  )
}
