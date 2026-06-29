import { type ComponentProps, type ReactNode, useId } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends ComponentProps<'input'> {
  label?: string
  helperText?: string
  error?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  wrapperClassName?: string
}

export function Input({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  id,
  className,
  wrapperClassName,
  disabled,
  required,
  ...props
}: InputProps) {
  const autoId   = useId()
  const inputId  = id ?? autoId
  const hasError = Boolean(error)

  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-1 text-destructive">*</span>
          )}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          >
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          disabled={disabled}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={
            hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          className={cn(
            'w-full rounded-lg bg-input border text-sm text-foreground',
            'placeholder:text-muted',
            'h-10 px-3',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
            leftIcon  && 'pl-9',
            rightIcon && 'pr-9',
            hasError
              ? 'border-destructive focus:ring-destructive/40 focus:border-destructive'
              : 'border-border hover:border-muted/50',
            className,
          )}
          {...props}
        />

        {rightIcon && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
          >
            {rightIcon}
          </span>
        )}
      </div>

      {hasError && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      {!hasError && helperText && (
        <p id={`${inputId}-helper`} className="text-xs text-muted">
          {helperText}
        </p>
      )}
    </div>
  )
}
