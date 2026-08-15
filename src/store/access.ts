import { useStore } from './useStore'

// Role-based access (spec §13). In production these checks MUST also be enforced
// server-side (spec §13 security principle) - here they gate the demo UI.
export type Capability =
  | 'financials' // dashboard financials, profit, margin
  | 'costPrice' // cost price / inventory value
  | 'cashflow'
  | 'expenses'
  | 'reports'
  | 'suppliers'
  | 'activity'
  | 'userManagement'
  | 'businessSettings'
  | 'receivePayment'
  | 'sales'
  | 'customers'
  | 'allLocations' // view/manage every location (admin only)

const ADMIN_ONLY: Capability[] = [
  'financials',
  'costPrice',
  'cashflow',
  'expenses',
  'reports',
  'suppliers',
  'activity',
  'userManagement',
  'businessSettings',
  'allLocations',
]

export function useCan(cap: Capability): boolean {
  const role = useStore((s) => s.role)
  if (role === 'admin') return true
  // Staff: everything except admin-only areas
  return !ADMIN_ONLY.includes(cap)
}

export function useIsAdmin(): boolean {
  return useStore((s) => s.role === 'admin')
}
