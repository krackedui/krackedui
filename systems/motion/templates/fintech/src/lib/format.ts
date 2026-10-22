// Display formatting: money, dates and percentages (en-US, USD).
import { parseDate } from './dates';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const usdWhole = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const usdCompact = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });

/** "$1,234.50", "-$80.00"; `signed` adds "+" to positive amounts. */
export function formatMoney(amount: number, { signed = false, whole = false } = {}): string {
  const text = (whole ? usdWhole : usd).format(amount);
  return signed && amount > 0 ? `+${text}` : text;
}

/** "$12.4K": axis ticks and tight spaces. */
export function formatMoneyCompact(amount: number): string {
  return usdCompact.format(amount);
}

const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const longDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

/** "Oct 21". */
export function formatShortDate(iso: string): string {
  return shortDate.format(parseDate(iso));
}

/** "October 21, 2026". */
export function formatLongDate(iso: string): string {
  return longDate.format(parseDate(iso));
}

/** "+4.2%" / "-1.0%" change from `previous` to `current`. */
export function formatChange(current: number, previous: number): string {
  if (previous === 0) return '—';
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
}

export function trendOf(current: number, previous: number): 'up' | 'down' | 'flat' {
  if (Math.abs(current - previous) < 0.005) return 'flat';
  return current > previous ? 'up' : 'down';
}
