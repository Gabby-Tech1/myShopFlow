import type { PriceTier, Product, UnitOfMeasure } from '@/types'

export const UNIT_LABEL: Record<UnitOfMeasure, { abbr: string; name: string }> = {
  each: { abbr: 'ea', name: 'each' },
  pack: { abbr: 'pack', name: 'pack' },
  carton: { abbr: 'ctn', name: 'carton' },
  box: { abbr: 'box', name: 'box' },
  dozen: { abbr: 'dz', name: 'dozen' },
  kg: { abbr: 'kg', name: 'kilogram' },
  g: { abbr: 'g', name: 'gram' },
  litre: { abbr: 'L', name: 'litre' },
  ml: { abbr: 'ml', name: 'millilitre' },
  metre: { abbr: 'm', name: 'metre' },
  pair: { abbr: 'pr', name: 'pair' },
  set: { abbr: 'set', name: 'set' },
}

export const UNIT_OPTIONS: UnitOfMeasure[] = [
  'each', 'pack', 'carton', 'box', 'dozen', 'kg', 'g', 'litre', 'ml', 'metre', 'pair', 'set',
]

export function unitAbbr(u?: UnitOfMeasure): string {
  return u ? UNIT_LABEL[u].abbr : 'ea'
}

export function unitName(u?: UnitOfMeasure): string {
  return u ? UNIT_LABEL[u].name : 'each'
}

/** Whether a product has a usable wholesale price. */
export function hasWholesale(p: Pick<Product, 'wholesalePrice'>): boolean {
  return typeof p.wholesalePrice === 'number' && p.wholesalePrice > 0
}

/**
 * The unit price for a product at a given tier and quantity. Wholesale applies
 * only when the tier is wholesale, a wholesale price exists, AND the quantity
 * meets the wholesale minimum. Otherwise it falls back to retail.
 */
export function priceFor(p: Product, tier: PriceTier, qty = 1): number {
  if (tier === 'wholesale' && hasWholesale(p) && qty >= (p.wholesaleMinQty ?? 1)) {
    return p.wholesalePrice as number
  }
  return p.salePrice
}

/** The tier actually applied for the given product/qty (may downgrade to retail). */
export function tierApplied(p: Product, tier: PriceTier, qty = 1): PriceTier {
  return tier === 'wholesale' && hasWholesale(p) && qty >= (p.wholesaleMinQty ?? 1)
    ? 'wholesale'
    : 'retail'
}
