import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin }                  from '@/lib/auth/require-admin'
import { createServiceClient }           from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { searchParams } = req.nextUrl
  const queue  = searchParams.get('queue') ?? 'staging'
  const status = searchParams.get('status') ?? 'pending'
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit  = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '25', 10)))
  const search = searchParams.get('search')?.trim() ?? ''
  const offset = (page - 1) * limit

  const supabase = createServiceClient()

  if (queue === 'staging') {
    type StagingStatus = 'pending' | 'promoted' | 'rejected' | 'duplicate' | 'error'
    const validStatuses: StagingStatus[] = ['pending', 'promoted', 'rejected', 'duplicate', 'error']
    const stagingStatus: StagingStatus = validStatuses.includes(status as StagingStatus)
      ? (status as StagingStatus)
      : 'pending'

    let query = supabase
      .from('candidate_sync_staging')
      .select('id, raw_data, mapped_data, status, created_at, promoted_at', { count: 'exact' })
      .eq('status', stagingStatus)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
        { status: 500 },
      )
    }

    const candidates = (data ?? [])
      .map(row => {
        const mapped = row.mapped_data as Record<string, unknown> | null
        const raw    = row.raw_data   as Record<string, unknown>
        const fullName    = (mapped?.full_name    ?? raw?.['Full Name'] ?? raw?.['Name'] ?? '') as string
        const email       = (mapped?.email        ?? raw?.['Email']                         ?? '') as string
        const primaryRole = (mapped?.primary_role ?? null) as string | null
        const city        = (mapped?.location_city    ?? null) as string | null
        const country     = (mapped?.location_country ?? null) as string | null

        if (search) {
          const s = search.toLowerCase()
          if (!fullName.toLowerCase().includes(s) && !email.toLowerCase().includes(s)) return null
        }

        return {
          id:          row.id,
          fullName,
          email,
          primaryRole,
          location:    [city, country].filter(Boolean).join(', ') || null,
          status:      row.status,
          dataSource:  'google_sheets_sync' as const,
          createdAt:   row.created_at,
        }
      })
      .filter(Boolean)

    const total      = count ?? 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        candidates,
        pagination: { page, limit, total, totalPages },
      },
    })
  }

  // Canonical queue
  let query = supabase
    .from('candidate_profiles')
    .select('id, full_name, email, primary_role, location_city, location_country, is_discoverable, created_at, data_source', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 },
    )
  }

  const candidates = (data ?? []).map(cp => ({
    id:          cp.id,
    fullName:    cp.full_name,
    email:       cp.email,
    primaryRole: cp.primary_role,
    location:    [cp.location_city, cp.location_country].filter(Boolean).join(', ') || null,
    status:      cp.is_discoverable ? 'approved' : 'pending',
    dataSource:  cp.data_source,
    createdAt:   cp.created_at,
  }))

  const total      = count ?? 0
  const totalPages = Math.ceil(total / limit)

  return NextResponse.json({
    success: true,
    data: {
      candidates,
      pagination: { page, limit, total, totalPages },
    },
  })
}
