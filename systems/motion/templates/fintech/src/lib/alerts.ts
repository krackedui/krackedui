// Things that need attention, derived from the app state (shown on Overview and in the notifications popover).
import type { IconName } from '@krackedui/motion';
import type { AppState } from '../state/store';
import type { Route } from './router';
import { accounts } from '../data/accounts';
import { LOW_BALANCE_THRESHOLD } from '../data/company';
import { formatMoney } from './format';

export interface AppAlert {
  id: string;
  tone: 'warning' | 'danger' | 'info';
  icon: IconName;
  title: string;
  description: string;
  route: Route;
}

export function deriveAlerts(state: AppState): AppAlert[] {
  const out: AppAlert[] = [];
  for (const a of accounts) {
    if (a.balance < LOW_BALANCE_THRESHOLD) {
      out.push({
        id: `low-${a.id}`,
        tone: 'warning',
        icon: 'warning',
        title: `${a.name} balance is low`,
        description: `${formatMoney(a.balance)} left, below the ${formatMoney(LOW_BALANCE_THRESHOLD, { whole: true })} threshold. Payroll runs on Nov 1.`,
        route: { page: 'account', id: a.id },
      });
    }
  }
  const failed = state.transactions.filter((t) => t.status === 'Failed');
  if (failed.length) {
    out.push({
      id: 'failed',
      tone: 'danger',
      icon: 'error',
      title: `${failed.length} failed ${failed.length === 1 ? 'transaction' : 'transactions'}`,
      description: `Latest: ${failed[0].merchant}, ${formatMoney(failed[0].amount)}.`,
      route: { page: 'transactions', txn: failed[0].id },
    });
  }
  for (const b of state.budgets) {
    if (b.spent > b.limit) {
      out.push({
        id: `budget-${b.category}`,
        tone: 'warning',
        icon: 'wallet',
        title: `${b.category} is over budget`,
        description: `${formatMoney(b.spent)} spent of ${formatMoney(b.limit, { whole: true })} this month.`,
        route: { page: 'budgets' },
      });
    }
  }
  return out;
}
