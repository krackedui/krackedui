import type { Budget } from './types';

/** Monthly budgets for October. */
export const initialBudgets: Budget[] = [
  { category: 'Supplies', limit: 22_000, spent: 17_980.4 },
  { category: 'Marketing', limit: 3_000, spent: 3_420.0 },
  { category: 'Software', limit: 1_200, spent: 415.99 },
  { category: 'Travel', limit: 1_500, spent: 640.25 },
  { category: 'Utilities', limit: 2_000, spent: 1_284.7 },
];

/** Progress tone for a budget: warning from 80% used, danger when over. */
export function budgetTone(b: Pick<Budget, 'limit' | 'spent'>): 'success' | 'warning' | 'danger' {
  const ratio = b.limit > 0 ? b.spent / b.limit : 1;
  if (ratio > 1) return 'danger';
  if (ratio >= 0.8) return 'warning';
  return 'success';
}
