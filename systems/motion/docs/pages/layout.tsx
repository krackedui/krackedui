// Layout pages: Theme (the root), Stack, Grid. Divider's page lives in atoms.tsx and is listed here.
import { Badge, Button, Grid, Stack, Theme, useTheme } from '@krackedui/motion';
import type { DocPage, NavGroup } from '../../../../apps/docs/lib/types';
import { docHelpers } from './atoms';

const { PKG, snippet, install, a11y, usage } = docHelpers;

const Cell = ({ children }: { children: string }) => (
  <div className="flex h-12 items-center justify-center rounded-n-md bg-n-bg-tertiary-translucent-a text-n-ui text-n-text-secondary">{children}</div>
);

function ThemeLabel() {
  const { appearance, resolvedAppearance } = useTheme();
  return <span className="text-n-ui text-n-text-secondary">{`appearance: ${appearance} · showing: ${resolvedAppearance}`}</span>;
}

const themePage: DocPage = {
  eyebrow: 'Layout',
  title: 'Theme',
  description: 'The Motion root: applies fonts, tokens, base styles and the light/dark appearance to everything inside, including portalled menus and dialogs.',
  hero: {
    title: 'Theme',
    render: () => (
      <div className="flex flex-wrap justify-center gap-3">
        {(['light', 'dark'] as const).map((a) => (
          <Theme key={a} appearance={a} className="flex flex-col items-start gap-2 rounded-n-lg p-4 shadow-n-shadow-outline-sm">
            <ThemeLabel />
            <Button variant="primary">Save</Button>
          </Theme>
        ))}
      </div>
    ),
    code: `import '${PKG}/styles.css';\nimport { Button, Theme } from '${PKG}';\n\nexport function App() {\n  return (\n    <Theme appearance="system">\n      <Button variant="primary">Save</Button>\n    </Theme>\n  );\n}`,
  },
  install: install('Button', `<Button variant="primary">Save</Button>`),
  examples: [
    {
      title: 'Appearance',
      description: '`light`, `dark`, or `system` (follows the OS; renders light on the server, then updates after mount).',
      render: () => (
        <div className="flex flex-wrap justify-center gap-3">
          {(['light', 'dark', 'system'] as const).map((a) => (
            <Theme key={a} appearance={a} className="rounded-n-lg p-4 shadow-n-shadow-outline-sm">
              <ThemeLabel />
            </Theme>
          ))}
        </div>
      ),
      code: snippet(['Theme'], 'Appearances', `<Theme appearance="light">…</Theme>\n<Theme appearance="dark">…</Theme>\n<Theme appearance="system">…</Theme>`),
    },
    {
      title: 'Next.js root layout',
      description: 'Use `asChild` to make `<body>` the root, so portalled overlays sit inside it.',
      render: () => <Theme className="rounded-n-lg p-4"><ThemeLabel /></Theme>,
      code: `import '${PKG}/styles.css';\nimport type { ReactNode } from 'react';\nimport { Theme } from '${PKG}';\n\nexport default function RootLayout({ children }: { children: ReactNode }) {\n  return (\n    <html lang="en">\n      <Theme asChild appearance="light">\n        <body>{children}</body>\n      </Theme>\n    </html>\n  );\n}`,
    },
    {
      title: 'Reading the theme',
      render: () => <Theme className="rounded-n-lg p-4"><ThemeLabel /></Theme>,
      code: snippet(['useTheme'], 'ThemeLabel', `<span>{appearance} / {resolvedAppearance}</span>`, { hooks: 'const { appearance, resolvedAppearance } = useTheme();' }),
    },
  ],
  api: [
    {
      name: 'Theme',
      description: 'A `<div>` (or your element with `asChild`) with the `motion-root` class; supports all `<div>` props. Adds:',
      props: [
        { name: 'appearance', type: ['"light"', '"dark"', '"system"'], default: '"light"', description: 'Color scheme; also sets CSS `color-scheme`.' },
        { name: 'asChild', type: 'boolean', default: 'false', description: 'Apply the root to the child element instead of a `<div>`.' },
      ],
    },
    {
      name: 'useTheme()',
      description: 'The nearest Theme’s appearance. Throws outside a `<Theme>`.',
      props: [
        { name: 'appearance', type: ['"light"', '"dark"', '"system"'], description: 'What was requested.' },
        { name: 'resolvedAppearance', type: ['"light"', '"dark"'], description: 'What is shown (`system` resolved).' },
      ],
    },
  ],
  sections: [
    a11y([
      'Sets `color-scheme`, so native controls and scrollbars match the theme.',
      'Every text token pair meets WCAG AA (4.5:1) in both themes; `system` respects the user’s OS preference.',
      'Theme adds no landmarks or roles; use `asChild` on `<body>` or `<main>` when you want its semantics.',
    ]),
    usage(
      ['wrap the whole app once (on `<body>` with `asChild`)', 'force a section into the other appearance (a nested `<Theme appearance="dark">`)'],
      ['styling outside Motion components (Motion styles only apply inside a Theme and its overlays)'],
    ),
  ],
};

const stackPage: DocPage = {
  eyebrow: 'Layout',
  title: 'Stack',
  description: 'Flex row or column with gaps from the 4px spacing scale. Direction and gap can change per breakpoint.',
  hero: {
    title: 'Stack',
    render: () => (
      <Stack direction="row" gap={2}>
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Save</Button>
      </Stack>
    ),
    code: snippet(['Button', 'Stack'], 'FormActions', `<Stack direction="row" gap={2}>\n  <Button variant="secondary">Cancel</Button>\n  <Button variant="primary">Save</Button>\n</Stack>`),
  },
  install: install('Stack', `<Stack gap={3}>…</Stack>`),
  examples: [
    {
      title: 'Responsive direction',
      description: 'A column on phones, a row from `md` (768px).',
      align: 'start',
      render: () => (
        <Stack className="w-full" direction={{ base: 'column', md: 'row' }} gap={{ base: 2, md: 4 }}>
          <Cell>One</Cell>
          <Cell>Two</Cell>
          <Cell>Three</Cell>
        </Stack>
      ),
      code: snippet(['Stack'], 'ResponsiveStack', `<Stack direction={{ base: 'column', md: 'row' }} gap={{ base: 2, md: 4 }}>\n  <div>One</div>\n  <div>Two</div>\n  <div>Three</div>\n</Stack>`),
    },
    {
      title: 'Align and justify',
      align: 'start',
      render: () => (
        <Stack className="w-full" direction="row" align="center" justify="between" gap={3}>
          <span className="text-n-ui-medium text-n-text-primary">Members</span>
          <Button variant="primary" size="sm" icon="plus">Invite</Button>
        </Stack>
      ),
      code: snippet(['Button', 'Stack'], 'HeaderRow', `<Stack direction="row" align="center" justify="between" gap={3}>\n  <span>Members</span>\n  <Button variant="primary" size="sm" icon="plus">Invite</Button>\n</Stack>`),
    },
    {
      title: 'Wrap',
      render: () => (
        <Stack className="max-w-60" direction="row" gap={1} wrap>
          {['Design', 'Research', 'Q3', 'Roadmap', 'Hiring', 'Docs'].map((t) => <Badge key={t}>{t}</Badge>)}
        </Stack>
      ),
      code: snippet(['Badge', 'Stack'], 'WrappedBadges', `<Stack direction="row" gap={1} wrap>\n  <Badge>Design</Badge>\n  <Badge>Research</Badge>\n  <Badge>Roadmap</Badge>\n</Stack>`),
    },
  ],
  api: [
    {
      name: 'Stack',
      description: 'A flex `<div>`; supports all of its props. Adds:',
      props: [
        { name: 'direction', type: ['"column"', '"row"', '{ base, sm, md, lg, xl }'], default: '"column"', description: 'Main axis, optionally per breakpoint (sm 640, md 768, lg 1024, xl 1280).' },
        { name: 'gap', type: ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '{ base, sm, md, lg, xl }'], description: 'Space between children in 4px steps (`4` = 16px).' },
        { name: 'align', type: ['"start"', '"center"', '"end"', '"stretch"', '"baseline"'], description: 'Cross-axis alignment.' },
        { name: 'justify', type: ['"start"', '"center"', '"end"', '"between"'], description: 'Main-axis distribution.' },
        { name: 'wrap', type: 'boolean', default: 'false', description: 'Let children wrap.' },
        { name: 'asChild', type: 'boolean', default: 'false', description: 'Put the layout on the child element.' },
      ],
    },
  ],
  sections: [
    a11y(['Layout only: no role. Use `asChild` to lay out a semantic element (`<nav>`, `<ul>`, `<form>`).', 'Visual order follows DOM order, so keyboard and reading order stay the same at every breakpoint.']),
    usage(['space groups of controls and content blocks', 'switch from a column on phones to a row on wide screens'], ['equal-width columns (use Grid)', 'adding separators (use Divider between children)']),
  ],
};

const gridPage: DocPage = {
  eyebrow: 'Layout',
  title: 'Grid',
  description: 'Equal columns (1–6 or 12) with gaps from the spacing scale, per breakpoint.',
  hero: {
    title: 'Grid',
    align: 'start',
    render: () => (
      <Grid className="w-full" columns={{ base: 1, sm: 2, lg: 4 }} gap={3}>
        {['Revenue', 'Users', 'Churn', 'NPS'].map((t) => <Cell key={t}>{t}</Cell>)}
      </Grid>
    ),
    code: snippet(['Grid'], 'StatGrid', `<Grid columns={{ base: 1, sm: 2, lg: 4 }} gap={3}>\n  <div>Revenue</div>\n  <div>Users</div>\n  <div>Churn</div>\n  <div>NPS</div>\n</Grid>`),
  },
  install: install('Grid', `<Grid columns={3} gap={4}>…</Grid>`),
  examples: [
    {
      title: 'Fixed columns',
      align: 'start',
      render: () => (
        <Grid className="w-full" columns={3} gap={2}>
          {['A', 'B', 'C', 'D', 'E', 'F'].map((t) => <Cell key={t}>{t}</Cell>)}
        </Grid>
      ),
      code: snippet(['Grid'], 'ThreeColumns', `<Grid columns={3} gap={2}>\n  <div>A</div>\n  <div>B</div>\n  <div>C</div>\n</Grid>`),
    },
    {
      title: 'Responsive gap',
      align: 'start',
      render: () => (
        <Grid className="w-full" columns={2} gap={{ base: 2, md: 6 }}>
          {['One', 'Two'].map((t) => <Cell key={t}>{t}</Cell>)}
        </Grid>
      ),
      code: snippet(['Grid'], 'ResponsiveGap', `<Grid columns={2} gap={{ base: 2, md: 6 }}>\n  <div>One</div>\n  <div>Two</div>\n</Grid>`),
    },
    {
      title: 'As a list',
      align: 'start',
      render: () => (
        <Grid asChild className="w-full" columns={{ base: 1, sm: 3 }} gap={2}>
          <ul aria-label="Projects">
            {['Website', 'Mobile app', 'API'].map((t) => <li key={t}><Cell>{t}</Cell></li>)}
          </ul>
        </Grid>
      ),
      code: snippet(['Grid'], 'ProjectList', `<Grid asChild columns={{ base: 1, sm: 3 }} gap={2}>\n  <ul aria-label="Projects">\n    <li>Website</li>\n    <li>Mobile app</li>\n    <li>API</li>\n  </ul>\n</Grid>`),
    },
  ],
  api: [
    {
      name: 'Grid',
      description: 'A CSS grid `<div>`; supports all of its props. Cells may shrink below their content width (`min-width: 0`). Adds:',
      props: [
        { name: 'columns', type: ['1', '2', '3', '4', '5', '6', '12', '{ base, sm, md, lg, xl }'], default: '1', description: 'Equal columns, optionally per breakpoint.' },
        { name: 'gap', type: ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '{ base, sm, md, lg, xl }'], description: 'Space between cells in 4px steps.' },
        { name: 'asChild', type: 'boolean', default: 'false', description: 'Put the grid on the child element (e.g. a `<ul>`).' },
      ],
    },
  ],
  sections: [
    a11y(['Layout only: no role. Use `asChild` with `<ul>` for lists of cards so they are announced as a list.', 'Cells keep DOM order at every breakpoint.']),
    usage(['cards, stats and galleries that reflow by screen width'], ['a single row or column of items (use Stack)', 'tabular data (use Table)']),
  ],
};

export const layoutPages: Record<string, DocPage> = {
  'ui/theme': themePage,
  'ui/stack': stackPage,
  'ui/grid': gridPage,
};

export const layoutNav: NavGroup[] = [
  { title: 'Layout', items: [{ slug: 'ui/theme' }, { slug: 'ui/stack' }, { slug: 'ui/grid' }, { slug: 'ui/divider' }] },
];
