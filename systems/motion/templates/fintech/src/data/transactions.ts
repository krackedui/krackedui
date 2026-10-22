// ~150 deterministic transactions over the 90 days up to TODAY.
import type { AccountId, Category, PaymentMethod, Transaction, TransactionStatus } from './types';
import { addDays, toIsoDate } from '../lib/dates';
import { seededRandom } from '../lib/seeded';
import { TODAY } from './company';

export const categories: Category[] = ['Revenue', 'Payroll', 'Rent', 'Supplies', 'Software', 'Marketing', 'Travel', 'Utilities', 'Taxes'];
export const statuses: TransactionStatus[] = ['Posted', 'Pending', 'Failed'];

interface Recurring {
  merchant: string;
  category: Category;
  /** Inclusive amount range; negative = money out. */
  range: [number, number];
  method: PaymentMethod;
  account?: AccountId;
  /** Which days (counting back from today, 0 = today) it happens on. */
  on(this: void, daysAgo: number, dayOfMonth: number): boolean;
  note?: string;
}

const every = (n: number, offset = 0) => (daysAgo: number) => (daysAgo + offset) % n === 0;
const onDays = (...days: number[]) => (_: number, dom: number) => days.includes(dom);

const schedule: Recurring[] = [
  { merchant: 'Card sales settlement', category: 'Revenue', range: [3800, 6200], method: 'ACH', on: every(2) },
  { merchant: 'Juniper Market wholesale', category: 'Revenue', range: [1200, 3400], method: 'ACH', on: every(7, 3), note: 'Weekly wholesale order' },
  { merchant: 'Northside Office Catering', category: 'Revenue', range: [650, 1900], method: 'ACH', on: every(14, 5) },
  { merchant: 'Payroll run', category: 'Payroll', range: [-14_800, -14_200], method: 'ACH', account: 'payroll', on: onDays(1, 15) },
  { merchant: 'Payroll taxes', category: 'Taxes', range: [-3200, -2950], method: 'ACH', account: 'payroll', on: onDays(2, 16) },
  { merchant: 'Harbor Street Properties', category: 'Rent', range: [-8500, -8500], method: 'ACH', on: onDays(1), note: 'Café lease, Alder Street' },
  { merchant: 'Bluebird Bean Importers', category: 'Supplies', range: [-2600, -1400], method: 'ACH', on: every(7, 1) },
  { merchant: 'Valley Dairy Co-op', category: 'Supplies', range: [-1100, -620], method: 'Card •• 4242', on: every(7, 4) },
  { merchant: 'Packwell Cups & Lids', category: 'Supplies', range: [-980, -410], method: 'Card •• 4242', on: every(10, 6) },
  { merchant: 'Tallybook Accounting', category: 'Software', range: [-79, -79], method: 'Card •• 4242', on: onDays(3) },
  { merchant: 'Brewline POS', category: 'Software', range: [-189, -189], method: 'Card •• 4242', on: onDays(5) },
  { merchant: 'Shiftwise Scheduling', category: 'Software', range: [-64, -64], method: 'Card •• 4242', on: onDays(9) },
  { merchant: 'Inkpad Design Suite', category: 'Software', range: [-54.99, -54.99], method: 'Card •• 4242', on: onDays(12) },
  { merchant: 'Cloudshelf Storage', category: 'Software', range: [-29, -29], method: 'Card •• 4242', on: onDays(18) },
  { merchant: 'Paper Lantern Print Shop', category: 'Marketing', range: [-1400, -260], method: 'Card •• 4242', on: every(16, 2), note: 'Menus and window posters' },
  { merchant: 'Neighborhood radio spot', category: 'Marketing', range: [-900, -600], method: 'ACH', on: onDays(20) },
  { merchant: 'Coastline Air', category: 'Travel', range: [-640, -280], method: 'Card •• 4242', on: every(29, 8), note: 'Origin trip, green coffee buying' },
  { merchant: 'Midtown Inn', category: 'Travel', range: [-420, -180], method: 'Card •• 4242', on: every(31, 6) },
  { merchant: 'City Power & Light', category: 'Utilities', range: [-1100, -820], method: 'ACH', on: onDays(8) },
  { merchant: 'Metro Water Services', category: 'Utilities', range: [-460, -330], method: 'ACH', on: onDays(11) },
  { merchant: 'State Dept. of Revenue', category: 'Taxes', range: [-6840, -6840], method: 'Wire', on: (_, dom) => dom === 30, note: 'Quarterly sales tax' },
];

/** Expenses on a card usually carry a receipt. */
const receiptLikely = (t: Pick<Transaction, 'method' | 'amount'>) => t.amount < 0 && t.method === 'Card •• 4242';

function generate(): Transaction[] {
  const rand = seededRandom(2026);
  const out: Transaction[] = [];
  for (let daysAgo = 89; daysAgo >= 0; daysAgo--) {
    const date = addDays(TODAY, -daysAgo);
    const dom = date.getDate();
    for (const r of schedule) {
      if (!r.on(daysAgo, dom)) continue;
      const [lo, hi] = r.range;
      const amount = Math.round((lo + (hi - lo) * rand()) * 100) / 100;
      const status: TransactionStatus = daysAgo <= 2 ? 'Pending' : rand() < 0.025 ? 'Failed' : 'Posted';
      const base = { method: r.method, amount };
      out.push({
        id: `txn_${String(out.length + 1).padStart(4, '0')}`,
        date: toIsoDate(date),
        merchant: r.merchant,
        category: r.category,
        amount,
        account: r.account ?? 'operating',
        status,
        method: r.method,
        note: r.note ?? '',
        receipt: receiptLikely(base) && rand() < 0.6 ? `receipt-${toIsoDate(date)}.pdf` : null,
      });
    }
  }
  // Newest first, like a bank feed.
  return out.reverse();
}

export const initialTransactions: Transaction[] = generate();

/** Merchant → category, for the "Categorize" suggestions and search. */
export const merchants = [...new Set(initialTransactions.map((t) => t.merchant))].sort();
