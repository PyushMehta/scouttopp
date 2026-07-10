import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Lightweight keep-alive endpoint — called by Netlify scheduled function
// to prevent Supabase free-tier project from pausing after 7 days inactivity.
export async function GET(request: Request) {
  const auth = request.headers.get('x-ping-secret')
  if (auth !== process.env.PING_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from('candidate_profiles').select('id').limit(1)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, timestamp: new Date().toISOString() })
}
