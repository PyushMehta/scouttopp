import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin }                  from '@/lib/auth/require-admin'
import { createServiceClient }           from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id }   = await params
  const supabase = createServiceClient()

  // Try staging first
  const { data: staging } = await supabase
    .from('candidate_sync_staging')
    .select('*')
    .eq('id', id)
    .single()

  if (staging) {
    const mapped = staging.mapped_data as Record<string, unknown> | null
    return NextResponse.json({
      success: true,
      data: {
        id:               staging.id,
        source:           'staging',
        stagingId:        staging.id,
        fullName:         (mapped?.full_name        ?? '') as string,
        email:            (mapped?.email             ?? '') as string,
        phone:            (mapped?.phone             ?? null) as string | null,
        locationCity:     (mapped?.location_city    ?? null) as string | null,
        locationCountry:  (mapped?.location_country ?? null) as string | null,
        primaryRole:      (mapped?.primary_role     ?? null) as string | null,
        yearsExperience:  (mapped?.years_experience ?? null) as number | null,
        portfolioUrl:     (mapped?.portfolio_url    ?? null) as string | null,
        linkedinUrl:      (mapped?.linkedin_url     ?? null) as string | null,
        instagramUrl:     (mapped?.instagram_url    ?? null) as string | null,
        websiteUrl:       (mapped?.website_url      ?? null) as string | null,
        resumeUrl:        (mapped?.resume_url       ?? null) as string | null,
        bio:              (mapped?.bio               ?? null) as string | null,
        status:           staging.status,
        rawData:          staging.raw_data,
        mappedData:       staging.mapped_data,
        createdAt:        staging.created_at,
      },
    })
  }

  // Try canonical
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (profile) {
    return NextResponse.json({
      success: true,
      data: {
        id:              profile.id,
        source:          'canonical',
        fullName:        profile.full_name,
        email:           profile.email,
        phone:           profile.phone,
        locationCity:    profile.location_city,
        locationCountry: profile.location_country,
        primaryRole:     profile.primary_role,
        yearsExperience: profile.years_experience,
        portfolioUrl:    profile.portfolio_url,
        linkedinUrl:     profile.linkedin_url,
        instagramUrl:    profile.instagram_url,
        websiteUrl:      profile.website_url,
        resumeUrl:       profile.resume_url,
        bio:             profile.bio,
        isDiscoverable:  profile.is_discoverable,
        approvedAt:      profile.approved_at,
        rejectedAt:      profile.rejected_at,
        rejectionReason: profile.rejection_reason,
        createdAt:       profile.created_at,
      },
    })
  }

  return NextResponse.json(
    { success: false, error: { code: 'NOT_FOUND', message: 'Candidate not found.' } },
    { status: 404 },
  )
}
