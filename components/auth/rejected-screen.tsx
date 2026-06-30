import { XCircle } from 'lucide-react'

export function RejectedScreen() {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-16">
      <div className="w-full max-w-110 space-y-8">

        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(196, 58, 58, 0.08)' }}
          aria-hidden="true"
        >
          <XCircle size={28} strokeWidth={1.5} style={{ color: '#C43A3A' }} />
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Application not approved.
          </h1>
          <p className="text-base text-muted leading-relaxed">
            After careful review, we weren&apos;t able to approve your application
            at this time. We review every applicant individually and take this
            decision seriously.
          </p>
        </div>

        {/* Reasons */}
        <div className="rounded-2xl border border-flax bg-cream/40 p-5 space-y-3">
          <p className="text-sm font-semibold text-charcoal">
            This can happen for a few reasons:
          </p>
          <ul className="space-y-2.5 text-sm text-muted" aria-label="Possible rejection reasons">
            {[
              'Your portfolio or experience didn’t meet our current requirements',
              'The information provided was incomplete or could not be verified',
              'We’ve reached capacity in your speciality for this period',
              'Your application may not have matched an active hiring need',
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
            href="mailto:support@scouttopp.com?subject=Application%20Review%20Request"
            className={[
              'flex items-center justify-center w-full h-12 px-6',
              'rounded-xl border-2 border-navy text-navy text-sm font-semibold',
              'transition-colors duration-150 hover:bg-navy/5',
            ].join(' ')}
          >
            Contact our team
          </a>
          <p className="text-xs text-center text-muted">
            We&apos;re happy to provide feedback on your application.
          </p>
        </div>

      </div>
    </div>
  )
}
