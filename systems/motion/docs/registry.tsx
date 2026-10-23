// Motion docs registry: nav sections → pages. Rendered by apps/docs at /motion/<slug> (motion.krackedui.com/<slug>).
import type { DocsRegistry } from '../../../apps/docs/lib/types';
import { colorPage, iconsPage, motionPage, radiusPage, shadowsPage, spacingPage, typographyPage } from './foundations';
import { buttonPage, iconButtonPage } from './components';
import type { NavGroup } from '../../../apps/docs/lib/types';
import { atomNav, atomPages } from './pages/atoms';
import { componentNav, componentPages } from './pages/components';
import { appNav, appPages } from './pages/app';
import { editorNav, editorPages } from './pages/editor';
import { formsNav, formsPages } from './pages/forms';
import { dataNav, dataPages } from './pages/data';
import { chartsNav, chartsPages } from './pages/charts';
import { layoutNav, layoutPages } from './pages/layout';
import { motionChrome } from './chrome';
import packageExports from './generated/exports.json';

/** Merge nav groups by title (keeps first-seen group order, appends items). */
function mergeNav(...lists: NavGroup[][]): NavGroup[] {
  const out: NavGroup[] = [];
  for (const list of lists) for (const g of list) {
    const hit = out.find((o) => o.title === g.title);
    if (hit) hit.items.push(...g.items.filter((i) => !hit.items.some((h) => h.slug === i.slug)));
    else out.push({ title: g.title, items: [...g.items] });
  }
  return out;
}

const registry: DocsRegistry = {
  id: 'motion',
  name: 'Motion',
  tagline: 'A calm, content-first React design system',
  badge: 'v1.0',
  packageName: '@krackedui/motion',
  previewRootClassName: 'motion-root',
  appUrl: '/motion/fintech/',
  home: 'introduction',
  chrome: motionChrome,
  exports: packageExports,
  nav: [
    {
      title: 'Getting Started',
      items: [
        { slug: 'introduction', icon: 'introduction' },
        { slug: 'installation', icon: 'installation' },
        { slug: 'theming', icon: 'color' },
        { slug: 'templates', icon: 'templates' },
        { slug: 'ai', icon: 'components', title: 'Using with AI' },
      ],
    },
    {
      title: 'Foundations',
      items: [
        { slug: 'foundation/color', icon: 'color' },
        { slug: 'foundation/typography', icon: 'typography' },
        { slug: 'foundation/icons', icon: 'icons' },
        { slug: 'foundation/spacing', icon: 'spacing' },
        { slug: 'foundation/radius', icon: 'radius' },
        { slug: 'foundation/shadows', icon: 'shadow' },
        { slug: 'foundation/motion', icon: 'motion' },
      ],
    },
    {
      title: 'All Components',
      groups: mergeNav([{ title: 'Actions', items: [{ slug: 'ui/button' }, { slug: 'ui/icon-button' }] }], layoutNav, atomNav, formsNav, componentNav, dataNav, chartsNav),
    },
    { ...appNav, groups: [...editorNav, ...(appNav.groups ?? [])] },
  ],
  pages: {
    ...atomPages,
    ...componentPages,
    ...appPages,
    ...editorPages,
    ...layoutPages,
    ...formsPages,
    ...dataPages,
    ...chartsPages,
    introduction: {
      title: 'Introduction',
      description: 'Motion is a calm, content-first React design system: quiet surfaces, dense layouts and a full set of components, from buttons to a block editor and database views.',
      sections: [
        {
          title: 'What’s inside',
          blocks: [
            '`@krackedui/motion` is one npm package:',
            {
              list: [
                'Design tokens for light and dark (`--ds-*` standard names plus Motion’s full palette), as CSS variables, Tailwind utilities and DTCG JSON',
                'An icon set (Lucide drawings, ISC license) behind one `<Icon name>` component',
                'Every KrackedUI standard component: actions, forms, data display, charts, navigation, overlays, feedback and an app shell',
                'Two modules: a block editor and database views (table, board, gallery, list, calendar, timeline, chart)',
                'Two sector templates built only from the package: project management and a fintech dashboard',
              ],
            },
          ],
        },
        {
          title: 'Part of KrackedUI',
          blocks: [
            'Motion is one of the design systems on KrackedUI. Each system keeps its own components and specialty; what they share is the quality bar.',
            'Before a release, Motion passes the KrackedUI gate: strict types, lint, behaviour tests, WCAG 2.2 AA on every example (axe, contrast, focus, touch targets), responsive checks from 320 to 1440 px, install checks in fresh Vite and Next.js apps, visual baselines and two working templates.',
          ],
        },
        {
          title: 'Next Steps',
          blocks: [
            {
              cards: [
                { title: 'Installation', description: 'Install the package and render your first component.', href: '/motion/installation' },
                { title: 'Theming', description: 'Light and dark, tokens, and using them in your own code.', href: '/motion/theming' },
                { title: 'Templates', description: 'Project management and fintech apps built with Motion.', href: '/motion/templates' },
                { title: 'Using with AI', description: 'SYSTEM.md and llms.txt for AI-assisted prototyping.', href: '/motion/ai' },
              ],
            },
          ],
        },
      ],
    },
    installation: {
      title: 'Installation',
      description: 'Install @krackedui/motion from npm, import one stylesheet and wrap your UI in <Theme>. Tailwind is not required.',
      sections: [
        {
          title: 'Setup',
          blocks: [
            {
              steps: [
                { title: 'Install the package (React 19):', packages: ['@krackedui/motion'] },
                {
                  title: 'Import the styles once, in your app entry or root layout:',
                  file: { filename: '/src/main.tsx', lang: 'tsx', code: `import '@krackedui/motion/styles.css';` },
                },
                {
                  title: 'Wrap your UI in `<Theme>`. It applies Motion’s fonts, colors and appearance; menus and dialogs follow it automatically:',
                  file: {
                    filename: '/src/App.tsx',
                    lang: 'tsx',
                    code: `import { Theme, Button } from '@krackedui/motion';\n\nexport function App() {\n  return (\n    <Theme appearance="light">\n      <Button variant="primary">New</Button>\n    </Theme>\n  );\n}`,
                  },
                },
              ],
            },
          ],
        },
        {
          title: 'Next.js (App Router)',
          blocks: [
            'Import the CSS in `app/layout.tsx` and render `<Theme asChild>` around `<body>`. Components work from server components. In a server file, use the flat names of compound parts (`MenuRoot`, `MenuItem`, `DialogContent`, `SidebarItem`…) instead of `Menu.Root`.',
            {
              code: {
                filename: '/app/layout.tsx',
                lang: 'tsx',
                code: `import '@krackedui/motion/styles.css';\nimport type { ReactNode } from 'react';\nimport { Theme } from '@krackedui/motion';\n\nexport default function RootLayout({ children }: { children: ReactNode }) {\n  return (\n    <html lang="en">\n      <Theme asChild appearance="system">\n        <body>{children}</body>\n      </Theme>\n    </html>\n  );\n}`,
              },
            },
          ],
        },
        {
          title: 'Tailwind v4 apps (optional)',
          blocks: [
            'To use Motion’s tokens as utilities in your own code (`bg-n-bg-secondary`, `text-n-text-secondary`, `rounded-n-lg`…), import the Tailwind build instead of `styles.css`:',
            { code: { filename: '/src/app.css', lang: 'css', code: `@import 'tailwindcss';\n@import '@krackedui/motion/tailwind.css';` } },
          ],
        },
        {
          title: 'Start from a template',
          blocks: [
            'Or start a whole app from one of Motion’s templates:',
            { code: { filename: 'terminal', lang: 'bash', code: `npm create @krackedui my-app -- --system motion --template fintech` } },
          ],
        },
        {
          title: 'Copy the source instead',
          blocks: [
            'Prefer owning the code? Every component page has a **Copy the source** section with a one-line `npx shadcn add` command that drops the component and everything it imports into your project.',
          ],
        },
      ],
    },
    theming: {
      title: 'Theming',
      description: 'Light and dark appearance, design tokens, and how to use them in your own code.',
      sections: [
        {
          title: 'Appearance',
          blocks: [
            '`<Theme appearance>` takes `"light"`, `"dark"` or `"system"` (follows the operating system). Everything inside it, and every menu, popover, dialog or toast it opens, uses that appearance.',
            { code: { filename: '/src/App.tsx', lang: 'tsx', code: `import { Theme } from '@krackedui/motion';\n\nexport function App({ children }: { children: React.ReactNode }) {\n  return <Theme appearance="system">{children}</Theme>;\n}` } },
            'Read the current appearance with `useTheme()`: it returns `{ appearance, resolvedAppearance }`.',
          ],
        },
        {
          title: 'Tokens',
          blocks: [
            'Motion exposes two layers of CSS variables:',
            {
              list: [
                '`--ds-*`: the KrackedUI standard names every system provides (`--ds-bg-surface`, `--ds-text-secondary`, `--ds-border-default`, `--ds-accent-default`, `--ds-status-danger`, `--ds-radius-md`, `--ds-shadow-popover`, `--ds-motion-duration-base`…). Use these in code that should work with any KrackedUI system.',
                '`--n-*`: Motion’s full palette and scales (`--n-text-tertiary`, `--n-blue-bg-secondary`, `--n-shadow-outline-lg`…), for Motion-specific work.',
              ],
            },
            'Both switch with the appearance. See [Colors](/motion/foundation/color) and [Typography](/motion/foundation/typography) for every value.',
          ],
        },
        {
          title: 'In your own components',
          blocks: [
            'Never hard-code colors next to Motion components: use the tokens, so your UI follows light and dark and stays consistent.',
            { code: { filename: '/src/Panel.tsx', lang: 'tsx', code: `export function Panel({ children }: { children: React.ReactNode }) {\n  return (\n    <section style={{ background: 'var(--ds-bg-surface-raised)', border: '1px solid var(--ds-border-default)', borderRadius: 'var(--ds-radius-lg)', padding: 16 }}>\n      {children}\n    </section>\n  );\n}` } },
          ],
        },
        {
          title: 'Reduced motion',
          blocks: ['Motion animates overlays, drawers and indicators with `--ds-motion-*` durations. When the user asks the system to reduce motion, slides and scales are turned off automatically.'],
        },
      ],
    },
    templates: {
      title: 'Templates',
      description: 'Full apps built only from @krackedui/motion. Open them live, or start your own project from one.',
      sections: [
        {
          blocks: [
            {
              cards: [
                { title: 'Project management', description: 'My work, projects, a Kanban board with drag and drop, task details, timeline, team and settings.', href: '/motion/project-management/' },
                { title: 'Fintech dashboard', description: 'Balances, cash-flow charts, transactions with filters, cards, payments, budgets and settings.', href: '/motion/fintech/' },
              ],
            },
          ],
        },
        {
          title: 'Start from a template',
          blocks: [
            { code: { filename: 'terminal', lang: 'bash', code: `npm create @krackedui my-app -- --system motion --template project-management\ncd my-app\nnpm install\nnpm run dev` } },
            'Use `--template fintech` for the dashboard. The project is yours: a Vite + React + TypeScript app that depends on `@krackedui/motion` from npm.',
          ],
        },
      ],
    },
    ai: {
      title: 'Using with AI',
      description: 'Give your AI assistant the rules and the full API, so what it builds looks and behaves like Motion.',
      sections: [
        {
          title: 'SYSTEM.md',
          blocks: [
            'The package ships `SYSTEM.md` (`node_modules/@krackedui/motion/SYSTEM.md`): the design rules, tokens, every component’s API and page recipes. Point your assistant at it:',
            { code: { filename: 'prompt', lang: 'bash', code: `Build this screen with @krackedui/motion. Follow node_modules/@krackedui/motion/SYSTEM.md.\nUse only the package's components and tokens; no hard-coded colors.` } },
          ],
        },
        {
          title: 'llms.txt',
          blocks: ['This site publishes `/motion/llms.txt` (an index) and `/motion/llms-full.txt` (every page and example as plain text) for assistants that read the web.'],
        },
        {
          title: 'Other KrackedUI systems',
          blocks: ['Every KrackedUI system ships its own SYSTEM.md and llms.txt. To build with another system, point your assistant at that system’s files: each one has its own components and conventions.'],
        },
      ],
    },
    'foundation/color': colorPage,
    'foundation/typography': typographyPage,
    'foundation/icons': iconsPage,
    'foundation/spacing': spacingPage,
    'foundation/radius': radiusPage,
    'foundation/shadows': shadowsPage,
    'foundation/motion': motionPage,
    'ui/button': buttonPage,
    'ui/icon-button': iconButtonPage,
  },
};

export default registry;
