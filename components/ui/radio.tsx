'use client'

import { useState, useId, type ChangeEvent, type ComponentProps } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/* ─── Single radio item ─────────────────────────────────────────────────── */

export interface RadioProps extends Omit<ComponentProps<'input'>, 'type'> {
  label?: string
  description?: string
  wrapperClassName?: string
}

export function Radio({
  label,
  description,
  id,
  className,
  wrapperClassName,
  checked,
  defaultChecked,
  disabled,
  onChange,
  ...props
}: RadioProps) {
  const generatedId = useId()
  const inputId     = id ?? generatedId

  const [internalChecked, setInternalChecked] = useState(!!defaultChecked)
  const isChecked = checked !== undefined ? checked : internalChecked

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (checked === undefined) setInternalChecked(e.target.checked)
    onChange?.(e)
  }

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'flex items-start gap-3 cursor-pointer group',
        disabled && 'cursor-not-allowed opacity-50',
        wrapperClassName,
      )}
    >
      <span className="relative mt-0.5 w-5 h-5 shrink-0">
        <input
          type="radio"
          id={inputId}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={handleChange}
          className={cn(
            'peer absolute inset-0 w-full h-full opacity-0 cursor-pointer',
            disabled && 'cursor-not-allowed',
            className,
          )}
          {...props}
        />

        <span
          className={cn(
            'pointer-events-none flex w-5 h-5 rounded-full border-2 items-center justify-center',
            'transition-colors duration-150',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
            'border-border bg-input peer-checked:border-primary',
            'group-hover:border-primary/60',
          )}
        >
          <motion.span
            aria-hidden="true"
            initial={false}
            animate={isChecked ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="block w-2 h-2 rounded-full bg-primary"
          />
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
  )
}

/* ─── Radio group ───────────────────────────────────────────────────────── */

export interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface RadioGroupProps {
  name: string
  options: RadioOption[]
  value?: string
  onChange?: (value: string) => void
  label?: string
  error?: string
  className?: string
  orientation?: 'vertical' | 'horizontal'
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  label,
  error,
  className,
  orientation = 'vertical',
}: RadioGroupProps) {
  return (
    <fieldset className={cn('flex flex-col gap-2', className)}>
      {label && (
        <legend className="text-sm font-medium text-foreground mb-1">{label}</legend>
      )}
      <div
        className={cn(
          'flex gap-3',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        )}
      >
        {options.map((opt) => (
          <Radio
            key={opt.value}
            name={name}
            value={opt.value}
            label={opt.label}
            description={opt.description}
            disabled={opt.disabled}
            checked={value === opt.value}
            onChange={() => onChange?.(opt.value)}
          />
        ))}
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive mt-0.5">
          {error}
        </p>
      )}
    </fieldset>
  )
}
