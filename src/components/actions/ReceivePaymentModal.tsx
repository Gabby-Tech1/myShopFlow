import { useEffect, useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useStore } from '@/store/useStore'
import { useUi } from '@/store/ui'
import { toast } from '@/store/toast'
import { money } from '@/lib/format'
import { cn } from '@/lib/utils'

const METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'momo', label: 'Mobile Money' },
  { value: 'card', label: 'Card' },
] as const

export function ReceivePaymentModal() {
  const open = useUi((s) => s.modal === 'payment')
  const preset = useUi((s) => s.paymentCustomerId)
  const close = useUi((s) => s.closeModal)
  const customers = useStore((s) => s.customers)
  const receivePayment = useStore((s) => s.receivePayment)

  const withBalance = useMemo(
    () => customers.filter((c) => c.outstanding > 0).sort((a, b) => b.outstanding - a.outstanding),
    [customers],
  )
  const [customerId, setCustomerId] = useState(preset ?? '')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<(typeof METHODS)[number]['value']>('momo')

  useEffect(() => {
    if (open) {
      setCustomerId(preset ?? withBalance[0]?.id ?? '')
      setAmount('')
      setMethod('momo')
    }
  }, [open, preset, withBalance])

  const customer = customers.find((c) => c.id === customerId)
  const amt = parseFloat(amount) || 0
  const valid = customer && amt > 0

  const submit = () => {
    if (!valid) return
    const capped = Math.min(amt, customer!.outstanding || amt)
    receivePayment(customerId, capped, method)
    toast.success('Payment received', `${money(capped)} recorded from ${customer!.name}.`)
    close()
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Receive payment"
      description="Records cash coming in and reduces what the customer owes."
      footer={
        <>
          <Button variant="outline" onClick={close}>Cancel</Button>
          <Button onClick={submit} disabled={!valid}>Record payment</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="pay-customer">Customer</label>
          <select id="pay-customer" className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="" disabled>Select a customer…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.outstanding > 0 ? `— owes ${money(c.outstanding)}` : '— no balance'}
              </option>
            ))}
          </select>
        </div>

        {customer && customer.outstanding > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-brick-50 px-3.5 py-2.5">
            <span className="text-sm font-medium text-ink">Currently owes</span>
            <span className="text-sm font-bold text-brick-600 tnum">{money(customer.outstanding)}</span>
          </div>
        )}

        <div>
          <label className="label" htmlFor="pay-amount">Amount received (GH₵)</label>
          <input
            id="pay-amount"
            className="input tnum text-lg"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {customer && customer.outstanding > 0 && (
            <button
              onClick={() => setAmount(String(customer.outstanding))}
              className="mt-2 text-xs font-semibold text-canary-700 hover:underline cursor-pointer"
            >
              Pay full balance ({money(customer.outstanding)})
            </button>
          )}
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
      </div>
    </Modal>
  )
}
