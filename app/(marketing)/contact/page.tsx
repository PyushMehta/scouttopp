import type { Metadata }    from 'next'
import { Mail, Building2, User, MessageSquare, ArrowRight } from 'lucide-react'
import { TrustedCompanies } from '@/components/marketing/trusted-companies'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the ScouttOpp team — for candidates, employers, or general enquiries.',
}

interface ContactPageProps {
  searchParams: Promise<{ type?: string }>
}

const SUPPORT_EMAIL   = 'support@scouttopp.com'
const EMPLOYERS_EMAIL = 'employers@scouttopp.com'

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const { type } = await searchParams
  const isEmployer = type === 'employer'

  return (
    <div
      className="min-h-screen py-24 lg:py-32"
      data-color-scheme="light"
    >
      <div className="max-w-4xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest border mb-6"
            style={{
              background:   'rgba(43,56,117,0.06)',
              borderColor:  'rgba(43,56,117,0.18)',
              color:        'var(--color-navy)',
            }}
          >
            {isEmployer ? 'Employer Access' : 'Get in touch'}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-charcoal mb-5">
            {isEmployer
              ? 'Request employer access'
              : "Let's talk"}
          </h1>
          <p className="text-lg text-stone leading-relaxed max-w-xl mx-auto">
            {isEmployer
              ? 'Tell us about your company and hiring needs. We review every request and aim to respond within 2 business days.'
              : "Whether you're a candidate, an employer, or just curious — we'd love to hear from you."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left — contact cards */}
          <div className="space-y-4">
            {/* Employer access card */}
            <a
              href={`mailto:${EMPLOYERS_EMAIL}?subject=${encodeURIComponent('Employer Access Request — ScouttOpp')}&body=${encodeURIComponent('Hi ScouttOpp team,\n\nI\'d like to request employer access.\n\nCompany name:\nIndustry:\nTypical roles I hire for:\nWebsite:\n\nTell us more:\n')}`}
              className="flex items-start gap-4 p-5 rounded-2xl border transition-shadow hover:shadow-md group"
              style={{ borderColor: 'var(--color-flax)', background: '#FFFFFF' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'rgba(43,56,117,0.08)' }}
              >
                <Building2 size={18} style={{ color: '#2B3875' }} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-charcoal mb-1">Request employer access</p>
                <p className="text-sm text-stone leading-relaxed">
                  Send us your company details and we&apos;ll review your access request within 2 business days.
                </p>
                <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold" style={{ color: '#2B3875' }}>
                  Email us <ArrowRight size={12} aria-hidden="true" />
                </span>
              </div>
            </a>

            {/* Candidate enquiry */}
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Candidate Enquiry — ScouttOpp')}`}
              className="flex items-start gap-4 p-5 rounded-2xl border transition-shadow hover:shadow-md group"
              style={{ borderColor: 'var(--color-flax)', background: '#FFFFFF' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'rgba(107,95,174,0.08)' }}
              >
                <User size={18} style={{ color: '#6B5FAE' }} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-charcoal mb-1">Candidate support</p>
                <p className="text-sm text-stone leading-relaxed">
                  Questions about your application, profile, or account? We&apos;re here to help.
                </p>
                <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold" style={{ color: '#6B5FAE' }}>
                  Email us <ArrowRight size={12} aria-hidden="true" />
                </span>
              </div>
            </a>

            {/* General */}
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('General Enquiry — ScouttOpp')}`}
              className="flex items-start gap-4 p-5 rounded-2xl border transition-shadow hover:shadow-md group"
              style={{ borderColor: 'var(--color-flax)', background: '#FFFFFF' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'rgba(43,56,117,0.05)' }}
              >
                <MessageSquare size={18} style={{ color: '#8A8070' }} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-charcoal mb-1">General enquiries</p>
                <p className="text-sm text-stone leading-relaxed">
                  Press, partnerships, or anything else — drop us a line.
                </p>
                <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-stone">
                  {SUPPORT_EMAIL}
                </span>
              </div>
            </a>
          </div>

          {/* Right — what to include */}
          <div
            className="rounded-2xl border p-7"
            style={{ borderColor: 'var(--color-flax)', background: 'var(--color-cream)' }}
          >
            <h2 className="text-base font-bold text-charcoal mb-5">
              {isEmployer ? 'What to include in your request' : 'Before you write'}
            </h2>

            {isEmployer ? (
              <ul className="space-y-4">
                {[
                  { label: 'Company name & website',   hint: 'So we can review your company before responding.' },
                  { label: 'Industry & team size',      hint: 'Helps us understand if ScouttOpp is the right fit.' },
                  { label: 'Roles you typically hire',  hint: 'E.g. motion designer, brand designer, UX designer.' },
                  { label: 'Hiring urgency',            hint: 'Immediate, within 3 months, building a pipeline.' },
                  { label: 'Your name & role',          hint: 'Who we\'ll be in touch with.' },
                ].map(({ label, hint }) => (
                  <li key={label} className="flex items-start gap-3">
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                      style={{ background: '#2B3875' }}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-semibold text-charcoal">{label}</p>
                      <p className="text-xs text-stone mt-0.5">{hint}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-4">
                {[
                  { label: 'Response time',            hint: 'We aim to reply within 2 business days.' },
                  { label: 'Support hours',            hint: 'Monday – Friday, 9am – 6pm IST.' },
                  { label: 'Candidate applications',   hint: 'Apply via the candidate form on the home page.' },
                  { label: 'Employer access',          hint: 'Use the "Request employer access" email above.' },
                ].map(({ label, hint }) => (
                  <li key={label} className="flex items-start gap-3">
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                      style={{ background: '#6B5FAE' }}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-semibold text-charcoal">{label}</p>
                      <p className="text-xs text-stone mt-0.5">{hint}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div
              className="mt-7 pt-5 border-t flex items-center gap-3"
              style={{ borderColor: 'var(--color-flax)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(43,56,117,0.08)' }}
              >
                <Mail size={14} style={{ color: '#2B3875' }} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-stone">Email us directly at</p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-sm font-semibold hover:underline"
                  style={{ color: '#2B3875' }}
                >
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </div>
          </div>

        </div>
        <TrustedCompanies />
      </div>
    </div>
  )
}
