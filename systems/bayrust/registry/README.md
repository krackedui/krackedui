# @krackedui/bayrust

A dark-first, keyboard-driven React design system built around a command surface: a launcher's
density and quietness, applied to an application.

**Not released.** The package is `private` and its version is `0.0.0` on purpose. 53 of the 62
contract entries are implemented and the package builds, but the gate has not passed — there are no
tests, docs or templates yet. `../REPORT.md` says exactly what is missing; `SYSTEM.md` describes the
system itself.

## Install

```bash
npm install @krackedui/bayrust
```

```tsx
import '@krackedui/bayrust/styles.css';
import { Theme, Button } from '@krackedui/bayrust';

<Theme appearance="dark">
  <Button variant="primary">Save</Button>
</Theme>;
```

`styles.css` is precompiled, so nothing in your build has to know about Bayrust. Every rule is scoped
under the element `<Theme>` renders, so installing the package never restyles the rest of your app.

Already running Tailwind v4? Import `tailwind.css` instead and the tokens become utilities
(`bg-ds-bg-surface`, `text-ds-text-secondary`, `rounded-ds-md`):

```css
@import "tailwindcss";
@import "@krackedui/bayrust/tailwind.css";
```

The raw values are also published as DTCG at `@krackedui/bayrust/tokens.json`, each with its light and
dark mode and the CSS variable it is written to.

## Example: a full page

```tsx
import '@krackedui/bayrust/styles.css';
import {
  AppFrame, Sidebar, Topbar, PageHeader, Breadcrumbs, Button, CardRoot, CardHeader, CardTitle,
  CardContent, Stat, Theme, ToastProvider,
} from '@krackedui/bayrust';

export function Page() {
  return (
    <Theme appearance="dark">
      <ToastProvider>
        <AppFrame
          sidebar={
            <Sidebar.Root>
              <Sidebar.Header>Workspace</Sidebar.Header>
              <Sidebar.Section title="Pages">
                <Sidebar.Item icon="home" active>Overview</Sidebar.Item>
                <Sidebar.Item icon="chart">Analytics</Sidebar.Item>
              </Sidebar.Section>
            </Sidebar.Root>
          }
          topbar={
            <Topbar
              breadcrumbs={<Breadcrumbs items={[{ label: 'Home', href: '#' }, { label: 'Overview' }]} />}
              actions={<Button variant="primary" icon="plus">New</Button>}
            />
          }
        >
          <PageHeader title="Overview" description="The last 30 days." />
          <CardRoot>
            <CardHeader>
              <CardTitle>Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <Stat label="Commands run" value="12,480" delta="+8.2%" trend="up" />
            </CardContent>
          </CardRoot>
        </AppFrame>
      </ToastProvider>
    </Theme>
  );
}
```

## React Server Components

Components carry `"use client"`, and every compound part also has a flat alias — `SidebarItem` for
`Sidebar.Item`, `CardTitle` for `Card.Title` — because a server component cannot dot into an object
it imports across the boundary. `cn`, `variants`, `iconPaths` and `iconNames` are pure, and ship in a
server-safe bundle, so importing them does not pull the components in.

## Building it

```bash
npm run build -w @krackedui/bayrust
```

`build/build.mjs` writes `dist/`: `client.js` and `server-safe.js` (esbuild), the types (tsc),
`styles.css` and `tailwind.css` (the `@import`s inlined — there is no CSS compiler in the chain), and
`tokens.json`. The only build dependencies are esbuild and TypeScript; the package itself has no
runtime dependencies at all.
