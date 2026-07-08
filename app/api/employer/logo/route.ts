import { NextRequest, NextResponse } from 'next/server'
import { requireEmployer } from '@/lib/auth/require-employer'
import { createServiceClient } from '@/lib/supabase/server'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  const auth = await requireEmployer()
  if (!auth.ok) return auth.response

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ success: false, error: { code: 'MISSING_FILE', message: 'No file provided.' } }, { status: 400 })
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ success: false, error: { code: 'INVALID_TYPE', message: 'File must be JPEG, PNG, WebP, or GIF.' } }, { status: 422 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ success: false, error: { code: 'TOO_LARGE', message: 'File must be under 5 MB.' } }, { status: 422 })
  }

  const ext     = file.name.split('.').pop() ?? 'jpg'
  const path    = `employer-logos/${auth.employerProfileId}/logo.${ext}`
  const buffer  = Buffer.from(await file.arrayBuffer())

  const service = createServiceClient()
  const { error: uploadError } = await service.storage
    .from('avatars')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    return NextResponse.json({ success: false, error: { code: 'UPLOAD_ERROR', message: uploadError.message } }, { status: 500 })
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
    return NextResponse.json({ success: false, error: { code: 'DB_ERROR', message: updateError.message } }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: { logo_url: path, signed_url: logoUrl } })
}
