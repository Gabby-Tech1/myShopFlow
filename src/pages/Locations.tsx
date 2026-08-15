import { useMemo, useState } from 'react'
import { Plus, Warehouse, Store, ArrowLeftRight, Search, MapPin, Check } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { toast } from '@/store/toast'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { StatTile } from '@/components/ui/StatTile'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHero } from '@/components/ui/PageHero'
import { Segmented } from '@/components/ui/Segmented'
import { money } from '@/lib/format'
import { unitAbbr } from '@/lib/pricing'
import { stockStatusAt } from '@/store/selectors'
import { cn } from '@/lib/utils'
import type { Location, Product } from '@/types'

const stockAt = (p: Product, locId: string, activeId: string) =>
  p.stockByLocation ? p.stockByLocation[locId] ?? 0 : locId === activeId ? p.stock : 0

export function LocationsPage() {
  const locations = useStore((s) => s.locations)
  const products = useStore((s) => s.products)
  const activeId = useStore((s) => s.activeLocationId)
  const setActive = useStore((s) => s.setActiveLocation)
  const [addOpen, setAddOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [query, setQuery] = useState('')

  const valueAt = (locId: string) =>
    products.reduce((sum, p) => sum + p.costPrice * stockAt(p, locId, activeId), 0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
  }, [products, query])

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Multi-location"
        title="Locations & warehouses"
        description="Track stock across every shop and warehouse, and move it where it's needed."
        action={<div className="flex gap-2"><Button variant="outline" className='hover:bg-white' onClick={() => setTransferOpen(true)}><ArrowLeftRight className="h-4 w-4" /> Transfer</Button><Button onClick={() => setAddOpen(true)} className='text-white'><Plus className="h-4 w-4" /> Add location</Button></div>}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Locations" value={locations.length} icon={<Warehouse className="h-5 w-5" />} />
        <StatTile label="Products tracked" value={products.length} icon={<Store className="h-5 w-5" />} />
        <StatTile label="Total units" value={products.reduce((s, p) => s + p.stock, 0)} icon={<MapPin className="h-5 w-5" />} accent="ink" />
        <StatTile label="Active location" value={<span className="text-base">{locations.find((l) => l.id === activeId)?.name ?? '—'}</span>} icon={<Check className="h-5 w-5" />} accent="canary" />
      </div>

      {/* Location cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((l) => {
          const active = l.id === activeId
          return (
            <Card key={l.id} className={cn('p-4', active && 'ring-2 ring-canary')}>
              <div className="flex items-center gap-3">
                <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl', l.kind === 'warehouse' ? 'bg-ink text-canary' : 'bg-canvas text-ink-soft ring-1 ring-line')}>
                  {l.kind === 'warehouse' ? <Warehouse className="h-5 w-5" /> : <Store className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{l.name}</p>
                  <p className="truncate text-xs text-ink-soft">{l.address ?? l.kind}</p>
                </div>
                {active && <Badge tone="canary" dot>Active</Badge>}
              </div>
              {(() => {
                const lowCount = products.filter((p) => stockStatusAt(p, l.id, locations.length) !== 'ok').length
                return lowCount > 0 ? <div className="mt-3"><Badge tone="warn" dot>{lowCount} low / out of stock</Badge></div> : null
              })()}
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <div>
                  <p className="text-[11px] text-ink-faint">Stock value (cost)</p>
                  <p className="font-bold text-ink tnum">{money(valueAt(l.id))}</p>
                </div>
                {!active && <Button size="sm" variant="outline" onClick={() => { setActive(l.id); toast.success('Active location changed', `Sales now draw stock from ${l.name}.`) }}>Make active</Button>}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Per-location stock matrix */}
      <Card className="overflow-hidden">
        <CardHeader title="Stock by location" subtitle="How every product is spread across your locations." action={
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input className="input h-9 w-52 pl-9 text-sm" placeholder="Search products…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        } />
        <div className="mt-3 overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState title="No products found" className="py-10" />
          ) : (
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-y border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  <th className="px-5 py-2.5">Product</th>
                  {locations.map((l) => <th key={l.id} className="px-3 py-2.5 text-right">{l.name}</th>)}
                  <th className="px-5 py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-0 hover:bg-black/[0.015]">
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink">{p.name}</p>
                      <p className="text-xs text-ink-soft">/{unitAbbr(p.unit)}</p>
                    </td>
                    {locations.map((l) => {
                      const q = stockAt(p, l.id, activeId)
                      const st = stockStatusAt(p, l.id, locations.length)
                      return <td key={l.id} className={cn('px-3 py-3 text-right tnum', st === 'out' ? 'font-semibold text-danger' : st === 'low' ? 'font-semibold text-warn' : q === 0 ? 'text-ink-faint' : 'text-ink')}>{q}</td>
                    })}
                    <td className="px-5 py-3 text-right font-bold tnum text-ink">{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <AddLocationModal open={addOpen} onClose={() => setAddOpen(false)} />
      <TransferModal open={transferOpen} onClose={() => setTransferOpen(false)} />
    </div>
  )
}

function AddLocationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addLocation = useStore((s) => s.addLocation)
  const [name, setName] = useState('')
  const [kind, setKind] = useState<Location['kind']>('shop')
  const [address, setAddress] = useState('')
  const submit = () => {
    if (!name.trim()) return
    addLocation(name.trim(), kind, address.trim() || undefined)
    toast.success('Location added', `${name.trim()} is ready to hold stock.`)
    setName(''); setAddress(''); setKind('shop')
    onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title="Add location" description="A new shop, branch or warehouse to hold stock."
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={submit} disabled={!name.trim()} className='text-white'>Add location</Button></>}>
      <div className="space-y-4">
        <div><label className="label">Location name</label><input className="input" placeholder="e.g. East Legon Branch" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></div>
        <div>
          <label className="label">Type</label>
          <Segmented options={[{ value: 'shop', label: 'Shop / Branch' }, { value: 'warehouse', label: 'Warehouse' }]} value={kind} onChange={(v) => setKind(v as Location['kind'])} className="w-full [&>button]:flex-1" />
        </div>
        <div><label className="label">Address (optional)</label><input className="input" placeholder="Area, city" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
      </div>
    </Modal>
  )
}

function TransferModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const locations = useStore((s) => s.locations)
  const products = useStore((s) => s.products)
  const activeId = useStore((s) => s.activeLocationId)
  const transferStock = useStore((s) => s.transferStock)
  const [productId, setProductId] = useState('')
  const [fromId, setFromId] = useState(locations[0]?.id ?? '')
  const [toId, setToId] = useState(locations[1]?.id ?? locations[0]?.id ?? '')
  const [qty, setQty] = useState('')

  const product = products.find((p) => p.id === productId)
  const available = product ? stockAt(product, fromId, activeId) : 0
  const amount = parseInt(qty) || 0
  const valid = product && fromId !== toId && amount > 0 && amount <= available

  const submit = () => {
    if (!valid) return
    transferStock(productId, fromId, toId, amount)
    toast.success('Stock transferred', `${amount} × ${product!.name} moved.`)
    setProductId(''); setQty('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Transfer stock" description="Move units from one location to another. Your total stock stays the same."
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={submit} disabled={!valid} className='text-white'>Transfer</Button></>}>
      <div className="space-y-4">
        <div>
          <label className="label">Product</label>
          <select className="input" value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">Select a product…</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">From</label>
            <select className="input" value={fromId} onChange={(e) => setFromId(e.target.value)}>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">To</label>
            <select className="input" value={toId} onChange={(e) => setToId(e.target.value)}>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>
        {product && (
          <div className="flex items-center justify-between rounded-xl bg-canvas px-3.5 py-2.5 ring-1 ring-line">
            <span className="text-sm text-ink-soft">Available at source</span>
            <span className="text-sm font-bold text-ink tnum">{available} {unitAbbr(product.unit)}</span>
          </div>
        )}
        <div>
          <label className="label">Quantity</label>
          <input className="input tnum" inputMode="numeric" placeholder="0" value={qty} onChange={(e) => setQty(e.target.value)} />
          {fromId === toId && <p className="mt-1.5 text-xs font-medium text-warn">Choose two different locations.</p>}
          {product && amount > available && <p className="mt-1.5 text-xs font-medium text-brick">Only {available} available at source.</p>}
        </div>
      </div>
    </Modal>
  )
}
