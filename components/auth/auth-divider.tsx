export function AuthDivider({ label = 'or' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3" role="separator" aria-label={label}>
      <span className="flex-1 h-px bg-border" />
      <span className="text-xs font-medium text-muted uppercase tracking-widest select-none">
        {label}
      </span>
      <span className="flex-1 h-px bg-border" />
    </div>
  )
}
