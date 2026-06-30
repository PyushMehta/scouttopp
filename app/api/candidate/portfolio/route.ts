import { NextResponse, type NextRequest } from 'next/server'
import { requireCandidate }              from '@/lib/auth/require-candidate'
import { createServiceClient }           from '@/lib/supabase/server'
import { z }                             from 'zod'
import { MAX_PORTFOLIO_ITEMS }           from '@/constants'

const MEDIA_TYPES = ['image', 'video', 'link', 'pdf'] as const

const createSchema = z.object({
  title:         z.string().min(1).max(120),
  description:   z.string().max(500).optional(),
  media_url:     z.string().url(),
  media_type:    z.enum(MEDIA_TYPES),
  thumbnail_url: z.string().url().nullable().optional(),
})

export async function GET() {
  const auth = await requireCandidate()
  if (!auth.ok) return auth.response

  const service = createServiceClient()
  const { data, error } = await service
    .from('candidate_portfolio_items')
    .select('*')
    .eq('candidate_id', auth.candidateProfileId)
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}

export async function POST(req: NextRequest) {
  const auth = await requireCandidate()
  if (!auth.ok) return auth.response

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid JSON.' } }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid fields.', details: parsed.error.flatten() },
    }, { status: 422 })
  }

  const service = createServiceClient()

  const { count } = await service
    .from('candidate_portfolio_items')
    .select('id', { count: 'exact', head: true })
    .eq('candidate_id', auth.candidateProfileId)

  if ((count ?? 0) >= MAX_PORTFOLIO_ITEMS) {
    return NextResponse.json({
      success: false,
      error: { code: 'LIMIT_REACHED', message: `You can add up to ${MAX_PORTFOLIO_ITEMS} portfolio items.` },
    }, { status: 422 })
  }

  const d = parsed.data
  const { data, error } = await service
    .from('candidate_portfolio_items')
    .insert({
      candidate_id:  auth.candidateProfileId,
      title:         d.title,
      description:   d.description ?? null,
      media_url:     d.media_url,
      media_type:    d.media_type,
      thumbnail_url: d.thumbnail_url ?? null,
      sort_order:    count ?? 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
