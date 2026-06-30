import { NextResponse, type NextRequest } from 'next/server'
import { requireCandidate }              from '@/lib/auth/require-candidate'
import { createServiceClient }           from '@/lib/supabase/server'

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const BUCKET         = 'avatars'

export async function POST(req: NextRequest) {
  const auth = await requireCandidate()
  if (!auth.ok) return auth.response

  let formData: FormData
  try { formData = await req.formData() } catch {
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Expected multipart/form-data.' } }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'No file provided.' } }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ success: false, error: { code: 'INVALID_FILE_TYPE', message: 'Only JPEG, PNG, WebP and GIF are allowed.' } }, { status: 422 })
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ success: false, error: { code: 'FILE_TOO_LARGE', message: 'File must be under 5 MB.' } }, { status: 422 })
  }

  const ext      = file.type.split('/')[1].replace('jpeg', 'jpg')
  const path     = `${auth.candidateProfileId}/avatar.${ext}`
  const buffer   = Buffer.from(await file.arrayBuffer())

  const service = createServiceClient()

  const { error: uploadErr } = await service.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadErr) {
    return NextResponse.json({ success: false, error: { code: 'UPLOAD_FAILED', message: uploadErr.message } }, { status: 500 })
  }

  // Signed URL works whether the bucket is public or private — avoids
  // depending on the bucket's public flag being configured correctly.
  const { data: signedData, error: signedErr } = await service.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365) // 1 year

  if (signedErr || !signedData) {
    return NextResponse.json({ success: false, error: { code: 'URL_FAILED', message: signedErr?.message ?? 'Could not generate avatar URL.' } }, { status: 500 })
  }

  const avatarUrl = signedData.signedUrl

  const { data, error: updateErr } = await service
    .from('candidate_profiles')
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq('id', auth.candidateProfileId)
    .select('avatar_url')
    .single()

  if (updateErr) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: updateErr.message } }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: { avatarUrl: data.avatar_url } })
}
