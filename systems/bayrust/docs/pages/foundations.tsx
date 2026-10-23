// Foundations: the appearances, the tokens a consumer actually reaches for, and the icon set.
import type { DocPage, NavSection } from '../../../../apps/docs/lib/types';
import { Button, Icon, iconPaths, Stack, Theme } from '@krackedui/bayrust';
import { PKG, install } from './helpers';

const appearancePage: DocPage = {
  eyebrow: 'Foundations',
  title: 'Appearance',
  description: 'Dark is the default. Light is a full peer: its values are measured, not derived by inverting the dark ones.',
  wide: true,
  install,
  sections: [
    {
      blocks: [
        'Put one `Theme` near the top of your app. Styles only apply inside it, so installing Bayrust never restyles the host page. Nested roots are allowed: a panel can set its own appearance, and overlays opened inside it follow that appearance because they portal into the nearest `Theme` rather than into `document.body`.',
        '`appearance="system"` follows the OS setting. It resolves after mount — reading `matchMedia` during render would differ between the server and the first client paint — so until then it renders dark, the system default.',
      ],
    },
    {
      title: 'Both appearances',
      blocks: [
        {
          example: {
            title: 'Light and dark',
            render: () => (
              <Stack direction="row" gap={12} wrap>
                {(['dark', 'light'] as const).map((a) => (
                  <Theme key={a} appearance={a} style={{ padding: 16, borderRadius: 8, background: 'var(--ds-bg-app)' }}>
                    <Stack gap={8}>
                      <Button variant="primary">{a === 'dark' ? 'Dark' : 'Light'}</Button>
                      <Button variant="secondary">Secondary</Button>
                    </Stack>
                  </Theme>
                ))}
              </Stack>
            ),
            code: `<Stack direction="row" gap={12} wrap>
  <Theme appearance="dark" style={{ padding: 16, borderRadius: 8, background: 'var(--ds-bg-app)' }}>
    <Stack gap={8}>
      <Button variant="primary">Dark</Button>
      <Button variant="secondary">Secondary</Button>
    </Stack>
  </Theme>
  <Theme appearance="light" style={{ padding: 16, borderRadius: 8, background: 'var(--ds-bg-app)' }}>
    <Stack gap={8}>
      <Button variant="primary">Light</Button>
      <Button variant="secondary">Secondary</Button>
    </Stack>
  </Theme>
</Stack>`,
          },
        },
      ],
    },
  ],
  api: [
    {
      name: 'Theme',
      props: [
        { name: 'appearance', type: ['"dark"', '"light"', '"system"'], default: '"dark"' },
        { name: 'className', type: 'string' },
      ],
    },
  ],
};

const tokensPage: DocPage = {
  eyebrow: 'Foundations',
  title: 'Tokens',
  description: '467 measured tokens in two appearances, plus a portable `--ds-*` vocabulary mapped onto them.',
  wide: true,
  sections: [
    {
      blocks: [
        'Every value was measured from the system’s own resolved styles rather than guessed, and each one records where it came from. Inside the system, use Bayrust’s own names; in anything that leaves it, use the `--ds-*` names.',
        'The tokens ship as DTCG, with each entry carrying its light and dark value and the CSS variable it is written to:',
        { code: { filename: 'terminal', lang: 'bash', code: `npm install ${PKG}` } },
        { code: { filename: 'tokens.ts', lang: 'ts', code: `import tokens from '${PKG}/tokens.json';\n\n// { "$type": "color", "$value": "rgb(255, 99, 99)",\n//   "$extensions": { "bayrust": { "cssVar": "--red-contrast",\n//     "modes": { "light": "rgb(177, 36, 36)", "dark": "rgb(255, 99, 99)" } } } }` } },
      ],
    },
    {
      title: 'Contrast',
      blocks: [
        'Four values were raised to clear WCAG AA where the source appearance did not: `--ds-text-tertiary`, `--ds-accent-text` and `--ds-accent-default`. Each is marked `tuned` in `standard.css` with its measured ratio. Standard 2.0 no longer requires a token list, but contrast is still checked on rendered UI, which is where it matters.',
      ],
    },
  ],
};

const iconsPage: DocPage = {
  eyebrow: 'Foundations',
  title: 'Icons',
  description: '80 interface icons, drawn for this system: one 24×24 stroke path each, 1.75 stroke, round caps, geometry on a 2 px grid.',
  wide: true,
  install,
  sections: [
    {
      blocks: [
        'Icons are referenced by name, never imported one by one, so a component can take an `icon` prop without the caller importing anything.',
        {
          example: {
            title: 'Icon',
            render: () => (
              <Stack direction="row" gap={10} align="center" wrap>
                <Icon name="search" />
                <Icon name="settings" />
                <Icon name="chart" size={20} />
                <Icon name="trash" />
              </Stack>
            ),
            code: `<Stack direction="row" gap={10} align="center" wrap>
  <Icon name="search" />
  <Icon name="settings" />
  <Icon name="chart" size={20} />
  <Icon name="trash" />
</Stack>`,
          },
        },
      ],
    },
    {
      title: 'The set',
      blocks: [
        { icons: Object.keys(iconPaths).map((name) => ({ name, render: () => <Icon name={name as keyof typeof iconPaths} /> })) },
      ],
    },
  ],
  api: [
    {
      name: 'Icon',
      props: [
        { name: 'name', type: 'IconName', description: 'Required. One of the 80 names.' },
        { name: 'size', type: 'number', default: '16' },
        { name: 'label', type: 'string', description: 'Gives the icon an accessible name; without it the icon is decorative and hidden.' },
      ],
    },
  ],
};

export const foundationPages: Record<string, DocPage> = {
  appearance: appearancePage,
  tokens: tokensPage,
  icons: iconsPage,
};

export const foundationNav: NavSection = {
  title: 'Foundations',
  items: [
    { slug: 'appearance', icon: 'color' },
    { slug: 'tokens', icon: 'spacing' },
    { slug: 'icons', icon: 'icons' },
  ],
};
