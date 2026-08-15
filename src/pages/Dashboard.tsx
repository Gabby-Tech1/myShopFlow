import { useLayoutEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Wallet,
  TrendingUp,
  HandCoins,
  Boxes,
  Percent,
  Trophy,
  CalendarDays,
  CalendarCheck,
  Mic,
  ArrowRight,
  ShoppingCart,
  PackagePlus,
  UserPlus,
  Receipt,
  X,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useUi } from '@/store/ui'
import { useCan } from '@/store/access'
import { StatTile } from '@/components/ui/StatTile'
import { Card, CardHeader } from '@/components/ui/Card'
import { ChartCard, chartTooltipStyle } from '@/components/ui/ChartCard'
import { Badge } from '@/components/ui/Badge'
import { Money } from '@/components/ui/Money'
import { Icon } from '@/components/ui/Icon'
import { Explain } from '@/components/ui/Explain'
import { EmptyState } from '@/components/ui/EmptyState'
import { Segmented } from '@/components/ui/Segmented'
import { Button } from '@/components/ui/Button'
import { money } from '@/lib/format'
import { rangeFor, timeAgo, type RangeKey } from '@/lib/datetime'
import {
  bestMonth,
  bestSalesDay,
  bestSeller,
  inventoryValue,
  lowStock,
  profitSummary,
  revenueOf,
  salesAtLocation,
  salesInRange,
  salesTrend,
  scopeProductsToLocation,
  selectCashBalance,
  totalOutstanding,
} from '@/store/selectors'
import { buildInsights } from '@/store/insights'

export function DashboardPage() {
  const raw = useStore()
  // Scope inventory and sales to the active location (staff = their branch, admin 'all' = combined).
  const store = {
    ...raw,
    sales: salesAtLocation(raw.sales, raw.activeLocationId),
    products: scopeProductsToLocation(raw.products, raw.activeLocationId),
  }
  const canFin = useCan('financials')
  const openModal = useUi((s) => s.openModal)
  const [rangeKey, setRangeKey] = useState<RangeKey>('month')

  const range = rangeFor(rangeKey)
  const today = rangeFor('today')
  const user = store.users.find((u) => u.id === store.currentUserId)

  const periodSales = useMemo(() => salesInRange(store.sales, range), [store.sales, range])
  const prevSales = useMemo(() => salesInRange(store.sales, rangeFor('last_month')), [store.sales])
  const todaySales = useMemo(() => salesInRange(store.sales, today), [store.sales, today])

  const profit = useMemo(() => profitSummary(periodSales, store.expenses, range), [periodSales, store.expenses, range])
  const trend = useMemo(() => salesTrend(store.sales, range), [store.sales, range])
  const insights = useMemo(
    () => buildInsights(store.sales, store.products, store.categories, store.customers, store.expenses),
    [store.sales, store.products, store.categories, store.customers, store.expenses],
  )
  const seller = bestSeller(periodSales)
  const month = bestMonth(store.sales)
  const day = bestSalesDay(periodSales)
  const cash = selectCashBalance()
  const invValue = inventoryValue(store.products)
  const outstanding = totalOutstanding(store.customers)
  const low = lowStock(store.products)

  const revThis = revenueOf(periodSales)
  const revPrev = revenueOf(prevSales)
  const revDelta = revPrev > 0 ? ((revThis - revPrev) / revPrev) * 100 : undefined

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-7">
      <DashboardTutorial />
      {/* Header */}
      <div data-tour="dashboard-header" className="flex flex-col gap-4 border-b border-hair pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">Business overview</p>
          <h2 className="text-2xl font-extrabold text-ink sm:text-[28px]">{greeting}, {user?.name.split(' ')[0]}</h2>
          <p className="text-sm text-ink-soft">Here’s how {store.businessProfile.name} is doing.</p>
        </div>
        <Segmented
          options={[
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: 'year', label: 'Year' },
          ]}
          value={rangeKey}
          onChange={(v) => setRangeKey(v as RangeKey)}
        />
      </div>

      {/* Stat tiles */}
      <div data-tour="dashboard-overview" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Today’s Sales" value={money(revenueOf(todaySales))} icon={<ShoppingCart className="h-5 w-5" />} hint={`${todaySales.length} sale${todaySales.length === 1 ? '' : 's'} today`} />
        <StatTile label="Outstanding" term="Outstanding" value={money(outstanding)} icon={<HandCoins className="h-5 w-5" />} accent="brick" hint="owed by customers" />
        {canFin ? (
          <>
            <StatTile label="Cash Balance" term="Cash Balance" value={money(cash)} icon={<Wallet className="h-5 w-5" />} accent="inflow" hint="cash · MoMo · bank" />
            <StatTile label="Net Profit" term="Net Profit" value={money(profit.netProfit)} icon={<TrendingUp className="h-5 w-5" />} accent="ink" hint={range.label.toLowerCase()} />
          </>
        ) : (
          <>
            <StatTile label="Products" value={store.products.length} icon={<Boxes className="h-5 w-5" />} hint="in catalogue" />
            <StatTile label="Low stock" value={low.length} icon={<Icon name="PackageMinus" className="h-5 w-5" />} accent="brick" hint="need restock" />
          </>
        )}
      </div>

      {canFin && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Revenue" term="Revenue" value={money(profit.revenue)} delta={revDelta} icon={<Icon name="Coins" className="h-5 w-5" />} hint={`vs last month`} />
          <StatTile label="Profit Margin" term="Profit Margin" value={`${profit.margin}%`} icon={<Percent className="h-5 w-5" />} accent="inflow" hint="of revenue" />
          <StatTile label="Inventory Value" term="Inventory Value" value={money(invValue)} icon={<Boxes className="h-5 w-5" />} accent="ink" hint="at cost" />
          <StatTile label="Low stock" value={low.length} icon={<Icon name="PackageMinus" className="h-5 w-5" />} accent="brick" hint="need restock" />
        </div>
      )}

      {/* Best-of cards */}
      {canFin && (
        <div className="grid gap-3 sm:grid-cols-3">
          <BestCard icon={<Trophy className="h-5 w-5" />} term="Best Seller" label="Best Seller" primary={seller?.name ?? '-'} secondary={seller ? `${seller.units} units sold` : 'No sales yet'} />
          <BestCard icon={<CalendarDays className="h-5 w-5" />} label="Best Month" primary={month?.month.split(' ')[0] ?? '-'} secondary={month ? money(month.total) : 'No sales yet'} />
          <BestCard icon={<CalendarCheck className="h-5 w-5" />} label="Best Sales Day" primary={day ? new Date(day.date).toLocaleDateString('en-GB', { weekday: 'long' }) : '-'} secondary={day ? money(day.total) : 'No sales yet'} />
        </div>
      )}

      {/* Trend + Live Pulse */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          dataTour="performance-trend"
          className="lg:col-span-2"
          title="Sales & profit trend"
          summary={
            trend.length
              ? `You made ${money(profit.revenue)} in sales ${range.label.toLowerCase()}${revDelta !== undefined ? `, ${revDelta >= 0 ? 'up' : 'down'} ${Math.abs(revDelta).toFixed(0)}% on last month` : ''}. ${canFin ? `Net profit was ${money(profit.netProfit)}.` : ''}`
              : 'No sales recorded in this period yet.'
          }
          empty={trend.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF7A1A" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#FF7A1A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} minTickGap={20} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} width={54} tickFormatter={(v) => money(v, 'GHS', { decimals: 0 })} />
              <Tooltip {...chartTooltipStyle()} formatter={(v: number, n) => [money(v), n === 'sales' ? 'Sales' : 'Profit']} />
              <Area type="monotone" dataKey="sales" stroke="#FF7A1A" strokeWidth={2.5} fill="url(#gSales)" />
              {canFin && <Area type="monotone" dataKey="profit" stroke="#0E9F6E" strokeWidth={2} fillOpacity={0} />}
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <LivePulse cash={cash} inventory={invValue} outstanding={outstanding} canFin={canFin} />
      </div>

      {/* Lower grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Insights */}
        <Card data-tour="business-insights" className="overflow-hidden lg:col-span-2">
          <CardHeader title="Business Insights" subtitle="Facts drawn from your real data - never guesses." />
          <div className="grid gap-2.5 p-5 pt-3 sm:grid-cols-2">
            {insights.length === 0 && <EmptyState title="No insights yet" description="Record some sales to see insights." />}
            {insights.map((ins, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-hair p-3">
                <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${ins.tone === 'good' ? 'bg-emerald-50 text-emerald-700' : ins.tone === 'watch' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                  <Icon name={ins.icon} className="h-4 w-4" />
                </span>
                <p className="text-sm font-medium text-ink">{ins.text}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Voice card + quick actions */}
        <div className="space-y-4">
          <button
            data-tour="voice-registration"
            onClick={() => openModal('registerCustomer')}
            className="group w-full overflow-hidden rounded-2xl bg-ink p-5 text-left text-white shadow-card transition-transform hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-canary text-ink"><Mic className="h-5 w-5" /></div>
            <p className="text-base font-bold">Register a customer by voice</p>
            <p className="mt-1 text-sm text-white/70">Speak their name and number - we capture it for you.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-canary">Start <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
          </button>

          <Card>
            <CardHeader title="Quick actions" />
            <div className="grid grid-cols-2 gap-2 p-4 pt-2">
              <QuickBtn to="/pos" icon={<ShoppingCart className="h-4 w-4" />} label="New Sale" />
              <QuickBtn to="/products?add=1" icon={<PackagePlus className="h-4 w-4" />} label="Add Product" />
              <QuickAction onClick={() => openModal('registerCustomer')} icon={<UserPlus className="h-4 w-4" />} label="Add Customer" />
              <QuickAction onClick={() => openModal('payment')} icon={<HandCoins className="h-4 w-4" />} label="Receive Pay" />
            </div>
          </Card>
        </div>
      </div>

      {/* Low stock + recent activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card data-tour="low-stock">
          <CardHeader title="Low stock" term="Low Stock" action={<Link to="/products" className="text-sm font-semibold text-canary-700 hover:underline">View all</Link>} />
          <div className="p-3 pt-2">
            {low.length === 0 ? (
              <EmptyState title="Everything is well stocked" className="py-6" />
            ) : (
              low.slice(0, 5).map((p) => (
                <Link key={p.id} to="/products" className="flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-black/[0.02]">
                  <span className="text-sm font-medium text-ink">{p.name}</span>
                  <Badge tone={p.stock === 0 ? 'danger' : 'warn'} dot>{p.stock === 0 ? 'Out' : `${p.stock} left`}</Badge>
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card data-tour="recent-activity">
          <CardHeader title="Recent activity" action={<Link to="/audit-logs" className="text-sm font-semibold text-canary-700 hover:underline">View all</Link>} />
          <div className="p-3 pt-2">
            {store.activity.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-xl px-2 py-2.5">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-canvas text-ink-soft"><Icon name={activityIcon(a.module)} className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{a.action}{a.detail ? ` · ${a.detail}` : ''}</p>
                  <p className="text-xs text-ink-soft">{a.userName} · {timeAgo(a.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

const DESKTOP_TUTORIAL_STEPS = [
  { selector: '[data-tour="dashboard-overview"]', title: 'Your business at a glance', text: 'These cards show the numbers that need your attention today. They update automatically as your team works.' },
  { selector: '[data-tour="pos-navigation"]', title: 'Start every sale here', text: 'Open the point of sale to add products, choose a payment method and complete a transaction.' },
  { selector: '[data-tour="products-navigation"]', title: 'Keep inventory accurate', text: 'Add products, restock items and see what is running low from the Products workspace.' },
  { selector: '[data-tour="quick-actions"]', title: 'Create anything quickly', text: 'Use this button from anywhere to record a sale, expense, payment, product or customer.' },
  { selector: '[data-tour="performance-trend"]', title: 'See how sales are moving', text: 'Use this chart to compare sales and profit across the selected reporting period.' },
  { selector: '[data-tour="business-insights"]', title: 'Turn activity into insight', text: 'MyShopFlow highlights useful patterns from your real sales, stock and customer data.' },
  { selector: '[data-tour="recent-activity"]', title: 'Review recent work', text: 'Admins can open Audit Logs to review actions by staff member, module and date.' },
]

const MOBILE_TUTORIAL_STEPS = [
  { selector: '[data-tour="dashboard-header"]', title: 'Welcome to your dashboard', text: 'Start here to choose a period and understand which business view you are looking at.' },
  { selector: '[data-tour="dashboard-overview"]', title: 'Your business at a glance', text: 'These cards show the numbers that need your attention today and update as work is recorded.' },
  { selector: '[data-tour="performance-trend"]', title: 'Follow sales performance', text: 'See how sales and profit change across the reporting period you selected.' },
  { selector: '[data-tour="business-insights"]', title: 'Notice useful patterns', text: 'Insights turn your real sales, stock and customer activity into clear observations.' },
  { selector: '[data-tour="voice-registration"]', title: 'Register customers faster', text: 'Capture a customer name and phone number by voice, then review the details before saving.' },
  { selector: '[data-tour="low-stock"]', title: 'Stay ahead of low stock', text: 'See which products need attention before they interrupt your next sale.' },
  { selector: '[data-tour="recent-activity"]', title: 'Review recent work', text: 'Admins can open Audit Logs to review actions by staff member, module and date.' },
]

function DashboardTutorial() {
  const hasSeen = useStore((s) => s.hasSeenDashboardTutorial)
  const complete = useStore((s) => s.completeDashboardTutorial)
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const mobile = window.matchMedia('(max-width: 639px)').matches
  const tutorialSteps = mobile ? MOBILE_TUTORIAL_STEPS : DESKTOP_TUTORIAL_STEPS
  useLayoutEffect(() => {
    if (hasSeen) return
    const update = () => {
      const el = document.querySelector(tutorialSteps[step].selector)
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        window.setTimeout(() => setRect(el.getBoundingClientRect()), 180)
      }
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    window.visualViewport?.addEventListener('resize', update)
    window.visualViewport?.addEventListener('scroll', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      window.visualViewport?.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('scroll', update)
    }
  }, [step, hasSeen, tutorialSteps])
  if (hasSeen) return null
  const item = tutorialSteps[step]
  const finish = () => complete()
  const pad = 8
  const cardWidth = Math.min(360, window.innerWidth - 24)
  const preferRight = rect ? rect.right + cardWidth + 28 < window.innerWidth : false
  const left = mobile ? 12 : rect ? (preferRight ? rect.right + 18 : Math.max(12, Math.min(rect.left, window.innerWidth - cardWidth - 12))) : 24
  const top = mobile ? window.innerHeight - 292 : rect ? (preferRight ? Math.max(16, Math.min(rect.top, window.innerHeight - 260)) : Math.min(rect.bottom + 18, window.innerHeight - 260)) : 100

  return (
    <div className="fixed inset-0 z-[120]">
      {rect && <svg className="absolute inset-0 h-full w-full" aria-hidden><defs><mask id="tour-hole"><rect width="100%" height="100%" fill="white" /><rect x={rect.left - pad} y={rect.top - pad} width={rect.width + pad * 2} height={rect.height + pad * 2} rx="14" fill="black" /></mask></defs><rect width="100%" height="100%" fill="rgba(17,24,39,.68)" mask="url(#tour-hole)" /></svg>}
      {rect && <div className="pointer-events-none fixed rounded-[14px] ring-2 ring-canary shadow-[0_0_0_4px_rgba(244,180,0,.18)]" style={{ left: rect.left - pad, top: rect.top - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }} />}
      <div role="dialog" aria-label="Product tour" className="fixed overflow-hidden rounded-2xl bg-white ring-1 ring-black/10 shadow-pop animate-scale-in" style={{ left, top, width: cardWidth }}>
        <div className="border-b border-hair px-5 pb-4 pt-5">
          <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-canary-700">Getting started · {step + 1} of {tutorialSteps.length}</span><button onClick={finish} aria-label="Close tour" className="text-ink-faint hover:text-ink"><X className="h-4 w-4" /></button></div>
          <h2 className="mt-3 text-lg font-extrabold text-ink">{item.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.text}</p>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={finish} className="px-2 text-xs font-semibold text-ink-soft hover:text-ink">Skip tour</button>
          <div className="flex gap-2">{step > 0 && <Button size="sm" variant="ghost" onClick={() => setStep((i) => i - 1)}>Back</Button>}<Button size="sm" onClick={() => step === tutorialSteps.length - 1 ? finish() : setStep((i) => i + 1)}>{step === tutorialSteps.length - 1 ? 'Finish' : 'Next'} <ArrowRight className="h-3.5 w-3.5" /></Button></div>
        </div>
      </div>
    </div>
  )
}

function activityIcon(module: string) {
  return module === 'sales' ? 'ShoppingCart' : module === 'inventory' ? 'Package' : module === 'customers' ? 'Users' : module === 'expenses' ? 'Receipt' : module === 'cashflow' ? 'ArrowRightLeft' : 'Activity'
}

function BestCard({ icon, label, term, primary, secondary }: { icon: React.ReactNode; label: string; term?: string; primary: string; secondary: string }) {
  return (
    <Card className="flex items-center gap-3 p-4" hover>
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-canary-100 text-canary-700">{icon}</span>
      <div className="min-w-0">
        <p className="flex items-center text-xs font-medium text-ink-soft">{label}{term && <Explain term={term} />}</p>
        <p className="truncate text-base font-bold text-ink">{primary}</p>
        <p className="truncate text-xs text-ink-soft">{secondary}</p>
      </div>
    </Card>
  )
}

function LivePulse({ cash, inventory, outstanding, canFin }: { cash: number; inventory: number; outstanding: number; canFin: boolean }) {
  const nodes = [
    { label: 'Cash Balance', term: 'Cash Balance', value: cash, tone: 'bg-emerald-500', show: canFin },
    { label: 'Inventory Value', term: 'Inventory Value', value: inventory, tone: 'bg-canary-500', show: canFin },
    { label: 'Outstanding', term: 'Outstanding', value: outstanding, tone: 'bg-brick-500', show: true },
  ].filter((n) => n.show)
  const max = Math.max(...nodes.map((n) => n.value), 1)

  return (
    <Card className="p-5">
      <div className="mb-1 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <h3 className="text-sm font-semibold text-ink">Live Pulse</h3>
      </div>
      <p className="mb-4 text-sm text-ink-soft">How your money is spread right now.</p>
      <div className="space-y-4">
        {nodes.map((n) => (
          <div key={n.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center font-medium text-ink">{n.label}<Explain term={n.term} /></span>
              <Money value={n.value} className="font-bold text-ink" />
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/[0.05]">
              <div className={`h-full rounded-full ${n.tone}`} style={{ width: `${Math.max(6, (n.value / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function QuickBtn({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 rounded-xl border border-hair px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-canary hover:bg-canary-50">
      <span className="text-ink-soft">{icon}</span> {label}
    </Link>
  )
}
function QuickAction({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 rounded-xl border border-hair px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-canary hover:bg-canary-50 cursor-pointer">
      <span className="text-ink-soft">{icon}</span> {label}
    </button>
  )
}
