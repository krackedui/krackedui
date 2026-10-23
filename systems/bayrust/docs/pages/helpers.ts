// Shared bits for Bayrust's docs pages. Kept tiny on purpose: a docs page should read as the page,
// not as a framework.
import type { InstallStep, Section } from '../../../../apps/docs/lib/types';

export const PKG = '@krackedui/bayrust';

/** The install block every component page shows. */
export const install: InstallStep[] = [
  { title: 'Install the package', packages: [PKG] },
  {
    title: 'Import the stylesheet once, at the root of your app',
    file: { filename: 'app/layout.tsx', lang: 'tsx', code: `import '${PKG}/styles.css';` },
  },
  {
    title: 'Wrap your app in a `Theme`',
    file: {
      filename: 'app/layout.tsx',
      lang: 'tsx',
      code: `import { Theme } from '${PKG}';\n\nexport default function Layout({ children }: { children: React.ReactNode }) {\n  return <Theme appearance="dark">{children}</Theme>;\n}`,
    },
  },
];

/** An "Accessibility" section, which the docs place at the end of the page. */
export const a11y = (points: string[]): Section => ({ title: 'Accessibility', blocks: [{ list: points }] });

/** A "Usage" section: when to reach for this, and when not to. */
export const usage = (points: string[]): Section => ({ title: 'Usage', blocks: [{ list: points }] });
