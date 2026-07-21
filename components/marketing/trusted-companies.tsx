'use client'

import { useState } from 'react'
import { ChevronDown, ExternalLink, X } from 'lucide-react'
import { TRUSTED_COMPANIES, type Company } from '@/constants/companies'

export function TrustedCompanies() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Company | null>(null)

  return (
    <div className="mt-10">
      {/* Accordion header */}
      <button
        type="button"
        onClick={() => { setOpen(v => !v); setSelected(null) }}
        className="w-full flex items-center justify-between rounded-2xl px-6 py-4 border transition-colors duration-150 text-left group"
        style={{
          background: open ? 'rgba(43,56,117,0.04)' : 'var(--color-card)',
          borderColor: open ? 'rgba(43,56,117,0.25)' : 'var(--color-flax)',
        }}
        aria-expanded={open}
      >
        <div>
          <p className="text-sm font-bold text-charcoal">Companies that trust ScouttOpp</p>
          <p className="text-xs text-stone mt-0.5">
            {open ? 'Click a company to see details' : `${TRUSTED_COMPANIES.length} verified companies`}
          </p>
        </div>
        <ChevronDown
          size={18}
          className="shrink-0 transition-transform duration-200"
          style={{
            color: '#2B3875',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
          aria-hidden="true"
        />
      </button>

      {/* Company grid */}
      {open && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TRUSTED_COMPANIES.map((company) => {
            const isSelected = selected?.id === company.id
            return (
              <button
                key={company.id}
                type="button"
                onClick={() => setSelected(isSelected ? null : company)}
                className="flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-150"
                style={{
                  background: isSelected ? 'rgba(43,56,117,0.05)' : 'var(--color-card)',
                  borderColor: isSelected ? 'rgba(43,56,117,0.3)' : 'var(--color-flax)',
                  boxShadow: isSelected ? '0 0 0 1px rgba(43,56,117,0.2)' : 'none',
                }}
              >
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold text-white"
                  style={{ background: company.color }}
                >
                  {company.initials}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-charcoal truncate">{company.name}</p>
                  <p className="text-xs text-stone truncate">{company.industry}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Detail panel */}
      {open && selected && (
        <div
          className="mt-3 rounded-2xl border p-6 relative"
          style={{ background: 'var(--color-cream)', borderColor: 'rgba(43,56,117,0.18)' }}
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(43,56,117,0.08)', color: '#2B3875' }}
            aria-label="Close"
          >
            <X size={14} aria-hidden="true" />
          </button>

          <div className="flex items-center gap-4 mb-5">
            <span
              className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ background: selected.color }}
            >
              {selected.initials}
            </span>
            <div>
              <p className="text-base font-bold text-charcoal">{selected.name}</p>
              <p className="text-sm text-stone">{selected.industry}</p>
            </div>
          </div>

          <dl className="space-y-3">
            <div className="flex gap-3">
              <dt className="text-xs font-semibold uppercase tracking-widest text-stone w-24 shrink-0 pt-0.5">Size</dt>
              <dd className="text-sm text-charcoal">{selected.size}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-xs font-semibold uppercase tracking-widest text-stone w-24 shrink-0 pt-0.5">Uses us for</dt>
              <dd className="text-sm text-charcoal">{selected.useCase}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-xs font-semibold uppercase tracking-widest text-stone w-24 shrink-0 pt-0.5">Website</dt>
              <dd>
                <a
                  href={selected.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold inline-flex items-center gap-1 hover:underline"
                  style={{ color: '#2B3875' }}
                >
                  {selected.website.replace('https://', '')}
                  <ExternalLink size={12} aria-hidden="true" />
                </a>
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  )
}
