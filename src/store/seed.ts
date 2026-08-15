import type {
  ActivityEvent,
  Category,
  Customer,
  CustomerPayment,
  Expense,
  Location,
  PriceTier,
  Product,
  Sale,
  SaleItem,
  StockPurchase,
  Supplier,
  UnitOfMeasure,
  User,
} from '@/types'
import type { CashEvent } from './engine'
import { receiptNo, uid } from '@/lib/utils'
import { priceFor, tierApplied } from '@/lib/pricing'

// Deterministic RNG so the demo looks identical on every fresh seed.
function makeRng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}
const rng = makeRng(20260814)
const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]
const between = (a: number, b: number) => a + Math.floor(rng() * (b - a + 1))
const iso = (daysAgo: number, hour = 9, min = 0) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, min, Math.floor(rng() * 60), 0)
  // Never generate a timestamp in the future (avoids "in 6 hours" on today's rows).
  const now = Date.now()
  if (d.getTime() > now) d.setTime(now - Math.floor(rng() * 90 * 60 * 1000))
  return d.toISOString()
}

export interface SeedState {
  users: User[]
  currentUserId: string
  categories: Category[]
  suppliers: Supplier[]
  locations: Location[]
  products: Product[]
  customers: Customer[]
  sales: Sale[]
  payments: CustomerPayment[]
  expenses: Expense[]
  purchases: StockPurchase[]
  cashEvents: CashEvent[]
  activity: ActivityEvent[]
  openingCash: number
}

export function buildSeed(): SeedState {
  const users: User[] = [
    { id: 'u_ama', name: 'Ama Owusu', role: 'admin', active: true, lastLogin: iso(0, 8, 12) },
    { id: 'u_kofi', name: 'Kofi Asante', role: 'staff', pin: '2468', active: true, lastLogin: iso(0, 8, 40), locationId: 'loc_main' },
    { id: 'u_akos', name: 'Akosua Darko', role: 'staff', pin: '1357', active: true, lastLogin: iso(1, 17, 20), locationId: 'loc_branch' },
  ]

  const categories: Category[] = [
    { id: 'c_bev', name: 'Beverages', icon: 'CupSoda' },
    { id: 'c_prov', name: 'Provisions', icon: 'ShoppingBasket' },
    { id: 'c_cloth', name: 'Clothing', icon: 'Shirt' },
    { id: 'c_acc', name: 'Phone Accessories', icon: 'Smartphone' },
    { id: 'c_elec', name: 'Electronics', icon: 'Headphones' },
    { id: 'c_home', name: 'Household', icon: 'Home' },
  ]

  const suppliers: Supplier[] = [
    { id: 's_accra', name: 'Accra Wholesale Ltd', phone: '024 555 0142' },
    { id: 's_makola', name: 'Makola Distributors', phone: '020 777 3391' },
    { id: 's_tech', name: 'Circle Tech Imports', phone: '055 214 8890' },
  ]

  const locations: Location[] = [
    { id: 'loc_main', name: 'Main Shop', kind: 'shop', address: 'Circle Market, Accra' },
    { id: 'loc_wh', name: 'Central Warehouse', kind: 'warehouse', address: 'Spintex Road, Accra' },
    { id: 'loc_branch', name: 'Madina Branch', kind: 'shop', address: 'Madina Market, Accra' },
  ]

  let productImageIndex = 0
  interface POpts {
    unit?: UnitOfMeasure
    pack?: number
    wholesale?: number
    wholesaleMin?: number
  }
  const P = (
    name: string,
    categoryId: string,
    cost: number,
    sale: number,
    stock: number,
    threshold: number,
    supplierId: string,
    sku: string,
    opts: POpts = {},
  ): Product => ({
    id: uid('p'),
    name,
    sku,
    categoryId,
    costPrice: cost,
    salePrice: sale,
    wholesalePrice: opts.wholesale,
    wholesaleMinQty: opts.wholesaleMin,
    unit: opts.unit ?? 'each',
    packSize: opts.pack,
    stock,
    threshold,
    currency: 'GHS',
    supplierId,
    imageIndex: productImageIndex++,
    createdAt: iso(120),
  })

  const products: Product[] = [
    P('Coca-Cola 350ml', 'c_bev', 3.5, 6, 120, 24, 's_accra', 'BEV-COKE-350', { pack: 24, wholesale: 5, wholesaleMin: 24 }),
    P('Voltic Water 500ml', 'c_bev', 1.2, 2.5, 200, 40, 's_accra', 'BEV-VOLT-500', { pack: 24, wholesale: 2, wholesaleMin: 24 }),
    P('Malta Guinness', 'c_bev', 5, 8, 8, 18, 's_accra', 'BEV-MALT-330', { pack: 24, wholesale: 7, wholesaleMin: 12 }),
    P('Milo Refill 400g', 'c_prov', 28, 42, 34, 12, 's_makola', 'PRV-MILO-400', { pack: 12, wholesale: 38, wholesaleMin: 6 }),
    P('Ideal Milk Tin', 'c_prov', 6.5, 10, 90, 24, 's_makola', 'PRV-IDEAL-TIN', { pack: 48, wholesale: 8.5, wholesaleMin: 24 }),
    P('Indomie Noodles', 'c_prov', 2, 3.5, 240, 48, 's_makola', 'PRV-INDO-70', { pack: 40, wholesale: 3, wholesaleMin: 40 }),
    P('Perfumed Rice 5kg', 'c_prov', 45, 62, 6, 10, 's_makola', 'PRV-RICE-5KG', { wholesale: 56, wholesaleMin: 5 }),
    P('Cotton T-Shirt', 'c_cloth', 25, 55, 40, 10, 's_accra', 'CLO-TSHIRT', { wholesale: 45, wholesaleMin: 10 }),
    P('Ladies Sandals', 'c_cloth', 40, 85, 18, 8, 's_accra', 'CLO-SANDAL', { unit: 'pair', wholesale: 72, wholesaleMin: 6 }),
    P('USB-C Cable', 'c_acc', 8, 20, 60, 15, 's_tech', 'ACC-USBC', { wholesale: 15, wholesaleMin: 20 }),
    P('Power Bank 10000mAh', 'c_acc', 60, 130, 9, 6, 's_tech', 'ACC-PWRBNK', { wholesale: 110, wholesaleMin: 5 }),
    P('Phone Case', 'c_acc', 6, 18, 75, 20, 's_tech', 'ACC-CASE', { wholesale: 13, wholesaleMin: 20 }),
    P('Bluetooth Speaker', 'c_elec', 90, 180, 7, 5, 's_tech', 'ELE-BTSPK', { wholesale: 155, wholesaleMin: 3 }),
    P('Detergent 1kg', 'c_home', 14, 24, 55, 15, 's_makola', 'HOM-DETRG', { wholesale: 20, wholesaleMin: 12 }),
    P('Toilet Roll 10pk', 'c_home', 18, 30, 48, 12, 's_makola', 'HOM-TROLL', { unit: 'pack', wholesale: 26, wholesaleMin: 12 }),
    P('Fanta 350ml', 'c_bev', 3.5, 6, 96, 24, 's_accra', 'BEV-FANTA-350', { pack: 24, wholesale: 5, wholesaleMin: 24 }),
    P('Bel-Aqua Water 750ml', 'c_bev', 1.5, 3, 150, 30, 's_accra', 'BEV-BELA-750', { pack: 12, wholesale: 2.5, wholesaleMin: 24 }),
    P('Kalyppo Juice', 'c_bev', 2.5, 4.5, 110, 24, 's_accra', 'BEV-KAL-250', { pack: 24, wholesale: 3.8, wholesaleMin: 24 }),
    P('Tinned Tomatoes', 'c_prov', 3, 5, 130, 24, 's_makola', 'PRV-TOM-TIN', { pack: 24, wholesale: 4.2, wholesaleMin: 24 }),
    P('Gari 1kg', 'c_prov', 6, 10, 80, 15, 's_makola', 'PRV-GARI-1KG', { unit: 'kg', wholesale: 8.5, wholesaleMin: 10 }),
    P('Sardines Tin', 'c_prov', 4, 7, 100, 20, 's_makola', 'PRV-SARD-TIN', { pack: 50, wholesale: 6, wholesaleMin: 24 }),
    P('Tea Bags 25s', 'c_prov', 5, 9, 70, 15, 's_makola', 'PRV-TEA-25', { unit: 'pack', wholesale: 7.5, wholesaleMin: 12 }),
    P("Men's Polo Shirt", 'c_cloth', 35, 70, 30, 8, 's_accra', 'CLO-POLO', { wholesale: 58, wholesaleMin: 6 }),
    P('Kids T-Shirt', 'c_cloth', 18, 40, 45, 10, 's_accra', 'CLO-KIDTEE', { wholesale: 33, wholesaleMin: 10 }),
    P('Wired Earphones', 'c_acc', 10, 25, 65, 15, 's_tech', 'ACC-EARPH', { wholesale: 19, wholesaleMin: 20 }),
    P('Memory Card 32GB', 'c_acc', 28, 55, 40, 8, 's_tech', 'ACC-SD32', { wholesale: 46, wholesaleMin: 10 }),
    P('LED Bulb 12W', 'c_elec', 9, 18, 90, 20, 's_tech', 'ELE-LED12', { pack: 10, wholesale: 14, wholesaleMin: 20 }),
    P('Rechargeable Fan', 'c_elec', 110, 200, 12, 4, 's_tech', 'ELE-RFAN', { wholesale: 175, wholesaleMin: 3 }),
    P('Bar Soap 3pk', 'c_home', 8, 14, 120, 24, 's_makola', 'HOM-SOAP3', { unit: 'pack', wholesale: 11.5, wholesaleMin: 24 }),
    P('Air Freshener', 'c_home', 12, 22, 60, 12, 's_makola', 'HOM-AIRFR', { wholesale: 18, wholesaleMin: 12 }),
    P('Broom', 'c_home', 10, 20, 35, 8, 's_makola', 'HOM-BROOM', { wholesale: 16, wholesaleMin: 10 }),
  ]

  // Distribute each product's stock across the shop, warehouse and branch so the
  // per-location totals always sum back to `stock` (spec §15 integrity).
  products.forEach((p) => {
    const wh = Math.round(p.stock * 0.45)
    const branch = Math.round(p.stock * 0.2)
    const main = p.stock - wh - branch
    p.stockByLocation = { loc_main: main, loc_wh: wh, loc_branch: branch }
  })

  const customers: Customer[] = [
    { id: 'cu_kwame', name: 'Kwame Mensah', phone: '024 118 4420', outstanding: 0, type: 'retail', registrationMethod: 'manual', createdBy: 'u_ama', createdAt: iso(110), lastVisit: iso(2) },
    { id: 'cu_abena', name: 'Abena Boateng', phone: '020 553 7781', outstanding: 0, type: 'retail', registrationMethod: 'manual', createdBy: 'u_ama', createdAt: iso(95), lastVisit: iso(4) },
    { id: 'cu_yaw', name: 'Yaw Darko', phone: '055 209 6634', outstanding: 0, type: 'retail', registrationMethod: 'voice', createdBy: 'u_kofi', createdAt: iso(20), lastVisit: iso(1), notes: 'Registered by voice at the counter.' },
    { id: 'cu_efua', name: 'Efua Sarpong', phone: '027 884 1290', outstanding: 0, type: 'retail', registrationMethod: 'manual', createdBy: 'u_akos', createdAt: iso(80), lastVisit: iso(9) },
    { id: 'cu_kojo', name: 'Kojo Antwi', phone: '024 771 3345', outstanding: 0, type: 'wholesale', company: 'Antwi Provisions', registrationMethod: 'manual', createdBy: 'u_ama', createdAt: iso(70), lastVisit: iso(6) },
    { id: 'cu_adwoa', name: 'Adwoa Agyeman', phone: '059 442 1176', outstanding: 0, type: 'retail', registrationMethod: 'voice', createdBy: 'u_akos', createdAt: iso(15), lastVisit: iso(3) },
    { id: 'cu_ibrahim', name: 'Ibrahim Mohammed', phone: '026 330 5528', outstanding: 0, type: 'wholesale', company: 'Mohammed Trading Co.', registrationMethod: 'manual', createdBy: 'u_ama', createdAt: iso(60), lastVisit: iso(12) },
    { id: 'cu_frimpong', name: 'Grace Frimpong', phone: '020 611 4408', outstanding: 0, type: 'wholesale', company: 'Frimpong Distribution', registrationMethod: 'manual', createdBy: 'u_ama', createdAt: iso(50), lastVisit: iso(5) },
  ]

  const sales: Sale[] = []
  const payments: CustomerPayment[] = []
  const activity: ActivityEvent[] = []

  const staff = ['u_ama', 'u_kofi', 'u_akos']
  const outMap: Record<string, number> = {}

  // --- Generate ~120 days of sales history -------------------------------
  for (let day = 120; day >= 0; day--) {
    const dow = new Date(Date.now() - day * 86_400_000).getDay()
    const isSat = dow === 6
    const isSun = dow === 0
    const count = isSat ? between(4, 7) : isSun ? between(1, 2) : between(2, 4)
    for (let n = 0; n < count; n++) {
      // Decide the customer first — wholesale accounts buy in bulk at bulk prices.
      const customer = rng() < 0.22 ? pick(customers) : undefined
      const tier: PriceTier = customer?.type === 'wholesale' ? 'wholesale' : 'retail'
      const itemCount = between(1, 3)
      const items: SaleItem[] = []
      let subtotal = 0
      for (let i = 0; i < itemCount; i++) {
        const p = pick(products)
        const min = p.wholesaleMinQty ?? 6
        const qty = tier === 'wholesale' ? between(min, min + 12) : between(1, 3)
        const unitPrice = priceFor(p, tier, qty)
        const lineTotal = +(unitPrice * qty).toFixed(2)
        subtotal += lineTotal
        items.push({ productId: p.id, name: p.name, qty, unitPrice, unitCost: p.costPrice, lineTotal, unit: p.unit, tier: tierApplied(p, tier, qty) })
      }
      subtotal = +subtotal.toFixed(2)
      const roll = rng()
      let method =
        tier === 'wholesale'
          ? roll < 0.4 ? 'momo' : roll < 0.7 ? 'credit' : 'cash'
          : roll < 0.46 ? 'cash' : roll < 0.82 ? 'momo' : roll < 0.92 ? 'card' : 'credit'
      if (method === 'credit' && !customer) method = 'cash' // walk-ins can't run a tab
      const isCredit = method === 'credit'
      const userId = pick(staff)
      const sale: Sale = {
        id: uid('sale'),
        receiptNo: receiptNo(),
        items,
        subtotal,
        total: subtotal,
        paymentMethod: method as Sale['paymentMethod'],
        tier,
        paid: !isCredit,
        amountPaid: isCredit ? 0 : subtotal,
        customerId: customer?.id,
        userId,
        createdAt: iso(day, between(8, 19), between(0, 59)),
      }
      sales.push(sale)
      if (isCredit && customer) outMap[customer.id] = (outMap[customer.id] ?? 0) + subtotal
    }
  }

  // Customers pay down most of their credit - a real shop chases balances, so
  // outstanding stays modest (a few thousand cedis, in line with the spec examples).
  for (const c of customers) {
    const owed = outMap[c.id] ?? 0
    if (owed < 40) continue
    // Most customers clear 60-95% of what they owe, some in two instalments.
    const instalments = owed > 400 && rng() < 0.6 ? 2 : 1
    const target = owed * (0.4 + rng() * 0.35)
    let paidSoFar = 0
    for (let k = 0; k < instalments; k++) {
      const remainingTarget = target - paidSoFar
      const pay = +(instalments === 2 && k === 0 ? remainingTarget * (0.4 + rng() * 0.3) : remainingTarget).toFixed(2)
      if (pay < 5) break
      paidSoFar += pay
      payments.push({
        id: uid('pay'),
        customerId: c.id,
        amount: pay,
        method: rng() < 0.5 ? 'momo' : 'cash',
        userId: pick(staff),
        createdAt: iso(between(1, 30), between(9, 18)),
        note: instalments === 2 ? `Instalment ${k + 1}` : 'Part payment',
      })
    }
    outMap[c.id] = +Math.max(0, owed - paidSoFar).toFixed(2)
  }
  customers.forEach((c) => (c.outstanding = +(outMap[c.id] ?? 0).toFixed(2)))

  // --- Expenses over the period ------------------------------------------
  const expenses: Expense[] = []
  const E = (category: string, amount: number, day: number, note?: string): Expense => ({
    id: uid('exp'),
    category,
    amount,
    method: 'momo',
    note,
    userId: 'u_ama',
    createdAt: iso(day, between(8, 17)),
  })
  for (const m of [105, 75, 45, 15]) {
    expenses.push(E('Rent', 1500, m, 'Monthly shop rent'))
    expenses.push(E('Wages', 1200, m - 2, 'Staff wages'))
    expenses.push(E('Electricity', between(280, 460), m - 5, 'ECG bill'))
    expenses.push(E('Water', between(60, 110), m - 6))
    expenses.push(E('Internet', 250, m - 3, 'Data bundle'))
  }
  expenses.push(E('Transport', 120, 8, 'Trotro & delivery'))
  expenses.push(E('Transport', 90, 22, 'Cargo pickup'))

  // --- Stock purchases (restocks) ----------------------------------------
  // A real shop spends most of its takings restocking. We generate roughly-weekly
  // purchases whose total tracks the cost of goods actually sold (~88%), so cash
  // out ≈ COGS and the closing balance reflects real profit, not runaway takings.
  const totalCogs = sales.reduce((sum, s) => sum + s.items.reduce((a, it) => a + it.unitCost * it.qty, 0), 0)
  const purchaseTarget = totalCogs * 0.88
  const purchases: StockPurchase[] = []
  let purchased = 0
  let pday = 116
  while (purchased < purchaseTarget && pday >= 2) {
    const p = pick(products)
    const qty = between(15, 90)
    const total = +(qty * p.costPrice).toFixed(2)
    purchases.push({
      id: uid('pur'),
      productId: p.id,
      productName: p.name,
      qty,
      unitCost: p.costPrice,
      total,
      supplierId: p.supplierId,
      paid: true,
      method: rng() < 0.5 ? 'cash' : 'momo',
      userId: 'u_ama',
      createdAt: iso(pday, between(9, 16)),
    })
    purchased += total
    pday -= between(3, 8) // roughly weekly restocks
  }

  // --- Cash-only events: investing + financing (spec §8) -----------------
  const cashEvents: CashEvent[] = [
    { id: uid('ce'), createdAt: iso(90, 9), type: 'financing', direction: 'in', amount: 5000, category: 'Owner Funding', source: 'owner_funding', userId: 'u_ama', description: 'Owner added capital to the business' },
    { id: uid('ce'), createdAt: iso(55, 15), type: 'investing', direction: 'out', amount: 3500, category: 'Equipment', source: 'asset_purchase', userId: 'u_ama', description: 'Bought a POS laptop for the shop' },
    { id: uid('ce'), createdAt: iso(78, 12), type: 'financing', direction: 'out', amount: 1200, category: 'Owner Withdrawal', source: 'owner_withdrawal', userId: 'u_ama', description: 'Owner personal withdrawal' },
    { id: uid('ce'), createdAt: iso(48, 12), type: 'financing', direction: 'out', amount: 1500, category: 'Owner Withdrawal', source: 'owner_withdrawal', userId: 'u_ama', description: 'Owner personal withdrawal' },
    { id: uid('ce'), createdAt: iso(18, 12), type: 'financing', direction: 'out', amount: 1500, category: 'Owner Withdrawal', source: 'owner_withdrawal', userId: 'u_ama', description: 'Owner personal withdrawal' },
  ]

  // --- Seed a few recent activity entries --------------------------------
  const now120 = sales.slice(-8)
  now120.forEach((s) => {
    activity.push({
      id: uid('act'),
      createdAt: s.createdAt,
      action: 'Sale completed',
      module: 'sales',
      refId: s.receiptNo,
      userId: s.userId,
      userName: users.find((u) => u.id === s.userId)?.name ?? 'Staff',
      detail: `${s.items.length} item(s) · ${s.paymentMethod.toUpperCase()}`,
    })
  })
  activity.push({
    id: uid('act'),
    createdAt: iso(1, 11, 15),
    action: 'Customer registered by voice',
    module: 'customers',
    refId: 'cu_yaw',
    userId: 'u_kofi',
    userName: 'Kofi Asante',
    detail: 'Yaw Darko',
  })
  activity.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return {
    users,
    currentUserId: 'u_ama',
    categories,
    suppliers,
    locations,
    products,
    customers,
    sales,
    payments,
    expenses,
    purchases,
    cashEvents,
    activity,
    openingCash: 5000,
  }
}
