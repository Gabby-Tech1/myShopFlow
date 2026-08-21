import { useMemo, useState } from 'react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Coins, TrendingUp, Wallet, Percent } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { StatTile } from '@/components/ui/StatTile'
import { Card, CardHeader } from '@/components/ui/Card'
import { ChartCard, chartTooltipStyle } from '@/components/ui/ChartCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHero } from '@/components/ui/PageHero'
import { Segmented } from '@/components/ui/Segmented'
import { money, moneyCompact } from '@/lib/format'
import { rangeFor, type RangeKey } from '@/lib/datetime'
import { parseISO } from 'date-fns'
import {
  profitSummary, revenueOf, salesAtLocation, salesInRange, salesTrend,
  scopeProductsToLocation, unitsSold,
} from '@/store/selectors'

const PALETTE = ['#FF7A1A', '#07152F', '#0E9F6E', '#2563EB', '#E54800', '#D97706', '#7C3AED', '#0891B2']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function AnalyticsPage() {
  const raw = useStore()
  const sales = salesAtLocation(raw.sales, raw.activeLocationId)
  const products = scopeProductsToLocation(raw.products, raw.activeLocationId)
  const categories = raw.categories
  const [rangeKey, setRangeKey] = useState<RangeKey>('month')
  const range = rangeFor(rangeKey)

  const periodSales = useMemo(() => salesInRange(sales, range), [sales, range])
  const profit = useMemo(() => profitSummary(periodSales, raw.expenses, range), [periodSales, raw.expenses, range])
  const trend = useMemo(() => salesTrend(sales, range), [sales, range])
  const rev = profit.revenue

  // Channel split (retail vs wholesale)
  const channel = useMemo(() => {
    const ws = revenueOf(periodSales.filter((s) => s.tier === 'wholesale'))
    return [
      { name: 'Retail', value: +(rev - ws).toFixed(2) },
      { name: 'Wholesale', value: +ws.toFixed(2) },
    ].filter((d) => d.value > 0)
  }, [periodSales, rev])

  // Payment methods
  const payments = useMemo(() => {
    const m: Record<string, number> = {}
    periodSales.forEach((s) => (m[s.paymentMethod] = (m[s.paymentMethod] ?? 0) + s.total))
    return Object.entries(m).map(([k, v]) => ({ name: k.toUpperCase(), value: +v.toFixed(2) }))
  }, [periodSales])

  // Sales by category
  const byCategory = useMemo(() => {
    const prodCat: Record<string, string> = {}
    products.forEach((p) => (prodCat[p.id] = p.categoryId))
    const catName: Record<string, string> = {}
    categories.forEach((c) => (catName[c.id] = c.name))
    const m: Record<string, number> = {}
    periodSales.forEach((s) => s.items.forEach((it) => {
      const cat = catName[prodCat[it.productId]] ?? 'Other'
      m[cat] = (m[cat] ?? 0) + it.lineTotal
    }))
    return Object.entries(m).map(([name, value]) => ({ name, value: +value.toFixed(2) })).sort((a, b) => b.value - a.value)
  }, [periodSales, products, categories])

  // Top products by revenue
  const topProducts = useMemo(() => {
    const m: Record<string, number> = {}
    periodSales.forEach((s) => s.items.forEach((it) => (m[it.name] = (m[it.name] ?? 0) + it.lineTotal)))
    return Object.entries(m).map(([name, value]) => ({ name, value: +value.toFixed(2) })).sort((a, b) => b.value - a.value).slice(0, 7)
  }, [periodSales])

  // Sales by weekday
  const byWeekday = useMemo(() => {
    const m = [0, 0, 0, 0, 0, 0, 0]
    periodSales.forEach((s) => (m[parseISO(s.createdAt).getDay()] += s.total))
    return WEEKDAYS.map((d, i) => ({ name: d, value: +m[i].toFixed(2) }))
  }, [periodSales])

  const empty = periodSales.length === 0
  const bestCat = byCategory[0]
  const bestPay = [...payments].sort((a, b) => b.value - a.value)[0]
  const busiest = [...byWeekday].sort((a, b) => b.value - a.value)[0]
  const avgSale = periodSales.length ? rev / periodSales.length : 0
  const yMoney = (v: number) => moneyCompact(v)

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Analytics"
        title="Business analytics"
        description="Trends, channels and top performers — a deeper look at what drives your sales."
        action={
          <Segmented
            options={[
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
              { value: 'last_month', label: 'Last Mo.' },
              { value: 'year', label: 'Year' },
            ]}
            value={rangeKey}
            onChange={(v) => setRangeKey(v as RangeKey)}
          />
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Revenue" term="Revenue" value={money(rev)} icon={<Coins className="h-5 w-5" />} hint={`${periodSales.length} sales · avg ${money(avgSale)}`} />
        <StatTile label="Gross Profit" term="Gross Profit" value={money(profit.grossProfit)} icon={<TrendingUp className="h-5 w-5" />} hint="before expenses" accent="inflow" />
        <StatTile label="Net Profit" term="Net Profit" value={money(profit.netProfit)} icon={<Wallet className="h-5 w-5" />} hint="after expenses" />
        <StatTile label="Profit Margin" term="Profit Margin" value={`${profit.margin}%`} icon={<Percent className="h-5 w-5" />} hint={`${unitsSold(periodSales)} units sold`} accent="ink" />
      </div>

      {empty ? (
        <EmptyState title="No sales in this period" description="Pick a wider date range or record some sales to see analytics." className="py-16" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Sales & profit trend */}
          <ChartCard
            className="lg:col-span-2"
            title="Sales & profit trend"
            summary={`You made ${money(rev)} in sales ${range.label.toLowerCase()}, with a gross profit of ${money(profit.grossProfit)}.`}
            height={280}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="aSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF7A1A" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#FF7A1A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} minTickGap={20} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} width={54} tickFormatter={yMoney} />
                <Tooltip {...chartTooltipStyle()} formatter={(v: number, n) => [money(v), n === 'sales' ? 'Sales' : 'Profit']} />
                <Area type="monotone" dataKey="sales" stroke="#FF7A1A" strokeWidth={2.5} fill="url(#aSales)" />
                <Area type="monotone" dataKey="profit" stroke="#0E9F6E" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Sales by channel */}
          <ChartCard
            title="Sales by channel"
            summary={channel.length > 1 ? `Wholesale made up ${((channel[1].value / rev) * 100).toFixed(0)}% of sales; retail the rest.` : 'All sales this period were retail.'}
            height={240}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={channel} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {channel.map((_, i) => <Cell key={i} fill={i === 0 ? '#07152F' : '#FF7A1A'} />)}
                </Pie>
                <Tooltip {...chartTooltipStyle()} formatter={(v: number) => money(v)} />
                <Legend iconType="circle" formatter={(val) => <span style={{ color: '#536078', fontSize: 12 }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Sales by category */}
          <ChartCard
            title="Sales by category"
            summary={bestCat ? `${bestCat.name} is your top category at ${money(bestCat.value)}.` : 'No category sales yet.'}
            height={240}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} interval={0} angle={-12} textAnchor="end" height={44} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} width={54} tickFormatter={yMoney} />
                <Tooltip {...chartTooltipStyle()} formatter={(v: number) => [money(v), 'Sales']} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {byCategory.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Top products */}
          <ChartCard
            className="lg:col-span-2"
            title="Top products"
            summary={topProducts[0] ? `${topProducts[0].name} leads with ${money(topProducts[0].value)} in sales.` : 'No products sold yet.'}
            height={Math.max(240, topProducts.length * 40)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={yMoney} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#07152F' }} axisLine={false} tickLine={false} width={140} />
                <Tooltip {...chartTooltipStyle()} formatter={(v: number) => [money(v), 'Sales']} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#FF7A1A" barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Payment methods */}
          <ChartCard
            title="Payment methods"
            summary={bestPay ? `${bestPay.name} is the most-used method at ${money(bestPay.value)}.` : 'No payments yet.'}
            height={240}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={payments} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {payments.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip {...chartTooltipStyle()} formatter={(v: number) => money(v)} />
                <Legend iconType="circle" formatter={(val) => <span style={{ color: '#536078', fontSize: 12 }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Sales by weekday */}
          <ChartCard
            title="Sales by day of week"
            summary={busiest && busiest.value > 0 ? `${busiest.name === 'Sat' ? 'Saturday' : busiest.name === 'Sun' ? 'Sunday' : busiest.name} is your busiest day.` : 'Not enough data yet.'}
            height={240}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byWeekday} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} width={54} tickFormatter={yMoney} />
                <Tooltip {...chartTooltipStyle()} formatter={(v: number) => [money(v), 'Sales']} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#07152F" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  )
}
