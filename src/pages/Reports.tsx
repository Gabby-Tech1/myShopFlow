import { useMemo, useState } from 'react'
import { Download, Sparkles } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Segmented } from '@/components/ui/Segmented'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHero } from '@/components/ui/PageHero'
import { toast } from '@/store/toast'
import { money } from '@/lib/format'
import { fmtDate, rangeFor, type RangeKey } from '@/lib/datetime'
import { cn } from '@/lib/utils'
import {
  bestSalesDay,
  bestSeller,
  cashByType,
  inventoryValue,
  lowStock,
  moneyInOut,
  openingCashFor,
  profitSummary,
  retailValue,
  revenueOf,
  salesInRange,
  selectLedger,
  stockStatus,
  totalOutstanding,
  unitsSold,
} from '@/store/selectors'
import { inRange } from '@/lib/datetime'

type ReportKey = 'sales' | 'inventory' | 'expenses' | 'cashflow' | 'profit' | 'outstanding'

const REPORTS: { key: ReportKey; label: string; question: string }[] = [
  { key: 'sales', label: 'Sales', question: 'How much did we sell and what moved?' },
  { key: 'profit', label: 'Profit', question: 'Did the business actually make money?' },
  { key: 'cashflow', label: 'Cash Flow', question: 'Where did money come from and where did it go?' },
  { key: 'expenses', label: 'Expenses', question: 'Where is money going?' },
  { key: 'inventory', label: 'Inventory', question: 'What do we have and what needs attention?' },
  { key: 'outstanding', label: 'Outstanding', question: 'Who still owes the business?' },
]

export function ReportsPage() {
  const store = useStore()
  const [report, setReport] = useState<ReportKey>('sales')
  const [rangeKey, setRangeKey] = useState<RangeKey>('month')
  const range = rangeFor(rangeKey)
  const meta = REPORTS.find((r) => r.key === report)!

  const exportCsv = (rows: Record<string, unknown>[], name: string) => {
    if (!rows.length) return toast.info('Nothing to export', 'No rows for the selected period.')
    const headers = Object.keys(rows[0])
    const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name}-${range.key}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported', `${name} report (${range.label}) downloaded as CSV.`)
  }

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Business intelligence" title="Reports that answer real questions" description="Explore performance, understand trends and export the details when you need them." />
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-3 ring-1 ring-black/[0.06] shadow-card lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {REPORTS.map((r) => (
            <button
              key={r.key}
              onClick={() => setReport(r.key)}
              className={cn('chip border shrink-0', report === r.key ? 'bg-ink text-white border-ink' : 'bg-paper border-hair text-ink-soft hover:border-ink/30')}
            >
              {r.label}
            </button>
          ))}
        </div>
        <Segmented
          size="sm"
          options={[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: 'last_month', label: 'Last Mo.' },
            { value: 'year', label: 'Year' },
          ]}
          value={rangeKey}
          onChange={(v) => setRangeKey(v as RangeKey)}
        />
      </div>

      <div className="flex items-center justify-between border-b border-hair pb-4">
        <div>
          <p className="eyebrow mb-1">Selected analysis</p>
          <h2 className="text-xl font-extrabold text-ink">{meta.label} report</h2>
          <p className="text-sm text-ink-soft">{meta.question} · <span className="font-medium text-ink">{range.label}</span></p>
        </div>
      </div>

      {report === 'sales' && <SalesReport range={range} onExport={exportCsv} />}
      {report === 'profit' && <ProfitReport range={range} />}
      {report === 'cashflow' && <CashFlowReport range={range} />}
      {report === 'expenses' && <ExpensesReport range={range} onExport={exportCsv} />}
      {report === 'inventory' && <InventoryReport onExport={exportCsv} />}
      {report === 'outstanding' && <OutstandingReport onExport={exportCsv} />}
    </div>
  )
}

function Summary({ children }: { children: React.ReactNode }) {
  return (
    <Card className="flex items-start gap-3 p-4">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-canary-100 text-canary-700"><Sparkles className="h-4 w-4" /></span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">What this means</p>
        <p className="mt-0.5 text-sm font-medium leading-relaxed text-ink">{children}</p>
      </div>
    </Card>
  )
}

function Callouts({ items }: { items: { label: string; value: string; tone?: 'good' | 'watch' }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((i) => (
        <div key={i.label} className="rounded-2xl border border-hair bg-paper p-4 shadow-card">
          <p className="text-xs text-ink-soft">{i.label}</p>
          <p className={cn('mt-1 text-lg font-bold tnum', i.tone === 'watch' ? 'text-brick-600' : i.tone === 'good' ? 'text-inflow' : 'text-ink')}>{i.value}</p>
        </div>
      ))}
    </div>
  )
}

function ExportBar({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-end">
      <Button size="sm" variant="outline" onClick={onClick}><Download className="h-4 w-4" /> Export CSV</Button>
    </div>
  )
}

function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  if (!rows.length) return <EmptyState title="No records for this period" className="py-10" />
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-hair text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
            {headers.map((h, i) => <th key={i} className={cn('px-4 py-2.5', i === headers.length - 1 && 'text-right')}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-hair last:border-0 hover:bg-black/[0.015]">
              {r.map((cell, j) => <td key={j} className={cn('px-4 py-3', j === r.length - 1 && 'text-right')}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

// ---- individual reports ---------------------------------------------------

function SalesReport({ range, onExport }: { range: ReturnType<typeof rangeFor>; onExport: (r: Record<string, unknown>[], n: string) => void }) {
  const store = useStore()
  const sales = salesInRange(store.sales, range)
  const prev = salesInRange(store.sales, rangeFor('last_month'))
  const rev = revenueOf(sales)
  const prevRev = revenueOf(prev)
  const delta = prevRev > 0 ? ((rev - prevRev) / prevRev) * 100 : undefined
  const seller = bestSeller(sales)
  const day = bestSalesDay(sales)
  const methods = sales.reduce<Record<string, number>>((m, s) => ({ ...m, [s.paymentMethod]: (m[s.paymentMethod] ?? 0) + s.total }), {})
  const wholesaleRev = revenueOf(sales.filter((s) => s.tier === 'wholesale'))
  const retailRev = +(rev - wholesaleRev).toFixed(2)
  const wsShare = rev > 0 ? (wholesaleRev / rev) * 100 : 0
  const wsOrders = sales.filter((s) => s.tier === 'wholesale').length

  return (
    <div className="space-y-4">
      <Summary>
        You made {money(rev)} in sales {range.label.toLowerCase()}{delta !== undefined ? `, ${delta >= 0 ? 'higher' : 'lower'} than last month by ${Math.abs(delta).toFixed(0)}%` : ''}. {wholesaleRev > 0 ? `Wholesale made up ${wsShare.toFixed(0)}% of that. ` : ''}{seller ? `${seller.name} was your best seller` : ''}{day ? `, and ${new Date(day.date).toLocaleDateString('en-GB', { weekday: 'long' })} was your highest-sales day.` : '.'}
      </Summary>
      <Callouts items={[
        { label: 'Total sales', value: money(rev) },
        { label: 'Units sold', value: String(unitsSold(sales)) },
        { label: 'Transactions', value: String(sales.length) },
        { label: 'vs last month', value: delta !== undefined ? `${delta >= 0 ? '+' : ''}${delta.toFixed(0)}%` : '-', tone: delta && delta < 0 ? 'watch' : 'good' },
      ]} />

      {/* Retail vs wholesale channel split */}
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-ink">Sales by channel</h3>
          <span className="text-xs text-ink-soft">{wsOrders} wholesale order{wsOrders === 1 ? '' : 's'}</span>
        </div>
        <div className="mb-2 flex h-2.5 overflow-hidden rounded-full bg-canvas">
          <div className="h-full bg-ink" style={{ width: `${100 - wsShare}%` }} />
          <div className="h-full bg-canary" style={{ width: `${wsShare}%` }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-canvas p-3 ring-1 ring-line">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft"><span className="h-2 w-2 rounded-full bg-ink" /> Retail · {(100 - wsShare).toFixed(0)}%</div>
            <p className="mt-1 text-lg font-bold text-ink tnum">{money(retailRev)}</p>
          </div>
          <div className="rounded-xl bg-canary-50 p-3 ring-1 ring-canary-500/20">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft"><span className="h-2 w-2 rounded-full bg-canary" /> Wholesale · {wsShare.toFixed(0)}%</div>
            <p className="mt-1 text-lg font-bold text-ink tnum">{money(wholesaleRev)}</p>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {Object.entries(methods).map(([m, v]) => <Badge key={m} tone="neutral">{m.toUpperCase()}: {money(v)}</Badge>)}
      </div>
      <ExportBar onClick={() => onExport(sales.map((s) => ({ receipt: s.receiptNo, date: fmtDate(s.createdAt), items: s.items.length, channel: s.tier ?? 'retail', method: s.paymentMethod, paid: s.paid ? 'Yes' : 'Credit', total: s.total })), 'sales')} />
      <DataTable
        headers={['Receipt', 'Date', 'Channel', 'Method', 'Total']}
        rows={sales.slice().reverse().slice(0, 30).map((s) => [s.receiptNo, fmtDate(s.createdAt), <Badge tone={s.tier === 'wholesale' ? 'canary' : 'neutral'}>{(s.tier ?? 'retail').toUpperCase()}</Badge>, <Badge tone={s.paid ? 'inflow' : 'warn'}>{s.paid ? s.paymentMethod.toUpperCase() : 'CREDIT'}</Badge>, <span className="font-semibold tnum">{money(s.total)}</span>])}
      />
    </div>
  )
}

function ProfitReport({ range }: { range: ReturnType<typeof rangeFor> }) {
  const store = useStore()
  const sales = salesInRange(store.sales, range)
  const p = profitSummary(sales, store.expenses, range)
  return (
    <div className="space-y-4">
      <Summary>
        On {money(p.revenue)} of sales, goods cost {money(p.cogs)} and expenses were {money(p.expenses)}, leaving a net profit of {money(p.netProfit)} - a {p.margin}% margin.
      </Summary>
      <Callouts items={[
        { label: 'Revenue', value: money(p.revenue) },
        { label: 'Gross profit', value: money(p.grossProfit), tone: 'good' },
        { label: 'Net profit', value: money(p.netProfit), tone: p.netProfit >= 0 ? 'good' : 'watch' },
        { label: 'Margin', value: `${p.margin}%` },
      ]} />
      <Card className="p-5">
        <div className="space-y-2 text-sm">
          <Line label="Sales revenue" value={money(p.revenue)} />
          <Line label="Cost of goods sold" value={`− ${money(p.cogs)}`} muted />
          <Line label="Gross profit" value={money(p.grossProfit)} strong />
          <Line label="Operating expenses" value={`− ${money(p.expenses)}`} muted />
          <div className="border-t border-hair pt-2"><Line label="Net profit" value={money(p.netProfit)} strong big /></div>
        </div>
      </Card>
    </div>
  )
}

function CashFlowReport({ range }: { range: ReturnType<typeof rangeFor> }) {
  const store = useStore()
  const ledger = selectLedger()
  const flow = moneyInOut(ledger, range)
  const byType = cashByType(ledger, range)
  const opening = openingCashFor(ledger, range, store.openingCash)
  const closing = +(opening + flow.net).toFixed(2)
  return (
    <div className="space-y-4">
      <Summary>
        {money(flow.in)} entered the business and {money(flow.out)} left it {range.label.toLowerCase()}. Net cash flow was {money(flow.net)}. Opening cash {money(opening)} + in − out = closing cash {money(closing)}.
      </Summary>
      <Callouts items={[
        { label: 'Money in', value: money(flow.in), tone: 'good' },
        { label: 'Money out', value: money(flow.out), tone: 'watch' },
        { label: 'Net cash flow', value: money(flow.net) },
        { label: 'Closing cash', value: money(closing) },
      ]} />
      <div className="grid gap-3 sm:grid-cols-3">
        {(['operating', 'investing', 'financing'] as const).map((t) => (
          <Card key={t} className="p-4">
            <p className="text-sm font-bold capitalize text-ink">{t}</p>
            <div className="mt-2 space-y-1 text-sm">
              <Line label="In" value={money(byType[t].in)} />
              <Line label="Out" value={money(byType[t].out)} />
              <Line label="Net" value={money(byType[t].net)} strong />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ExpensesReport({ range, onExport }: { range: ReturnType<typeof rangeFor>; onExport: (r: Record<string, unknown>[], n: string) => void }) {
  const store = useStore()
  const expenses = store.expenses.filter((e) => inRange(e.createdAt, range))
  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const byCat = expenses.reduce<Record<string, number>>((m, e) => ({ ...m, [e.category]: (m[e.category] ?? 0) + e.amount }), {})
  const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])
  const largest = expenses.slice().sort((a, b) => b.amount - a.amount)[0]
  return (
    <div className="space-y-4">
      <Summary>
        You spent {money(total)} {range.label.toLowerCase()} across {top.length} categor{top.length === 1 ? 'y' : 'ies'}. {top[0] ? `${top[0][0]} was the highest at ${money(top[0][1])}.` : ''}
      </Summary>
      <Callouts items={[
        { label: 'Total expenses', value: money(total), tone: 'watch' },
        { label: 'Categories', value: String(top.length) },
        { label: 'Highest category', value: top[0] ? top[0][0] : '-' },
        { label: 'Largest expense', value: largest ? money(largest.amount) : '-' },
      ]} />
      <div className="space-y-2">
        {top.map(([cat, amt]) => (
          <div key={cat} className="rounded-xl border border-hair bg-paper p-3">
            <div className="mb-1.5 flex justify-between text-sm"><span className="font-medium text-ink">{cat}</span><span className="font-semibold tnum">{money(amt)}</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-black/[0.05]"><div className="h-full rounded-full bg-brick" style={{ width: `${(amt / total) * 100}%` }} /></div>
          </div>
        ))}
      </div>
      <ExportBar onClick={() => onExport(expenses.map((e) => ({ date: fmtDate(e.createdAt), category: e.category, method: e.method, note: e.note ?? '', amount: e.amount })), 'expenses')} />
    </div>
  )
}

function InventoryReport({ onExport }: { onExport: (r: Record<string, unknown>[], n: string) => void }) {
  const store = useStore()
  const products = store.products
  const low = lowStock(products)
  return (
    <div className="space-y-4">
      <Summary>
        You hold {money(inventoryValue(products))} of stock at cost ({money(retailValue(products))} at sale price). {low.length} product{low.length === 1 ? '' : 's'} need attention.
      </Summary>
      <Callouts items={[
        { label: 'Inventory value', value: money(inventoryValue(products)) },
        { label: 'Retail value', value: money(retailValue(products)) },
        { label: 'Products', value: String(products.length) },
        { label: 'Low / out', value: String(low.length), tone: 'watch' },
      ]} />
      <ExportBar onClick={() => onExport(products.map((p) => ({ name: p.name, sku: p.sku, stock: p.stock, cost: p.costPrice, price: p.salePrice, value: p.costPrice * p.stock, status: stockStatus(p) })), 'inventory')} />
      <DataTable
        headers={['Product', 'Stock', 'Status', 'Value']}
        rows={products.slice().sort((a, b) => a.stock - b.stock).slice(0, 30).map((p) => [p.name, <span className="tnum">{p.stock}</span>, <Badge tone={stockStatus(p) === 'out' ? 'danger' : stockStatus(p) === 'low' ? 'warn' : 'inflow'}>{stockStatus(p)}</Badge>, <span className="font-semibold tnum">{money(p.costPrice * p.stock)}</span>])}
      />
    </div>
  )
}

function OutstandingReport({ onExport }: { onExport: (r: Record<string, unknown>[], n: string) => void }) {
  const store = useStore()
  const owing = store.customers.filter((c) => c.outstanding > 0).sort((a, b) => b.outstanding - a.outstanding)
  const total = totalOutstanding(store.customers)
  const received = store.payments.reduce((s, p) => s + p.amount, 0)
  return (
    <div className="space-y-4">
      <Summary>
        {owing.length} customer{owing.length === 1 ? '' : 's'} owe you {money(total)} in total. You have received {money(received)} in customer payments so far.
      </Summary>
      <Callouts items={[
        { label: 'Total outstanding', value: money(total), tone: 'watch' },
        { label: 'Customers owing', value: String(owing.length) },
        { label: 'Payments received', value: money(received), tone: 'good' },
        { label: 'Largest balance', value: owing[0] ? money(owing[0].outstanding) : '-' },
      ]} />
      <ExportBar onClick={() => onExport(owing.map((c) => ({ name: c.name, phone: c.phone, outstanding: c.outstanding })), 'outstanding')} />
      <DataTable
        headers={['Customer', 'Phone', 'Owes']}
        rows={owing.map((c) => [c.name, <span className="text-ink-soft">{c.phone}</span>, <span className="font-semibold text-brick-600 tnum">{money(c.outstanding)}</span>])}
      />
    </div>
  )
}

function Line({ label, value, muted, strong, big }: { label: string; value: string; muted?: boolean; strong?: boolean; big?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn(muted ? 'text-ink-soft' : 'text-ink', strong && 'font-semibold')}>{label}</span>
      <span className={cn('tnum', strong && 'font-bold', big && 'text-lg', muted ? 'text-ink-soft' : 'text-ink')}>{value}</span>
    </div>
  )
}
