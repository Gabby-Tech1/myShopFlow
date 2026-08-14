import type { CurrencyCode } from '@/types'
import { money, moneyCompact } from '@/lib/format'
import { cn } from '@/lib/utils'

interface MoneyProps {
  value: number
  code?: CurrencyCode
  compact?: boolean
  className?: string
  /** Colour by sign: inflow green / outflow brick. Always paired with sign, never colour-only. */
  signed?: boolean
  decimals?: number
}

export function Money({ value, code = 'GHS', compact, className, signed, decimals }: MoneyProps) {
  const text = compact ? moneyCompact(value, code) : money(value, code, { decimals })
  return (
    <span
      className={cn(
        'tnum tabular-nums',
        signed && (value > 0 ? 'text-inflow' : value < 0 ? 'text-brick' : 'text-ink'),
        className,
      )}
    >
      {signed && value > 0 ? '+' : ''}
      {text}
    </span>
  )
}
