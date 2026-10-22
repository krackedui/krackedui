// Behaviour of Motion's small interactive extras: DisclosureToggle, ConfirmDialogBody and ToastPill.
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialogBody, DisclosureToggle, ToastPill } from '@system';
import { renderUI, screen } from '../../../../standard/gate/tests/utils';

describe('DisclosureToggle', () => {
  function Demo({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
    const [open, setOpen] = useState(false);
    return <DisclosureToggle open={open} onOpenChange={(o) => { setOpen(o); onOpenChange?.(o); }} aria-controls="panel" />;
  }

  it('is a button that reports and flips aria-expanded with click, Enter and Space', async () => {
    const onOpenChange = vi.fn();
    const { user } = renderUI(<Demo onOpenChange={onOpenChange} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Enter}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await user.keyboard(' ');
    expect(onOpenChange.mock.calls.map((c) => c[0] as boolean)).toEqual([true, false, true]);
  });

  it('lets an onClick handler cancel the toggle', async () => {
    const onOpenChange = vi.fn();
    const { user } = renderUI(<DisclosureToggle aria-label="Details" onOpenChange={onOpenChange} onClick={(e) => e.preventDefault()} />);
    await user.click(screen.getByRole('button', { name: 'Details' }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe('ConfirmDialogBody', () => {
  it('renders the question and runs confirm / cancel', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const { user } = renderUI(<ConfirmDialogBody title="Delete this page?" description="It moves to Trash." onConfirm={onConfirm} onCancel={onCancel} />);
    expect(screen.getByText('Delete this page?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('uses "Confirm" when not destructive and blocks confirming while loading', async () => {
    const onConfirm = vi.fn();
    const { user, rerender } = renderUI(<ConfirmDialogBody title="Publish?" destructive={false} onConfirm={onConfirm} />);
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    rerender(<ConfirmDialogBody title="Publish?" destructive={false} confirmLabel="Publish" onConfirm={onConfirm} loading />);
    const confirm = screen.getByRole('button', { name: /Publish/ });
    expect(confirm).toHaveAttribute('aria-busy', 'true');
    await user.click(confirm);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

describe('ToastPill', () => {
  it('runs its action and close buttons', async () => {
    const onAction = vi.fn();
    const onClose = vi.fn();
    const { user } = renderUI(<ToastPill tone="success" description="3 pages" action="Undo" onAction={onAction} onClose={onClose}>Moved to Trash</ToastPill>);
    expect(screen.getByText('Moved to Trash')).toBeInTheDocument();
    expect(screen.getByText('3 pages')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onAction).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has no buttons without handlers', () => {
    renderUI(<ToastPill>Saved</ToastPill>);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
