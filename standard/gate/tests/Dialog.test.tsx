import { describe, expect, it, vi } from 'vitest';
import { Dialog } from '@system';
import { renderUI, screen, waitFor } from './utils';

function EditDialog(props: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }) {
  return (
    <Dialog.Root {...props}>
      <Dialog.Trigger>Edit</Dialog.Trigger>
      <Dialog.Content size="sm">
        <Dialog.Title>Edit profile</Dialog.Title>
        <Dialog.Description>Your name is public.</Dialog.Description>
        <input aria-label="Name" />
        <Dialog.Footer>
          <Dialog.Close>Cancel</Dialog.Close>
          <button type="button">Save</button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}

describe('Dialog', () => {
  it('opens a modal dialog named by its title and described by its description', async () => {
    const { user } = renderUI(<EditDialog />);
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit profile' });
    expect(dialog).toHaveAccessibleDescription('Your name is public.');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('moves focus inside, traps Tab, and Escape returns focus to the trigger', async () => {
    const { user } = renderUI(<EditDialog />);
    const trigger = screen.getByRole('button', { name: 'Edit' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog');
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    for (let i = 0; i < 5; i++) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
    await user.tab({ shift: true });
    expect(dialog.contains(document.activeElement)).toBe(true);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('Close part closes it', async () => {
    const { user } = renderUI(<EditDialog />);
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('controlled: onOpenChange reports, open decides', async () => {
    const onOpenChange = vi.fn();
    const { user, rerender } = renderUI(<EditDialog open onOpenChange={onOpenChange} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    rerender(<EditDialog open={false} onOpenChange={onOpenChange} />);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('defaultOpen renders it open', () => {
    renderUI(<EditDialog defaultOpen />);
    expect(screen.getByRole('dialog', { name: 'Edit profile' })).toBeInTheDocument();
  });
});
