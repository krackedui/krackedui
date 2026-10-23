# @krackedui/motion: rules for building and prototyping with AI

Give this file (it ships at `node_modules/@krackedui/motion/SYSTEM.md`) to an AI assistant when you build or
prototype with **@krackedui/motion** (v0.2, light + dark).

---

## 1. Character of the system

Motion is **quiet, typographic and content-first**. The UI almost disappears:
- Warm neutrals, not pure grays: text `#2c2c2b` on `#fff` (light), `#f0efed` on `#191919` (dark).
  Grays have a slight brown/olive cast (translucent overlays are `rgba(55,53,47,…)` in light,
  `rgba(255,255,255,…)` in dark).
- **One accent: blue** (`#2783de`), used sparingly: primary buttons, links in UI, focus rings,
  selected states, "New" badges. Everything else is neutral.
- **Hover = a translucent tint**, never a border or shadow change (`button-hover-bg-a`).
- Controls are small and dense: 28px buttons, 28px menu rows, 30px sidebar rows, 14px UI text.
- Content is generous: 16px/24px body text, 708–720px page column, 96px gutters, 40px page title.
- Surfaces float with a **hairline ring + soft shadow** (`shadow-outline-*`), radius 10 for menus,
  6 for controls, 4 for tags.
- Affordances appear on hover (⋮⋮ handles, "+", "OPEN", "…", chevrons) and hide otherwise.
- 10 named colors (gray, brown, orange, yellow, green, blue, purple, pink, red, teal) are the only
  "decorative" colors: tags, callouts, text/background highlights, status.
- Motion is near-instant: 20ms hover tint, 200ms sidebar/toggle transitions, no bouncy easing.

If something you build looks "designed" (gradients, big shadows, bright fills, rounded-full pills
everywhere), it is not Motion.

---

## 2. Setup

```bash
npm install @krackedui/motion        # React 19; Tailwind not required
```
```tsx
import '@krackedui/motion/styles.css';                       // once (entry / root layout)
import { Theme, Button, Menu, Editor, DatabaseView, AppFrame, Icon } from '@krackedui/motion';

<Theme appearance="light">                            {/* "dark" | "system"; useTheme() reads it; asChild to use <body> */}
  …
</Theme>
```
- Next.js App Router: works in server components; there, use flat compound names (`MenuRoot`, `MenuItem`,
  `SidebarItem`…) instead of `Menu.Root`. Helpers (`rt`, `blockId`, `createTasksSample`, `cn`) are server-safe.
- Tailwind v4 apps that want the token utilities in their own markup: `@import "tailwindcss"; @import "@krackedui/motion/tailwind.css";`
- Inside the package: React 19, Radix primitives (`radix-ui`), `tailwind-variants`; utilities `cn(...)`, `tv(...)`.

---

## 3. Tokens

Three layers, all CSS variables:
1. **`--n-*` tokens** (755 colors/shadows + type, radius, motion).
   Every color token is also a Tailwind utility: `bg-n-…`, `text-n-…`, `border-n-…`, `shadow-n-…`.
2. **`--ds-*` standard vocabulary** (same names in every system; see `standard/SPEC.md`).
3. Component variants (`buttonVariants`, `menuStyles`, …).

Naming: `--n-{color?}-{role}-{level}` where role ∈ text, bg, border, icon; level ∈ primary,
secondary, tertiary, disabled, inverse-primary, accent-primary, strong; suffix **`-a`** = translucent.

### 3.1 Core colors

| Token (utility) | Light | Dark | Use |
|---|---|---|---|
| `text-n-text-primary` | #2c2c2b | #f0efed | body text, titles, menu labels |
| `text-n-text-secondary` | #7d7a75 | #ada9a3 | section labels, secondary info |
| `text-n-text-tertiary` | #a19e99 | #7d7a75 | placeholders, shortcuts, hints, counts |
| `text-n-text-disabled` | #bcbab6 | #5f5e59 | disabled |
| `bg-n-bg-primary` | #fff | #191919 | page, editor |
| `bg-n-bg-secondary` | #f9f8f7 | #202020 | sidebar |
| `bg-n-bg-tertiary` | #f0efed | #383836 | wells, code bg base |
| `bg-n-bg-elevated` | #fff | #202020 | cards; menus use popover bg (#fff / #252525) |
| `bg-n-button-hover-bg-a` | rgba(55,53,47,.06) | rgba(255,255,255,.055) | **every hover** |
| `bg-n-button-pressed-bg-a` | rgba(55,53,47,.16) | rgba(255,255,255,.03) | pressed |
| `bg-n-bg-interactive-translucent-a` | rgba(33,27,23,.05) | rgba(255,255,255,.055) | active sidebar row, inputs |
| `border-n-border-primary` | #e6e5e3 | #383836 | dividers, table lines |
| `border-n-border-primary-translucent-a` | rgba(28,19,1,.11) | rgba(255,255,235,.1) | hairlines on any bg |
| `border-n-border-strong` | #d4d3cf | #5f5e59 | input outlines |
| `text-n-icon-primary` | #383836 | #e6e5e3 | icons in menus, topbar |
| `text-n-icon-secondary` | #8e8b86 | #ada9a3 | sidebar icons |
| `text-n-icon-tertiary` | #ada9a3 | #7d7a75 | handles, chevrons, hover affordances |
| `bg-n-blue-icon-accent-primary` | #2783de | #2783de | primary button fill, checkbox checked |
| `shadow-n-focus-shadow` | blue 1px inset + 2px ring | same | focus |
| `bg-n-overlay-smoke-a` | rgba(15,15,15,.6) | rgba(15,15,15,.8) | modal backdrop |

### 3.2 Named colors (tags, callouts, highlights)

All palette text colors (`<c>-text-secondary`, `<c>-text-accent-primary`) pass 4.5:1 on page, sidebar and their own tints in both
themes. For money / status text use the tone aliases `text-n-text-success | danger | warning | info`, or `toneText[tone]` from code.

For each `c` in **gray, brown, orange, yellow, green, blue, purple, pink, red, teal**:
`text-n-{c}-text-secondary` (colored text), `bg-n-{c}-bg-secondary` (tag/highlight fill),
`bg-n-{c}-bg-primary` (callout fill, lighter), `text-n-{c}-icon-accent-primary` (dots, solid accents),
`border-n-{c}-border-primary` (ring). Ready-made: `<Tag color="green">`, `<StatusPill color="done">`,
`<Callout color="blue_background">`, block colors `'red' | 'red_background' | …`.

### 3.3 Typography

Font: `var(--n-font-sans)` = `ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI Variable Display", "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif`.
Mono (code): `SFMono-Regular, Menlo, Consolas, "PT Mono", "Liberation Mono", Courier, monospace`.
Serif page style: `Lyon-Text, Georgia, ui-serif, serif` (Lyon is proprietary: Georgia fallback).

| Style (utility) | Size / line | Weight | Where |
|---|---|---|---|
| `text-n-page-title` | 40 / 48 | 700 | page title |
| `text-n-h1` | 30 / 39 | 600 | Heading 1 (30px top padding) |
| `text-n-h2` | 24 / 31.2 | 600 | Heading 2, database title (26px top) |
| `text-n-h3` | 20 / 26 | 600 | Heading 3 (22px top) |
| `text-n-body` | 16 / 24 | 400 | blocks |
| `text-n-ui-lg` | 15 / 22.5 | 500 | board/gallery card titles |
| `text-n-ui` | 14 / 20 | 400 | UI, tables, sidebar (sidebar rows 14/21) |
| `text-n-ui-medium` | 14 / 20 | 500 | buttons, tabs |
| — | 14 / 16.8 | 400 | menu rows |
| `text-n-caption` | 12 / 16 | 500 | section labels (12/14.4 500 in menus) |
| `text-n-ui-sm` | 12 / 16 | 400 | shortcuts, footers, meta |
| `text-n-code` | 13.6 / 20.4 | 400 | code blocks |
| inline code | 85% (13.6px) | 400 | red text `red-text-secondary`, chip bg, radius 4, padding 0.2em 0.4em |

Bold in content = **600**, not 700. No letter-spacing anywhere except the page title (slightly tight).

### 3.4 Spacing, sizes, radius, shadow, motion

- Rhythm: 2 · 4 · 6 · 8 · 12 · 16 · 24 · 32 · 48 · 96 px.
- Blocks: each block has 6px vertical padding (`py-1.5`) around a 2px-padded text leaf; list items 1px
  apart inside a run; nested blocks indent 24px (lists: marker column 24px + 4px).
- Page: column 708–720px, gutters ≥ 96px, title at ~372px from top under a 280px (30vh) cover,
  78px icon overlapping the cover by half. Full-width pages: 96px | 1fr | 96px.
- Controls: button 28 (sm 24, lg 32), icon button 28 (24, 20), menu row 28, sidebar row 30,
  table row 37 + 36 header, input 28, tag 20, switch 30×18, checkbox 16.
- Sidebar: 270px (resizable 200–480), bg-secondary.
- Radius: `rounded-n-xs` 3 · `sm` 4 (tags, kbd) · `md` 6 (buttons, rows) · `lg` 8 · `xl` 10 (menus, callouts) · `3xl` 14 (floating sidebar).
- Shadows: menus/popovers `shadow-n-shadow-outline-lg`; small cards `shadow-n-shadow-outline-sm`;
  modals `shadow-n-shadow-outline-scroll`. In dark mode all of these add a 1px `#383836` ring.
- Motion: hover tint `duration-[20ms] ease-in`; sidebar/toggle/peek 200ms ease; no spring.

### 3.5 Icons

`<Icon name="plus" size={16} />`: 257 icons drawn from Lucide (ISC), `currentColor`, decorative unless you pass `label`.
Every portable KrackedUI name works (`close`, `more`, `chevronDown`, `search`, `settings`, `trash`, `success`…: see §3.6); the
Motion names below are extras. Drawn at 20 (small variants at 16). Common: `plus`, `plusSmall`, `ellipsis`, `ellipsisSmall`,
`dragHandle`, `magnifyingGlass`, `page`, `pageEmpty`, `lock`, `link`, `star`, `trash`, `duplicate`,
`arrowChevronSingleRightSmall`, `arrowChevronSingleDownSmall`, `checkmarkSmall`, `xMarkSmall`,
`gear`, `bell`, `clock`, `people`, `person`, `calendarAltEmpty`, `viewTable`, `viewBoard`,
`viewCalendar`, `viewTimeline`, `viewChart`, `squareGrid2X2` (gallery), `listBullet`, `filter`,
`arrowUpDown` (sort), `lightning`, `sidebarLeft`, `peekSide`, `textBold`, `textItalic`,
`textUnderline`, `textStrikethrough`, `code`, `squareRoot`, `textH1`…`textH4`, `listToggle`,
`checkmarkSquare`, `quote`, `calloutBlock`, `emojiFace`, `photo`, `bookmark`, `link`.
Full list: `iconNames` / docs Foundations → Icons. Icons in menus are 20px in `icon-primary`;
sidebar icons 20px `icon-secondary`; affordances 16px `icon-tertiary`.

### 3.6 Shared value names

Motion uses the same small vocabulary across its components:
- `size`: `'sm' | 'md' | 'lg'` (Motion adds `xs`/`xl` on some components). Default `md`.
- `tone` (Badge, Alert, Progress, Stat delta, toasts, Sparkline): `'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'`.
  In Motion: neutral = gray, accent/info = blue, success = green, warning = orange, danger = red.
- `color` (Tag, chart series): `'gray' | 'brown' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'purple' | 'pink' | 'red'`.
- Value controls: `value` / `defaultValue` / `onValueChange(value)`; checkables: `checked` / `defaultChecked` / `onCheckedChange`;
  overlays: `open` / `defaultOpen` / `onOpenChange`. All form controls take `invalid`, `disabled`, `required`, `name`, `id`.
- Options (Select, Combobox): `{ value, label, icon?, description?, disabled? }[]`.
- Portable icon names: `plus minus close check search filter sort settings more moreVertical menu edit trash copy link
  externalLink download upload share send refresh drag attachment logout star heart bookmark pin eye eyeOff lock unlock
  chevronDown/Up/Left/Right chevronsUpDown arrowUp/Down/Left/Right arrowUpRight home sidebar grid list user users bell
  calendar clock mail phone file folder image globe chart board table timeline tag flag comment inbox archive wallet
  creditCard bank currency receipt trendingUp trendingDown info warning error success help sun moon`.
- Compounds are objects (`Menu.Root`, `Card.Title`…); every part also has a flat alias (`MenuRoot`, `CardTitle`) for
  React Server Components.

---

## 4. Components (import from `@krackedui/motion`)

Format: **Name** `import` · key props · when to use. Every component forwards `className`/`style` and spreads
native props onto its root. Docs: one page per component (`ui/<kebab-name>`).

### Foundations and layout
- **Theme** (`appearance: 'light'|'dark'|'system'`, `asChild`) + `useTheme()` → `{ appearance, resolvedAppearance }`.
  Wrap the app once; a nested `<Theme appearance="dark">` forces a section dark. Portalled menus/dialogs follow it.
  Each overlay follows the Theme it opens from (light and dark Themes can share a page); for your own floating UI use `<ThemePortal>` (`primitive={X.Portal}` for Radix).
- **Icon** (`name`, `size`, `label`): decorative by default; `label` makes it an image with a name.
- **Stack** (`direction: 'row'|'column'`, `gap: 0|1|2|3|4|5|6|8|10|12|16` (×4px), `align`, `justify: start|center|end|between`, `wrap`, `asChild`).
  `direction` and `gap` accept responsive objects `{ base, sm, md, lg, xl }`.
- **Grid** (`columns: 1–6|12`, `gap`, responsive like Stack, `asChild`). Use for card grids and dashboards.
- **Divider** (`orientation`, `block` = 1px line with block spacing).

### Actions
- **Button** (`variant: 'primary'|'secondary'|'ghost'|'danger'|'danger-ghost'`, `size: sm|md|lg|xl` = 24/28/32/36, `icon`, `trailingIcon`,
  `loading`, `full`, `type` default "button", `asChild`). Default `ghost md`. One `primary` per view; `secondary` = bordered.
- **IconButton** (`icon`, `label` **required** (accessible name), `size: xs|sm|md|lg` = 20/24/28/32, `variant: ghost|secondary`,
  `tone: primary|secondary|tertiary` (icon color), `active`, `tooltip` (`true` = label in a Tooltip)).
- **Link** (`href`, `variant: inline|accent|subtle`, `external` = new tab + rel + hint).

### Forms (always inside a Field)
- **Field** (`label` required, `description`, `error` (presence = invalid), `required`, `hideLabel`, `disabled`): wraps ONE control and
  wires `id`, `aria-describedby`, `aria-invalid`, `aria-required`. The control may sit inside a layout wrapper. Never put a Menu in a
  Field (use Select / Combobox); custom controls: `htmlFor` + same `id`, or `useFieldProps(props)` / `useFieldControl()`. Warns in dev when
  its label names no control.
- **TextInput** (`size`, `icon`, `trailing`, `type`, `invalid`) · **Textarea** (`rows`, `invalid`) · **SearchInput** (`variant: field|bare`,
  `onClear`, Escape clears).
- **NumberInput** (`value: number|null`, `onValueChange`, `min`, `max`, `step`, `format: Intl.NumberFormatOptions`, `locale`, `stepper`,
  `align: start|end`, `trailing`, plus any input attribute): money, quantities, percentages. Formats on blur, arrows step (Shift ×10).
- **Select** (`options`, `value`, `onValueChange`, `placeholder`, `size`): one of ≤ ~15 options. An option with `value: ''` is a
  valid "All" / "None" choice. **Combobox** (+ `searchPlaceholder`,
  `emptyText`, `filter`): long or searchable lists. `multiple` (Motion extra): `value: string[]`, chips, Enter / click toggles.
- **Checkbox** (`checked: boolean|'indeterminate'`, `onCheckedChange`, `label`, `size: sm|md`) · **RadioGroup** (`value`, `onValueChange`,
  `orientation`) + **Radio** (`value`, `label`) · **Switch** (`checked`, `onCheckedChange`, `label`, `size: sm|md`): settings that apply at once.
- **Slider** (`value: number[]` (one or two thumbs), `onValueChange`, `onValueCommit`, `min`, `max`, `step`, `label`, `formatValue`).
- **SegmentedControl** (`options: { value, label?, icon?, 'aria-label'? }[]`, `value`, `onValueChange`, `size`, `full`): 2–5 exclusive
  view options shown inline (a radio group). Segments size to their labels; `full` stretches them to equal widths.
- **Calendar** (`value: Date|null`, `onValueChange`, `min`, `max`, `today`, `locale`, `weekStartsOn`): always-visible month grid.
- **DatePicker** (`value`, `onValueChange`, `placeholder`, `min`, `max`, `clearable`, `formatValue`): date field + calendar popover.
- **DateRangePicker** (`value: { from, to }`, `onValueChange`, `presets: { label, range }[]`, `min`, `max`): reporting periods, filters.
- **FileUpload** (`accept`, `multiple`, `maxSize`, `maxFiles`, `files|defaultFiles`, `onFilesChange`, `onReject`, `label`, `description`,
  `buttonLabel`): drop zone + button with type/size validation.

### Data display
- **Badge** (`tone`, `variant: soft|solid|outline`): status words and counts (count = `variant="solid" tone="danger"`).
- **Tag** (`color` (+ `default`), `size: sm|md`, `onRemove`): categories, labels. **StatusPill** (`color: not-started|in-progress|done|<color>`).
- **Avatar** (`name`, `src`, `size: xs|sm|md|lg|xl` = 16–32, `shape: user|workspace`; two initials from 24px, "Priya Shah" → PS) · **AvatarGroup** (`max`, `size`; +N overflow).
- **Kbd** ("⌘K" key chip) · **Shortcut** (12px hint text).
- **Card** `Card.Root` (`interactive`, `asChild`) / `Header` (`action` = right-aligned control) / `Title` / `Description` / `Content` / `Footer`: grouped content surface;
  `interactive asChild` around a link makes the whole card clickable.
- **Stat** (`label`, `value`, `delta`, `trend: up|down|flat`, `upIsGood` (default true), `deltaTone`, `description`, `icon`, `chart`
  (e.g. a Sparkline)): one KPI.
- **Table** `Table.Root` (`density: compact|comfortable`, `containerClassName`) / `Header` / `Body` / `Footer` / `Row` (`selected`,
  `onClick`, `focusable`) / `Head` (`align`, `sort: 'asc'|'desc'|false`, `onSort`) / `Cell` (`align`): hand-built tables; scrolls
  horizontally on small screens.
- **DataTable** (`columns: { key, header, cell?, sortValue?, align?, sortable?, width?, hideBelow? }[]`, `rows`, `getRowId`, `sort` /
  `defaultSort` / `onSortChange`, `selectable` / `selectedIds` / `onSelectedIdsChange`, `onRowClick`, `loading`, `empty`, `density`,
  `maxHeight` (sticky header), `label`, `pageSize` + `page`/`defaultPage`/`onPageChange` (built-in paging); `hideBelow` follows the
  table's own width): lists of records with sorting, selection, loading and empty states. Prefer it over Table.
- **Pagination** (`page` (1-based), `pageCount`, `onPageChange`, `siblingCount`, `label`): under DataTable; compact "3 / 12" on phones.
- **EmptyState** (`title`, `description`, `icon`, `action`, `size: sm|md`): nothing yet / no results, always with a next step.
- **KanbanBoard** (`columns: { id, title, label?, color? }[]`, `items`, `getItemId`, `getColumnId`, `getItemLabel`,
  `renderCard(item, { dragging, actions })` — place `actions` in your card, `onMove({ itemId, fromColumnId, toColumnId, toIndex })`,
  `onQuickAdd(columnId, title)`, `itemActions(item, parts)`, `columnActions`, `emptyColumnText`, `label`): status boards. Drag with
  mouse/pen/touch (hold), or the card's "…" / right-click menu (Move to…, Move up/down); moves are announced. Controlled.
- **Timeline** (`items: { id, label, start, end, meta?, group?, color?, description? }[]`, `scale: week|month`, `today`, `onOpen`,
  `onChange({ id, start, end })`, `label`): Gantt bars on a scrolling time scale with a today marker; bars open on Enter and
  move with drag or ← / → (Shift = a week).
- **Accordion** `Accordion.Root` (Radix: `type: 'single'|'multiple'`, `collapsible`, `value`, `onValueChange`) / `Item` (`value`) /
  `Trigger` (`level` = heading level, default 3) / `Content` (animated height): FAQs, optional detail.
- **Tooltip** (`content`, `shortcut`, `side`, `delayDuration`; wraps its trigger): names and shortcuts, never essential content.
  `TooltipBubble` = the static surface.

### Feedback
- **Alert** (`tone` (default info), `title`, children = message, `icon`, `action`, `onDismiss`, `dismissLabel`): inline message in the page.
- **ToastProvider** (once near the root; `duration`, `label`) + **useToast()** → `{ toast, dismiss }`;
  `toast({ message, description?, tone?, action?: { label, onClick }, duration?, icon? })` returns an id. Transient confirmation ("Saved").
- **Progress** (`value`, `max`, `tone`, `label`, `size: sm|md`, `valueText`, `hideValue`, `description`): determinate progress.
- **Skeleton** (`width`, `height`, `radius: sm|md|lg|full`, `lines`): loading placeholder shaped like the content.
- **Spinner** (`size: sm|md|lg|<px>`, `label` default "Loading"): short indeterminate waits; buttons use `loading` instead.
- **Steps** (`steps: { label, description? }[]`, `current`, `onStepChange`): progress through a multi-step form.

### Charts (SVG, responsive width, keyboard readable, data table for screen readers)
- **LineChart** (`data`, `index` (x field), `series: { key, label, color? }[]`, `label` **required**, `height` 240, `valueFormat`, `area`,
  `curved`, `legend`, `indexLabel`, `zeroBaseline` (default true; `false` lets the axis hug data far from zero, e.g. balances)): trends over time.
- **BarChart** (same data shape + `stacked`, `layout: vertical|horizontal`): compare categories.
- **DonutChart** (`data: { label, value, color? }[]`, `label`, `center`, `size`, `thickness`, `valueFormat`, `legend`): parts of a whole (≤ 6).
- **Sparkline** (`data: number[]`, `label`, `tone`, `width`, `height` 28, `area`, `valueFormat`): tiny trend next to a Stat.
- Series colors default to the palette in order (blue first); `chartPalette`, `chartColorVar(color)` for custom marks.

### Navigation
- **Tabs** `Tabs.Root` (`value`/`defaultValue`/`onValueChange`) / `List` / `Trigger` (`value`) / `Content` (`value`): views of the same
  context; the underline slides.
- **Breadcrumbs** (`items: { label, icon?, href?, onClick? }[]`, `maxItems` default 4, `trailing`): location in a hierarchy; middle
  items collapse into "…". `BreadcrumbAccess` = the "Private ⌄" chip.
- **Menu** (Radix dropdown) `Menu.Root/Trigger/Content(width, header, footer)/Item(icon, shortcut, description, tone|destructive)/
  CheckboxItem/RadioGroup/RadioItem/ToggleItem/Label/Separator/Group/Sub/SubTrigger/SubContent/Search/Footer`: actions on a button.
  Static look-alikes for custom pickers: `MenuSurface`, `MenuList` (listbox; give it `aria-label`), `MenuRow` (option; `toggle` adds
  `aria-checked`; `tabIndex={0}` makes it a Tab stop), `MenuLabel`, `MenuSeparator`, `MenuSearch`, `SearchField`, `MenuFooter(lines)`,
  `MenuSwitch`, `MenuBadge`.
- **ContextMenu**: the same parts on right-click / long-press.
- **CommandPalette** (`groups: { label, items: { id, title, icon?, keywords?, shortcut?, path?, preview?, disabled? }[] }[]`, `onSelect(item)`,
  `placeholder`, `emptyText`, `filters`, `hints`, `preview`) · **CommandPaletteDialog** (+ `open`/`onOpenChange`, `hotkey` (⌘K, default on),
  `width`, `height`, `title`; choosing an item closes it first, then calls `onSelect`, so a command can open another dialog).

### Overlays
- **Dialog** `Dialog.Root/Trigger/Content(size: sm|md|lg = 400/480/640, width, height, top, radius)/Title/Description/Footer/Close`:
  modal tasks. Always give a `Title`. `DialogSurface` / `DialogOverlay` = static parts.
- **ConfirmDialog** (`title`, `description`, `confirmLabel`, `cancelLabel`, `destructive` (default true), `onConfirm` (may return a Promise:
  stays open and busy until it settles), `trigger`, `open`/`onOpenChange`): confirm a consequential action (alertdialog; focus starts on Cancel).
- **Sheet** `Sheet.Root/Trigger/Content(side: right|left|bottom, size: sm|md|lg = 320/400/560 wide, showClose, closeLabel)/Title/Description/
  Footer/Close`: side panels for details and filters; full width on phones.
- **Popover** `Popover.Root/Trigger/Anchor/Content(width, radius, side, align)/Close` · `PopoverSurface`: non-modal floating panel
  with interactive content.

### Motion extras (product pieces)
- **DateMenu** (`value`, `onChange`, `today`, `showOptions`, `endDate`/`onEndDateChange`, `includeTime`/`onIncludeTimeChange`,
  `onDateFormatClick`, `onRemindClick`, `onLearnClick`): database date-property menu content (put it in a 248px Popover). For forms use DatePicker.
- **EmojiPicker** (`onSelect(emoji)`, `onSelectIcon(name)`, `onRemove`, `onUpload`, `defaultTab: emoji|icons|upload`): page-icon picker.
- **ColorMenuList** / **ColorGrid** (`value`, `onSelect({ kind: 'text'|'background', color })`, `lastUsed` / `recent`) · **ColorSwatch**:
  text and highlight color pickers.
- **SharePopover** (`people`, `generalAccess`, `onInvite(emails)`, `onCopyLink`, `onPersonAccess`, `onGeneralAccess`): share panel content.
- **PageIcon** (`emoji|icon|src`, `size`) · **DisclosureToggle** · **DragHandle** · **Placeholder** · **ToastPill** (static toast).

### Blocks (static content) and Editor
- Block model: `Block { id, type, text?: RichText, children?, color?, props? }`; `RichText = { text, marks?: {bold, italic, underline, strike, code, link, color}, mention? }[]`.
  Types: text, heading_1–4, bulleted_list, numbered_list, to_do, toggle, quote, callout, divider, code,
  equation, image, bookmark, table, column_list/column, table_of_contents, page. Helpers `rt('text')`, `blockId()`.
- **BlockRenderer** (`blocks`): read-only page with the system's exact rhythm, list markers (• ◦ ▪ / 1. a. i.), numbering, TOC.
- Individual blocks (wrap standalone blocks in **`BlockContent`**, which sets the 16px content size they are relative to): `TextBlock`, `Heading(level, toggleable)`, `BulletedListItem`, `NumberedListItem`, `ToDo`, `Toggle`, `Quote`, `Callout(icon, color)`, `DividerBlock`, `Code(language)`, `Equation`, `ImageBlock`, `Bookmark`, `SimpleTable`, `Columns`, `TableOfContents`, `PageLink`, `PageTitle`, `RichTextView`.
- **Editor** (`value|defaultValue`, `onChange`, `placeholder`): full block editing: Enter/Backspace/Tab semantics, markdown shortcuts (`# ## ### - * 1. [] --- \`\`\``, `> ` toggle, `" ` quote), `/` slash menu, hover `+` and ⋮⋮ (block menu: Turn into, Color, Duplicate, Delete), drag to reorder, selection toolbar (B I U S code link color), ⌘B/⌘I/⌘U/⌘E/⌘⇧S/⌘D.
  Parts usable alone: `SlashMenu`, `BlockActionMenu`, `TurnIntoMenu`, `TextToolbar`, `slashGroups`, `newBlock`, `blockTree`.

### Database
- Data: `DatabaseData { collection: { properties: Property[] }, rows: Row[], views: View[] }`; property types title, text, number, select, multi_select, status, date, person, checkbox, url, email, phone, created_time. Sample: `createTasksSample()`.
- **DatabaseView** (`data | db`, `width`, `hideTitle`, `onOpenRow`, `today`): title, view tabs ("N more…"), toolbar (filter, sort, automations, AI, search, open, settings), blue split "New".
  Views: `TableView`, `BoardView`, `GalleryView`, `ListView`, `CalendarView`, `TimelineView`, `ChartView`.
- State: `useDatabase(data)` → `{ data, activeView, setActiveView, updateView, addView, updateRow, addRow, moveRow, … }`.
- Menus: `PropertyMenu`, `SelectPicker`, `DateCellPicker`, `FilterMenu`, `SortMenu`, `FilterEditor`, `SortEditor`, `ViewSettingsPanel`, `NewViewMenu`, `ViewsMenu`; page properties `PropertyList`/`PropertyRow`; values `PropertyValueView`, `PropertyCell`, `PropertyTypeIcon`.
- Table: first column 280px, others 200; rows 37px; title cell bold-ish 14/20 with page icon + hover "OPEN".
  Board: columns tinted per status group, cards 15/22.5 medium, radius 10.

### App shell
- **AppFrame** (`sidebar`, `topbar`, `peek`, children = page; slots may be functions of `{ collapsed, floating, toggleSidebar }`; ⌘\ collapses; hover left edge shows the floating sidebar).
- **Sidebar**: `Sidebar.Root(header, footer, bottomBar)`, `Search`, `Tabs`, `Group`, `Item(icon, tone)`, `Action`, `Sections`, `Section(title, actions)`, `Tree`, `TreeItem(label, emoji|icon, active, onSelect, onAdd, children)`, `ScrollFooter`, `InviteCard`, `BottomBar`, `WorkspaceSwitcher`, `BarButton`.
- **Topbar** (`breadcrumbs`, `edited`, `sidebarCollapsed`, `onOpenSidebar`) + **BreadcrumbTrail** (`items: {title, icon, onClick}[]`, `privacy`).
- **PageLayout** (`cover`, `header`, `fullWidth`, `toc`, `variant: document|app`) · **PageCover** (`src` or children) · **PageHeader** (`icon`, `title`, `description`, `actions`, `editable`, `onTitleChange`, `size: page|peek|app`, hover "Add icon / Add cover / Add comment").
  App screens (dashboards, tables, settings next to a sidebar): `<PageLayout variant="app" header={<PageHeader title description actions />}>`:
  16/24/32px gutters, content up to 1200px, compact 24/32 semibold title with the description under it.
- **SidePeek** (660px, resizable, Esc closes) · **CenterPeek** · `PeekBody/PeekProperties/PeekProperty/PeekComments`.
- **SettingsModal** (`nav`, children) + `SettingsNav/NavGroup/NavItem/Page/Section/Row/Select/Switch`.
- Menus: `WorkspaceMenu`, `HelpMenu`, `AppsMenu`, `TrashMenu`.

---

## 5. Recipes

### Theming
```tsx
import '@krackedui/motion/styles.css';
<Theme appearance="system" asChild><body>…</body></Theme>   // follow the OS
<Theme appearance="dark" className="rounded-n-lg p-6">…</Theme>  // force one section dark
```
Custom markup uses tokens only: `bg-n-bg-primary text-n-text-primary border-n-border-primary` (or the portable
`var(--ds-*)` names). Never hard-code colors; dark mode then works for free.

### A form with Field
```tsx
const [error, setError] = useState<string>();
<form className="flex max-w-96 flex-col gap-4" onSubmit={(e) => { e.preventDefault(); /* validate, then setError(...) */ }}>
  <Field label="Name" required error={error}><TextInput name="name" /></Field>
  <Field label="Plan" description="You can change it later."><Select name="plan" options={[{ value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' }]} defaultValue="free" /></Field>
  <Field label="Seats"><NumberInput name="seats" min={1} defaultValue={5} stepper /></Field>
  <Field label="Start date"><DatePicker name="start" /></Field>
  <Switch label="Send me product updates" />
  <div className="flex justify-end gap-2"><Button variant="secondary">Cancel</Button><Button variant="primary" type="submit">Create</Button></div>
</form>
```
Errors go in `Field error` (announced, sets `aria-invalid`), not in red text you place yourself.

### A data table page
```tsx
const [page, setPage] = useState(1);
<Stack gap={4}>
  <Stack direction="row" justify="between" align="center">
    <SearchInput aria-label="Search invoices" className="max-w-64" />
    <Button variant="primary" icon="plus">New invoice</Button>
  </Stack>
  <DataTable
    label="Invoices"
    columns={[
      { key: 'number', header: 'Invoice', sortable: true },
      { key: 'customer', header: 'Customer', sortable: true, hideBelow: 'sm' },
      { key: 'status', header: 'Status', cell: (r) => <Badge tone={r.paid ? 'success' : 'warning'}>{r.paid ? 'Paid' : 'Due'}</Badge> },
      { key: 'amount', header: 'Amount', align: 'end', sortable: true, sortValue: (r) => r.amount,
        cell: (r) => <span className={r.amount < 0 ? toneText.danger : undefined}>{money.format(r.amount)}</span> },
    ]}
    rows={rows} selectable onRowClick={openInvoice} loading={loading} empty="No invoices yet"
    pageSize={25} page={page} onPageChange={setPage}
  />
</Stack>
```

### A dashboard (Stat + charts)
```tsx
<Grid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
  <Card.Root><Card.Content><Stat label="Revenue" value="$48.2k" delta="+12%" trend="up" chart={<Sparkline data={[3, 5, 4, 7, 8]} label="Revenue, last 5 weeks" />} /></Card.Content></Card.Root>
  {/* …3 more Stat cards */}
</Grid>
<Grid columns={{ base: 1, lg: 2 }} gap={4}>
  <Card.Root><Card.Header action={<SegmentedControl aria-label="Range" options={ranges} defaultValue="6m" />}><Card.Title>Monthly revenue</Card.Title></Card.Header>
    <Card.Content><LineChart label="Monthly revenue" data={months} index="month" series={[{ key: 'revenue', label: 'Revenue' }]} area valueFormat={(v) => money.format(v)} /></Card.Content></Card.Root>
  <Card.Root><Card.Header><Card.Title>Spend by team</Card.Title></Card.Header>
    <Card.Content><DonutChart label="Spend by team" data={[{ label: 'Design', value: 30 }, { label: 'Eng', value: 55 }]} center="$85k" /></Card.Content></Card.Root>
</Grid>
```
Every chart needs a `label` (its accessible name and data-table caption).

### Overlay patterns
- Actions on a thing → `Menu` on an `IconButton icon="more" label="…"`. Right-click → `ContextMenu`.
- Short task that blocks the page (create, rename) → `Dialog` with `Dialog.Title` and the primary action last in `Dialog.Footer`.
- Destructive / irreversible → `ConfirmDialog` (async `onConfirm` keeps it busy until done).
- Details or filters beside a list → `Sheet` (right on desktop, full width on phones).
- Small interactive panel anchored to a control (share, pickers) → `Popover`.
- Name or shortcut of an icon button → `Tooltip` (or `IconButton tooltip`). Result of an action → `useToast().toast(...)`.
- Search everything / ⌘K → `CommandPaletteDialog`.
```tsx
<Dialog.Root>
  <Dialog.Trigger asChild><Button variant="primary">Rename</Button></Dialog.Trigger>
  <Dialog.Content size="sm">
    <Dialog.Title>Rename page</Dialog.Title>
    <Field label="Name" hideLabel><TextInput defaultValue="Roadmap" /></Field>
    <Dialog.Footer>
      <Dialog.Close asChild><Button variant="secondary">Cancel</Button></Dialog.Close>
      <Button variant="primary">Save</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
```

### A page
```tsx
<Theme className="h-screen">
  <AppFrame
    sidebar={<MySidebar />}
    topbar={<Topbar breadcrumbs={<BreadcrumbTrail items={[{ title: 'Roadmap', icon: '🗺️' }]} />} edited="Edited just now" />}
  >
    <PageLayout header={<PageHeader icon="🗺️" title="Roadmap" editable />}>
      <Editor defaultValue={[{ id: '1', type: 'text', text: rt('Start writing…') }]} />
    </PageLayout>
  </AppFrame>
</Theme>
```

### A sidebar
```tsx
<Sidebar.Root header={<><Sidebar.Search /><Sidebar.Tabs /></>} footer={<Sidebar.InviteCard />}
  bottomBar={<Sidebar.BottomBar><Sidebar.WorkspaceSwitcher name="Design Team" /></Sidebar.BottomBar>}>
  <Sidebar.Sections>
    <Sidebar.Section title="Private">
      <Sidebar.Tree label="Private pages">
        <Sidebar.TreeItem label="Roadmap" emoji="🗺️" active>
          <Sidebar.TreeItem label="Q4" />
        </Sidebar.TreeItem>
      </Sidebar.Tree>
    </Sidebar.Section>
  </Sidebar.Sections>
</Sidebar.Root>
```

### A database page
```tsx
<PageLayout fullWidth header={<PageHeader icon="🚀" title="Projects" />}>
  <DatabaseView data={createTasksSample()} width={1100} hideTitle />
</PageLayout>
```

### A settings screen
`<SettingsModal open nav={<SettingsNav>…<SettingsNavItem icon="gear" selected>Preferences</SettingsNavItem></SettingsNav>}>`
`<SettingsPage title="Preferences"><SettingsSection title="Appearance"><SettingsRow label="Theme" description="…" control={<SettingsSelect value="Light" />} /></SettingsSection></SettingsPage></SettingsModal>`

### Empty states / onboarding
`<EmptyState icon="inbox" title="No invoices yet" description="Invoices you create show up here." action={<Button variant="primary">New invoice</Button>} />`.
No illustrations; one clear next step.

---

## 6. Do / Don't

**Do**
- Use `@krackedui/motion` components first; compose them. Use tokens (`bg-n-…`) for anything custom.
- Keep hover states as translucent tints (`hover:bg-n-button-hover-bg-a`), 20ms.
- Use 14px for UI, 16px for content, 600 for bold, sentence case labels ("Add a property").
- Put secondary actions behind "…" menus and hover affordances.
- Use the package's icons by name (portable names first); 20px in menus/sidebar, 16px inline.
- Wrap every form control in `Field`; give icon-only buttons a `label`; give every chart a `label`.
- Support light and dark by wrapping with `<Theme appearance="light|dark|system">`. Never hard-code colors.
- Use the 10 named colors only for tags, callouts, highlights, status.

**Don't**
- Don't add borders around buttons or rows (only `secondary` buttons have a hairline).
- Don't use bright fills, gradients, large radii (> 14px) or heavy drop shadows.
- Don't use Title Case, ALL CAPS (except "OPEN" row button), or bold for UI labels.
- Don't invent new icon styles or emoji-heavy chrome (emoji belong to page icons and callouts).
- Don't center page content narrower than 708px or wider than the 96px-gutter full width.
- Don't animate layout with springs or long durations.

---

## 7. Limits

- UI only: there is no backend. Collaboration, sync, AI and real formulas/search are visual only;
  wire your own data through the components' props.
