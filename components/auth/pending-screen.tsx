import { Clock, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface PendingScreenProps {
  email?:        string
  role?:         string
  hasFilledForm: boolean
  formUrl?:      string
}

export function PendingScreen({ email, role, hasFilledForm, formUrl }: PendingScreenProps) {
  const isEmployer = role === 'employer'

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-16">
      <div className="w-full max-w-110 space-y-8">

        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(107, 95, 174, 0.1)' }}
          aria-hidden="true"
        >
          <Clock size={28} strokeWidth={1.5} style={{ color: '#6B5FAE' }} />
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            {isEmployer ? 'Request under review.' : hasFilledForm ? "You're on the list." : 'One more step.'}
          </h1>
          <p className="text-base text-muted leading-relaxed">
            {isEmployer ? (
              <>
                {email && (
                  <>
                    We received your employer access request for{' '}
                    <span className="font-semibold text-foreground">{email}</span>
                    {'. '}
                  </>
                )}
                Our team reviews every employer account manually. You&apos;ll hear from us
                within 1–2 business days.
              </>
            ) : hasFilledForm ? (
              <>
                {email && (
                  <>
                    We received your application for{' '}
                    <span className="font-semibold text-foreground">{email}</span>
                    {'. '}
                  </>
                )}
                Our team reviews every profile manually. You&apos;ll hear from us within
                1–3 business days.
              </>
            ) : (
              <>
                Your account is set up
                {email && (
                  <> for <span className="font-semibold text-foreground">{email}</span></>
                )}
                {'. '}
                To complete your application, fill in our short Google Form — it&apos;s how
                our team reviews candidates.
              </>
            )}
          </p>
        </div>

        {/* Google Form CTA — candidates only */}
        {!isEmployer && !hasFilledForm && (
          <div
            className="rounded-2xl border p-5 space-y-4"
            style={{ borderColor: 'rgba(107, 95, 174, 0.3)', background: 'rgba(107, 95, 174, 0.04)' }}
          >
            <p className="text-sm font-semibold text-foreground">Fill in the application form</p>
            <p className="text-sm text-muted">
              Takes about 3–5 minutes. Helps our team understand your background and
              creative work before they review your profile.
            </p>
            {formUrl ? (
              <a
                href={formUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: '#2B3875', color: '#ffffff' }}
              >
                Open application form
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            ) : (
              <p className="text-xs text-muted italic">
                Application form link not configured. Contact{' '}
                <a href="mailto:support@scouttopp.com" className="underline">
                  support@scouttopp.com
                </a>.
              </p>
            )}
            <p className="text-xs text-muted">
              After submitting, refresh this page — it detects your submission automatically.
            </p>
          </div>
        )}

        {/* What happens next */}
        <div className="rounded-2xl border border-flax bg-cream/40 p-5 space-y-3">
          <p className="text-sm font-semibold text-charcoal">What happens next</p>
          <ol className="space-y-2 text-sm text-stone list-none">
            {(isEmployer
              ? [
                  'Our team reviews your company details',
                  'You receive a login link by email within 1–2 business days',
                  'Approved? Your employer dashboard unlocks instantly',
                ]
              : hasFilledForm
              ? [
                  'Our team reviews your profile',
                  'You receive an email with your decision',
                  'Approved? Your dashboard unlocks instantly',
                ]
              : [
                  'Fill in the application form above',
                  'Our team reviews your submission',
                  'Approved? You get an invite email to your dashboard',
                ]
            ).map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mt-0.5"
                  style={{ background: 'rgba(107, 95, 174, 0.12)', color: '#6B5FAE' }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Sign out link */}
        <p className="text-sm text-center text-muted">
          Not the right account?{' '}
          <Link
            href="/auth/login"
            className="font-semibold transition-colors duration-150 hover:underline"
            style={{ color: '#2B3875' }}
          >
            Sign in with a different account
          </Link>
        </p>

      </div>
    </div>
  )
}
