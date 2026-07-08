'use client'

import { useRef, useState } from 'react'
import { Camera, Loader2 }  from 'lucide-react'
import { Avatar }           from '@/components/ui/avatar'
import { toast }            from '@/components/ui/toast'

interface Props {
  currentUrl: string | null
  name:       string
  onUploaded: (signedUrl: string) => void
}

export function LogoUpload({ currentUrl, name, onUploaded }: Props) {
  const [preview,   setPreview]   = useState<string | null>(currentUrl)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setUploading(true)

    try {
      const fd = new FormData()
      fd.append('file', file)

      const res  = await fetch('/api/employer/logo', { method: 'POST', body: fd })
      const json = await res.json() as { success: boolean; data?: { signed_url: string }; error?: { message: string } }

      if (!json.success || !json.data) {
        throw new Error(json.error?.message ?? 'Upload failed.')
      }

      setPreview(json.data.signed_url)
      onUploaded(json.data.signed_url)
      toast.success('Logo updated.')
    } catch (err) {
      setPreview(currentUrl)
      toast.error(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
      URL.revokeObjectURL(objectUrl)
    }
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative group">
        <Avatar src={preview ?? undefined} name={name} size="xl" />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
          aria-label="Change company logo"
        >
          {uploading
            ? <Loader2 size={18} className="text-white animate-spin" aria-hidden="true" />
            : <Camera  size={18} className="text-white" aria-hidden="true" />
          }
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          aria-label="Upload company logo"
        />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Company logo</p>
        <p className="text-xs text-muted mt-0.5">JPG, PNG, WebP or GIF · Max 5 MB</p>
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="mt-2 text-xs font-medium text-secondary hover:underline disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Change logo'}
        </button>
      </div>
    </div>
  )
}
