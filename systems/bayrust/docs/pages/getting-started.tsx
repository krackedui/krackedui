// Getting started: what Bayrust is, and how to put it in an app.
import type { DocPage, NavSection } from '../../../../apps/docs/lib/types';
import { Button, CardContent, CardHeader, CardRoot, CardTitle, Stack, Stat } from '@krackedui/bayrust';
import { PKG, install } from './helpers';

const introduction: DocPage = {
  eyebrow: 'Getting started',
  title: 'Bayrust',
  description:
    'A dark-first, keyboard-driven React design system: the density and quietness of a launcher, applied to an application.',
  wide: true,
  sections: [
    {
      blocks: [
        'Bayrust is built around a command surface rather than a page. Surfaces are quiet, borders are hairlines, radii are small, and UI text sits at 13–14 px. Selection is a translucent wash rather than a border, and one accent carries the focused row and the primary action.',
        'Dark is the default appearance. Light is a full peer — its values are measured, not derived by inverting the dark ones.',
        'Everything is reachable from the keyboard. If a thing cannot be driven from the keyboard, it is not finished.',
      ],
    },
    {
      title: 'What is here',
      blocks: [
        {
          list: [
            '53 components, from the launcher-dense primitives up to an application shell.',
            '80 interface icons, drawn for this system on a 2 px grid.',
            '467 measured tokens in two appearances, published as DTCG at `' + PKG + '/tokens.json`.',
            'Four charts, with a categorical palette checked for colour-vision separation rather than chosen by eye.',
          ],
        },
      ],
    },
  ],
  install,
  examples: [
    {
      title: 'A card',
      description: 'The density the system is built around.',
      align: 'center',
      render: () => (
        <CardRoot style={{ width: '100%', maxWidth: 280 }}>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack gap={10}>
              <Stat label="Commands run" value="12,480" delta="+8.2%" trend="up" />
              <Button variant="primary">Open report</Button>
            </Stack>
          </CardContent>
        </CardRoot>
      ),
      code: `<CardRoot style={{ width: '100%', maxWidth: 280 }}>
  <CardHeader>
    <CardTitle>Usage</CardTitle>
  </CardHeader>
  <CardContent>
    <Stack gap={10}>
      <Stat label="Commands run" value="12,480" delta="+8.2%" trend="up" />
      <Button variant="primary">Open report</Button>
    </Stack>
  </CardContent>
</CardRoot>`,
    },
  ],
};

const installation: DocPage = {
  eyebrow: 'Getting started',
  title: 'Installation',
  description: 'One package, one stylesheet, one root.',
  wide: true,
  install,
  sections: [
    {
      title: 'With Tailwind',
      blocks: [
        'Already running Tailwind v4? Import `tailwind.css` instead of `styles.css` and the tokens become utilities.',
        {
          code: {
            filename: 'app/globals.css',
            lang: 'css',
            code: `@import "tailwindcss";\n@import "${PKG}/tailwind.css";\n\n/* bg-ds-bg-surface, text-ds-text-secondary, rounded-ds-md, font-ds-mono … */`,
          },
        },
      ],
    },
    {
      title: 'React Server Components',
      blocks: [
        'Components carry `"use client"`. Every compound part also has a flat alias — `SidebarItem` for `Sidebar.Item` — because a server component cannot dot into an object it imports across the boundary.',
        '`cn`, `variants`, `iconPaths` and `iconNames` are pure and ship in a server-safe bundle, so importing them does not pull the components in.',
        {
          code: {
            filename: 'app/page.tsx',
            lang: 'tsx',
            code: `// a server component: no "use client"\nimport { CardRoot, CardHeader, CardTitle, CardContent } from '${PKG}';\n\nexport default function Page() {\n  return (\n    <CardRoot>\n      <CardHeader><CardTitle>Server rendered</CardTitle></CardHeader>\n      <CardContent>No client boundary needed to compose it.</CardContent>\n    </CardRoot>\n  );\n}`,
          },
        },
      ],
    },
  ],
};

export const gettingStartedPages: Record<string, DocPage> = { introduction, installation };

export const gettingStartedNav: NavSection = {
  title: 'Getting started',
  items: [
    { slug: 'introduction', icon: 'introduction' },
    { slug: 'installation', icon: 'installation' },
  ],
};
