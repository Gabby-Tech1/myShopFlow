import { useMemo, useState } from 'react'
import { endOfDay, format, parseISO, startOfDay, subDays } from 'date-fns'
import { CalendarDays, Search, X } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHero } from '@/components/ui/PageHero'
import { fmtDayHeading, fmtTime } from '@/lib/datetime'
import type { ActivityEvent, ActivityModule } from '@/types'
import { cn } from '@/lib/utils'

const MODULES: { value: ActivityModule | 'all'; label: string }[] = [
  { value: 'all', label: 'All modules' },
  { value: 'sales', label: 'Sales' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'customers', label: 'Customers' },
  { value: 'cashflow', label: 'Cash Flow' },
  { value: 'expenses', label: 'Expenses' },
  { value: 'staff', label: 'Staff' },
  { value: 'suppliers', label: 'Suppliers' },
  { value: 'settings', label: 'Settings' },
]

function moduleIcon(m: string) {
  return m === 'sales' ? 'ShoppingCart' : m === 'inventory' ? 'Package' : m === 'customers' ? 'Users' : m === 'expenses' ? 'Receipt' : m === 'cashflow' ? 'ArrowRightLeft' : m === 'staff' ? 'UserCog' : 'Activity'
}
function moduleTone(m: string) {
  return m === 'sales' ? 'canary' : m === 'inventory' ? 'info' : m === 'customers' ? 'inflow' : m === 'expenses' ? 'brick' : 'neutral'
}

export function ActivityPage() {
  const activity = useStore((s) => s.activity)
  const users = useStore((s) => s.users)
  const [module, setModule] = useState<ActivityModule | 'all'>('all')
  const [userId, setUserId] = useState('all')
  const [query, setQuery] = useState('')
  const [dateRange, setDateRange] = useState<'all' | 'today' | '7days' | '30days' | 'custom'>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const now = new Date()
    const rangeStart = dateRange === 'today' ? startOfDay(now) : dateRange === '7days' ? startOfDay(subDays(now, 6)) : dateRange === '30days' ? startOfDay(subDays(now, 29)) : dateRange === 'custom' && fromDate ? startOfDay(parseISO(fromDate)) : null
    const rangeEnd = dateRange === 'custom' && toDate ? endOfDay(parseISO(toDate)) : dateRange === 'all' ? null : endOfDay(now)
    return activity.filter(
      (a) =>
        (module === 'all' || a.module === module) &&
        (userId === 'all' || a.userId === userId) &&
        (!rangeStart || parseISO(a.createdAt) >= rangeStart) &&
        (!rangeEnd || parseISO(a.createdAt) <= rangeEnd) &&
        (!q || a.action.toLowerCase().includes(q) || (a.detail ?? '').toLowerCase().includes(q) || (a.refId ?? '').toLowerCase().includes(q)),
    )
  }, [activity, module, userId, query, dateRange, fromDate, toDate])

  const filtersActive = module !== 'all' || userId !== 'all' || query !== '' || dateRange !== 'all'
  const clearFilters = () => {
    setModule('all')
    setUserId('all')
    setQuery('')
    setDateRange('all')
    setFromDate('')
    setToDate('')
  }

  // Build the last 10 days so empty days remain visible (spec §11).
  const days = useMemo(() => {
    const map: Record<string, ActivityEvent[]> = {}
    filtered.forEach((a) => {
      const key = format(parseISO(a.createdAt), 'yyyy-MM-dd')
      ;(map[key] ??= []).push(a)
    })
    const out: { key: string; iso: string; events: ActivityEvent[] }[] = []
    for (let i = 0; i < 10; i++) {
      const d = subDays(new Date(), i)
      const key = format(d, 'yyyy-MM-dd')
      out.push({ key, iso: d.toISOString(), events: map[key] ?? [] })
      delete map[key]
    }
    // Older days that still have matching events
    Object.keys(map).sort((a, b) => b.localeCompare(a)).forEach((key) => out.push({ key, iso: parseISO(key + 'T12:00:00').toISOString(), events: map[key] }))
    return out
  }, [filtered])

  const hasAny = filtered.length > 0

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Admin oversight" title="Audit logs" description="Track every recorded action across sales, inventory, customers, cash flow, staff and suppliers." />
      <p className="text-sm text-ink-soft">A clear, time-stamped record of what each staff member has done in the system.</p>

      <div className="rounded-2xl bg-white p-3 ring-1 ring-black/[0.06] shadow-card">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_180px_180px_190px_auto]">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />
          <input className="input pl-11" placeholder="Search actions, names, references…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select aria-label="Filter by module" className="input" value={module} onChange={(e) => setModule(e.target.value as ActivityModule | 'all')}>
          {MODULES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select aria-label="Filter by user" className="input" value={userId} onChange={(e) => setUserId(e.target.value)}>
          <option value="all">All users</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <div className="relative">
          <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <select aria-label="Filter by date" className="input pl-10" value={dateRange} onChange={(e) => setDateRange(e.target.value as typeof dateRange)}>
            <option value="all">All dates</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="custom">Custom range</option>
          </select>
        </div>
        {filtersActive && <button type="button" onClick={clearFilters} className="inline-flex h-[42px] items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold text-ink-soft transition-colors hover:bg-canvas hover:text-ink"><X className="h-4 w-4" /> Clear</button>}
        </div>
        {dateRange === 'custom' && (
          <div className="mt-3 grid gap-3 border-t border-hair pt-3 sm:grid-cols-2 xl:max-w-[520px]">
            <label className="text-xs font-semibold text-ink-soft">From<input aria-label="Start date" type="date" className="input mt-1.5" max={toDate || undefined} value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></label>
            <label className="text-xs font-semibold text-ink-soft">To<input aria-label="End date" type="date" className="input mt-1.5" min={fromDate || undefined} value={toDate} onChange={(e) => setToDate(e.target.value)} /></label>
          </div>
        )}
      </div>

      {!hasAny && <EmptyState icon={<Icon name="History" className="h-6 w-6" />} title="No matching activity" description="Try changing the filters." />}

      <div className="space-y-5">
        {days.filter((d) => hasAny).map((d) => (
          <div key={d.key}>
            <div className="mb-2 flex items-center gap-3">
              <h3 className="text-sm font-bold text-ink">{fmtDayHeading(d.iso)}</h3>
              <div className="h-px flex-1 bg-hair" />
              {d.events.length > 0 && <Badge tone="neutral">{d.events.length} event{d.events.length > 1 ? 's' : ''}</Badge>}
            </div>
            {d.events.length === 0 ? (
              <p className="rounded-xl bg-canvas px-4 py-3 text-sm text-ink-soft">No activity</p>
            ) : (
              <Card className="divide-y divide-hair overflow-hidden">
                {d.events.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-canvas/70">
                    <span className={cn('mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl', 'bg-canvas text-ink')}>
                      <Icon name={moduleIcon(a.module)} className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">{a.action}{a.detail ? <span className="font-normal text-ink-soft"> · {a.detail}</span> : ''}</p>
                      <p className="mt-0.5 text-xs text-ink-soft">{a.userName} · {fmtTime(a.createdAt)}{a.refId ? ` · ${a.refId}` : ''}</p>
                    </div>
                    <Badge tone={moduleTone(a.module) as 'canary'}>{a.module}</Badge>
                  </div>
                ))}
              </Card>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
