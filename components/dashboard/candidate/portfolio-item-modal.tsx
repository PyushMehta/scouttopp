'use client'

import { useEffect, useRef, useState } from 'react'
import { UploadCloud, Loader2, Link as LinkIcon } from 'lucide-react'
import { Modal }    from '@/components/ui/modal'
import { Input }    from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select }   from '@/components/ui/select'
import { Button }   from '@/components/ui/button'
import { toast }    from '@/components/ui/toast'
import type { Tables } from '@/lib/supabase/types'

export type PortfolioItem = Tables<'candidate_portfolio_items'>
export type MediaType     = 'image' | 'video' | 'pdf' | 'link'

const TYPE_OPTIONS = [
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'pdf',   label: 'PDF' },
  { value: 'link',  label: 'External link' },
]

const ACCEPT_MAP: Record<Exclude<MediaType, 'link'>, string> = {
  image: 'image/jpeg,image/png,image/webp,image/gif',
  video: 'video/mp4,video/webm,video/quicktime',
  pdf:   'application/pdf',
}

interface Props {
  open:    boolean
  onClose: () => void
  onSaved: (item: PortfolioItem) => void
  item?:   PortfolioItem | null
}

export function PortfolioItemModal({ open, onClose, onSaved, item }: Props) {
  const isEdit = !!item

  const [title, setTitle]               = useState('')
  const [description, setDescription]   = useState('')
  const [mediaType, setMediaType]       = useState<MediaType>('image')
  const [linkUrl, setLinkUrl]           = useState('')
  const [mediaUrl, setMediaUrl]         = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [uploading, setUploading]       = useState(false)
  const [saving, setSaving]             = useState(false)
  const [errors, setErrors]             = useState<{ title?: string; linkUrl?: string; media?: string }>({})
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const type = (item?.media_type as MediaType) ?? 'image'
    setTitle(item?.title ?? '')
    setDescription(item?.description ?? '')
    setMediaType(type)
    setLinkUrl(type === 'link' ? item?.media_url ?? '' : '')
    setMediaUrl(type !== 'link' ? item?.media_url ?? '' : '')
    setThumbnailUrl(item?.thumbnail_url ?? '')
    setErrors({})
  }, [open, item])

  const handleTypeChange = (next: MediaType) => {
    setMediaType(next)
    setErrors({})
    if (next === 'link') {
      setMediaUrl('')
      setThumbnailUrl('')
    } else {
      setLinkUrl('')
    }
  }

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res  = await fetch('/api/candidate/portfolio/upload', { method: 'POST', body: fd })
      const json = await res.json() as {
        success: boolean
        data?: { mediaUrl: string; mediaType: 'image' | 'video' | 'pdf'; thumbnailUrl: string | null }
        error?: { message: string }
      }
      if (!json.success || !json.data) throw new Error(json.error?.message ?? 'Upload failed.')
      setMediaUrl(json.data.mediaUrl)
      setThumbnailUrl(json.data.thumbnailUrl ?? '')
      setMediaType(json.data.mediaType)
      toast.success('File uploaded.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const validate = () => {
    const e: typeof errors = {}
    if (!title.trim()) e.title = 'Title is required.'
    if (mediaType === 'link') {
      if (!linkUrl.trim() || !/^https?:\/\/.+/.test(linkUrl)) e.linkUrl = 'Must be a valid URL starting with https://'
    } else if (!mediaUrl) {
      e.media = 'Upload a file to continue.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const body = {
        title:         title.trim(),
        description:   description.trim() || undefined,
        media_url:     mediaType === 'link' ? linkUrl.trim() : mediaUrl,
        media_type:    mediaType,
        thumbnail_url: thumbnailUrl || null,
      }
      const res = await fetch(
        isEdit ? `/api/candidate/portfolio/${item.id}` : '/api/candidate/portfolio',
        {
          method:  isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(body),
        },
      )
      const json = await res.json() as { success: boolean; data?: PortfolioItem; error?: { message: string } }
      if (!json.success || !json.data) throw new Error(json.error?.message ?? 'Save failed.')
      onSaved(json.data)
      toast.success(isEdit ? 'Item updated.' : 'Item added.')
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit portfolio item' : 'Add portfolio item'}
      size="lg"
      closable={!saving}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving}>{isEdit ? 'Save changes' : 'Add item'}</Button>
        </>
      }
    >
      <div className="space-y-5">
        <Input
          label="Title"
          required
          value={title}
          onChange={e => setTitle(e.target.value)}
          error={errors.title}
          maxLength={120}
        />

        <Textarea
          label="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          showCount
          maxLength={500}
          rows={3}
        />

        <Select
          label="Type"
          required
          options={TYPE_OPTIONS}
          value={mediaType}
          onChange={e => handleTypeChange(e.target.value as MediaType)}
        />

        {mediaType === 'link' ? (
          <Input
            label="URL"
            required
            placeholder="https://..."
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            error={errors.linkUrl}
            leftIcon={<LinkIcon size={14} aria-hidden="true" />}
          />
        ) : (
          <div>
            <p className="text-sm font-medium text-foreground mb-1.5">
              File<span aria-hidden="true" className="ml-1 text-destructive">*</span>
            </p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full rounded-lg border border-dashed border-border hover:border-primary/50 transition-colors px-4 py-6 flex flex-col items-center gap-2 text-sm text-muted disabled:cursor-not-allowed"
            >
              {uploading
                ? <Loader2 size={20} className="animate-spin" aria-hidden="true" />
                : <UploadCloud size={20} aria-hidden="true" />}
              {mediaUrl ? 'Replace file' : 'Click to upload'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPT_MAP[mediaType]}
              className="sr-only"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              aria-label="Upload portfolio media"
            />
            {errors.media && <p className="text-xs text-destructive mt-1.5">{errors.media}</p>}
            {mediaUrl && mediaType === 'image' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl} alt="Preview" className="mt-3 rounded-lg max-h-40 object-cover" />
            )}
            {mediaUrl && mediaType !== 'image' && (
              <p className="text-xs text-success mt-2">File uploaded ✓</p>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
