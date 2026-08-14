import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowLeftRight, RefreshCw, Info, Clock } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Explain } from '@/components/ui/Explain'
import { ChartCard, chartTooltipStyle } from '@/components/ui/ChartCard'
import { PageHero } from '@/components/ui/PageHero'
import { Segmented } from '@/components/ui/Segmented'
import { toast } from '@/store/toast'
import { useStore } from '@/store/useStore'
import { currencyMeta } from '@/lib/format'
import { format } from 'date-fns'
import {
  FX_PROVIDER,
  FX_RATE_TYPE,
  convert,
  lastUpdatedLabel,
  pairRate,
  rateForDate,
  series,
  type FxWindow,
} from '@/lib/fx'
import type { CurrencyCode } from '@/types'

const WINDOWS: FxWindow[] = ['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y']

export function CurrencyPage() {
  const supported = useStore((s) => s.settings.supportedCurrencies)
  const [from, setFrom] = useState<CurrencyCode>('GHS')
  const [to, setTo] = useState<CurrencyCode>('USD')
  const [amount, setAmount] = useState('10000')
  const [win, setWin] = useState<FxWindow>('1M')
  const [histDate, setHistDate] = useState('')
  const [nowKey, setNowKey] = useState(0)

  const amt = parseFloat(amount) || 0
  const converted = convert(amt, from, to)
  const rate = pairRate(from, to)
  const invRate = pairRate(to, from)
  const chart = useMemo(() => series(from, to, win), [from, to, win, nowKey])
  const hist = histDate ? rateForDate(from, to, new Date(histDate)) : null

  const swap = () => {
    setFrom(to)
    setTo(from)
  }
  const refresh = () => {
    setNowKey((k) => k + 1)
    toast.success('Rates refreshed', `Latest demo reference rates loaded (${lastUpdatedLabel()}).`)
  }

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <PageHero eyebrow="Currency desk" title="Convert with confidence" description="Compare currencies, inspect historical movement and keep every conversion transparent." />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <p className="text-sm text-ink-soft">Convert between currencies using reference rates.</p>
          <Badge tone="warn" dot>Demo rates</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={refresh}><RefreshCw className="h-4 w-4" /> Refresh</Button>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        {/* Converter */}
        <Card className="p-5 sm:p-6">
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
            <CurrencySelect label="From" value={from} onChange={setFrom} options={supported} />
            <button onClick={swap} aria-label="Swap currencies" className="mx-auto grid h-10 w-10 place-items-center rounded-xl border border-hair text-ink transition-colors hover:border-canary hover:bg-canary-50 sm:mb-1 sm:h-11 sm:w-11 cursor-pointer">
              <ArrowLeftRight className="h-5 w-5 rotate-90 sm:rotate-0" />
            </button>
            <CurrencySelect label="To" value={to} onChange={setTo} options={supported} />
          </div>

          <div className="mt-4">
            <label className="label" htmlFor="fx-amt">Amount</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft">{currencyMeta(from).symbol}</span>
              <input id="fx-amt" className="input pl-12 text-lg tnum" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-gradient-to-br from-canary-50 to-white p-5 ring-1 ring-canary/20">
            <p className="text-sm text-ink-soft">Converted amount</p>
            <p className="mt-1 break-words text-2xl font-bold text-ink tnum sm:text-3xl">
              {currencyMeta(to).flag} {currencyMeta(to).symbol}{converted.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-ink">
              <span>1 {from} = {rate.toLocaleString('en-US', { maximumFractionDigits: 4 })} {to}</span>
              <Explain term="Market Reference Rate" />
            </div>
            <p className="text-xs text-ink-soft tnum">1 {to} = {invRate.toLocaleString('en-US', { maximumFractionDigits: 4 })} {from}</p>
          </div>

          <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2 text-xs min-[380px]:grid-cols-2">
            <Meta label="Rate date" value={format(new Date(), 'd MMM yyyy')} />
            <Meta label="Last updated" value={lastUpdatedLabel()} />
            <Meta label="Data source" value={FX_PROVIDER} />
            <Meta label="Rate type" value={FX_RATE_TYPE} />
          </dl>
        </Card>

        {/* Historical lookup */}
        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-ink"><Clock className="h-4 w-4" /> Historical rate lookup</h3>
          <p className="mt-1 text-sm text-ink-soft">Check the reference rate on a specific date.</p>
          <div className="mt-4">
            <label className="label" htmlFor="fx-date">Choose a date</label>
            <input id="fx-date" type="date" max={format(new Date(), 'yyyy-MM-dd')} className="input" value={histDate} onChange={(e) => setHistDate(e.target.value)} />
          </div>
          {hist ? (
            <div className="mt-4 rounded-2xl bg-canvas p-4">
              <p className="text-sm text-ink-soft">On {format(hist.usedDate, 'd MMM yyyy')}</p>
              <p className="mt-1 break-words text-xl font-bold text-ink tnum sm:text-2xl">1 {from} = {hist.rate.toLocaleString('en-US', { maximumFractionDigits: 4 })} {to}</p>
              {hist.note && <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-amber-700"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />{hist.note}</p>}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-hair p-6 text-center text-sm text-ink-soft">
              Pick a date to see the reference rate that applied.
            </div>
          )}
          <p className="mt-4 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
            FX rates never change a product’s stored price automatically — you always choose when to apply a conversion.
          </p>
        </Card>
      </div>

      {/* Rate history chart */}
      <ChartCard
        title={`${from} → ${to} rate history`}
        summary={rateSummary(chart, from, to)}
        action={<div className="max-w-[calc(100vw-3rem)] overflow-x-auto pb-1"><Segmented size="sm" options={WINDOWS.map((w) => ({ value: w, label: w }))} value={win} onChange={(v) => setWin(v as FxWindow)} /></div>}
        empty={chart.length === 0}
        height={240}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chart} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} minTickGap={24} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} width={56} tickFormatter={(v) => v.toFixed(2)} />
            <Tooltip {...chartTooltipStyle()} formatter={(v: number) => [`${v.toFixed(4)} ${to}`, `1 ${from}`]} />
            <Line type="monotone" dataKey="rate" stroke="#F4B400" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

function rateSummary(chart: { rate: number }[], from: CurrencyCode, to: CurrencyCode): string {
  if (chart.length < 2) return `Showing the ${from} to ${to} reference rate.`
  const first = chart[0].rate
  const last = chart[chart.length - 1].rate
  const change = ((last - first) / first) * 100
  return `1 ${from} is now ${last.toFixed(4)} ${to}, ${change >= 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(1)}% over this window.`
}

function CurrencySelect({ label, value, onChange, options }: { label: string; value: CurrencyCode; onChange: (c: CurrencyCode) => void; options: CurrencyCode[] }) {
  const meta = currencyMeta(value)
  return (
    <div className="min-w-0">
      <label className="label">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg">{meta.flag}</span>
        <select className="input min-w-0 truncate pl-10 font-semibold" value={value} onChange={(e) => onChange(e.target.value as CurrencyCode)}>
          {options.map((c) => (
            <option key={c} value={c}>{c} · {currencyMeta(c).name}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="font-semibold text-ink">{value}</dd>
    </div>
  )
}
