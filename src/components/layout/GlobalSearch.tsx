import { useEffect, useMemo, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, CornerDownLeft, Package, Search, Users, X } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useUi } from '@/store/ui'
import { useCan } from '@/store/access'
import { Icon } from '@/components/ui/Icon'
import { NAV } from './nav'
import { money } from '@/lib/format'
import { cn } from '@/lib/utils'

type Result =
  | { kind: 'page'; label: string; icon: string; to: string }
  | { kind: 'product'; label: string; sub: string; to: string }
  | { kind: 'customer'; label: string; sub: string; to: string }

export function GlobalSearch() {
  const open = useUi((s) => s.searchOpen)
  const setOpen = useUi((s) => s.setSearchOpen)
  const navigate = useNavigate()
  const products = useStore((s) => s.products)
  const customers = useStore((s) => s.customers)
  const canCost = useCan('costPrice')
  const [q, setQ] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [setOpen])

  useEffect(() => {
    if (!open) setQ('')
    setActiveIndex(0)
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => setActiveIndex(0), [q])

  const results = useMemo<Result[]>(() => {
    const term = q.trim().toLowerCase()
    const pages: Result[] = NAV.flatMap((g) => g.items).map((i) => ({ kind: 'page', label: i.label, icon: i.icon, to: i.to }))
    if (!term) return pages.slice(0, 7)
    const out: Result[] = []
    pages.filter((p) => p.label.toLowerCase().includes(term)).forEach((p) => out.push(p))
    products.filter((p) => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)).slice(0, 6).forEach((p) =>
      out.push({ kind: 'product', label: p.name, sub: `${p.sku} · ${money(p.salePrice)}${canCost ? ` · cost ${money(p.costPrice)}` : ''}`, to: '/products' }),
    )
    customers.filter((c) => c.name.toLowerCase().includes(term) || c.phone.includes(term)).slice(0, 6).forEach((c) =>
      out.push({ kind: 'customer', label: c.name, sub: c.phone, to: '/customers' }),
    )
    return out
  }, [q, products, customers, canCost])

  const go = (to: string) => {
    navigate(to)
    setOpen(false)
  }

  const onSearchKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && results[activeIndex]) go(results[activeIndex].to)
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center p-3 pt-[10vh] sm:p-6 sm:pt-[14vh]" onMouseDown={() => setOpen(false)}>
          <motion.div className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div role="dialog" aria-modal="true" aria-label="Global search" onMouseDown={(e) => e.stopPropagation()} className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl bg-white ring-1 ring-black/10 shadow-pop" initial={{ opacity: 0, y: -10, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.985 }} transition={{ duration: 0.18 }}>
            <div className="flex items-center gap-3 px-4 sm:px-5">
              <Search className="h-5 w-5 shrink-0 text-ink-soft" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onSearchKey} placeholder="Search products, customers, or pages" className="h-16 min-w-0 flex-1 bg-transparent text-[15px] font-medium text-ink placeholder:font-normal placeholder:text-ink-faint" />
              {q ? <button onClick={() => setQ('')} aria-label="Clear search" className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-canvas hover:text-ink"><X className="h-4 w-4" /></button> : <kbd className="rounded-md bg-canvas px-2 py-1 text-[10px] font-semibold text-ink-faint ring-1 ring-hair">ESC</kbd>}
            </div>
            <div className="flex items-center justify-between px-4 pb-1 pt-3 sm:px-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-ink-faint">{q ? `${results.length} ${results.length === 1 ? 'result' : 'results'}` : 'Quick links'}</p>
              <p className="hidden text-[10px] font-medium text-ink-faint sm:block">Use ↑↓ and Enter</p>
            </div>
            <ul className="max-h-[46vh] min-h-[180px] overflow-y-auto p-2 sm:p-3">
              {results.length === 0 && <li className="flex min-h-[170px] flex-col items-center justify-center px-3 py-8 text-center"><Search className="h-6 w-6 text-ink-faint" /><p className="mt-3 text-sm font-semibold text-ink">No results found</p><p className="mt-1 text-xs text-ink-soft">Try another name, SKU, phone number, or page.</p></li>}
              {results.map((r, i) => (
                <li key={`${r.kind}-${r.label}-${i}`}>
                  <button onClick={() => go(r.to)} onMouseEnter={() => setActiveIndex(i)} className={cn('group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors cursor-pointer', activeIndex === i ? 'bg-canvas' : 'hover:bg-canvas/70')}>
                    <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors', activeIndex === i ? 'bg-white text-ink shadow-xs ring-1 ring-hair' : 'bg-canvas text-ink-soft')}>{r.kind === 'page' ? <Icon name={r.icon} className="h-4 w-4" /> : r.kind === 'product' ? <Package className="h-4 w-4" /> : <Users className="h-4 w-4" />}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-ink">{r.label}</span>{'sub' in r && <span className="mt-0.5 block truncate text-xs text-ink-soft">{r.sub}</span>}</span>
                    <span className="hidden text-[10px] font-medium capitalize text-ink-faint sm:block">{r.kind}</span>
                    {activeIndex === i ? <CornerDownLeft className="h-3.5 w-3.5 text-ink-faint" /> : <ArrowRight className="h-3.5 w-3.5 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
