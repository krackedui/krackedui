// Navigation, overlays and feedback: the things that open, and the things that announce.
import type { DocPage, NavGroup } from '../../../../apps/docs/lib/types';
import {
  Alert, Breadcrumbs, Button, Dialog, IconButton, Menu, Popover, Sheet, Stack, Tabs, Tooltip, useToast,
} from '@krackedui/bayrust';
import { a11y, install, usage } from './helpers';

function ToastDemo() {
  const { toast } = useToast();
  return (
    <Button
      variant="primary"
      onClick={() =>
        toast({ message: 'Report scheduled', description: 'Every Monday at 09:00.', tone: 'success' })
      }
    >
      Schedule report
    </Button>
  );
}

const tabsPage: DocPage = {
  eyebrow: 'Navigation',
  title: 'Tabs and Breadcrumbs',
  description: 'Switching between panels, and saying where you are.',
  hero: {
    title: 'Tabs',
    align: 'start',
    render: () => (
      <div style={{ width: '100%', maxWidth: 320 }}>
        <Tabs.Root defaultValue="general">
          <Tabs.List>
            <Tabs.Trigger value="general">General</Tabs.Trigger>
            <Tabs.Trigger value="advanced">Advanced</Tabs.Trigger>
            <Tabs.Trigger value="about">About</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="general">How the launcher opens and where it sits.</Tabs.Content>
          <Tabs.Content value="advanced">Scripts, environment and the command line.</Tabs.Content>
          <Tabs.Content value="about">Version, licence and credits.</Tabs.Content>
        </Tabs.Root>
      </div>
    ),
    code: `<Tabs.Root defaultValue="general">
  <Tabs.List>
    <Tabs.Trigger value="general">General</Tabs.Trigger>
    <Tabs.Trigger value="advanced">Advanced</Tabs.Trigger>
    <Tabs.Trigger value="about">About</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="general">How the launcher opens and where it sits.</Tabs.Content>
  <Tabs.Content value="advanced">Scripts, environment and the command line.</Tabs.Content>
  <Tabs.Content value="about">Version, licence and credits.</Tabs.Content>
</Tabs.Root>`,
  },
  install,
  sections: [
    a11y([
      'The tab list is a `tablist`, the triggers are `tab`s with `aria-selected`, and arrow keys move between them.',
      'Breadcrumbs leave the last item as plain text, because the page you are on is not a link to itself.',
    ]),
  ],
  examples: [
    {
      title: 'Breadcrumbs',
      align: 'start',
      render: () => (
        <Breadcrumbs
          items={[{ label: 'Workspace', href: '#', icon: 'home' }, { label: 'Commands', href: '#' }, { label: 'Clipboard history' }]}
        />
      ),
      code: `<Breadcrumbs
  items={[
    { label: 'Workspace', href: '#', icon: 'home' },
    { label: 'Commands', href: '#' },
    { label: 'Clipboard history' },
  ]}
/>`,
    },
  ],
  api: [
    { name: 'Tabs.Root', props: [{ name: 'value', type: 'string' }, { name: 'defaultValue', type: 'string' }, { name: 'onValueChange', type: '(value: string) => void' }] },
    { name: 'Breadcrumbs', props: [{ name: 'items', type: 'BreadcrumbItem[]', description: 'The last item renders as text, not a link.' }] },
  ],
};

const menuPage: DocPage = {
  eyebrow: 'Overlays',
  title: 'Menu',
  description: 'The actions for a thing, anchored to what you clicked.',
  hero: {
    title: 'Menu',
    render: () => (
      <Menu.Root>
        <Menu.Trigger asChild>
          <Button trailingIcon="chevronDown">Actions</Button>
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Label>Snippet</Menu.Label>
          <Menu.Group>
            <Menu.Item icon="edit" shortcut="⌘E">Rename</Menu.Item>
            <Menu.Item icon="copy" shortcut="⌘D">Duplicate</Menu.Item>
            <Menu.CheckboxItem checked>Pinned</Menu.CheckboxItem>
          </Menu.Group>
          <Menu.Separator />
          <Menu.Item icon="trash" destructive>Delete</Menu.Item>
        </Menu.Content>
      </Menu.Root>
    ),
    code: `<Menu.Root>
  <Menu.Trigger asChild>
    <Button trailingIcon="chevronDown">Actions</Button>
  </Menu.Trigger>
  <Menu.Content>
    <Menu.Label>Snippet</Menu.Label>
    <Menu.Group>
      <Menu.Item icon="edit" shortcut="⌘E">Rename</Menu.Item>
      <Menu.Item icon="copy" shortcut="⌘D">Duplicate</Menu.Item>
      <Menu.CheckboxItem checked>Pinned</Menu.CheckboxItem>
    </Menu.Group>
    <Menu.Separator />
    <Menu.Item icon="trash" destructive>Delete</Menu.Item>
  </Menu.Content>
</Menu.Root>`,
  },
  install,
  sections: [
    a11y([
      'Escape closes the menu and returns focus to the trigger, which then reports `aria-expanded="false"`.',
      'A checkbox item is a `menuitemcheckbox` with `aria-checked`; a radio item is a `menuitemradio`.',
      'The panel flips and clamps to stay on screen rather than running off the edge.',
    ]),
  ],
  api: [
    { name: 'Menu.Root', props: [{ name: 'open', type: 'boolean' }, { name: 'defaultOpen', type: 'boolean' }, { name: 'onOpenChange', type: '(open: boolean) => void' }] },
    { name: 'Menu.Item', props: [{ name: 'icon', type: 'IconName' }, { name: 'shortcut', type: 'ReactNode' }, { name: 'destructive', type: 'boolean' }] },
  ],
};

const dialogPage: DocPage = {
  eyebrow: 'Overlays',
  title: 'Dialog, Sheet, Popover and Tooltip',
  description: 'Four ways of putting something on top, in order of how much they interrupt.',
  hero: {
    title: 'Dialog',
    render: () => (
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <Button variant="danger">Delete snippet</Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Delete snippet</Dialog.Title>
          <Dialog.Description>This removes it from every machine. It cannot be undone.</Dialog.Description>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button>Cancel</Button>
            </Dialog.Close>
            <Button variant="danger">Delete</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    ),
    code: `<Dialog.Root>
  <Dialog.Trigger asChild>
    <Button variant="danger">Delete snippet</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Title>Delete snippet</Dialog.Title>
    <Dialog.Description>This removes it from every machine. It cannot be undone.</Dialog.Description>
    <Dialog.Footer>
      <Dialog.Close asChild><Button>Cancel</Button></Dialog.Close>
      <Button variant="danger">Delete</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>`,
  },
  install,
  sections: [
    usage([
      'A `Dialog` interrupts and demands an answer. A `Sheet` is the same thing entering from an edge, for a longer task on a narrow screen.',
      'A `Popover` is extra detail you can ignore. A `Tooltip` names a control and nothing more — never put an action in one.',
    ]),
    a11y([
      'A dialog is `aria-modal`, labelled by its title and described by its description. It moves focus inside, locks the page scroll, traps Tab, and on Escape restores all three.',
      'Overlays portal into the nearest `Theme`, so a dialog opened from a light panel is light even on a dark page.',
    ]),
  ],
  examples: [
    {
      title: 'Sheet',
      render: () => (
        <Sheet.Root>
          <Sheet.Trigger asChild>
            <Button>Open settings</Button>
          </Sheet.Trigger>
          <Sheet.Content side="right">
            <Sheet.Title>Settings</Sheet.Title>
            <Sheet.Description>Everything about this workspace.</Sheet.Description>
          </Sheet.Content>
        </Sheet.Root>
      ),
      code: `<Sheet.Root>
  <Sheet.Trigger asChild><Button>Open settings</Button></Sheet.Trigger>
  <Sheet.Content side="right">
    <Sheet.Title>Settings</Sheet.Title>
    <Sheet.Description>Everything about this workspace.</Sheet.Description>
  </Sheet.Content>
</Sheet.Root>`,
    },
    {
      title: 'Popover and Tooltip',
      render: () => (
        <Stack direction="row" gap={10} align="center">
          <Popover.Root>
            <Popover.Trigger asChild>
              <Button>Details</Button>
            </Popover.Trigger>
            <Popover.Content>Runs on every save, in the background.</Popover.Content>
          </Popover.Root>
          <Tooltip content="Copy to clipboard">
            <IconButton icon="copy" label="Copy" />
          </Tooltip>
        </Stack>
      ),
      code: `<Stack direction="row" gap={10} align="center">
  <Popover.Root>
    <Popover.Trigger asChild><Button>Details</Button></Popover.Trigger>
    <Popover.Content>Runs on every save, in the background.</Popover.Content>
  </Popover.Root>
  <Tooltip content="Copy to clipboard">
    <IconButton icon="copy" label="Copy" />
  </Tooltip>
</Stack>`,
    },
  ],
  api: [
    { name: 'Dialog.Content', props: [{ name: 'size', type: ['"sm"', '"md"', '"lg"'], default: '"md"' }] },
    { name: 'Sheet.Content', props: [{ name: 'side', type: ['"left"', '"right"', '"bottom"'], default: '"right"' }, { name: 'size', type: ['"sm"', '"md"', '"lg"'] }] },
    { name: 'Tooltip', props: [{ name: 'content', type: 'ReactNode', description: 'Required.' }, { name: 'side', type: 'Side' }, { name: 'delayDuration', type: 'number' }] },
  ],
};

const feedbackPage: DocPage = {
  eyebrow: 'Feedback',
  title: 'Alert and toasts',
  description: 'Something to read in place, and something that arrives and leaves.',
  hero: {
    title: 'Alert',
    align: 'start',
    render: () => (
      <Stack gap={8} style={{ width: '100%', maxWidth: 360 }}>
        <Alert tone="info" title="Two commands need attention">
          They have not run since March.
        </Alert>
        <Alert tone="warning" title="Sync is paused" action={<Button size="sm">Resume</Button>} />
        <Alert tone="danger" title="Could not reach the server" />
      </Stack>
    ),
    code: `<Stack gap={8} style={{ width: '100%', maxWidth: 360 }}>
  <Alert tone="info" title="Two commands need attention">
    They have not run since March.
  </Alert>
  <Alert tone="warning" title="Sync is paused" action={<Button size="sm">Resume</Button>} />
  <Alert tone="danger" title="Could not reach the server" />
</Stack>`,
  },
  install,
  sections: [
    usage([
      'An `Alert` stays until the situation changes. A toast is for something that already happened and needs no answer.',
      'A toast is never the only record of a failure: if the user has to act, it belongs on the page.',
    ]),
    a11y([
      'An alert always draws an icon as well as its tone, so the meaning never rests on colour alone.',
      '`danger` and `warning` are announced assertively; the quieter tones politely.',
      'The toast region is labelled, and a danger toast is assertive.',
      '`useToast` throws outside a `ToastProvider`, naming what to add.',
    ]),
  ],
  examples: [
    {
      title: 'A toast',
      description: 'Needs a `ToastProvider` near the root of your app.',
      render: () => <ToastDemo />,
      code: `function ToastDemo() {
  const { toast } = useToast();
  return (
    <Button
      variant="primary"
      onClick={() => toast({ message: 'Report scheduled', description: 'Every Monday at 09:00.', tone: 'success' })}
    >
      Schedule report
    </Button>
  );
}`,
    },
  ],
  api: [
    { name: 'Alert', props: [{ name: 'tone', type: ['"neutral"', '"accent"', '"info"', '"success"', '"warning"', '"danger"'], default: '"info"' }, { name: 'title', type: 'ReactNode' }, { name: 'action', type: 'ReactNode' }, { name: 'onDismiss', type: '() => void' }] },
    { name: 'useToast', props: [{ name: 'toast', type: '(options: ToastOptions) => string | number' }, { name: 'dismiss', type: '(id: string | number) => void' }] },
  ],
};

export const overlayPages: Record<string, DocPage> = {
  tabs: tabsPage,
  menu: menuPage,
  dialog: dialogPage,
  alert: feedbackPage,
};

export const overlayNav: NavGroup = {
  title: 'Navigation & overlays',
  items: [{ slug: 'tabs' }, { slug: 'menu' }, { slug: 'dialog' }, { slug: 'alert' }],
};
