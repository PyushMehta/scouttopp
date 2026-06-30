'use client'

import { useState, useId, type ReactNode, type ChangeEvent, type ComponentProps } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type'> {
  label?: ReactNode
  description?: string
  error?: string
  wrapperClassName?: string
}

export function Checkbox({
  label,
  description,
  error,
  id,
  className,
  wrapperClassName,
  checked,
  defaultChecked,
  disabled,
  onChange,
  ...props
}: CheckboxProps) {
  const generatedId = useId()
  const inputId     = id ?? generatedId
  const hasError    = Boolean(error)

  // Track internal state so Framer Motion always has a boolean to animate against,
  // regardless of whether the checkbox is controlled or uncontrolled.
  const [internalChecked, setInternalChecked] = useState(!!defaultChecked)
  const isChecked = checked !== undefined ? checked : internalChecked

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (checked === undefined) setInternalChecked(e.target.checked)
    onChange?.(e)
  }

  return (
    <div className={cn('flex flex-col gap-1', wrapperClassName)}>
      <label
        htmlFor={inputId}
        className={cn(
          'flex items-start gap-3 cursor-pointer group',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <span className="relative mt-0.5 w-5 h-5 shrink-0">
          <input
            type="checkbox"
            id={inputId}
            checked={checked}
            defaultChecked={defaultChecked}
            disabled={disabled}
            onChange={handleChange}
            aria-invalid={hasError || undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={cn(
              'peer absolute inset-0 w-full h-full opacity-0 cursor-pointer',
              disabled && 'cursor-not-allowed',
              className,
            )}
            {...props}
          />

          <span
            className={cn(
              'pointer-events-none flex w-5 h-5 rounded-md border-2 items-center justify-center',
              'transition-colors duration-150',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
              hasError
                ? 'border-destructive peer-checked:bg-destructive peer-checked:border-destructive'
                : 'border-border bg-input peer-checked:bg-primary peer-checked:border-primary',
              'group-hover:border-primary/60',
            )}
          >
            <motion.span
              aria-hidden="true"
              initial={false}
              animate={isChecked ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Check size={12} strokeWidth={3} className="text-white" />
            </motion.span>
          </span>
        </span>

        {(label || description) && (
          <span className="flex flex-col gap-0.5">
            {label && (
              <span className="text-sm font-medium text-foreground leading-5">{label}</span>
            )}
            {description && (
              <span className="text-xs text-muted leading-4">{description}</span>
            )}
          </span>
        )}
      </label>

      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-destructive ml-8">
          {error}
        </p>
      )}
    </div>
  )
}
