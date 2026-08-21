import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Explain } from './Explain'

interface StatTileProps {
  label: string
  term?: string
  value: ReactNode
  icon?: ReactNode
  hint?: string
  delta?: number // percentage vs previous period
  /** 'brick' tints the icon as an alert; other accents stay neutral (calmer look). */
  accent?: 'canary' | 'brick' | 'ink' | 'inflow'
  /** 'quiet' = smaller figure for secondary (e.g. financial) metrics. */
  emphasis?: 'strong' | 'quiet'
  className?: string
}

export function StatTile({ label, term, value, icon, hint, delta, accent = 'ink', emphasis = 'strong', className }: StatTileProps) {
  const alert = accent === 'brick'
  return (
    <div className={cn('group rounded-2xl bg-paper ring-1 ring-black/[0.06] shadow-card p-5 transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-card-hover', className)}>
      <div className="flex items-start gap-3.5">
        {/* Icon leads on the left, like the Inventory Health band. */}
        {icon && (
          <span
            className={cn(
              'grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 transition-colors',
              alert ? 'bg-brick-50 text-brick ring-brick-500/15' : 'bg-canvas text-ink ring-line group-hover:bg-ink group-hover:text-white group-hover:ring-ink',
            )}
          >
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          {/* The label is the headline — larger and bold, not the money. */}
          <span className="flex items-center text-[15px] font-bold text-ink">
            {label}
            {term && <Explain term={term} />}
          </span>
          <div
            className={cn(
              'mt-1 font-medium leading-none tracking-tight text-ink tnum',
              emphasis === 'quiet' ? 'text-[18px]' : 'text-[22px]',
            )}
          >
            {value}
          </div>
          {(typeof delta === 'number' || hint) && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {typeof delta === 'number' && (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold',
                    delta >= 0 ? 'bg-inflow/10 text-inflow' : 'bg-brick/10 text-brick',
                  )}
                >
                  {delta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(delta).toFixed(0)}%
                </span>
              )}
              {hint && <span className="text-[12px] text-ink-faint">{hint}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
