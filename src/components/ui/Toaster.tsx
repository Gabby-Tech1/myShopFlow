import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, XCircle, X } from 'lucide-react'
import { useToasts } from '@/store/toast'

const icons = {
  success: <CheckCircle2 className="h-5 w-5 text-inflow" />,
  info: <Info className="h-5 w-5 text-info" />,
  error: <XCircle className="h-5 w-5 text-danger" />,
}

export function Toaster() {
  const { toasts, dismiss } = useToasts()
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[calc(100%-2rem)] max-w-sm flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-hair bg-paper px-4 py-3 shadow-pop"
          >
            <span className="mt-0.5 shrink-0">{icons[t.tone]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{t.title}</p>
              {t.description && <p className="mt-0.5 text-sm text-ink-soft">{t.description}</p>}
            </div>
            {t.action && (
              <button
                onClick={() => {
                  t.action!.onClick()
                  dismiss(t.id)
                }}
                className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-canary-700 hover:bg-canary-50 transition-colors cursor-pointer"
              >
                {t.action.label}
              </button>
            )}
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="shrink-0 rounded-lg p-1 text-ink-soft hover:bg-black/[0.05] transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
