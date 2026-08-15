import type { CurrencyCode } from '@/types'

const CURRENCY_META: Record<CurrencyCode, { symbol: string; name: string; flag: string; locale: string }> = {
  GHS: { symbol: 'GH₵', name: 'Ghana Cedi', flag: '🇬🇭', locale: 'en-GH' },
  NGN: { symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬', locale: 'en-NG' },
  USD: { symbol: '$', name: 'US Dollar', flag: '🇺🇸', locale: 'en-US' },
  EUR: { symbol: '€', name: 'Euro', flag: '🇪🇺', locale: 'de-DE' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳', locale: 'zh-CN' },
  TRY: { symbol: '₺', name: 'Turkish Lira', flag: '🇹🇷', locale: 'tr-TR' },
  XOF: { symbol: 'CFA', name: 'West African CFA Franc', flag: '🇨🇮', locale: 'fr-FR' },
}

export function currencyMeta(code: CurrencyCode) {
  return CURRENCY_META[code]
}

/** Format money with the correct symbol and grouped, 2-decimal figures. */
export function money(amount: number, code: CurrencyCode = 'GHS', opts?: { decimals?: number }): string {
  const decimals = opts?.decimals ?? 2
  const meta = CURRENCY_META[code]
  const sign = amount < 0 ? '-' : ''
  const value = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return `${sign}${meta.symbol}${value}`
}

/** Compact money for tight spaces: GH₵18.4k */
export function moneyCompact(amount: number, code: CurrencyCode = 'GHS'): string {
  const meta = CURRENCY_META[code]
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}${meta.symbol}${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}${meta.symbol}${(abs / 1_000).toFixed(1)}k`
  return `${sign}${meta.symbol}${abs.toFixed(0)}`
}

export function number(n: number): string {
  return n.toLocaleString('en-US')
}

export function percent(n: number, decimals = 0): string {
  return `${n >= 0 ? '' : ''}${n.toFixed(decimals)}%`
}

/** Normalize a Ghanaian phone number where possible (spec §7). */
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/[^\d+]/g, '')
  if (digits.startsWith('+233')) digits = '0' + digits.slice(4)
  else if (digits.startsWith('233')) digits = '0' + digits.slice(3)
  if (/^0\d{9}$/.test(digits)) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  }
  return raw.trim()
}
