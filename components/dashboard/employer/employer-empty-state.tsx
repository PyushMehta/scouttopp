import type { LucideIcon } from 'lucide-react'
import type { ReactNode }  from 'react'

interface EmployerEmptyStateProps {
  icon:         LucideIcon
  title:        string
  description:  string
  badge?:       string
  action?:      ReactNode
  iconColor?:   string
  iconBg?:      string
  compact?:     boolean
}

export function EmployerEmptyState({
  icon: Icon,
  title,
  description,
  badge,
  action,
  iconColor = '#A78BFA',
  iconBg    = 'rgba(124,58,237,0.1)',
  compact   = false,
}: EmployerEmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-12 px-6' : 'py-24 px-8'}`}>
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: iconBg }}
        aria-hidden="true"
      >
        <Icon size={28} strokeWidth={1.5} style={{ color: iconColor }} />
      </div>

      <div className="flex items-center gap-2 mb-2">
        <h2 className={`font-bold text-foreground ${compact ? 'text-base' : 'text-lg'}`}>{title}</h2>
        {badge && (
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
            style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA' }}
          >
            {badge}
          </span>
        )}
      </div>

      <p className={`text-muted leading-relaxed max-w-sm ${compact ? 'text-xs' : 'text-sm'}`}>
        {description}
      </p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
