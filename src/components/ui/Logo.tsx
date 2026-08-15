import { cn } from '@/lib/utils'

export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <span className={cn('relative block shrink-0 overflow-hidden', className)} style={{ width: size, height: size }} aria-hidden>
      <img
        src="/images/logo.png"
        alt=""
        className="absolute max-w-none"
        style={{ width: size * 3.04, height: size * 2, left: size * -1.04, top: size * -0.22 }}
      />
    </span>
  )
}

export function Logo({ className, dark, compact }: { className?: string; dark?: boolean; compact?: boolean }) {
  if (compact) return <LogoMark className={className} />

  return (
    <div className={cn('inline-flex items-center', dark && 'rounded-xl bg-white px-2.5 py-1.5', className)}>
      <img src="/images/logo.png" alt="MyShopFlow" className="h-14 w-auto object-contain" />
    </div>
  )
}
