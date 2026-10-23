import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from '@system';
import { act, renderUI, screen, waitFor } from '../utils';

function Buttons({ onId }: { onId?: (id: string | number) => void }) {
  const { toast, dismiss } = useToast();
  let last: string | number = '';
  return (
    <>
      <button type="button" onClick={() => { last = toast({ message: 'Saved', tone: 'success' }); onId?.(last); }}>Save</button>
      <button type="button" onClick={() => toast({ message: 'Failed to save', description: 'Try again', tone: 'danger' })}>Fail</button>
      <button type="button" onClick={() => toast({ message: 'Moved to Trash', duration: 0, action: { label: 'Undo', onClick: undoSpy } })}>Trash</button>
      <button type="button" onClick={() => dismiss(last)}>Dismiss</button>
    </>
  );
}
const undoSpy = vi.fn();

const findToast = async (text: string, role: 'status' | 'alert') => {
  await waitFor(() => expect(screen.getAllByRole(role).some((el) => el.textContent?.includes(text))).toBe(true));
};

describe('ToastProvider', () => {
  it('renders children and a labelled notifications region', () => {
    renderUI(<p>App</p>);
    expect(screen.getByText('App')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Notifications/ })).toBeInTheDocument();
  });
});

describe('useToast', () => {
  it('throws a helpful error outside ToastProvider', () => {
    function Bad() { useToast(); return null; }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Bad />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });

  it('toast() shows the message in a status live region and returns an id', async () => {
    const onId = vi.fn();
    const { user } = renderUI(<Buttons onId={onId} />);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await findToast('Saved', 'status');
    expect(onId).toHaveBeenCalledWith(expect.anything());
    const id: unknown = onId.mock.calls[0][0];
    expect(['string', 'number']).toContain(typeof id);
  });

  it('danger toasts use role alert and show the description', async () => {
    const { user } = renderUI(<Buttons />);
    await user.click(screen.getByRole('button', { name: 'Fail' }));
    await findToast('Failed to save', 'alert');
    expect(screen.getAllByText('Try again').length).toBeGreaterThan(0);
  });

  it('dismiss(id) removes the toast', async () => {
    const { user } = renderUI(<Buttons />);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await findToast('Saved', 'status');
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    await waitFor(() => expect(screen.queryAllByRole('status').some((el) => el.textContent?.includes('Saved') && el.tagName === 'LI')).toBe(false));
  });

  it('the action runs its callback and dismisses; Escape dismisses a focused toast', async () => {
    const { user } = renderUI(<Buttons />);
    await user.click(screen.getByRole('button', { name: 'Trash' }));
    const undo = await screen.findByRole('button', { name: 'Undo' });
    await user.click(undo);
    expect(undoSpy).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Trash' }));
    const again = await screen.findByRole('button', { name: 'Undo' });
    again.focus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument());
  });

  it('auto-dismisses after its duration', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      function One() {
        const { toast } = useToast();
        return <button type="button" onClick={() => toast({ message: 'Quick', duration: 1000 })}>Go</button>;
      }
      renderUI(<One />);
      act(() => { screen.getByRole('button', { name: 'Go' }).click(); });
      await findToast('Quick', 'status');
      await act(async () => { await vi.advanceTimersByTimeAsync(2500); });
      await waitFor(() => expect(document.querySelector('li')).toBeNull());
    } finally {
      vi.useRealTimers();
    }
  });
});

void ToastProvider;
