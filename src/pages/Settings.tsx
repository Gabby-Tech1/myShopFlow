import { useState } from 'react'
import {
  Building2, Coins, RefreshCw, Users, ShieldCheck, Bell, Package, ShoppingCart,
  UserSquare, Mic, ArrowRightLeft, BarChart3, Database, Palette, Plug, HelpCircle,
  Check, RotateCcw, Download, KeyRound, Power,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useCan, useIsAdmin } from '@/store/access'
import { Card } from '@/components/ui/Card'
import { PageHero } from '@/components/ui/PageHero'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Explain } from '@/components/ui/Explain'
import { ConfirmDialog } from '@/components/ui/Modal'
import { toast } from '@/store/toast'
import { money } from '@/lib/format'
import { fmtDateTime } from '@/lib/datetime'
import { cn } from '@/lib/utils'
import type { CurrencyCode } from '@/types'

interface Section { key: string; label: string; icon: React.ReactNode; business?: boolean }

const SECTIONS: Section[] = [
  { key: 'business', label: 'Business Profile', icon: <Building2 className="h-4 w-4" />, business: true },
  { key: 'currency', label: 'Currency & Regional', icon: <Coins className="h-4 w-4" />, business: true },
  { key: 'fx', label: 'Exchange Rates', icon: <RefreshCw className="h-4 w-4" />, business: true },
  { key: 'staff', label: 'Users & Staff', icon: <Users className="h-4 w-4" />, business: true },
  { key: 'roles', label: 'Roles & Permissions', icon: <ShieldCheck className="h-4 w-4" />, business: true },
  { key: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  { key: 'inventory', label: 'Inventory', icon: <Package className="h-4 w-4" />, business: true },
  { key: 'pos', label: 'Sales & POS', icon: <ShoppingCart className="h-4 w-4" />, business: true },
  { key: 'customers', label: 'Customers', icon: <UserSquare className="h-4 w-4" />, business: true },
  { key: 'voice', label: 'AI Voice', icon: <Mic className="h-4 w-4" />, business: true },
  { key: 'cashflow', label: 'Cash Flow', icon: <ArrowRightLeft className="h-4 w-4" />, business: true },
  { key: 'reports', label: 'Reports', icon: <BarChart3 className="h-4 w-4" />, business: true },
  { key: 'data', label: 'Data & Backup', icon: <Database className="h-4 w-4" /> },
  { key: 'appearance', label: 'Appearance', icon: <Palette className="h-4 w-4" /> },
  { key: 'integrations', label: 'Integrations', icon: <Plug className="h-4 w-4" />, business: true },
  { key: 'help', label: 'Help & About', icon: <HelpCircle className="h-4 w-4" /> },
]

export function SettingsPage() {
  const isAdmin = useIsAdmin()
  const canBiz = useCan('businessSettings')
  const visible = SECTIONS.filter((s) => !s.business || canBiz)
  const [active, setActive] = useState(visible[0].key)

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Workspace preferences" title="Make MyShopFlow work your way" description="Manage your business profile, team access, regional preferences and operational defaults." />
      <div className="grid items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Category list */}
        <div className="self-start">
        {/* Mobile select */}
        <select className="input mb-4 lg:hidden" value={active} onChange={(e) => setActive(e.target.value)}>
          {visible.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <div className="hidden lg:block">
          <Card className="sticky top-4 max-h-[calc(100vh-130px)] overflow-y-auto p-2">
            {visible.map((s) => (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className={cn('flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors', active === s.key ? 'bg-ink text-white' : 'text-ink-soft hover:bg-black/[0.04] hover:text-ink')}
              >
                <span className={active === s.key ? 'text-canary' : ''}>{s.icon}</span> {s.label}
              </button>
            ))}
          </Card>
          {!isAdmin && <p className="mt-3 px-2 text-xs text-ink-soft">You’re viewing personal settings. Business settings need an Admin account.</p>}
        </div>
        </div>

        {/* Panel */}
        <div className="min-w-0">
        {active === 'business' && <BusinessPanel />}
        {active === 'currency' && <CurrencyPanel />}
        {active === 'fx' && <FxPanel />}
        {active === 'staff' && <StaffPanel />}
        {active === 'roles' && <RolesPanel />}
        {active === 'notifications' && <NotificationsPanel />}
        {active === 'inventory' && <InventoryPanel />}
        {active === 'pos' && <PosPanel />}
        {active === 'customers' && <CustomersPanel />}
        {active === 'voice' && <VoicePanel />}
        {active === 'cashflow' && <CashflowPanel />}
        {active === 'reports' && <ReportsPanel />}
        {active === 'data' && <DataPanel />}
        {active === 'appearance' && <AppearancePanel />}
        {active === 'integrations' && <IntegrationsPanel />}
        {active === 'help' && <HelpPanel />}
        </div>
      </div>
    </div>
  )
}

function Panel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden p-5 sm:p-7">
      <p className="eyebrow mb-2">Configuration</p>
      <h2 className="text-xl font-extrabold text-ink">{title}</h2>
      {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </Card>
  )
}

function Field({ label, children, term }: { label: string; children: React.ReactNode; term?: string }) {
  return (
    <div>
      <label className="label flex items-center">{label}{term && <Explain term={term} />}</label>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      type="button"
      aria-label={checked ? 'Turn off' : 'Turn on'}
      onClick={() => onChange(!checked)}
      className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer', checked ? 'bg-canary' : 'bg-hair')}
    >
      <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', checked ? 'left-0.5 translate-x-5' : 'left-0.5')} />
    </button>
  )
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-hair p-3.5">
      <div><p className="text-sm font-semibold text-ink">{label}</p>{desc && <p className="text-xs text-ink-soft">{desc}</p>}</div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

function StateRow({ label, value, tone }: { label: string; value: string; tone?: 'good' }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-canvas px-3.5 py-2.5">
      <span className="text-sm text-ink-soft">{label}</span>
      <span className={cn('text-sm font-semibold', tone === 'good' ? 'text-inflow' : 'text-ink')}>{value}</span>
    </div>
  )
}

// ---- panels ---------------------------------------------------------------
function BusinessPanel() {
  const profile = useStore((s) => s.businessProfile)
  const update = useStore((s) => s.updateBusinessProfile)
  const [form, setForm] = useState(profile)
  const dirty = JSON.stringify(form) !== JSON.stringify(profile)
  return (
    <Panel title="Business Profile" description="How your business appears on receipts and reports.">
      <Field label="Business name"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Business type"><input className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></Field>
        <Field label="Phone"><input className="input" value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
      </div>
      <Field label="Address"><input className="input" value={form.address ?? ''} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
      <Field label="Description"><textarea className="input min-h-[80px]" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setForm(profile)} disabled={!dirty}>Reset</Button>
        <Button onClick={() => { update(form); toast.success('Saved', 'Business profile updated.') }} disabled={!dirty}><Check className="h-4 w-4" /> Save changes</Button>
      </div>
    </Panel>
  )
}

const ALL_CURRENCIES: CurrencyCode[] = ['GHS', 'USD', 'EUR', 'CNY', 'TRY', 'XOF']
function CurrencyPanel() {
  const settings = useStore((s) => s.settings)
  const update = useStore((s) => s.updateSettings)
  const toggle = (c: CurrencyCode) => {
    if (c === 'GHS') return
    const has = settings.supportedCurrencies.includes(c)
    update({ supportedCurrencies: has ? settings.supportedCurrencies.filter((x) => x !== c) : [...settings.supportedCurrencies, c] })
  }
  return (
    <Panel title="Currency & Regional" description="Base currency and how numbers and dates are shown.">
      <StateRow label="Base currency" value="GHS · Ghana Cedi" />
      <Field label="Supported currencies" term="Market Reference Rate">
        <div className="flex flex-wrap gap-2">
          {ALL_CURRENCIES.map((c) => {
            const on = settings.supportedCurrencies.includes(c)
            return <button key={c} onClick={() => toggle(c)} disabled={c === 'GHS'} className={cn('chip border', on ? 'bg-canary-50 border-canary text-ink' : 'bg-paper border-hair text-ink-soft', c === 'GHS' && 'opacity-70')}>{on && <Check className="h-3.5 w-3.5" />}{c}</button>
          })}
        </div>
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <StateRow label="Date format" value={settings.dateFormat} />
        <StateRow label="Timezone" value={settings.timezone} />
      </div>
    </Panel>
  )
}

function FxPanel() {
  const settings = useStore((s) => s.settings)
  const update = useStore((s) => s.updateSettings)
  return (
    <Panel title="Exchange Rates" description="Where FX reference rates come from and how fresh they are.">
      <div className="flex items-center justify-between rounded-xl border border-hair p-3.5">
        <div><p className="text-sm font-semibold text-ink">FX provider</p><p className="text-xs text-ink-soft">Demo rates · abstracted behind the backend in production</p></div>
        <Badge tone={settings.fxProviderConnected ? 'inflow' : 'danger'} dot>{settings.fxProviderConnected ? 'Connected' : 'Offline'}</Badge>
      </div>
      <StateRow label="Last successful sync" value={settings.fxLastSync ? fmtDateTime(settings.fxLastSync) : '-'} />
      <StateRow label="Preferred rate display" value="Mid-Market Rate" />
      <Button variant="outline" onClick={() => { update({ fxLastSync: new Date().toISOString() }); toast.success('Rates refreshed', 'Latest demo reference rates loaded.') }}><RefreshCw className="h-4 w-4" /> Refresh now</Button>
      <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">API credentials stay on the backend and are never shown here.</p>
    </Panel>
  )
}

function StaffPanel() {
  const users = useStore((s) => s.users)
  const addStaff = useStore((s) => s.addStaff)
  const toggleActive = useStore((s) => s.toggleStaffActive)
  const regen = useStore((s) => s.regeneratePin)
  const [name, setName] = useState('')
  return (
    <Panel title="Users & Staff" description="Staff don’t self-register - you invite them and manage access.">
      <div className="flex gap-2">
        <input className="input" placeholder="New staff name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={() => { if (!name.trim()) return; addStaff(name.trim()); toast.success('Staff added', `${name.trim()} can now sign in with a PIN.`); setName('') }}>Add</Button>
      </div>
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hair p-3.5">
            <div className="flex items-center gap-3">
              <div className={cn('grid h-9 w-9 place-items-center rounded-full text-sm font-bold', u.role === 'admin' ? 'bg-canary text-ink' : 'bg-brick text-white')}>{u.name.slice(0, 1)}</div>
              <div>
                <p className="text-sm font-semibold text-ink">{u.name} {u.role === 'admin' && <Badge tone="canary">Owner</Badge>}</p>
                <p className="text-xs text-ink-soft">{u.pin ? `PIN ${u.pin}` : 'Password login'} · {u.active ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
            {u.role !== 'admin' && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { regen(u.id); toast.success('PIN reset', `${u.name}'s PIN was regenerated.`) }}><KeyRound className="h-4 w-4" /> Reset PIN</Button>
                <Button size="sm" variant={u.active ? 'outline' : 'primary'} onClick={() => toggleActive(u.id)}><Power className="h-4 w-4" /> {u.active ? 'Deactivate' : 'Activate'}</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Panel>
  )
}

const ROLE_MATRIX = [
  ['Dashboard financials', true, false], ['Cost price / inventory value', true, false], ['Sales / POS', true, true],
  ['Customers / Voice registration', true, true], ['Receive payment', true, true], ['Cash Flow', true, false],
  ['Expenses', true, false], ['Reports', true, false], ['Suppliers', true, false], ['Activity History', true, false],
  ['Users / Roles', true, false], ['Business Settings', true, false],
] as const
function RolesPanel() {
  return (
    <Panel title="Roles & Permissions" description="What Admin/Owner and Staff can each access. Enforced server-side in production.">
      <div className="overflow-hidden rounded-xl border border-hair">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-hair bg-canvas text-left"><th className="px-4 py-2.5 font-semibold">Area</th><th className="px-4 py-2.5 text-center font-semibold">Admin</th><th className="px-4 py-2.5 text-center font-semibold">Staff</th></tr></thead>
          <tbody>
            {ROLE_MATRIX.map(([area, a, s]) => (
              <tr key={area} className="border-b border-hair last:border-0">
                <td className="px-4 py-2.5 text-ink">{area}</td>
                <td className="px-4 py-2.5 text-center">{a ? <Check className="mx-auto h-4 w-4 text-inflow" /> : <span className="text-ink-soft">-</span>}</td>
                <td className="px-4 py-2.5 text-center">{s ? <Check className="mx-auto h-4 w-4 text-inflow" /> : <span className="text-ink-soft">-</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

function NotificationsPanel() {
  const n = useStore((s) => s.settings.notifications)
  const update = useStore((s) => s.updateSettings)
  const set = (k: keyof typeof n, v: boolean) => update({ notifications: { ...n, [k]: v } })
  return (
    <Panel title="Notifications" description="Choose what you want to be alerted about.">
      <ToggleRow label="Low stock alerts" desc="When a product drops to its reorder level" checked={n.lowStock} onChange={(v) => set('lowStock', v)} />
      <ToggleRow label="Outstanding payments" desc="Reminders about customers who owe you" checked={n.outstanding} onChange={(v) => set('outstanding', v)} />
      <ToggleRow label="Expense alerts" desc="When a large expense is recorded" checked={n.expenses} onChange={(v) => set('expenses', v)} />
      <ToggleRow label="Weekly summary" desc="A short recap of your week" checked={n.weeklySummary} onChange={(v) => set('weeklySummary', v)} />
    </Panel>
  )
}

function InventoryPanel() {
  const threshold = useStore((s) => s.settings.lowStockThreshold)
  const update = useStore((s) => s.updateSettings)
  return (
    <Panel title="Inventory" description="Defaults for stock management.">
      <Field label="Default low-stock alert level" term="Low Stock">
        <input type="number" className="input tnum" value={threshold} onChange={(e) => update({ lowStockThreshold: parseInt(e.target.value) || 0 })} />
      </Field>
      <p className="text-sm text-ink-soft">New products use this level unless you set a different one.</p>
    </Panel>
  )
}

function PosPanel() {
  const settings = useStore((s) => s.settings)
  const update = useStore((s) => s.updateSettings)
  const set = (key: keyof typeof settings.pos, value: boolean) => update({ pos: { ...settings.pos, [key]: value } })
  return (
    <Panel title="Sales & POS" description="Choose what appears on receipts and which receipt actions are available.">
      <ToggleRow label="Show business details" desc="Include your business name and address on receipts" checked={settings.pos.showBusinessDetails} onChange={(v) => set('showBusinessDetails', v)} />
      <ToggleRow label="Show cashier name" desc="Display who served the customer" checked={settings.pos.showCashier} onChange={(v) => set('showCashier', v)} />
      <ToggleRow label="Enable receipt printing" desc="Show the Print action after a sale" checked={settings.pos.allowPrint} onChange={(v) => set('allowPrint', v)} />
      <ToggleRow label="Enable receipt sharing" desc="Allow receipts to be shared or copied" checked={settings.pos.allowShare} onChange={(v) => set('allowShare', v)} />
      <StateRow label="Default customer" value="Walk-in customer" />
      <StateRow label="Payment methods" value="Cash · MoMo · Card · Credit" />
    </Panel>
  )
}

function CustomersPanel() {
  const settings = useStore((s) => s.settings)
  const update = useStore((s) => s.updateSettings)
  const set = (key: keyof typeof settings.customers, value: boolean) => update({ customers: { ...settings.customers, [key]: value } })
  return (
    <Panel title="Customers" description="Control data quality and customer registration options.">
      <ToggleRow label="Warn about duplicate phone numbers" desc="Prevent accidentally registering the same customer twice" checked={settings.customers.warnDuplicatePhone} onChange={(v) => set('warnDuplicatePhone', v)} />
      <ToggleRow label="Format Ghana phone numbers" desc="Clean phone numbers into a consistent readable format" checked={settings.customers.formatGhanaPhones} onChange={(v) => set('formatGhanaPhones', v)} />
      <ToggleRow label="Enable voice registration" desc="Show the voice option in customer registration" checked={settings.voiceEnabled} onChange={(v) => update({ voiceEnabled: v })} />
      <StateRow label="Required field" value="Customer name" />
    </Panel>
  )
}

function ReportsPanel() {
  const settings = useStore((s) => s.settings)
  const update = useStore((s) => s.updateSettings)
  const set = (key: keyof typeof settings.reports, value: boolean) => update({ reports: { ...settings.reports, [key]: value } })
  return (
    <Panel title="Reports" description="Set defaults for reports and exports.">
      <ToggleRow label="Admin-only reports" desc="Keep financial reports restricted to administrators" checked={settings.reports.adminOnly} onChange={(v) => set('adminOnly', v)} />
      <ToggleRow label="Include charts" desc="Show visual summaries in reports" checked={settings.reports.includeCharts} onChange={(v) => set('includeCharts', v)} />
      <ToggleRow label="Weekly summary" desc="Receive the weekly business recap" checked={settings.notifications.weeklySummary} onChange={(v) => update({ notifications: { ...settings.notifications, weeklySummary: v } })} />
      <StateRow label="Default period" value="This month" />
      <StateRow label="Export format" value="CSV" />
    </Panel>
  )
}

function VoicePanel() {
  const settings = useStore((s) => s.settings)
  const update = useStore((s) => s.updateSettings)
  return (
    <Panel title="AI Voice" description="Voice customer registration settings.">
      <div className="flex items-center justify-between rounded-xl border border-hair p-3.5">
        <div><p className="text-sm font-semibold text-ink">Speech provider</p><p className="text-xs text-ink-soft">Browser speech-to-text · Ghanaian English</p></div>
        <Badge tone="inflow" dot>Ready</Badge>
      </div>
      <StateRow label="Language / locale" value={settings.voiceLocale} />
      <ToggleRow label="Enable voice registration" desc="Show ‘Register by Voice’ across the app" checked={settings.voiceEnabled} onChange={(v) => update({ voiceEnabled: v })} />
      <ToggleRow label="Require confirmation before saving" desc="Always review captured details first" checked onChange={() => toast.info('Always on', 'Voice captures must be confirmed before saving.')} />
    </Panel>
  )
}

function CashflowPanel() {
  const opening = useStore((s) => s.openingCash)
  return (
    <Panel title="Cash Flow" description="Starting balance and reconciliation settings.">
      <Field label="Opening cash balance" term="Opening Cash"><div className="input bg-canvas tnum">{money(opening)}</div></Field>
      <StateRow label="Cash sources" value="Cash · Mobile Money · Bank" />
      <StateRow label="Manual adjustments" value="Admin only" />
      <p className="rounded-lg bg-canary-50 px-3 py-2 text-xs font-medium text-ink">Reconciliation always holds: Opening + Money In − Money Out = Closing.</p>
    </Panel>
  )
}

function DataPanel() {
  const [confirm, setConfirm] = useState(false)
  const reset = useStore((s) => s.resetDemo)
  const exportData = () => {
    const state = useStore.getState()
    const data = { products: state.products, customers: state.customers, sales: state.sales, expenses: state.expenses, cashEvents: state.cashEvents }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'myshopflow-data.json'; a.click()
    URL.revokeObjectURL(url)
    toast.success('Data exported', 'Your business data was downloaded as JSON.')
  }
  return (
    <Panel title="Data & Backup" description="Export your data or reset the demo.">
      <div className="flex items-center justify-between rounded-xl border border-hair p-3.5">
        <div><p className="text-sm font-semibold text-ink">Export business data</p><p className="text-xs text-ink-soft">Download products, customers, sales and cash as JSON</p></div>
        <Button variant="outline" onClick={exportData}><Download className="h-4 w-4" /> Export</Button>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-brick-200 bg-brick-50 p-3.5">
        <div><p className="text-sm font-semibold text-brick-600">Reset demo data</p><p className="text-xs text-brick-600/80">Restore the original sample shop. This clears your changes.</p></div>
        <Button variant="brick" onClick={() => setConfirm(true)}><RotateCcw className="h-4 w-4" /> Reset</Button>
      </div>
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={() => { reset(); toast.success('Demo reset', 'Sample data has been restored.') }} title="Reset demo data?" description="This will replace all current data with the original sample shop. This cannot be undone." confirmLabel="Yes, reset" destructive />
    </Panel>
  )
}

function AppearancePanel() {
  return (
    <Panel title="Appearance" description="Display preferences.">
      <StateRow label="Theme" value="Light" />
      <StateRow label="Density" value="Comfortable" />
      <StateRow label="Currency figures" value="Tabular (aligned)" tone="good" />
      <p className="text-sm text-ink-soft">A dark theme is planned for a future version.</p>
    </Panel>
  )
}

function IntegrationsPanel() {
  const settings = useStore((s) => s.settings)
  return (
    <Panel title="Integrations" description="Connected services and their status.">
      <div className="flex items-center justify-between rounded-xl border border-hair p-3.5">
        <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-canvas"><Mic className="h-4 w-4" /></span><div><p className="text-sm font-semibold text-ink">AI Speech provider</p><p className="text-xs text-ink-soft">Voice customer registration</p></div></div>
        <Badge tone="inflow" dot>Ready</Badge>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-hair p-3.5">
        <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-canvas"><Coins className="h-4 w-4" /></span><div><p className="text-sm font-semibold text-ink">FX rate provider</p><p className="text-xs text-ink-soft">Demo rates</p></div></div>
        <Badge tone={settings.fxProviderConnected ? 'inflow' : 'danger'} dot>{settings.fxProviderConnected ? 'Connected' : 'Offline'}</Badge>
      </div>
      <p className="text-sm text-ink-soft">Accounting and payment integrations can be added in production.</p>
    </Panel>
  )
}

function HelpPanel() {
  return (
    <Panel title="Help & About" description="Support and app information.">
      <StateRow label="App version" value="MyShopFlow 0.1.0 (Demo)" />
      <StateRow label="System status" value="All systems operational" tone="good" />
      <div className="grid gap-2 sm:grid-cols-3">
        {['Help center', 'Privacy', 'Terms'].map((l) => <button key={l} className="rounded-xl border border-hair px-3 py-2.5 text-sm font-semibold text-ink hover:border-canary hover:bg-canary-50 cursor-pointer">{l}</button>)}
      </div>
      <p className="text-sm text-ink-soft">MyShopFlow - Smart Inventory. Smarter Cash Flow.</p>
    </Panel>
  )
}
