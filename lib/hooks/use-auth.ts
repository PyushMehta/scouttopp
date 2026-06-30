'use client'

import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

interface AuthState {
  user:    User | null
  profile: Profile | null
  loading: boolean
}

/**
 * Client-side hook that subscribes to Supabase Auth state changes
 * and returns the current user + profile row.
 *
 * Uses a single browser-side Supabase client (singleton).
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user:    null,
    profile: null,
    loading: true,
  })

  useEffect(() => {
    const supabase = createClient()

    // Fetch profile given a user
    async function fetchProfile(user: User) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      return data
    }

    // Initial session
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setState({ user: null, profile: null, loading: false })
        return
      }
      const profile = await fetchProfile(user)
      setState({ user, profile, loading: false })
    })

    // Subscribe to auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session?.user) {
          setState({ user: null, profile: null, loading: false })
          return
        }
        const profile = await fetchProfile(session.user)
        setState({ user: session.user, profile, loading: false })
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  return state
}

/**
 * Sign out the current user.
 * Call from Client Components — creates its own ephemeral client.
 */
export async function signOutClient(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
}
