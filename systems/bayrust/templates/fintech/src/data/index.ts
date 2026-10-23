/*
 * Lumen Coffee Co.'s books. All of it is generated here, deterministically: the same numbers every
 * render and every machine, so a screenshot taken today matches the one taken next week. No random
 * values at render, no network.
 */

export type Status = 'Posted' | 'Pending' | 'Failed';
export type Method = 'Card •• 4242' | 'ACH' | 'Wire';

export interface Account {
  id: string;
  name: string;
  kind: 'Checking' | 'Savings' | 'Payroll';
  institution: string;
  last4: string;
  balance: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO day, local
  merchant: string;
  category: Category;
  amount: number; // negative is money out
  accountId: string;
  status: Status;
  method: Method;
  note: string;
  receipt: boolean;
}

export const CATEGORIES = ['Payroll', 'Rent', 'Supplies', 'Software', 'Marketing', 'Travel', 'Revenue', 'Taxes'] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Card {
  id: string;
  holder: string;
  last4: string;
  limit: number;
  spent: number;
  status: 'Active' | 'Frozen';
}

export interface Budget {
  category: Category;
  limit: number;
  spent: number;
}

export interface Payee {
  id: string;
  name: string;
  account: string;
}

export const company = { name: 'Lumen Coffee Co.', currency: 'USD' };

export const accounts: Account[] = [
  { id: 'op', name: 'Operating', kind: 'Checking', institution: 'Meridian Bank', last4: '8841', balance: 184_320.55 },
  { id: 'rs', name: 'Reserve', kind: 'Savings', institution: 'Meridian Bank', last4: '2170', balance: 310_000 },
  { id: 'pr', name: 'Payroll', kind: 'Payroll', institution: 'Northgate Trust', last4: '5509', balance: 42_880.1 },
];

/** A small deterministic generator, so "sample data" never means "different every time". */
function sequence(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1_664_525 + 1_013_904_223) >>> 0;
    return s / 0x1_0000_0000;
  };
}

const MERCHANTS: Record<Category, string[]> = {
  Payroll: ['Payroll run', 'Contractor — J. Rivera'],
  Rent: ['Harbour Properties'],
  Supplies: ['Bean & Barrel Imports', 'Clearwater Dairy', 'Verdant Packaging'],
  Software: ['Linear', 'Figma', 'Vercel', 'Notion'],
  Marketing: ['Meta Ads', 'Local Radio 98.3', 'Printworks'],
  Travel: ['Rail Europe', 'Southwest', 'Hotel Meridian'],
  Revenue: ['Card settlement', 'Wholesale — Ferry Market', 'Catering — Northwind'],
  Taxes: ['State sales tax', 'Federal estimated'],
};

const TODAY = new Date(2026, 9, 23); // fixed, so "last 30 days" is stable in every screenshot
const dayBefore = (n: number) => new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() - n);
export const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const parseDay = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const today = () => TODAY;

export const transactions: Transaction[] = (() => {
  const rnd = sequence(20_261_023);
  const out: Transaction[] = [];
  for (let i = 0; i < 150; i++) {
    const daysAgo = Math.floor(rnd() * 90);
    const category = CATEGORIES[Math.floor(rnd() * CATEGORIES.length)];
    const names = MERCHANTS[category];
    const merchant = names[Math.floor(rnd() * names.length)];
    const income = category === 'Revenue';
    const magnitude =
      category === 'Payroll' ? 2_400 + rnd() * 6_000
      : category === 'Rent' ? 4_200
      : category === 'Taxes' ? 900 + rnd() * 3_000
      : income ? 1_100 + rnd() * 7_500
      : 40 + rnd() * 900;
    const roll = rnd();
    out.push({
      id: `TX-${String(1000 + i)}`,
      date: isoDay(dayBefore(daysAgo)),
      merchant,
      category,
      amount: Number((income ? magnitude : -magnitude).toFixed(2)),
      accountId: category === 'Payroll' ? 'pr' : 'op',
      status: roll > 0.93 ? 'Failed' : roll > 0.82 ? 'Pending' : 'Posted',
      method: income ? 'ACH' : magnitude > 2_000 ? 'Wire' : 'Card •• 4242',
      note: '',
      receipt: rnd() > 0.6,
    });
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? 1 : -1));
})();

export interface MonthPoint {
  month: string;
  in: number;
  out: number;
  net: number;
}

export const months: MonthPoint[] = (() => {
  const rnd = sequence(77_003);
  const label = new Intl.DateTimeFormat('en', { month: 'short' });
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(TODAY.getFullYear(), TODAY.getMonth() - (11 - i), 1);
    const moneyIn = Math.round(58_000 + i * 1_900 + rnd() * 9_000);
    const moneyOut = Math.round(41_000 + i * 1_100 + rnd() * 7_000);
    return { month: label.format(d), in: moneyIn, out: moneyOut, net: moneyIn - moneyOut };
  });
})();

export interface BalancePoint {
  day: string;
  balance: number;
}

export const balanceSeries: BalancePoint[] = (() => {
  const rnd = sequence(5_150);
  let balance = 150_000;
  return Array.from({ length: 90 }, (_, i) => {
    balance += (rnd() - 0.42) * 7_000;
    return { day: isoDay(dayBefore(89 - i)), balance: Math.round(balance) };
  });
})();

export const cards: Card[] = [
  { id: 'c1', holder: 'Dana Whitfield', last4: '4242', limit: 10_000, spent: 6_420, status: 'Active' },
  { id: 'c2', holder: 'Marco Pereira', last4: '7781', limit: 5_000, spent: 4_810, status: 'Active' },
  { id: 'c3', holder: 'Ingrid Sollers', last4: '1038', limit: 2_500, spent: 240, status: 'Frozen' },
  { id: 'c4', holder: 'Tobias Lund', last4: '9925', limit: 7_500, spent: 7_910, status: 'Active' },
];

export const budgets: Budget[] = [
  { category: 'Supplies', limit: 18_000, spent: 12_430 },
  { category: 'Software', limit: 3_000, spent: 2_640 },
  { category: 'Marketing', limit: 6_000, spent: 6_310 },
  { category: 'Travel', limit: 4_000, spent: 1_180 },
  { category: 'Rent', limit: 13_000, spent: 12_600 },
];

export const payees: Payee[] = [
  { id: 'p1', name: 'Harbour Properties', account: '•• 3391' },
  { id: 'p2', name: 'Bean & Barrel Imports', account: '•• 7742' },
  { id: 'p3', name: 'Clearwater Dairy', account: '•• 1180' },
  { id: 'p4', name: 'Verdant Packaging', account: '•• 6650' },
  { id: 'p5', name: 'Printworks', account: '•• 2214' },
  { id: 'p6', name: 'Northgate Trust', account: '•• 5509' },
];

export interface ScheduledPayment {
  id: string;
  payee: string;
  amount: number;
  date: string;
  accountId: string;
}

export const scheduled: ScheduledPayment[] = [
  { id: 's1', payee: 'Harbour Properties', amount: 4_200, date: isoDay(dayBefore(-7)), accountId: 'op' },
  { id: 's2', payee: 'Clearwater Dairy', amount: 980.4, date: isoDay(dayBefore(-3)), accountId: 'op' },
  { id: 's3', payee: 'Northgate Trust', amount: 18_400, date: isoDay(dayBefore(-12)), accountId: 'pr' },
];

export const team = [
  { id: 'u1', name: 'Dana Whitfield', email: 'dana@lumen.coffee', role: 'Owner' },
  { id: 'u2', name: 'Marco Pereira', email: 'marco@lumen.coffee', role: 'Admin' },
  { id: 'u3', name: 'Ingrid Sollers', email: 'ingrid@lumen.coffee', role: 'Bookkeeper' },
  { id: 'u4', name: 'Tobias Lund', email: 'tobias@lumen.coffee', role: 'Viewer' },
];
