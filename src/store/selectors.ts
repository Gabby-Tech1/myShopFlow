import { format, parseISO } from 'date-fns'
import type { CashTxn, CashType, Customer, Expense, Product, Sale } from '@/types'
import { buildLedger, cashBalanceFrom, cogsOf } from './engine'
import type { DateRange } from '@/lib/datetime'
import { inRange } from '@/lib/datetime'
import { useStore } from './useStore'

// ----- money ledger --------------------------------------------------------

export function selectLedger(): CashTxn[] {
  const s = useStore.getState()
  return buildLedger({
    openingCash: s.openingCash,
    sales: s.sales,
    payments: s.payments,
    expenses: s.expenses,
    purchases: s.purchases,
    cashEvents: s.cashEvents,
  })
}

export function selectCashBalance(): number {
  const s = useStore.getState()
  return cashBalanceFrom(selectLedger(), s.openingCash)
}

// ----- inventory -----------------------------------------------------------

export function inventoryValue(products: Product[]): number {
  return +products.reduce((sum, p) => sum + p.costPrice * p.stock, 0).toFixed(2)
}

export function retailValue(products: Product[]): number {
  return +products.reduce((sum, p) => sum + p.salePrice * p.stock, 0).toFixed(2)
}

export function stockStatus(p: Product): 'out' | 'low' | 'ok' {
  if (p.stock <= 0) return 'out'
  if (p.stock <= p.threshold) return 'low'
  return 'ok'
}

/** Units of a product at a specific location. */
export function stockAt(p: Product, locId: string): number {
  return p.stockByLocation ? p.stockByLocation[locId] ?? 0 : p.stock
}

/** Stock status at a location. The threshold is shared, evenly split by location count. */
export function stockStatusAt(p: Product, locId: string, locationCount = 1): 'out' | 'low' | 'ok' {
  const qty = stockAt(p, locId)
  const perLocThreshold = Math.max(1, Math.ceil(p.threshold / Math.max(1, locationCount)))
  if (qty <= 0) return 'out'
  if (qty <= perLocThreshold) return 'low'
  return 'ok'
}

export function lowStock(products: Product[]): Product[] {
  return products.filter((p) => stockStatus(p) !== 'ok').sort((a, b) => a.stock - b.stock)
}

/** Products low or out at a given location. */
export function lowStockAt(products: Product[], locId: string, locationCount = 1): Product[] {
  return products
    .filter((p) => stockStatusAt(p, locId, locationCount) !== 'ok')
    .sort((a, b) => stockAt(a, locId) - stockAt(b, locId))
}

export function totalOutstanding(customers: Customer[]): number {
  return +customers.reduce((s, c) => s + c.outstanding, 0).toFixed(2)
}

// ----- period sales / profit ----------------------------------------------

export function salesInRange(sales: Sale[], range: DateRange): Sale[] {
  return sales.filter((s) => inRange(s.createdAt, range))
}

export function expensesInRange(expenses: Expense[], range: DateRange): number {
  return +expenses.filter((e) => inRange(e.createdAt, range)).reduce((s, e) => s + e.amount, 0).toFixed(2)
}

export function revenueOf(sales: Sale[]): number {
  return +sales.reduce((s, sale) => s + sale.total, 0).toFixed(2)
}

export function unitsSold(sales: Sale[]): number {
  return sales.reduce((n, s) => n + s.items.reduce((a, it) => a + it.qty, 0), 0)
}

export interface ProfitSummary {
  revenue: number
  cogs: number
  grossProfit: number
  expenses: number
  netProfit: number
  margin: number
}

export function profitSummary(sales: Sale[], expenses: Expense[], range: DateRange): ProfitSummary {
  const revenue = revenueOf(sales)
  const cogs = +cogsOf(sales).toFixed(2)
  const grossProfit = +(revenue - cogs).toFixed(2)
  const exp = expensesInRange(expenses, range)
  const netProfit = +(grossProfit - exp).toFixed(2)
  const margin = revenue > 0 ? +((netProfit / revenue) * 100).toFixed(1) : 0
  return { revenue, cogs, grossProfit, expenses: exp, netProfit, margin }
}

// ----- superlatives (best seller / day / month) ---------------------------

export function bestSeller(sales: Sale[]): { name: string; units: number } | null {
  const tally: Record<string, number> = {}
  sales.forEach((s) => s.items.forEach((it) => (tally[it.name] = (tally[it.name] ?? 0) + it.qty)))
  const entries = Object.entries(tally).sort((a, b) => b[1] - a[1])
  return entries.length ? { name: entries[0][0], units: entries[0][1] } : null
}

export function bestCategory(sales: Sale[], products: Product[], categories: { id: string; name: string }[]): { name: string; total: number } | null {
  const prodCat: Record<string, string> = {}
  products.forEach((p) => (prodCat[p.id] = p.categoryId))
  const catName: Record<string, string> = {}
  categories.forEach((c) => (catName[c.id] = c.name))
  const tally: Record<string, number> = {}
  sales.forEach((s) =>
    s.items.forEach((it) => {
      const cat = catName[prodCat[it.productId]] ?? 'Other'
      tally[cat] = (tally[cat] ?? 0) + it.lineTotal
    }),
  )
  const entries = Object.entries(tally).sort((a, b) => b[1] - a[1])
  return entries.length ? { name: entries[0][0], total: +entries[0][1].toFixed(2) } : null
}

export function bestSalesDay(sales: Sale[]): { date: string; total: number } | null {
  const tally: Record<string, number> = {}
  sales.forEach((s) => {
    const d = format(parseISO(s.createdAt), 'yyyy-MM-dd')
    tally[d] = (tally[d] ?? 0) + s.total
  })
  const entries = Object.entries(tally).sort((a, b) => b[1] - a[1])
  return entries.length ? { date: entries[0][0], total: +entries[0][1].toFixed(2) } : null
}

export function bestMonth(sales: Sale[]): { month: string; total: number } | null {
  const tally: Record<string, number> = {}
  sales.forEach((s) => {
    const d = format(parseISO(s.createdAt), 'yyyy-MM')
    tally[d] = (tally[d] ?? 0) + s.total
  })
  const entries = Object.entries(tally).sort((a, b) => b[1] - a[1])
  if (!entries.length) return null
  return { month: format(parseISO(entries[0][0] + '-01'), 'MMMM yyyy'), total: +entries[0][1].toFixed(2) }
}

// ----- trend series --------------------------------------------------------

export interface TrendPoint {
  label: string
  key: string
  sales: number
  profit: number
}

/** Build a bucketed trend series for the given range. */
export function salesTrend(sales: Sale[], range: DateRange): TrendPoint[] {
  const spanDays = (range.to.getTime() - range.from.getTime()) / 86_400_000
  const byDay = spanDays <= 62
  const fmt = byDay ? 'yyyy-MM-dd' : 'yyyy-MM'
  const labelFmt = byDay ? 'd MMM' : 'MMM'
  const buckets: Record<string, { sales: number; cogs: number }> = {}
  const scoped = salesInRange(sales, range)
  scoped.forEach((s) => {
    const key = format(parseISO(s.createdAt), fmt)
    const b = (buckets[key] ??= { sales: 0, cogs: 0 })
    b.sales += s.total
    b.cogs += s.items.reduce((a, it) => a + it.unitCost * it.qty, 0)
  })
  return Object.keys(buckets)
    .sort()
    .map((key) => ({
      key,
      label: format(parseISO(byDay ? key : key + '-01'), labelFmt),
      sales: +buckets[key].sales.toFixed(2),
      profit: +(buckets[key].sales - buckets[key].cogs).toFixed(2),
    }))
}

// ----- cash flow breakdown -------------------------------------------------

export interface FlowBucket {
  type: CashType
  in: number
  out: number
  net: number
}

export function cashByType(ledger: CashTxn[], range: DateRange): Record<CashType, FlowBucket> {
  const base = (type: CashType): FlowBucket => ({ type, in: 0, out: 0, net: 0 })
  const out: Record<CashType, FlowBucket> = {
    operating: base('operating'),
    investing: base('investing'),
    financing: base('financing'),
  }
  ledger
    .filter((t) => inRange(t.createdAt, range))
    .forEach((t) => {
      const b = out[t.type]
      if (t.direction === 'in') b.in += t.amount
      else b.out += t.amount
    })
  ;(['operating', 'investing', 'financing'] as CashType[]).forEach((k) => {
    out[k].in = +out[k].in.toFixed(2)
    out[k].out = +out[k].out.toFixed(2)
    out[k].net = +(out[k].in - out[k].out).toFixed(2)
  })
  return out
}

export function moneyInOut(ledger: CashTxn[], range: DateRange): { in: number; out: number; net: number } {
  let mIn = 0
  let mOut = 0
  ledger
    .filter((t) => inRange(t.createdAt, range))
    .forEach((t) => (t.direction === 'in' ? (mIn += t.amount) : (mOut += t.amount)))
  return { in: +mIn.toFixed(2), out: +mOut.toFixed(2), net: +(mIn - mOut).toFixed(2) }
}

export function openingCashFor(ledger: CashTxn[], range: DateRange, opening: number): number {
  // opening for the period = balance immediately before the first txn in range
  const before = ledger.filter((t) => t.createdAt < range.from.toISOString())
  return before.length ? before[before.length - 1].balanceAfter : opening
}
