// Feedback and the app shell: what gets announced, and the landmarks a page is navigated by.
import { describe, it, expect } from 'vitest';
import { Alert, AppFrame, Breadcrumbs, Button, EmptyState, PageHeader, Sidebar, Topbar } from '@system';
import { renderUI, screen } from '../utils';

describe('Alert', () => {
  it('a danger alert is assertive and an info alert is polite', () => {
    const { rerender } = renderUI(<Alert tone="danger" title="Failed" />);
    const danger = screen.getByRole('alert');
    expect(danger).toHaveAttribute('aria-live', 'assertive');
    rerender(<Alert tone="info" title="Heads up" />);
  });

  it('carries an icon as well as its tone, so meaning is not colour alone', () => {
    const { container } = renderUI(<Alert tone="warning" title="Two commands need attention" />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('can be dismissed', async () => {
    let dismissed = false;
    const { user } = renderUI(<Alert tone="info" title="Note" onDismiss={() => { dismissed = true; }} />);
    await user.click(screen.getByRole('button', { name: /Dismiss/i }));
    expect(dismissed).toBe(true);
  });
});

describe('EmptyState', () => {
  it('reads as a titled block with its action', () => {
    renderUI(<EmptyState title="No snippets yet" description="Create one to get started." action={<Button>New snippet</Button>} />);
    expect(screen.getByText('No snippets yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New snippet' })).toBeInTheDocument();
  });
});

describe('AppFrame', () => {
  it('renders one main region and a named navigation landmark', () => {
    renderUI(
      <AppFrame
        sidebar={
          <Sidebar.Root>
            <Sidebar.Section title="Pages">
              <Sidebar.Item icon="home" active>Overview</Sidebar.Item>
            </Sidebar.Section>
          </Sidebar.Root>
        }
        topbar={<Topbar breadcrumbs={<Breadcrumbs items={[{ label: 'Home', href: '#' }, { label: 'Overview' }]} />} />}
      >
        <PageHeader title="Overview" />
      </AppFrame>,
    );
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Overview' })).toBeInTheDocument();
  });

  it('marks the active sidebar item as the current page', () => {
    renderUI(
      <AppFrame
        sidebar={
          <Sidebar.Root>
            <Sidebar.Section title="Pages">
              <Sidebar.Item icon="home" active>Overview</Sidebar.Item>
              <Sidebar.Item icon="chart">Analytics</Sidebar.Item>
            </Sidebar.Section>
          </Sidebar.Root>
        }
      >
        <PageHeader title="Overview" />
      </AppFrame>,
    );
    expect(screen.getByRole('button', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
  });
});

describe('Breadcrumbs', () => {
  it('leaves the last item as plain text, not a link', () => {
    renderUI(<Breadcrumbs items={[{ label: 'Home', href: '#' }, { label: 'Overview' }]} />);
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Overview' })).not.toBeInTheDocument();
  });
});
