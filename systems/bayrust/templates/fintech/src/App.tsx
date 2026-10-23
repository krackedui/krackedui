import { useEffect, useState } from 'react';
import {
  AppFrame, Breadcrumbs, CommandPaletteDialog, IconButton, Popover, Sidebar, Theme, ToastProvider,
  Topbar, Menu, Avatar, Stack,
  type CommandPaletteItem,
} from '@krackedui/bayrust';
import { useRoute, go } from './router';
import { company, transactions, payees } from './data';
import { Overview } from './screens/Overview';
import { Transactions } from './screens/Transactions';
import { Accounts } from './screens/Accounts';
import { Cards } from './screens/Cards';
import { Payments } from './screens/Payments';
import { Budgets } from './screens/Budgets';
import { Settings } from './screens/Settings';

const PAGES: { path: string; label: string; icon: 'home' | 'list' | 'bank' | 'creditCard' | 'send' | 'wallet' | 'settings' }[] = [
  { path: '/', label: 'Overview', icon: 'home' },
  { path: '/transactions', label: 'Transactions', icon: 'list' },
  { path: '/accounts', label: 'Accounts', icon: 'bank' },
  { path: '/cards', label: 'Cards', icon: 'creditCard' },
  { path: '/payments', label: 'Payments', icon: 'send' },
  { path: '/budgets', label: 'Budgets', icon: 'wallet' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
];

function Screen({ route }: { route: string }) {
  if (route.startsWith('/transactions')) return <Transactions />;
  if (route.startsWith('/accounts')) return <Accounts />;
  if (route.startsWith('/cards')) return <Cards />;
  if (route.startsWith('/payments')) return <Payments />;
  if (route.startsWith('/budgets')) return <Budgets />;
  if (route.startsWith('/settings')) return <Settings />;
  return <Overview />;
}

/** ⌘K is the application's shortcut to bind, not the palette's: only the app knows what else is on it. */
function useCommandKey(open: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
}

export function App() {
  const route = useRoute();
  const [paletteOpen, setPaletteOpen] = useState(false);
  useCommandKey(() => setPaletteOpen(true));

  const current = PAGES.find((p) => p.path === route) ?? PAGES[0];

  const groups: { label: string; items: CommandPaletteItem[] }[] = [
    { label: 'Pages', items: PAGES.map((p) => ({ id: `page:${p.path}`, label: p.label, icon: p.icon })) },
    {
      label: 'Payees',
      items: payees.map((p) => ({ id: `payee:${p.id}`, label: p.name, icon: 'send', description: p.account })),
    },
    {
      label: 'Transactions',
      items: transactions.slice(0, 8).map((t) => ({
        id: `tx:${t.id}`,
        label: t.merchant,
        keywords: `${t.category} ${t.id}`,
        icon: 'receipt',
        description: t.id,
      })),
    },
  ];

  return (
    // `system` so the gate's dark-mode pass, which flips prefers-color-scheme, sees both appearances.
    <Theme appearance="system">
      <ToastProvider>
        <AppFrame
          sidebar={
            <Sidebar.Root>
              <Sidebar.Header>{company.name}</Sidebar.Header>
              <Sidebar.Section title="Finance">
                {PAGES.map((p) => (
                  <Sidebar.Item key={p.path} icon={p.icon} active={p.path === current.path} href={`#${p.path}`}>
                    {p.label}
                  </Sidebar.Item>
                ))}
              </Sidebar.Section>
            </Sidebar.Root>
          }
          topbar={
            <Topbar
              breadcrumbs={
                <Breadcrumbs
                  items={
                    current.path === '/'
                      ? [{ label: company.name }]
                      : [{ label: company.name, href: '#/', onClick: () => go('/') }, { label: current.label }]
                  }
                />
              }
              actions={
                <Stack direction="row" gap={2} align="center">
                  <IconButton icon="search" label="Search (⌘K)" onClick={() => setPaletteOpen(true)} />
                  <Popover.Root>
                    <Popover.Trigger asChild>
                      <IconButton icon="bell" label="Notifications" />
                    </Popover.Trigger>
                    <Popover.Content>
                      <Stack gap={4}>
                        <strong>Two cards are near their limit</strong>
                        <span>Marco Pereira and Tobias Lund.</span>
                      </Stack>
                    </Popover.Content>
                  </Popover.Root>
                  <Menu.Root>
                    <Menu.Trigger asChild>
                      <IconButton icon="user" label="Account" />
                    </Menu.Trigger>
                    <Menu.Content align="end">
                      <Menu.Label>Dana Whitfield</Menu.Label>
                      <Menu.Item icon="settings" onClick={() => go('/settings')}>
                        Settings
                      </Menu.Item>
                      <Menu.Separator />
                      <Menu.Item icon="logout">Sign out</Menu.Item>
                    </Menu.Content>
                  </Menu.Root>
                  <Avatar name="Dana Whitfield" size="sm" />
                </Stack>
              }
            />
          }
        >
          <Screen route={route} />
        </AppFrame>
        <CommandPaletteDialog
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          groups={groups}
          placeholder="Jump to a page, payee or transaction…"
          onSelect={(item) => {
            if (item.id.startsWith('page:')) go(item.id.slice(5));
            else if (item.id.startsWith('tx:')) go('/transactions');
            else go('/payments');
          }}
        />
      </ToastProvider>
    </Theme>
  );
}
