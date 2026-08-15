import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Plus, Minus, Pencil, PackagePlus, ChevronRight, Boxes, ImagePlus, Trash2, FolderPlus, X } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useCan } from '@/store/access'
import { toast } from '@/store/toast'
import { Icon } from '@/components/ui/Icon'
import { Badge, StockPill } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { StatTile } from '@/components/ui/StatTile'
import { EmptyState } from '@/components/ui/EmptyState'
import { Explain } from '@/components/ui/Explain'
import { PageHero } from '@/components/ui/PageHero'
import { ProductImage } from '@/components/ui/ProductImage'
import { money } from '@/lib/format'
import { UNIT_LABEL, UNIT_OPTIONS, unitAbbr, hasWholesale } from '@/lib/pricing'
import { fmtDate } from '@/lib/datetime'
import { cn } from '@/lib/utils'
import type { Product, ProductAttributes, UnitOfMeasure } from '@/types'
import { inventoryValue, lowStock, retailValue, scopeProductsToLocation, stockStatus } from '@/store/selectors'

type StatusFilter = 'all' | 'ok' | 'low' | 'out'

export function ProductsPage() {
  const rawProducts = useStore((s) => s.products)
  const activeLocationId = useStore((s) => s.activeLocationId)
  // Stock, value and low-stock reflect the active location (staff = their branch).
  const products = useMemo(() => scopeProductsToLocation(rawProducts, activeLocationId), [rawProducts, activeLocationId])
  const categories = useStore((s) => s.categories)
  const adjustStock = useStore((s) => s.adjustStock)
  const canCost = useCan('costPrice')
  const [params, setParams] = useSearchParams()

  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [addOpen, setAddOpen] = useState(false)
  const [detail, setDetail] = useState<Product | null>(null)
  const [editing, setEditing] = useState<Product | null>(null)

  useEffect(() => {
    if (params.get('add') === '1') {
      setAddOpen(true)
      params.delete('add')
      setParams(params, { replace: true })
    }
  }, [params, setParams])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter(
      (p) =>
        (cat === 'all' || p.categoryId === cat) &&
        (status === 'all' || stockStatus(p) === status) &&
        (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)),
    )
  }, [products, query, cat, status])

  const low = lowStock(products)

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Inventory control" title="Know exactly what is on your shelves" description="Monitor stock health, pricing and inventory value from one focused workspace." action={<Button onClick={() => setAddOpen(true)} className='text-white'><Plus className="h-4 w-4" /> Add product</Button>} />
      {/* Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Products" value={products.length} icon={<Boxes className="h-5 w-5" />} hint="active items" />
        <StatTile label="Retail value" value={money(retailValue(products))} icon={<Icon name="Tag" className="h-5 w-5" />} hint="at sale price" accent="ink" />
        {canCost && <StatTile label="Inventory value" term="Inventory Value" value={money(inventoryValue(products))} icon={<Icon name="Wallet" className="h-5 w-5" />} hint="at cost" accent="inflow" />}
        <StatTile label="Needs attention" value={low.length} icon={<Icon name="PackageMinus" className="h-5 w-5" />} hint="low / out of stock" accent="brick" />
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />
          <input className="input pl-11" placeholder="Search products…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <select className="input w-auto py-2.5" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="input w-auto py-2.5" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
            <option value="all">Any stock</option>
            <option value="ok">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
          <Button className="shrink-0 sm:hidden" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add</Button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState icon={<Search className="h-6 w-6" />} title="No products match" description="Adjust your filters or add a new product." action={<Button onClick={() => setAddOpen(true)} className="text-white"><Plus className="h-4 w-4" /> Add product</Button>} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="group flex items-center gap-3 rounded-2xl bg-paper p-4 ring-1 ring-black/[0.06] shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover">
              <ProductImage imageUrl={p.imageUrl} imageIndex={p.imageIndex ?? products.findIndex((item) => item.id === p.id)} alt={p.name} className="h-16 w-16 shrink-0 rounded-xl ring-1 ring-black/[0.06]" />
              <div className="min-w-0 flex-1">
                <button onClick={() => setDetail(p)} className="block max-w-full truncate text-left text-sm font-semibold text-ink hover:text-canary-700 cursor-pointer">{p.name}</button>
                <p className="text-xs text-ink-soft tnum">{money(p.salePrice)}{canCost && <span className="text-ink-soft/70"> · cost {money(p.costPrice)}</span>}</p>
                <div className="mt-1.5"><StockPill product={p} /></div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <button onClick={() => { adjustStock(p.id, 1) }} aria-label="Increase stock" className="grid h-8 w-8 place-items-center rounded-lg border border-hair text-ink hover:bg-black/[0.04] cursor-pointer"><Plus className="h-4 w-4" /></button>
                <span className="text-sm font-bold tnum">{p.stock}</span>
                <button onClick={() => adjustStock(p.id, -1)} aria-label="Decrease stock" className="grid h-8 w-8 place-items-center rounded-lg border border-hair text-ink hover:bg-black/[0.04] cursor-pointer"><Minus className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddProductModal open={addOpen} onClose={() => setAddOpen(false)} />
      <ProductDetailModal product={detail} onClose={() => setDetail(null)} onEdit={(product) => { setDetail(null); setEditing(product) }} />
      <EditProductModal product={editing} onClose={() => setEditing(null)} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Two-step Add Product: category first, details second (spec §5).
// ---------------------------------------------------------------------------
const ATTR_FIELDS: { key: keyof ProductAttributes; label: string }[] = [
  { key: 'serialNumber', label: 'Serial number' },
  { key: 'storage', label: 'Storage' },
  { key: 'colour', label: 'Colour' },
  { key: 'dimensions', label: 'Dimensions' },
  { key: 'size', label: 'Size' },
  { key: 'weight', label: 'Weight' },
  { key: 'volume', label: 'Volume' },
]

function AddProductModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const categories = useStore((s) => s.categories)
  const suppliers = useStore((s) => s.suppliers)
  const addProduct = useStore((s) => s.addProduct)
  const addCategory = useStore((s) => s.addCategory)
  const canCost = useCan('costPrice')
  const [step, setStep] = useState(1)
  const [categoryId, setCategoryId] = useState('')
  const emptyForm = { name: '', sku: '', costPrice: '', salePrice: '', wholesalePrice: '', wholesaleMinQty: '', unit: 'each' as UnitOfMeasure, packSize: '', stock: '', threshold: '10', supplierId: '' }
  const [form, setForm] = useState(emptyForm)
  const [attrsOn, setAttrsOn] = useState(false)
  const [attrs, setAttrs] = useState<ProductAttributes>({})
  const [imageUrl, setImageUrl] = useState<string>()
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [categoryName, setCategoryName] = useState('')

  useEffect(() => {
    if (open) {
      setStep(1); setCategoryId(''); setForm(emptyForm); setAttrsOn(false); setAttrs({}); setImageUrl(undefined); setCreatingCategory(false); setCategoryName('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const save = () => {
    if (!form.name || !form.salePrice) return
    const wholesale = parseFloat(form.wholesalePrice)
    addProduct({
      name: form.name,
      sku: form.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      categoryId,
      costPrice: parseFloat(form.costPrice) || 0,
      salePrice: parseFloat(form.salePrice) || 0,
      wholesalePrice: wholesale > 0 ? wholesale : undefined,
      wholesaleMinQty: wholesale > 0 ? parseInt(form.wholesaleMinQty) || 1 : undefined,
      unit: form.unit,
      packSize: parseInt(form.packSize) || undefined,
      stock: parseInt(form.stock) || 0,
      threshold: parseInt(form.threshold) || 10,
      supplierId: form.supplierId || undefined,
      attributes: attrsOn ? attrs : undefined,
      imageUrl,
    })
    toast.success('Product added', `${form.name} is now in your inventory.`)
    onClose()
  }

  const createCategory = () => {
    const name = categoryName.trim()
    if (!name) return
    const existing = categories.find((category) => category.name.toLowerCase() === name.toLowerCase())
    if (existing) {
      setCategoryId(existing.id)
      toast.info('Category already exists', `${existing.name} has been selected.`)
    } else {
      addCategory(name, 'Package')
      const created = useStore.getState().categories.at(-1)
      if (created) setCategoryId(created.id)
      toast.success('Category created', `${name} is ready to use.`)
    }
    setCategoryName('')
    setCreatingCategory(false)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add product"
      description={step === 1 ? 'Step 1 of 2 - choose a category' : 'Step 2 of 2 - product details'}
      footer={
        step === 1 ? (
          <>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => setStep(2)} disabled={!categoryId} className='text-white'>Continue <ChevronRight className="h-4 w-4" /></Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={save} disabled={!form.name || !form.salePrice} className='text-white'>Save product</Button>
          </>
        )
      }
    >
      {step === 1 ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-2xl border p-4 transition-colors cursor-pointer',
                categoryId === c.id ? 'border-canary bg-canary-50' : 'border-hair hover:border-ink/30',
              )}
            >
              <Icon name={c.icon ?? 'Package'} className="h-6 w-6 text-ink" />
              <span className="text-sm font-semibold text-ink">{c.name}</span>
            </button>
            ))}
            {!creatingCategory && <button type="button" onClick={() => setCreatingCategory(true)} className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-canary/60 bg-canary-50/50 p-4 text-canary-700 transition-colors hover:bg-canary-50"><FolderPlus className="h-6 w-6" /><span className="text-sm font-semibold">New category</span></button>}
          </div>
          {creatingCategory && (
            <div className="rounded-2xl border border-canary/30 bg-canary-50 p-3.5">
              <label className="label" htmlFor="new-category">Category name</label>
              <div className="flex gap-2"><input id="new-category" autoFocus className="input bg-white" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); createCategory() } }} placeholder="e.g. Frozen Foods" /><Button type="button" onClick={createCategory} disabled={!categoryName.trim()} className="shrink-0 text-white">Create</Button><button type="button" aria-label="Cancel category creation" onClick={() => { setCreatingCategory(false); setCategoryName('') }} className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl text-ink-soft hover:bg-white"><X className="h-4 w-4" /></button></div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <ImageUpload value={imageUrl} onChange={setImageUrl} />
          <div>
            <label className="label" htmlFor="np-name">Product name</label>
            <input id="np-name" className="input" placeholder="e.g. Coca-Cola 350ml" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="np-sku">SKU</label>
              <input id="np-sku" className="input" placeholder="auto" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="np-stock">Opening stock</label>
              <input id="np-stock" className="input tnum" inputMode="numeric" placeholder="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {canCost && (
              <div>
                <label className="label" htmlFor="np-cost">Cost price</label>
                <input id="np-cost" className="input tnum" inputMode="decimal" placeholder="0.00" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
              </div>
            )}
            <div>
              <label className="label" htmlFor="np-sale">Retail price</label>
              <input id="np-sale" className="input tnum" inputMode="decimal" placeholder="0.00" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="np-unit">Sold by (unit)</label>
              <select id="np-unit" className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value as UnitOfMeasure })}>
                {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{UNIT_LABEL[u].name} ({UNIT_LABEL[u].abbr})</option>)}
              </select>
            </div>
            <div>
              <label className="label flex items-center" htmlFor="np-pack">Units per pack <Explain text="If you buy in cartons/packs but sell in single units, enter how many units are in one pack." /></label>
              <input id="np-pack" className="input tnum" inputMode="numeric" placeholder="e.g. 24" value={form.packSize} onChange={(e) => setForm({ ...form, packSize: e.target.value })} />
            </div>
          </div>
          <div className="rounded-xl bg-canvas ring-1 ring-line p-3">
            <p className="mb-2 flex items-center text-[13px] font-semibold text-ink">Wholesale pricing <Explain text="An optional bulk price applied when a wholesale customer buys at least the minimum quantity." /></p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="np-whole">Wholesale price</label>
                <input id="np-whole" className="input tnum" inputMode="decimal" placeholder="optional" value={form.wholesalePrice} onChange={(e) => setForm({ ...form, wholesalePrice: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="np-wmin">Min quantity</label>
                <input id="np-wmin" className="input tnum" inputMode="numeric" placeholder="e.g. 12" value={form.wholesaleMinQty} onChange={(e) => setForm({ ...form, wholesaleMinQty: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="np-thr">Low-stock alert at</label>
              <input id="np-thr" className="input tnum" inputMode="numeric" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="np-sup">Supplier</label>
              <select id="np-sup" className="input" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                <option value="">None</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="rounded-xl border border-hair p-3">
            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-sm font-semibold text-ink">Add optional attributes</span>
              <input type="checkbox" checked={attrsOn} onChange={(e) => setAttrsOn(e.target.checked)} className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-hair transition-colors checked:bg-canary relative before:absolute before:top-0.5 before:left-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-4" />
            </label>
            {attrsOn && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {ATTR_FIELDS.map((f) => (
                  <input key={f.key} className="input py-2 text-sm" placeholder={f.label} value={attrs[f.key] ?? ''} onChange={(e) => setAttrs({ ...attrs, [f.key]: e.target.value })} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// Product detail + restock + stock movement (spec §5)
// ---------------------------------------------------------------------------
function ProductDetailModal({ product, onClose, onEdit }: { product: Product | null; onClose: () => void; onEdit: (product: Product) => void }) {
  const sales = useStore((s) => s.sales)
  const suppliers = useStore((s) => s.suppliers)
  const categories = useStore((s) => s.categories)
  const restock = useStore((s) => s.restock)
  const canCost = useCan('costPrice')
  const [qty, setQty] = useState('')
  const [cost, setCost] = useState('')

  useEffect(() => {
    if (product) { setQty(''); setCost(String(product.costPrice)) }
  }, [product])

  const movement = useMemo(() => {
    if (!product) return []
    return sales
      .filter((s) => s.items.some((it) => it.productId === product.id))
      .slice(-8)
      .reverse()
      .map((s) => {
        const line = s.items.find((it) => it.productId === product.id)!
        return { date: s.createdAt, qty: line.qty, ref: s.receiptNo }
      })
  }, [product, sales])

  if (!product) return null
  const supplier = suppliers.find((s) => s.id === product.supplierId)
  const category = categories.find((c) => c.id === product.categoryId)

  const doRestock = () => {
    const q = parseInt(qty) || 0
    if (q <= 0) return
    restock(product.id, q, parseFloat(cost) || product.costPrice, 'cash', true)
    toast.success('Stock received', `${q} × ${product.name} added. Cash reduced by ${money(q * (parseFloat(cost) || product.costPrice))}.`)
    setQty('')
    onClose()
  }

  return (
    <Modal open={!!product} onClose={onClose} title={product.name} description={`${category?.name ?? ''} · ${product.sku}`} size="lg">
      <div className="mb-4 flex justify-end"><Button size="sm" variant="outline" onClick={() => onEdit(product)}><Pencil className="h-4 w-4" /> Edit product</Button></div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-3">
          <ProductImage imageUrl={product.imageUrl} imageIndex={product.imageIndex} alt={product.name} className="h-44 w-full rounded-2xl ring-1 ring-black/[0.06]" />
          <Row label="Sale price" value={money(product.salePrice)} />
          {canCost && <Row label="Cost price" value={money(product.costPrice)} />}
          {canCost && <Row label="Inventory value" value={money(product.costPrice * product.stock)} />}
          <Row label="In stock" value={<div className="flex items-center gap-2"><span className="tnum font-bold">{product.stock}</span> <StockPill product={product} /></div>} />
          <Row label="Low-stock alert" value={`${product.threshold} units`} />
          <Row label="Supplier" value={supplier?.name ?? '-'} />
          {product.attributes && Object.entries(product.attributes).filter(([, v]) => v).map(([k, v]) => (
            <Row key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())} value={String(v)} />
          ))}

          <div className="rounded-xl border border-hair p-3">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink"><PackagePlus className="h-4 w-4" /> Restock</p>
            <div className="grid grid-cols-2 gap-2">
              <input className="input py-2 text-sm tnum" inputMode="numeric" placeholder="Qty" value={qty} onChange={(e) => setQty(e.target.value)} />
              {canCost && <input className="input py-2 text-sm tnum" inputMode="decimal" placeholder="Unit cost" value={cost} onChange={(e) => setCost(e.target.value)} />}
            </div>
            <Button className="mt-2 w-full" size="sm" onClick={doRestock} disabled={!qty}>Add stock &amp; record purchase</Button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Recent stock movement</p>
          {movement.length === 0 ? (
            <EmptyState title="No sales yet" description="Sales of this product will appear here." className="py-8" />
          ) : (
            <div className="space-y-1.5">
              {movement.map((m, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-canvas px-3 py-2 text-sm">
                  <span className="text-ink-soft">{fmtDate(m.date)}</span>
                  <Badge tone="brick">−{m.qty} sold</Badge>
                  <span className="text-xs text-ink-soft">{m.ref}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-hair py-2 last:border-0">
      <span className="text-sm text-ink-soft">{label}</span>
      <span className="text-sm font-semibold text-ink">{value}</span>
    </div>
  )
}

function EditProductModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const updateProduct = useStore((s) => s.updateProduct)
  const canCost = useCan('costPrice')
  const [form, setForm] = useState({ name: '', sku: '', costPrice: '', salePrice: '', threshold: '' })
  const [imageUrl, setImageUrl] = useState<string>()

  useEffect(() => {
    if (!product) return
    setForm({ name: product.name, sku: product.sku, costPrice: String(product.costPrice), salePrice: String(product.salePrice), threshold: String(product.threshold) })
    setImageUrl(product.imageUrl)
  }, [product])

  if (!product) return null
  const save = () => {
    if (!form.name.trim() || !form.salePrice) return
    updateProduct(product.id, { name: form.name.trim(), sku: form.sku.trim(), costPrice: parseFloat(form.costPrice) || 0, salePrice: parseFloat(form.salePrice) || 0, threshold: parseInt(form.threshold) || 0, imageUrl })
    toast.success('Product updated', `${form.name.trim()} was saved.`)
    onClose()
  }

  return (
    <Modal open={!!product} onClose={onClose} title="Edit product" description="Update product details and catalogue image." size="lg" footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>Save changes</Button></>}>
      <div className="space-y-5">
        <ImageUpload value={imageUrl} onChange={setImageUrl} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="label">Product name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">SKU</label><input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
          <div><label className="label">Low-stock alert</label><input className="input tnum" inputMode="numeric" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} /></div>
          {canCost && <div><label className="label">Cost price</label><input className="input tnum" inputMode="decimal" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} /></div>}
          <div><label className="label">Sale price</label><input className="input tnum" inputMode="decimal" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} /></div>
        </div>
      </div>
    </Modal>
  )
}

function ImageUpload({ value, onChange }: { value?: string; onChange: (value?: string) => void }) {
  const upload = async (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Unsupported file', 'Choose a JPG, PNG or WebP image.')
    if (file.size > 8 * 1024 * 1024) return toast.error('Image is too large', 'Choose an image smaller than 8 MB.')
    onChange(await compressProductImage(file))
  }
  return (
    <div>
      <label className="label">Product image</label>
      <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-hair bg-canvas/60 p-3 sm:flex-row sm:items-center">
        {value ? <img src={value} alt="Product preview" className="h-24 w-full rounded-xl object-cover ring-1 ring-black/[0.06] sm:w-24" /> : <span className="grid h-24 w-full place-items-center rounded-xl bg-white text-ink-faint ring-1 ring-hair sm:w-24"><ImagePlus className="h-6 w-6" /></span>}
        <div className="flex-1"><p className="text-sm font-semibold text-ink">Upload a clear product photo</p><p className="mt-1 text-xs text-ink-soft">JPG, PNG or WebP · automatically resized for the catalogue.</p><div className="mt-3 flex flex-wrap gap-2"><label className="btn h-9 bg-white px-3.5 text-[13px] text-ink ring-1 ring-hair hover:bg-canvas"><ImagePlus className="h-4 w-4" /> {value ? 'Replace' : 'Choose image'}<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => upload(e.target.files?.[0])} /></label>{value && <button type="button" onClick={() => onChange(undefined)} className="btn h-9 px-3 text-[13px] text-brick hover:bg-brick-50"><Trash2 className="h-4 w-4" /> Remove</button>}</div></div>
      </div>
    </div>
  )
}

function compressProductImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const max = 720
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}
