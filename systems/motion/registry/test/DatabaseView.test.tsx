import { describe, expect, it, vi } from 'vitest';
import { DatabaseView, SAMPLE_TODAY, createTasksSample, type Row } from '@system';
import { renderUI, screen, waitFor, within } from './utils';

const tab = (name: string) => screen.getByRole('tab', { name });

describe('DatabaseView', () => {
  it('view tabs follow the tabs pattern and switch the panel', async () => {
    const { user } = renderUI(<DatabaseView data={createTasksSample()} width={1200} today={SAMPLE_TODAY} />);
    const list = screen.getByRole('tablist', { name: 'Tasks views' });
    expect(within(list).getAllByRole('tab').length).toBeGreaterThan(1);
    expect(tab('Table')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Table' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Table' })).toBeInTheDocument();
    await user.click(tab('Board'));
    expect(tab('Board')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Board' })).toBeInTheDocument();
    tab('Board').focus();
    await user.keyboard('{ArrowRight}');
    expect(tab('Gallery')).toHaveAttribute('aria-selected', 'true');
    await waitFor(() => expect(tab('Gallery')).toHaveFocus());
  });

  it('filter menu adds a filter rule', async () => {
    const { user } = renderUI(<DatabaseView data={createTasksSample()} width={1200} today={SAMPLE_TODAY} />);
    await user.click(screen.getByRole('button', { name: 'Filter' }));
    const search = await screen.findByRole('searchbox');
    await user.type(search, 'Prio');
    const menu = search.closest<HTMLElement>('[data-radix-popper-content-wrapper]')!;
    await user.click(within(menu).getByRole('button', { name: /^Priority/ }));
    expect(await screen.findByRole('button', { name: 'Priority' })).toBeInTheDocument();
  });

  it('sort menu adds a sort rule', async () => {
    const { user } = renderUI(<DatabaseView data={createTasksSample()} width={1200} today={SAMPLE_TODAY} />);
    await user.click(screen.getByRole('button', { name: 'Sort' }));
    const menu = (await screen.findByRole('searchbox')).closest<HTMLElement>('[data-radix-popper-content-wrapper]')!;
    await user.click(within(menu).getByRole('button', { name: /^Due/ }));
    expect(await screen.findByRole('button', { name: 'Due' })).toBeInTheDocument();
  });

  it('opens a row in a modal peek and returns focus on Escape', async () => {
    const { user } = renderUI(<DatabaseView data={createTasksSample()} width={1200} today={SAMPLE_TODAY} />);
    const open = screen.getByRole('button', { name: 'Open Sidebar rebuild' });
    await user.click(open);
    const dialog = await screen.findByRole('dialog', { name: 'Sidebar rebuild' });
    expect(within(dialog).getByRole('table', { name: 'Page properties' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(open).toHaveFocus();
  });

  it('board and gallery cards and list rows open with the keyboard', async () => {
    const onOpenRow = vi.fn<(row: Row) => void>();
    const { user } = renderUI(<DatabaseView data={createTasksSample()} width={1200} today={SAMPLE_TODAY} onOpenRow={onOpenRow} />);
    for (const view of ['Board', 'Gallery', 'List']) {
      await user.click(tab(view));
      const card = within(screen.getByRole('tabpanel', { name: view })).getByRole('button', { name: /^Sidebar rebuild/ });
      card.focus();
      await user.keyboard('{Enter}');
    }
    expect(onOpenRow).toHaveBeenCalledTimes(3);
    expect(onOpenRow.mock.calls.every(([row]) => row.values.title === 'Sidebar rebuild')).toBe(true);
  });

  it('calendar events and timeline bars are keyboard reachable', async () => {
    const onOpenRow = vi.fn<(row: Row) => void>();
    const { user } = renderUI(<DatabaseView data={createTasksSample()} width={1200} today={SAMPLE_TODAY} onOpenRow={onOpenRow} />);
    await user.click(tab('Calendar'));
    const event = within(screen.getByRole('tabpanel', { name: 'Calendar' })).getByRole('button', { name: 'Docs shell' });
    event.focus();
    await user.keyboard('{Enter}');
    expect(onOpenRow).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /Add page on .*October 15/ })).toBeInTheDocument();
  });
});
