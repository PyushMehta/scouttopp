import { type ComponentProps, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectGroup {
  label: string
  options: SelectOption[]
}

export interface SelectProps extends Omit<ComponentProps<'select'>, 'children'> {
  label?: string
  helperText?: string
  error?: string
  options?: SelectOption[]
  groups?: SelectGroup[]
  placeholder?: string
  wrapperClassName?: string
}

export function Select({
  label,
  helperText,
  error,
  options,
  groups,
  placeholder,
  id,
  className,
  wrapperClassName,
  disabled,
  required,
  ...props
}: SelectProps) {
  const autoId   = useId()
  const selectId = id ?? autoId
  const hasError = Boolean(error)

  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-foreground">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-1 text-destructive">*</span>
          )}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          disabled={disabled}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={
            hasError ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
          }
          className={cn(
            'w-full h-10 rounded-lg bg-input border text-sm text-foreground',
            'appearance-none cursor-pointer pr-9 pl-3',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
            hasError
              ? 'border-destructive focus:ring-destructive/40 focus:border-destructive'
              : 'border-border hover:border-muted/50',
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
          {groups?.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <ChevronDown
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>

      {hasError && (
        <p id={`${selectId}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      {!hasError && helperText && (
        <p id={`${selectId}-helper`} className="text-xs text-muted">
          {helperText}
        </p>
      )}
    </div>
  )
}
