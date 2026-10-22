// Filtering and sorting of the transactions table (pure functions).
import { compareValues, type DataTableSort, type DateRange } from '@krackedui/motion';
import type { Category, Transaction, TransactionStatus } from '../data/types';
import { accountById } from '../data/accounts';
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

const sortValue: Record<string, (t: Transaction) => string | number> = {
  date: (t) => t.date,
  merchant: (t) => t.merchant,
  category: (t) => t.category,
  account: (t) => accountById[t.account].name,
  status: (t) => t.status,
  amount: (t) => t.amount,
};

/** Sorts before paginating, so the whole result is in order (not just the visible page). */
export function sortTransactions(rows: Transaction[], sort: DataTableSort | null): Transaction[] {
  const get = sort ? sortValue[sort.key] : undefined;
  if (!sort || !get) return rows;
  const dir = sort.direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => compareValues(get(a), get(b)) * dir || a.id.localeCompare(b.id));
}

export function countActiveFilters(f: TransactionFilters): number {
  return [f.category, f.status, f.min !== null, f.max !== null, f.query.trim()].filter(Boolean).length;
}
