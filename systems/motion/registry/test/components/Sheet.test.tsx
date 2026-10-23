import { describe, expect, it, vi } from 'vitest';
import { Sheet } from '@system';
import { renderUI, screen, waitFor } from '../utils';

function Filters(props: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; side?: 'left' | 'right' | 'bottom' }) {
  const { side, ...root } = props;
  return (
    <Sheet.Root {...root}>
      <Sheet.Trigger>Filters</Sheet.Trigger>
      <Sheet.Content side={side} size="sm">
        <Sheet.Title>Filters</Sheet.Title>
        <Sheet.Description>Narrow the list.</Sheet.Description>
        <input aria-label="Tag" />
        <Sheet.Footer><Sheet.Close>Apply</Sheet.Close></Sheet.Footer>
      </Sheet.Content>
    </Sheet.Root>
  );
}

describe('Sheet', () => {
  it('opens a modal dialog named by its title', async () => {
    const { user } = renderUI(<Filters />);
    await user.click(screen.getByRole('button', { name: 'Filters' }));
    const dialog = screen.getByRole('dialog', { name: 'Filters' });
    expect(dialog).toHaveAccessibleDescription('Narrow the list.');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('traps focus and Escape returns focus to the trigger', async () => {
    const { user } = renderUI(<Filters side="left" />);
    const trigger = screen.getByRole('button', { name: 'Filters' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog');
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    for (let i = 0; i < 4; i++) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('Close part closes it', async () => {
    const { user } = renderUI(<Filters side="bottom" />);
    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('controlled and defaultOpen', async () => {
    const onOpenChange = vi.fn();
    const { user, rerender } = renderUI(<Filters open onOpenChange={onOpenChange} />);
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    rerender(<Filters open={false} onOpenChange={onOpenChange} />);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    rerender(<Filters key="b" defaultOpen />);
    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument();
  });
});
