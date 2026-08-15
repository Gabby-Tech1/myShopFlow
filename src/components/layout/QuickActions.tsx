import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, ShoppingCart, PackagePlus, UserPlus, Receipt, HandCoins } from 'lucide-react'
import { useUi } from '@/store/ui'
import { useCan } from '@/store/access'
import { cn } from '@/lib/utils'

interface Action {
  label: string
  icon: React.ReactNode
  onClick: () => void
  show: boolean
  tone?: string
}

export function QuickActions() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const openModal = useUi((s) => s.openModal)
  const canExpense = useCan('expenses')
  const canPay = useCan('receivePayment')

  const actions: Action[] = [
    { label: 'New Sale', icon: <ShoppingCart className="h-4 w-4" />, onClick: () => navigate('/pos'), show: true, tone: 'bg-canary text-ink' },
    { label: 'Add Product', icon: <PackagePlus className="h-4 w-4" />, onClick: () => navigate('/products?add=1'), show: true },
    { label: 'Register Customer', icon: <UserPlus className="h-4 w-4" />, onClick: () => openModal('registerCustomer'), show: true },
    { label: 'Receive Payment', icon: <HandCoins className="h-4 w-4" />, onClick: () => openModal('payment'), show: canPay },
    { label: 'Add Expense', icon: <Receipt className="h-4 w-4" />, onClick: () => openModal('expense'), show: canExpense },
  ]

  return (
    <>
    {open && <button aria-label="Close quick actions" onClick={() => setOpen(false)} className="fixed inset-0 z-[49] cursor-default bg-transparent" />}
    <div className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-3 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.ul
            className="flex flex-col items-end gap-2"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{ visible: { transition: { staggerChildren: 0.04 } }, hidden: {} }}
          >
            {actions
              .filter((a) => a.show)
              .map((a) => (
                <motion.li
                  key={a.label}
                  variants={{
                    hidden: { opacity: 0, y: 8, scale: 0.9 },
                    visible: { opacity: 1, y: 0, scale: 1 },
                  }}
                >
                  <button
                    onClick={() => {
                      a.onClick()
                      setOpen(false)
                    }}
                    className="flex items-center gap-2.5 rounded-full bg-paper py-2.5 pl-4 pr-3 text-sm font-semibold text-ink shadow-pop transition-transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    {a.label}
                    <span className={cn('grid h-8 w-8 place-items-center rounded-full', a.tone ?? 'bg-black/[0.06] text-ink')}>
                      {a.icon}
                    </span>
                  </button>
                </motion.li>
              ))}
          </motion.ul>
        )}
      </AnimatePresence>

      <button
        data-tour="quick-actions"
        onClick={() => setOpen((v) => !v)}
        aria-label="Quick actions"
        aria-expanded={open}
        className="grid h-14 w-14 place-items-center rounded-full bg-canary text-white shadow-pop transition-transform hover:scale-105 active:scale-95 cursor-pointer"
      >
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
          <Plus className="h-6 w-6" />
        </motion.span>
      </button>
    </div>
    </>
  )
}
