import { NextResponse, type NextRequest } from 'next/server'
import { requireCandidate }              from '@/lib/auth/require-candidate'
import { createServiceClient }           from '@/lib/supabase/server'
import { z }                             from 'zod'

const MEDIA_TYPES = ['image', 'video', 'link', 'pdf'] as const

const patchSchema = z.object({
  title:         z.string().min(1).max(120).optional(),
  description:   z.string().max(500).nullable().optional(),
  media_url:     z.string().url().optional(),
  media_type:    z.enum(MEDIA_TYPES).optional(),
  thumbnail_url: z.string().url().nullable().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCandidate()
  if (!auth.ok) return auth.response

  const { id } = await params

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid JSON.' } }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid fields.', details: parsed.error.flatten() },
    }, { status: 422 })
  }

  const d = parsed.data
  const service = createServiceClient()

  const { data, error } = await service
    .from('candidate_portfolio_items')
    .update({
      ...(d.title         !== undefined && { title:         d.title }),
      ...(d.description   !== undefined && { description:   d.description }),
      ...(d.media_url      !== undefined && { media_url:     d.media_url }),
      ...(d.media_type     !== undefined && { media_type:    d.media_type }),
      ...(d.thumbnail_url  !== undefined && { thumbnail_url: d.thumbnail_url }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('candidate_id', auth.candidateProfileId)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: error?.message ?? 'Item not found.' } }, { status: 404 })
  }

  return NextResponse.json({ success: true, data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCandidate()
  if (!auth.ok) return auth.response

  const { id } = await params
  const service = createServiceClient()

  const { error } = await service
    .from('candidate_portfolio_items')
    .delete()
    .eq('id', id)
    .eq('candidate_id', auth.candidateProfileId)

  if (error) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
