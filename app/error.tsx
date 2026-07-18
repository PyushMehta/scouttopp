'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[app/error]', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-sm opacity-60 max-w-sm">
        An unexpected error occurred. Please try again or contact support if the problem persists.
      </p>
      <button
        onClick={reset}
        className="rounded-full px-5 py-2 text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
