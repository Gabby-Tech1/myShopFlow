import type { CurrencyCode } from '@/types'
import { format, subDays } from 'date-fns'

// ---------------------------------------------------------------------------
// FX adapter (spec §9 / §16).
// DEMO source: bundled sample rates clearly labeled "Demo".
// The rest of the app only talks to this adapter, so a live provider can be
// dropped in later (backend → validate/normalize → cache) WITHOUT UI changes.
// ---------------------------------------------------------------------------

export const FX_MODE: 'demo' | 'live' = 'demo'
export const FX_PROVIDER = 'MyShopFlow Demo Rates'
export const FX_RATE_TYPE = 'Mid-Market Rate'

/** Reference rate expressed as GHS per 1 unit of the currency. Base = GHS. */
const BASE_RATES: Record<CurrencyCode, number> = {
  GHS: 1,
  USD: 11.9,
  EUR: 12.85,
  CNY: 1.64,
  TRY: 0.36,
  XOF: 0.0196,
}

/** Deterministic pseudo-random in [-1, 1] so demo history is stable per day. */
function noise(seed: number): number {
  const x = Math.sin(seed * 999.13) * 43758.5453
  return (x - Math.floor(x)) * 2 - 1
}

/** GHS per 1 unit of `code` on a given day offset (0 = today). */
function rateOnDay(code: CurrencyCode, dayOffset: number): number {
  const base = BASE_RATES[code]
  if (code === 'GHS') return 1
  const seedBase = code.charCodeAt(0) + code.charCodeAt(1) + code.charCodeAt(2)
  // gentle drift + daily wobble, ~1.5% amplitude
  const drift = 1 + dayOffset * 0.00035
  const wobble = 1 + noise(seedBase + dayOffset) * 0.012
  return +(base * drift * wobble).toFixed(4)
}

export function currentRate(code: CurrencyCode): number {
  return rateOnDay(code, 0)
}

/** Convert `amount` of `from` currency into `to` currency at reference rates. */
export function convert(amount: number, from: CurrencyCode, to: CurrencyCode, atDayOffset = 0): number {
  const inGhs = amount * rateOnDay(from, atDayOffset)
  return inGhs / rateOnDay(to, atDayOffset)
}

/** The direct pair rate: 1 `from` = X `to`. */
export function pairRate(from: CurrencyCode, to: CurrencyCode, atDayOffset = 0): number {
  return rateOnDay(from, atDayOffset) / rateOnDay(to, atDayOffset)
}

export type FxWindow = '1D' | '1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y'

const WINDOW_DAYS: Record<FxWindow, number> = {
  '1D': 1,
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  YTD: Math.max(1, Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86_400_000)),
  '1Y': 365,
}

export interface FxPoint {
  date: string // ISO date (day)
  label: string
  rate: number // `to` per 1 `from`
}

/** Historical series of `to` per 1 `from` for a time window (spec §9). */
export function series(from: CurrencyCode, to: CurrencyCode, window: FxWindow): FxPoint[] {
  const days = WINDOW_DAYS[window]
  const step = days <= 30 ? 1 : Math.ceil(days / 30)
  const out: FxPoint[] = []
  for (let d = days; d >= 0; d -= step) {
    const date = subDays(new Date(), d)
    out.push({
      date: date.toISOString(),
      label: format(date, days <= 7 ? 'EEE' : days <= 90 ? 'd MMM' : 'MMM'),
      rate: +(rateOnDay(from, -d) / rateOnDay(to, -d)).toFixed(4),
    })
  }
  return out
}

/** Rate for a specific historical date, with a note if the date was adjusted. */
export function rateForDate(
  from: CurrencyCode,
  to: CurrencyCode,
  date: Date,
): { rate: number; usedDate: Date; note?: string } {
  const now = new Date()
  const offset = Math.round((now.getTime() - date.getTime()) / 86_400_000)
  const clamped = Math.max(0, offset)
  const usedDate = clamped === offset ? date : now
  return {
    rate: +(rateOnDay(from, -clamped) / rateOnDay(to, -clamped)).toFixed(4),
    usedDate,
    note:
      clamped !== offset
        ? 'No future rate exists - showing the latest available reference rate.'
        : undefined,
  }
}

export const lastUpdatedLabel = () => format(new Date(), "d MMM yyyy · h:mm a")
