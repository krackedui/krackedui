# @krackedui/motion

**Motion** is a calm, content-first React design system: design tokens (light and dark), 257 icons,
buttons, forms, data tables, charts, menus, overlays, a full block editor, database views (table, board, gallery, list, calendar,
timeline) and an app shell (sidebar, top bar, pages, peeks, settings).

## Install

```bash
npm install @krackedui/motion
```

Requires React 19 (`react`, `react-dom`). Radix, `tailwind-variants` and `tailwind-merge` come with it.
**Tailwind is not required.**

## Setup

**1. Import the styles once** (app entry, root layout or global CSS):

```ts
import '@krackedui/motion/styles.css';
```

**2. Wrap your UI in `<Theme>`**, which gives it Motion's font, colors and base styles. `appearance` is
`"light"` (default), `"dark"` or `"system"` (follows the OS; `useTheme()` reads it):

```tsx
import { Button, Theme } from '@krackedui/motion';

export function App() {
  return (
    <Theme appearance="light">
      <Button variant="primary">New</Button>
    </Theme>
  );
}
```

That's it. Menus, popovers, tooltips and dialogs pick up the theme automatically even though they
render at the end of `<body>`. The stylesheet only styles elements inside `<Theme>` (and Motion's
own popovers), so it never restyles the rest of your app.

### Next.js (App Router)

Import the CSS in `app/layout.tsx` and make `<body>` the Theme root with `asChild`. Components work from server
components directly (`import { Button } from '@krackedui/motion'`). In a server file, use the flat names of
compound components: `MenuRoot`, `MenuTrigger`, `MenuContent`, `MenuItem` (and `SidebarItem`,
`PopoverContent`, `DialogContent`…) instead of `Menu.Root`. Helpers such as `rt()` and
`createTasksSample()` are server-safe.

```tsx
// app/layout.tsx
import '@krackedui/motion/styles.css';
import type { ReactNode } from 'react';
import { Theme } from '@krackedui/motion';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <Theme asChild appearance="light">
        <body>{children}</body>
      </Theme>
    </html>
  );
}
```

### Tailwind v4 apps (optional)

Use the tokens as utilities in your own code by importing the Tailwind build instead of `styles.css`:

```css
@import 'tailwindcss';
@import '@krackedui/motion/tailwind.css';
```

```tsx
<div className="rounded-n-lg bg-n-bg-secondary p-3 text-n-text-secondary shadow-n-shadow-outline-sm">…</div>
```

Every token is a utility: `bg-n-…`, `text-n-…`, `border-n-…`, `shadow-n-…`, `rounded-n-{xs…3xl}`,
`text-n-{h1,h2,h3,body,ui,…}`. The raw values are CSS variables (`--n-*`) and DTCG tokens in
`@krackedui/motion/tokens.json`.

## What's inside

| Group | Components |
|---|---|
| Atoms | Button, IconButton, Checkbox, RadioGroup/Radio, Switch, TextInput, Textarea, SearchInput, Kbd, Badge, Tag, StatusPill, Avatar, AvatarGroup, Divider, Spinner, Tooltip, Link, PageIcon, DisclosureToggle, DragHandle, Placeholder |
| Forms | Field, Select, Combobox, NumberInput, Slider, Calendar, DatePicker, DateRangePicker, FileUpload |
| Components | Menu, ContextMenu, Popover, Dialog, ConfirmDialog, Sheet, Toast (`ToastProvider` + `useToast`), Tabs, SegmentedControl, Steps, CommandPalette, CommandPaletteDialog, DateMenu, EmojiPicker, ColorGrid/ColorMenuList, SharePopover, Breadcrumbs |
| Data | Card, Stat, Table, DataTable, Pagination, EmptyState, Skeleton, Progress, Accordion, Alert |
| Charts | LineChart, BarChart, DonutChart, Sparkline |
| Blocks | BlockRenderer, BlockContent, TextBlock, Heading, lists, ToDo, Toggle, Quote, Callout, Code, Equation, ImageBlock, Bookmark, SimpleTable, Columns, TableOfContents, PageLink, PageTitle |
| Editor | Editor (slash menu, markdown shortcuts, drag handles, block menu, text toolbar), SlashMenu, BlockActionMenu, TurnIntoMenu, TextToolbar |
| Database | DatabaseView, TableView, BoardView, GalleryView, ListView, CalendarView, TimelineView, ChartView, menus, `useDatabase`, `createTasksSample` |
| App shell | AppFrame, Sidebar, Topbar, PageLayout/PageCover/PageHeader, SidePeek, CenterPeek, SettingsModal |
| Foundations | Theme, Stack, Grid, `Icon` (257 icons), `cn`, `tv`, tokens |

Example: a full page with sidebar, top bar and an editable document.

```tsx
import { AppFrame, Sidebar, Topbar, BreadcrumbTrail, PageLayout, PageHeader, Editor, Theme, rt } from '@krackedui/motion';

export function Page() {
  return (
    <Theme style={{ height: '100vh' }}>
      <AppFrame
        sidebar={<Sidebar.Root><Sidebar.Item icon="page" active>Roadmap</Sidebar.Item></Sidebar.Root>}
        topbar={<Topbar breadcrumbs={<BreadcrumbTrail items={[{ title: 'Roadmap' }]} />} />}
      >
        <PageLayout header={<PageHeader icon="🗺️" title="Roadmap" editable />}>
          <Editor defaultValue={[{ id: '1', type: 'text', text: rt('Start writing…') }]} />
        </PageLayout>
      </AppFrame>
    </Theme>
  );
}
```

## Using it with AI

`SYSTEM.md` ships in this package (`node_modules/@krackedui/motion/SYSTEM.md`): the design rules, tokens,
every component's API and page recipes. Point your assistant at it: "build this with @krackedui/motion and
follow node_modules/@krackedui/motion/SYSTEM.md".

## License

UNLICENSED: all rights reserved. Icons are from [Lucide](https://lucide.dev) (ISC license, see
`LICENSES/lucide.txt`).
