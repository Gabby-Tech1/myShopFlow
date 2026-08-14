import { cn } from '@/lib/utils'

export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#12141A" />
      <path
        d="M9 20c0-3 2.5-4 3.5-6M16 8v16M22 12c0 3-2.5 4-3.5 6"
        stroke="#F4B400"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export function Logo({ className, dark, compact }: { className?: string; dark?: boolean; compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      {!compact && (
        <div className="leading-none">
          <div className={cn('text-[15px] font-bold tracking-tight', dark ? 'text-white' : 'text-ink')}>
            MyShopFlow
          </div>
          <div className={cn('mt-0.5 text-[10px] font-medium', dark ? 'text-sidebar-muted' : 'text-ink-soft')}>
            Smart Inventory · Smarter Cash Flow
          </div>
        </div>
      )}
    </div>
  )
}
