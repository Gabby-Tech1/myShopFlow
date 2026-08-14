import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      {icon && <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-black/[0.04] text-ink-soft">{icon}</div>}
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-xs text-sm text-ink-soft">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
