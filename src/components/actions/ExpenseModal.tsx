import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useStore } from '@/store/useStore'
import { useUi } from '@/store/ui'
import { toast } from '@/store/toast'
import { money } from '@/lib/format'
import type { PaymentMethod } from '@/types'
import { cn } from '@/lib/utils'

const CATEGORIES = ['Rent', 'Electricity', 'Water', 'Wages', 'Transport', 'Internet', 'Supplies', 'Other']
const METHODS: { value: Exclude<PaymentMethod, 'credit'>; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'momo', label: 'Mobile Money' },
  { value: 'card', label: 'Card' },
]

export function ExpenseModal() {
  const open = useUi((s) => s.modal === 'expense')
  const close = useUi((s) => s.closeModal)
  const addExpense = useStore((s) => s.addExpense)

  const [category, setCategory] = useState('Electricity')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<Exclude<PaymentMethod, 'credit'>>('momo')
  const [note, setNote] = useState('')

  const amt = parseFloat(amount) || 0

  const submit = () => {
    if (amt <= 0) return
    addExpense(category, amt, method, note || undefined)
    toast.success('Expense recorded', `${category} · ${money(amt)} taken out of cash.`)
    setAmount('')
    setNote('')
    close()
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add expense"
      description="Records money leaving the business and lowers your cash balance."
      footer={
        <>
          <Button variant="outline" onClick={close}>Cancel</Button>
          <Button variant="brick" onClick={submit} disabled={amt <= 0}>Save expense</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn('chip border', category === c ? 'bg-ink text-white border-ink' : 'bg-paper border-hair text-ink-soft hover:border-ink/30')}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="exp-amount">Amount (GH₵)</label>
          <input
            id="exp-amount"
            className="input tnum text-lg"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label className="label">Paid with</label>
          <div className="grid grid-cols-3 gap-2">
            {METHODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMethod(m.value)}
                className={cn(
                  'rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors cursor-pointer',
                  method === m.value ? 'border-canary bg-canary-50 text-ink' : 'border-hair bg-paper text-ink-soft hover:border-ink/30',
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="exp-note">Note (optional)</label>
          <input id="exp-note" className="input" placeholder="e.g. ECG prepaid top-up" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>
    </Modal>
  )
}
