import { NextResponse, type NextRequest } from 'next/server'
import { requireCandidate }              from '@/lib/auth/require-candidate'
import { createServiceClient }           from '@/lib/supabase/server'
import { randomUUID }                    from 'crypto'
import { serverError }                   from '@/lib/api-error'
import { mimeMatchesBuffer }             from '@/lib/file-magic'

const MAX_SIZE_BYTES = 20 * 1024 * 1024 // 20 MB
const BUCKET         = 'portfolio'

const TYPE_MAP: Record<string, { mediaType: 'image' | 'video' | 'pdf'; ext: string }> = {
  'image/jpeg':      { mediaType: 'image', ext: 'jpg' },
  'image/png':       { mediaType: 'image', ext: 'png' },
  'image/webp':      { mediaType: 'image', ext: 'webp' },
  'image/gif':       { mediaType: 'image', ext: 'gif' },
  'video/mp4':       { mediaType: 'video', ext: 'mp4' },
  'video/webm':      { mediaType: 'video', ext: 'webm' },
  'video/quicktime': { mediaType: 'video', ext: 'mov' },
  'application/pdf': { mediaType: 'pdf',   ext: 'pdf' },
}

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

  const typeInfo = TYPE_MAP[file.type]
  if (!typeInfo) {
    return NextResponse.json({ success: false, error: { code: 'INVALID_FILE_TYPE', message: 'Only JPEG, PNG, WebP, GIF, MP4, WebM, MOV and PDF are allowed.' } }, { status: 422 })
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ success: false, error: { code: 'FILE_TOO_LARGE', message: 'File must be under 20 MB.' } }, { status: 422 })
  }

  const path    = `${auth.candidateProfileId}/${randomUUID()}.${typeInfo.ext}`
  const buffer  = Buffer.from(await file.arrayBuffer())

  if (!mimeMatchesBuffer(file.type, buffer)) {
    return NextResponse.json({ success: false, error: { code: 'INVALID_FILE_TYPE', message: 'File content does not match the declared type.' } }, { status: 422 })
  }

  const service = createServiceClient()

  const { error: uploadErr } = await service.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (uploadErr) {
    return serverError('candidate/portfolio/upload storage', uploadErr)
  }

  // Signed URL works whether the bucket is public or private.
  const { data: signedData, error: signedErr } = await service.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365) // 1 year

  if (signedErr || !signedData) {
    return serverError('candidate/portfolio/upload signed URL', signedErr ?? 'no signed data')
  }

  return NextResponse.json({
    success: true,
    data: {
      mediaUrl:     signedData.signedUrl,
      mediaType:    typeInfo.mediaType,
      thumbnailUrl: typeInfo.mediaType === 'image' ? signedData.signedUrl : null,
    },
  })
}
