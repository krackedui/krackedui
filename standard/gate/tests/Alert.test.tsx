import { describe, expect, it, vi } from 'vitest';
import { Alert } from '@system';
import { renderUI, screen } from './utils';

describe('Alert', () => {
  it('danger and warning alerts use role="alert"', () => {
    renderUI(<><Alert tone="danger" title="Payment failed">Card declined.</Alert><Alert tone="warning" title="Budget almost used" /></>);
    expect(screen.getAllByRole('alert')).toHaveLength(2);
    expect(screen.getAllByRole('alert')[0]).toHaveTextContent('Payment failed');
  });

  it('other tones use role="status"', () => {
    renderUI(<>{(['neutral', 'accent', 'success', 'info'] as const).map((t) => <Alert key={t} tone={t} title={t} />)}</>);
    expect(screen.getAllByRole('status')).toHaveLength(4);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows title, body and action; the dismiss button is named and calls onDismiss', async () => {
    const onDismiss = vi.fn();
    const onAction = vi.fn();
    const { user } = renderUI(
      <Alert tone="info" title="New statement" action={<button type="button" onClick={onAction}>View</button>} onDismiss={onDismiss}>
        Your October statement is ready.
      </Alert>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Your October statement is ready.');
    await user.click(screen.getByRole('button', { name: 'View' }));
    expect(onAction).toHaveBeenCalled();
    screen.getByRole('button', { name: /dismiss/i }).focus();
    await user.keyboard('{Enter}');
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('has no dismiss button without onDismiss', () => {
    renderUI(<Alert title="Saved" tone="success" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
