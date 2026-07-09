import { NextResponse }     from 'next/server'
import { requireAdmin }     from '@/lib/auth/require-admin'
import { createServiceClient } from '@/lib/supabase/server'
import { fetchSheetRows }   from '@/services/sheets.service'
import { mapSheetRow }      from '@/services/sync-mapper'

function err(code: string, message: string, status: number) {
  return NextResponse.json({ success: false, error: { code, message } }, { status })
}

export async function POST() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const supabase = createServiceClient()

  // Guard: only one sync at a time
  const { data: running } = await supabase
    .from('sync_runs')
    .select('id')
    .eq('status', 'running')
    .limit(1)
    .single()

  if (running) {
    return err('CONFLICT', 'A sync is already in progress.', 409)
  }

  // Create the sync_run row
  const { data: syncRun, error: syncRunErr } = await supabase
    .from('sync_runs')
    .insert({ triggered_by: auth.userId, status: 'running' })
    .select()
    .single()

  if (syncRunErr || !syncRun) {
    return err('INTERNAL_ERROR', 'Failed to create sync run.', 500)
  }

  // Run the sync synchronously and resolve before responding
  try {
    const rows = await fetchSheetRows()

    // Fetch existing emails + phones from staging and canonical to detect duplicates
    const [{ data: existingStaging }, { data: existingCanonical }] = await Promise.all([
      supabase
        .from('candidate_sync_staging')
        .select('mapped_data, status')
        .in('status', ['pending', 'promoted']),
      supabase
        .from('candidate_profiles')
        .select('email, phone'),
    ])

    const existingEmails = new Set([
      ...(existingStaging ?? [])
        .map(s => (s.mapped_data as Record<string, unknown> | null)?.email as string | undefined)
        .filter(Boolean)
        .map(e => e!.toLowerCase()),
      ...(existingCanonical ?? [])
        .map(c => c.email as string | undefined)
        .filter(Boolean)
        .map(e => e!.toLowerCase()),
    ])

    // Phone dedup: same phone = same person trying with a different email
    const existingPhones = new Set([
      ...(existingStaging ?? [])
        .map(s => (s.mapped_data as Record<string, unknown> | null)?.phone as string | undefined)
        .filter(Boolean)
        .map(p => p!.replace(/\D/g, '')), // strip non-digits for loose matching
      ...(existingCanonical ?? [])
        .map(c => c.phone as string | undefined)
        .filter(Boolean)
        .map(p => p!.replace(/\D/g, '')),
    ])

    let rowsSkipped = 0
    let rowsErrored = 0

    const inserts = rows.map(row => {
      const { mapped, errors } = mapSheetRow(row)

      if (!mapped) {
        rowsErrored++
        return {
          sync_run_id:       syncRun.id,
          google_sheets_row: row.rowIndex,
          raw_data:          row.rawData,
          mapped_data:       null,
          status:            'error' as const,
          error_message:     errors.join('; '),
        }
      }

      const phoneDigits = mapped.phone?.replace(/\D/g, '') ?? ''
      const isEmailDup = existingEmails.has(mapped.email.toLowerCase())
      const isPhoneDup = phoneDigits.length >= 7 && existingPhones.has(phoneDigits)

      if (isEmailDup || isPhoneDup) {
        rowsSkipped++
        return {
          sync_run_id:       syncRun.id,
          google_sheets_row: row.rowIndex,
          raw_data:          row.rawData,
          mapped_data:       mapped as unknown as Record<string, unknown>,
          status:            'duplicate' as const,
          error_message:     isPhoneDup && !isEmailDup
            ? `Possible duplicate: phone number matches an existing candidate (different email: ${mapped.email})`
            : undefined,
        }
      }

      return {
        sync_run_id:       syncRun.id,
        google_sheets_row: row.rowIndex,
        raw_data:          row.rawData,
        mapped_data:       mapped as unknown as Record<string, unknown>,
        status:            'pending' as const,
      }
    })

    if (inserts.length > 0) {
      await supabase.from('candidate_sync_staging').insert(inserts)
    }

    const rowsFetched  = rows.length
    const rowsPending  = inserts.filter(r => r.status === 'pending').length

    const now = new Date().toISOString()
    const finalStatus = rowsErrored > 0 && rowsPending === 0 ? 'failed'
      : rowsErrored > 0 ? 'partial'
      : 'complete'

    await supabase
      .from('sync_runs')
      .update({
        status:       finalStatus,
        rows_fetched: rowsFetched,
        rows_promoted: 0,
        rows_skipped:  rowsSkipped,
        rows_errored:  rowsErrored,
        completed_at:  now,
      })
      .eq('id', syncRun.id)

    return NextResponse.json({
      success: true,
      data: {
        syncRunId:    syncRun.id,
        status:       finalStatus,
        rowsFetched,
        rowsNew:      rowsPending,
        rowsSkipped,
        rowsErrored,
        startedAt:    syncRun.started_at,
        completedAt:  now,
      },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown sync error'
    console.error('[sync/run] error:', message)

    await supabase
      .from('sync_runs')
      .update({ status: 'failed', error_message: message, completed_at: new Date().toISOString() })
      .eq('id', syncRun.id)

    return err('SYNC_FAILED', message, 502)
  }
}
