'use client'

import { useState } from 'react'
import { ExternalLink, CheckCircle2 } from 'lucide-react'

interface Props {
  formUrl: string
  email:   string
}

export function FormCta({ formUrl, email }: Props) {
  const storageKey = `scouttopp_form_opened_${email}`
  const [submitted, setSubmitted] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem(storageKey) === '1',
  )

  const handleClick = () => {
    localStorage.setItem(storageKey, '1')
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div
        className="rounded-2xl border p-5 space-y-2"
        style={{ borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.04)' }}
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} style={{ color: '#10B981' }} aria-hidden="true" />
          <p className="text-sm font-semibold text-foreground">Application submitted</p>
        </div>
        <p className="text-sm text-muted">
          Our team will review your submission and email you within 1–3 business days.
        </p>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl border p-5 space-y-4"
      style={{ borderColor: 'rgba(107, 95, 174, 0.3)', background: 'rgba(107, 95, 174, 0.04)' }}
    >
      <p className="text-sm font-semibold text-foreground">Fill in the application form</p>
      <p className="text-sm text-muted">
        Takes about 3–5 minutes. Helps our team understand your background and creative
        work before they review your profile.
      </p>
      <a
        href={formUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ background: '#2B3875', color: '#ffffff' }}
      >
        Open application form
        <ExternalLink size={14} aria-hidden="true" />
      </a>
    </div>
  )
}
