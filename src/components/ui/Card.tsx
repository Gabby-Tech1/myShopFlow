import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Explain } from './Explain'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  flat?: boolean
}

export function Card({ className, hover, flat, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-paper ring-1 ring-black/[0.06]',
        flat ? '' : 'shadow-card',
        hover && 'transition-shadow duration-300 ease-spring hover:shadow-card-hover',
        className,
      )}
      {...rest}
    />
  )
}

interface CardHeaderProps {
  title: ReactNode
  term?: string
  action?: ReactNode
  subtitle?: ReactNode
  className?: string
}

export function CardHeader({ title, term, action, subtitle, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6', className)}>
      <div className="min-w-0">
        <h3 className="flex items-center text-base font-bold tracking-tightest text-ink">
          {title}
          {term && <Explain term={term} />}
        </h3>
        {subtitle && <p className="mt-1 text-[13px] text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
