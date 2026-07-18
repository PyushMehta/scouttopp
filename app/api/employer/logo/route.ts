import { NextRequest, NextResponse } from 'next/server'
import { requireEmployer }           from '@/lib/auth/require-employer'
import { createServiceClient }       from '@/lib/supabase/server'
import { serverError }               from '@/lib/api-error'
import { mimeMatchesBuffer }         from '@/lib/file-magic'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
}
const ALLOWED = Object.keys(MIME_EXT)

export async function POST(req: NextRequest) {
  const auth = await requireEmployer()
  if (!auth.ok) return auth.response

  let formData: FormData
  try { formData = await req.formData() } catch {
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Expected multipart/form-data.' } }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: { code: 'MISSING_FILE', message: 'No file provided.' } }, { status: 400 })
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ success: false, error: { code: 'INVALID_TYPE', message: 'File must be JPEG, PNG, WebP, or GIF.' } }, { status: 422 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ success: false, error: { code: 'TOO_LARGE', message: 'File must be under 5 MB.' } }, { status: 422 })
  }

  const ext     = MIME_EXT[file.type] ?? 'jpg'
  const path    = `employer-logos/${auth.employerProfileId}/logo.${ext}`
  const buffer  = Buffer.from(await file.arrayBuffer())

  if (!mimeMatchesBuffer(file.type, buffer)) {
    return NextResponse.json({ success: false, error: { code: 'INVALID_TYPE', message: 'File content does not match the declared type.' } }, { status: 422 })
  }

  const service = createServiceClient()
  const { error: uploadError } = await service.storage
    .from('avatars')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    return serverError('employer/logo upload', uploadError)
  }

  const { data: urlData } = await service.storage
    .from('avatars')
    .createSignedUrl(path, 60 * 60 * 24 * 365)

  const logoUrl = urlData?.signedUrl ?? null

  const { error: updateError } = await service
    .from('employer_profiles')
    .update({ logo_url: path })
    .eq('id', auth.employerProfileId)

  if (updateError) {
    return serverError('employer/logo profile update', updateError)
  }

  return NextResponse.json({ success: true, data: { logo_url: path, signed_url: logoUrl } })
}
