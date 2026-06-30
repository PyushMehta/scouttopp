import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin }                  from '@/lib/auth/require-admin'
import { createServiceClient }           from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ runId: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { runId } = await params
  const supabase  = createServiceClient()

  const { data, error } = await supabase
    .from('sync_runs')
    .select('*')
    .eq('id', runId)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Sync run not found.' } },
      { status: 404 },
    )
  }

  return NextResponse.json({
    success: true,
    data: {
      id:           data.id,
      status:       data.status,
      rowsFetched:  data.rows_fetched,
      rowsPromoted: data.rows_promoted,
      rowsSkipped:  data.rows_skipped,
      rowsErrored:  data.rows_errored,
      startedAt:    data.started_at,
      completedAt:  data.completed_at,
    },
  })
}
