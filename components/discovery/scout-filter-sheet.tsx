'use client'

import { useState }   from 'react'
import { Drawer }     from '@/components/ui/drawer'
import { Button }     from '@/components/ui/button'
import { FilterContent, countActiveFilters, EMPTY_FILTERS } from './filter-panel'
import type { DiscoveryFilters } from './filter-panel'

interface ScoutFilterSheetProps {
  open:      boolean
  onClose:   () => void
  filters:   DiscoveryFilters
  onConfirm: (filters: DiscoveryFilters) => void
}

export function ScoutFilterSheet({ open, onClose, filters: initialFilters, onConfirm }: ScoutFilterSheetProps) {
  // Local draft — changes are applied only on "Start Scouting"
  const [draft, setDraft] = useState<DiscoveryFilters>(initialFilters)

  const handleOpen = () => setDraft(initialFilters) // reset draft to current on open
  const activeCount = countActiveFilters(draft)

  const handleConfirm = () => {
    onConfirm(draft)
    onClose()
  }

  const handleReset = () => setDraft(EMPTY_FILTERS)

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      title="Search filters"
      description="Narrow your talent pool before scouting"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={handleReset} disabled={activeCount === 0}>
            Clear all
          </Button>
          <Button variant="primary" size="md" onClick={handleConfirm}>
            {activeCount > 0 ? `Scout with ${activeCount} filter${activeCount === 1 ? '' : 's'}` : 'Start Scouting'}
          </Button>
        </>
      }
    >
      <FilterContent filters={draft} onChange={setDraft} onReset={handleReset} />
    </Drawer>
  )
}
