// Pure aggregations over transactions for charts and summaries.
import type { Category, Transaction } from '../data/types';
import { parseDate } from './dates';

/** Money out per category within [from, to], largest first (positive numbers). */
export function spendByCategory(transactions: Transaction[], from: Date, to: Date): { category: Category; amount: number }[] {
  const totals = new Map<Category, number>();
  for (const t of transactions) {
    if (t.amount >= 0 || t.status === 'Failed') continue;
    const d = parseDate(t.date);
    if (d < from || d > to) continue;
    totals.set(t.category, (totals.get(t.category) ?? 0) - t.amount);
  }
  return [...totals.entries()]
    .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 }))
    .sort((a, b) => b.amount - a.amount);
}

/** Keep the `n` largest slices and fold the rest into "Other". */
export function topWithOther<T extends { label: string; value: number }>(items: T[], n: number): { label: string; value: number }[] {
  if (items.length <= n) return items;
  const rest = items.slice(n).reduce((sum, i) => sum + i.value, 0);
  return [...items.slice(0, n), { label: 'Other', value: Math.round(rest * 100) / 100 }];
}
