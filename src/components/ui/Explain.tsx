import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Info } from 'lucide-react'
import { explain } from '@/lib/explain'
import { cn } from '@/lib/utils'

interface ExplainProps {
  /** A term present in the explain dictionary, or pass `text` directly. */
  term?: string
  text?: string
  className?: string
  /** Render as a small info dot after a label. */
  inline?: boolean
}

/**
 * Tap-to-explain (mobile) / hover tooltip (desktop). Every complex business
 * term gets one - one short sentence on why the number matters (spec §2).
 */
export function Explain({ term, text, className, inline = true }: ExplainProps) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const ref = useRef<HTMLSpanElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState<{ left: number; top: number; below: boolean; arrowLeft: number } | null>(null)
  const body = text ?? (term ? explain(term) : undefined)

  useEffect(() => {
    if (!open) return
    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (!rect) return
      const tooltipHalfWidth = 112
      const anchor = rect.left + rect.width / 2
      const left = Math.max(tooltipHalfWidth + 8, Math.min(anchor, window.innerWidth - tooltipHalfWidth - 8))
      const below = rect.top < 110
      const arrowLeft = tooltipHalfWidth + anchor - left
      setPosition({ left, top: below ? rect.bottom + 8 : rect.top - 8, below, arrowLeft })
    }
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    updatePosition()
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  if (!body) return null

  return (
    <span ref={ref} className={cn('relative inline-flex', className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={term ? `Explain: ${term}` : 'Explanation'}
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className={cn(
          'inline-grid place-items-center rounded-full text-ink-soft/70 hover:text-canary-600 transition-colors cursor-help',
          inline ? 'h-4 w-4 ml-1 align-middle' : 'h-5 w-5',
        )}
      >
        <Info className={inline ? 'h-3.5 w-3.5' : 'h-4 w-4'} strokeWidth={2.2} />
      </button>
      {open && position && createPortal(
        <span
          id={id}
          role="tooltip"
          className={cn('pointer-events-none fixed z-[200] w-56 -translate-x-1/2 rounded-xl bg-ink px-3 py-2 text-left text-xs font-medium leading-relaxed text-white shadow-pop', position.below ? '' : '-translate-y-full')}
          style={{ left: position.left, top: position.top }}
        >
          {body}
          <span className={cn('absolute h-2 w-2 -translate-x-1/2 rotate-45 bg-ink', position.below ? 'bottom-full translate-y-1/2' : 'top-full -translate-y-1/2')} style={{ left: position.arrowLeft }} />
        </span>
      , document.body)}
    </span>
  )
}
