import { describe, expect, it, vi } from 'vitest';
import { Topbar } from '@system';
import { renderUI, screen, within } from '../utils';

describe('Topbar', () => {
  it('renders a banner with breadcrumbs and actions', async () => {
    const onShare = vi.fn();
    const { user } = renderUI(
      <Topbar
        breadcrumbs={<nav aria-label="Breadcrumb"><a href="/projects">Projects</a></nav>}
        actions={<button type="button" onClick={onShare}>Share</button>}
      />,
    );
    const bar = screen.getByRole('banner');
    expect(within(bar).getByRole('link', { name: 'Projects' })).toBeInTheDocument();
    await user.click(within(bar).getByRole('button', { name: 'Share' }));
    expect(onShare).toHaveBeenCalledOnce();
  });

  it('accepts className, style and id', () => {
    renderUI(<Topbar id="top" className="custom" style={{ opacity: 0.5 }} breadcrumbs="Home" />);
    const bar = screen.getByRole('banner');
    expect(bar).toHaveAttribute('id', 'top');
    expect(bar).toHaveClass('custom');
    expect(bar).toHaveStyle({ opacity: '0.5' });
  });
});
