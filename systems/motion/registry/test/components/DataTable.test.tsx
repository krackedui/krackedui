import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { DataTable, type DataTableColumn } from '@system';
import { renderUI, screen, within } from '../utils';

interface Tx { id: string; merchant: string; amount: number; date: string }
const rows: Tx[] = [
  { id: 't1', merchant: 'Coffee Lab', amount: 4.5, date: '2026-10-03' },
  { id: 't2', merchant: 'Airline', amount: 420, date: '2026-09-28' },
  { id: 't3', merchant: 'Bookshop', amount: 32, date: '2026-10-12' },
];
const columns: DataTableColumn<Tx>[] = [
  { key: 'merchant', header: 'Merchant', sortable: true },
  { key: 'amount', header: 'Amount', sortable: true, align: 'end', cell: (r) => `$${r.amount.toFixed(2)}` },
  { key: 'date', header: 'Date', sortable: true, hideBelow: 'sm' },
];
const firstColumn = () => screen.getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[0]?.textContent);
const merchants = () => screen.getAllByRole('row').slice(1).map((r) => r.textContent ?? '').map((t) => rows.find((x) => t.includes(x.merchant))?.merchant);

const isMixed = (el: HTMLElement) => (el as HTMLInputElement).indeterminate === true || el.getAttribute('aria-checked') === 'mixed';

describe('DataTable', () => {
  it('renders headers and one row per item', () => {
    renderUI(<DataTable label="Transactions" columns={columns} rows={rows} />);
    const table = screen.getByRole('table', { name: 'Transactions' });
    expect(within(table).getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Merchant', 'Amount', 'Date']);
    expect(firstColumn()).toEqual(['Coffee Lab', 'Airline', 'Bookshop']);
    expect(screen.getByRole('cell', { name: '$420.00' })).toBeInTheDocument();
  });

  it('sorts by itself when uncontrolled: ascending, descending, then off (numbers numerically, dates in order)', async () => {
    const onSortChange = vi.fn();
    const { user } = renderUI(<DataTable label="Transactions" columns={columns} rows={rows} onSortChange={onSortChange} />);
    const amount = () => screen.getByRole('columnheader', { name: /Amount/ });
    expect(amount()).toHaveAttribute('aria-sort', 'none');
    await user.click(within(amount()).getByRole('button'));
    expect(amount()).toHaveAttribute('aria-sort', 'ascending');
    expect(merchants()).toEqual(['Coffee Lab', 'Bookshop', 'Airline']);
    expect(onSortChange).toHaveBeenLastCalledWith({ key: 'amount', direction: 'asc' });
    await user.click(within(amount()).getByRole('button'));
    expect(amount()).toHaveAttribute('aria-sort', 'descending');
    expect(merchants()).toEqual(['Airline', 'Bookshop', 'Coffee Lab']);
    await user.click(within(amount()).getByRole('button'));
    expect(amount()).toHaveAttribute('aria-sort', 'none');
    expect(onSortChange).toHaveBeenLastCalledWith(null);
    expect(merchants()).toEqual(['Coffee Lab', 'Airline', 'Bookshop']);
    const date = screen.getByRole('columnheader', { name: /Date/ });
    within(date).getByRole('button').focus();
    await user.keyboard('{Enter}');
    expect(merchants()).toEqual(['Airline', 'Coffee Lab', 'Bookshop']);
  });

  it('follows a controlled sort', () => {
    renderUI(<DataTable label="Transactions" columns={columns} rows={rows} sort={{ key: 'merchant', direction: 'desc' }} />);
    expect(screen.getByRole('columnheader', { name: /Merchant/ })).toHaveAttribute('aria-sort', 'descending');
    expect(merchants()).toEqual(['Coffee Lab', 'Bookshop', 'Airline']);
  });

  it('selects rows; the header checkbox is indeterminate for a partial selection and toggles all', async () => {
    const onSelectedIdsChange = vi.fn();
    function Controlled() {
      const [ids, setIds] = useState<string[]>([]);
      return <DataTable label="Transactions" columns={columns} rows={rows} selectedIds={ids} onSelectedIdsChange={(next) => { setIds(next); onSelectedIdsChange(next); }} />;
    }
    const { user } = renderUI(<Controlled />);
    const all = screen.getByRole('checkbox', { name: /select all/i });
    const rowBoxes = screen.getAllByRole('checkbox').filter((c) => c !== all);
    expect(rowBoxes).toHaveLength(3);
    await user.click(rowBoxes[1]);
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith(['t2']);
    expect(isMixed(all)).toBe(true);
    await user.click(all);
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith(expect.arrayContaining(['t1', 't2', 't3']));
    expect(all).toBeChecked();
    expect(isMixed(all)).toBe(false);
    await user.keyboard(' ');
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith([]);
    expect(all).not.toBeChecked();
  });

  it('row click works with the mouse and through a keyboard-reachable button, without nested controls', async () => {
    const onRowClick = vi.fn();
    const { user } = renderUI(<DataTable label="Transactions" columns={columns} rows={rows} selectable onRowClick={onRowClick} />);
    await user.click(screen.getByRole('cell', { name: '$420.00' }));
    expect(onRowClick).toHaveBeenLastCalledWith(rows[1]);
    const open = screen.getByRole('button', { name: 'Bookshop' });
    open.focus();
    await user.keyboard('{Enter}');
    expect(onRowClick).toHaveBeenLastCalledWith(rows[2]);
    await user.click(screen.getAllByRole('checkbox')[1]);
    expect(onRowClick).toHaveBeenCalledTimes(2);
    for (const b of screen.getAllByRole('button')) expect(b.querySelector('button, a, input')).toBeNull();
  });

  it('shows a busy table with a status while loading, and an empty state without rows', () => {
    const { rerender } = renderUI(<DataTable label="Transactions" columns={columns} rows={[]} loading />);
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent(/loading/i);
    rerender(<DataTable label="Transactions" columns={columns} rows={[]} empty="No transactions match" />);
    expect(screen.getByRole('table')).not.toHaveAttribute('aria-busy');
    expect(screen.getByText('No transactions match')).toBeInTheDocument();
  });
});
