// Builds a CSV file in the browser and downloads it (no server involved).
import type { Transaction } from '../data/types';
import { accountById } from '../data/accounts';

const header = ['Date', 'Merchant', 'Category', 'Account', 'Status', 'Method', 'Amount', 'Note', 'Receipt'];

function cell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function transactionsToCsv(rows: Transaction[]): string {
  const lines = rows.map((t) =>
    [t.date, t.merchant, t.category, accountById[t.account].name, t.status, t.method, t.amount.toFixed(2), t.note, t.receipt ?? '']
      .map(cell)
      .join(','),
  );
  return [header.join(','), ...lines].join('\n');
}

export function downloadFile(name: string, content: string, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
