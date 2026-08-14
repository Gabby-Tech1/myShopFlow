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
  accent?: 'canary' | 'brick' | 'ink' | 'inflow'
  className?: string
}

const iconTint = {
  canary: 'text-canary-600',
  brick: 'text-brick-500',
  ink: 'text-ink',
  inflow: 'text-inflow',
}

export function StatTile({ label, term, value, icon, hint, delta, accent = 'ink', className }: StatTileProps) {
  return (
    <div className={cn('group relative overflow-hidden rounded-2xl bg-paper ring-1 ring-black/[0.06] shadow-card p-5 transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-card-hover', className)}>
      <span className={cn('absolute inset-x-0 top-0 h-[3px] opacity-80', accent === 'canary' ? 'bg-canary' : accent === 'brick' ? 'bg-brick' : accent === 'inflow' ? 'bg-inflow' : 'bg-ink')} />
      <div className="flex items-center justify-between">
        <span className="flex items-center text-[13px] font-semibold text-ink-soft">
          {label}
          {term && <Explain term={term} />}
        </span>
        {icon && <span className={cn('grid h-9 w-9 place-items-center rounded-xl bg-canvas opacity-80 transition-opacity group-hover:opacity-100', iconTint[accent])}>{icon}</span>}
      </div>
      <div className="mt-4 text-[28px] font-extrabold leading-none tracking-tightest text-ink tnum">{value}</div>
      {(typeof delta === 'number' || hint) && (
        <div className="mt-2.5 flex items-center gap-2">
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
  )
}
