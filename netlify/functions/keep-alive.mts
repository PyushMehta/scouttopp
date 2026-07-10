import type { Config } from '@netlify/functions'

export default async function handler() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://scoutopptest.netlify.app'
  const secret  = process.env.PING_SECRET ?? ''

  const res = await fetch(`${baseUrl}/api/ping`, {
    headers: { 'x-ping-secret': secret },
  })

  const body = await res.json()
  console.log('[keep-alive]', body)
  return { statusCode: res.ok ? 200 : 500 }
}

export const config: Config = {
  schedule: '@weekly', // runs every 7 days — well within the 7-day pause window
}
