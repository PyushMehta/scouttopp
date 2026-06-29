'use client'

import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner'
import type { ToastT } from 'sonner'

/* ─── Themed Toaster ────────────────────────────────────────────────────── */

export interface ToasterProps {
  position?: ToastT['position']
  richColors?: boolean
  expand?: boolean
  duration?: number
}

export function Toaster({
  position  = 'bottom-right',
  richColors = true,
  expand    = false,
  duration  = 4000,
}: ToasterProps) {
  return (
    <SonnerToaster
      position={position}
      richColors={richColors}
      expand={expand}
      duration={duration}
      theme="dark"
      toastOptions={{
        style: {
          background:   '#181818',
          border:       '1px solid #262626',
          color:        '#FFFFFF',
          fontFamily:   'inherit',
          borderRadius: '0.75rem',
        },
        classNames: {
          toast:       'shadow-lg',
          title:       'text-sm font-semibold',
          description: 'text-xs text-[#9CA3AF]',
          actionButton:
            'bg-primary text-white text-xs px-3 py-1 rounded-md hover:bg-primary-hover transition-colors',
          cancelButton:
            'bg-white/8 text-[#9CA3AF] text-xs px-3 py-1 rounded-md hover:bg-white/12 transition-colors',
          closeButton:
            'text-[#9CA3AF] hover:text-white transition-colors',
        },
      }}
    />
  )
}

/* ─── Typed toast helpers ───────────────────────────────────────────────── */

type ToastOptions = Parameters<typeof sonnerToast>[1]

export const toast = {
  default: (message: string, opts?: ToastOptions) =>
    sonnerToast(message, opts),

  success: (message: string, opts?: ToastOptions) =>
    sonnerToast.success(message, opts),

  error: (message: string, opts?: ToastOptions) =>
    sonnerToast.error(message, opts),

  warning: (message: string, opts?: ToastOptions) =>
    sonnerToast.warning(message, opts),

  info: (message: string, opts?: ToastOptions) =>
    sonnerToast.info(message, opts),

  loading: (message: string, opts?: ToastOptions) =>
    sonnerToast.loading(message, opts),

  promise: <T,>(
    promise: Promise<T>,
    opts: Parameters<typeof sonnerToast.promise<T>>[1],
  ) => sonnerToast.promise(promise, opts),

  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
}
