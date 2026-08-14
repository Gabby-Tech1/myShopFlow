import { cn } from '@/lib/utils'

interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  size?: 'sm' | 'md'
  className?: string
}

export function Segmented<T extends string>({ options, value, onChange, size = 'md', className }: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-xl bg-canvas p-1 ring-1 ring-hair',
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-lg font-semibold transition-all duration-300 ease-spring cursor-pointer whitespace-nowrap',
              size === 'sm' ? 'px-3 py-1.5 text-[12px]' : 'px-3.5 py-2 text-[13px]',
              active ? 'bg-paper text-ink shadow-xs ring-1 ring-hair' : 'text-ink-soft hover:text-ink',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
