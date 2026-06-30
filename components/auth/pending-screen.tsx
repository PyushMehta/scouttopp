import { Clock } from 'lucide-react'
import Link from 'next/link'

interface PendingScreenProps {
  email?: string
}

export function PendingScreen({ email }: PendingScreenProps) {
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
            You&apos;re on the list.
          </h1>
          <p className="text-base text-muted leading-relaxed">
            {email ? (
              <>
                We received your application for{' '}
                <span className="font-semibold text-foreground">{email}</span>
                {'. '}
              </>
            ) : (
              'We received your application. '
            )}
            Our team reviews every profile manually. You&apos;ll hear from us within
            1–3 business days.
          </p>
        </div>

        {/* What happens next */}
        <div className="rounded-2xl border border-flax bg-cream/40 p-5 space-y-3">
          <p className="text-sm font-semibold text-charcoal">What happens next</p>
          <ol className="space-y-2 text-sm text-stone list-none">
            {[
              'Our team reviews your profile',
              'You receive an email with your decision',
              'Approved? Your dashboard unlocks instantly',
            ].map((step, i) => (
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
