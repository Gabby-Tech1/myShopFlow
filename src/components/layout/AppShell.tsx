import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { QuickActions } from './QuickActions'
import { GlobalSearch } from './GlobalSearch'
import { ActionModals } from '@/components/actions/ActionModals'
import { Toaster } from '@/components/ui/Toaster'

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/pos': 'Sell / Point of Sale',
  '/products': 'Products & Inventory',
  '/locations': 'Locations & Warehouses',
  '/customers': 'Customers',
  '/suppliers': 'Suppliers',
  '/cashflow': 'Cash Flow',
  '/reports': 'Reports',
  '/currency': 'Currency & Exchange Rates',
  '/activity': 'Audit Logs',
  '/audit-logs': 'Audit Logs',
  '/settings': 'Settings',
}

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const title = TITLES[location.pathname] ?? 'MyShopFlow'

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} onMenu={() => setMobileOpen(true)} />
        <main className="relative flex-1 overflow-x-hidden overflow-y-auto">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-white/70 to-transparent" />
          <div className="page-enter relative mx-auto max-w-[1600px] px-4 py-7 sm:px-6 lg:px-10 lg:py-9">
            <Outlet />
          </div>
        </main>
      </div>
      <QuickActions />
      <GlobalSearch />
      <ActionModals />
      <Toaster />
    </div>
  )
}
