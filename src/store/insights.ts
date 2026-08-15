import type { Category, Customer, Expense, Product, Sale } from '@/types'
import { money } from '@/lib/format'
import { rangeFor } from '@/lib/datetime'
import {
  bestCategory,
  bestSalesDay,
  expensesInRange,
  lowStock,
  revenueOf,
  salesInRange,
  totalOutstanding,
} from './selectors'

export interface Insight {
  icon: string
  tone: 'good' | 'watch' | 'info'
  text: string
}

// Factual observations from real data only - never speculative (spec §2/§4).
export function buildInsights(
  sales: Sale[],
  products: Product[],
  categories: Category[],
  customers: Customer[],
  expenses: Expense[],
): Insight[] {
  const insights: Insight[] = []
  const thisMonth = rangeFor('month')
  const lastMonth = rangeFor('last_month')

  const revThis = revenueOf(salesInRange(sales, thisMonth))
  const revLast = revenueOf(salesInRange(sales, lastMonth))
  if (revLast > 0) {
    const change = ((revThis - revLast) / revLast) * 100
    insights.push({
      icon: change >= 0 ? 'TrendingUp' : 'TrendingDown',
      tone: change >= 0 ? 'good' : 'watch',
      text: `Sales ${change >= 0 ? 'increased' : 'decreased'} ${Math.abs(change).toFixed(0)}% compared with last month.`,
    })
  }

  const cat = bestCategory(salesInRange(sales, thisMonth), products, categories)
  if (cat) {
    insights.push({ icon: 'Boxes', tone: 'info', text: `${cat.name} is your fastest-moving category this month.` })
  }

  const owed = totalOutstanding(customers)
  if (owed > 0) {
    insights.push({ icon: 'HandCoins', tone: 'watch', text: `Customers currently owe you ${money(owed)}.` })
  }

  const expByCat: Record<string, number> = {}
  expenses.forEach((e) => (expByCat[e.category] = (expByCat[e.category] ?? 0) + e.amount))
  const topExp = Object.entries(expByCat).sort((a, b) => b[1] - a[1])[0]
  if (topExp) {
    insights.push({ icon: 'Receipt', tone: 'info', text: `${topExp[0]} is your highest recorded expense category.` })
  }

  const low = lowStock(products)
  if (low.length) {
    insights.push({ icon: 'PackageMinus', tone: 'watch', text: `${low.length} product${low.length > 1 ? 's are' : ' is'} low or out of stock.` })
  }

  const day = bestSalesDay(salesInRange(sales, thisMonth))
  if (day) {
    const weekday = new Date(day.date).toLocaleDateString('en-GB', { weekday: 'long' })
    insights.push({ icon: 'CalendarCheck', tone: 'good', text: `${weekday} was your highest-sales day this month.` })
  }

  void expensesInRange
  return insights
}
