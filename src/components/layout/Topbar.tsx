import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, Menu, Search, Settings, TrendingUp, UserRound, Warehouse, Store } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useUi } from '@/store/ui'
import { money } from '@/lib/format'
import { currentRate } from '@/lib/fx'
import { cn } from '@/lib/utils'

export function Topbar({ title, onMenu }: { title: string; onMenu: () => void }) {
  const navigate = useNavigate()
  const role = useStore((s) => s.role)
  const logout = useStore((s) => s.logout)
  const user = useStore((s) => s.users.find((u) => u.id === s.currentUserId))
  const setSearchOpen = useUi((s) => s.setSearchOpen)
  const locations = useStore((s) => s.locations)
  const activeLocationId = useStore((s) => s.activeLocationId)
  const setActiveLocation = useStore((s) => s.setActiveLocation)
  const usd = currentRate('USD')
  const [profileOpen, setProfileOpen] = useState(false)
  const activeLocation = locations.find((l) => l.id === activeLocationId)

  const signOut = () => {
    logout()
    setProfileOpen(false)
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 flex h-[72px] items-center gap-3 border-b border-black/[0.06] bg-white/80 px-4 backdrop-blur-xl sm:px-6 lg:px-10">
      <button
        onClick={onMenu}
        aria-label="Open menu"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-ink hover:bg-black/[0.05] lg:hidden cursor-pointer"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0">
        <p className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint sm:block">Workspace</p>
        <h1 className="truncate text-[17px] font-bold tracking-tightest text-ink">{title}</h1>
      </div>

      <div className="ml-auto flex items-center gap-0.5 sm:gap-2">
        {/* Global search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden min-w-[190px] items-center gap-2 rounded-xl bg-canvas/80 px-3 py-2 text-[13px] text-ink-faint ring-1 ring-hair transition-all duration-200 hover:bg-white hover:ring-ink/20 md:flex cursor-pointer"
        >
          <Search className="h-4 w-4" />
          <span>Search…</span>
          <kbd className="rounded-md bg-canvas px-1.5 py-0.5 text-[10px] font-semibold text-ink-faint ring-1 ring-hair">⌘K</kbd>
        </button>
        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
          className="grid h-9 w-9 place-items-center rounded-xl text-ink hover:bg-black/[0.05] sm:h-10 sm:w-10 md:hidden cursor-pointer"
        >
          <Search className="h-5 w-5" />
        </button>

        <button
          onClick={() => navigate('/currency')}
          aria-label="Currency and exchange rates"
          title="Currency and exchange rates"
          className="grid h-9 w-9 place-items-center rounded-xl text-ink transition-colors hover:bg-canary-50 hover:text-canary-700 sm:hidden cursor-pointer"
        >
          <TrendingUp className="h-5 w-5" />
        </button>

        {/* Staff are pinned to their location (read-only chip). */}
        {role === 'staff' && activeLocation && (
          <div className="hidden items-center gap-1.5 rounded-xl bg-canvas px-3 py-2 text-[13px] font-semibold text-ink ring-1 ring-hair sm:flex" title="Your location">
            {activeLocation.kind === 'warehouse' ? <Warehouse className="h-4 w-4 text-ink-soft" /> : <Store className="h-4 w-4 text-ink-soft" />}
            {activeLocation.name}
          </div>
        )}

        {/* Admins can switch the active location */}
        {role === 'admin' && locations.length > 1 && (
          <div className="relative hidden items-center sm:flex" title="Active location — sales draw stock from here">
            <span className="pointer-events-none absolute left-2.5 text-ink-soft">
              {activeLocation?.kind === 'warehouse' ? <Warehouse className="h-4 w-4" /> : <Store className="h-4 w-4" />}
            </span>
            <select
              value={activeLocationId}
              onChange={(e) => setActiveLocation(e.target.value)}
              className="h-[38px] cursor-pointer appearance-none rounded-xl bg-paper py-2 pl-8 pr-8 text-[13px] font-semibold text-ink ring-1 ring-hair transition-all duration-200 hover:ring-canary/50 focus:outline-none focus:ring-2 focus:ring-canary/50"
              aria-label="Active location"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundPosition: 'right 0.55rem center', backgroundRepeat: 'no-repeat', backgroundSize: '0.9rem' }}
            >
              <option value="all">All locations</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        )}

        {/* FX mini ticker */}
        <button
          onClick={() => navigate('/currency')}
          className="hidden items-center gap-1.5 rounded-xl bg-paper px-3 py-2 text-[13px] font-semibold text-ink ring-1 ring-hair transition-all duration-200 hover:ring-canary/50 sm:flex cursor-pointer"
          title="Currency & FX rates"
        >
          <TrendingUp className="h-4 w-4 text-canary-600" />
          <span className="tnum">$1 = {money(usd)}</span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/activity')}
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-xl text-ink hover:bg-black/[0.05] sm:h-10 sm:w-10 cursor-pointer"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brick ring-2 ring-canvas sm:right-2 sm:top-2" />
        </button>

        {/* User */}
        <div className="relative ml-1 border-l border-hair py-1 pl-3 pr-1">
          <button onClick={() => setProfileOpen((v) => !v)} aria-expanded={profileOpen} aria-label="Open account menu" className="flex items-center gap-2 rounded-xl p-1 pr-2 transition-colors hover:bg-canvas cursor-pointer">
          <div
            className={cn(
              'grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-white',
              role === 'admin' ? 'bg-canary' : 'bg-brick text-white',
            )}
          >
            {user?.name.slice(0, 1)}
          </div>
          <div className="hidden leading-tight lg:block">
            <p className="text-sm font-semibold text-ink">{user?.name}</p>
            <p className="text-[11px] capitalize text-ink-soft">{role}</p>
          </div>
          </button>
          {profileOpen && (
            <>
              <button aria-label="Close account menu" onClick={() => setProfileOpen(false)} className="fixed inset-0 z-40 cursor-default" />
              <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden rounded-2xl bg-white ring-1 ring-black/10 shadow-pop animate-scale-in">
                <div className="border-b border-hair bg-canvas/70 px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-canary font-bold text-ink">{user?.name.slice(0, 1)}</span>
                    <div className="min-w-0"><p className="truncate text-sm font-bold text-ink">{user?.name}</p><p className="text-xs capitalize text-ink-soft">{role} account</p></div>
                  </div>
                </div>
                <div className="p-2">
                  <button onClick={() => { navigate('/settings'); setProfileOpen(false) }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-ink-soft transition-colors hover:bg-canvas hover:text-ink"><Settings className="h-4 w-4" /> Account settings</button>
                  <button onClick={() => { navigate('/activity'); setProfileOpen(false) }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-ink-soft transition-colors hover:bg-canvas hover:text-ink"><UserRound className="h-4 w-4" /> My activity</button>
                </div>
                <div className="border-t border-hair p-2">
                  <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-brick transition-colors hover:bg-brick-50"><LogOut className="h-4 w-4" /> Log out</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
