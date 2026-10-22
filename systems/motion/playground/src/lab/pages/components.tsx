import { useEffect, useState, type ReactNode } from 'react';
import {
  Avatar, Badge, Breadcrumbs, BreadcrumbAccess, Button, ColorGrid, ColorMenuList, CommandPalette, CommandPaletteDialog,
  ConfirmDialog, ConfirmDialogBody, ContextMenu, DateMenu, Dialog, DialogOverlay, DialogSurface, EmojiPicker, Icon,
  IconButton, Menu, MenuBadge, MenuFooter, MenuLabel, MenuList, MenuRow, MenuSearch, MenuSurface, Popover, PopoverSurface,
  SegmentedControl, SharePopover, Sheet, Tabs, ToastPill, ToastProvider, commandPaletteSurfaceClass, useToast,
  type CommandGroup,
} from '@krackedui/motion';

/* Lab for generic components. Sections: #/lab/components?s=menus|pickers|search|overlays (default: all). Add &dark. */

const TODAY = new Date(2026, 9, 15);

function section() {
  const q = location.hash.split('?')[1] ?? '';
  return new URLSearchParams(q.replace(/&?dark/, '')).get('s');
}

function Caption({ children }: { children: ReactNode }) {
  return <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-n-text-tertiary">{children}</div>;
}
function Cell({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return <div className={className}><Caption>{label}</Caption>{children}</div>;
}

/* ---------------- menus ---------------- */

function PageActionsMenu() {
  const [offline, setOffline] = useState(false);
  const [locked, setLocked] = useState(false);
  return (
    <MenuSurface width={256}>
      <MenuSearch placeholder="Search actions…" autoFocus />
      <MenuList>
        <MenuRow icon="link" shortcut="⌘L">Copy link</MenuRow>
        <MenuRow icon="clipboard">Copy page contents</MenuRow>
        <MenuRow icon="duplicate" shortcut="⌘D">Duplicate</MenuRow>
        <MenuRow icon="arrowTurnUpRight" shortcut="⌘⇧P">Move to</MenuRow>
        <MenuRow icon="stack">Version history</MenuRow>
        <MenuRow icon="clock">Updates &amp; analytics</MenuRow>
      </MenuList>
      <MenuList separator><MenuRow icon="textFormat" submenu>Appearance &amp; layout</MenuRow></MenuList>
      <MenuList separator><MenuRow icon="aiFace" submenu>Use with AI</MenuRow></MenuList>
      <MenuList separator>
        <MenuRow icon="commentPencil">Suggest edits</MenuRow>
        <MenuRow icon="bell" description="Comments" submenu>Notify me</MenuRow>
        <MenuRow icon="arrowInCircleDown" toggle={offline} onToggle={setOffline}>Available offline</MenuRow>
      </MenuList>
      <MenuList separator>
        <MenuRow icon="lock" toggle={locked} onToggle={setLocked}>Lock page</MenuRow>
        <MenuRow icon="trash" tone="danger">Move to Trash</MenuRow>
      </MenuList>
      <MenuList separator><MenuRow icon="ellipsis" submenu>More</MenuRow></MenuList>
      <MenuFooter lines={['130 words', 'Last edited by Ada Lovelace', 'Today at 4:55 PM']} />
    </MenuSurface>
  );
}

function WorkspaceMenu() {
  return (
    <MenuSurface width={300}>
      <MenuList className="pt-2">
        <div className="flex h-7 items-center justify-between pl-2 pr-1.5 text-[12px] font-medium leading-4 text-n-text-secondary">
          <span>ada@example.com</span>
          <IconButton icon="ellipsisSmall" label="More" size="xs" tone="tertiary" />
        </div>
        <MenuRow icon={<Avatar name="Ada" size={20} />} checked className="gap-1.5 pl-1.5 pr-1">Design Team</MenuRow>
        <MenuRow icon="plus" tone="accent" className="gap-1.5 pl-1.5">New workspace</MenuRow>
      </MenuList>
      <MenuList separator>
        <MenuRow icon="gear" className="gap-1.5 px-1.5">Settings</MenuRow>
        <MenuRow icon="envelope" className="gap-1.5 px-1.5">Invite members</MenuRow>
        <MenuRow icon="arrowInCircleUp" tone="accent" className="gap-1.5 px-1.5">Upgrade</MenuRow>
      </MenuList>
      <MenuList separator>
        <MenuRow icon="personCropCircleBadgePlus" className="gap-1.5 px-1.5">Add account</MenuRow>
        <MenuRow icon="arrowRightFromRectangle" className="gap-1.5 px-1.5">Log out</MenuRow>
      </MenuList>
    </MenuSurface>
  );
}

function HelpMenu() {
  const releases = ['Release 3.8', 'Release 3.7', 'Model controls'];
  return (
    <MenuSurface width={260}>
      <MenuList>
        <MenuRow icon="book">Documentation</MenuRow>
        <MenuRow icon="bubbleRight">Get support</MenuRow>
        <MenuRow icon="ellipsis" submenu>More</MenuRow>
      </MenuList>
      <MenuList separator>
        <MenuLabel>What’s new?</MenuLabel>
        <div className="relative">
          <span aria-hidden className="absolute bottom-3.5 left-[21px] top-3.5 w-0.5 rounded-full bg-n-bg-tertiary-translucent-a" />
          {releases.map((r) => (
            <MenuRow key={r} className="h-8" icon={<span className="size-1.5 rounded-full bg-n-blue-icon-accent-primary" />}>
              <span className="flex items-center gap-1"><MenuBadge>New</MenuBadge>{r}</span>
            </MenuRow>
          ))}
          <MenuRow icon="boxOpenSparkle" className="h-8">View all releases</MenuRow>
        </div>
      </MenuList>
    </MenuSurface>
  );
}

function TrashMenu() {
  const pages = [
    { t: 'Untitled', p: 'DS Sandbox' },
    { t: 'Meeting notes @September 2, 2026', p: 'DS Sandbox / Tasks' },
    { t: 'Old roadmap', p: 'Private' },
  ];
  return (
    <MenuSurface width={414}>
      <MenuSearch placeholder="Search pages in Trash" />
      <div className="flex gap-1.5 px-3 pb-1">
        {['Last edited by', 'In', 'Teamspaces'].map((f) => (
          <button key={f} type="button" className="flex h-6 items-center gap-1 rounded-[32px] px-2 text-[14px] text-n-text-secondary shadow-[inset_0_0_0_1px_var(--n-border-primary-translucent-a)] hover:bg-n-button-hover-bg-a">
            {f}<Icon name="arrowChevronSingleDownSmall" size={14} />
          </button>
        ))}
      </div>
      <MenuList>
        {pages.map((x, i) => (
          <MenuRow key={x.t} icon="page" highlighted={i === 0} caption={x.p}
            trailing={<span className="flex gap-0.5"><IconButton icon="arrowUTurnDownLeft" label="Restore" size="sm" tone="secondary" /><IconButton icon="trash" label="Delete from Trash" size="sm" tone="secondary" /></span>}>
            {x.t}
          </MenuRow>
        ))}
      </MenuList>
      <div className="relative mt-px flex items-center gap-1.5 bg-n-bg-secondary px-3 py-2 text-[12px] leading-4 text-n-text-secondary shadow-[0_-1px_0_var(--n-bg-tertiary-translucent-a)]">
        <span className="flex-1">Pages in Trash for over 30 days will be automatically deleted</span>
        <Icon name="questionMarkCircleSmall" size={16} className="text-n-icon-tertiary" />
      </div>
    </MenuSurface>
  );
}

function BlockMenuWithColor() {
  return (
    <div className="flex items-end gap-1">
      <MenuSurface width={262}>
        <MenuSearch placeholder="Search actions…" noIcon />
        <MenuList>
          <MenuLabel>Text</MenuLabel>
          <MenuRow icon="arrowSquarePathUpDown" submenu>Turn into</MenuRow>
          <MenuRow icon="paintBrush" submenu highlighted>Color</MenuRow>
        </MenuList>
        <MenuList separator>
          <MenuRow icon="link" shortcut="⌘^L">Copy link to block</MenuRow>
          <MenuRow icon="duplicate" shortcut="⌘D">Duplicate</MenuRow>
          <MenuRow icon="arrowTurnUpRight" shortcut="⌘⇧P">Move to</MenuRow>
          <MenuRow icon="trash" shortcut="Del">Delete</MenuRow>
        </MenuList>
        <MenuList separator><MenuRow icon="commentPencil" shortcut="⌘⇧⌥X">Suggest edits</MenuRow></MenuList>
        <MenuList separator><MenuRow icon="aiFace" shortcut="⌘J">Ask AI</MenuRow></MenuList>
        <MenuFooter lines={['Last edited by Ada Lovelace', 'Today at 4:55 PM', '0 words, 0 characters']} />
      </MenuSurface>
      <MenuSurface width={220} className="max-h-[560px] overflow-y-auto">
        <ColorMenuList
          lastUsed={[{ value: { kind: 'background', color: 'yellow' }, shortcut: '⌘⇧H' }]}
          highlighted={{ kind: 'background', color: 'yellow' }}
        />
      </MenuSurface>
    </div>
  );
}

function InteractiveMenus() {
  const [wrap, setWrap] = useState(true);
  const [sort, setSort] = useState('name');
  const [offline, setOffline] = useState(true);
  return (
    <div className="flex items-center gap-3">
      <Menu.Root>
        <Menu.Trigger asChild><IconButton icon="ellipsis" label="Actions" /></Menu.Trigger>
        <Menu.Content width={256} align="end" header={<Menu.Search placeholder="Search actions…" />}
          footer={<Menu.Footer lines={['130 words', 'Last edited by Ada Lovelace']} />}>
          <Menu.Item icon="link" shortcut="⌘L">Copy link</Menu.Item>
          <Menu.Item icon="duplicate" shortcut="⌘D">Duplicate</Menu.Item>
          <Menu.Separator />
          <Menu.Sub>
            <Menu.SubTrigger icon="bell" description="Comments">Notify me</Menu.SubTrigger>
            <Menu.SubContent width={220}>
              <Menu.Item checked>All comments</Menu.Item>
              <Menu.Item>Replies &amp; mentions</Menu.Item>
            </Menu.SubContent>
          </Menu.Sub>
          <Menu.ToggleItem icon="arrowInCircleDown" checked={offline} onCheckedChange={setOffline}>Available offline</Menu.ToggleItem>
          <Menu.CheckboxItem checked={wrap} onCheckedChange={setWrap}>Wrap text</Menu.CheckboxItem>
          <Menu.Separator />
          <Menu.Label>Sort</Menu.Label>
          <Menu.RadioGroup value={sort} onValueChange={setSort}>
            <Menu.RadioItem value="name">Name</Menu.RadioItem>
            <Menu.RadioItem value="date">Date</Menu.RadioItem>
          </Menu.RadioGroup>
          <Menu.Separator />
          <Menu.Item icon="trash" destructive>Move to Trash</Menu.Item>
        </Menu.Content>
      </Menu.Root>
      <ContextMenu.Root>
        <ContextMenu.Trigger asChild>
          <div className="flex h-10 items-center rounded-n-md px-3 text-[14px] text-n-text-secondary shadow-[inset_0_0_0_1px_var(--n-border-primary)] [border-style:dashed]">Right-click me (ContextMenu)</div>
        </ContextMenu.Trigger>
        <ContextMenu.Content width={240}>
          <ContextMenu.Label>Page</ContextMenu.Label>
          <ContextMenu.Item icon="link" shortcut="⌘L">Copy link</ContextMenu.Item>
          <ContextMenu.Item icon="duplicate" shortcut="⌘D">Duplicate</ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item icon="trash" tone="danger">Delete</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
    </div>
  );
}

function Menus() {
  return (
    <div className="flex flex-wrap items-start gap-8">
      <Cell label="page-actions-menu"><PageActionsMenu /></Cell>
      <div className="flex flex-col gap-8">
        <Cell label="workspace-menu"><WorkspaceMenu /></Cell>
        <Cell label="help-menu"><HelpMenu /></Cell>
      </div>
      <div className="flex flex-col gap-8">
        <Cell label="trash-menu (inferred layout)"><TrashMenu /></Cell>
        <Cell label="interactive: Menu (Radix) + ContextMenu"><InteractiveMenus /></Cell>
      </div>
      <Cell label="block-menu + block-color-menu"><BlockMenuWithColor /></Cell>
    </div>
  );
}

/* ---------------- pickers ---------------- */

function Pickers() {
  const [date, setDate] = useState<Date | null>(new Date(2026, 9, 12));
  return (
    <div className="flex flex-wrap items-start gap-8">
      <Cell label="db-date-picker">
        <PopoverSurface width={248}><DateMenu value={date} onChange={setDate} today={TODAY} highlightedRow="learn" /></PopoverSurface>
      </Cell>
      <Cell label="emoji-picker">
        <PopoverSurface><EmojiPicker highlighted="💡" autoFocus={false} /></PopoverSurface>
      </Cell>
      <div className="flex flex-col gap-8">
        <Cell label="color-menu">
          <MenuSurface width={198}>
            <ColorGrid recent={[{ kind: 'background', color: 'yellow' }]} value={[{ kind: 'text', color: 'default' }, { kind: 'background', color: 'default' }]} />
          </MenuSurface>
        </Cell>
        <Cell label="interactive: Popover">
          <Popover.Root>
            <Popover.Trigger asChild><Button icon="calendarAltEmpty">Pick a date</Button></Popover.Trigger>
            <Popover.Content width={248}><DateMenu value={date} onChange={setDate} /></Popover.Content>
          </Popover.Root>
        </Cell>
      </div>
      <Cell label="share-menu">
        <PopoverSurface radius="lg">
          <SharePopover
            people={[{ name: 'Ada Lovelace', email: 'ada@example.com', you: true }]}
            banner="Control agent access in Advanced"
          />
        </PopoverSurface>
      </Cell>
    </div>
  );
}

/* ---------------- search ---------------- */

const groups: CommandGroup[] = [
  { label: 'Today', items: [
    { id: 'a', title: 'Sidebar rebuild', icon: 'pageEmpty', path: ['DS Sandbox', 'Tasks'] },
    { id: 'b', title: 'Command palette', icon: 'pageEmpty', path: ['DS Sandbox', 'Tasks'] },
    { id: 'c', title: 'Greeting and wellbeing check' },
    { id: 'd', title: 'Design crit @September 3, 2026 4:00 PM' },
  ] },
  { label: 'Past week', items: [{ id: 'e', title: 'DAILY PLAN' }] },
  { label: 'Past 30 days', items: [{ id: 'f', title: 'Project review @September 24, 2026' }] },
  { label: 'Older', items: [
    { id: 'g', title: '@March 4, 2026 5:09 PM' },
    { id: 'h', title: '@April 4, 2026 1:08 PM' },
    { id: 'i', title: 'Work items', path: ['Roadmap'] },
  ] },
];

function Search() {
  return (
    <div className="relative -m-6 flex h-[1037px] items-start justify-center bg-n-bg-primary pt-[93px]">
      <div className={commandPaletteSurfaceClass + ' relative z-50 flex flex-col'} style={{ width: 1006, height: 700 }}>
        <CommandPalette groups={groups} placeholder="Search or ask a question in Design Team…" className="min-h-0 flex-1" />
      </div>
    </div>
  );
}

/* ---------------- overlays & navigation ---------------- */

function ToastDemo() {
  const { toast } = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" onClick={() => toast({ message: 'Copied link to clipboard' })}>Show toast</Button>
      <Button variant="secondary" onClick={() => toast({ message: 'Moved to Trash', icon: 'trash', action: { label: 'Undo', onClick: () => toast({ message: 'Restored', tone: 'success' }) } })}>Action toast</Button>
      <Button variant="secondary" onClick={() => toast({ message: "Couldn't save changes", description: 'Check your connection and try again.', tone: 'danger' })}>Danger toast</Button>
    </div>
  );
}

function Overlays() {
  const [seg, setSeg] = useState('left');
  const [open, setOpen] = useState(false);
  return (
    <ToastProvider>
      <div className="flex flex-wrap items-start gap-10">
        <div className="flex flex-col gap-8">
          <Cell label="Breadcrumbs (topbar)">
            <div className="w-[640px] rounded-n-md px-3 shadow-[inset_0_0_0_1px_var(--n-border-primary-translucent-a)]">
              <Breadcrumbs items={[{ label: 'DS Sandbox' }]} trailing={<BreadcrumbAccess />} />
              <Breadcrumbs items={[{ label: 'DS Sandbox', icon: 'page' }, { label: 'Tasks', icon: 'viewTable' }, { label: 'Sidebar rebuild', icon: '💡' }]} />
              <Breadcrumbs maxItems={3} items={[{ label: 'Wiki', icon: '📚' }, { label: 'Engineering', icon: '🛠️' }, { label: 'Design system', icon: 'page' }, { label: 'Components', icon: 'page' }]} />
            </div>
          </Cell>
          <Cell label="Tabs (share-menu / settings)">
            <div className="w-[456px]">
              <Tabs.Root defaultValue="share">
                <Tabs.List className="pl-3"><Tabs.Trigger value="share">Share</Tabs.Trigger><Tabs.Trigger value="publish">Publish</Tabs.Trigger></Tabs.List>
              </Tabs.Root>
              <Tabs.Root defaultValue="emoji" className="mt-3">
                <Tabs.List>
                  {['Emoji', 'Icons', 'Upload'].map((t) => <Tabs.Trigger key={t} value={t.toLowerCase()} tone="secondary" weight="regular" underline="inset">{t}</Tabs.Trigger>)}
                </Tabs.List>
              </Tabs.Root>
            </div>
          </Cell>
          <Cell label="SegmentedControl">
            <div className="flex flex-col items-start gap-3">
              <SegmentedControl value={seg} onValueChange={setSeg} options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]} />
              <SegmentedControl size="md" defaultValue="table" options={[{ value: 'table', icon: 'viewTable', label: 'Table' }, { value: 'board', icon: 'viewBoard', label: 'Board' }, { value: 'calendar', icon: 'viewCalendar', label: 'Calendar' }]} />
            </div>
          </Cell>
          <Cell label="Toast">
            <div className="flex flex-col items-start gap-3">
              <ToastPill>Copied property to clipboard</ToastPill>
              <ToastPill icon="trash" action="Undo">Moved to Trash</ToastPill>
              <ToastPill tone="danger" onClose={() => {}}>Couldn't save changes</ToastPill>
              <ToastDemo />
            </div>
          </Cell>
        </div>
        <div className="flex flex-col gap-8">
          <Cell label="Confirm dialog (static, over underlay)">
            <div className="relative flex h-[260px] w-[520px] items-center justify-center overflow-hidden rounded-n-lg">
              <DialogOverlay className="absolute z-0" />
              <DialogSurface width={300} className="relative">
                <ConfirmDialogBody title="Are you sure you want to delete this page from Trash?" confirmLabel="Yes. Delete this page" />
              </DialogSurface>
            </div>
          </Cell>
          <Cell label="Dialog surface (settings-modal shape)">
            <DialogSurface width={520} height={180} className="flex">
              <div className="w-[180px] bg-n-bg-secondary p-3 text-[12px] font-medium text-n-text-secondary">Account</div>
              <div className="flex flex-1 flex-col gap-1 p-6">
                <div className="text-[20px] font-semibold text-n-text-primary">Preferences</div>
                <div className="text-[14px] text-n-text-primary">Choose how you want Motion to look and behave</div>
                <div className="mt-2"><Badge>Beta</Badge></div>
              </div>
            </DialogSurface>
          </Cell>
          <Cell label="interactive: Dialog / ConfirmDialog / ⌘K">
            <div className="flex flex-wrap gap-2">
              <Dialog.Root>
                <Dialog.Trigger asChild><Button variant="secondary">Open dialog</Button></Dialog.Trigger>
                <Dialog.Content size="md">
                  <Dialog.Title>Dialog title</Dialog.Title>
                  <Dialog.Description>Centered modal over the smoke underlay. Esc or click outside to close.</Dialog.Description>
                  <Dialog.Footer>
                    <Dialog.Close asChild><Button variant="secondary">Cancel</Button></Dialog.Close>
                    <Dialog.Close asChild><Button variant="primary">Save</Button></Dialog.Close>
                  </Dialog.Footer>
                </Dialog.Content>
              </Dialog.Root>
              <ConfirmDialog trigger={<Button variant="danger-ghost">Delete page…</Button>} title="Are you sure you want to delete this page?" onConfirm={() => new Promise<void>((r) => setTimeout(r, 1200))} />
              <Sheet.Root>
                <Sheet.Trigger asChild><Button variant="secondary">Open sheet</Button></Sheet.Trigger>
                <Sheet.Content side="right" size="md">
                  <Sheet.Title>Filters</Sheet.Title>
                  <Sheet.Description>Narrow the list down.</Sheet.Description>
                  <div className="h-[900px]" />
                  <Sheet.Footer>
                    <Sheet.Close asChild><Button variant="secondary">Cancel</Button></Sheet.Close>
                    <Sheet.Close asChild><Button variant="primary">Apply</Button></Sheet.Close>
                  </Sheet.Footer>
                </Sheet.Content>
              </Sheet.Root>
              <Sheet.Root>
                <Sheet.Trigger asChild><Button variant="secondary">Bottom sheet</Button></Sheet.Trigger>
                <Sheet.Content side="bottom" size="sm">
                  <Sheet.Title>Share</Sheet.Title>
                  <Sheet.Description>Bottom sheet, 40% of the viewport.</Sheet.Description>
                </Sheet.Content>
              </Sheet.Root>
              <Button variant="secondary" onClick={() => setOpen(true)}>Search (⌘K)</Button>
              <CommandPaletteDialog open={open} onOpenChange={setOpen} groups={groups} placeholder="Search or ask a question in Design Team…" />
            </div>
          </Cell>
        </div>
      </div>
    </ToastProvider>
  );
}

const SECTIONS: Record<string, () => ReactNode> = { menus: Menus, pickers: Pickers, search: Search, overlays: Overlays };

export default function ComponentsLab() {
  const [s, setS] = useState(section);
  useEffect(() => {
    const on = () => setS(section());
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  const keys = s && SECTIONS[s] ? [s] : Object.keys(SECTIONS);
  return (
    <div className="flex flex-col gap-12 p-6">
      {keys.map((k) => {
        const C = SECTIONS[k];
        return <section key={k}>{keys.length > 1 && <h2 className="mb-4 text-n-h3 font-semibold">{k}</h2>}<C /></section>;
      })}
    </div>
  );
}
