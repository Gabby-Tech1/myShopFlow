import { useMemo, useState } from 'react'
import { Search, Phone, UserPlus, Mic, HandCoins, Clock, ShoppingBag } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useUi } from '@/store/ui'
import { useCan } from '@/store/access'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Money } from '@/components/ui/Money'
import { StatTile } from '@/components/ui/StatTile'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHero } from '@/components/ui/PageHero'
import { Segmented } from '@/components/ui/Segmented'
import { money } from '@/lib/format'
import { fmtDateTime, timeAgo } from '@/lib/datetime'
import { cn } from '@/lib/utils'
import type { Customer } from '@/types'
import { totalOutstanding } from '@/store/selectors'

export function CustomersPage() {
  const customers = useStore((s) => s.customers)
  const openModal = useUi((s) => s.openModal)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'owing'>('all')
  const [active, setActive] = useState<Customer | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return customers
      .filter((c) => (filter === 'all' || c.outstanding > 0) && (!q || c.name.toLowerCase().includes(q) || c.phone.includes(q)))
      .sort((a, b) => b.outstanding - a.outstanding)
  }, [customers, query, filter])

  const owing = customers.filter((c) => c.outstanding > 0).length

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Customer relationships" title="Turn every customer into a relationship" description="Keep purchase history, contact details and outstanding balances clear and actionable." action={<Button onClick={() => openModal('registerCustomer')} className='text-white'><UserPlus className="h-4 w-4" /> Register customer</Button>} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="Customers" value={customers.length} icon={<ShoppingBag className="h-5 w-5" />} />
        <StatTile label="Owing" value={owing} icon={<Clock className="h-5 w-5" />} accent="brick" hint="have a balance" />
        <StatTile label="Total Outstanding" term="Outstanding" value={money(totalOutstanding(customers))} icon={<HandCoins className="h-5 w-5" />} accent="ink" className="col-span-2 sm:col-span-1" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />
          <input className="input pl-11" placeholder="Search by name or phone…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Segmented options={[{ value: 'all', label: 'All' }, { value: 'owing', label: 'Owing' }]} value={filter} onChange={(v) => setFilter(v as 'all' | 'owing')} />
        <Button className="sm:hidden" onClick={() => openModal('registerCustomer')}><UserPlus className="h-4 w-4" /> Register</Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<UserPlus className="h-6 w-6" />} title="No customers found" description="Register a customer manually or by voice." action={<Button onClick={() => openModal('registerCustomer')}><Mic className="h-4 w-4" /> Register by voice</Button>} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <button key={c.id} onClick={() => setActive(c)} className="group flex items-center gap-3 rounded-2xl bg-paper p-4 text-left ring-1 ring-black/[0.06] shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover cursor-pointer">
              <div className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold', c.outstanding > 0 ? 'bg-brick-50 text-brick-600' : 'bg-canary-100 text-canary-700')}>
                {c.name.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-ink">
                  {c.name}
                  {c.registrationMethod === 'voice' && <Mic className="h-3.5 w-3.5 text-canary-600" />}
                </p>
                <p className="flex items-center gap-1 text-xs text-ink-soft"><Phone className="h-3 w-3" /> {c.phone}</p>
              </div>
              {c.outstanding > 0 ? <Badge tone="brick" dot>{money(c.outstanding)}</Badge> : <Badge tone="inflow">Clear</Badge>}
            </button>
          ))}
        </div>
      )}

      <CustomerProfile customer={active} onClose={() => setActive(null)} />
    </div>
  )
}

function CustomerProfile({ customer, onClose }: { customer: Customer | null; onClose: () => void }) {
  const sales = useStore((s) => s.sales)
  const payments = useStore((s) => s.payments)
  const openModal = useUi((s) => s.openModal)
  const canPay = useCan('receivePayment')

  const history = useMemo(() => {
    if (!customer) return []
    const items = [
      ...sales.filter((s) => s.customerId === customer.id).map((s) => ({ kind: 'sale' as const, at: s.createdAt, amount: s.total, label: `Sale ${s.receiptNo}`, sub: `${s.items.length} item(s) · ${s.paid ? s.paymentMethod.toUpperCase() : 'CREDIT'}`, paid: s.paid })),
      ...payments.filter((p) => p.customerId === customer.id).map((p) => ({ kind: 'payment' as const, at: p.createdAt, amount: p.amount, label: 'Payment received', sub: p.method.toUpperCase(), paid: true })),
    ]
    return items.sort((a, b) => b.at.localeCompare(a.at))
  }, [customer, sales, payments])

  if (!customer) return null
  const totalSpent = sales.filter((s) => s.customerId === customer.id).reduce((sum, s) => sum + s.total, 0)

  return (
    <Modal
      open={!!customer}
      onClose={onClose}
      size="lg"
      title={<span className="flex items-center gap-2">{customer.name}{customer.registrationMethod === 'voice' && <Badge tone="canary" dot>Voice</Badge>}</span>}
      description={customer.phone}
      footer={canPay ? <><Button variant="outline" onClick={onClose}>Close</Button><Button onClick={() => { onClose(); openModal('payment', { customerId: customer.id }) }} disabled={customer.outstanding <= 0} className='text-white'><HandCoins className="h-4 w-4" /> Receive payment</Button></> : <Button variant="outline" onClick={onClose}>Close</Button>}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <MiniStat label="Outstanding" value={<Money value={customer.outstanding} className={customer.outstanding > 0 ? 'text-brick-600' : 'text-inflow'} />} />
          <MiniStat label="Total spent" value={<Money value={totalSpent} />} />
          <MiniStat label="Last visit" value={<span className="text-sm">{customer.lastVisit ? timeAgo(customer.lastVisit) : '-'}</span>} />
        </div>

        {customer.notes && <p className="rounded-xl bg-canvas px-3.5 py-2.5 text-sm text-ink-soft">{customer.notes}</p>}

        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Purchases &amp; payments</p>
          {history.length === 0 ? (
            <EmptyState title="No history yet" className="py-6" />
          ) : (
            <div className="max-h-[40vh] space-y-1.5 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-hair px-3.5 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className={cn('grid h-8 w-8 place-items-center rounded-lg', h.kind === 'payment' ? 'bg-emerald-50 text-emerald-700' : 'bg-canary-100 text-canary-700')}>
                      {h.kind === 'payment' ? <HandCoins className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink">{h.label}</p>
                      <p className="text-xs text-ink-soft">{fmtDateTime(h.at)} · {h.sub}</p>
                    </div>
                  </div>
                  <Money value={h.kind === 'payment' ? h.amount : h.amount} className={cn('font-semibold', h.kind === 'payment' ? 'text-inflow' : 'text-ink')} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-canvas p-3">
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="mt-1 font-bold text-ink tnum">{value}</p>
    </div>
  )
}
