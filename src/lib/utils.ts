import { clsx, type ClassValue } from 'clsx'

/** Tailwind-friendly class combiner. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

let counter = 0
/** Short, readable unique id. */
export function uid(prefix = 'id'): string {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}`
}

export function receiptNo(): string {
  const n = Math.floor(1000 + Math.random() * 9000)
  return `RCT-${n}`
}
