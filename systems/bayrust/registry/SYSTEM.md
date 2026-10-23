# Bayrust

A dark-first, keyboard-driven design system: the density and quietness of a launcher, built around a
command surface rather than a page.

## State

In progress. 53 of the 62 contract inventory entries are implemented and the package builds; there
are no tests, docs, templates or visual baselines yet, so the gate fails. `../REPORT.md` says exactly
what exists and what is left, and `../AGENTS.md` says how to work on it.

`private: true` and no `gate-report.json`, so neither `npm publish` nor the docs deploy will run —
`prepublishOnly` calls the gate's `verify.mjs`, which refuses without a passing report for the
current source hash.

## Foundations

| | |
|---|---|
| Tokens | 467, as `[data-theme="bayrust-dark"]` and `[data-theme="bayrust-light"]` |
| Appearances | Dark is the default; light is a full peer, not a derivation |
| Icons | All 80 interface icons drawn; six product icons drawn, the rest are not |
| Chart palette | Six categorical slots, validated for CVD separation and contrast in both appearances |

Every token value is traceable to the declaration it was measured from, recorded in
`../tooling/tokens.json`. Nothing is inferred. Four were raised to clear WCAG AA; `src/styles/standard.css`
marks each one `tuned` with its measurement.

## Contract

Implemented, by group:

| Group | Entries |
|---|---|
| Foundations | `Theme`, `Icon` |
| Layout | `Stack`, `Grid`, `Divider` |
| Actions | `Button`, `IconButton`, `Link` |
| Forms | `Field`, `TextInput`, `Textarea`, `SearchInput`, `NumberInput`, `Checkbox`, `RadioGroup`, `Radio`, `Switch`, `SegmentedControl`, `Select`, `Slider` |
| Data display | `Badge`, `Tag`, `Kbd`, `Avatar`, `AvatarGroup`, `Card`, `Stat`, `Table`, `DataTable`, `Pagination`, `EmptyState`, `Accordion` |
| Feedback | `Skeleton`, `Progress`, `Spinner`, `Alert`, `ToastProvider`, `useToast` |
| Navigation | `Tabs`, `Breadcrumbs`, `Menu` |
| Overlays | `Dialog`, `Sheet`, `Popover`, `Tooltip` |
| Charts | `LineChart`, `BarChart`, `DonutChart`, `Sparkline` |
| Shell | `AppFrame`, `Sidebar`, `Topbar`, `PageHeader` |

Not yet written: `Combobox`, `Calendar`, `DatePicker`, `DateRangePicker`, `FileUpload`, `ContextMenu`,
`CommandPalette`, `CommandPaletteDialog`, `ConfirmDialog`.

## How it is built

`npm run build -w @krackedui/bayrust` runs `build/build.mjs`, which writes `dist/`:

| File | How |
|---|---|
| `client.js`, `server-safe.js` | esbuild, React external; `"use client"` goes back on the client bundle afterwards |
| `index.js` | written by the build: every client name from `client.js`, the pure ones from `server-safe.js` |
| `index.d.ts`, `client.d.ts` | tsc, from `src/` |
| `styles.css` | `build/styles.css` with its `@import`s inlined — there is no CSS compiler in the chain |
| `tailwind.css` | the same, plus a generated `@theme inline` block of the `--ds-*` tokens |
| `tokens.json` | the measured tokens as DTCG, with the reference's own selectors stripped |

esbuild and TypeScript are the only build dependencies. The package has no runtime dependencies.
