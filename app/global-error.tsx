'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[app/global-error]', error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Something went wrong</h2>
          <p style={{ fontSize: '0.875rem', opacity: 0.6, maxWidth: '24rem' }}>
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </p>
          <button
            onClick={reset}
            style={{ borderRadius: '9999px', padding: '0.5rem 1.25rem', fontSize: '0.875rem', fontWeight: 500, background: '#7c3aed', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
