'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import { useEffect } from 'react'

function PostHogInit() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!key) return

    posthog.init(key, {
      api_host:         process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
      ui_host:          'https://us.posthog.com',
      person_profiles:  'identified_only',
      capture_pageview: false,  // handled by PostHogPageView
      capture_pageleave: true,
      autocapture:      false,  // we fire explicit events; avoids capturing PII from DOM text
    })
  }, [])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <PostHogInit />
      {children}
    </PHProvider>
  )
}

export { usePostHog }
