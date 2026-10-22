// Usability fixes requested by the templates (REPORT.md "Usability issues"): Select empty option, DataTable
// paging and container-based column hiding, Stat chart slot, Card.Header action, NumberInput pass-through, toneText.
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Card, DataTable, NumberInput, Select, Stat, toneText } from '@system';
import { renderUI, screen, within } from '../../../../standard/gate/tests/utils';

describe('Select empty option', () => {
  const options = [{ value: '', label: 'All categories' }, { value: 'food', label: 'Food' }, { value: 'travel', label: 'Travel' }];

  function Filter({ onChange }: { onChange: (v: string) => void }) {
    const [value, setValue] = useState('food');
    return <Select aria-label="Category" options={options} value={value} onValueChange={(v) => { setValue(v); onChange(v); }} name="category" />;
  }

  it('selects an option whose value is "" and reports ""', async () => {
    const onChange = vi.fn();
    const { user, container } = renderUI(<Filter onChange={onChange} />);
    const trigger = screen.getByRole('combobox', { name: 'Category' });
    expect(trigger).toHaveTextContent('Food');
    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'All categories' }));
    expect(onChange).toHaveBeenLastCalledWith('');
    expect(trigger).toHaveTextContent('All categories');
    expect(container.querySelector<HTMLInputElement>('input[type="hidden"][name="category"]')?.value).toBe('');
  });

  it('shows the empty option for value "" and the placeholder when no option has ""', () => {
    renderUI(
      <>
        <Select aria-label="With all" options={options} value="" />
        <Select aria-label="Without all" placeholder="Pick one" options={options.slice(1)} value="" />
      </>,
    );
    expect(screen.getByRole('combobox', { name: 'With all' })).toHaveTextContent('All categories');
    expect(screen.getByRole('combobox', { name: 'Without all' })).toHaveTextContent('Pick one');
  });
});

describe('DataTable paging', () => {
  const rows = Array.from({ length: 23 }, (_, i) => ({ id: String(i + 1), name: `Item ${i + 1}`, amount: 23 - i }));
  const columns = [{ key: 'name', header: 'Name', sortable: true }, { key: 'amount', header: 'Amount', sortable: true, align: 'end' as const }];
  const names = () => within(screen.getByRole('table')).getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[0].textContent);

  it('shows one page of the sorted rows with a Pagination footer (uncontrolled)', async () => {
    const { user } = renderUI(<DataTable label="Items" columns={columns} rows={rows} pageSize={10} defaultSort={{ key: 'amount', direction: 'asc' }} />);
    expect(names()).toHaveLength(10);
    expect(names()[0]).toBe('Item 23'); // sorted before slicing
    const nav = screen.getByRole('navigation', { name: 'Items pages' });
    await user.click(within(nav).getByRole('button', { name: /page 3/i }));
    expect(names()).toEqual(['Item 3', 'Item 2', 'Item 1']);
    await user.click(screen.getByRole('button', { name: /Name/ })); // sorting returns to page 1
    expect(names()).toHaveLength(10);
  });

  it('can be controlled and clamps the page when rows shrink', () => {
    const onPageChange = vi.fn();
    const { rerender } = renderUI(<DataTable label="Items" columns={columns} rows={rows} pageSize={10} page={3} onPageChange={onPageChange} />);
    expect(names()).toEqual(['Item 21', 'Item 22', 'Item 23']);
    rerender(<DataTable label="Items" columns={columns} rows={rows.slice(0, 12)} pageSize={10} page={3} onPageChange={onPageChange} />);
    expect(names()).toEqual(['Item 11', 'Item 12']);
  });

  it('has no footer when everything fits', () => {
    renderUI(<DataTable label="Items" columns={columns} rows={rows.slice(0, 5)} pageSize={10} />);
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('hides columns with a container query on the table wrapper', () => {
    const { container } = renderUI(<DataTable label="Items" columns={[columns[0], { ...columns[1], hideBelow: 'sm' as const }]} rows={rows.slice(0, 2)} />);
    expect(container.querySelector('.\\@container')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Amount' }).className).toContain('@max-[640px]:hidden');
  });
});

describe('Stat chart slot', () => {
  it('renders the chart under the value', () => {
    renderUI(<Stat label="Revenue" value="$48.2k" delta="+12%" trend="up" chart={<svg role="img" aria-label="Revenue trend" />} />);
    const chart = screen.getByRole('img', { name: 'Revenue trend' });
    expect(screen.getByText('$48.2k').compareDocumentPosition(chart) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe('Card.Header action', () => {
  it('puts the action after the title in a two-column header', () => {
    renderUI(
      <Card.Root>
        <Card.Header action={<button type="button">View all</button>}>
          <Card.Title asChild><h2>Recent payments</h2></Card.Title>
        </Card.Header>
      </Card.Root>,
    );
    const title = screen.getByRole('heading', { name: 'Recent payments' });
    const action = screen.getByRole('button', { name: 'View all' });
    expect(title.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(title.parentElement?.parentElement).toBe(action.parentElement?.parentElement);
  });
});

describe('NumberInput pass-through', () => {
  it('forwards autoFocus, aria-* and data-* and merges onKeyDown / onFocus / onBlur', async () => {
    const onKeyDown = vi.fn();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const onValueChange = vi.fn();
    const { user } = renderUI(
      <NumberInput aria-label="Limit" autoFocus data-testid="limit" aria-errormessage="err" defaultValue={5} onValueChange={onValueChange} onKeyDown={onKeyDown} onFocus={onFocus} onBlur={onBlur} />,
    );
    const input = screen.getByRole('spinbutton', { name: 'Limit' });
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('data-testid', 'limit');
    expect(input).toHaveAttribute('aria-errormessage', 'err');
    await user.keyboard('{ArrowUp}');
    expect(onKeyDown).toHaveBeenCalled();
    expect(onValueChange).toHaveBeenLastCalledWith(6); // our stepping still runs
    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('lets onKeyDown cancel the built-in stepping', async () => {
    const onValueChange = vi.fn();
    const { user } = renderUI(<NumberInput aria-label="Qty" defaultValue={1} onValueChange={onValueChange} onKeyDown={(e) => e.preventDefault()} />);
    await user.click(screen.getByRole('spinbutton', { name: 'Qty' }));
    await user.keyboard('{ArrowUp}');
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe('toneText', () => {
  it('maps every contract tone to an AA tone-text utility', () => {
    expect(toneText).toEqual({
      neutral: 'text-n-text-secondary',
      accent: 'text-n-text-info',
      success: 'text-n-text-success',
      warning: 'text-n-text-warning',
      danger: 'text-n-text-danger',
      info: 'text-n-text-info',
    });
  });
});
