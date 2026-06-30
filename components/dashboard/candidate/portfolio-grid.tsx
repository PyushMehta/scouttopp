'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Image as ImageIcon, Video, FileText, Link as LinkIcon, Briefcase } from 'lucide-react'
import { Card }    from '@/components/ui/card'
import { Badge }   from '@/components/ui/badge'
import { Button }  from '@/components/ui/button'
import { Modal }   from '@/components/ui/modal'
import { toast }   from '@/components/ui/toast'
import { PortfolioItemModal, type PortfolioItem } from './portfolio-item-modal'

const TYPE_META: Record<string, { label: string; icon: typeof ImageIcon }> = {
  image: { label: 'Image', icon: ImageIcon },
  video: { label: 'Video', icon: Video },
  pdf:   { label: 'PDF',   icon: FileText },
  link:  { label: 'Link',  icon: LinkIcon },
}

interface Props {
  initialItems: PortfolioItem[]
}

export function PortfolioGrid({ initialItems }: Props) {
  const [items, setItems]         = useState<PortfolioItem[]>(initialItems)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState<PortfolioItem | null>(null)
  const [deleting, setDeleting]   = useState<PortfolioItem | null>(null)
  const [busyId, setBusyId]       = useState<string | null>(null)

  const openAdd  = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (item: PortfolioItem) => { setEditing(item); setModalOpen(true) }

  const handleSaved = (item: PortfolioItem) => {
    setItems(prev => {
      const exists = prev.some(p => p.id === item.id)
      const next = exists ? prev.map(p => (p.id === item.id ? item : p)) : [...prev, item]
      return [...next].sort((a, b) => a.sort_order - b.sort_order)
    })
  }

  const handleDelete = async () => {
    if (!deleting) return
    const target = deleting
    setBusyId(target.id)
    try {
      const res  = await fetch(`/api/candidate/portfolio/${target.id}`, { method: 'DELETE' })
      const json = await res.json() as { success: boolean; error?: { message: string } }
      if (!json.success) throw new Error(json.error?.message ?? 'Delete failed.')
      setItems(prev => prev.filter(p => p.id !== target.id))
      toast.success('Item removed.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed.')
    } finally {
      setBusyId(null)
      setDeleting(null)
    }
  }

  const move = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= items.length) return

    const reordered = [...items]
    const tmp = reordered[index]
    reordered[index] = reordered[targetIndex]
    reordered[targetIndex] = tmp
    setItems(reordered)

    try {
      const res  = await fetch('/api/candidate/portfolio/reorder', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderedIds: reordered.map(i => i.id) }),
      })
      const json = await res.json() as { success: boolean; error?: { message: string } }
      if (!json.success) throw new Error(json.error?.message ?? 'Reorder failed.')
    } catch (err) {
      setItems(items) // revert
      toast.error(err instanceof Error ? err.message : 'Reorder failed.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Portfolio</h1>
          <p className="mt-1 text-sm text-muted">Showcase your best work — images, videos, PDFs or links.</p>
        </div>
        <Button leftIcon={<Plus size={16} aria-hidden="true" />} onClick={openAdd}>
          Add item
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-16 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(124,58,237,0.1)' }}>
            <Briefcase size={20} style={{ color: '#A78BFA' }} aria-hidden="true" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">No portfolio items yet</h3>
          <p className="text-xs text-muted mb-5 max-w-xs">
            Add images, videos, PDFs or links to showcase your work to employers.
          </p>
          <Button leftIcon={<Plus size={16} aria-hidden="true" />} onClick={openAdd}>
            Add your first item
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => {
            const meta = TYPE_META[item.media_type ?? 'link'] ?? TYPE_META.link
            const Icon = meta.icon
            const thumb = item.media_type === 'image' ? (item.thumbnail_url ?? item.media_url) : null

            return (
              <Card key={item.id} noPadding className="overflow-hidden flex flex-col">
                <div className="aspect-video bg-surface flex items-center justify-center overflow-hidden">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <Icon size={28} className="text-muted" aria-hidden="true" />
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-1">{item.title}</h3>
                    <Badge variant="outline" size="sm">{meta.label}</Badge>
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted line-clamp-2 mb-3">{item.description}</p>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="icon"
                        size="sm"
                        aria-label="Move up"
                        disabled={index === 0 || busyId === item.id}
                        onClick={() => move(index, -1)}
                      >
                        <ChevronUp size={14} aria-hidden="true" />
                      </Button>
                      <Button
                        variant="icon"
                        size="sm"
                        aria-label="Move down"
                        disabled={index === items.length - 1 || busyId === item.id}
                        onClick={() => move(index, 1)}
                      >
                        <ChevronDown size={14} aria-hidden="true" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="icon" size="sm" aria-label="Edit item" onClick={() => openEdit(item)}>
                        <Pencil size={14} aria-hidden="true" />
                      </Button>
                      <Button
                        variant="icon"
                        size="sm"
                        aria-label="Delete item"
                        disabled={busyId === item.id}
                        onClick={() => setDeleting(item)}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <PortfolioItemModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        item={editing}
      />

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete portfolio item?"
        description={deleting ? `"${deleting.title}" will be permanently removed.` : undefined}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)} disabled={busyId === deleting?.id}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} loading={busyId === deleting?.id}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">This action cannot be undone.</p>
      </Modal>
    </div>
  )
}
