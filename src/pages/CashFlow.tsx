import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  Coins,
  Plus,
  ShoppingCart,
  Building2,
  Landmark,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatTile } from '@/components/ui/StatTile'
import { ChartCard, chartTooltipStyle } from '@/components/ui/ChartCard'
import { Badge } from '@/components/ui/Badge'
import { Money } from '@/components/ui/Money'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Explain } from '@/components/ui/Explain'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHero } from '@/components/ui/PageHero'
import { Segmented } from '@/components/ui/Segmented'
import { toast } from '@/store/toast'
import { money } from '@/lib/format'
import { fmtDateTime, rangeFor, type RangeKey } from '@/lib/datetime'
import { inRange } from '@/lib/datetime'
import type { CashType } from '@/types'
import {
  cashByType,
  moneyInOut,
  openingCashFor,
  profitSummary,
  revenueOf,
  salesInRange,
  selectCashBalance,
  selectLedger,
} from '@/store/selectors'

const TYPE_META: Record<CashType, { label: string; icon: React.ReactNode; blurb: string }> = {
  operating: { label: 'Operating', icon: <ShoppingCart className="h-4 w-4" />, blurb: 'Everyday business - sales, customer payments, wages and normal expenses.' },
  investing: { label: 'Investing', icon: <Building2 className="h-4 w-4" />, blurb: 'Buying or selling long-term assets like equipment, furniture or a vehicle.' },
  financing: { label: 'Financing', icon: <Landmark className="h-4 w-4" />, blurb: 'Funding the business or taking money out - owner funds, loans and withdrawals.' },
}

export function CashFlowPage() {
  const store = useStore()
  const [rangeKey, setRangeKey] = useState<RangeKey>('month')
  const [adjustOpen, setAdjustOpen] = useState(false)

  const range = rangeFor(rangeKey)
  const ledger = useMemo(() => selectLedger(), [store.sales, store.payments, store.expenses, store.purchases, store.cashEvents, store.openingCash])
  const byType = cashByType(ledger, range)
  const flow = moneyInOut(ledger, range)
  const opening = openingCashFor(ledger, range, store.openingCash)
  const closing = +(opening + flow.net).toFixed(2)
  const cashNow = selectCashBalance()

  const periodSales = salesInRange(store.sales, range)
  const profit = profitSummary(periodSales, store.expenses, range)

  const movements = useMemo(() => ledger.filter((t) => inRange(t.createdAt, range)).slice().reverse(), [ledger, range])

  const chartData = (['operating', 'investing', 'financing'] as CashType[]).map((t) => ({
    label: TYPE_META[t].label,
    In: byType[t].in,
    Out: byType[t].out,
    net: byType[t].net,
  }))

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Financial clarity" title="Follow every cedi through the business" description="Understand what came in, what went out and what remains-without accounting jargon." action={<Button size="sm" onClick={() => setAdjustOpen(true)} className='text-white'><Plus className="h-4 w-4" /> Add adjustment</Button>} />
      {/* Range */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">The record of money actually entering and leaving your business.</p>
        <div className="flex items-center gap-2">
          <Segmented
            size="sm"
            options={[
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
              { value: 'last_month', label: 'Last Mo.' },
              { value: 'year', label: 'Year' },
            ]}
            value={rangeKey}
            onChange={(v) => setRangeKey(v as RangeKey)}
          />
        </div>
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Revenue" term="Revenue" value={money(profit.revenue)} icon={<Coins className="h-5 w-5" />} hint={range.label.toLowerCase()} />
        <StatTile label="Net Profit" term="Net Profit" value={money(profit.netProfit)} icon={<TrendingUp className="h-5 w-5" />} accent="ink" />
        <StatTile label="Cash Balance" term="Cash Balance" value={money(cashNow)} icon={<Wallet className="h-5 w-5" />} accent="inflow" />
        <StatTile label="Net Cash Flow" term="Net Cash Flow" value={money(flow.net)} icon={flow.net >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />} accent={flow.net >= 0 ? 'inflow' : 'brick'} hint={range.label.toLowerCase()} />
      </div>

      {/* Money In vs Out */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">Money In vs Money Out</h3>
          <Badge tone={flow.net >= 0 ? 'inflow' : 'brick'} dot>Net {money(flow.net)}</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-emerald-50 p-4">
            <div className="flex items-center gap-2 text-emerald-700"><ArrowDownLeft className="h-5 w-5" /><span className="flex items-center text-sm font-semibold">Money In<Explain term="Money In" /></span></div>
            <p className="mt-2 text-2xl font-bold text-emerald-700 tnum">{money(flow.in)}</p>
          </div>
          <div className="rounded-2xl bg-brick-50 p-4">
            <div className="flex items-center gap-2 text-brick-600"><ArrowUpRight className="h-5 w-5" /><span className="flex items-center text-sm font-semibold">Money Out<Explain term="Money Out" /></span></div>
            <p className="mt-2 text-2xl font-bold text-brick-600 tnum">{money(flow.out)}</p>
          </div>
        </div>
        {/* Reconciliation */}
        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-canvas px-4 py-3 text-sm">
          <span className="flex items-center font-medium text-ink-soft">Opening<Explain term="Opening Cash" /></span>
          <span className="font-bold tnum">{money(opening)}</span>
          <span className="text-inflow">+ {money(flow.in)} in</span>
          <span className="text-brick">− {money(flow.out)} out</span>
          <span className="text-ink-soft">=</span>
          <span className="flex items-center font-medium text-ink-soft">Closing<Explain term="Closing Cash" /></span>
          <span className="font-bold tnum">{money(closing)}</span>
        </div>
      </Card>

      {/* Type breakdown chart */}
      <ChartCard
        title="Where cash moved"
        summary={cashFlowSummary(byType)}
        empty={flow.in === 0 && flow.out === 0}
        height={240}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} width={54} tickFormatter={(v) => money(v, 'GHS', { decimals: 0 })} />
            <Tooltip {...chartTooltipStyle()} formatter={(v: number, n) => [money(v), n]} />
            <Bar dataKey="In" radius={[6, 6, 0, 0]} fill="#0E9F6E" />
            <Bar dataKey="Out" radius={[6, 6, 0, 0]}>
              {chartData.map((_, i) => <Cell key={i} fill="#E54800" />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Three sections */}
      <div className="grid gap-3 lg:grid-cols-3">
        {(['operating', 'investing', 'financing'] as CashType[]).map((t) => {
          const b = byType[t]
          const empty = b.in === 0 && b.out === 0
          return (
            <Card key={t} className="p-4">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-canvas text-ink">{TYPE_META[t].icon}</span>
                <h3 className="flex items-center text-sm font-bold text-ink">{TYPE_META[t].label}<Explain text={TYPE_META[t].blurb} /></h3>
              </div>
              {empty ? (
                <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-xs text-ink-soft">No {TYPE_META[t].label.toLowerCase()} activity recorded for this period.</p>
              ) : (
                <>
                  <div className="mt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-ink-soft">Money in</span><Money value={b.in} className="font-semibold text-emerald-700" /></div>
                    <div className="flex justify-between"><span className="text-ink-soft">Money out</span><Money value={b.out} className="font-semibold text-brick-600" /></div>
                    <div className="flex justify-between border-t border-hair pt-1.5"><span className="font-medium text-ink">Net</span><Money value={b.net} signed className="font-bold" /></div>
                  </div>
                  {t === 'investing' && b.out > 0 && (
                    <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                      A downward Investing figure means cash was spent on long-term assets - money you still own as equipment, not a loss.
                    </p>
                  )}
                </>
              )}
            </Card>
          )
        })}
      </div>

      {/* Recent movements */}
      <Card>
        <CardHeader title="Recent cash movements" subtitle="Tap a movement to see what created it." />
        <div className="overflow-x-auto">
          {movements.length === 0 ? (
            <EmptyState title="No cash movements in this period" className="py-10" />
          ) : (
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-y border-hair text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <th className="px-5 py-2.5">Date</th>
                  <th className="px-3 py-2.5">Source</th>
                  <th className="px-3 py-2.5">Type</th>
                  <th className="px-3 py-2.5 text-right">Amount</th>
                  <th className="px-5 py-2.5 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {movements.slice(0, 40).map((t) => (
                  <tr key={t.id} className="border-b border-hair last:border-0 hover:bg-black/[0.015]">
                    <td className="px-5 py-3 text-ink-soft">{fmtDateTime(t.createdAt)}</td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-ink">{t.description}</p>
                      <p className="text-xs text-ink-soft">{t.category} · {t.method.toUpperCase()}</p>
                    </td>
                    <td className="px-3 py-3"><Badge tone={t.type === 'operating' ? 'neutral' : t.type === 'investing' ? 'info' : 'canary'}>{TYPE_META[t.type].label}</Badge></td>
                    <td className="px-3 py-3 text-right"><Money value={t.direction === 'in' ? t.amount : -t.amount} signed className="font-semibold" /></td>
                    <td className="px-5 py-3 text-right font-medium tnum text-ink">{money(t.balanceAfter)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <AdjustModal open={adjustOpen} onClose={() => setAdjustOpen(false)} />
    </div>
  )
}

function cashFlowSummary(byType: ReturnType<typeof cashByType>): string {
  const totalIn = byType.operating.in + byType.investing.in + byType.financing.in
  const totalOut = byType.operating.out + byType.investing.out + byType.financing.out
  if (totalIn === 0 && totalOut === 0) return 'No cash moved in this period.'
  const parts: string[] = []
  if (byType.operating.net !== 0) parts.push(`everyday business ${byType.operating.net >= 0 ? 'brought in' : 'used'} ${money(Math.abs(byType.operating.net))}`)
  if (byType.investing.out > 0) parts.push(`${money(byType.investing.out)} went to long-term assets`)
  if (byType.financing.net !== 0) parts.push(`financing ${byType.financing.net >= 0 ? 'added' : 'took out'} ${money(Math.abs(byType.financing.net))}`)
  return `${money(totalIn)} came in and ${money(totalOut)} went out. In short: ${parts.join(', ')}.`
}

function AdjustModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cashAdjustment = useStore((s) => s.cashAdjustment)
  const [direction, setDirection] = useState<'in' | 'out'>('in')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const amt = parseFloat(amount) || 0

  const submit = () => {
    if (amt <= 0 || !reason.trim()) return
    cashAdjustment(amt, direction, reason.trim())
    toast.success('Cash adjusted', `${direction === 'in' ? 'Added' : 'Removed'} ${money(amt)} - ${reason.trim()}.`)
    setAmount(''); setReason('')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Manual cash adjustment"
      description="Admin-only correction to your recorded cash. Every adjustment is logged."
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={submit} disabled={amt <= 0 || !reason.trim()} className='text-white'>Save adjustment</Button></>}
    >
      <div className="space-y-4">
        <Segmented options={[{ value: 'in', label: 'Add cash (+)' }, { value: 'out', label: 'Remove cash (−)' }]} value={direction} onChange={(v) => setDirection(v as 'in' | 'out')} className="w-full [&>button]:flex-1" />
        <div>
          <label className="label" htmlFor="adj-amt">Amount (GH₵)</label>
          <input id="adj-amt" className="input tnum text-lg" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
        </div>
        <div>
          <label className="label" htmlFor="adj-reason">Reason</label>
          <input id="adj-reason" className="input" placeholder="e.g. Cash count correction" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
      </div>
    </Modal>
  )
}
