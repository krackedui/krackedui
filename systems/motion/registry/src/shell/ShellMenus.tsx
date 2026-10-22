import { useState, type ReactElement, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Icon } from '../icons/Icon';
import { Menu, MenuSearch, MenuFooter } from '../components/Menu';
import { Avatar } from '../atoms/Avatar';
import { Badge } from '../atoms/Badge';

/* -------------------------------------------------------------------------------------------------
 * Menus opened from the sidebar bottom bar. Built on components/Menu (Radix DropdownMenu).
 *  workspace  (capture/states/workspace-menu) 300 wide, opens upward from the switcher; email header
 *             12/16 500 text-secondary + "…"; workspace row (20px letter avatar, checkmark), "New workspace"
 *             (blue), Settings, Invite members, Upgrade (blue), Add account, Log out
 *  help       (capture/states/help-menu) 260 wide: Documentation, Get support, More ›, "What's new?" list
 *             with 6px blue dots + "New" badges, View all releases
 *  trash      (no usable capture: trash-menu state is empty) the Trash popover: search, page rows with
 *             restore / delete, 30-day footer
 * -----------------------------------------------------------------------------------------------*/


export interface Workspace { id: string; name: string; icon?: ReactNode }
export interface WorkspaceMenuProps {
  /** The trigger (usually `<Sidebar.WorkspaceSwitcher/>`). */
  children: ReactElement;
  email: string;
  workspaces: Workspace[];
  currentId: string;
  onSelect?: (id: string) => void;
  onNewWorkspace?: () => void;
  onSettings?: () => void;
  onInvite?: () => void;
  onUpgrade?: () => void;
  onAddAccount?: () => void;
  onLogOut?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
/** Workspace switcher menu (opens above the bottom bar). */
export function WorkspaceMenu({ children, email, workspaces, currentId, onSelect, onNewWorkspace, onSettings, onInvite, onUpgrade, onAddAccount, onLogOut, open, onOpenChange }: WorkspaceMenuProps) {
  return (
    <Menu.Root open={open} onOpenChange={onOpenChange}>
      <Menu.Trigger asChild>{children}</Menu.Trigger>
      <Menu.Content
        side="top"
        align="start"
        width={300}
        className="p-1"
        header={
          <div className="flex h-7 items-center justify-between py-1.5 pl-1.5 pr-0.5 text-n-text-secondary">
            <span className="mr-1.5 truncate text-[12px] font-medium leading-4">{email}</span>
            <button type="button" aria-label="Account options" className="flex size-6 cursor-pointer items-center justify-center rounded-n-md text-n-icon-secondary hover:bg-n-button-hover-bg-a">
              <Icon name="ellipsisSmall" size={16} />
            </button>
          </div>
        }
      >
        {/* Workspaces are a radio group: the current one is announced as checked. */}
        <Menu.RadioGroup aria-label="Workspaces" value={currentId} onValueChange={(id) => onSelect?.(id)}>
          {workspaces.map((w) => (
            <Menu.RadioItem key={w.id} value={w.id} icon={w.icon ?? <Avatar name={w.name} size={20} />}>
              {w.name}
            </Menu.RadioItem>
          ))}
        </Menu.RadioGroup>
        <Menu.Item icon={<Icon name="plusFill" size={16} />} tone="accent" onSelect={onNewWorkspace}>New workspace</Menu.Item>
        <Menu.Separator />
        <Menu.Item icon="gear" onSelect={onSettings}>Settings</Menu.Item>
        <Menu.Item icon="envelope" onSelect={onInvite}>Invite members</Menu.Item>
        <Menu.Item icon="arrowInCircleUp" tone="accent" onSelect={onUpgrade}>Upgrade</Menu.Item>
        <Menu.Separator />
        <Menu.Item icon="personCropCircleBadgePlus" onSelect={onAddAccount}>Add account</Menu.Item>
        <Menu.Item icon="arrowRightFromRectangle" onSelect={onLogOut}>Log out</Menu.Item>
      </Menu.Content>
    </Menu.Root>
  );
}

export interface ReleaseNote { id: string; title: ReactNode; isNew?: boolean }
export interface HelpMenuProps {
  children: ReactElement;
  releases?: ReleaseNote[];
  onDocs?: () => void;
  onSupport?: () => void;
  onRelease?: (id: string) => void;
  onAllReleases?: () => void;
  /** Items inside "More ›". */
  more?: ReactNode;
}
/** "What's new, help, contact, more…" menu from the (?) bottom-bar button. */
export function HelpMenu({ children, releases = [], onDocs, onSupport, onRelease, onAllReleases, more }: HelpMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger asChild>{children}</Menu.Trigger>
      <Menu.Content side="top" align="start" width={260} aria-label="What’s new, help, contact, more…">
        <Menu.Item icon="book" onSelect={onDocs}>Documentation</Menu.Item>
        <Menu.Item icon="bubbleRight" onSelect={onSupport}>Get support</Menu.Item>
        <Menu.Sub>
          <Menu.SubTrigger icon="ellipsis">More</Menu.SubTrigger>
          <Menu.SubContent width={220}>
            {more ?? (
              <>
                <Menu.Item icon="commandSmall">Keyboard shortcuts</Menu.Item>
                <Menu.Item icon="lightBulbBright">Send feedback</Menu.Item>
              </>
            )}
          </Menu.SubContent>
        </Menu.Sub>
        <Menu.Separator />
        <Menu.Label className="mb-1 mt-1 px-2 text-[12px]">What’s new?</Menu.Label>
        {releases.map((r) => (
          <Menu.Item
            key={r.id}
            icon={<span className="flex size-5 items-center justify-center">{r.isNew && <Icon name="circleFillSmall" size={6} className="text-n-blue-icon-accent-primary" />}</span>}
            onSelect={() => onRelease?.(r.id)}
          >
            <span className="flex min-w-0 items-center gap-1">
              {r.isNew && <Badge tone="accent">New</Badge>}
              <span className="truncate">{r.title}</span>
            </span>
          </Menu.Item>
        ))}
        <Menu.Item icon={<Icon name="boxOpenSparkle" size={16} className="text-n-text-secondary" />} onSelect={onAllReleases}>View all releases</Menu.Item>
      </Menu.Content>
    </Menu.Root>
  );
}

export interface TrashEntry { id: string; title: string; path?: string; icon?: ReactNode }
export interface TrashMenuProps {
  items: TrashEntry[];
  onOpen?: (id: string) => void;
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}
/** Trash popover body: search, filtered page list with restore / delete actions, 30-day footer. */
export function TrashMenu({ items, onOpen, onRestore, onDelete, className }: TrashMenuProps) {
  const [q, setQ] = useState('');
  const shown = items.filter((i) => i.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className={cn('flex w-[414px] max-w-[calc(100vw-16px)] flex-col', className)}>
      <MenuSearch placeholder="Search pages in Trash" value={q} onChange={(e) => setQ(e.target.value)} />
      <ul aria-label="Pages in Trash" className="m-0 flex max-h-[320px] list-none flex-col gap-px overflow-y-auto p-1">
        {shown.length === 0 && <li className="px-2 py-6 text-center text-[14px] text-n-text-tertiary">No matches</li>}
        {shown.map((i) => (
          <li key={i.id} className="group/trash flex min-h-7 items-center gap-2 rounded-n-md px-2 py-1 text-[14px] leading-[16.8px] hover:bg-n-button-hover-bg-a has-[>button:first-child:focus-visible]:shadow-n-focus-shadow">
            <button type="button" onClick={() => onOpen?.(i.id)} className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left outline-none focus-visible:shadow-none">
              <span aria-hidden className="flex size-5 shrink-0 items-center justify-center text-n-icon-secondary">{i.icon ?? <Icon name="page" size={18} />}</span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate">{i.title}</span>
                {i.path && <span className="truncate text-[12px] leading-4 text-n-text-secondary">{i.path}</span>}
              </span>
            </button>
            <button type="button" aria-label={`Restore ${i.title}`} onClick={() => onRestore?.(i.id)} className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-n-md text-n-icon-secondary hover:bg-n-button-hover-bg-a">
              <Icon name="arrowUTurnDownLeft" size={16} />
            </button>
            <button type="button" aria-label={`Delete ${i.title} from Trash`} onClick={() => onDelete?.(i.id)} className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-n-md text-n-icon-secondary hover:bg-n-button-hover-bg-a">
              <Icon name="trash" size={16} />
            </button>
          </li>
        ))}
      </ul>
      <MenuFooter className="flex items-center gap-1.5">
        <Icon name="infoCircleFill" size={14} className="text-n-icon-tertiary" />
        Pages in Trash for over 30 days will be automatically deleted
      </MenuFooter>
    </div>
  );
}

export interface AppsMenuProps {
  children: ReactElement;
  trash?: TrashEntry[];
  onLibrary?: () => void;
  onTemplates?: () => void;
  onImport?: () => void;
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
}
/** "Library, Trash, more…" menu from the apps-grid bottom-bar button; Trash opens the trash list as a submenu. */
export function AppsMenu({ children, trash = [], onLibrary, onTemplates, onImport, onRestore, onDelete }: AppsMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger asChild>{children}</Menu.Trigger>
      <Menu.Content side="top" align="start" width={240}>
        <Menu.Item icon="bookshelf" onSelect={onLibrary}>Library</Menu.Item>
        <Menu.Item icon="templates" onSelect={onTemplates}>Templates</Menu.Item>
        <Menu.Item icon="arrowLineDown" onSelect={onImport}>Import</Menu.Item>
        <Menu.Separator />
        <Menu.Sub>
          <Menu.SubTrigger icon="trash">Trash</Menu.SubTrigger>
          <Menu.SubContent className="p-0">
            <TrashMenu items={trash} onRestore={onRestore} onDelete={onDelete} />
          </Menu.SubContent>
        </Menu.Sub>
      </Menu.Content>
    </Menu.Root>
  );
}
