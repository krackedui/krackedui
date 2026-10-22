// Button and IconButton pages. Live previews import straight from @krackedui/motion.
import { useState } from 'react';
import { Button, IconButton } from '@krackedui/motion';
import type { DocPage } from '../../../apps/docs/lib/types';
import { docHelpers } from './pages/atoms';

const { snippet, install, Dark, darkCode, a11y, usage } = docHelpers;
const row = 'flex flex-wrap items-center justify-center gap-3';

function SaveDemo() {
  const [saving, setSaving] = useState(false);
  return (
    <Button
      variant="primary"
      loading={saving}
      onClick={() => {
        setSaving(true);
        window.setTimeout(() => setSaving(false), 1500);
      }}
    >
      Save changes
    </Button>
  );
}

export const buttonPage: DocPage = {
  eyebrow: 'Components',
  title: 'Button',
  description: 'Text button in four contract variants (plus danger ghost) and three sizes (plus xl), with icons and a loading state.',
  links: [{ label: 'radix-ui (Slot)', href: 'https://www.radix-ui.com/primitives/docs/utilities/slot' }],
  hero: {
    title: 'Button',
    render: () => <Button variant="primary">New page</Button>,
    code: snippet(['Button'], 'ButtonDemo', `<Button variant="primary">New page</Button>`),
  },
  install: install('Button', `<Button variant="primary">Save</Button>`),
  examples: [
    {
      title: 'Variants',
      render: () => (
        <div className={row}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="danger-ghost">Danger ghost</Button>
        </div>
      ),
      code: snippet(['Button'], 'ButtonVariants', `<Button variant="primary">Primary</Button>\n<Button variant="secondary">Secondary</Button>\n<Button variant="ghost">Ghost</Button>\n<Button variant="danger">Danger</Button>\n<Button variant="danger-ghost">Danger ghost</Button>`),
    },
    {
      title: 'Size',
      render: () => (
        <div className={row}>
          <Button variant="secondary" size="sm">Small</Button>
          <Button variant="secondary" size="md">Medium</Button>
          <Button variant="secondary" size="lg">Large</Button>
          <Button variant="secondary" size="xl">Extra large</Button>
        </div>
      ),
      code: snippet(['Button'], 'ButtonSizes', `<Button variant="secondary" size="sm">Small</Button>\n<Button variant="secondary" size="md">Medium</Button>\n<Button variant="secondary" size="lg">Large</Button>\n<Button variant="secondary" size="xl">Extra large</Button>`),
    },
    {
      title: 'With icon',
      render: () => (
        <div className={row}>
          <Button icon="plus">Add a page</Button>
          <Button variant="primary" trailingIcon="chevronDown">New</Button>
        </div>
      ),
      code: snippet(['Button'], 'ButtonIcons', `<Button icon="plus">Add a page</Button>\n<Button variant="primary" trailingIcon="chevronDown">New</Button>`),
    },
    {
      title: 'Loading',
      description: 'The spinner replaces the content without changing the width; clicks are ignored and `aria-busy` is set.',
      render: () => (
        <div className={row}>
          <SaveDemo />
          <Button variant="secondary" loading>Exporting</Button>
        </div>
      ),
      code: snippet(['Button'], 'SaveButton', `<Button\n  variant="primary"\n  loading={saving}\n  onClick={() => {\n    setSaving(true);\n    window.setTimeout(() => setSaving(false), 1500);\n  }}\n>\n  Save changes\n</Button>`, {
        react: ['useState'],
        hooks: 'const [saving, setSaving] = useState(false);',
      }),
    },
    {
      title: 'Disabled',
      render: () => (
        <div className={row}>
          <Button variant="primary" disabled>Primary</Button>
          <Button variant="secondary" disabled>Secondary</Button>
        </div>
      ),
      code: snippet(['Button'], 'DisabledButtons', `<Button variant="primary" disabled>Primary</Button>\n<Button variant="secondary" disabled>Secondary</Button>`),
    },
    {
      title: 'Full width',
      render: () => (
        <div className="w-full max-w-80">
          <Button variant="primary" size="lg" full>Continue</Button>
        </div>
      ),
      code: snippet(['Button'], 'ContinueButton', `<Button variant="primary" size="lg" full>Continue</Button>`),
    },
    {
      title: 'As a link',
      description: 'Use `asChild` to put the button styles on your own element, such as a link.',
      render: () => (
        <Button asChild variant="secondary">
          <a href="#as-a-link">Open settings</a>
        </Button>
      ),
      code: snippet(['Button'], 'LinkButton', `<Button asChild variant="secondary">\n  <a href="/settings">Open settings</a>\n</Button>`),
    },
    {
      title: 'Dark theme',
      render: () => (
        <Dark>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </Dark>
      ),
      code: darkCode(['Button'], 'ButtonsDark', `<Button variant="primary">Primary</Button>\n<Button variant="secondary">Secondary</Button>\n<Button variant="ghost">Ghost</Button>\n<Button variant="danger">Danger</Button>`),
    },
  ],
  api: [
    {
      name: 'Button',
      description: 'A `<button>`; supports all of its props. Adds:',
      props: [
        { name: 'variant', type: ['"primary"', '"secondary"', '"ghost"', '"danger"', '"danger-ghost"'], default: '"ghost"', description: 'Visual style.' },
        { name: 'size', type: ['"sm"', '"md"', '"lg"', '"xl"'], default: '"md"', description: 'Height: 24, 28, 32 or 36px.' },
        { name: 'icon', type: 'IconName', description: 'Leading icon.' },
        { name: 'trailingIcon', type: 'IconName', description: 'Trailing icon (60% opacity).' },
        { name: 'loading', type: 'boolean', default: 'false', description: 'Spinner over the content, same width, `aria-busy`, clicks ignored.' },
        { name: 'full', type: 'boolean', default: 'false', description: 'Stretch to the container width.' },
        { name: 'type', type: ['"button"', '"submit"', '"reset"'], default: '"button"', description: 'Native button type.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Dims and blocks interaction.' },
        { name: 'asChild', type: 'boolean', default: 'false', description: 'Merge props onto the child element (Radix Slot).' },
      ],
    },
  ],
  sections: [
    a11y([
      '`Tab` focuses the button; `Enter` and `Space` activate it. The blue focus ring shows on keyboard focus.',
      'Defaults to `type="button"`, so it never submits a form by accident; pass `type="submit"` for the form’s main action.',
      '`loading` keeps the accessible name, sets `aria-busy` and `aria-disabled`, and keeps focus on the button.',
      'Icon-only actions need a name: use IconButton. On touch screens every button is at least 24×24.',
    ]),
    usage(
      ['trigger an action: save, create, confirm, open a menu', '`primary` once per view for the main action; `danger` to confirm destructive actions'],
      ['navigate between pages (use Link, or Button `asChild` with a link when it must look like a button)', 'an icon without text (use IconButton)'],
    ),
  ],
};

export const iconButtonPage: DocPage = {
  eyebrow: 'Components',
  title: 'Icon Button',
  description: 'Square, icon-only button for toolbars, sidebars and row actions, with a required label and an optional tooltip.',
  hero: {
    title: 'Icon Button',
    render: () => <IconButton icon="more" label="More actions" tooltip />,
    code: snippet(['IconButton'], 'IconButtonDemo', `<IconButton icon="more" label="More actions" tooltip />`),
  },
  install: install('IconButton', `<IconButton icon="plus" label="Add" />`),
  examples: [
    {
      title: 'Size',
      render: () => (
        <div className={row}>
          <IconButton size="xs" icon="plus" label="Add (extra small)" />
          <IconButton size="sm" icon="plus" label="Add (small)" />
          <IconButton size="md" icon="plus" label="Add (medium)" />
          <IconButton size="lg" icon="plus" label="Add (large)" />
        </div>
      ),
      code: snippet(['IconButton'], 'IconButtonSizes', `<IconButton size="xs" icon="plus" label="Add" />\n<IconButton size="sm" icon="plus" label="Add" />\n<IconButton size="md" icon="plus" label="Add" />\n<IconButton size="lg" icon="plus" label="Add" />`),
    },
    {
      title: 'Variant',
      render: () => (
        <div className={row}>
          <IconButton variant="ghost" icon="settings" label="Settings" />
          <IconButton variant="secondary" icon="settings" label="Settings (secondary)" />
        </div>
      ),
      code: snippet(['IconButton'], 'IconButtonVariants', `<IconButton variant="ghost" icon="settings" label="Settings" />\n<IconButton variant="secondary" icon="settings" label="Settings" />`),
    },
    {
      title: 'Tone',
      description: 'Icon color: `primary` for toolbars, `secondary` / `tertiary` for quieter row affordances.',
      render: () => (
        <div className={row}>
          <IconButton tone="primary" icon="more" label="More (primary)" />
          <IconButton tone="secondary" icon="more" label="More (secondary)" />
          <IconButton tone="tertiary" icon="more" label="More (tertiary)" />
        </div>
      ),
      code: snippet(['IconButton'], 'IconButtonTones', `<IconButton tone="primary" icon="more" label="More" />\n<IconButton tone="secondary" icon="more" label="More" />\n<IconButton tone="tertiary" icon="more" label="More" />`),
    },
    {
      title: 'Active and tooltip',
      render: () => (
        <div className={row}>
          <IconButton active icon="sidebar" label="Sidebar open" />
          <IconButton tooltip icon="bell" label="Updates" />
          <IconButton tooltip="Copy link (⌘⌥L)" icon="link" label="Copy link" />
        </div>
      ),
      code: snippet(['IconButton'], 'IconButtonStates', `<IconButton active icon="sidebar" label="Sidebar open" />\n<IconButton tooltip icon="bell" label="Updates" />\n<IconButton tooltip="Copy link (⌘⌥L)" icon="link" label="Copy link" />`),
    },
    {
      title: 'Disabled',
      render: () => <IconButton disabled icon="trash" label="Delete" />,
      code: snippet(['IconButton'], 'DisabledIconButton', `<IconButton disabled icon="trash" label="Delete" />`),
    },
    {
      title: 'Dark theme',
      render: () => (
        <Dark>
          <IconButton icon="more" label="More" />
          <IconButton variant="secondary" icon="plus" label="Add" />
          <IconButton active icon="star" label="Favorite" />
        </Dark>
      ),
      code: darkCode(['IconButton'], 'IconButtonsDark', `<IconButton icon="more" label="More" />\n<IconButton variant="secondary" icon="plus" label="Add" />\n<IconButton active icon="star" label="Favorite" />`),
    },
  ],
  api: [
    {
      name: 'IconButton',
      description: 'A `<button>`; supports all of its props. Adds:',
      props: [
        { name: 'icon', type: 'IconName', description: 'Icon to render (required).' },
        { name: 'label', type: 'string', description: 'Accessible name (required).' },
        { name: 'size', type: ['"xs"', '"sm"', '"md"', '"lg"'], default: '"md"', description: '20, 24, 28 or 32px square (at least 24 on touch screens).' },
        { name: 'variant', type: ['"ghost"', '"secondary"'], default: '"ghost"', description: 'Bare, or a hairline-bordered surface.' },
        { name: 'tone', type: ['"primary"', '"secondary"', '"tertiary"'], default: '"primary"', description: 'Icon color.' },
        { name: 'active', type: 'boolean', default: 'false', description: 'Pressed / open state background.' },
        { name: 'tooltip', type: ['boolean', 'ReactNode'], default: 'false', description: '`true` shows `label` in a Tooltip; a node shows that instead. `false` uses the native `title`.' },
        { name: 'iconSize', type: 'number', description: 'Override the icon size in px.' },
        { name: 'type', type: ['"button"', '"submit"', '"reset"'], default: '"button"', description: 'Native button type.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Dims and blocks interaction.' },
      ],
    },
  ],
  sections: [
    a11y([
      '`label` becomes `aria-label`, so the button always has a name; the icon is hidden from assistive tech.',
      '`Tab` focuses it; `Enter` / `Space` activate it. With `tooltip`, the hint also shows on keyboard focus.',
      'For a toggle, add `aria-pressed`; for a menu trigger, the Menu adds `aria-expanded`. `active` alone is visual.',
      'Sizes below 24px grow to 24×24 on touch screens.',
    ]),
    usage(['compact toolbar and row actions with a well-known icon (more, close, add)'], ['actions whose icon is not obvious (use Button with text)', 'the main action of a view (use a primary Button)']),
  ],
};
