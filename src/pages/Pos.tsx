import { useMemo, useState } from 'react'
import { Search, Minus, Plus, Trash2, ShoppingCart, X, UserPlus } from 'lucide-react'
import { useStore, type CartLine } from '@/store/useStore'
import { useUi } from '@/store/ui'
import { toast } from '@/store/toast'
import { Icon } from '@/components/ui/Icon'
import { Badge, StockPill } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Money } from '@/components/ui/Money'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHero } from '@/components/ui/PageHero'
import { ProductImage } from '@/components/ui/ProductImage'
import { ReceiptModal } from '@/components/ui/Receipt'
import { money } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { PaymentMethod, Sale, SaleItem } from '@/types'
import { stockStatus } from '@/store/selectors'

const METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'cash', label: 'Cash', icon: 'Banknote' },
  { value: 'momo', label: 'MoMo', icon: 'Smartphone' },
  { value: 'card', label: 'Card', icon: 'CreditCard' },
  { value: 'credit', label: 'Credit', icon: 'Clock' },
]

export function PosPage() {
  const products = useStore((s) => s.products)
  const categories = useStore((s) => s.categories)
  const customers = useStore((s) => s.customers)
  const recordSale = useStore((s) => s.recordSale)
  const openModal = useUi((s) => s.openModal)

  const [query, setQuery] = useState('')
  const [cat, setCat] = useState<string>('all')
  const [cart, setCart] = useState<CartLine[]>([])
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [customerId, setCustomerId] = useState('')
  const [cartOpenMobile, setCartOpenMobile] = useState(false)
  const [receipt, setReceipt] = useState<Sale | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter(
      (p) => (cat === 'all' || p.categoryId === cat) && (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)),
    )
  }, [products, query, cat])

  const inCart = (id: string) => cart.find((l) => l.product.id === id)?.qty ?? 0

  const add = (id: string) => {
    const product = products.find((p) => p.id === id)!
    if (product.stock <= 0) return
    setCart((c) => {
      const existing = c.find((l) => l.product.id === id)
      if (existing) {
        if (existing.qty >= product.stock) {
          toast.info('Reached stock limit', `Only ${product.stock} in stock.`)
          return c
        }
        return c.map((l) => (l.product.id === id ? { ...l, qty: l.qty + 1 } : l))
      }
      return [...c, { product, qty: 1 }]
    })
  }
  const dec = (id: string) => setCart((c) => c.flatMap((l) => (l.product.id === id ? (l.qty > 1 ? [{ ...l, qty: l.qty - 1 }] : []) : [l])))
  const removeLine = (id: string) => setCart((c) => c.filter((l) => l.product.id !== id))

  const total = cart.reduce((s, l) => s + l.product.salePrice * l.qty, 0)
  const count = cart.reduce((s, l) => s + l.qty, 0)

  const checkout = () => {
    if (!cart.length) return
    if (method === 'credit' && !customerId) {
      toast.error('Choose a customer', 'Credit sales must be linked to a customer.')
      return
    }
    const items: SaleItem[] = cart.map((l) => ({
      productId: l.product.id,
      name: l.product.name,
      qty: l.qty,
      unitPrice: l.product.salePrice,
      unitCost: l.product.costPrice,
      lineTotal: +(l.product.salePrice * l.qty).toFixed(2),
    }))
    const sale = recordSale({ items, paymentMethod: method, customerId: customerId || undefined })
    setReceipt(sale)
    toast.success(
      method === 'credit' ? 'Credit sale recorded' : 'Sale completed',
      method === 'credit'
        ? `${money(sale.total)} added to customer's balance. No cash added yet.`
        : `${money(sale.total)} received · stock and cash updated.`,
    )
    setCart([])
    setCustomerId('')
    setMethod('cash')
    setCartOpenMobile(false)
  }

  return (
    <div className="min-w-0 space-y-6 overflow-x-clip">
      <PageHero eyebrow="Point of sale" title="Fast checkout. Accurate stock." description="Build an order, choose how the customer paid and let MyShopFlow update the rest." />
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      {/* Catalogue */}
      <div className="min-w-0">
        <div className="mb-4 flex flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />
            <input
              className="input pl-11"
              placeholder="Search products by name or SKU…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 pb-1">
            <CatChip active={cat === 'all'} onClick={() => setCat('all')} label="All" />
            {categories.map((c) => (
              <CatChip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} label={c.name} icon={c.icon} />
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<Search className="h-6 w-6" />} title="No products found" description="Try a different search or category." />
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => {
              const status = stockStatus(p)
              const out = status === 'out'
              const qty = inCart(p.id)
              return (
                <button
                  key={p.id}
                  onClick={() => add(p.id)}
                  disabled={out}
                  className={cn(
                    'group relative flex flex-col rounded-2xl bg-paper p-3.5 text-left ring-1 transition-all duration-300 ease-spring',
                    out ? 'ring-hair opacity-55' : 'cursor-pointer active:scale-[0.98] hover:shadow-card-hover',
                    qty > 0 ? 'ring-2 ring-canary' : 'ring-hair hover:ring-ink/15',
                  )}
                >
                  <div className="flex items-start justify-between">
                    <ProductImage imageUrl={p.imageUrl} imageIndex={p.imageIndex ?? products.findIndex((item) => item.id === p.id)} alt={p.name} className="h-16 w-16 rounded-xl ring-1 ring-black/[0.06]" />
                    <span className="flex items-center gap-1 text-[11px] font-semibold">
                      <span className={cn('h-1.5 w-1.5 rounded-full', status === 'ok' ? 'bg-inflow' : status === 'low' ? 'bg-warn' : 'bg-danger')} />
                      <span className={cn(status === 'ok' ? 'text-ink-faint' : status === 'low' ? 'text-warn' : 'text-danger')}>
                        {status === 'ok' ? `${p.stock}` : status === 'low' ? `${p.stock} left` : 'Out'}
                      </span>
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-[13.5px] font-semibold leading-snug text-ink">{p.name}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[15px] font-extrabold tracking-tightest text-ink tnum">{money(p.salePrice)}</span>
                    {qty > 0 ? (
                      <span className="grid h-6 min-w-[24px] place-items-center rounded-full bg-canary px-1.5 text-[12px] font-bold text-ink">{qty}</span>
                    ) : (
                      <span className={cn('grid h-7 w-7 place-items-center rounded-full bg-ink text-white transition-transform duration-300 ease-spring', !out && 'group-hover:scale-110')}>
                        <Plus className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Cart — desktop */}
      <div className="hidden self-start lg:sticky lg:top-4 lg:block">
        <div>
          <CartPanel
            cart={cart}
            total={total}
            count={count}
            method={method}
            setMethod={setMethod}
            customers={customers}
            customerId={customerId}
            setCustomerId={setCustomerId}
            onInc={add}
            onDec={dec}
            onRemove={removeLine}
            onCheckout={checkout}
            onRegister={() => openModal('registerCustomer')}
          />
        </div>
      </div>

      {/* Cart — mobile floating bar + sheet */}
      {count > 0 && (
        <button
          onClick={() => setCartOpenMobile(true)}
          className="fixed inset-x-4 bottom-24 z-40 flex items-center justify-between rounded-2xl bg-ink px-5 py-3.5 text-white shadow-pop lg:hidden cursor-pointer"
        >
          <span className="flex items-center gap-2 font-semibold"><ShoppingCart className="h-5 w-5" /> {count} item{count > 1 ? 's' : ''}</span>
          <span className="font-bold tnum">{money(total)}</span>
        </button>
      )}
      {cartOpenMobile && (
        <div className="fixed inset-0 z-[95] lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setCartOpenMobile(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-3xl bg-canvas p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-ink">Your cart</h3>
              <button onClick={() => setCartOpenMobile(false)} className="grid h-9 w-9 place-items-center rounded-xl text-ink-soft hover:bg-black/[0.05] cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            <CartPanel
              cart={cart}
              total={total}
              count={count}
              method={method}
              setMethod={setMethod}
              customers={customers}
              customerId={customerId}
              setCustomerId={setCustomerId}
              onInc={add}
              onDec={dec}
              onRemove={removeLine}
              onCheckout={checkout}
              onRegister={() => openModal('registerCustomer')}
            />
          </div>
        </div>
      )}

      <ReceiptModal sale={receipt} open={!!receipt} onClose={() => setReceipt(null)} />
      </div>
    </div>
  )
}

function CatChip({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'chip shrink-0 ring-1',
        active ? 'bg-ink text-white ring-ink' : 'bg-paper text-ink-soft ring-hair hover:ring-ink/25 hover:text-ink',
      )}
    >
      {icon && <Icon name={icon} className="h-4 w-4" strokeWidth={2} />} {label}
    </button>
  )
}

interface CartPanelProps {
  cart: CartLine[]
  total: number
  count: number
  method: PaymentMethod
  setMethod: (m: PaymentMethod) => void
  customers: ReturnType<typeof useStore.getState>['customers']
  customerId: string
  setCustomerId: (id: string) => void
  onInc: (id: string) => void
  onDec: (id: string) => void
  onRemove: (id: string) => void
  onCheckout: () => void
  onRegister: () => void
}

function CartPanel(p: CartPanelProps) {
  return (
    <div className="rounded-2xl bg-paper ring-1 ring-hair shadow-card">
      <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
        <h3 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.08em] text-ink"><ShoppingCart className="h-4 w-4 text-ink-soft" /> Current sale</h3>
        {p.count > 0 && <Badge tone="canary">{p.count} item{p.count > 1 ? 's' : ''}</Badge>}
      </div>

      {p.cart.length === 0 ? (
        <EmptyState icon={<ShoppingCart className="h-6 w-6" />} title="Cart is empty" description="Tap a product to start a sale." className="py-8" />
      ) : (
        <div className="max-h-[38vh] space-y-1 overflow-y-auto p-2 lg:max-h-[42vh]">
          {p.cart.map((l) => (
            <div key={l.product.id} className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-black/[0.02]">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{l.product.name}</p>
                <p className="text-xs text-ink-soft tnum">{money(l.product.salePrice)} each</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => p.onDec(l.product.id)} className="grid h-7 w-7 place-items-center rounded-lg ring-1 ring-hair text-ink transition-colors hover:bg-canvas cursor-pointer"><Minus className="h-3.5 w-3.5" /></button>
                <span className="w-6 text-center text-sm font-bold tnum">{l.qty}</span>
                <button onClick={() => p.onInc(l.product.id)} className="grid h-7 w-7 place-items-center rounded-lg ring-1 ring-hair text-ink transition-colors hover:bg-canvas cursor-pointer"><Plus className="h-3.5 w-3.5" /></button>
              </div>
              <span className="w-16 text-right text-sm font-bold text-ink tnum">{money(l.product.salePrice * l.qty)}</span>
              <button onClick={() => p.onRemove(l.product.id)} aria-label="Remove" className="grid h-7 w-7 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-brick-50 hover:text-brick cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3 border-t border-line p-4">
        <div>
          <p className="eyebrow mb-1.5">Payment method</p>
          <div className="grid grid-cols-4 gap-1.5">
            {METHODS.map((m) => (
              <button
                key={m.value}
                onClick={() => p.setMethod(m.value)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold ring-1 transition-all duration-200 cursor-pointer',
                  p.method === m.value ? 'bg-ink text-white ring-ink' : 'text-ink-soft ring-hair hover:ring-ink/25 hover:text-ink',
                )}
              >
                <Icon name={m.icon} className="h-4 w-4" strokeWidth={2} /> {m.label}
              </button>
            ))}
          </div>
          {p.method === 'credit' && (
            <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-warn/[0.08] px-2.5 py-1.5 text-[12px] font-medium text-warn ring-1 ring-warn/15">
              Credit adds to the customer’s balance — no cash is added until they pay.
            </p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Customer {p.method === 'credit' && <span className="text-brick">*</span>}</p>
            <button onClick={p.onRegister} className="flex items-center gap-1 text-xs font-semibold text-canary-700 hover:underline cursor-pointer"><UserPlus className="h-3.5 w-3.5" /> New</button>
          </div>
          <select className="input py-2 text-sm" value={p.customerId} onChange={(e) => p.setCustomerId(e.target.value)}>
            <option value="">Walk-in customer</option>
            {p.customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-semibold text-ink-soft">Total</span>
          <Money value={p.total} className="text-2xl font-bold text-ink" />
        </div>
        <Button className="w-full" size="lg" disabled={!p.cart.length} onClick={p.onCheckout}>
          {p.method === 'credit' ? 'Record credit sale' : `Charge ${money(p.total)}`}
        </Button>
      </div>
    </div>
  )
}
