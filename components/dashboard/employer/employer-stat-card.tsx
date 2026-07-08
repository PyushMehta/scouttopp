import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface EmployerStatCardProps {
  label:       string
  value:       string | number
  icon:        LucideIcon
  description?: string
  trend?:      string
  trendUp?:    boolean
  comingSoon?: boolean
  iconColor?:  string
  iconBg?:     string
}

export function EmployerStatCard({
  label,
  value,
  icon: Icon,
  description,
  trend,
  trendUp,
  comingSoon = false,
  iconColor  = '#A78BFA',
  iconBg     = 'rgba(124,58,237,0.1)',
}: EmployerStatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: iconBg }}
        >
          <Icon size={16} style={{ color: iconColor }} aria-hidden="true" />
        </div>
        {comingSoon && (
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0"
            style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA' }}
          >
            Soon
          </span>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{value}</p>
        <p className="text-xs text-muted mt-1">{label}</p>
      </div>

      {description && !trend && (
        <p className="text-xs text-muted/60 leading-relaxed">{description}</p>
      )}

      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-success' : 'text-muted'}`}>
          {trendUp
            ? <TrendingUp size={12} aria-hidden="true" />
            : <TrendingDown size={12} aria-hidden="true" />
          }
          {trend}
        </div>
      )}
    </div>
  )
}
