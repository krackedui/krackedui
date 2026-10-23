// The nine components the sector templates asked for. Behaviour and semantics, as the others.
import { describe, it, expect } from 'vitest';
import {
  Calendar, CommandPalette, CommandPaletteDialog, Combobox, ConfirmDialog, ContextMenu, DatePicker,
  DateRangePicker, FileUpload,
} from '@system';
import { renderUI, screen, waitFor, within } from '../utils';

const options = [
  { value: 'software', label: 'Software' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'travel', label: 'Travel', disabled: true },
];

describe('calendar days, not instants', () => {
  it('a date late in the day is still that day', () => {
    // 23:59 on the 3rd must select the 3rd. Through the component rather than the helper, because
    // what matters is that a user handed a timestamp sees the right cell selected.
    renderUI(<Calendar defaultValue={new Date(2026, 2, 3, 23, 59, 59)} />);
    const selected = screen.getAllByRole('gridcell').find((c) => c.getAttribute('aria-selected') === 'true');
    expect(selected).toHaveTextContent('3');
  });
});

describe('Calendar', () => {
  it('is a grid with one tab stop, and the arrow keys move the day', async () => {
    const { user } = renderUI(<Calendar defaultValue={new Date(2026, 2, 10)} />);
    const grid = screen.getByRole('grid');
    const tabbable = within(grid).getAllByRole('gridcell').filter((c) => c.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
    tabbable[0].focus();
    await user.keyboard('{ArrowRight}');
    await waitFor(() => {
      const now = within(grid).getAllByRole('gridcell').filter((c) => c.getAttribute('tabindex') === '0');
      expect(now[0]).toHaveTextContent('11');
    });
  });

  it('marks the selected day and names every day in full', () => {
    renderUI(<Calendar defaultValue={new Date(2026, 2, 10)} />);
    const selected = screen.getAllByRole('gridcell').find((c) => c.getAttribute('aria-selected') === 'true');
    expect(selected).toHaveTextContent('10');
    expect(selected?.getAttribute('aria-label') ?? '').toMatch(/10/);
  });

  it('will not select a day outside min/max', () => {
    renderUI(<Calendar defaultValue={new Date(2026, 2, 10)} min={new Date(2026, 2, 5)} max={new Date(2026, 2, 15)} />);
    const first = screen.getAllByRole('gridcell')[0];
    expect(first).toBeDisabled();
  });
});

describe('DatePicker', () => {
  it('opens a dialog, picks a day, and shows it on the trigger', async () => {
    const { user } = renderUI(<DatePicker label="Due date" defaultValue={new Date(2026, 2, 10)} />);
    const trigger = screen.getByRole('button', { name: 'Due date' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.click(within(dialog).getAllByRole('gridcell').find((c) => c.textContent === '12')!);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent('12');
  });
});

describe('DateRangePicker', () => {
  it('takes two clicks for a range and orders them however they are given', async () => {
    const { user } = renderUI(<DateRangePicker label="Period" defaultValue={{ from: new Date(2026, 2, 10), to: null }} />);
    const trigger = screen.getByRole('button', { name: 'Period' });
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog');
    // click an earlier day second: the range should still read low to high
    await user.click(within(dialog).getAllByRole('gridcell').find((c) => c.textContent === '4')!);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger.textContent ?? '').toMatch(/4.*10/s);
  });

  it('offers its presets', async () => {
    const { user } = renderUI(
      <DateRangePicker
        label="Period"
        presets={[{ label: 'Last 7 days', range: { from: new Date(2026, 2, 1), to: new Date(2026, 2, 8) } }]}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Period' }));
    await user.click(await screen.findByRole('button', { name: 'Last 7 days' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

describe('Combobox', () => {
  it('filters as you type and keeps the keyboard on the input', async () => {
    const { user } = renderUI(<Combobox label="Category" options={options} />);
    const trigger = screen.getByRole('button', { name: 'Category' });
    await user.click(trigger);
    const input = await screen.findByRole('combobox');
    expect(input).toHaveFocus();
    await user.type(input, 'pay');
    const list = screen.getByRole('listbox');
    expect(within(list).getAllByRole('option')).toHaveLength(1);
    expect(within(list).getByRole('option')).toHaveTextContent('Payroll');
  });

  it('points at the active option instead of moving focus, and Enter takes it', async () => {
    const chosen: string[] = [];
    const { user } = renderUI(<Combobox label="Category" options={options} onValueChange={(v) => chosen.push(v)} />);
    await user.click(screen.getByRole('button', { name: 'Category' }));
    const input = await screen.findByRole('combobox');
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveFocus();
    expect(input.getAttribute('aria-activedescendant')).toBeTruthy();
    await user.keyboard('{Enter}');
    expect(chosen).toEqual(['payroll']);
  });

  it('says so when nothing matches', async () => {
    const { user } = renderUI(<Combobox label="Category" options={options} emptyText="Nothing matches" />);
    await user.click(screen.getByRole('button', { name: 'Category' }));
    await user.type(await screen.findByRole('combobox'), 'zzz');
    expect(screen.getByText('Nothing matches')).toBeInTheDocument();
  });
});

describe('ConfirmDialog', () => {
  it('asks, then confirms once', async () => {
    let confirmed = 0;
    const { user } = renderUI(
      <ConfirmDialog
        defaultOpen
        title="Delete task"
        description="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => { confirmed += 1; }}
      />,
    );
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAccessibleName('Delete task');
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
    expect(confirmed).toBe(1);
  });
});

describe('ContextMenu', () => {
  it('opens on a right-click and closes on Escape', async () => {
    const { user } = renderUI(
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <div>Task card</div>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item>Move to Done</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>,
    );
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
    await user.pointer({ keys: '[MouseRight]', target: screen.getByText('Task card') });
    expect(await screen.findByRole('menuitem', { name: 'Move to Done' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menuitem')).not.toBeInTheDocument());
  });
});

describe('FileUpload', () => {
  it('accepts a file and lists it', async () => {
    const seen: File[][] = [];
    const { user } = renderUI(<FileUpload label="Add a receipt" onFilesChange={(f) => seen.push(f)} />);
    const input = screen.getByLabelText('Add a receipt');
    await user.upload(input, new File(['x'], 'receipt.pdf', { type: 'application/pdf' }));
    expect(seen.at(-1)?.map((f) => f.name)).toEqual(['receipt.pdf']);
    expect(screen.getByText('receipt.pdf')).toBeInTheDocument();
  });

  it('rejects a file over maxSize and says why', async () => {
    const { user } = renderUI(<FileUpload label="Add a receipt" maxSize={10} />);
    const big = new File([new Uint8Array(50)], 'big.pdf', { type: 'application/pdf' });
    await user.upload(screen.getByLabelText('Add a receipt'), big);
    expect(screen.getByText(/over the/)).toBeInTheDocument();
    expect(screen.queryByText('big.pdf')).not.toBeInTheDocument();
  });
});

const groups = [
  { label: 'Pages', items: [{ id: 'overview', label: 'Overview' }, { id: 'tx', label: 'Transactions' }] },
  { label: 'Actions', items: [{ id: 'new', label: 'New payment' }] },
];

describe('CommandPalette', () => {
  it('narrows on a subsequence, the way a launcher does', async () => {
    const { user } = renderUI(<CommandPalette groups={groups} />);
    const input = screen.getByRole('combobox');
    await user.type(input, 'npy');
    const list = screen.getByRole('listbox');
    expect(within(list).getAllByRole('option')).toHaveLength(1);
    expect(within(list).getByRole('option')).toHaveTextContent('New payment');
  });

  it('Enter chooses the highlighted item', async () => {
    const picked: string[] = [];
    const { user } = renderUI(<CommandPalette groups={groups} onSelect={(i) => picked.push(i.id)} />);
    await user.keyboard('{ArrowDown}{Enter}');
    expect(picked).toEqual(['tx']);
  });

  it('as a dialog it is modal and closes once something is chosen', async () => {
    const picked: string[] = [];
    const { user } = renderUI(<CommandPaletteDialog defaultOpen groups={groups} onSelect={(i) => picked.push(i.id)} />);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    await user.click(within(dialog).getByRole('option', { name: /Overview/ }));
    expect(picked).toEqual(['overview']);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
