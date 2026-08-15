import { useMemo, useState } from 'react'
import { Boxes, PackageCheck, Phone, Plus, Search, Truck } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { PageHero } from '@/components/ui/PageHero'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from '@/store/toast'
import { normalizePhone } from '@/lib/format'
import { money } from '@/lib/format'
import { fmtDateTime } from '@/lib/datetime'
import { Badge } from '@/components/ui/Badge'
import type { Supplier } from '@/types'

export function SuppliersPage() {
  const suppliers = useStore((s) => s.suppliers)
  const products = useStore((s) => s.products)
  const purchases = useStore((s) => s.purchases)
  const addSupplier = useStore((s) => s.addSupplier)
  const [query, setQuery] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [active, setActive] = useState<Supplier | null>(null)

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase()
    return suppliers.filter((supplier) => !value || supplier.name.toLowerCase().includes(value) || (supplier.phone ?? '').includes(value))
  }, [suppliers, query])

  const save = () => {
    if (!name.trim()) return
    addSupplier(name.trim(), normalizePhone(phone) || phone.trim() || undefined)
    toast.success('Supplier added', `${name.trim()} is now available when adding products.`)
    setName('')
    setPhone('')
    setAddOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Supply network" title="Suppliers" description="Keep supplier contacts and the products they provide in one place." action={<Button onClick={() => setAddOpen(true)} className='text-white'><Plus className="h-4 w-4" /> Add supplier</Button>} />

      <div className="grid gap-3 sm:grid-cols-3">
        <Summary icon={<Truck className="h-5 w-5" />} label="Suppliers" value={suppliers.length} />
        <Summary icon={<Boxes className="h-5 w-5" />} label="Linked products" value={products.filter((product) => product.supplierId).length} />
        <Summary icon={<PackageCheck className="h-5 w-5" />} label="Stock purchases" value={purchases.length} />
      </div>

      <Card className="p-3">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <input className="input pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search suppliers by name or phone" />
        </div>
      </Card>

      {filtered.length === 0 ? <EmptyState icon={<Truck className="h-6 w-6" />} title="No suppliers found" description={query ? 'Try another search.' : 'Add your first supplier to get started.'} /> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((supplier) => {
            const linkedProducts = products.filter((product) => product.supplierId === supplier.id)
            return (
              <button key={supplier.id} type="button" onClick={() => setActive(supplier)} className="rounded-2xl bg-paper p-5 text-left ring-1 ring-black/[0.06] shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-canary-50 text-canary-700"><Truck className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1"><h2 className="truncate font-bold text-ink">{supplier.name}</h2><p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft"><Phone className="h-3.5 w-3.5" />{supplier.phone || 'No phone added'}</p></div>
                </div>
                <div className="mt-5 border-t border-hair pt-4"><p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Products supplied</p><p className="mt-1 text-2xl font-extrabold text-ink">{linkedProducts.length}</p>{linkedProducts.length > 0 && <p className="mt-1 truncate text-xs text-ink-soft">{linkedProducts.slice(0, 3).map((product) => product.name).join(', ')}</p>}</div>
                <p className="mt-4 text-xs font-bold text-canary-700">View supplier details</p>
              </button>
            )
          })}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add supplier" description="Save the contact once, then link products to it." footer={<><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={save} disabled={!name.trim()}>Add supplier</Button></>}>
        <div className="space-y-4"><div><label className="label" htmlFor="supplier-name">Supplier name</label><input id="supplier-name" autoFocus className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Accra Wholesale Ltd" /></div><div><label className="label" htmlFor="supplier-phone">Phone number</label><input id="supplier-phone" className="input" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="e.g. 024 555 0142" /></div></div>
      </Modal>
      <SupplierProfile supplier={active} onClose={() => setActive(null)} />
    </div>
  )
}

function SupplierProfile({ supplier, onClose }: { supplier: Supplier | null; onClose: () => void }) {
  const products = useStore((s) => s.products)
  const purchases = useStore((s) => s.purchases)
  if (!supplier) return null

  const linkedProducts = products.filter((product) => product.supplierId === supplier.id)
  const productIds = new Set(linkedProducts.map((product) => product.id))
  const history = purchases.filter((purchase) => productIds.has(purchase.productId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const totalPurchased = history.reduce((sum, purchase) => sum + purchase.total, 0)
  const totalUnits = history.reduce((sum, purchase) => sum + purchase.qty, 0)

  return (
    <Modal open={!!supplier} onClose={onClose} size="lg" title={supplier.name} description={supplier.phone || 'No phone number added'} footer={<Button variant="outline" onClick={onClose}>Close</Button>}>
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <MiniStat label="Products" value={linkedProducts.length} />
          <MiniStat label="Units received" value={totalUnits} />
          <MiniStat label="Purchased" value={money(totalPurchased)} />
        </div>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-ink">Products supplied</h3>
          {linkedProducts.length === 0 ? <EmptyState title="No linked products" description="Choose this supplier when adding or editing a product." className="py-6" /> : (
            <div className="grid gap-2 sm:grid-cols-2">
              {linkedProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-3 rounded-xl border border-hair px-3.5 py-3">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{product.name}</p><p className="text-xs text-ink-soft">{product.sku} · {money(product.costPrice)} cost</p></div>
                  <Badge tone={product.stock <= 0 ? 'danger' : product.stock <= product.threshold ? 'warn' : 'inflow'} dot>{product.stock} in stock</Badge>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-ink">Purchase history</h3>
          {history.length === 0 ? <EmptyState title="No purchases recorded" className="py-6" /> : (
            <div className="max-h-[36vh] space-y-2 overflow-y-auto">
              {history.map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between gap-3 rounded-xl border border-hair px-3.5 py-3">
                  <div className="flex min-w-0 items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-canary-50 text-canary-700"><PackageCheck className="h-4 w-4" /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{purchase.productName}</p><p className="text-xs text-ink-soft">{fmtDateTime(purchase.createdAt)} · {purchase.qty} units · {purchase.method.toUpperCase()}</p></div></div>
                  <div className="text-right"><p className="text-sm font-bold text-ink">{money(purchase.total)}</p><Badge tone={purchase.paid ? 'inflow' : 'warn'}>{purchase.paid ? 'Paid' : 'Unpaid'}</Badge></div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Modal>
  )
}

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-xl bg-canvas p-3"><p className="text-xs text-ink-soft">{label}</p><p className="mt-1 break-words font-bold text-ink tnum">{value}</p></div>
}

function Summary({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <Card className="flex items-center gap-3 p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-canary-50 text-canary-700">{icon}</span><div><p className="text-xs font-semibold text-ink-soft">{label}</p><p className="text-xl font-extrabold text-ink">{value}</p></div></Card>
}
