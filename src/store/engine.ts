import type {
  CashDirection,
  CashSource,
  CashTxn,
  CashType,
  Customer,
  CustomerPayment,
  Expense,
  Sale,
  StockPurchase,
} from '@/types'

// ---------------------------------------------------------------------------
// The cash ledger is DERIVED from source records, never stored as the source of
// truth. This makes the reconciliation invariant impossible to break:
//   Closing = Opening + Σ inflows − Σ outflows   (spec §8)
// Pure-cash records that have no other home (assets, owner funds, loans, manual
// adjustments) live in `cashEvents`.
// ---------------------------------------------------------------------------

/** A stored cash-only record (financing, investing, manual adjustment). */
export interface CashEvent {
  id: string
  createdAt: string
  type: CashType
  direction: CashDirection
  amount: number
  category: string
  source: CashSource
  userId: string
  description: string
  sourceId?: string
}

interface LedgerSources {
  openingCash: number
  sales: Sale[]
  payments: CustomerPayment[]
  expenses: Expense[]
  purchases: StockPurchase[]
  cashEvents: CashEvent[]
}

type Raw = Omit<CashTxn, 'balanceAfter'>

/** Build the full, chronologically-ordered cash ledger with running balances. */
export function buildLedger(s: LedgerSources): CashTxn[] {
  const raw: Raw[] = []

  // Paid sales → operating inflow (credit sales add NO cash - spec §8).
  for (const sale of s.sales) {
    if (sale.paid && sale.amountPaid > 0) {
      raw.push({
        id: `cf_${sale.id}`,
        createdAt: sale.createdAt,
        type: 'operating',
        direction: 'in',
        amount: sale.amountPaid,
        category: 'Sales',
        method: sale.paymentMethod === 'credit' ? 'cash' : sale.paymentMethod,
        source: 'sale',
        sourceId: sale.id,
        userId: sale.userId,
        description: `Sale ${sale.receiptNo}`,
      })
    }
  }

  // Customer payments toward outstanding → operating inflow.
  for (const p of s.payments) {
    raw.push({
      id: `cf_${p.id}`,
      createdAt: p.createdAt,
      type: 'operating',
      direction: 'in',
      amount: p.amount,
      category: 'Customer Payment',
      method: p.method,
      source: 'customer_payment',
      sourceId: p.id,
      userId: p.userId,
      description: 'Customer payment received',
    })
  }

  // Expenses → operating outflow.
  for (const e of s.expenses) {
    raw.push({
      id: `cf_${e.id}`,
      createdAt: e.createdAt,
      type: 'operating',
      direction: 'out',
      amount: e.amount,
      category: e.category,
      method: e.method,
      source: 'expense',
      sourceId: e.id,
      userId: e.userId,
      description: `${e.category} expense`,
    })
  }

  // Paid stock purchases → operating outflow.
  for (const pu of s.purchases) {
    if (pu.paid) {
      raw.push({
        id: `cf_${pu.id}`,
        createdAt: pu.createdAt,
        type: 'operating',
        direction: 'out',
        amount: pu.total,
        category: 'Stock Purchase',
        method: pu.method,
        source: 'stock_purchase',
        sourceId: pu.id,
        userId: pu.userId,
        description: `Restock - ${pu.productName}`,
      })
    }
  }

  // Cash-only events (investing / financing / adjustment).
  for (const c of s.cashEvents) {
    raw.push({
      id: `cf_${c.id}`,
      createdAt: c.createdAt,
      type: c.type,
      direction: c.direction,
      amount: c.amount,
      category: c.category,
      method: 'cash',
      source: c.source,
      sourceId: c.sourceId ?? c.id,
      userId: c.userId,
      description: c.description,
    })
  }

  raw.sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  let balance = s.openingCash
  return raw.map((r) => {
    balance += r.direction === 'in' ? r.amount : -r.amount
    return { ...r, balanceAfter: +balance.toFixed(2) }
  })
}

export function cashBalanceFrom(ledger: CashTxn[], openingCash: number): number {
  return ledger.length ? ledger[ledger.length - 1].balanceAfter : openingCash
}

/** Cost of goods sold for a set of sales (uses cost captured at sale time). */
export function cogsOf(sales: Sale[]): number {
  return sales.reduce(
    (sum, sale) => sum + sale.items.reduce((s, it) => s + it.unitCost * it.qty, 0),
    0,
  )
}

export function lastVisitPatch(customer: Customer, when: string): Customer {
  return { ...customer, lastVisit: when }
}
