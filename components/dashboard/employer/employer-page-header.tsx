import type { ReactNode } from 'react'

interface EmployerPageHeaderProps {
  title:    string
  subtitle?: string
  badge?:   ReactNode
  action?:  ReactNode
}

export function EmployerPageHeader({ title, subtitle, badge, action }: EmployerPageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">{title}</h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-sm text-muted leading-relaxed">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="shrink-0">{action}</div>
      )}
    </div>
  )
}
