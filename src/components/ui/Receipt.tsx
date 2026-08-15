import { Modal } from './Modal'
import { Button } from './Button'
import { LogoMark } from './Logo'
import { Badge } from './Badge'
import { money } from '@/lib/format'
import { fmtDateTime } from '@/lib/datetime'
import type { Sale } from '@/types'
import { useStore } from '@/store/useStore'
import { toast } from '@/store/toast'
import { Printer, Share2, Check } from 'lucide-react'

export function ReceiptModal({ sale, open, onClose }: { sale: Sale | null; open: boolean; onClose: () => void }) {
  const business = useStore((s) => s.businessProfile)
  const customer = useStore((s) => s.customers.find((c) => c.id === sale?.customerId))
  const cashier = useStore((s) => s.users.find((u) => u.id === sale?.userId))
  const receiptSettings = useStore((s) => s.settings.pos)
  if (!sale) return null

  const share = async () => {
    const text = `${business.name}\nReceipt ${sale.receiptNo}\nTotal: ${money(sale.total)}\n${sale.paid ? 'Paid' : 'Credit'} · ${sale.paymentMethod.toUpperCase()}`
    if (navigator.share) {
      try {
        await navigator.share({ title: `Receipt ${sale.receiptNo}`, text })
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard?.writeText(text)
      toast.success('Receipt copied', 'Receipt details copied to clipboard.')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      footer={
        <>
          {receiptSettings.allowPrint && <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>}
          {receiptSettings.allowShare && <Button variant="outline" onClick={share}>
            <Share2 className="h-4 w-4" /> Share
          </Button>}
          <Button onClick={onClose}>
            <Check className="h-4 w-4" /> Done
          </Button>
        </>
      }
    >
      <div className="text-center">
        <div className="mx-auto mb-2 flex justify-center"><LogoMark size={36} /></div>
        {receiptSettings.showBusinessDetails && <>
          <h2 className="text-lg font-bold text-ink">{business.name}</h2>
          <p className="text-xs text-ink-soft">{business.address}</p>
        </>}
        <div className="mt-3 flex items-center justify-center gap-2">
          <Badge tone={sale.paid ? 'inflow' : 'warn'} dot>{sale.paid ? 'Paid' : 'Credit - unpaid'}</Badge>
          <Badge tone="neutral">{sale.paymentMethod.toUpperCase()}</Badge>
        </div>
      </div>

      <div className="my-4 border-t border-dashed border-hair" />

      <div className="space-y-2">
        {sale.items.map((it) => (
          <div key={it.productId} className="flex items-start justify-between gap-3 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{it.name}</p>
              <p className="text-xs text-ink-soft tnum">{it.qty} × {money(it.unitPrice)}</p>
            </div>
            <span className="font-semibold text-ink tnum">{money(it.lineTotal)}</span>
          </div>
        ))}
      </div>

      <div className="my-4 border-t border-dashed border-hair" />

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-ink-soft">Total</span>
        <span className="text-xl font-bold text-ink tnum">{money(sale.total)}</span>
      </div>

      <div className="mt-4 space-y-1 text-xs text-ink-soft">
        <div className="flex justify-between"><span>Receipt</span><span className="font-medium text-ink">{sale.receiptNo}</span></div>
        <div className="flex justify-between"><span>Date</span><span className="font-medium text-ink">{fmtDateTime(sale.createdAt)}</span></div>
        {customer && <div className="flex justify-between"><span>Customer</span><span className="font-medium text-ink">{customer.name}</span></div>}
        {receiptSettings.showCashier && <div className="flex justify-between"><span>Served by</span><span className="font-medium text-ink">{cashier?.name}</span></div>}
      </div>
      <p className="mt-4 text-center text-xs text-ink-soft">Thank you for shopping with us!</p>
    </Modal>
  )
}
