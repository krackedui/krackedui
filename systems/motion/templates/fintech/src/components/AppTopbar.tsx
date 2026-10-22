import { Avatar, Breadcrumbs, IconButton, Kbd, Menu, Select, Topbar, Tooltip } from '@krackedui/motion';
import { company, currentUser } from '../data/company';
import { href, navigate, useRoute } from '../lib/router';
import { sectionOf } from '../lib/navigation';
import { accountById } from '../data/accounts';
import { periodOptions, usePreferences, type Period, type ThemePreference } from '../state/preferences';
import { useCommandMenu } from './CommandMenu';
import { NotificationsPopover } from './NotificationsPopover';

function useCrumbs() {
  const route = useRoute();
  const section = sectionOf(route);
  const items: { label: string; href?: string }[] = [{ label: company.name, href: '#/' }];
  if (section && route.page !== 'overview') items.push({ label: section.label, href: href(section.route) });
  if (route.page === 'overview') items.push({ label: 'Overview' });
  if (route.page === 'account') items.push({ label: accountById[route.id as keyof typeof accountById]?.name ?? 'Account' });
  // The last crumb is the current page: no link.
  const last = items[items.length - 1];
  if (last) delete last.href;
  return items;
}

const themeIcon = { light: 'sun', dark: 'moon', system: 'sun' } as const;

function ThemeMenu() {
  const { theme, setTheme } = usePreferences();
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <IconButton icon={themeIcon[theme]} label="Theme" />
      </Menu.Trigger>
      <Menu.Content align="end" width={180}>
        <Menu.Label>Theme</Menu.Label>
        <Menu.RadioGroup value={theme} onValueChange={(v) => setTheme(v as ThemePreference)}>
          <Menu.RadioItem value="system" icon="settings">System</Menu.RadioItem>
          <Menu.RadioItem value="light" icon="sun">Light</Menu.RadioItem>
          <Menu.RadioItem value="dark" icon="moon">Dark</Menu.RadioItem>
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}

function UserMenu() {
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <button
          type="button"
          aria-label={`Account: ${currentUser.name}`}
          className="flex size-7 cursor-pointer items-center justify-center rounded-n-md hover:bg-n-button-hover-bg-a focus-visible:shadow-n-focus-shadow outline-none pointer-coarse:size-9"
        >
          <Avatar name={currentUser.name} shape="user" size="sm" aria-hidden />
        </button>
      </Menu.Trigger>
      <Menu.Content align="end" width={240} header={
        <div className="flex flex-col px-2 py-1.5">
          <span className="text-n-ui-medium text-n-text-primary">{currentUser.name}</span>
          <span className="text-n-ui-sm text-n-text-secondary">{currentUser.email}</span>
        </div>
      }>
        <Menu.Item icon="person" onSelect={() => navigate({ page: 'settings', tab: 'profile' })}>Company profile</Menu.Item>
        <Menu.Item icon="users" onSelect={() => navigate({ page: 'settings', tab: 'team' })}>Team access</Menu.Item>
        <Menu.Item icon="bell" onSelect={() => navigate({ page: 'settings', tab: 'notifications' })}>Notification settings</Menu.Item>
        <Menu.Separator />
        <Menu.Item icon="logout">Sign out</Menu.Item>
      </Menu.Content>
    </Menu.Root>
  );
}

export function AppTopbar() {
  const crumbs = useCrumbs();
  const { period, setPeriod } = usePreferences();
  const { setOpen } = useCommandMenu();
  return (
    <Topbar
      breadcrumbs={<Breadcrumbs items={crumbs} maxItems={3} />}
      actions={
        <div className="flex items-center gap-1">
          <Select
            size="sm"
            aria-label="Date range"
            options={periodOptions}
            value={period}
            onValueChange={(v) => setPeriod(v as Period)}
            className="w-[136px] max-lg:hidden"
          />
          <Tooltip content={<span className="flex items-center gap-1">Search <Kbd>⌘K</Kbd></span>}>
            <IconButton icon="magnifyingGlass" label="Search" onClick={() => setOpen(true)} />
          </Tooltip>
          <NotificationsPopover />
          <ThemeMenu />
          <UserMenu />
        </div>
      }
    />
  );
}
