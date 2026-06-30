import { AlertTriangle } from 'lucide-react'

export function SuspendedScreen() {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-16">
      <div className="w-full max-w-110 space-y-8">

        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(196, 124, 26, 0.08)' }}
          aria-hidden="true"
        >
          <AlertTriangle size={28} strokeWidth={1.5} style={{ color: '#C47C1A' }} />
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Account suspended.
          </h1>
          <p className="text-base text-muted leading-relaxed">
            Your account has been temporarily suspended. You won&apos;t be able
            to access ScouttOpp until this is resolved.
          </p>
        </div>

        {/* Reasons */}
        <div
          className="rounded-2xl border p-5 space-y-3"
          style={{
            borderColor: 'rgba(196, 124, 26, 0.25)',
            background:  'rgba(196, 124, 26, 0.04)',
          }}
        >
          <p className="text-sm font-semibold text-charcoal">
            This may be due to:
          </p>
          <ul className="space-y-2.5 text-sm text-muted" aria-label="Possible suspension reasons">
            {[
              'A concern or report raised by another member',
              'Activity that may have violated our community guidelines',
              'An outstanding verification or billing issue',
            ].map((reason) => (
              <li key={reason} className="flex items-start gap-2.5">
                <span
                  className="mt-2 w-1 h-1 rounded-full bg-stone shrink-0"
                  aria-hidden="true"
                />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <a
            href="mailto:support@scouttopp.com?subject=Account%20Suspension%20Inquiry"
            className={[
              'flex items-center justify-center w-full h-12 px-6',
              'rounded-xl text-white text-sm font-semibold',
              'transition-opacity duration-150 hover:opacity-90',
            ].join(' ')}
            style={{ background: '#C47C1A' }}
          >
            Contact support
          </a>
          <p className="text-xs text-center text-muted">
            If you believe this is an error, our team will review your account
            within 2–3 business days.
          </p>
        </div>

      </div>
    </div>
  )
}
