import type { Capability } from '@/store/access'

export interface NavItem {
  to: string
  label: string
  icon: string // lucide icon name
  cap?: Capability // required capability; undefined = everyone
}

export const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { to: '/pos', label: 'Sell / POS', icon: 'ShoppingCart', cap: 'sales' },
    ],
  },
  {
    section: 'Manage',
    items: [
      { to: '/products', label: 'Products', icon: 'Package' },
      { to: '/customers', label: 'Customers', icon: 'Users' },
      { to: '/cashflow', label: 'Cash Flow', icon: 'ArrowRightLeft', cap: 'cashflow' },
      { to: '/reports', label: 'Reports', icon: 'BarChart3', cap: 'reports' },
    ],
  },
  {
    section: 'Tools',
    items: [
      { to: '/currency', label: 'Currency & FX', icon: 'Coins' },
      { to: '/activity', label: 'Activity History', icon: 'History', cap: 'activity' },
      { to: '/settings', label: 'Settings', icon: 'Settings' },
    ],
  },
]
