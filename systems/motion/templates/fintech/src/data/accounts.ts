import type { Account, AccountId } from './types';
import { addDays, toIsoDate } from '../lib/dates';
import { seededRandom } from '../lib/seeded';
import { TODAY } from './company';

export const accounts: Account[] = [
  { id: 'operating', name: 'Operating', kind: 'Checking', institution: 'Harbor & Pine Bank', last4: '4821', balance: 184_320.55 },
  { id: 'reserve', name: 'Reserve', kind: 'Savings', institution: 'Harbor & Pine Bank', last4: '9930', balance: 250_000.0 },
  { id: 'payroll', name: 'Payroll', kind: 'Checking', institution: 'Cedar Valley Credit Union', last4: '1177', balance: 21_410.2 },
];

export const accountById = Object.fromEntries(accounts.map((a) => [a.id, a])) as Record<AccountId, Account>;

export const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

export interface BalancePoint {
  /** ISO date. */
  date: string;
  /** "Oct 21", the chart's x label. */
  day: string;
  balance: number;
}

const dayLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

/**
 * 90 days of end-of-day balances for one account, walked backwards from today's balance so the series
 * ends exactly at the current balance. Each account has its own rhythm (operating drifts up with sales,
 * reserve steps up monthly, payroll is funded and drained twice a month).
 */
function balanceHistory(account: Account, seed: number): BalancePoint[] {
  const rand = seededRandom(seed);
  const points: BalancePoint[] = [];
  let balance = account.balance;
  for (let i = 0; i < 90; i++) {
    const date = addDays(TODAY, -i);
    points.push({ date: toIsoDate(date), day: dayLabel.format(date), balance: Math.round(balance * 100) / 100 });
    const dom = date.getDate();
    let change: number;
    if (account.id === 'operating') change = 520 + (rand() - 0.5) * 6200;
    else if (account.id === 'reserve') change = dom === 1 ? 5000 : 0;
    else change = dom === 1 || dom === 15 ? -14_500 : dom === 14 || dom === 30 ? 15_200 : 0;
    balance -= change;
  }
  return points.reverse();
}

export const balanceHistoryByAccount: Record<AccountId, BalancePoint[]> = {
  operating: balanceHistory(accountById.operating, 11),
  reserve: balanceHistory(accountById.reserve, 23),
  payroll: balanceHistory(accountById.payroll, 37),
};

/** Total balance across accounts, per day. */
export const totalBalanceHistory: BalancePoint[] = balanceHistoryByAccount.operating.map((p, i) => ({
  ...p,
  balance: Math.round(accounts.reduce((sum, a) => sum + balanceHistoryByAccount[a.id][i].balance, 0) * 100) / 100,
}));
