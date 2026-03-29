/** Indian Rupee display helpers — app default currency is INR. */

export const CURRENCY_SYMBOL = "₹" as const
export const CURRENCY_CODE = "INR" as const

export function formatCurrency(
  amount: number,
  options?: { maximumFractionDigits?: number }
): string {
  const n = Number.isFinite(amount) ? amount : 0
  return `${CURRENCY_SYMBOL}${n.toLocaleString("en-IN", {
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
    minimumFractionDigits: 0,
  })}`
}

/** "₹800 – ₹13,800" */
export function formatCurrencyRange(min: number, max: number): string {
  return `${formatCurrency(min)} – ${formatCurrency(max)}`
}

/** Hourly display */
export function formatHourlyRange(min: number, max: number): string {
  return `${formatCurrency(min)}/hr – ${formatCurrency(max)}/hr`
}
