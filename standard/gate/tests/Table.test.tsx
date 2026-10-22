import { describe, expect, it, vi } from 'vitest';
import { Table } from '@system';
import { renderUI, screen, within } from './utils';

function Basic({ onSort, sort, onRowClick }: { onSort?: () => void; sort?: 'asc' | 'desc' | false; onRowClick?: () => void }) {
  return (
    <Table.Root aria-label="Invoices">
      <Table.Header>
        <Table.Row>
          <Table.Head sort={sort} onSort={onSort}>Client</Table.Head>
          <Table.Head align="end">Amount</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row onClick={onRowClick}>
          <Table.Cell>Acme</Table.Cell>
          <Table.Cell align="end">$1,200</Table.Cell>
        </Table.Row>
        <Table.Row selected>
          <Table.Cell>Globex</Table.Cell>
          <Table.Cell align="end">$800</Table.Cell>
        </Table.Row>
      </Table.Body>
      <Table.Footer>
        <Table.Row>
          <Table.Cell>Total</Table.Cell>
          <Table.Cell align="end">$2,000</Table.Cell>
        </Table.Row>
      </Table.Footer>
    </Table.Root>
  );
}

describe('Table', () => {
  it('renders a native table with column headers, rows and cells', () => {
    renderUI(<Basic />);
    const table = screen.getByRole('table', { name: 'Invoices' });
    expect(within(table).getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Client', 'Amount']);
    expect(within(table).getAllByRole('row')).toHaveLength(4);
    expect(within(table).getByRole('cell', { name: 'Globex' })).toBeInTheDocument();
  });

  it('sortable headers are buttons and the header cell exposes aria-sort', async () => {
    const onSort = vi.fn();
    const { user, rerender } = renderUI(<Basic onSort={onSort} sort={false} />);
    const header = screen.getByRole('columnheader', { name: 'Client' });
    expect(header).toHaveAttribute('aria-sort', 'none');
    expect(screen.getByRole('columnheader', { name: 'Amount' })).not.toHaveAttribute('aria-sort');
    const button = within(header).getByRole('button', { name: 'Client' });
    button.focus();
    await user.keyboard('{Enter}');
    expect(onSort).toHaveBeenCalledTimes(1);
    rerender(<Basic onSort={onSort} sort="asc" />);
    expect(screen.getByRole('columnheader', { name: 'Client' })).toHaveAttribute('aria-sort', 'ascending');
    rerender(<Basic onSort={onSort} sort="desc" />);
    expect(screen.getByRole('columnheader', { name: 'Client' })).toHaveAttribute('aria-sort', 'descending');
  });

  it('a clickable row works with the mouse and the keyboard', async () => {
    const onRowClick = vi.fn();
    const { user } = renderUI(<Basic onRowClick={onRowClick} />);
    const row = screen.getByRole('row', { name: /Acme/ });
    await user.click(within(row).getByRole('cell', { name: 'Acme' }));
    expect(onRowClick).toHaveBeenCalledTimes(1);
    row.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onRowClick).toHaveBeenCalledTimes(3);
  });
});
