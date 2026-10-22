import type { Payee, ScheduledPayment } from './types';

export const payees: Payee[] = [
  { id: 'payee_1', name: 'Bluebird Bean Importers', category: 'Supplies', method: 'ACH', destination: 'ACH •• 3391' },
  { id: 'payee_2', name: 'Valley Dairy Co-op', category: 'Supplies', method: 'ACH', destination: 'ACH •• 0482' },
  { id: 'payee_3', name: 'Harbor Street Properties', category: 'Rent', method: 'ACH', destination: 'ACH •• 7710' },
  { id: 'payee_4', name: 'Packwell Cups & Lids', category: 'Supplies', method: 'ACH', destination: 'ACH •• 2256' },
  { id: 'payee_5', name: 'Paper Lantern Print Shop', category: 'Marketing', method: 'Wire', destination: 'Wire •• 6604' },
  { id: 'payee_6', name: 'City Power & Light', category: 'Utilities', method: 'ACH', destination: 'ACH •• 9013' },
];

export const payeeById = Object.fromEntries(payees.map((p) => [p.id, p])) as Record<string, Payee>;

export const initialScheduled: ScheduledPayment[] = [
  { id: 'pay_1', payeeId: 'payee_3', amount: 8_500, account: 'operating', date: '2026-11-01', memo: 'November rent' },
  { id: 'pay_2', payeeId: 'payee_1', amount: 2_180.5, account: 'operating', date: '2026-10-24', memo: 'Invoice BB-2291' },
  { id: 'pay_3', payeeId: 'payee_6', amount: 946.12, account: 'operating', date: '2026-11-08', memo: 'October electricity' },
  { id: 'pay_4', payeeId: 'payee_2', amount: 812.0, account: 'operating', date: '2026-10-28', memo: 'Dairy, week 44' },
];
