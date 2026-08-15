import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { useStore } from '@/store/useStore'
import { useCan, type Capability } from '@/store/access'
import { LandingPage } from '@/pages/Landing'
import { LoginPage } from '@/pages/Login'
import { OnboardingPage } from '@/pages/Onboarding'
import { DashboardPage } from '@/pages/Dashboard'
import { PosPage } from '@/pages/Pos'
import { ProductsPage } from '@/pages/Products'
import { LocationsPage } from '@/pages/Locations'
import { CustomersPage } from '@/pages/Customers'
import { CashFlowPage } from '@/pages/CashFlow'
import { ReportsPage } from '@/pages/Reports'
import { CurrencyPage } from '@/pages/Currency'
import { ActivityPage } from '@/pages/Activity'
import { SettingsPage } from '@/pages/Settings'
import { SuppliersPage } from '@/pages/Suppliers'
import type { ReactNode } from 'react'

function RequireAuth({ children }: { children: ReactNode }) {
  const authed = useStore((s) => s.authed)
  if (!authed) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RequireCap({ cap, children }: { cap: Capability; children: ReactNode }) {
  const allowed = useCan(cap)
  if (!allowed) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/get-started" element={<OnboardingPage />} />

      {/* App (guarded) */}
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pos" element={<PosPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/suppliers" element={<RequireCap cap="suppliers"><SuppliersPage /></RequireCap>} />
        <Route path="/cashflow" element={<RequireCap cap="cashflow"><CashFlowPage /></RequireCap>} />
        <Route path="/reports" element={<RequireCap cap="reports"><ReportsPage /></RequireCap>} />
        <Route path="/currency" element={<CurrencyPage />} />
        <Route path="/audit-logs" element={<RequireCap cap="activity"><ActivityPage /></RequireCap>} />
        <Route path="/activity" element={<Navigate to="/audit-logs" replace />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
