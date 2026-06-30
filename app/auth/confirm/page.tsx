import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Confirming…',
  description: 'Completing your email verification.',
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function ConfirmPage({ searchParams }: Props) {
  const params = await searchParams
  const code   = typeof params?.code === 'string' ? params.code : undefined
  const type   = typeof params?.type === 'string' ? params.type : undefined

  const qs = new URLSearchParams()
  if (code) qs.set('code', code)
  if (type) qs.set('type', type)

  const queryString = qs.toString()
  redirect(`/api/auth/callback${queryString ? `?${queryString}` : ''}`)
}
