// Filtering of the transactions table (pure functions). Sorting and paging are DataTable's.
import type { DateRange } from '@krackedui/motion';
import type { Category, Transaction, TransactionStatus } from '../data/types';
import { toIsoDate } from './dates';

export interface TransactionFilters {
  range: DateRange;
  category: Category | '';
  status: TransactionStatus | '';
  /** Bounds on the absolute amount. */
  min: number | null;
  max: number | null;
  query: string;
}

export function filterTransactions(rows: Transaction[], f: TransactionFilters): Transaction[] {
  const from = f.range.from ? toIsoDate(f.range.from) : null;
  const to = f.range.to ? toIsoDate(f.range.to) : null;
  const q = f.query.trim().toLowerCase();
  return rows.filter((t) => {
    if (from && t.date < from) return false;
    if (to && t.date > to) return false;
    if (f.category && t.category !== f.category) return false;
    if (f.status && t.status !== f.status) return false;
    const abs = Math.abs(t.amount);
    if (f.min !== null && abs < f.min) return false;
    if (f.max !== null && abs > f.max) return false;
    if (q && !`${t.merchant} ${t.note} ${t.category} ${t.id}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function countActiveFilters(f: TransactionFilters): number {
  return [f.category, f.status, f.min !== null, f.max !== null, f.query.trim()].filter(Boolean).length;
}
