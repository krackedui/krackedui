/** Money and dates, formatted once so every screen agrees. */
import { company } from './data';

const MONEY = new Intl.NumberFormat('en-US', { style: 'currency', currency: company.currency, maximumFractionDigits: 0 });
const MONEY_EXACT = new Intl.NumberFormat('en-US', { style: 'currency', currency: company.currency });
const DAY = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

export const money = (n: number) => MONEY.format(n);
export const moneyExact = (n: number) => MONEY_EXACT.format(n);
/** Signed, for a ledger: the minus sign carries the meaning, not the colour. */
export const signed = (n: number) => `${n < 0 ? '−' : '+'}${MONEY_EXACT.format(Math.abs(n))}`;
export const day = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return DAY.format(new Date(y, m - 1, d));
};
export const percent = (n: number) => `${Math.round(n * 100)}%`;
