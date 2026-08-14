// Plain-language, one-sentence explanations of every complex term (spec §2, §17).
// The <Explain> component renders these as hover tooltips (desktop) / tap-to-explain (mobile).

export const TERMS: Record<string, string> = {
  'Cash Balance': 'The money your business has right now across cash, bank, and Mobile Money.',
  'Net Cash Flow': 'The money that came in minus the money that went out during this period.',
  'Inventory Value': 'What the stock you currently hold cost you to buy.',
  'Gross Profit': 'Your sales revenue minus what those goods cost you (before other expenses).',
  'Net Profit': 'What is left after all recorded expenses are taken out of your sales.',
  'Profit Margin': 'The share of each sale that becomes profit.',
  Outstanding: 'Money your customers still owe you for credit sales.',
  Revenue: 'The total value of sales you made in this period.',
  'Opening Cash': 'The cash your business started this period with.',
  'Closing Cash': 'The cash your business ended this period with.',
  'Best Seller': 'The product with the most units sold in the selected period.',
  Operating: 'Money from your everyday business — sales, customer payments, wages, and normal expenses.',
  Investing: 'Money used to buy or sell long-term assets like equipment, furniture, or a vehicle.',
  Financing: 'Money used to fund the business or take money out — owner funds, loans, and withdrawals.',
  'Market Reference Rate': "The FX provider's mid-market reference rate — not a bank or forex-bureau counter rate.",
  'Mid-Market Rate': 'The midpoint between the buy and sell price of a currency, used as a fair reference.',
  'Money In': 'All the cash that entered the business during this period.',
  'Money Out': 'All the cash that left the business during this period.',
  'Low Stock': 'Products at or below the reorder level you set.',
  COGS: 'Cost of Goods Sold — what the items you sold originally cost you.',
  'Credit Sale': 'A sale where the customer has not paid yet, so it does not add cash until they pay.',
  Reconciliation: 'A check that Opening Cash plus money in, minus money out, equals your Closing Cash.',
}

export function explain(term: string): string | undefined {
  return TERMS[term]
}
