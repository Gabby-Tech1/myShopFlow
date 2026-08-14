import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PageHero({ eyebrow, title, description, action, className }: {
  eyebrow?: string
  title: string
  description: string
  action?: ReactNode
  className?: string
}) {
  return (
    <section className={cn('relative overflow-hidden rounded-3xl bg-sidebar px-5 py-6 text-white shadow-card sm:px-7 sm:py-7', className)}>
      <div className="pointer-events-none absolute -right-12 -top-20 h-52 w-52 rounded-full bg-canary/15 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/3 h-20 w-40 bg-white/[0.025] blur-xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          {eyebrow && <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-canary">{eyebrow}</p>}
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-[28px]">{title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">{description}</p>
        </div>
        {action && <div className="relative shrink-0">{action}</div>}
      </div>
    </section>
  )
}
