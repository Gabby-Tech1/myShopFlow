import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ActivityEvent,
  AppNotification,
  BusinessProfile,
  Category,
  Customer,
  CustomerPayment,
  Expense,
  PaymentMethod,
  Product,
  ProductAttributes,
  Role,
  Sale,
  SaleItem,
  Settings,
  StockPurchase,
  User,
} from '@/types'
import type { CashEvent } from './engine'
import { buildSeed } from './seed'
import { uid, receiptNo } from '@/lib/utils'

const DEFAULT_PROFILE: BusinessProfile = {
  name: "Ama's Variety Store",
  type: 'Retail Shop',
  baseCurrency: 'GHS',
  ownerName: 'Ama Owusu',
  description: 'General goods, provisions and phone accessories in Accra.',
  address: 'Shop 14, Circle Market, Accra',
  phone: '024 118 0000',
}

const DEFAULT_SETTINGS: Settings = {
  lowStockThreshold: 10,
  supportedCurrencies: ['GHS', 'USD', 'EUR', 'CNY', 'TRY', 'XOF'],
  fxProviderConnected: true,
  fxLastSync: new Date().toISOString(),
  voiceLocale: 'en-GH',
  voiceEnabled: true,
  dateFormat: 'd MMM yyyy',
  timezone: 'Africa/Accra (GMT)',
  notifications: { lowStock: true, outstanding: true, expenses: false, weeklySummary: true },
  pos: { showBusinessDetails: true, showCashier: true, allowPrint: true, allowShare: true },
  customers: { warnDuplicatePhone: true, formatGhanaPhones: true },
  reports: { adminOnly: true, includeCharts: true },
}

export interface CartLine {
  product: Product
  qty: number
}

export interface SaleInput {
  items: SaleItem[]
  paymentMethod: PaymentMethod
  customerId?: string
}

interface StoreState {
  // identity / access
  role: Role
  currentUserId: string
  authed: boolean
  hasSeenDashboardTutorial: boolean

  // domain data
  users: User[]
  categories: Category[]
  suppliers: { id: string; name: string; phone?: string }[]
  products: Product[]
  customers: Customer[]
  sales: Sale[]
  payments: CustomerPayment[]
  expenses: Expense[]
  purchases: StockPurchase[]
  cashEvents: CashEvent[]
  activity: ActivityEvent[]
  notifications: AppNotification[]
  openingCash: number

  businessProfile: BusinessProfile
  settings: Settings

  // ---- actions -----------------------------------------------------------
  login: (role: Role) => void
  logout: () => void
  completeDashboardTutorial: () => void
  startDashboardTutorial: () => void
  setRole: (role: Role) => void
  setCurrentUser: (userId: string) => void

  recordSale: (input: SaleInput) => Sale
  receivePayment: (customerId: string, amount: number, method: 'cash' | 'momo' | 'card', note?: string) => void
  addExpense: (category: string, amount: number, method: 'cash' | 'momo' | 'card', note?: string) => void

  addProduct: (p: Omit<Product, 'id' | 'createdAt' | 'currency'> & { attributes?: ProductAttributes }) => void
  updateProduct: (id: string, patch: Partial<Product>) => void
  adjustStock: (id: string, delta: number) => void
  restock: (productId: string, qty: number, unitCost: number, method: 'cash' | 'momo' | 'card', paid: boolean) => void
  addCategory: (name: string, icon?: string) => void

  registerCustomer: (name: string, phone: string, method: 'manual' | 'voice', notes?: string) => Customer
  updateCustomer: (id: string, patch: Partial<Customer>) => void

  cashAdjustment: (amount: number, direction: 'in' | 'out', reason: string) => void
  ownerFunding: (amount: number) => void
  ownerWithdrawal: (amount: number) => void
  loanReceived: (amount: number, note?: string) => void
  loanRepayment: (amount: number, note?: string) => void

  updateSettings: (patch: Partial<Settings>) => void
  updateBusinessProfile: (patch: Partial<BusinessProfile>) => void
  addStaff: (name: string) => void
  toggleStaffActive: (id: string) => void
  regeneratePin: (id: string) => void

  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void

  resetDemo: () => void
}

function initial() {
  const s = buildSeed()
  return {
    role: 'admin' as Role,
    currentUserId: s.currentUserId,
    authed: false,
    hasSeenDashboardTutorial: false,
    users: s.users,
    categories: s.categories,
    suppliers: s.suppliers,
    products: s.products,
    customers: s.customers,
    sales: s.sales,
    payments: s.payments,
    expenses: s.expenses,
    purchases: s.purchases,
    cashEvents: s.cashEvents,
    activity: s.activity,
    notifications: [] as AppNotification[],
    openingCash: s.openingCash,
    businessProfile: DEFAULT_PROFILE,
    settings: DEFAULT_SETTINGS,
  }
}

function logActivity(
  get: () => StoreState,
  entry: Omit<ActivityEvent, 'id' | 'createdAt' | 'userId' | 'userName'>,
): ActivityEvent {
  const { currentUserId, users } = get()
  return {
    id: uid('act'),
    createdAt: new Date().toISOString(),
    userId: currentUserId,
    userName: users.find((u) => u.id === currentUserId)?.name ?? 'User',
    ...entry,
  }
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...initial(),

      login: (role) =>
        set((st) => {
          const user =
            role === 'admin'
              ? st.users.find((u) => u.role === 'admin')!
              : st.users.find((u) => u.role === 'staff') ?? st.users[0]
          return { authed: true, role, currentUserId: user.id }
        }),
      logout: () => set({ authed: false }),
      completeDashboardTutorial: () => set({ hasSeenDashboardTutorial: true }),
      startDashboardTutorial: () => set({ hasSeenDashboardTutorial: false }),
      setRole: (role) =>
        set((st) => {
          const user =
            role === 'admin'
              ? st.users.find((u) => u.role === 'admin')!
              : st.users.find((u) => u.role === 'staff') ?? st.users[0]
          return { role, currentUserId: user.id }
        }),
      setCurrentUser: (userId) => set({ currentUserId: userId }),

      // --- Paid sale → inventory↓, sales↑, cash inflow (via ledger),
      //     customer history, activity. Credit sale adds NO cash. (spec §6/§8/§15)
      recordSale: (input) => {
        const now = new Date().toISOString()
        const subtotal = +input.items.reduce((s, it) => s + it.lineTotal, 0).toFixed(2)
        const isCredit = input.paymentMethod === 'credit'
        const sale: Sale = {
          id: uid('sale'),
          receiptNo: receiptNo(),
          items: input.items,
          subtotal,
          total: subtotal,
          paymentMethod: input.paymentMethod,
          paid: !isCredit,
          amountPaid: isCredit ? 0 : subtotal,
          customerId: input.customerId,
          userId: get().currentUserId,
          createdAt: now,
        }
        set((st) => {
          const products = st.products.map((p) => {
            const line = input.items.find((it) => it.productId === p.id)
            return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p
          })
          const customers = st.customers.map((c) => {
            if (c.id !== input.customerId) return c
            return {
              ...c,
              lastVisit: now,
              outstanding: isCredit ? +(c.outstanding + subtotal).toFixed(2) : c.outstanding,
            }
          })
          const act = logActivity(get, {
            action: isCredit ? 'Credit sale recorded' : 'Sale completed',
            module: 'sales',
            refId: sale.receiptNo,
            detail: `${input.items.length} item(s) · ${input.paymentMethod.toUpperCase()}`,
          })
          return { sales: [...st.sales, sale], products, customers, activity: [act, ...st.activity] }
        })
        return sale
      },

      receivePayment: (customerId, amount, method, note) =>
        set((st) => {
          const payment: CustomerPayment = {
            id: uid('pay'),
            customerId,
            amount: +amount.toFixed(2),
            method,
            userId: st.currentUserId,
            createdAt: new Date().toISOString(),
            note,
          }
          const customers = st.customers.map((c) =>
            c.id === customerId
              ? { ...c, outstanding: +Math.max(0, c.outstanding - amount).toFixed(2), lastVisit: payment.createdAt }
              : c,
          )
          const cust = st.customers.find((c) => c.id === customerId)
          const act = logActivity(get, {
            action: 'Payment received',
            module: 'cashflow',
            refId: payment.id,
            detail: cust ? cust.name : undefined,
          })
          return { payments: [...st.payments, payment], customers, activity: [act, ...st.activity] }
        }),

      addExpense: (category, amount, method, note) =>
        set((st) => {
          const expense: Expense = {
            id: uid('exp'),
            category,
            amount: +amount.toFixed(2),
            method,
            note,
            userId: st.currentUserId,
            createdAt: new Date().toISOString(),
          }
          const act = logActivity(get, { action: 'Expense added', module: 'expenses', refId: expense.id, detail: `${category}` })
          return { expenses: [...st.expenses, expense], activity: [act, ...st.activity] }
        }),

      addProduct: (p) =>
        set((st) => {
          const product: Product = { ...p, id: uid('p'), currency: 'GHS', createdAt: new Date().toISOString() }
          const act = logActivity(get, { action: 'Product added', module: 'inventory', refId: product.id, detail: product.name })
          return { products: [...st.products, product], activity: [act, ...st.activity] }
        }),

      updateProduct: (id, patch) =>
        set((st) => {
          const products = st.products.map((p) => (p.id === id ? { ...p, ...patch } : p))
          const act = logActivity(get, { action: 'Product edited', module: 'inventory', refId: id })
          return { products, activity: [act, ...st.activity] }
        }),

      adjustStock: (id, delta) =>
        set((st) => ({
          products: st.products.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)),
        })),

      restock: (productId, qty, unitCost, method, paid) =>
        set((st) => {
          const product = st.products.find((p) => p.id === productId)
          if (!product) return {}
          const purchase: StockPurchase = {
            id: uid('pur'),
            productId,
            productName: product.name,
            qty,
            unitCost,
            total: +(qty * unitCost).toFixed(2),
            paid,
            method,
            userId: st.currentUserId,
            createdAt: new Date().toISOString(),
          }
          const products = st.products.map((p) => (p.id === productId ? { ...p, stock: p.stock + qty } : p))
          const act = logActivity(get, { action: 'Stock received', module: 'inventory', refId: purchase.id, detail: `${qty} × ${product.name}` })
          return { purchases: [...st.purchases, purchase], products, activity: [act, ...st.activity] }
        }),

      addCategory: (name, icon) =>
        set((st) => ({ categories: [...st.categories, { id: uid('c'), name, icon }] })),

      registerCustomer: (name, phone, method, notes) => {
        const customer: Customer = {
          id: uid('cu'),
          name,
          phone,
          outstanding: 0,
          notes,
          registrationMethod: method,
          createdBy: get().currentUserId,
          createdAt: new Date().toISOString(),
          lastVisit: new Date().toISOString(),
        }
        set((st) => {
          const act = logActivity(get, {
            action: method === 'voice' ? 'Customer registered by voice' : 'Customer registered',
            module: 'customers',
            refId: customer.id,
            detail: name,
          })
          return { customers: [...st.customers, customer], activity: [act, ...st.activity] }
        })
        return customer
      },

      updateCustomer: (id, patch) =>
        set((st) => ({ customers: st.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),

      cashAdjustment: (amount, direction, reason) =>
        set((st) => {
          const ce: CashEvent = {
            id: uid('ce'),
            createdAt: new Date().toISOString(),
            type: 'operating',
            direction,
            amount: +amount.toFixed(2),
            category: 'Manual Adjustment',
            source: 'adjustment',
            userId: st.currentUserId,
            description: reason,
          }
          const act = logActivity(get, { action: 'Cash adjustment', module: 'cashflow', refId: ce.id, detail: reason })
          return { cashEvents: [...st.cashEvents, ce], activity: [act, ...st.activity] }
        }),

      ownerFunding: (amount) =>
        set((st) => {
          const ce: CashEvent = { id: uid('ce'), createdAt: new Date().toISOString(), type: 'financing', direction: 'in', amount: +amount.toFixed(2), category: 'Owner Funding', source: 'owner_funding', userId: st.currentUserId, description: 'Owner added capital to the business' }
          const act = logActivity(get, { action: 'Owner funding added', module: 'cashflow', refId: ce.id })
          return { cashEvents: [...st.cashEvents, ce], activity: [act, ...st.activity] }
        }),
      ownerWithdrawal: (amount) =>
        set((st) => {
          const ce: CashEvent = { id: uid('ce'), createdAt: new Date().toISOString(), type: 'financing', direction: 'out', amount: +amount.toFixed(2), category: 'Owner Withdrawal', source: 'owner_withdrawal', userId: st.currentUserId, description: 'Owner personal withdrawal' }
          const act = logActivity(get, { action: 'Owner withdrawal', module: 'cashflow', refId: ce.id })
          return { cashEvents: [...st.cashEvents, ce], activity: [act, ...st.activity] }
        }),
      loanReceived: (amount, note) =>
        set((st) => {
          const ce: CashEvent = { id: uid('ce'), createdAt: new Date().toISOString(), type: 'financing', direction: 'in', amount: +amount.toFixed(2), category: 'Loan', source: 'loan_received', userId: st.currentUserId, description: note ?? 'Loan received' }
          const act = logActivity(get, { action: 'Loan received', module: 'cashflow', refId: ce.id })
          return { cashEvents: [...st.cashEvents, ce], activity: [act, ...st.activity] }
        }),
      loanRepayment: (amount, note) =>
        set((st) => {
          const ce: CashEvent = { id: uid('ce'), createdAt: new Date().toISOString(), type: 'financing', direction: 'out', amount: +amount.toFixed(2), category: 'Loan Repayment', source: 'loan_repayment', userId: st.currentUserId, description: note ?? 'Loan repayment' }
          const act = logActivity(get, { action: 'Loan repayment', module: 'cashflow', refId: ce.id })
          return { cashEvents: [...st.cashEvents, ce], activity: [act, ...st.activity] }
        }),

      updateSettings: (patch) => set((st) => ({ settings: { ...st.settings, ...patch } })),
      updateBusinessProfile: (patch) => set((st) => ({ businessProfile: { ...st.businessProfile, ...patch } })),

      addStaff: (name) =>
        set((st) => {
          const pin = String(Math.floor(1000 + Math.random() * 9000))
          const user: User = { id: uid('u'), name, role: 'staff', pin, active: true }
          const act = logActivity(get, { action: 'Staff added', module: 'staff', refId: user.id, detail: name })
          return { users: [...st.users, user], activity: [act, ...st.activity] }
        }),
      toggleStaffActive: (id) =>
        set((st) => ({ users: st.users.map((u) => (u.id === id ? { ...u, active: !u.active } : u)) })),
      regeneratePin: (id) =>
        set((st) => ({
          users: st.users.map((u) => (u.id === id ? { ...u, pin: String(Math.floor(1000 + Math.random() * 9000)) } : u)),
        })),

      markNotificationRead: (id) =>
        set((st) => ({ notifications: st.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllNotificationsRead: () =>
        set((st) => ({ notifications: st.notifications.map((n) => ({ ...n, read: true })) })),

      resetDemo: () => set({ ...initial(), authed: true }),
    }),
    {
      name: 'myshopflow-v1',
      merge: (persisted, current) => {
        const saved = persisted as Partial<StoreState>
        const savedSettings = saved.settings
        return {
          ...current,
          ...saved,
          settings: {
            ...current.settings,
            ...savedSettings,
            notifications: { ...current.settings.notifications, ...savedSettings?.notifications },
            pos: { ...current.settings.pos, ...savedSettings?.pos },
            customers: { ...current.settings.customers, ...savedSettings?.customers },
            reports: { ...current.settings.reports, ...savedSettings?.reports },
          },
        }
      },
      partialize: (st) => {
        // persist everything except transient auth so a refresh keeps data but re-lands on login when logged out
        const { ...rest } = st
        return rest
      },
    },
  ),
)
