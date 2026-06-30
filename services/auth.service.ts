import { createClient } from '@/lib/supabase/server'
import { APP_URL, ROUTES } from '@/constants'

/**
 * Server-side auth operations. Called from API route handlers only —
 * never from Client Components.
 */

/** Sign in with email + password. Returns the user or throws. */
export async function signInWithPassword(email: string, password: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}

/** Sign up with email + password. Supabase sends a confirmation email. */
export async function signUpWithPassword(
  email: string,
  password: string,
  inviteCodeId?: string,
) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${APP_URL}${ROUTES.api.authCallback}`,
      data: inviteCodeId ? { invite_code_id: inviteCodeId } : undefined,
    },
  })
  if (error) throw error
  return data.user
}

/** Trigger OAuth sign-in. Returns the provider URL to redirect to. */
export async function getOAuthUrl(provider: 'google') {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${APP_URL}${ROUTES.api.authCallback}` },
  })
  if (error) throw error
  return data.url
}

/** Send a password reset email. */
export async function sendPasswordReset(email: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${APP_URL}${ROUTES.api.authCallback}?type=recovery`,
  })
  if (error) throw error
}

/** Update the current user's password (requires active recovery session). */
export async function updatePassword(password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw error
}

/** Resend email confirmation. */
export async function resendConfirmation(email: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.resend({ type: 'signup', email })
  if (error) throw error
}

/** Sign out and clear session. */
export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
