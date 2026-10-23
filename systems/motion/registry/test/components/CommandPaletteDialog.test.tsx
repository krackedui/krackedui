import { describe, expect, it, vi } from 'vitest';
import { CommandPaletteDialog } from '@system';
import { renderUI, screen, waitFor } from '../utils';

const groups = [{ label: 'Actions', items: [{ id: 'new', title: 'New page' }, { id: 'settings', title: 'Settings' }] }];

describe('CommandPaletteDialog', () => {
  it('opens as a named modal dialog with the search combobox focused', async () => {
    renderUI(<CommandPaletteDialog defaultOpen groups={groups} placeholder="Search" />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName();
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Search' })).toHaveFocus());
  });

  it('selecting an item calls onSelect and closes; onOpenChange reports it', async () => {
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    const { user } = renderUI(<CommandPaletteDialog defaultOpen groups={groups} placeholder="Search" onSelect={onSelect} onOpenChange={onOpenChange} />);
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveFocus());
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'settings' }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('Escape closes and focus returns to where it was', async () => {
    function Host() {
      return (
        <>
          <button type="button">Before</button>
          <CommandPaletteDialog groups={groups} placeholder="Search" />
        </>
      );
    }
    const { user } = renderUI(<Host />);
    const before = screen.getByRole('button', { name: 'Before' });
    before.focus();
    await user.keyboard('{Control>}k{/Control}');
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(before).toHaveFocus();
  });

  it('is controllable', async () => {
    const onOpenChange = vi.fn();
    const { user, rerender } = renderUI(<CommandPaletteDialog open groups={groups} onOpenChange={onOpenChange} />);
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    rerender(<CommandPaletteDialog open={false} groups={groups} onOpenChange={onOpenChange} />);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
