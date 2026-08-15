// ---------------------------------------------------------------------------
// MyShopFlow domain types
// ---------------------------------------------------------------------------

export type Role = 'admin' | 'staff'

export type CurrencyCode = 'GHS' | 'USD' | 'EUR' | 'CNY' | 'TRY' | 'XOF'

export type PaymentMethod = 'cash' | 'momo' | 'card' | 'credit'

export type RegistrationMethod = 'manual' | 'voice'

/** Pricing channel — retail (walk-in) vs wholesale (bulk / business accounts). */
export type PriceTier = 'retail' | 'wholesale'

/** Unit a product is stocked and sold in — supports any physical goods. */
export type UnitOfMeasure =
  | 'each'
  | 'pack'
  | 'carton'
  | 'box'
  | 'dozen'
  | 'kg'
  | 'g'
  | 'litre'
  | 'ml'
  | 'metre'
  | 'pair'
  | 'set'

/** Cash-flow classification (spec §8). */
export type CashType = 'operating' | 'investing' | 'financing'
export type CashDirection = 'in' | 'out'

/** What originally created a cash movement - used for drill-down (spec §8/§9). */
export type CashSource =
  | 'sale'
  | 'customer_payment'
  | 'expense'
  | 'stock_purchase'
  | 'asset_purchase'
  | 'owner_funding'
  | 'owner_withdrawal'
  | 'loan_received'
  | 'loan_repayment'
  | 'adjustment'

export type ActivityModule =
  | 'sales'
  | 'inventory'
  | 'customers'
  | 'cashflow'
  | 'expenses'
  | 'settings'
  | 'staff'
  | 'suppliers'

export interface User {
  id: string
  name: string
  role: Role
  pin?: string
  active: boolean
  lastLogin?: string
  /** Staff are assigned to one location and only see that location. Admins see all. */
  locationId?: string
}

export interface Supplier {
  id: string
  name: string
  phone?: string
}

/** A stock-holding location — a shop, branch or warehouse (spec: scale to branches). */
export interface Location {
  id: string
  name: string
  kind: 'shop' | 'warehouse'
  address?: string
}

export interface Category {
  id: string
  name: string
  /** lucide icon name used by the UI layer */
  icon?: string
}

/** Optional attributes stay hidden until enabled (spec §5). */
export interface ProductAttributes {
  serialNumber?: string
  storage?: string
  colour?: string
  dimensions?: string
  size?: string
  weight?: string
  volume?: string
}

export interface Product {
  id: string
  name: string
  sku: string
  categoryId: string
  costPrice: number // admin-only in the UI
  salePrice: number // retail price per unit
  /** Wholesale (bulk) price per unit — optional. */
  wholesalePrice?: number
  /** Minimum quantity to qualify for the wholesale price. */
  wholesaleMinQty?: number
  /** The unit this product is stocked and sold in. */
  unit: UnitOfMeasure
  /** Units contained in one purchase pack/carton (buy in packs, sell in units). */
  packSize?: number
  /** Total stock across all locations. */
  stock: number
  /** Per-location stock breakdown; sums to `stock`. Absent = single location. */
  stockByLocation?: Record<string, number>
  threshold: number
  currency: CurrencyCode
  supplierId?: string
  /** Optional barcode for scanning at the counter or receiving. */
  barcode?: string
  /** Cell index in the shared 4x4 catalogue image sprite. */
  imageIndex?: number
  /** User-uploaded product image stored as a compressed data URL. */
  imageUrl?: string
  attributes?: ProductAttributes
  createdAt: string
}

export interface SaleItem {
  productId: string
  name: string
  qty: number
  unitPrice: number
  unitCost: number // captured at sale time for COGS/profit
  lineTotal: number
  unit?: UnitOfMeasure
  /** Pricing tier applied to this line (retail vs wholesale). */
  tier?: PriceTier
}

export interface Sale {
  id: string
  receiptNo: string
  items: SaleItem[]
  subtotal: number
  total: number
  paymentMethod: PaymentMethod
  /** Pricing channel this sale used. */
  tier: PriceTier
  /** Location the sale was made at. */
  locationId?: string
  /** false for a credit sale until settled */
  paid: boolean
  amountPaid: number
  customerId?: string
  userId: string
  createdAt: string
}

export interface CustomerPayment {
  id: string
  customerId: string
  amount: number
  method: Exclude<PaymentMethod, 'credit'>
  userId: string
  createdAt: string
  note?: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  outstanding: number
  notes?: string
  registrationMethod: RegistrationMethod
  /** retail (walk-in) or wholesale (business account that gets bulk pricing). */
  type: PriceTier
  /** Business name for wholesale accounts. */
  company?: string
  createdBy: string
  createdAt: string
  lastVisit?: string
}

export interface Expense {
  id: string
  category: string
  amount: number
  method: Exclude<PaymentMethod, 'credit'>
  note?: string
  userId: string
  createdAt: string
}

export interface StockPurchase {
  id: string
  productId: string
  productName: string
  qty: number
  unitCost: number
  total: number
  supplierId?: string
  paid: boolean
  method: Exclude<PaymentMethod, 'credit'>
  userId: string
  createdAt: string
}

/** The canonical record of money entering/leaving the business (spec §8). */
export interface CashTxn {
  id: string
  createdAt: string
  type: CashType
  direction: CashDirection
  amount: number
  category: string
  method: Exclude<PaymentMethod, 'credit'>
  source: CashSource
  sourceId?: string
  userId: string
  description: string
  /** running balance immediately after this movement */
  balanceAfter: number
}

export interface ActivityEvent {
  id: string
  createdAt: string
  action: string
  module: ActivityModule
  refId?: string
  userId: string
  userName: string
  detail?: string
}

export interface BusinessProfile {
  name: string
  type: string
  baseCurrency: CurrencyCode
  ownerName: string
  logo?: string
  description?: string
  address?: string
  phone?: string
}

export interface Settings {
  lowStockThreshold: number
  supportedCurrencies: CurrencyCode[]
  fxProviderConnected: boolean
  fxLastSync?: string
  voiceLocale: string
  voiceEnabled: boolean
  dateFormat: string
  timezone: string
  notifications: {
    lowStock: boolean
    outstanding: boolean
    expenses: boolean
    weeklySummary: boolean
  }
  pos: {
    showBusinessDetails: boolean
    showCashier: boolean
    allowPrint: boolean
    allowShare: boolean
  }
  customers: {
    warnDuplicatePhone: boolean
    formatGhanaPhones: boolean
  }
  reports: {
    adminOnly: boolean
    includeCharts: boolean
  }
}

export interface AppNotification {
  id: string
  kind: 'low_stock' | 'outstanding' | 'expense' | 'system'
  title: string
  body: string
  createdAt: string
  read: boolean
}
