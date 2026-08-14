import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'brick' | 'dark' | 'ghost' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-canary text-ink hover:bg-canary-400 focus-visible:ring-canary/60 shadow-xs',
  brick: 'bg-brick text-white hover:bg-brick-600 focus-visible:ring-brick/50 shadow-xs',
  dark: 'bg-ink text-white hover:bg-[#2A2E37] focus-visible:ring-ink/40 shadow-xs',
  ghost: 'bg-transparent text-ink hover:bg-ink/[0.05] focus-visible:ring-ink/30',
  outline: 'bg-paper text-ink ring-1 ring-hair hover:ring-ink/25 hover:bg-ink/[0.02] focus-visible:ring-ink/30',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-[52px] px-6 text-[15px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 ease-spring select-none cursor-pointer',
        'active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        'disabled:opacity-45 disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
})
