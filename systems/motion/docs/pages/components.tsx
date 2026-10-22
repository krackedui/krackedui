// Component pages (menus, overlays, navigation, feedback, pickers): live previews import straight from @krackedui/motion.
// Overlays show twice where useful: frozen open on their static surface (MenuSurface, PopoverSurface, DialogSurface)
// so the page shows the look without a click, and as an interactive example with a trigger.
import { useState } from 'react';
import {
  Breadcrumbs, BreadcrumbAccess, Button, ColorGrid, ColorMenuList, CommandPalette, CommandPaletteDialog,
  ConfirmDialog, ConfirmDialogBody, ContextMenu, Dialog, DialogSurface, EmojiPicker, IconButton, Menu,
  MenuFooter, MenuList, MenuRow, MenuSearch, MenuSurface, Popover, PopoverSurface, SharePopover, Sheet, Steps, Tabs,
  TextInput, ToastPill, ToastProvider, useToast,
  type ColorValue, type CommandGroup,
} from '@krackedui/motion';
import type { DocPage, Example, InstallStep, NavGroup, PropDef, Section } from '../../../../apps/docs/lib/types';

/* ---------------------------------------------------------------- helpers */

const row = 'flex flex-wrap items-center justify-center gap-3';

const install = (names: string, usage: string): InstallStep[] => [
  { title: 'Install the design system package:', packages: ['@krackedui/motion'] },
  {
    title: 'Import the styles once (e.g. in your root layout or entry file):',
    file: { filename: '/app/layout.tsx', lang: 'tsx', code: `import '@krackedui/motion/styles.css';` },
  },
  {
    title: 'Import the parts and render them inside `<Theme>`:',
    file: { filename: '/app/page.tsx', lang: 'tsx', code: `import { Theme, ${names} } from '@krackedui/motion';\n\n${usage}` },
  },
];

const composition = (code: string, notes: string[] = []): Section => ({
  title: 'Composition',
  blocks: [{ code: { filename: 'anatomy.tsx', lang: 'tsx', code } }, ...(notes.length ? [{ list: notes }] : [])],
});
const a11y = (items: string[]): Section => ({ title: 'Accessibility', placement: 'end', blocks: [{ list: items }] });
const usage = (items: string[]): Section => ({ title: 'Usage', placement: 'end', blocks: [{ list: items }] });

const motionNote = 'Opens and closes with the shared motion layer (`styles/motion.css`); with `prefers-reduced-motion: reduce` it only fades.';

/** Radix props shared by every popper `Content`. */
const popperProps = (sideOffset: string, align: string): PropDef[] => [
  { name: 'side', type: ['"top"', '"right"', '"bottom"', '"left"'], default: '"bottom"', description: 'Preferred side of the trigger; flips when there is no room.' },
  { name: 'sideOffset', type: 'number', default: sideOffset, description: 'Distance from the trigger in px.' },
  { name: 'align', type: ['"start"', '"center"', '"end"'], default: align, description: 'Alignment against the trigger.' },
  { name: 'alignOffset', type: 'number', default: '0', description: 'Offset from the aligned edge in px.' },
  { name: 'avoidCollisions', type: 'boolean', default: 'true', description: 'Flip / shift to stay inside the viewport.' },
  { name: 'collisionPadding', type: 'number | Partial<Record<Side, number>>', default: '8', description: 'Space kept between the content and the viewport edges.' },
  { name: 'onEscapeKeyDown', type: '(event: KeyboardEvent) => void', description: 'Called on Escape; `preventDefault()` keeps it open.' },
  { name: 'onPointerDownOutside', type: '(event: PointerDownOutsideEvent) => void', description: 'Called on a pointer down outside.' },
  { name: 'onCloseAutoFocus', type: '(event: Event) => void', description: 'Called when focus returns to the trigger; `preventDefault()` keeps focus where it is.' },
  { name: 'forceMount', type: 'true', description: 'Keep mounted while closed.' },
];

const openProps = (what: string, modalDefault = 'true'): PropDef[] => [
  { name: 'open', type: 'boolean', description: `Controlled open state of the ${what}.` },
  { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Initial open state when uncontrolled.' },
  { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when the open state changes.' },
  { name: 'modal', type: 'boolean', default: modalDefault, description: 'Block outside interaction and scrolling while open.' },
];

const rowContentProps: PropDef[] = [
  { name: 'icon', type: 'IconName | ReactNode', description: 'Leading 20px icon: an icon name, or any node (emoji, avatar, swatch).' },
  { name: 'children', type: 'ReactNode', description: 'Row label (truncates).' },
  { name: 'description', type: 'ReactNode', description: 'Right-side value in tertiary text, before the chevron ("Comments").' },
  { name: 'caption', type: 'ReactNode', description: 'Second line under the label; the row grows from 28px.' },
  { name: 'shortcut', type: 'ReactNode', description: 'Right-aligned 12px keyboard hint ("⌘L"). Shown only; wire the key yourself.' },
  { name: 'submenu', type: 'boolean', default: 'false', description: 'Show a trailing chevron.' },
  { name: 'checked', type: 'boolean', default: 'false', description: 'Trailing checkmark (a selected option).' },
  { name: 'toggle', type: 'boolean', description: 'Draw a switch on the right with this on/off value.' },
  { name: 'trailing', type: 'ReactNode', description: 'Any extra right-side content (badge, count).' },
];
const toneProp: PropDef = {
  name: 'tone', type: ['"default"', '"danger"', '"accent"', '"muted"'], default: '"default"',
  description: '`danger` turns red on hover/highlight, `accent` is blue, `muted` is secondary text.',
};
const itemRadix: PropDef[] = [
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Skip in keyboard navigation and ignore clicks.' },
  { name: 'onSelect', type: '(event: Event) => void', description: 'Called when chosen (click, Enter, Space). `event.preventDefault()` keeps the menu open.' },
  { name: 'textValue', type: 'string', description: 'Text used for typeahead when the label is not plain text.' },
];
const indicatorRowProps = rowContentProps.filter((p) => ['icon', 'children', 'description', 'caption', 'shortcut'].includes(p.name));

const ex = (e: Example): Example => e;

/* ================================================================ Menu */

function MenuDemo() {
  const [wrap, setWrap] = useState(true);
  const [sort, setSort] = useState('edited');
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <IconButton icon="more" label="Page actions" />
      </Menu.Trigger>
      <Menu.Content width={240} align="end">
        <Menu.Item icon="link" shortcut="⌘L">Copy link</Menu.Item>
        <Menu.Item icon="copy" shortcut="⌘D">Duplicate</Menu.Item>
        <Menu.Sub>
          <Menu.SubTrigger icon="share">Share to</Menu.SubTrigger>
          <Menu.SubContent width={180}>
            <Menu.Item>Email</Menu.Item>
            <Menu.Item>Chat</Menu.Item>
          </Menu.SubContent>
        </Menu.Sub>
        <Menu.Separator />
        <Menu.CheckboxItem checked={wrap} onCheckedChange={setWrap}>Wrap text</Menu.CheckboxItem>
        <Menu.Separator />
        <Menu.Label>Sort by</Menu.Label>
        <Menu.RadioGroup value={sort} onValueChange={setSort}>
          <Menu.RadioItem value="edited">Last edited</Menu.RadioItem>
          <Menu.RadioItem value="created">Created</Menu.RadioItem>
          <Menu.RadioItem value="title">Title</Menu.RadioItem>
        </Menu.RadioGroup>
        <Menu.Separator />
        <Menu.Item icon="trash" destructive>Delete</Menu.Item>
      </Menu.Content>
    </Menu.Root>
  );
}
const menuDemoCode = `import { useState } from 'react';
import { IconButton, Menu } from '@krackedui/motion';

export function PageMenu() {
  const [wrap, setWrap] = useState(true);
  const [sort, setSort] = useState('edited');
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <IconButton icon="more" label="Page actions" />
      </Menu.Trigger>
      <Menu.Content width={240} align="end">
        <Menu.Item icon="link" shortcut="⌘L">Copy link</Menu.Item>
        <Menu.Item icon="copy" shortcut="⌘D">Duplicate</Menu.Item>
        <Menu.Sub>
          <Menu.SubTrigger icon="share">Share to</Menu.SubTrigger>
          <Menu.SubContent width={180}>
            <Menu.Item>Email</Menu.Item>
            <Menu.Item>Chat</Menu.Item>
          </Menu.SubContent>
        </Menu.Sub>
        <Menu.Separator />
        <Menu.CheckboxItem checked={wrap} onCheckedChange={setWrap}>Wrap text</Menu.CheckboxItem>
        <Menu.Separator />
        <Menu.Label>Sort by</Menu.Label>
        <Menu.RadioGroup value={sort} onValueChange={setSort}>
          <Menu.RadioItem value="edited">Last edited</Menu.RadioItem>
          <Menu.RadioItem value="created">Created</Menu.RadioItem>
          <Menu.RadioItem value="title">Title</Menu.RadioItem>
        </Menu.RadioGroup>
        <Menu.Separator />
        <Menu.Item icon="trash" destructive>Delete</Menu.Item>
      </Menu.Content>
    </Menu.Root>
  );
}`;

function ActionsMenuDemo() {
  const [offline, setOffline] = useState(false);
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="secondary" trailingIcon="chevronDown">Actions</Button>
      </Menu.Trigger>
      <Menu.Content
        width={256}
        header={<Menu.Search placeholder="Search actions…" />}
        footer={<Menu.Footer lines={['130 words', 'Edited today at 4:55 PM']} />}
      >
        <Menu.Item icon="link" shortcut="⌘L">Copy link</Menu.Item>
        <Menu.Item icon="bell" description="Comments" submenu>Notify me</Menu.Item>
        <Menu.ToggleItem icon="download" checked={offline} onCheckedChange={setOffline}>Available offline</Menu.ToggleItem>
      </Menu.Content>
    </Menu.Root>
  );
}
const actionsMenuCode = `import { useState } from 'react';
import { Button, Menu } from '@krackedui/motion';

export function ActionsMenu() {
  const [offline, setOffline] = useState(false);
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="secondary" trailingIcon="chevronDown">Actions</Button>
      </Menu.Trigger>
      <Menu.Content
        width={256}
        header={<Menu.Search placeholder="Search actions…" />}
        footer={<Menu.Footer lines={['130 words', 'Edited today at 4:55 PM']} />}
      >
        <Menu.Item icon="link" shortcut="⌘L">Copy link</Menu.Item>
        <Menu.Item icon="bell" description="Comments" submenu>Notify me</Menu.Item>
        <Menu.ToggleItem icon="download" checked={offline} onCheckedChange={setOffline}>Available offline</Menu.ToggleItem>
      </Menu.Content>
    </Menu.Root>
  );
}`;

function StaticMenu() {
  const [locked, setLocked] = useState(false);
  return (
    <MenuSurface width={256}>
      <MenuSearch placeholder="Search actions…" />
      <MenuList aria-label="Page actions">
        <MenuRow icon="link" shortcut="⌘L" highlighted>Copy link</MenuRow>
        <MenuRow icon="copy" shortcut="⌘D">Duplicate</MenuRow>
      </MenuList>
      <MenuList separator aria-label="Page settings">
        <MenuRow icon="lock" toggle={locked} onToggle={setLocked}>Lock page</MenuRow>
        <MenuRow icon="trash" tone="danger">Move to Trash</MenuRow>
      </MenuList>
      <MenuFooter lines={['130 words', 'Edited today at 4:55 PM']} />
    </MenuSurface>
  );
}
const staticMenuCode = `import { useState } from 'react';
import { MenuFooter, MenuList, MenuRow, MenuSearch, MenuSurface } from '@krackedui/motion';

// The menu look without Radix behavior: for custom pickers that manage their own keyboard focus.
export function StaticMenu() {
  const [locked, setLocked] = useState(false);
  return (
    <MenuSurface width={256}>
      <MenuSearch placeholder="Search actions…" />
      <MenuList aria-label="Page actions">
        <MenuRow icon="link" shortcut="⌘L" highlighted>Copy link</MenuRow>
        <MenuRow icon="copy" shortcut="⌘D">Duplicate</MenuRow>
      </MenuList>
      <MenuList separator aria-label="Page settings">
        <MenuRow icon="lock" toggle={locked} onToggle={setLocked}>Lock page</MenuRow>
        <MenuRow icon="trash" tone="danger">Move to Trash</MenuRow>
      </MenuList>
      <MenuFooter lines={['130 words', 'Edited today at 4:55 PM']} />
    </MenuSurface>
  );
}`;

const menuParts = (P: 'Menu' | 'ContextMenu') => [
  {
    name: `${P}.Item`,
    description: 'An action row.',
    props: [...rowContentProps, toneProp, { name: 'destructive', type: 'boolean', default: 'false', description: 'Destructive action (delete, remove): same as `tone="danger"`.' }, ...itemRadix],
  },
  {
    name: `${P}.CheckboxItem`,
    description: 'An on/off option (`menuitemcheckbox`) with a trailing checkmark when checked.',
    props: [
      ...indicatorRowProps,
      { name: 'checked', type: 'boolean | "indeterminate"', description: 'Checked state.' },
      { name: 'onCheckedChange', type: '(checked: boolean) => void', description: 'Called with the new state.' },
      ...itemRadix,
    ],
  },
  {
    name: `${P}.RadioGroup`,
    description: 'Groups `RadioItem`s; exactly one is selected.',
    props: [
      { name: 'value', type: 'string', description: 'The selected item value.' },
      { name: 'onValueChange', type: '(value: string) => void', description: 'Called with the newly selected value.' },
    ],
  },
  {
    name: `${P}.RadioItem`,
    description: 'One option of a `RadioGroup` (`menuitemradio`), checkmark when selected.',
    props: [...indicatorRowProps, { name: 'value', type: 'string', description: 'Required. Value reported to the group.' }, ...itemRadix],
  },
  {
    name: `${P}.ToggleItem`,
    description: 'Motion extra: an on/off row drawn with a switch. Keeps the menu open when toggled.',
    props: [
      ...rowContentProps.filter((p) => ['icon', 'children', 'description', 'caption'].includes(p.name)),
      { name: 'checked', type: 'boolean', description: 'On/off state.' },
      { name: 'onCheckedChange', type: '(checked: boolean) => void', description: 'Called with the new state.' },
      ...itemRadix,
    ],
  },
  {
    name: `${P}.Sub`,
    description: 'Wraps a submenu (`SubTrigger` + `SubContent`).',
    props: openProps('submenu').slice(0, 3),
  },
  {
    name: `${P}.SubTrigger`,
    description: 'Row that opens a submenu (→ or Enter opens, ← closes). Draws the chevron itself.',
    props: [
      ...rowContentProps.filter((p) => ['icon', 'children', 'description', 'caption'].includes(p.name)),
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the submenu.' },
      { name: 'textValue', type: 'string', description: 'Typeahead text.' },
    ],
  },
  {
    name: `${P}.SubContent`,
    description: 'The submenu surface (portalled).',
    props: [
      { name: 'width', type: 'number', description: 'Fixed width in px (never wider than the viewport minus 16px).' },
      { name: 'sideOffset', type: 'number', default: '2', description: 'Gap from the parent menu.' },
      { name: 'collisionPadding', type: 'number', default: '8', description: 'Space kept from the viewport edges.' },
    ],
  },
  { name: `${P}.Label / Separator / Group`, description: 'Section label, hairline separator and a grouping wrapper.', props: [{ name: 'className', type: 'string', description: 'Extra classes.' }] },
  {
    name: `${P}.Search / ${P}.Footer`,
    description: '`Search`: filter field for the `header` slot (its accessible name defaults to the placeholder). `Footer`: grey metadata lines for the `footer` slot.',
    props: [
      { name: 'noIcon', type: 'boolean', default: 'false', description: 'Search: hide the magnifier.' },
      { name: 'wrapperClassName', type: 'string', description: 'Search: classes for the padded wrapper.' },
      { name: 'lines', type: 'ReactNode[]', description: 'Footer: one 12/16 line each.' },
      { name: 'separator', type: 'boolean', default: 'true', description: 'Footer: draw the inset divider above.' },
    ],
  },
];

export const menuPage: DocPage = {
  eyebrow: 'Navigation',
  title: 'Menu',
  description: 'Dropdown menu of actions opened from a button: items with icons and shortcuts, checkbox and radio options, submenus, a search header and a metadata footer.',
  links: [{ label: 'Radix DropdownMenu', href: 'https://www.radix-ui.com/primitives/docs/components/dropdown-menu' }],
  hero: ex({ title: 'Menu', render: () => <MenuDemo />, code: menuDemoCode }),
  install: install('Menu', `<Theme>\n  <Menu.Root>\n    <Menu.Trigger asChild><button>Open</button></Menu.Trigger>\n    <Menu.Content>\n      <Menu.Item icon="link">Copy link</Menu.Item>\n    </Menu.Content>\n  </Menu.Root>\n</Theme>`),
  sections: [
    composition(`<Menu.Root>
  <Menu.Trigger asChild>…</Menu.Trigger>
  <Menu.Content header={<Menu.Search />} footer={<Menu.Footer />}>
    <Menu.Label />
    <Menu.Item />
    <Menu.CheckboxItem />
    <Menu.RadioGroup><Menu.RadioItem /></Menu.RadioGroup>
    <Menu.Sub><Menu.SubTrigger /><Menu.SubContent>…</Menu.SubContent></Menu.Sub>
    <Menu.Separator />
  </Menu.Content>
</Menu.Root>`, [
      'Every part also has a flat alias for Server Components: `MenuRoot`, `MenuItem`, `MenuCheckboxItem`…',
      '`MenuSurface`, `MenuList`, `MenuRow`, `MenuLabel`, `MenuSeparator` are the same look without behavior, for pickers that manage focus themselves.',
    ]),
    a11y([
      'Follows the WAI-ARIA menu button pattern: the trigger has `aria-haspopup="menu"` and `aria-expanded`.',
      'Enter, Space or ↓ on the trigger opens the menu and focuses the first item; ↑ opens it on the last item.',
      '↑/↓ move between items (wrapping), Home/End jump to the ends, typing a letter jumps to the matching item.',
      'Enter or Space activates the item; → opens a submenu, ← or Escape closes it. Escape closes the menu and returns focus to the trigger.',
      'Checkbox and radio items expose `menuitemcheckbox` / `menuitemradio` with `aria-checked`.',
      'Static parts: `MenuList` is a `listbox` (give it an `aria-label`) of `MenuRow` options; a `toggle` row is an option with `aria-checked`. Rows are not Tab stops by default and a click keeps focus in the field driving the list (`aria-activedescendant` pickers); pass `tabIndex={0}` to make an actionable row a Tab stop that Enter / Space activate.',
      'Content is collision-aware: it flips and shifts to stay 8px inside the viewport and scrolls when taller than the space left.',
      `Rows are 28px tall, above the 24px minimum target. ${motionNote}`,
    ]),
    usage([
      'Use for a short list of actions or view options attached to a button ("…", "Sort", "Actions").',
      'Use `CheckboxItem` for independent on/off options and `RadioGroup` + `RadioItem` for one-of-many choices.',
      'Mark destructive actions with `destructive` and put them last, after a separator.',
      'Don\'t use a menu to pick a form value: use Select or Combobox, which work with forms and labels.',
      'Don\'t put long or searchable lists in a menu: use CommandPalette.',
      'Shortcut hints are display-only: register the keyboard shortcut yourself.',
    ]),
  ],
  examples: [
    ex({ title: 'Checkbox, radio and submenu', description: 'Options keep their state outside the menu; submenus open on → or hover.', render: () => <MenuDemo />, code: menuDemoCode }),
    ex({ title: 'Search header, toggle rows and footer', description: '`header` / `footer` slots sit outside the item list. `ToggleItem` is the switch row and keeps the menu open.', render: () => <ActionsMenuDemo />, code: actionsMenuCode }),
    ex({ title: 'Static surface', description: 'The same look without behavior, for custom pickers and previews.', render: () => <StaticMenu />, code: staticMenuCode }),
  ],
  api: [
    { name: 'Menu.Root', description: 'Holds the open state.', props: openProps('menu') },
    { name: 'Menu.Trigger', description: 'The button that opens the menu.', props: [{ name: 'asChild', type: 'boolean', default: 'false', description: 'Use your own element (e.g. an `IconButton`) as the trigger.' }] },
    {
      name: 'Menu.Content',
      description: 'The floating menu (portalled to `body`).',
      props: [
        { name: 'width', type: 'number', description: 'Fixed width in px (never wider than the viewport minus 16px). Default: fits content, min 180.' },
        { name: 'header', type: 'ReactNode', description: 'Content above the item list, e.g. `<Menu.Search />`.' },
        { name: 'footer', type: 'ReactNode', description: 'Content below the item list, e.g. `<Menu.Footer />`.' },
        ...popperProps('4', '"start"'),
        { name: 'loop', type: 'boolean', default: 'false', description: 'Wrap keyboard focus from last to first item.' },
      ],
    },
    ...menuParts('Menu'),
    { name: 'MenuSurface', description: 'Static menu card.', props: [{ name: 'width', type: 'number', description: 'Fixed width in px.' }] },
    { name: 'MenuList', description: 'Static section (role listbox; give it an `aria-label`) with 4px padding. A `<div>`: all its props pass through.', props: [{ name: 'separator', type: 'boolean', default: 'false', description: 'Draw the inset divider above this section.' }] },
    {
      name: 'MenuRow',
      description: 'Static row (role option; a `toggle` row adds `aria-checked`). A `<div>`: pass `tabIndex={0}` to make an actionable row a Tab stop (Enter / Space click it).',
      props: [
        ...rowContentProps,
        toneProp,
        { name: 'highlighted', type: 'boolean', default: 'false', description: 'Draw the highlighted (keyboard position) state.' },
        { name: 'onToggle', type: '(next: boolean) => void', description: 'Called with the new value when a `toggle` row is clicked.' },
      ],
    },
    { name: 'MenuSwitch', description: 'The purely visual switch drawn by toggle rows.', props: [{ name: 'checked', type: 'boolean', default: 'false', description: 'On/off.' }] },
    {
      name: 'MenuSearch',
      description: 'Search field for the top of a static menu or `Menu.Content header`: an `<input type="search">` (all input props pass through) in a 12px-padded wrapper. Its accessible name defaults to the placeholder.',
      props: [
        { name: 'noIcon', type: 'boolean', default: 'false', description: 'Hide the leading magnifier.' },
        { name: 'wrapperClassName', type: 'string', description: 'Classes for the padded wrapper.' },
      ],
    },
    {
      name: 'SearchField',
      description: 'The same 28px search input without the wrapper padding, for toolbars and custom pickers. All `<input>` props pass through.',
      props: [{ name: 'noIcon', type: 'boolean', default: 'false', description: 'Hide the leading magnifier.' }],
    },
    {
      name: 'MenuFooter',
      description: 'Grey metadata lines at the bottom of a menu ("130 words", "Edited today"). A `<div>`: all its props pass through.',
      props: [
        { name: 'lines', type: 'ReactNode[]', description: 'One 12px line each.' },
        { name: 'separator', type: 'boolean', default: 'true', description: 'Draw the inset divider above.' },
      ],
    },
    {
      name: 'MenuLabel / MenuSeparator / MenuBadge',
      description: 'Static section label (12px, secondary), hairline separator (`role="separator"`), and the accent "New" pill for rows. Plain elements: all HTML props pass through.',
      props: [{ name: 'className', type: 'string', description: 'Merged with `cn`.' }],
    },
  ],
};

/* ================================================================ ContextMenu */

function ContextMenuDemo() {
  const [pinned, setPinned] = useState(false);
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger className="flex h-28 w-full max-w-72 items-center justify-center rounded-n-lg text-[14px] text-n-text-secondary shadow-[inset_0_0_0_1px_var(--n-border-primary)]">
        Right-click (or long-press) here
      </ContextMenu.Trigger>
      <ContextMenu.Content width={220}>
        <ContextMenu.Item icon="link" shortcut="⌘L">Copy link</ContextMenu.Item>
        <ContextMenu.Item icon="edit">Rename</ContextMenu.Item>
        <ContextMenu.CheckboxItem checked={pinned} onCheckedChange={setPinned}>Pinned</ContextMenu.CheckboxItem>
        <ContextMenu.Separator />
        <ContextMenu.Item icon="trash" destructive>Delete</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}
const contextMenuCode = `import { useState } from 'react';
import { ContextMenu } from '@krackedui/motion';

export function FileContextMenu() {
  const [pinned, setPinned] = useState(false);
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger className="flex h-28 w-full max-w-72 items-center justify-center rounded-n-lg text-[14px] text-n-text-secondary shadow-[inset_0_0_0_1px_var(--n-border-primary)]">
        Right-click (or long-press) here
      </ContextMenu.Trigger>
      <ContextMenu.Content width={220}>
        <ContextMenu.Item icon="link" shortcut="⌘L">Copy link</ContextMenu.Item>
        <ContextMenu.Item icon="edit">Rename</ContextMenu.Item>
        <ContextMenu.CheckboxItem checked={pinned} onCheckedChange={setPinned}>Pinned</ContextMenu.CheckboxItem>
        <ContextMenu.Separator />
        <ContextMenu.Item icon="trash" destructive>Delete</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}`;

export const contextMenuPage: DocPage = {
  eyebrow: 'Navigation',
  title: 'Context Menu',
  description: 'Right-click menu with the same parts and look as Menu, opened at the pointer.',
  links: [{ label: 'Radix ContextMenu', href: 'https://www.radix-ui.com/primitives/docs/components/context-menu' }],
  hero: ex({ title: 'Context menu', render: () => <ContextMenuDemo />, code: contextMenuCode }),
  install: install('ContextMenu', `<Theme>\n  <ContextMenu.Root>\n    <ContextMenu.Trigger>Right-click me</ContextMenu.Trigger>\n    <ContextMenu.Content>\n      <ContextMenu.Item>Rename</ContextMenu.Item>\n    </ContextMenu.Content>\n  </ContextMenu.Root>\n</Theme>`),
  sections: [
    composition(`<ContextMenu.Root>
  <ContextMenu.Trigger>…area…</ContextMenu.Trigger>
  <ContextMenu.Content>
    <ContextMenu.Item />  <ContextMenu.CheckboxItem />  <ContextMenu.RadioGroup />  <ContextMenu.Sub />
  </ContextMenu.Content>
</ContextMenu.Root>`, ['Same item parts and props as Menu (`Item`, `CheckboxItem`, `RadioGroup`, `RadioItem`, `ToggleItem`, `Label`, `Separator`, `Group`, `Sub`, `SubTrigger`, `SubContent`).']),
    a11y([
      'Follows the WAI-ARIA menu pattern. Opens on right-click, long-press on touch, or the context menu key / Shift+F10 while the trigger area has focus.',
      'Focus moves into the menu; ↑/↓, Home/End, typeahead, Enter/Space, → / ← for submenus, Escape to close.',
      'Stays inside the viewport (8px collision padding) and scrolls when it is taller than the space left.',
      motionNote,
    ]),
    usage([
      'Use as a shortcut to actions that are also available elsewhere (a Menu button, a toolbar).',
      'Don\'t hide the only way to do something in a context menu: it is invisible until discovered, and harder on touch.',
      'Keep it short and in the same order as the matching Menu.',
    ]),
  ],
  examples: [ex({ title: 'Right-click area', render: () => <ContextMenuDemo />, code: contextMenuCode })],
  api: [
    {
      name: 'ContextMenu.Root',
      description: 'Holds the open state (opened by the pointer, so only `onOpenChange`).',
      props: [
        { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when the menu opens or closes.' },
        { name: 'modal', type: 'boolean', default: 'true', description: 'Block outside interaction while open.' },
      ],
    },
    {
      name: 'ContextMenu.Trigger',
      description: 'The area that opens the menu.',
      props: [
        { name: 'asChild', type: 'boolean', default: 'false', description: 'Use your own element as the area.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Let the native context menu through.' },
      ],
    },
    {
      name: 'ContextMenu.Content',
      description: 'The floating menu, positioned at the pointer.',
      props: [
        { name: 'width', type: 'number', description: 'Fixed width in px.' },
        { name: 'header', type: 'ReactNode', description: 'Content above the item list.' },
        { name: 'footer', type: 'ReactNode', description: 'Content below the item list.' },
        { name: 'side', type: ['"top"', '"right"', '"bottom"', '"left"'], description: 'Accepted for API parity with Menu; a context menu always opens at the pointer.' },
        { name: 'align', type: ['"start"', '"center"', '"end"'], description: 'Accepted for API parity with Menu; a context menu always opens at the pointer.' },
        { name: 'collisionPadding', type: 'number', default: '8', description: 'Space kept from the viewport edges.' },
        { name: 'alignOffset', type: 'number', default: '0', description: 'Offset from the pointer in px.' },
        { name: 'loop', type: 'boolean', default: 'false', description: 'Wrap keyboard focus.' },
      ],
    },
    ...menuParts('ContextMenu'),
  ],
};

/* ================================================================ Popover */

function RenamePopover() {
  const [name, setName] = useState('Roadmap');
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="secondary" icon="edit">Rename</Button>
      </Popover.Trigger>
      <Popover.Content width={280} aria-label="Rename page" className="flex flex-col gap-3 p-3">
        <TextInput aria-label="Page name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex justify-end gap-2">
          <Popover.Close asChild><Button variant="ghost">Cancel</Button></Popover.Close>
          <Popover.Close asChild><Button variant="primary">Save</Button></Popover.Close>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}
const renamePopoverCode = `import { useState } from 'react';
import { Button, Popover, TextInput } from '@krackedui/motion';

export function RenamePopover() {
  const [name, setName] = useState('Roadmap');
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="secondary" icon="edit">Rename</Button>
      </Popover.Trigger>
      <Popover.Content width={280} aria-label="Rename page" className="flex flex-col gap-3 p-3">
        <TextInput aria-label="Page name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex justify-end gap-2">
          <Popover.Close asChild><Button variant="ghost">Cancel</Button></Popover.Close>
          <Popover.Close asChild><Button variant="primary">Save</Button></Popover.Close>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}`;

function SidesPopover() {
  return (
    <div className={row}>
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Popover.Root key={side}>
          <Popover.Trigger asChild><Button variant="secondary">{side}</Button></Popover.Trigger>
          <Popover.Content side={side} align="center" className="p-3 text-[14px]" aria-label={`Popover on the ${side}`}>
            Opens on the {side}.
          </Popover.Content>
        </Popover.Root>
      ))}
    </div>
  );
}
const sidesPopoverCode = `import { Button, Popover } from '@krackedui/motion';

export function SidesPopover() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Popover.Root key={side}>
          <Popover.Trigger asChild><Button variant="secondary">{side}</Button></Popover.Trigger>
          <Popover.Content side={side} align="center" className="p-3 text-[14px]" aria-label={\`Popover on the \${side}\`}>
            Opens on the {side}.
          </Popover.Content>
        </Popover.Root>
      ))}
    </div>
  );
}`;

export const popoverPage: DocPage = {
  eyebrow: 'Overlays',
  title: 'Popover',
  description: 'Floating panel anchored to a trigger, for pickers, small forms and details. Collision-aware and animated.',
  links: [{ label: 'Radix Popover', href: 'https://www.radix-ui.com/primitives/docs/components/popover' }],
  hero: ex({ title: 'Popover', render: () => <RenamePopover />, code: renamePopoverCode }),
  install: install('Popover', `<Theme>\n  <Popover.Root>\n    <Popover.Trigger asChild><button>Open</button></Popover.Trigger>\n    <Popover.Content className="p-3">…</Popover.Content>\n  </Popover.Root>\n</Theme>`),
  sections: [
    composition(`<Popover.Root>
  <Popover.Trigger asChild>…</Popover.Trigger>   {/* or <Popover.Anchor> to position against another element */}
  <Popover.Content>
    …
    <Popover.Close asChild>…</Popover.Close>
  </Popover.Content>
</Popover.Root>`),
    a11y([
      'Follows the WAI-ARIA dialog (non-modal) pattern: the content has `role="dialog"`; the trigger has `aria-expanded` and `aria-controls`.',
      'Opening moves focus to the first focusable element inside; Tab moves within the page as usual.',
      'Escape, an outside click or `Popover.Close` closes it, and focus returns to the trigger.',
      'Give content without a visible heading an `aria-label`.',
      `Collision-aware (8px from the viewport edges), never wider than the viewport minus 16px; scrolls when taller than the space left. ${motionNote}`,
    ]),
    usage([
      'Use for small, contextual tasks: rename, pick a date or color, adjust a filter.',
      'Use Menu for a list of actions and Tooltip for a short non-interactive hint.',
      'Use Dialog when the task needs full attention or has several steps.',
    ]),
  ],
  examples: [
    ex({ title: 'Small form', render: () => <RenamePopover />, code: renamePopoverCode }),
    ex({ title: 'Sides', description: 'Choose a preferred side; it flips when there is not enough room.', render: () => <SidesPopover />, code: sidesPopoverCode }),
    ex({
      title: 'Static surface',
      render: () => <PopoverSurface width={240} className="p-3 text-[14px] text-n-text-secondary">A popover card without positioning or behavior.</PopoverSurface>,
      code: `import { PopoverSurface } from '@krackedui/motion';\n\nexport function Card() {\n  return <PopoverSurface width={240} className="p-3 text-[14px] text-n-text-secondary">A popover card without positioning or behavior.</PopoverSurface>;\n}`,
    }),
  ],
  api: [
    { name: 'Popover.Root', description: 'Holds the open state.', props: openProps('popover', 'false') },
    { name: 'Popover.Trigger', description: 'The element that toggles the popover.', props: [{ name: 'asChild', type: 'boolean', default: 'false', description: 'Use your own element as the trigger.' }] },
    { name: 'Popover.Anchor', description: 'Optional element to position against instead of the trigger.', props: [{ name: 'asChild', type: 'boolean', default: 'false', description: 'Use your own element as the anchor.' }] },
    {
      name: 'Popover.Content',
      description: 'The floating panel (portalled).',
      props: [
        { name: 'width', type: 'number', description: 'Fixed width in px (never wider than the viewport minus 16px).' },
        { name: 'radius', type: ['"md"', '"lg"'], default: '"md"', description: '10px or 12px corners.' },
        ...popperProps('4', '"start"'),
        { name: 'onOpenAutoFocus', type: '(event: Event) => void', description: 'Called when focus moves in on open; `preventDefault()` keeps focus on the trigger.' },
      ],
    },
    { name: 'Popover.Close', description: 'Closes the popover.', props: [{ name: 'asChild', type: 'boolean', default: 'false', description: 'Use your own button.' }] },
    {
      name: 'PopoverSurface',
      description: 'Static popover card.',
      props: [
        { name: 'width', type: 'number', description: 'Fixed width in px.' },
        { name: 'radius', type: ['"md"', '"lg"'], default: '"md"', description: '10px or 12px corners.' },
      ],
    },
  ],
};

/* ================================================================ Dialog */

function DialogDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="secondary">Edit profile</Button>
      </Dialog.Trigger>
      <Dialog.Content size="sm">
        <Dialog.Title>Edit profile</Dialog.Title>
        <Dialog.Description>Your name is shown on pages you edit.</Dialog.Description>
        <TextInput aria-label="Name" defaultValue="Ada Lovelace" className="mt-2" />
        <Dialog.Footer>
          <Dialog.Close asChild><Button variant="secondary">Cancel</Button></Dialog.Close>
          <Dialog.Close asChild><Button variant="primary">Save</Button></Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}
const dialogCode = `import { Button, Dialog, TextInput } from '@krackedui/motion';

export function EditProfile() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="secondary">Edit profile</Button>
      </Dialog.Trigger>
      <Dialog.Content size="sm">
        <Dialog.Title>Edit profile</Dialog.Title>
        <Dialog.Description>Your name is shown on pages you edit.</Dialog.Description>
        <TextInput aria-label="Name" defaultValue="Ada Lovelace" className="mt-2" />
        <Dialog.Footer>
          <Dialog.Close asChild><Button variant="secondary">Cancel</Button></Dialog.Close>
          <Dialog.Close asChild><Button variant="primary">Save</Button></Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}`;

function ControlledDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>Open terms</Button>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Content size="lg">
          <Dialog.Title>Terms of use</Dialog.Title>
          <Dialog.Description>Long content scrolls inside the dialog.</Dialog.Description>
          {Array.from({ length: 12 }, (_, i) => (
            <p key={i} className="text-[14px] leading-5 text-n-text-primary">Section {i + 1}. You keep ownership of what you write; we only store it to show it back to you and the people you share it with.</p>
          ))}
          <Dialog.Footer>
            <Button variant="primary" onClick={() => setOpen(false)}>I agree</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
const controlledDialogCode = `import { useState } from 'react';
import { Button, Dialog } from '@krackedui/motion';

export function TermsDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>Open terms</Button>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Content size="lg">
          <Dialog.Title>Terms of use</Dialog.Title>
          <Dialog.Description>Long content scrolls inside the dialog.</Dialog.Description>
          {Array.from({ length: 12 }, (_, i) => (
            <p key={i} className="text-[14px] leading-5 text-n-text-primary">Section {i + 1}. You keep ownership of what you write; we only store it to show it back to you and the people you share it with.</p>
          ))}
          <Dialog.Footer>
            <Button variant="primary" onClick={() => setOpen(false)}>I agree</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}`;

export const dialogPage: DocPage = {
  eyebrow: 'Overlays',
  title: 'Dialog',
  description: 'Modal dialog in three sizes with title, description and a footer of actions. Fills the width on phones and scrolls inside.',
  links: [{ label: 'Radix Dialog', href: 'https://www.radix-ui.com/primitives/docs/components/dialog' }],
  hero: ex({ title: 'Dialog', render: () => <DialogDemo />, code: dialogCode }),
  install: install('Dialog', `<Theme>\n  <Dialog.Root>\n    <Dialog.Trigger asChild><button>Open</button></Dialog.Trigger>\n    <Dialog.Content>\n      <Dialog.Title>Title</Dialog.Title>\n      <Dialog.Description>Description</Dialog.Description>\n    </Dialog.Content>\n  </Dialog.Root>\n</Theme>`),
  sections: [
    composition(`<Dialog.Root>
  <Dialog.Trigger asChild>…</Dialog.Trigger>
  <Dialog.Content size="md">
    <Dialog.Title />
    <Dialog.Description />
    …
    <Dialog.Footer>
      <Dialog.Close asChild>…</Dialog.Close>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>`, ['`Dialog.Content` renders the overlay and the portal for you.', '`DialogSurface` / `DialogOverlay` are the static look for previews.']),
    a11y([
      'Follows the WAI-ARIA modal dialog pattern: `role="dialog"`, `aria-modal`, named by `Dialog.Title` and described by `Dialog.Description`.',
      'A `Dialog.Title` is required (a development warning names a dialog without one). Without a description pass `aria-describedby={undefined}` to Content.',
      'Focus moves into the dialog on open and is trapped there; Tab / Shift+Tab cycle through its controls.',
      'Escape or an overlay click closes it; focus returns to the element that opened it.',
      'The page behind is inert and does not scroll while open.',
      `Under 640px the panel fills the width minus 8px margins; content taller than the screen scrolls inside the panel. ${motionNote}`,
    ]),
    usage([
      'Use for a focused task that blocks the page: editing a record, a short form, a decision.',
      'Use ConfirmDialog for a yes/no decision about a consequential action.',
      'Use Popover for small inline edits, Sheet for side panels and long forms.',
      'Keep the primary action last in `Dialog.Footer` (it is on top on phones).',
    ]),
  ],
  examples: [
    ex({ title: 'Form dialog', render: () => <DialogDemo />, code: dialogCode }),
    ex({ title: 'Controlled, long content', description: '`size="lg"`; the body scrolls inside the panel.', render: () => <ControlledDialog />, code: controlledDialogCode }),
    ex({
      title: 'Static surface',
      render: () => (
        <DialogSurface size="sm" className="flex flex-col gap-2 p-6">
          <div className="text-[16px] font-semibold text-n-text-primary">Static dialog</div>
          <div className="text-[14px] text-n-text-secondary">The dialog card without overlay or focus handling.</div>
        </DialogSurface>
      ),
      code: `import { DialogSurface } from '@krackedui/motion';\n\nexport function StaticDialog() {\n  return (\n    <DialogSurface size="sm" className="flex flex-col gap-2 p-6">\n      <div className="text-[16px] font-semibold text-n-text-primary">Static dialog</div>\n      <div className="text-[14px] text-n-text-secondary">The dialog card without overlay or focus handling.</div>\n    </DialogSurface>\n  );\n}`,
    }),
  ],
  api: [
    { name: 'Dialog.Root', description: 'Holds the open state.', props: openProps('dialog') },
    { name: 'Dialog.Trigger', description: 'Opens the dialog.', props: [{ name: 'asChild', type: 'boolean', default: 'false', description: 'Use your own button.' }] },
    {
      name: 'Dialog.Content',
      description: 'The panel, with the overlay and portal. Padding 24 (20 on phones), flex column with 8px gaps.',
      props: [
        { name: 'size', type: ['"sm"', '"md"', '"lg"'], default: '"md"', description: '400 / 480 / 640 px wide (full width minus margins under 640px).' },
        { name: 'width', type: 'number', description: 'Fixed width in px; overrides `size`.' },
        { name: 'height', type: 'number', description: 'Fixed height in px.' },
        { name: 'top', type: 'number', description: 'Distance from the top in px (top-anchored). Default: centered.' },
        { name: 'radius', type: ['"md"', '"xl"'], default: '"md"', description: '12px or 20px corners.' },
        { name: 'onOpenAutoFocus', type: '(event: Event) => void', description: 'Called when focus moves in; `preventDefault()` to focus something else yourself.' },
        { name: 'onCloseAutoFocus', type: '(event: Event) => void', description: 'Called when focus returns to the trigger.' },
        { name: 'onEscapeKeyDown', type: '(event: KeyboardEvent) => void', description: '`preventDefault()` keeps it open.' },
        { name: 'onPointerDownOutside', type: '(event: PointerDownOutsideEvent) => void', description: '`preventDefault()` keeps it open on an overlay click.' },
      ],
    },
    { name: 'Dialog.Title / Description / Footer', description: 'Accessible name (16/600), description (14 secondary) and the action row (right-aligned, stacked on phones).', props: [{ name: 'className', type: 'string', description: 'Extra classes.' }] },
    { name: 'Dialog.Close', description: 'Closes the dialog.', props: [{ name: 'asChild', type: 'boolean', default: 'false', description: 'Use your own button.' }] },
    {
      name: 'DialogOverlay',
      description: 'The dimmed underlay on its own (no portal or behavior), for static renders behind a `DialogSurface`. A `<div>`: all its props pass through.',
      props: [{ name: 'className', type: 'string', description: 'Merged with `cn`.' }],
    },
    {
      name: 'DialogSurface',
      description: 'Static dialog card (never wider than its container).',
      props: [
        { name: 'size', type: ['"sm"', '"md"', '"lg"'], description: 'Width preset.' },
        { name: 'width', type: 'number', description: 'Fixed width in px.' },
        { name: 'height', type: 'number', description: 'Fixed height in px.' },
        { name: 'radius', type: ['"md"', '"xl"'], default: '"md"', description: 'Corner radius.' },
      ],
    },
  ],
};

/* ================================================================ ConfirmDialog */

function ConfirmDemo() {
  const [count, setCount] = useState(3);
  return (
    <div className={row}>
      <ConfirmDialog
        trigger={<Button variant="danger">Delete {count} pages…</Button>}
        title={`Delete ${count} pages?`}
        description="They move to Trash for 30 days."
        confirmLabel="Delete"
        destructive
        onConfirm={() => new Promise<void>((resolve) => setTimeout(() => { setCount((c) => Math.max(0, c - 1)); resolve(); }, 1200))}
      />
    </div>
  );
}
const confirmCode = `import { useState } from 'react';
import { Button, ConfirmDialog } from '@krackedui/motion';

export function DeletePages() {
  const [count, setCount] = useState(3);
  return (
    <ConfirmDialog
      trigger={<Button variant="danger">Delete {count} pages…</Button>}
      title={\`Delete \${count} pages?\`}
      description="They move to Trash for 30 days."
      confirmLabel="Delete"
      destructive
      // Returning a Promise keeps the dialog open with a busy button until it settles.
      onConfirm={() => new Promise<void>((resolve) => setTimeout(() => { setCount((c) => Math.max(0, c - 1)); resolve(); }, 1200))}
    />
  );
}`;

function ControlledConfirm() {
  const [open, setOpen] = useState(false);
  const [published, setPublished] = useState(false);
  return (
    <div className="flex flex-col items-center gap-2">
      <Button variant="secondary" onClick={() => setOpen(true)}>{published ? 'Unpublish' : 'Publish'}</Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={published ? 'Unpublish this site?' : 'Publish this site?'}
        confirmLabel={published ? 'Unpublish' : 'Publish'}
        destructive={false}
        onConfirm={() => setPublished((p) => !p)}
      />
    </div>
  );
}
const controlledConfirmCode = `import { useState } from 'react';
import { Button, ConfirmDialog } from '@krackedui/motion';

export function PublishToggle() {
  const [open, setOpen] = useState(false);
  const [published, setPublished] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>{published ? 'Unpublish' : 'Publish'}</Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={published ? 'Unpublish this site?' : 'Publish this site?'}
        confirmLabel={published ? 'Unpublish' : 'Publish'}
        destructive={false}
        onConfirm={() => setPublished((p) => !p)}
      />
    </>
  );
}`;

export const confirmDialogPage: DocPage = {
  eyebrow: 'Overlays',
  title: 'Confirm Dialog',
  description: 'Small alert dialog to confirm or cancel a consequential action. Async confirms show a busy button until they finish.',
  hero: ex({ title: 'Confirm dialog', render: () => <ConfirmDemo />, code: confirmCode }),
  install: install('ConfirmDialog', `<Theme>\n  <ConfirmDialog\n    trigger={<button>Delete…</button>}\n    title="Delete this page?"\n    onConfirm={() => deletePage()}\n  />\n</Theme>`),
  sections: [
    a11y([
      'Follows the WAI-ARIA alertdialog pattern: `role="alertdialog"`, named by the title, described by the description.',
      'Focus starts on Cancel, so pressing Enter right away never confirms by accident; focus is trapped inside.',
      'Escape and Cancel dismiss it; focus returns to the trigger.',
      'While an async `onConfirm` runs, the confirm button has `aria-busy="true"` and the dialog cannot be dismissed. A rejected Promise keeps it open so the user can retry.',
      motionNote,
    ]),
    usage([
      'Use before destructive or irreversible actions (delete, revoke, publish).',
      'Write the confirm label as the action ("Delete"), not "OK" or "Yes".',
      'Don\'t confirm routine, undoable actions: do them and offer Undo in a toast instead.',
    ]),
  ],
  examples: [
    ex({ title: 'Destructive, async', render: () => <ConfirmDemo />, code: confirmCode }),
    ex({ title: 'Controlled, non-destructive', render: () => <ControlledConfirm />, code: controlledConfirmCode }),
    ex({
      title: 'Static body',
      render: () => (
        <DialogSurface width={300}>
          <ConfirmDialogBody title="Delete this page?" description="It moves to Trash for 30 days." confirmLabel="Delete" />
        </DialogSurface>
      ),
      code: `import { ConfirmDialogBody, DialogSurface } from '@krackedui/motion';\n\nexport function StaticConfirm() {\n  return (\n    <DialogSurface width={300}>\n      <ConfirmDialogBody title="Delete this page?" description="It moves to Trash for 30 days." confirmLabel="Delete" />\n    </DialogSurface>\n  );\n}`,
    }),
  ],
  api: [
    {
      name: 'ConfirmDialog',
      props: [
        { name: 'title', type: 'ReactNode', description: 'Required. The question ("Delete this page?").' },
        { name: 'description', type: 'ReactNode', description: 'Consequences, one sentence.' },
        { name: 'confirmLabel', type: 'ReactNode', default: '"Delete" | "Confirm"', description: 'Confirm button text (default depends on `destructive`).' },
        { name: 'cancelLabel', type: 'ReactNode', default: '"Cancel"', description: 'Cancel button text.' },
        { name: 'destructive', type: 'boolean', default: 'true', description: 'Red confirm button; otherwise the blue primary.' },
        { name: 'onConfirm', type: '() => void | Promise<void>', description: 'Required. A returned Promise keeps the dialog open and busy until it resolves (then closes) or rejects (stays open).' },
        { name: 'onCancel', type: '() => void', description: 'Called when Cancel is clicked.' },
        { name: 'trigger', type: 'ReactNode', description: 'Element that opens the dialog.' },
        { name: 'open', type: 'boolean', description: 'Controlled open state.' },
        { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Initial open state when uncontrolled.' },
        { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when it opens or closes.' },
      ],
    },
    {
      name: 'ConfirmDialogBody',
      description: 'The 300px body on its own (inside `Dialog.Content` or `DialogSurface`).',
      props: [
        { name: 'title', type: 'ReactNode', description: 'Required. The question.' },
        { name: 'description', type: 'ReactNode', description: 'Consequences.' },
        { name: 'confirmLabel', type: 'ReactNode', description: 'Confirm button text.' },
        { name: 'cancelLabel', type: 'ReactNode', default: '"Cancel"', description: 'Cancel button text.' },
        { name: 'destructive', type: 'boolean', default: 'true', description: 'Red vs blue confirm.' },
        { name: 'onConfirm', type: '() => void', description: 'Confirm click.' },
        { name: 'onCancel', type: '() => void', description: 'Cancel click.' },
        { name: 'loading', type: 'boolean', default: 'false', description: 'Busy confirm button; both buttons blocked.' },
        { name: 'radix', type: 'boolean', default: 'false', description: 'Render Radix Title/Description/Close (when inside `Dialog.Content`).' },
      ],
    },
  ],
};

/* ================================================================ Sheet */

function SheetDemo() {
  return (
    <Sheet.Root>
      <Sheet.Trigger asChild>
        <Button variant="secondary" icon="filter">Filters</Button>
      </Sheet.Trigger>
      <Sheet.Content side="right" size="sm">
        <Sheet.Title>Filters</Sheet.Title>
        <Sheet.Description>Show only the tasks you need.</Sheet.Description>
        <TextInput aria-label="Assignee" placeholder="Assignee" className="mt-3" />
        <TextInput aria-label="Tag" placeholder="Tag" />
        <Sheet.Footer>
          <Sheet.Close asChild><Button variant="secondary">Reset</Button></Sheet.Close>
          <Sheet.Close asChild><Button variant="primary">Apply</Button></Sheet.Close>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet.Root>
  );
}
const sheetCode = `import { Button, Sheet, TextInput } from '@krackedui/motion';

export function FiltersSheet() {
  return (
    <Sheet.Root>
      <Sheet.Trigger asChild>
        <Button variant="secondary" icon="filter">Filters</Button>
      </Sheet.Trigger>
      <Sheet.Content side="right" size="sm">
        <Sheet.Title>Filters</Sheet.Title>
        <Sheet.Description>Show only the tasks you need.</Sheet.Description>
        <TextInput aria-label="Assignee" placeholder="Assignee" className="mt-3" />
        <TextInput aria-label="Tag" placeholder="Tag" />
        <Sheet.Footer>
          <Sheet.Close asChild><Button variant="secondary">Reset</Button></Sheet.Close>
          <Sheet.Close asChild><Button variant="primary">Apply</Button></Sheet.Close>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet.Root>
  );
}`;

function SheetSides() {
  return (
    <div className={row}>
      {(['left', 'right', 'bottom'] as const).map((side) => (
        <Sheet.Root key={side}>
          <Sheet.Trigger asChild><Button variant="secondary">{side}</Button></Sheet.Trigger>
          <Sheet.Content side={side} size={side === 'bottom' ? 'sm' : 'md'}>
            <Sheet.Title>From the {side}</Sheet.Title>
            <Sheet.Description>Escape, the close button or a click outside closes it.</Sheet.Description>
          </Sheet.Content>
        </Sheet.Root>
      ))}
    </div>
  );
}
const sheetSidesCode = `import { Button, Sheet } from '@krackedui/motion';

export function SheetSides() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {(['left', 'right', 'bottom'] as const).map((side) => (
        <Sheet.Root key={side}>
          <Sheet.Trigger asChild><Button variant="secondary">{side}</Button></Sheet.Trigger>
          <Sheet.Content side={side} size={side === 'bottom' ? 'sm' : 'md'}>
            <Sheet.Title>From the {side}</Sheet.Title>
            <Sheet.Description>Escape, the close button or a click outside closes it.</Sheet.Description>
          </Sheet.Content>
        </Sheet.Root>
      ))}
    </div>
  );
}`;

export const sheetPage: DocPage = {
  eyebrow: 'Overlays',
  title: 'Sheet',
  description: 'Modal panel that slides in from the left, right or bottom edge, with a pinned footer. Fills the width on phones.',
  links: [{ label: 'Radix Dialog', href: 'https://www.radix-ui.com/primitives/docs/components/dialog' }],
  hero: ex({ title: 'Sheet', render: () => <SheetDemo />, code: sheetCode }),
  install: install('Sheet', `<Theme>\n  <Sheet.Root>\n    <Sheet.Trigger asChild><button>Open</button></Sheet.Trigger>\n    <Sheet.Content side="right">\n      <Sheet.Title>Title</Sheet.Title>\n      <Sheet.Description>Description</Sheet.Description>\n    </Sheet.Content>\n  </Sheet.Root>\n</Theme>`),
  sections: [
    composition(`<Sheet.Root>
  <Sheet.Trigger asChild>…</Sheet.Trigger>
  <Sheet.Content side="right" size="md">
    <Sheet.Title />
    <Sheet.Description />
    …body (scrolls)…
    <Sheet.Footer>
      <Sheet.Close asChild>…</Sheet.Close>
    </Sheet.Footer>
  </Sheet.Content>
</Sheet.Root>`, ['Content includes the overlay, the portal and a close button in the top-right corner (`showClose={false}` to hide it).']),
    a11y([
      'Follows the WAI-ARIA modal dialog pattern: `role="dialog"`, `aria-modal`, named by `Sheet.Title`, described by `Sheet.Description`.',
      'Focus moves in on open and is trapped; Escape, the close button (labelled "Close") or an overlay click closes it, and focus returns to the trigger.',
      'The close button grows to 36px on touch screens.',
      'Slides in from its edge and out again on close; with reduced motion it fades instead.',
    ]),
    usage([
      'Use for filters, details of a selected item, settings and navigation on phones.',
      'Use `side="bottom"` for short, touch-first choices on phones.',
      'Use Dialog for short centered tasks, Popover for small inline edits.',
      'Keep the main actions in `Sheet.Footer` so they stay visible while the body scrolls.',
    ]),
  ],
  examples: [
    ex({ title: 'Filters panel', render: () => <SheetDemo />, code: sheetCode }),
    ex({ title: 'Sides', render: () => <SheetSides />, code: sheetSidesCode }),
  ],
  api: [
    { name: 'Sheet.Root', description: 'Holds the open state.', props: openProps('sheet') },
    { name: 'Sheet.Trigger', description: 'Opens the sheet.', props: [{ name: 'asChild', type: 'boolean', default: 'false', description: 'Use your own button.' }] },
    {
      name: 'Sheet.Content',
      description: 'The panel, with overlay, portal and close button. Body padding 20, flex column with 8px gaps, scrolls.',
      props: [
        { name: 'side', type: ['"right"', '"left"', '"bottom"'], default: '"right"', description: 'Edge it slides from.' },
        { name: 'size', type: ['"sm"', '"md"', '"lg"'], default: '"md"', description: 'Side sheets: 320 / 400 / 560 px wide (full width under 640px). Bottom sheets: 40 / 60 / 90% of the viewport height.' },
        { name: 'showClose', type: 'boolean', default: 'true', description: 'Show the close button in the top-right corner.' },
        { name: 'closeLabel', type: 'string', default: '"Close"', description: 'Accessible name of the close button.' },
        { name: 'onOpenAutoFocus', type: '(event: Event) => void', description: 'Called when focus moves in.' },
        { name: 'onEscapeKeyDown', type: '(event: KeyboardEvent) => void', description: '`preventDefault()` keeps it open.' },
      ],
    },
    { name: 'Sheet.Title / Description / Footer', description: 'Accessible name, description, and the action row pinned to the bottom.', props: [{ name: 'className', type: 'string', description: 'Extra classes.' }] },
    { name: 'Sheet.Close', description: 'Closes the sheet.', props: [{ name: 'asChild', type: 'boolean', default: 'false', description: 'Use your own button.' }] },
  ],
};

/* ================================================================ Toast */

function ToastButtons() {
  const { toast, dismiss } = useToast();
  const [last, setLast] = useState<string | number | null>(null);
  return (
    <div className={row}>
      <Button variant="secondary" onClick={() => setLast(toast({ message: 'Link copied' }))}>Neutral</Button>
      <Button variant="secondary" onClick={() => setLast(toast({ message: 'Changes saved', tone: 'success' }))}>Success</Button>
      <Button variant="secondary" onClick={() => setLast(toast({ message: 'Couldn’t save changes', description: 'Check your connection and try again.', tone: 'danger' }))}>Danger</Button>
      <Button
        variant="secondary"
        onClick={() => setLast(toast({ message: 'Moved to Trash', action: { label: 'Undo', onClick: () => toast({ message: 'Restored', tone: 'success' }) } }))}
      >
        With action
      </Button>
      <Button variant="ghost" disabled={last === null} onClick={() => { if (last !== null) dismiss(last); }}>Dismiss last</Button>
    </div>
  );
}
const toastCode = `import { useState } from 'react';
import { Button, ToastProvider, useToast } from '@krackedui/motion';

function ToastButtons() {
  const { toast, dismiss } = useToast();
  const [last, setLast] = useState<string | number | null>(null);
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button variant="secondary" onClick={() => setLast(toast({ message: 'Link copied' }))}>Neutral</Button>
      <Button variant="secondary" onClick={() => setLast(toast({ message: 'Changes saved', tone: 'success' }))}>Success</Button>
      <Button variant="secondary" onClick={() => setLast(toast({ message: 'Couldn’t save changes', description: 'Check your connection and try again.', tone: 'danger' }))}>Danger</Button>
      <Button
        variant="secondary"
        onClick={() => setLast(toast({ message: 'Moved to Trash', action: { label: 'Undo', onClick: () => toast({ message: 'Restored', tone: 'success' }) } }))}
      >
        With action
      </Button>
      <Button variant="ghost" disabled={last === null} onClick={() => { if (last !== null) dismiss(last); }}>Dismiss last</Button>
    </div>
  );
}

// ToastProvider goes once near the root of your app.
export function ToastDemo() {
  return (
    <ToastProvider>
      <ToastButtons />
    </ToastProvider>
  );
}`;

export const toastPage: DocPage = {
  eyebrow: 'Feedback',
  title: 'Toast',
  description: 'Short, temporary message at the bottom center after an action, with an optional action like Undo. `ToastProvider` hosts them; `useToast()` shows and dismisses them.',
  links: [{ label: 'Radix Toast', href: 'https://www.radix-ui.com/primitives/docs/components/toast' }],
  hero: ex({ title: 'Toast', render: () => <ToastProvider><ToastButtons /></ToastProvider>, code: toastCode }),
  install: install('ToastProvider, useToast', `// Once, near the root:\n<Theme>\n  <ToastProvider>\n    <App />\n  </ToastProvider>\n</Theme>\n\n// Anywhere inside:\nconst { toast, dismiss } = useToast();\nconst id = toast({ message: 'Saved', tone: 'success' });`),
  sections: [
    {
      title: 'Toast options',
      placement: 'beforeApi',
      blocks: [
        '`toast(options)` returns the toast id (`string | number`). Options:',
        {
          list: [
            '`message: ReactNode` (required): the main line.',
            '`description?: ReactNode`: a second, smaller line.',
            '`tone?`: `"neutral"` (default), `"success"` (green check icon) or `"danger"` (red error icon, announced assertively).',
            '`action?`: `{ label, onClick }`, one action button; clicking it runs `onClick` and dismisses the toast.',
            '`duration?: number`: ms before it hides. Default 4000; 6000 with an action or for danger; `0` keeps it until dismissed (a close button is shown).',
            '`icon?: IconName`, `id?: string | number` (Motion extras): custom leading icon; your own id to replace or dismiss a known toast.',
          ],
        },
      ],
    },
    a11y([
      'Each toast is read out by a live region: neutral and success politely (`role="status"`), danger assertively (`role="alert"`).',
      'Timers pause while the pointer is over a toast or focus is inside the toast region, and while the window is in the background.',
      'F8 moves focus to the toast region ("Notifications"); Tab reaches the action and close buttons; Escape dismisses the focused toast.',
      'Swipe down to dismiss on touch screens.',
      'Give important actions enough time: toasts with an action stay at least 6 seconds; never put the only way to do something in a toast.',
      'Slides up and fades in, fades out; with reduced motion it only fades.',
    ]),
    usage([
      'Use to confirm an action that just happened ("Link copied", "Moved to Trash · Undo").',
      'Use `tone="danger"` for failures the user should know about right away; keep the message short and say what to do.',
      'Don\'t use toasts for information the user must act on or read later: use Alert or a Dialog.',
      'Show one toast per action; don\'t stack several for the same event.',
    ]),
  ],
  examples: [
    ex({
      title: 'Static pills',
      description: '`ToastPill` is the look without timers or live region, for previews.',
      render: () => (
        <div className="flex flex-col items-center gap-3">
          <ToastPill>Link copied</ToastPill>
          <ToastPill tone="success">Changes saved</ToastPill>
          <ToastPill icon="trash" action="Undo">Moved to Trash</ToastPill>
          <ToastPill tone="danger" description="Check your connection and try again." onClose={() => undefined}>Couldn’t save changes</ToastPill>
        </div>
      ),
      code: `import { ToastPill } from '@krackedui/motion';\n\nexport function Pills() {\n  return (\n    <div className="flex flex-col items-center gap-3">\n      <ToastPill>Link copied</ToastPill>\n      <ToastPill tone="success">Changes saved</ToastPill>\n      <ToastPill icon="trash" action="Undo">Moved to Trash</ToastPill>\n      <ToastPill tone="danger" description="Check your connection and try again." onClose={() => undefined}>Couldn’t save changes</ToastPill>\n    </div>\n  );\n}`,
    }),
  ],
  api: [
    {
      name: 'ToastProvider',
      description: 'Hosts the toasts and the live region. Put it once near the root.',
      props: [
        { name: 'children', type: 'ReactNode', description: 'Your app.' },
        { name: 'duration', type: 'number', default: '4000', description: 'Default time on screen in ms.' },
        { name: 'label', type: 'string', default: '"Notifications ({hotkey})"', description: 'Accessible name of the toast region.' },
      ],
    },
    {
      name: 'useToast()',
      description: 'Returns `{ toast, dismiss }`. Throws a message naming `<ToastProvider>` when used outside it.',
      props: [
        { name: 'toast', type: '(options: ToastOptions) => string | number', description: 'Show a toast; returns its id. Options are listed above.' },
        { name: 'dismiss', type: '(id: string | number) => void', description: 'Hide a toast by id, with its exit animation.' },
      ],
    },
    {
      name: 'ToastPill',
      description: 'Static toast pill.',
      props: [
        { name: 'tone', type: ['"neutral"', '"success"', '"danger"'], default: '"neutral"', description: 'Default icon and its color.' },
        { name: 'icon', type: 'IconName', description: 'Leading icon (defaults by tone).' },
        { name: 'description', type: 'ReactNode', description: 'Second line.' },
        { name: 'action', type: 'ReactNode', description: 'Action button label.' },
        { name: 'onAction', type: '() => void', description: 'Action click.' },
        { name: 'onClose', type: '() => void', description: 'Show a close button and handle its click.' },
      ],
    },
  ],
};

/* ================================================================ Tabs */

function TabsDemo() {
  return (
    <Tabs.Root defaultValue="overview" className="w-full max-w-md">
      <Tabs.List aria-label="Project">
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
        <Tabs.Trigger value="archived" disabled>Archived</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="overview" className="p-3 text-[14px] text-n-text-secondary">Goals, owners and dates.</Tabs.Content>
      <Tabs.Content value="activity" className="p-3 text-[14px] text-n-text-secondary">Recent edits and comments.</Tabs.Content>
      <Tabs.Content value="settings" className="p-3 text-[14px] text-n-text-secondary">Permissions and notifications.</Tabs.Content>
      <Tabs.Content value="archived" className="p-3 text-[14px] text-n-text-secondary">Nothing archived.</Tabs.Content>
    </Tabs.Root>
  );
}
const tabsCode = `import { Tabs } from '@krackedui/motion';

export function ProjectTabs() {
  return (
    <Tabs.Root defaultValue="overview" className="w-full max-w-md">
      <Tabs.List aria-label="Project">
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
        <Tabs.Trigger value="archived" disabled>Archived</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="overview" className="p-3 text-[14px] text-n-text-secondary">Goals, owners and dates.</Tabs.Content>
      <Tabs.Content value="activity" className="p-3 text-[14px] text-n-text-secondary">Recent edits and comments.</Tabs.Content>
      <Tabs.Content value="settings" className="p-3 text-[14px] text-n-text-secondary">Permissions and notifications.</Tabs.Content>
      <Tabs.Content value="archived" className="p-3 text-[14px] text-n-text-secondary">Nothing archived.</Tabs.Content>
    </Tabs.Root>
  );
}`;

function ControlledTabs() {
  const [tab, setTab] = useState('emoji');
  return (
    <Tabs.Root value={tab} onValueChange={setTab} className="w-full max-w-sm">
      <Tabs.List aria-label="Icon source">
        {['Emoji', 'Icons', 'Upload'].map((t) => (
          <Tabs.Trigger key={t} value={t.toLowerCase()} tone="secondary" weight="regular" underline="inset">{t}</Tabs.Trigger>
        ))}
      </Tabs.List>
      <Tabs.Content value={tab} className="p-3 text-[14px] text-n-text-secondary">Selected: {tab}</Tabs.Content>
    </Tabs.Root>
  );
}
const controlledTabsCode = `import { useState } from 'react';
import { Tabs } from '@krackedui/motion';

export function IconSourceTabs() {
  const [tab, setTab] = useState('emoji');
  return (
    <Tabs.Root value={tab} onValueChange={setTab} className="w-full max-w-sm">
      <Tabs.List aria-label="Icon source">
        {['Emoji', 'Icons', 'Upload'].map((t) => (
          <Tabs.Trigger key={t} value={t.toLowerCase()} tone="secondary" weight="regular" underline="inset">{t}</Tabs.Trigger>
        ))}
      </Tabs.List>
      <Tabs.Content value={tab} className="p-3 text-[14px] text-n-text-secondary">Selected: {tab}</Tabs.Content>
    </Tabs.Root>
  );
}`;

export const tabsPage: DocPage = {
  eyebrow: 'Navigation',
  title: 'Tabs',
  description: 'Underline tabs to switch between views of the same context. The underline slides to the active tab.',
  links: [{ label: 'Radix Tabs', href: 'https://www.radix-ui.com/primitives/docs/components/tabs' }],
  hero: ex({ title: 'Tabs', render: () => <TabsDemo />, code: tabsCode }),
  install: install('Tabs', `<Theme>\n  <Tabs.Root defaultValue="a">\n    <Tabs.List aria-label="Sections">\n      <Tabs.Trigger value="a">A</Tabs.Trigger>\n      <Tabs.Trigger value="b">B</Tabs.Trigger>\n    </Tabs.List>\n    <Tabs.Content value="a">…</Tabs.Content>\n    <Tabs.Content value="b">…</Tabs.Content>\n  </Tabs.Root>\n</Theme>`),
  sections: [
    composition(`<Tabs.Root defaultValue="a">
  <Tabs.List aria-label="…">
    <Tabs.Trigger value="a" />
  </Tabs.List>
  <Tabs.Content value="a" />
</Tabs.Root>`),
    a11y([
      'Follows the WAI-ARIA tabs pattern: `tablist`, `tab` (`aria-selected`, `aria-controls`) and `tabpanel` (`aria-labelledby`).',
      'Tab moves focus to the active tab, then into the panel. ←/→ move to the previous/next tab and activate it (automatic activation), wrapping at the ends; Home/End jump to the first/last tab. Disabled tabs are skipped.',
      'Give the list an `aria-label` when there is no visible heading for it.',
      'Lists wider than the screen scroll horizontally; the indicator slides with a transform transition (none with reduced motion).',
    ]),
    usage([
      'Use to switch between views of the same object (Overview / Activity / Settings).',
      'Don\'t use tabs for navigation between pages (use links or Sidebar) or for a compact option toggle (use SegmentedControl).',
      'Keep labels short, one or two words; avoid more than about six tabs.',
    ]),
  ],
  examples: [
    ex({ title: 'Uncontrolled', render: () => <TabsDemo />, code: tabsCode }),
    ex({ title: 'Controlled, inset underline', render: () => <ControlledTabs />, code: controlledTabsCode }),
  ],
  api: [
    {
      name: 'Tabs.Root',
      props: [
        { name: 'value', type: 'string', description: 'Controlled active tab.' },
        { name: 'defaultValue', type: 'string', description: 'Initial tab when uncontrolled.' },
        { name: 'onValueChange', type: '(value: string) => void', description: 'Called when the active tab changes.' },
        { name: 'activationMode', type: ['"automatic"', '"manual"'], default: '"automatic"', description: 'Activate on focus, or on Enter/Space.' },
        { name: 'orientation', type: ['"horizontal"', '"vertical"'], default: '"horizontal"', description: 'Arrow key direction.' },
      ],
    },
    { name: 'Tabs.List', description: 'The 40px bar with the sliding indicator.', props: [{ name: 'loop', type: 'boolean', default: 'true', description: 'Wrap arrow-key focus at the ends.' }] },
    {
      name: 'Tabs.Trigger',
      props: [
        { name: 'value', type: 'string', description: 'Required. Tab id matching a `Tabs.Content`.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Not selectable; skipped by arrows.' },
        { name: 'tone', type: ['"tertiary"', '"secondary"'], default: '"tertiary"', description: 'Inactive label color.' },
        { name: 'weight', type: ['"medium"', '"regular"'], default: '"medium"', description: 'Label weight.' },
        { name: 'underline', type: ['"full"', '"inset"'], default: '"full"', description: 'Indicator spans the tab, or is inset 8px.' },
      ],
    },
    { name: 'Tabs.Content', props: [{ name: 'value', type: 'string', description: 'Required. Tab id.' }, { name: 'forceMount', type: 'true', description: 'Keep mounted while inactive.' }] },
  ],
};

/* ================================================================ Breadcrumbs */

const crumbs = [
  { label: 'Workspace', icon: 'home', href: '#workspace' },
  { label: 'Engineering', href: '#engineering' },
  { label: 'Design system', href: '#design-system' },
  { label: 'Components', href: '#components' },
  { label: 'Breadcrumbs' },
];

export const breadcrumbsPage: DocPage = {
  eyebrow: 'Navigation',
  title: 'Breadcrumbs',
  description: 'Location in a hierarchy, as links separated by "/". Middle items collapse into a "…" menu when the row runs out of space.',
  hero: ex({
    title: 'Breadcrumbs',
    render: () => <Breadcrumbs items={crumbs} className="w-full" />,
    code: `import { Breadcrumbs } from '@krackedui/motion';\n\nexport function Location() {\n  return (\n    <Breadcrumbs\n      className="w-full"\n      items={[\n        { label: 'Workspace', icon: 'home', href: '#workspace' },\n        { label: 'Engineering', href: '#engineering' },\n        { label: 'Design system', href: '#design-system' },\n        { label: 'Components', href: '#components' },\n        { label: 'Breadcrumbs' },\n      ]}\n    />\n  );\n}`,
  }),
  install: install('Breadcrumbs', `<Theme>\n  <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Settings' }]} />\n</Theme>`),
  sections: [
    a11y([
      'Follows the WAI-ARIA breadcrumb pattern: `nav` labelled "Breadcrumb" around an ordered list; the last item has `aria-current="page"`.',
      'Items with `href` are links, items with only `onClick` are buttons, others are plain text.',
      'The "…" button ("Show hidden breadcrumbs") opens a menu of the collapsed items: Enter/Space/↓ open it, arrows move, Escape closes and returns focus.',
      'Separators are hidden from assistive tech. Segments are 32px tall on touch screens.',
    ]),
    usage([
      'Use in a top bar or page header to show where a page sits and to move up the hierarchy.',
      'Don\'t use as the main navigation or for steps in a flow.',
      'Keep labels short; long ones truncate at 240px.',
    ]),
  ],
  examples: [
    ex({
      title: 'Collapsing in a narrow row',
      description: 'At 320px only the first item, "…" and the current page remain.',
      render: () => <div className="w-[300px] max-w-full rounded-n-md px-2 shadow-[inset_0_0_0_1px_var(--n-border-primary)]"><Breadcrumbs items={crumbs} /></div>,
      code: `import { Breadcrumbs } from '@krackedui/motion';\n\nexport function NarrowLocation() {\n  return (\n    <div className="w-[300px] max-w-full">\n      <Breadcrumbs\n        items={[\n          { label: 'Workspace', icon: 'home', href: '#workspace' },\n          { label: 'Engineering', href: '#engineering' },\n          { label: 'Design system', href: '#design-system' },\n          { label: 'Components', href: '#components' },\n          { label: 'Breadcrumbs' },\n        ]}\n      />\n    </div>\n  );\n}`,
    }),
    ex({
      title: 'Emoji icons and an access chip',
      render: () => <Breadcrumbs items={[{ label: 'Wiki', icon: '📚', onClick: () => undefined }, { label: 'Onboarding', icon: '👋' }]} trailing={<BreadcrumbAccess />} />,
      code: `import { BreadcrumbAccess, Breadcrumbs } from '@krackedui/motion';\n\nexport function WikiLocation() {\n  return (\n    <Breadcrumbs\n      items={[{ label: 'Wiki', icon: '📚', onClick: () => undefined }, { label: 'Onboarding', icon: '👋' }]}\n      trailing={<BreadcrumbAccess />}\n    />\n  );\n}`,
    }),
  ],
  api: [
    {
      name: 'Breadcrumbs',
      props: [
        { name: 'items', type: '{ label: ReactNode; href?: string; icon?: IconName | string; onClick?: () => void }[]', description: 'Required. From the root to the current page (last).' },
        { name: 'maxItems', type: 'number', default: '4', description: 'Most segments shown before middle ones collapse; narrow rows collapse more.' },
        { name: 'trailing', type: 'ReactNode', description: 'Content after the last segment.' },
        { name: 'collapsedLabel', type: 'string', default: '"Show hidden breadcrumbs"', description: 'Accessible name of the "…" button.' },
        { name: 'aria-label', type: 'string', default: '"Breadcrumb"', description: 'Name of the `nav` landmark.' },
      ],
    },
    {
      name: 'BreadcrumbAccess',
      description: 'Access chip button ("Private ⌄").',
      props: [
        { name: 'label', type: 'ReactNode', default: '"Private"', description: 'Chip text.' },
        { name: 'icon', type: 'IconName', default: '"lockFill"', description: 'Leading icon.' },
      ],
    },
  ],
};

/* ================================================================ Steps */

const paymentSteps = [
  { label: 'Payee', description: 'Who gets paid' },
  { label: 'Amount', description: 'How much and when' },
  { label: 'Review', description: 'Check and confirm' },
];

function StepsDemo() {
  const [current, setCurrent] = useState(1);
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <Steps steps={paymentSteps} current={current} onStepChange={setCurrent} label="Payment progress" />
      <div className="flex justify-end gap-2">
        <Button variant="secondary" disabled={current === 0} onClick={() => setCurrent((c) => Math.max(0, c - 1))}>Back</Button>
        <Button variant="primary" disabled={current === paymentSteps.length} onClick={() => setCurrent((c) => Math.min(paymentSteps.length, c + 1))}>
          {current >= paymentSteps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
const stepsDemoCode = `import { useState } from 'react';
import { Button, Steps } from '@krackedui/motion';

const steps = [
  { label: 'Payee', description: 'Who gets paid' },
  { label: 'Amount', description: 'How much and when' },
  { label: 'Review', description: 'Check and confirm' },
];

export function PaymentSteps() {
  const [current, setCurrent] = useState(1);
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <Steps steps={steps} current={current} onStepChange={setCurrent} label="Payment progress" />
      <div className="flex justify-end gap-2">
        <Button variant="secondary" disabled={current === 0} onClick={() => setCurrent((c) => Math.max(0, c - 1))}>Back</Button>
        <Button variant="primary" disabled={current === steps.length} onClick={() => setCurrent((c) => Math.min(steps.length, c + 1))}>
          {current >= steps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  );
}`;

export const stepsPage: DocPage = {
  eyebrow: 'Navigation',
  title: 'Steps',
  description: 'Progress through a multi-step task (checkout, a payment, onboarding): numbered markers joined by hairlines; completed steps can link back.',
  hero: ex({ title: 'Steps', render: () => <StepsDemo />, code: stepsDemoCode }),
  install: install('Steps', `<Theme>\n  <Steps steps={[{ label: 'Details' }, { label: 'Review' }]} current={0} />\n</Theme>`),
  examples: [
    ex({
      title: 'Read-only, with five steps',
      description: 'Without `onStepChange` the steps are plain text. Under 640px only the current step keeps its label.',
      render: () => <Steps className="w-full max-w-2xl" current={2} steps={[{ label: 'Account' }, { label: 'Company' }, { label: 'Team' }, { label: 'Billing' }, { label: 'Done' }]} />,
      code: `import { Steps } from '@krackedui/motion';\n\nexport function OnboardingSteps() {\n  return (\n    <Steps\n      className="w-full max-w-2xl"\n      current={2}\n      steps={[{ label: 'Account' }, { label: 'Company' }, { label: 'Team' }, { label: 'Billing' }, { label: 'Done' }]}\n    />\n  );\n}`,
    }),
    ex({
      title: 'All complete',
      description: '`current={steps.length}` marks every step complete.',
      render: () => <Steps className="w-full max-w-xl" current={3} steps={paymentSteps} label="Payment progress" />,
      code: `import { Steps } from '@krackedui/motion';\n\nexport function PaymentDone() {\n  return (\n    <Steps\n      className="w-full max-w-xl"\n      current={3}\n      label="Payment progress"\n      steps={[\n        { label: 'Payee', description: 'Who gets paid' },\n        { label: 'Amount', description: 'How much and when' },\n        { label: 'Review', description: 'Check and confirm' },\n      ]}\n    />\n  );\n}`,
    }),
  ],
  api: [
    {
      name: 'Steps',
      description: 'A `<nav>` (all its props pass through) around an ordered list. Adds:',
      props: [
        { name: 'steps', type: '{ label: ReactNode; description?: ReactNode }[]', description: 'Required. The steps in order.' },
        { name: 'current', type: 'number', description: 'Required. Index of the current step (0-based). Earlier steps are complete; `steps.length` = all done.' },
        { name: 'onStepChange', type: '(index: number) => void', description: 'Makes completed steps buttons that go back to them.' },
        { name: 'label', type: 'string', default: '"Progress"', description: 'Accessible name of the navigation landmark.' },
      ],
    },
    { name: 'stepsVariants', props: [{ name: 'slots', type: 'tv recipe', description: 'root, list, item, step, button, marker, text, label, description, connector; `status: complete | current | upcoming`.' }] },
  ],
  sections: [
    a11y([
      'A labelled `nav` around an ordered list; the current step has `aria-current="step"`.',
      'Each step announces its position and state ("Amount, step 2 of 3, current step"); markers and connectors are hidden from assistive tech.',
      'With `onStepChange`, completed steps are buttons (Tab, Enter / Space); current and upcoming steps are not interactive.',
      'On phones the labels of other steps are visually hidden but still announced.',
    ]),
    usage([
      'Use for a linear task of 3–5 steps where people benefit from knowing how far along they are.',
      'Pair it with Back / Next buttons; let people return to completed steps with `onStepChange`.',
      'Don\'t use it to switch between independent panels: use Tabs.',
      'Don\'t use it for a single percentage: use Progress.',
    ]),
  ],
};

/* ================================================================ CommandPalette */

const commandGroups: CommandGroup[] = [
  { label: 'Pages', items: [
    { id: 'roadmap', title: 'Product roadmap', icon: 'file', keywords: 'plan goals', path: ['Team', 'Projects'] },
    { id: 'notes', title: 'Weekly sync notes', icon: 'file', path: ['Team', 'Meetings'] },
    { id: 'guide', title: 'Onboarding guide', icon: '📘' },
  ] },
  { label: 'Actions', items: [
    { id: 'new', title: 'New page', icon: 'plus', shortcut: '⌘N' },
    { id: 'theme', title: 'Toggle dark mode', icon: 'moon', keywords: 'appearance theme', shortcut: '⌘⇧L' },
    { id: 'settings', title: 'Open settings', icon: 'settings', shortcut: '⌘,' },
  ] },
];
const commandGroupsCode = `const groups: CommandGroup[] = [
  { label: 'Pages', items: [
    { id: 'roadmap', title: 'Product roadmap', icon: 'file', keywords: 'plan goals', path: ['Team', 'Projects'] },
    { id: 'notes', title: 'Weekly sync notes', icon: 'file', path: ['Team', 'Meetings'] },
    { id: 'guide', title: 'Onboarding guide', icon: '📘' },
  ] },
  { label: 'Actions', items: [
    { id: 'new', title: 'New page', icon: 'plus', shortcut: '⌘N' },
    { id: 'theme', title: 'Toggle dark mode', icon: 'moon', keywords: 'appearance theme', shortcut: '⌘⇧L' },
    { id: 'settings', title: 'Open settings', icon: 'settings', shortcut: '⌘,' },
  ] },
];`;

function InlinePalette() {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="flex w-full max-w-xl flex-col gap-2">
      <div className="h-[360px] overflow-hidden rounded-n-2xl shadow-n-shadow-outline-lg">
        <CommandPalette groups={commandGroups} placeholder="Search pages and actions…" onSelect={(item) => setPicked(item.id)} className="h-full" />
      </div>
      <div role="status" className="text-[12px] text-n-text-secondary">Last chosen: {picked ?? 'nothing yet'}</div>
    </div>
  );
}
const inlinePaletteCode = `import { useState } from 'react';
import { CommandPalette, type CommandGroup } from '@krackedui/motion';

${commandGroupsCode}

export function InlinePalette() {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="flex w-full max-w-xl flex-col gap-2">
      <div className="h-[360px] overflow-hidden rounded-n-2xl shadow-n-shadow-outline-lg">
        <CommandPalette groups={groups} placeholder="Search pages and actions…" onSelect={(item) => setPicked(item.id)} className="h-full" />
      </div>
      <div role="status" className="text-[12px] text-n-text-secondary">Last chosen: {picked ?? 'nothing yet'}</div>
    </div>
  );
}`;

function PaletteDialogDemo({ preview = false }: { preview?: boolean }) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-center gap-2">
      <Button variant="secondary" icon="search" onClick={() => setOpen(true)}>Search…</Button>
      <CommandPaletteDialog
        open={open}
        onOpenChange={setOpen}
        hotkey={false}
        preview={preview}
        groups={commandGroups}
        placeholder="Search pages and actions…"
        emptyText="No pages or actions match"
        onSelect={(item) => setPicked(item.id)}
      />
      <div role="status" className="text-[12px] text-n-text-secondary">Last chosen: {picked ?? 'nothing yet'}</div>
    </div>
  );
}
const paletteDialogCode = (preview: boolean) => `import { useState } from 'react';
import { Button, CommandPaletteDialog, type CommandGroup } from '@krackedui/motion';

${commandGroupsCode}

export function Search() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-center gap-2">
      <Button variant="secondary" icon="search" onClick={() => setOpen(true)}>Search…</Button>
      <CommandPaletteDialog
        open={open}
        onOpenChange={setOpen}
        // ⌘K / Ctrl+K toggles it when hotkey is on (the default)
        hotkey={false}${preview ? '\n        preview' : ''}
        groups={groups}
        placeholder="Search pages and actions…"
        emptyText="No pages or actions match"
        onSelect={(item) => setPicked(item.id)}
      />
      <div role="status" className="text-[12px] text-n-text-secondary">Last chosen: {picked ?? 'nothing yet'}</div>
    </div>
  );
}`;

const paletteProps: PropDef[] = [
  { name: 'groups', type: '{ label: string; items: CommandItem[] }[]', description: 'Required. Sections of items. `CommandItem`: `{ id, title, icon?, keywords?, shortcut?, path?, preview?, disabled? }`.' },
  { name: 'onSelect', type: '(item: CommandItem) => void', description: 'Called with the chosen item (Enter or click).' },
  { name: 'placeholder', type: 'string', default: '"Search…"', description: 'Input placeholder; also its accessible name.' },
  { name: 'inputLabel', type: 'string', description: 'Accessible name of the input when it should differ from the placeholder.' },
  { name: 'emptyText', type: 'ReactNode', default: '"No results"', description: 'Shown (and announced) when nothing matches.' },
  { name: 'filters', type: '{ label: string; icon?: IconName; menu?: boolean; muted?: boolean; onClick?: () => void }[]', default: '[]', description: 'Filter chips under the input.' },
  { name: 'hints', type: '{ keys: ReactNode; label: string }[]', default: '↑↓ Navigate, ↵ Select, esc Close', description: 'Footer key hints; `[]` hides the footer (always hidden on phones).' },
  { name: 'preview', type: 'boolean', default: 'false', description: 'Show a preview pane of the highlighted item on wide screens.' },
  { name: 'defaultSelectedId', type: 'string', description: 'Initially highlighted item (default: the first).' },
  { name: 'query', type: 'string', description: 'Controlled search text.' },
  { name: 'onQueryChange', type: '(query: string) => void', description: 'Called as the search text changes.' },
  { name: 'autoFocus', type: 'boolean', default: 'false', description: 'Focus the input on mount.' },
  { name: 'headerEnd', type: 'ReactNode', description: 'Content at the right end of the search row (the dialog puts a Cancel button there on phones).' },
];

const paletteA11y = [
  'The input is a WAI-ARIA combobox (`aria-expanded`, `aria-controls`, `aria-autocomplete="list"`, `aria-activedescendant`) controlling an always-visible listbox; focus stays in the input.',
  'Typing filters by title, keywords and path (every word must match). ↑/↓ move the highlight, Ctrl+Home / Ctrl+End jump to the ends, Enter runs the highlighted item.',
  'Groups are labelled `group`s; options expose `aria-selected` for the highlighted one; disabled items are skipped.',
  'When nothing matches, the empty text is announced through a status region.',
];

export const commandPalettePage: DocPage = {
  eyebrow: 'Navigation',
  title: 'Command Palette',
  description: 'Searchable list of commands and pages with keyboard navigation and shortcut hints, inline in a panel.',
  hero: ex({ title: 'Command palette', render: () => <InlinePalette />, code: inlinePaletteCode }),
  install: install('CommandPalette', `<Theme>\n  <CommandPalette\n    groups={[{ label: 'Actions', items: [{ id: 'new', title: 'New page', icon: 'plus' }] }]}\n    onSelect={(item) => run(item.id)}\n  />\n</Theme>`),
  sections: [
    a11y(paletteA11y),
    usage([
      'Use to search and run many commands or jump to pages; for the ⌘K modal use CommandPaletteDialog.',
      'Add `keywords` with synonyms so people find commands by the words they use.',
      'Don\'t use it for a handful of actions: a Menu is easier to discover.',
    ]),
  ],
  examples: [ex({ title: 'Inline', render: () => <InlinePalette />, code: inlinePaletteCode })],
  api: [{ name: 'CommandPalette', props: paletteProps }],
};

export const commandPaletteDialogPage: DocPage = {
  eyebrow: 'Navigation',
  title: 'Command Palette Dialog',
  description: 'The command palette in a modal, toggled with ⌘K / Ctrl+K. Full screen on phones.',
  hero: ex({ title: 'Command palette dialog', render: () => <PaletteDialogDemo />, code: paletteDialogCode(false) }),
  install: install('CommandPaletteDialog', `<Theme>\n  <CommandPaletteDialog groups={groups} onSelect={(item) => run(item.id)} />\n</Theme>`),
  sections: [
    a11y([
      'A WAI-ARIA modal dialog (named "Command palette" by default) containing the combobox: focus goes to the search input on open and is trapped in the dialog.',
      '⌘K / Ctrl+K toggles it (when `hotkey` is on); Escape or a click outside closes it; focus returns to where it was.',
      ...paletteA11y,
      `Under 640px it fills the screen; the result list scrolls inside. ${motionNote}`,
    ]),
    usage([
      'Use as the app-wide search and command launcher, opened from a search button and ⌘K.',
      'Selecting an item calls `onSelect` and closes the dialog: navigate or run the command there.',
      'Turn `hotkey` off when another part of the page already owns ⌘K.',
    ]),
  ],
  examples: [
    ex({ title: 'Search dialog', render: () => <PaletteDialogDemo />, code: paletteDialogCode(false) }),
    ex({ title: 'With preview pane', description: 'Wide screens show the highlighted item on the right.', render: () => <PaletteDialogDemo preview />, code: paletteDialogCode(true) }),
  ],
  api: [
    {
      name: 'CommandPaletteDialog',
      description: 'Accepts every CommandPalette prop, plus:',
      props: [
        { name: 'open', type: 'boolean', description: 'Controlled open state.' },
        { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Initial open state when uncontrolled.' },
        { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when it opens or closes.' },
        { name: 'hotkey', type: 'boolean', default: 'true', description: 'Toggle with ⌘K / Ctrl+K.' },
        { name: 'width', type: 'number', default: '640 (1006 with preview)', description: 'Width in px on screens ≥ 640px.' },
        { name: 'height', type: 'number', description: 'Height in px on screens ≥ 640px (default: fits the results, up to 76% of the viewport; 700 with preview).' },
        { name: 'title', type: 'string', default: '"Command palette"', description: 'Accessible name of the dialog.' },
        ...paletteProps,
      ],
    },
  ],
};

/* ================================================================ EmojiPicker */

function EmojiDemo() {
  const [icon, setIcon] = useState('💡');
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="secondary" aria-label={`Page icon: ${icon}`}><span className="text-[18px]">{icon}</span></Button>
      </Popover.Trigger>
      <Popover.Content radius="lg" aria-label="Choose an icon">
        <EmojiPicker onSelect={setIcon} onRemove={() => setIcon('📄')} autoFocus />
      </Popover.Content>
    </Popover.Root>
  );
}
const emojiCode = `import { useState } from 'react';
import { Button, EmojiPicker, Popover } from '@krackedui/motion';

export function PageIconPicker() {
  const [icon, setIcon] = useState('💡');
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="secondary" aria-label={\`Page icon: \${icon}\`}><span className="text-[18px]">{icon}</span></Button>
      </Popover.Trigger>
      <Popover.Content radius="lg" aria-label="Choose an icon">
        <EmojiPicker onSelect={setIcon} onRemove={() => setIcon('📄')} autoFocus />
      </Popover.Content>
    </Popover.Root>
  );
}`;

export const emojiPickerPage: DocPage = {
  eyebrow: 'Pickers',
  title: 'Emoji Picker',
  description: 'Emoji and icon picker panel with search, category jumps and an upload tab. Put it in a Popover.',
  hero: ex({ title: 'Emoji picker', render: () => <EmojiDemo />, code: emojiCode }),
  install: install('EmojiPicker, Popover', `<Theme>\n  <Popover.Root>\n    <Popover.Trigger>Icon</Popover.Trigger>\n    <Popover.Content aria-label="Choose an icon"><EmojiPicker onSelect={setIcon} /></Popover.Content>\n  </Popover.Root>\n</Theme>`),
  sections: [
    a11y([
      'Tabs (Emoji / Icons / Upload) follow the WAI-ARIA tabs pattern.',
      'The search field is labelled "Search emoji"; each category is a labelled group of buttons named by the emoji (or icon name).',
      'The footer is a "Emoji categories" navigation whose buttons scroll to each category.',
      'Every control has a visible focus ring; Tab moves through the grid.',
    ]),
    usage([
      'Use to pick a page, project or reaction icon.',
      'Give the Popover content an `aria-label` ("Choose an icon").',
      'Pass `onRemove` to offer "Remove" for an existing icon.',
    ]),
  ],
  examples: [ex({ title: 'In a popover', render: () => <EmojiDemo />, code: emojiCode })],
  api: [
    {
      name: 'EmojiPicker',
      props: [
        { name: 'onSelect', type: '(emoji: string) => void', description: 'An emoji was chosen.' },
        { name: 'onSelectIcon', type: '(icon: IconName) => void', description: 'An icon was chosen (Icons tab).' },
        { name: 'onRemove', type: '() => void', description: 'Shows "Remove" and handles it.' },
        { name: 'onUpload', type: '() => void', description: 'Upload tab button.' },
        { name: 'defaultTab', type: ['"emoji"', '"icons"', '"upload"'], default: '"emoji"', description: 'Initial tab.' },
        { name: 'categories', type: 'EmojiCategory[]', default: 'emojiCategories', description: 'Emoji sets (id, label, icon, emoji).' },
        { name: 'highlighted', type: 'string', description: 'Emoji drawn highlighted (static renders).' },
        { name: 'autoFocus', type: 'boolean', default: 'false', description: 'Focus the search field on mount.' },
      ],
    },
  ],
};

/* ================================================================ ColorMenu */

function ColorDemo() {
  const [value, setValue] = useState<ColorValue>({ kind: 'background', color: 'yellow' });
  return (
    <div className="flex flex-wrap items-start justify-center gap-6">
      <MenuSurface width={190}><ColorGrid value={value} recent={[{ kind: 'text', color: 'red' }]} onSelect={setValue} /></MenuSurface>
      <MenuSurface width={220} className="max-h-80 overflow-y-auto"><ColorMenuList value={value} onSelect={setValue} /></MenuSurface>
    </div>
  );
}
const colorCode = `import { useState } from 'react';
import { ColorGrid, ColorMenuList, MenuSurface, type ColorValue } from '@krackedui/motion';

export function ColorPickers() {
  const [value, setValue] = useState<ColorValue>({ kind: 'background', color: 'yellow' });
  return (
    <div className="flex flex-wrap items-start justify-center gap-6">
      <MenuSurface width={190}><ColorGrid value={value} recent={[{ kind: 'text', color: 'red' }]} onSelect={setValue} /></MenuSurface>
      <MenuSurface width={220} className="max-h-80 overflow-y-auto"><ColorMenuList value={value} onSelect={setValue} /></MenuSurface>
    </div>
  );
}`;

export const colorMenuPage: DocPage = {
  eyebrow: 'Pickers',
  title: 'Color Menu',
  description: 'Text and background color pickers: a compact swatch grid and a labelled list.',
  hero: ex({ title: 'Color menu', render: () => <ColorDemo />, code: colorCode }),
  install: install('ColorGrid, ColorMenuList, MenuSurface', `<Theme>\n  <MenuSurface width={190}>\n    <ColorGrid value={value} onSelect={setValue} />\n  </MenuSurface>\n</Theme>`),
  sections: [
    a11y([
      '`ColorGrid`: each section is a labelled group of toggle buttons ("Yellow background"); `aria-pressed` marks the current colors. Tab moves between swatches, Enter/Space picks.',
      '`ColorMenuList`: one listbox; ↑/↓ and Home/End move, Enter or Space picks; `aria-selected` marks the current color. Pass `autoFocus` to focus it on open.',
      'Swatches pair color with a text label (tooltip / row label), never color alone.',
    ]),
    usage([
      'Use the grid in a text toolbar and the list in block menus.',
      'Don\'t use these for arbitrary colors: they offer the ten palette colors only.',
    ]),
  ],
  examples: [ex({ title: 'Grid and list', render: () => <ColorDemo />, code: colorCode })],
  api: [
    {
      name: 'ColorGrid',
      props: [
        { name: 'value', type: 'ColorValue | ColorValue[]', description: 'Current colors (`{ kind: "text" | "background", color }`).' },
        { name: 'recent', type: 'ColorValue[]', description: '"Recently used" section.' },
        { name: 'onSelect', type: '(value: ColorValue) => void', description: 'A swatch was chosen.' },
      ],
    },
    {
      name: 'ColorMenuList',
      props: [
        { name: 'value', type: 'ColorValue | ColorValue[]', description: 'Current colors.' },
        { name: 'lastUsed', type: '{ value: ColorValue; shortcut?: ReactNode }[]', description: '"Last used" rows.' },
        { name: 'onSelect', type: '(value: ColorValue) => void', description: 'A row was chosen.' },
        { name: 'highlighted', type: 'ColorValue', description: 'Initially highlighted row.' },
        { name: 'autoFocus', type: 'boolean', default: 'false', description: 'Focus the list on mount.' },
      ],
    },
    {
      name: 'ColorSwatch',
      props: [
        { name: 'value', type: 'ColorValue', description: 'Required. Color to draw ("A" for text colors).' },
        { name: 'selected', type: 'boolean', default: 'false', description: 'Draw the selected ring.' },
      ],
    },
  ],
};

/* ================================================================ SharePopover */

function ShareDemo() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild><Button variant="ghost">Share</Button></Popover.Trigger>
      <Popover.Content radius="lg" align="end" aria-label="Share">
        <SharePopover
          people={[{ name: 'Ada Lovelace', email: 'ada@example.com', you: true }, { name: 'Alan Turing', email: 'alan@example.com', access: 'Can edit' }]}
          onInvite={() => undefined}
          onCopyLink={() => undefined}
        />
      </Popover.Content>
    </Popover.Root>
  );
}
const shareCode = `import { Button, Popover, SharePopover } from '@krackedui/motion';

export function ShareButton() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild><Button variant="ghost">Share</Button></Popover.Trigger>
      <Popover.Content radius="lg" align="end" aria-label="Share">
        <SharePopover
          people={[{ name: 'Ada Lovelace', email: 'ada@example.com', you: true }, { name: 'Alan Turing', email: 'alan@example.com', access: 'Can edit' }]}
          onInvite={() => undefined}
          onCopyLink={() => undefined}
        />
      </Popover.Content>
    </Popover.Root>
  );
}`;

export const sharePopoverPage: DocPage = {
  eyebrow: 'Pickers',
  title: 'Share Popover',
  description: 'Share panel: invite by email, people with access, general access and copy link. Put it in a Popover.',
  hero: ex({ title: 'Share popover', render: () => <ShareDemo />, code: shareCode }),
  install: install('SharePopover, Popover', `<Theme>\n  <Popover.Root>\n    <Popover.Trigger>Share</Popover.Trigger>\n    <Popover.Content aria-label="Share"><SharePopover people={people} /></Popover.Content>\n  </Popover.Root>\n</Theme>`),
  sections: [
    a11y([
      'Share / Publish tabs follow the WAI-ARIA tabs pattern.',
      'The invite field is labelled "Invite people by email"; Enter submits it.',
      'Access buttons name the person they change ("Can edit, change access for Alan Turing").',
      'The help link says it opens in a new tab; optional controls render only when you pass their handler.',
    ]),
    usage([
      'Use behind a "Share" button for documents and projects.',
      'Wire `onPersonAccess` / `onGeneralAccess` to a Menu or Select that changes the access level.',
    ]),
  ],
  examples: [ex({ title: 'In a popover', render: () => <ShareDemo />, code: shareCode })],
  api: [
    {
      name: 'SharePopover',
      props: [
        { name: 'people', type: '{ name: string; email?: string; you?: boolean; access?: string; avatar?: string }[]', default: '[]', description: 'People with access.' },
        { name: 'generalAccess', type: '{ label: ReactNode; icon?: IconName }', default: '{ label: "Only people invited" }', description: 'General access row.' },
        { name: 'banner', type: 'ReactNode', description: 'Dismissible info banner at the bottom.' },
        { name: 'onInvite', type: '(emails: string) => void', description: 'Invite form submitted.' },
        { name: 'onCopyLink', type: '() => void', description: '"Copy link" clicked.' },
        { name: 'publishContent', type: 'ReactNode', description: 'Content of the Publish tab.' },
        { name: 'helpHref', type: 'string', description: '"Learn about sharing" link (hidden when not set).' },
        { name: 'onPersonAccess', type: '(person: SharePerson) => void', description: 'A person\'s access button.' },
        { name: 'onGeneralAccess', type: '() => void', description: 'The general access button.' },
        { name: 'onAdvanced', type: '() => void', description: 'Shows "Advanced" and handles it.' },
        { name: 'autoFocus', type: 'boolean', default: 'false', description: 'Focus the invite field on mount.' },
      ],
    },
  ],
};

/* ================================================================ registry */

export const componentPages: Record<string, DocPage> = {
  'ui/menu': menuPage,
  'ui/context-menu': contextMenuPage,
  'ui/popover': popoverPage,
  'ui/dialog': dialogPage,
  'ui/confirm-dialog': confirmDialogPage,
  'ui/sheet': sheetPage,
  'ui/toast': toastPage,
  'ui/tabs': tabsPage,
  'ui/breadcrumbs': breadcrumbsPage,
  'ui/steps': stepsPage,
  'ui/command-palette': commandPalettePage,
  'ui/command-palette-dialog': commandPaletteDialogPage,
  'ui/emoji-picker': emojiPickerPage,
  'ui/color-menu': colorMenuPage,
  'ui/share-popover': sharePopoverPage,
};

export const componentNav: NavGroup[] = [
  { title: 'Navigation', items: [{ slug: 'ui/menu' }, { slug: 'ui/context-menu' }, { slug: 'ui/tabs' }, { slug: 'ui/breadcrumbs' }, { slug: 'ui/steps' }, { slug: 'ui/command-palette' }, { slug: 'ui/command-palette-dialog' }] },
  { title: 'Overlays', items: [{ slug: 'ui/popover' }, { slug: 'ui/dialog' }, { slug: 'ui/confirm-dialog' }, { slug: 'ui/sheet' }] },
  { title: 'Feedback', items: [{ slug: 'ui/toast' }] },
  { title: 'Pickers', items: [{ slug: 'ui/emoji-picker' }, { slug: 'ui/color-menu' }, { slug: 'ui/share-popover' }] },
];
