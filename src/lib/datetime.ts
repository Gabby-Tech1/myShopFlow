import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
} from 'date-fns'

export function fmtTime(iso: string): string {
  return format(parseISO(iso), 'h:mm a')
}

export function fmtDate(iso: string): string {
  return format(parseISO(iso), 'd MMM yyyy')
}

export function fmtDateTime(iso: string): string {
  return format(parseISO(iso), 'd MMM yyyy · h:mm a')
}

export function fmtDayHeading(iso: string): string {
  const d = parseISO(iso)
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'EEEE, d MMM yyyy')
}

export function timeAgo(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true })
}

export type RangeKey = 'today' | 'week' | 'month' | 'last_month' | 'year' | 'custom'

export interface DateRange {
  from: Date
  to: Date
  key: RangeKey
  label: string
}

export function rangeFor(key: RangeKey, now = new Date()): DateRange {
  switch (key) {
    case 'today':
      return { key, from: startOfDay(now), to: now, label: 'Today' }
    case 'week':
      return { key, from: startOfWeek(now, { weekStartsOn: 1 }), to: now, label: 'This Week' }
    case 'month':
      return { key, from: startOfMonth(now), to: now, label: 'This Month' }
    case 'last_month': {
      const lm = subMonths(now, 1)
      return { key, from: startOfMonth(lm), to: startOfMonth(now), label: 'Last Month' }
    }
    case 'year':
      return { key, from: startOfYear(now), to: now, label: 'This Year' }
    default:
      return { key: 'custom', from: startOfMonth(now), to: now, label: 'Custom' }
  }
}

export function inRange(iso: string, range: DateRange): boolean {
  const t = parseISO(iso).getTime()
  return t >= range.from.getTime() && t <= range.to.getTime()
}
