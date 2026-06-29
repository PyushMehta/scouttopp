import { type ComponentProps, useId } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends ComponentProps<'textarea'> {
  label?: string
  helperText?: string
  error?: string
  wrapperClassName?: string
  showCount?: boolean
  maxLength?: number
}

export function Textarea({
  label,
  helperText,
  error,
  id,
  className,
  wrapperClassName,
  disabled,
  required,
  showCount = false,
  maxLength,
  value,
  rows = 4,
  ...props
}: TextareaProps) {
  const autoId     = useId()
  const textareaId = id ?? autoId
  const hasError   = Boolean(error)
  const charCount  = typeof value === 'string' ? value.length : 0

  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-foreground">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-1 text-destructive">*</span>
          )}
        </label>
      )}

      <textarea
        id={textareaId}
        rows={rows}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        value={value}
        aria-invalid={hasError || undefined}
        aria-describedby={
          hasError ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
        }
        className={cn(
          'w-full rounded-lg bg-input border text-sm text-foreground',
          'placeholder:text-muted',
          'px-3 py-2.5',
          'resize-y min-h-20',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          hasError
            ? 'border-destructive focus:ring-destructive/40 focus:border-destructive'
            : 'border-border hover:border-muted/50',
          className,
        )}
        {...props}
      />

      <div className="flex items-start justify-between gap-2">
        <div>
          {hasError && (
            <p id={`${textareaId}-error`} role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
          {!hasError && helperText && (
            <p id={`${textareaId}-helper`} className="text-xs text-muted">
              {helperText}
            </p>
          )}
        </div>
        {showCount && maxLength && (
          <p
            aria-live="polite"
            className={cn(
              'text-xs ml-auto shrink-0',
              charCount >= maxLength ? 'text-destructive' : 'text-muted',
            )}
          >
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  )
}
