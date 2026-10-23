import { describe, expect, it, vi } from 'vitest';
import { EmptyState } from '@system';
import { renderUI, screen } from '../utils';

describe('EmptyState', () => {
  it('shows title, description and a working action', async () => {
    const onClick = vi.fn();
    const { user } = renderUI(
      <EmptyState icon="inbox" title="No transactions yet" description="Connect a bank account to import them." action={<button type="button" onClick={onClick}>Connect account</button>} />,
    );
    expect(screen.getByText('No transactions yet')).toBeInTheDocument();
    expect(screen.getByText('Connect a bank account to import them.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Connect account' }));
    expect(onClick).toHaveBeenCalled();
  });

  it('keeps the icon decorative', () => {
    const { container } = renderUI(<EmptyState icon="inbox" title="Nothing here" />);
    container.querySelectorAll('svg').forEach((svg) => expect(svg).toHaveAttribute('aria-hidden', 'true'));
  });
});
