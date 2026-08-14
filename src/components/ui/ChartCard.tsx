import type { ReactNode } from 'react'
import { Card, CardHeader } from './Card'
import { EmptyState } from './EmptyState'
import { cn } from '@/lib/utils'

interface ChartCardProps {
  title: ReactNode
  term?: string
  /** Plain-language summary — charts never stand alone (spec §2). */
  summary: ReactNode
  action?: ReactNode
  children: ReactNode
  /** When there is no data, show this instead of an empty chart (spec §8). */
  empty?: boolean
  emptyLabel?: string
  className?: string
  height?: number
}

export function ChartCard({
  title,
  term,
  summary,
  action,
  children,
  empty,
  emptyLabel = 'No activity recorded for this period.',
  className,
  height = 260,
}: ChartCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader title={title} term={term} action={action} />
      {/* The summary reads first — a quiet lead line, not a loud colored box. */}
      <p className="mx-5 mt-2.5 border-l-2 border-canary pl-3 text-[13px] leading-relaxed text-ink-soft">
        {summary}
      </p>
      <div className="px-2 pb-4 pt-3 sm:px-4" style={{ minHeight: height }}>
        {empty ? (
          <EmptyState title={emptyLabel} className="py-10" />
        ) : (
          <div style={{ height }}>{children}</div>
        )}
      </div>
    </Card>
  )
}

/** Shared Recharts tooltip — exact-value, plain-language (spec §4). */
export function chartTooltipStyle() {
  return {
    contentStyle: {
      borderRadius: 12,
      border: 'none',
      boxShadow: '0 12px 48px -12px rgba(18,20,26,0.22)',
      fontSize: 13,
      padding: '10px 14px',
    },
    labelStyle: { color: '#9AA1AD', fontWeight: 700, marginBottom: 4, fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.04em' },
    cursor: { fill: 'rgba(18,20,26,0.03)' },
  }
}
