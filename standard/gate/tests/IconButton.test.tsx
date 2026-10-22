import { describe, expect, it, vi } from 'vitest';
import { IconButton } from '@system';
import { renderUI, screen } from './utils';

describe('IconButton', () => {
  it('is a button named by its label', () => {
    renderUI(<IconButton icon="more" label="More actions" />);
    expect(screen.getByRole('button', { name: 'More actions' })).toHaveAttribute('type', 'button');
  });

  it('activates with click and keyboard', async () => {
    const onClick = vi.fn();
    const { user } = renderUI(<IconButton icon="close" label="Close" variant="secondary" size="sm" onClick={onClick} />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('does not fire when disabled', async () => {
    const onClick = vi.fn();
    const { user } = renderUI(<IconButton icon="plus" label="Add" disabled onClick={onClick} />);
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('accepts active without changing its role or name', () => {
    renderUI(<IconButton icon="sidebar" label="Toggle sidebar" active />);
    expect(screen.getByRole('button', { name: 'Toggle sidebar' })).toBeInTheDocument();
  });
});
