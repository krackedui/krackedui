// Actions: Button, IconButton, Link.
import type { DocPage, NavGroup } from '../../../../apps/docs/lib/types';
import { Button, IconButton, Link, Stack } from '@krackedui/bayrust';
import { a11y, install, usage } from './helpers';

const buttonPage: DocPage = {
  eyebrow: 'Actions',
  title: 'Button',
  description: 'The system’s primary action. One accent, used sparingly: a screen with two primary buttons has none.',
  hero: {
    title: 'Button',
    render: () => (
      <Stack direction="row" gap={8}>
        <Button variant="primary">Save</Button>
        <Button variant="secondary">Cancel</Button>
        <Button variant="ghost">Dismiss</Button>
      </Stack>
    ),
    code: `<Stack direction="row" gap={8}>
  <Button variant="primary">Save</Button>
  <Button variant="secondary">Cancel</Button>
  <Button variant="ghost">Dismiss</Button>
</Stack>`,
  },
  install,
  sections: [
    usage([
      'One primary action per view. `secondary` is the default weight for everything else.',
      '`ghost` is for actions inside a dense row, where a filled button would shout.',
      '`danger` is for destructive actions, and always alongside a confirmation.',
    ]),
    a11y([
      'Renders a real `<button>`, so Enter and Space work without any handler of yours.',
      '`loading` keeps the button’s width and marks it busy, so the layout does not jump and a screen reader is told.',
      'An icon-only action is an `IconButton`, which requires a `label`; a button with no accessible name is not shippable.',
    ]),
  ],
  examples: [
    {
      title: 'Sizes',
      render: () => (
        <Stack direction="row" gap={8}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Stack>
      ),
      code: `<Stack direction="row" gap={8}>
  <Button size="sm">Small</Button>
  <Button size="md">Medium</Button>
  <Button size="lg">Large</Button>
</Stack>`,
    },
    {
      title: 'With an icon',
      render: () => (
        <Stack direction="row" gap={8}>
          <Button variant="primary" icon="plus">
            New snippet
          </Button>
          <Button variant="secondary" icon="download">
            Export
          </Button>
        </Stack>
      ),
      code: `<Stack direction="row" gap={8}>
  <Button variant="primary" icon="plus">New snippet</Button>
  <Button variant="secondary" icon="download">Export</Button>
</Stack>`,
    },
    {
      title: 'Loading and disabled',
      description: 'A loading button keeps its width, so the row it sits in does not reflow.',
      render: () => (
        <Stack direction="row" gap={8}>
          <Button variant="primary" loading>
            Saving
          </Button>
          <Button variant="secondary" disabled>
            Unavailable
          </Button>
        </Stack>
      ),
      code: `<Stack direction="row" gap={8}>
  <Button variant="primary" loading>Saving</Button>
  <Button variant="secondary" disabled>Unavailable</Button>
</Stack>`,
    },
    {
      title: 'Destructive',
      render: () => (
        <Button variant="danger" icon="trash">
          Delete snippet
        </Button>
      ),
      code: `<Button variant="danger" icon="trash">Delete snippet</Button>`,
    },
  ],
  api: [
    {
      name: 'Button',
      props: [
        { name: 'variant', type: ['"primary"', '"secondary"', '"ghost"', '"danger"'], default: '"secondary"' },
        { name: 'size', type: ['"sm"', '"md"', '"lg"'], default: '"md"' },
        { name: 'icon', type: 'IconName', description: 'Leading icon, by name.' },
        { name: 'trailingIcon', type: 'IconName', description: 'Trailing icon, by name.' },
        { name: 'loading', type: 'boolean', description: 'Marks the button busy and keeps its width.' },
        { name: 'disabled', type: 'boolean' },
        { name: 'asChild', type: 'boolean', description: 'Render the child element instead, keeping the styling.' },
      ],
    },
  ],
};

const iconButtonPage: DocPage = {
  eyebrow: 'Actions',
  title: 'IconButton',
  description: 'An action with no text. `label` is required, because an icon alone names nothing.',
  hero: {
    title: 'IconButton',
    render: () => (
      <Stack direction="row" gap={8}>
        <IconButton icon="more" label="More actions" />
        <IconButton icon="star" label="Add to favourites" variant="secondary" />
        <IconButton icon="settings" label="Settings" />
      </Stack>
    ),
    code: `<Stack direction="row" gap={8}>
  <IconButton icon="more" label="More actions" />
  <IconButton icon="star" label="Add to favourites" variant="secondary" />
  <IconButton icon="settings" label="Settings" />
</Stack>`,
  },
  install,
  sections: [
    a11y([
      '`label` becomes the accessible name. It is a required prop, not a convention.',
      'Targets are at least 24×24 px, which is the minimum WCAG 2.5.8 asks for on touch.',
    ]),
  ],
  api: [
    {
      name: 'IconButton',
      props: [
        { name: 'icon', type: 'IconName', description: 'Required.' },
        { name: 'label', type: 'string', description: 'Required. The accessible name.' },
        { name: 'variant', type: ['"ghost"', '"secondary"'], default: '"ghost"' },
        { name: 'size', type: ['"sm"', '"md"', '"lg"'], default: '"md"' },
        { name: 'active', type: 'boolean', description: 'For a toggle in a toolbar that is currently on.' },
      ],
    },
  ],
};

const linkPage: DocPage = {
  eyebrow: 'Actions',
  title: 'Link',
  description: 'Navigation, not action. If it changes where you are, it is a link; if it changes something, it is a button.',
  hero: {
    title: 'Link',
    render: () => (
      <Stack direction="row" gap={12}>
        <Link href="#">Documentation</Link>
        <Link href="#" external>
          Open in browser
        </Link>
      </Stack>
    ),
    code: `<Stack direction="row" gap={12}>
  <Link href="#">Documentation</Link>
  <Link href="#" external>Open in browser</Link>
</Stack>`,
  },
  install,
  sections: [a11y(['`external` adds the trailing icon and the `rel` a new tab needs.'])],
  api: [
    {
      name: 'Link',
      props: [
        { name: 'href', type: 'string' },
        { name: 'external', type: 'boolean', description: 'Opens in a new tab, with the icon and rel that implies.' },
      ],
    },
  ],
};

export const actionPages: Record<string, DocPage> = {
  button: buttonPage,
  'icon-button': iconButtonPage,
  link: linkPage,
};

export const actionNav: NavGroup = {
  title: 'Actions',
  items: [{ slug: 'button' }, { slug: 'icon-button' }, { slug: 'link' }],
};
