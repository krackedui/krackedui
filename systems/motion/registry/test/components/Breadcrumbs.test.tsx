import { describe, expect, it, vi } from 'vitest';
import { Breadcrumbs } from '@system';
import { renderUI, screen, waitFor, within } from '../utils';

describe('Breadcrumbs', () => {
  it('is a labelled navigation with an ordered list; the last item is the current page', () => {
    renderUI(<Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Projects', href: '/projects' }, { label: 'Roadmap' }]} />);
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    const list = within(nav).getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(within(nav).getByRole('link', { name: 'Projects' })).not.toHaveAttribute('aria-current');
    expect(within(nav).getByText('Roadmap').closest('[aria-current]')).toHaveAttribute('aria-current', 'page');
  });

  it('items with onClick are buttons', async () => {
    const onClick = vi.fn();
    const { user } = renderUI(<Breadcrumbs items={[{ label: 'Wiki', onClick }, { label: 'Page' }]} />);
    await user.click(screen.getByRole('button', { name: 'Wiki' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('collapses middle items into a menu button that lists them', async () => {
    const items = ['A', 'B', 'C', 'D', 'E', 'F'].map((l) => ({ label: l, href: `#${l}` }));
    const { user } = renderUI(<Breadcrumbs items={items} />);
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(nav).getByRole('link', { name: 'A' })).toBeInTheDocument();
    expect(within(nav).queryByRole('link', { name: 'C' })).not.toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'F' })).toHaveAttribute('aria-current', 'page');
    const more = within(nav).getByRole('button');
    expect(more).toHaveAccessibleName();
    await user.click(more);
    const menu = await screen.findByRole('menu');
    expect(within(menu).getAllByRole('menuitem').map((i) => i.textContent)).toEqual(expect.arrayContaining(['B', 'C']));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(more).toHaveFocus();
  });
});
