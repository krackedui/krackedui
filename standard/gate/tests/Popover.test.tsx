import { describe, expect, it, vi } from 'vitest';
import { Popover } from '@system';
import { renderUI, screen, waitFor } from './utils';

function Rename(props: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }) {
  return (
    <>
      <Popover.Root {...props}>
        <Popover.Trigger>Rename</Popover.Trigger>
        <Popover.Content aria-label="Rename page" side="bottom" align="start">
          <input aria-label="Name" />
          <Popover.Close>Done</Popover.Close>
        </Popover.Content>
      </Popover.Root>
      <button type="button">Outside</button>
    </>
  );
}

describe('Popover', () => {
  it('trigger toggles a labelled dialog and exposes aria-expanded', async () => {
    const { user } = renderUI(<Rename />);
    const trigger = screen.getByRole('button', { name: 'Rename' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Rename page' })).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('moves focus inside on open; Escape closes and returns focus to the trigger', async () => {
    const { user } = renderUI(<Rename />);
    const trigger = screen.getByRole('button', { name: 'Rename' });
    await user.click(trigger);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('Close part and outside click close it', async () => {
    const { user } = renderUI(<Rename />);
    await user.click(screen.getByRole('button', { name: 'Rename' }));
    await user.click(screen.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Rename' }));
    await user.click(screen.getByRole('button', { name: 'Outside' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('controlled and uncontrolled', async () => {
    const onOpenChange = vi.fn();
    const { user, rerender } = renderUI(<Rename open={false} onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole('button', { name: 'Rename' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(<Rename open onOpenChange={onOpenChange} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('defaultOpen renders it open', () => {
    renderUI(<Rename defaultOpen />);
    expect(screen.getByRole('dialog', { name: 'Rename page' })).toBeInTheDocument();
  });
});
