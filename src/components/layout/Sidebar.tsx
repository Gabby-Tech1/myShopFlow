import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { NAV } from './nav'
import { Icon } from '@/components/ui/Icon'
import { useStore } from '@/store/useStore'
import { useCan } from '@/store/access'
import { cn } from '@/lib/utils'
import { money } from '@/lib/format'
import { selectCashBalance } from '@/store/selectors'

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  // Recompute a couple of live figures for the mini cash chip.
  const _ = useStore((s) => s.sales.length + s.expenses.length + s.cashEvents.length)
  void _
  const cash = selectCashBalance()

  return (
    <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-3">
      {NAV.map((group) => (
        <NavGroup key={group.section} group={group} onNavigate={onNavigate} />
      ))}
      <div className="px-3 pt-2">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.045] p-4">
          <span className="absolute -right-5 -top-7 h-20 w-20 rounded-full bg-canary/10 blur-xl" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-muted">Cash Balance</p>
          <p className="mt-1.5 text-xl font-bold tracking-tight text-white tnum">{money(cash)}</p>
          <p className="mt-0.5 text-[11px] text-sidebar-muted">Live across cash, MoMo &amp; bank</p>
        </div>
      </div>
    </nav>
  )
}

function NavGroup({ group, onNavigate }: { group: (typeof NAV)[number]; onNavigate?: () => void }) {
  return (
    <div>
      <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-muted/80">
        {group.section}
      </p>
      <div className="space-y-0.5">
        {group.items.map((item) => (
          <NavRow key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  )
}

function NavRow({ item, onNavigate }: { item: (typeof NAV)[number]['items'][number]; onNavigate?: () => void }) {
  const allowed = useCan(item.cap ?? 'sales')
  if (item.cap && !allowed) return null
  return (
    <NavLink
      to={item.to}
      data-tour={item.to === '/pos' ? 'pos-navigation' : item.to === '/products' ? 'products-navigation' : undefined}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-300 ease-spring',
          isActive
            ? 'bg-white/[0.09] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.035)]'
            : 'text-sidebar-muted hover:bg-white/[0.04] hover:text-white',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-canary" />}
          <Icon name={item.icon} className={cn('h-[18px] w-[18px] transition-colors', isActive ? 'text-canary' : 'text-sidebar-muted group-hover:text-white')} strokeWidth={2} />
          {item.label}
        </>
      )}
    </NavLink>
  )
}

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex lg:w-[248px] lg:flex-col lg:shrink-0 bg-sidebar border-r border-sidebar-line">
        <div className="px-5 py-6">
          <div className="flex items-center gap-2.5">
            <img src="/images/logo-alone.png" alt="" className="h-[34px] w-[34px] shrink-0 object-contain" />
            <span className="text-[17px] font-bold tracking-tight text-white">MyShop<span className="text-canary">Flow</span></span>
          </div>
        </div>
        <NavItems />
      </aside>

      {/* Mobile drawer */}
      <div className={cn('fixed inset-0 z-[90] lg:hidden', mobileOpen ? '' : 'pointer-events-none')}>
        <div
          className={cn('absolute inset-0 bg-ink/50 transition-opacity', mobileOpen ? 'opacity-100' : 'opacity-0')}
          onClick={onClose}
        />
        <aside
          className={cn(
            'absolute left-0 top-0 flex h-full w-[240px] flex-col bg-sidebar transition-transform duration-300',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex items-center justify-between px-5 py-5">
            <div className="flex items-center gap-2.5">
              <img src="/images/logo-alone.png" alt="" className="h-[34px] w-[34px] shrink-0 object-contain" />
              <span className="text-[17px] font-bold tracking-tight text-white">MyShop<span className="text-canary">Flow</span></span>
            </div>
            <button onClick={onClose} aria-label="Close menu" className="grid h-9 w-9 place-items-center rounded-xl text-sidebar-muted hover:bg-white/[0.06] cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>
          <NavItems onNavigate={onClose} />
        </aside>
      </div>
    </>
  )
}
