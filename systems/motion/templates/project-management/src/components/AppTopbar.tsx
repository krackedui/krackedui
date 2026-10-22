import { Breadcrumbs, Button, IconButton, Kbd, Topbar, type BreadcrumbItem } from '@krackedui/motion';
import type { ThemePreference } from '../state/theme';
import { NotificationsPopover } from './NotificationsPopover';
import { ThemeMenu } from './ThemeMenu';

interface AppTopbarProps {
  crumbs: BreadcrumbItem[];
  theme: ThemePreference;
  onThemeChange: (next: ThemePreference) => void;
  onSearch: () => void;
  onCreateTask: () => void;
}

/** Breadcrumbs on the left; search (⌘K), new task, notifications and theme on the right. */
export function AppTopbar({ crumbs, theme, onThemeChange, onSearch, onCreateTask }: AppTopbarProps) {
  return (
    <Topbar
      breadcrumbs={<Breadcrumbs items={crumbs} />}
      actions={(
        <div className="flex items-center gap-1">
          <Button size="sm" variant="secondary" icon="magnifyingGlass" onClick={onSearch} aria-keyshortcuts="Meta+K" className="max-sm:hidden">
            Search <Kbd className="ml-1">⌘K</Kbd>
          </Button>
          <IconButton icon="magnifyingGlass" label="Search" onClick={onSearch} className="sm:hidden" />
          <IconButton icon="plus" label="New task" tooltip onClick={onCreateTask} />
          <NotificationsPopover />
          <ThemeMenu value={theme} onChange={onThemeChange} />
        </div>
      )}
    />
  );
}
