import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from '@system';
import { act, renderUI, screen, waitFor } from '../utils';

describe('ConfirmDialog', () => {
  it('trigger opens an alertdialog named by the title; focus starts on Cancel', async () => {
    const { user } = renderUI(
      <ConfirmDialog trigger={<button type="button">Delete…</button>} title="Delete page?" description="It moves to Trash." confirmLabel="Delete" destructive onConfirm={() => undefined} />,
    );
    await user.click(screen.getByRole('button', { name: 'Delete…' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Delete page?' });
    expect(dialog).toHaveAccessibleDescription('It moves to Trash.');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus());
  });

  it('confirm calls onConfirm and closes; Escape cancels without confirming and returns focus', async () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    const { user } = renderUI(<ConfirmDialog trigger={<button type="button">Delete…</button>} title="Delete page?" confirmLabel="Delete" onConfirm={onConfirm} onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole('button', { name: 'Delete…' });
    await user.click(trigger);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onConfirm).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus();
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('async onConfirm keeps it open and busy until the promise resolves', async () => {
    let resolve: () => void = () => undefined;
    const onConfirm = vi.fn(() => new Promise<void>((r) => { resolve = r; }));
    const { user } = renderUI(<ConfirmDialog defaultOpen title="Delete page?" confirmLabel="Delete" onConfirm={onConfirm} />);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    const busy = screen.getAllByRole('button').find((b) => b.getAttribute('aria-busy') === 'true');
    expect(busy).toBeDefined();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await act(async () => { resolve(); await Promise.resolve(); });
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('a rejected promise keeps it open so the user can retry', async () => {
    const onConfirm = vi.fn(() => Promise.reject(new Error('offline')));
    const { user } = renderUI(<ConfirmDialog defaultOpen title="Delete page?" confirmLabel="Delete" onConfirm={onConfirm} />);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Delete' })).not.toHaveAttribute('aria-busy', 'true'));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('controlled open', () => {
    const { rerender } = renderUI(<ConfirmDialog open={false} title="Publish?" onConfirm={() => undefined} />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    rerender(<ConfirmDialog open title="Publish?" onConfirm={() => undefined} />);
    expect(screen.getByRole('alertdialog', { name: 'Publish?' })).toBeInTheDocument();
  });
});
