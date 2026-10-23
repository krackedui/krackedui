import { describe, expect, it, vi } from 'vitest';
import { Sidebar } from '@system';
import { renderUI, screen, within } from '../utils';

function Nav({ onSettings }: { onSettings?: () => void }) {
  return (
    <Sidebar.Root>
      <Sidebar.Header><span>Acme workspace</span></Sidebar.Header>
      <Sidebar.Section title="Workspace">
        <Sidebar.Item icon="home" href="/home" active>Home</Sidebar.Item>
        <Sidebar.Item icon="inbox" href="/inbox" trailing={<span>3</span>}>Inbox</Sidebar.Item>
      </Sidebar.Section>
      <Sidebar.Section title="Favorites">
        <Sidebar.Item href="/roadmap">Roadmap</Sidebar.Item>
      </Sidebar.Section>
      <Sidebar.Footer>
        <Sidebar.Item icon="settings" onClick={onSettings}>Settings</Sidebar.Item>
      </Sidebar.Footer>
    </Sidebar.Root>
  );
}

describe('Sidebar', () => {
  it('is a navigation landmark with header, sections and footer', () => {
    renderUI(<Nav />);
    const nav = screen.getByRole('navigation');
    expect(within(nav).getByText('Acme workspace')).toBeInTheDocument();
    expect(within(nav).getByText('Workspace')).toBeInTheDocument();
    expect(within(nav).getByText('Favorites')).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  });

  it('items with href are links; the active one is aria-current="page"', () => {
    renderUI(<Nav />);
    const home = screen.getByRole('link', { name: 'Home' });
    expect(home).toHaveAttribute('href', '/home');
    expect(home).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /Inbox/ })).not.toHaveAttribute('aria-current');
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('items without href are buttons that call onClick (Enter and Space too)', async () => {
    const onSettings = vi.fn();
    const { user } = renderUI(<Nav onSettings={onSettings} />);
    const settings = screen.getByRole('button', { name: 'Settings' });
    await user.click(settings);
    settings.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onSettings).toHaveBeenCalledTimes(3);
  });

  it('Tab moves through the items in order', async () => {
    const { user } = renderUI(<Nav />);
    const links = ['Home', 'Inbox', 'Roadmap'].map((n) => screen.getByRole('link', { name: new RegExp(n) }));
    links[0].focus();
    for (const next of links.slice(1)) {
      // section headings may be focusable controls in between
      for (let i = 0; i < 3 && document.activeElement !== next; i++) await user.tab();
      expect(next).toHaveFocus();
    }
  });
});
