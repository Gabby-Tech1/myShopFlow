import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { Product } from '@/types'
import { stockStatus } from '@/store/selectors'

type Tone = 'canary' | 'brick' | 'inflow' | 'info' | 'warn' | 'danger' | 'neutral'

const tones: Record<Tone, string> = {
  canary: 'bg-canary-50 text-canary-700 ring-1 ring-canary-500/20',
  brick: 'bg-brick-50 text-brick-600 ring-1 ring-brick-500/20',
  inflow: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/15',
  info: 'bg-blue-50 text-blue-700 ring-1 ring-blue-500/15',
  warn: 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/15',
  danger: 'bg-red-50 text-red-700 ring-1 ring-red-500/15',
  neutral: 'bg-canvas text-ink-soft ring-1 ring-hair',
}

export function Badge({
  children,
  tone = 'neutral',
  className,
  dot,
}: {
  children: ReactNode
  tone?: Tone
  className?: string
  dot?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
        tones[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

/** Stock status pill - uses icon+label+colour, never colour alone (spec §8). */
export function StockPill({ product }: { product: Product }) {
  const status = stockStatus(product)
  if (status === 'out') return <Badge tone="danger" dot>Out of stock</Badge>
  if (status === 'low') return <Badge tone="warn" dot>Low · {product.stock} left</Badge>
  return <Badge tone="inflow" dot>In stock · {product.stock}</Badge>
}
