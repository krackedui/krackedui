import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppFrame, Sidebar, Topbar } from '@system';
import { renderUI, screen, waitFor, within } from './utils';

// Emulate a viewport width for `matchMedia` (min-/max-width queries) and `innerWidth`.
const realMatchMedia = window.matchMedia;
const realWidth = window.innerWidth;
function setViewport(width: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
  window.matchMedia = ((query: string) => {
    const max = /max-width:\s*([\d.]+)px/.exec(query);
    const min = /min-width:\s*([\d.]+)px/.exec(query);
    const matches = (!max || width <= Number(max[1])) && (!min || width >= Number(min[1]));
    return { matches, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false };
  }) as typeof window.matchMedia;
}
afterEach(() => {
  window.matchMedia = realMatchMedia;
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: realWidth });
});

function Shell(props: { sidebarOpen?: boolean; defaultSidebarOpen?: boolean; onSidebarOpenChange?: (open: boolean) => void }) {
  return (
    <AppFrame
      {...props}
      sidebar={
        <Sidebar.Root>
          <Sidebar.Section title="Workspace">
            <Sidebar.Item href="#home" active>Home</Sidebar.Item>
            <Sidebar.Item href="#inbox">Inbox</Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Root>
      }
      topbar={<Topbar breadcrumbs={<span>Home</span>} actions={<button type="button">Share</button>} />}
    >
      <p>Page content</p>
    </AppFrame>
  );
}

const openButton = () => screen.getByRole('button', { name: /open (the )?(sidebar|menu|navigation)/i });

describe('AppFrame', () => {
  it('renders the sidebar navigation, the top bar and the page', () => {
    setViewport(1280);
    renderUI(<Shell />);
    expect(screen.getByRole('navigation', { name: /sidebar/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });

  it('desktop: a collapsed sidebar is reopened from the top bar (onSidebarOpenChange)', async () => {
    setViewport(1280);
    const onSidebarOpenChange = vi.fn();
    const { user, rerender } = renderUI(<Shell sidebarOpen={false} onSidebarOpenChange={onSidebarOpenChange} />);
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument());
    await user.click(openButton());
    expect(onSidebarOpenChange).toHaveBeenLastCalledWith(true);
    rerender(<Shell sidebarOpen onSidebarOpenChange={onSidebarOpenChange} />);
    expect(await screen.findByRole('link', { name: 'Home' })).toBeInTheDocument();
  });

  it('desktop: uncontrolled defaultSidebarOpen={false} starts collapsed', async () => {
    setViewport(1280);
    const { user } = renderUI(<Shell defaultSidebarOpen={false} />);
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument();
    await user.click(openButton());
    expect(await screen.findByRole('link', { name: 'Home' })).toBeInTheDocument();
  });

  it('phone: the sidebar is a drawer, closed by default, opened by the top bar menu button', async () => {
    setViewport(375);
    const onSidebarOpenChange = vi.fn();
    const { user } = renderUI(<Shell onSidebarOpenChange={onSidebarOpenChange} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument();
    await user.click(openButton());
    expect(onSidebarOpenChange).toHaveBeenLastCalledWith(true);
    const drawer = await screen.findByRole('dialog');
    expect(drawer).toHaveAttribute('aria-modal', 'true');
    expect(within(drawer).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  });

  it('phone: focus is trapped in the drawer and Escape closes it, returning focus', async () => {
    setViewport(375);
    const onSidebarOpenChange = vi.fn();
    const { user } = renderUI(<Shell onSidebarOpenChange={onSidebarOpenChange} />);
    const button = openButton();
    await user.click(button);
    const drawer = await screen.findByRole('dialog');
    await waitFor(() => expect(drawer.contains(document.activeElement)).toBe(true));
    for (let i = 0; i < 5; i++) {
      await user.tab();
      expect(drawer.contains(document.activeElement)).toBe(true);
    }
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onSidebarOpenChange).toHaveBeenLastCalledWith(false);
    expect(button).toHaveFocus();
  });

  it('phone: controlled sidebarOpen opens the drawer', async () => {
    setViewport(375);
    const { rerender } = renderUI(<Shell sidebarOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(<Shell sidebarOpen />);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
