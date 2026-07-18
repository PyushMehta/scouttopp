import { NextResponse }        from 'next/server'
import { requireAdmin }        from '@/lib/auth/require-admin'
import { createServiceClient } from '@/lib/supabase/server'
import { fetchSheetRows }      from '@/services/sheets.service'
import { mapSheetRow }         from '@/services/sync-mapper'
import type { TablesInsert }   from '@/types'

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

    // Fetch emails/phones already in staging (skip re-inserting) and already approved (true duplicates)
    const [{ data: existingStaging }, { data: existingCanonical }] = await Promise.all([
      supabase
        .from('candidate_sync_staging')
        .select('mapped_data')
        .in('status', ['pending', 'promoted', 'duplicate']),
      supabase
        .from('candidate_profiles')
        .select('email, phone'),
    ])

    // Already in staging → skip silently (already queued for review)
    const stagingEmails = new Set(
      (existingStaging ?? [])
        .map(s => (s.mapped_data as Record<string, unknown> | null)?.email as string | undefined)
        .filter(Boolean)
        .map(e => e!.toLowerCase())
    )
    const stagingPhones = new Set(
      (existingStaging ?? [])
        .map(s => (s.mapped_data as Record<string, unknown> | null)?.phone as string | undefined)
        .filter(Boolean)
        .map(p => p!.replace(/\D/g, ''))
        .filter(p => p.length >= 7)
    )

    // Already approved → mark as duplicate
    const approvedEmails = new Set(
      (existingCanonical ?? [])
        .map(c => c.email as string | undefined)
        .filter(Boolean)
        .map(e => e!.toLowerCase())
    )
    const approvedPhones = new Set(
      (existingCanonical ?? [])
        .map(c => c.phone as string | undefined)
        .filter(Boolean)
        .map(p => p!.replace(/\D/g, ''))
        .filter(p => p.length >= 7)
    )

    // Track emails/phones seen in this batch to catch same-person double submissions in the sheet
    const batchEmails = new Set<string>()
    const batchPhones = new Set<string>()

    let rowsSkipped = 0
    let rowsErrored = 0

    const inserts: TablesInsert<'candidate_sync_staging'>[] = []

    for (const row of rows) {
      const { mapped, errors } = mapSheetRow(row)

      if (!mapped) {
        rowsErrored++
        inserts.push({
          sync_run_id:       syncRun.id,
          google_sheets_row: row.rowIndex,
          raw_data:          row.rawData,
          mapped_data:       null,
          status:            'error' as const,
          error_message:     errors.join('; '),
        })
        continue
      }

      const emailKey   = mapped.email.toLowerCase()
      const phoneDigits = mapped.phone?.replace(/\D/g, '') ?? ''
      const hasPhone   = phoneDigits.length >= 7

      // Already in staging from a previous sync → skip entirely
      if (stagingEmails.has(emailKey) || (hasPhone && stagingPhones.has(phoneDigits))) {
        rowsSkipped++
        continue
      }

      // Already approved, or filled the form twice in the sheet
      const isApprovedDup = approvedEmails.has(emailKey) || (hasPhone && approvedPhones.has(phoneDigits))
      const isBatchDup    = batchEmails.has(emailKey)    || (hasPhone && batchPhones.has(phoneDigits))

      if (isApprovedDup || isBatchDup) {
        inserts.push({
          sync_run_id:       syncRun.id,
          google_sheets_row: row.rowIndex,
          raw_data:          row.rawData,
          mapped_data:       mapped as unknown as TablesInsert<'candidate_sync_staging'>['mapped_data'],
          status:            'duplicate' as const,
          error_message:     isBatchDup
            ? `Duplicate submission: same person filled the form twice (${hasPhone && batchPhones.has(phoneDigits) && !batchEmails.has(emailKey) ? 'phone match' : 'email match'})`
            : `Already an approved candidate.`,
        })
        continue
      }

      batchEmails.add(emailKey)
      if (hasPhone) batchPhones.add(phoneDigits)

      inserts.push({
        sync_run_id:       syncRun.id,
        google_sheets_row: row.rowIndex,
        raw_data:          row.rawData,
        mapped_data:       mapped as unknown as TablesInsert<'candidate_sync_staging'>['mapped_data'],
        status:            'pending' as const,
      })
    }

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
    console.error('[sync/run] error:', e)

    await supabase
      .from('sync_runs')
      .update({ status: 'failed', error_message: message, completed_at: new Date().toISOString() })
      .eq('id', syncRun.id)

    return err('SYNC_FAILED', 'Sync failed. Check server logs for details.', 502)
  }
}
