# Bayrust: report

Bayrust is a dark-first, keyboard-driven system: a launcher's density and quietness, built around a
command surface rather than a page. This report tracks what is here, what the gate will say, and what
is left. Gate results: `GATE.md` (written by `npm run gate -- bayrust`).

**Status: 53 of 62 contract inventory entries implemented (52 of the 61 components, plus the
`useToast` hook); not gate-ready.** Nothing here claims to pass. `gate-report.json` is deliberately absent, so
`prepublishOnly` and the docs deploy refuse to run, as `/standard/SPEC.md` §12 requires. The sections
below say exactly what is missing, so the next person does not have to rediscover it.

## Sector templates

Chosen by the owner, as `/standard/SPEC.md` §14 step 1 requires: **fintech** and **project-management**.
Neither is built yet — §14 step 5 comes after the contract inventory exists, and building a template
before then would mean hand-building components the system lacks, which rule 4 forbids.

## What is here

| Path | What | Provenance |
|---|---|---|
| `registry/src/styles/tokens.css` | 526 declarations, 467 tokens, in `bayrust-dark` and `bayrust-light` | Measured: resolved from the reference's computed styles, each with its source rule in `tooling/tokens.json` |
| `tooling/tokens.json` | The same tokens as data: value, the declaration it came from, and both appearances | Measured |
| `registry/src/icons/*.svg` | Six product icons, drawn | Ours. Shape is a superellipse; gradients and glyph colours are sampled from the reference, the glyphs are drawn as curves |
| `tooling/build-icons.py` | Regenerates those six | Ours |
| `registry/src/styles/standard.css` | The `--ds-*` vocabulary in Bayrust's tokens, both appearances | Aliases, except four values tuned for contrast (below) |
| `registry/src/foundations/` | `Theme`, `Icon`, and all 80 interface icons as 24×24 stroke paths | Ours, drawn for this system |
| `registry/src/layout/` | `Stack`, `Grid`, `Divider` | Ours |
| `registry/src/actions/` | `Button`, `IconButton`, `Link` | Ours |
| `registry/src/forms/` | `Field`, `TextInput`, `Textarea`, `SearchInput`, `NumberInput`, `Checkbox`, `RadioGroup`, `Radio`, `Switch`, `SegmentedControl`, `Select`, `Slider` | Ours |
| `registry/src/display/` | `Badge`, `Tag`, `Kbd`, `Avatar`, `AvatarGroup`, `Card`, `Stat`, `Table`, `EmptyState`, `Accordion`, `DataTable`, `Pagination` | Ours |
| `registry/src/feedback/` | `Skeleton`, `Progress`, `Spinner`, `Alert`, `ToastProvider`, `useToast` | Ours |
| `registry/src/navigation/` | `Tabs`, `Breadcrumbs`, `Menu` | Ours |
| `registry/src/overlays/` | `Dialog`, `Sheet`, `Popover`, `Tooltip` | Ours |
| `registry/src/charts/` | `LineChart`, `BarChart`, `DonutChart`, `Sparkline` | Ours. Built to the `dataviz` method; the palette is validated, not chosen by eye |
| `registry/src/styles/charts.css` | The six categorical slots, in both appearances, and the mark specs | Ours. Steps of Bayrust's own hues, snapped to values that pass the validator |
| `registry/src/shell/` | `AppFrame`, `Sidebar` (Root/Header/Section/Item/Footer), `Topbar`, `PageHeader` | Ours |
| `registry/src/lib/overlay.tsx` | Portal into the nearest `Theme`, dismiss, focus trap, scroll lock, anchoring | Ours |
| `registry/src/lib/` | `cn`, a variant helper, and the `asChild` merge | Ours |

### Contrast: four values had to be raised

Gate check 3 wants the pairs in `standard/contract/src/tokens.ts` at 4.5:1. Measured from the
reference's own resolved values, four do not clear it. Ratios were computed, not estimated:

| Token | Measured | Now | Why |
|---|---|---|---|
| `--ds-text-tertiary` | 3.67:1 dark, 2.85:1 light | 4.63 / 4.94 | `--fg` at 48% / 56% |
| `--ds-accent-text` | 3.77:1 dark, 4.02:1 light | 4.67 / 4.64 | the accent moved toward the foreground |
| `--ds-accent-default` | white on it is 4.02:1 | 4.56:1 | the accent darkened 7%, so `--ds-text-on-accent` can be white |

Per `AGENTS.md` these are raised, not lowered back to match the reference. Each is marked `tuned` in
`standard.css` with its measurement.

### Verified so far

- Strict typecheck: 0 errors.
- Contract: each of the eight implemented entries accepts its contract props type, asserted the way
  `check-contract` does it. `asChild` is implemented rather than omitted, since narrowing a contract
  prop is not allowed.
- Rendered in both appearances: every variant, size, loading and disabled state, and all 80 icons.
  `asChild` produces a single `<a>` styled as a button.
- `settings` was redrawn as a cog after the first render: a ring of spokes was indistinguishable from
  `sun` at 16 px.
- Forms, checked in the browser rather than read: `Field` wires its control's id, `aria-describedby`
  and `required`, and an `error` sets `aria-invalid` and points at the message; the mixed checkbox
  reports `aria-checked="mixed"` and sets the DOM `indeterminate` property; `NumberInput` steps by
  `step` on ArrowUp/Down and reports `aria-valuenow`; the range slider keeps its thumbs ordered —
  pushing the lower one to 95 past an upper at 70 clamps it to 70.
- The switch and slider thumbs were black in the light appearance: they used `--ds-bg-inverse`, which
  flips with the appearance. They take `--ds-text-on-accent`, which is light in both.
- Data display, checked in the browser: the accordion's triggers carry `aria-expanded` and
  `aria-controls`, each panel is a `region` labelled by its trigger, `collapsible` closes the open
  one, and `single` keeps exactly one open; a sortable column reports `aria-sort="ascending"`; a
  clickable row is focusable and a selected row reports `aria-selected`; `Progress` is a
  `progressbar` with its value and name; `Spinner` is a `status` with text for a screen reader;
  `Skeleton` is hidden from assistive tech.
- The compound parts (`Card`, `Table`, `Accordion`, `Tabs`, `Menu`, `Dialog`, `Sheet`, `Popover`)
  are exported both as objects and as flat aliases — `CardRoot`, `TableCell`, `MenuItem`,
  `DialogContent` — which §2 requires for React Server Components.
- Overlays, checked in the browser: Escape closes a menu and returns focus to its trigger, which
  then reports `aria-expanded="false"`; a dialog is `aria-modal`, labelled by its title and
  described by its description, moves focus inside, locks the page's scroll, and on Escape closes,
  restores the scroll and returns focus to whatever opened it.
- The chart palette was computed and then **validated with the skill's own
  `scripts/validate_palette.js`**, not judged by eye. Both appearances report ALL CHECKS PASS: dark's
  worst adjacent pair is ΔE 19.3 under deuteranopia and 22.9 for normal vision, light's 20.7 and 22.0.
  The first two candidate orderings FAILED (a lightness band, then a 3.7 red↔yellow under deutan), so
  the order was searched rather than assumed: red, purple, yellow, blue, orange, magenta.
- Charts, checked in the browser: every chart carries a hidden `<table>` of its own data, so the
  numbers are readable without the picture; ≥2 series always draw a legend; grid and axes take
  `--ds-text-tertiary` and `--ds-chart-grid`, and no value or label wears a series colour.
- Zooming the stacked bars showed every segment rounded, including the joins inside a stack, which is
  not what "4px rounded data-ends anchored to the baseline" means. `rx` moved from the CSS rule onto
  each rect and is now `4` only on a stack's top segment, `0` elsewhere; grouped bars are all ends, so
  all four. Re-rendered and confirmed: the first stacked rect reports `rx="0"`, the one above it `4`.
- Alerts and toasts, checked in the browser: an alert always draws an icon as well as its tone, so
  nothing rests on colour alone; `danger` and `warning` are `role="alert"` and assertive, the quieter
  tones `role="status"` and polite. The toast region is labelled `Notifications`; firing one from the
  page showed `role="status"` as expected and it cleared itself on its timer.
- `DataTable` and `Pagination`, checked in the browser: the select-all box reports `aria-checked`
  `"mixed"` when some rows are selected, a sorted column reports `aria-sort`, the current page button
  reports `aria-current="page"`, and the first/last step buttons disable at the ends.
- The shell: `AppFrame` renders one `main`, the sidebar is a `nav` landmark labelled "Main", and
  `PageHeader` renders the page's single `h1`. Below `md` the same `sidebarOpen` state turns the
  docked sidebar into a drawer with a scrim, so an app needs no breakpoint logic of its own.

### The reference's surfaces assume a backdrop that a browser does not have

The first render of the menu showed the page through it. `--color-panel-background`,
`--color-window-bg` and `--color-window-bg-secondary` are all **40% black**: in the app they sit over
the native window's vibrancy, which supplies everything underneath. A browser has none, so used
as-is a menu, a dialog or a sidebar is translucent.

`--ds-bg-surface`, `--ds-bg-surface-raised` and `--ds-bg-sidebar` are therefore composed against the
app background rather than aliased — raised lifts in dark and stays white in light, where there is
nothing lighter to lift to. `--ds-bg-overlay` had the same problem in reverse: the reference's value
is a light wash for a native panel, not a scrim behind a modal, so it is a real scrim here. The
hover and selection washes stay translucent, because a wash over a surface is exactly what they are.

Per `/standard/SPEC.md` §5, every value above is traceable; nothing here is inferred.

## What is missing, in the order it has to be done

1. **The rest of the contract — 9 entries.** `Combobox`, `Calendar`, `DatePicker`,
   `DateRangePicker` and `FileUpload` from forms; `ContextMenu`, `CommandPalette`,
   `CommandPaletteDialog` and `ConfirmDialog`. Four of them need a date engine and the rest build on
   the popover and menu that now exist. Each needs the component, its variants, a behaviour test, a
   docs page and a registry item.
2. **A build.** `registry/` has no build yet, so there is no `dist/`, no `styles.css`, no `tokens.json`
   and no exports map to resolve. Checks 6, 7 and 8 cannot run until there is.
3. **Tests.** None. Every interactive entry needs one (check 5).
4. **Docs and playground.** Absent; checks 9 and 12 depend on them.
5. **Icons.** Six of roughly 192 product icons are drawn. The interface icons are complete (all 80).
6. **Templates.** Both, after the contract.

## The clean rule, and why this system is unusual

`/standard/SPEC.md` §11 and gate check 14: the published package, docs and templates carry no
third-party names or captured assets, and the gate greps for the names in `.clean-deny`.

Bayrust was derived from a shipped desktop application, and in its own repository it is built **by
running that application's frontend** — its compiled JavaScript, stylesheets, fonts, icon sprite and
around 490 images. That material is the opposite of what §11 allows, so none of it is here, the same
way Motion keeps `capture/` and `mirror/` out of this repository.

The consequence is that **the system cannot simply be ported; the components have to be written.** The
tokens and the measurements come across, because a measurement is not an asset. The components do not.
Anyone picking this up should treat the reference as a specification to build against, not a source to
copy from — and should expect check 14 to fail loudly until the last copied string is gone.

A related detail worth knowing early: the original package resolved components by their exported names,
and some of those names contain the product's name. Those cannot be renamed without breaking the
loader, which is one more reason the components are rewritten here rather than wrapped.

## Decisions

| Date | Decision | Why |
|---|---|---|
| 2026-10-22 | Tokens and drawn icons ported; no component code copied | §11. The component code that exists elsewhere is the reference's own, not this system's |
| 2026-10-22 | Foundations, layout and actions written from scratch | The first 8 contract entries, to establish the pattern the rest follow |
| 2026-10-22 | Plain CSS, no Tailwind and no UI dependencies | The package must work without Tailwind anyway (§2); starting without it keeps the dependency list empty and the bundle small |
| 2026-10-22 | Four token values tuned for AA | Check 3 is the authority, not the reference |
| 2026-10-22 | `Select` is the native `<select>` | The platform's own listbox, keyboard handling and mobile picker. The cost is that an option's `icon` and `description` are accepted but not drawn; `Combobox` will be the one that shows them |
| 2026-10-23 | Overlays portal into the nearest `Theme`, not `document.body` | A menu or dialog then follows the appearance of the theme it belongs to, including a nested one |
| 2026-10-23 | Anchoring is flip-and-clamp, written here, not a positioning library | It keeps the dependency list empty. A panel needing more than flip-and-clamp should pull in a real one; this is noted so nobody assumes it handles every case |
| 2026-10-22 | `Stat`'s delta tone comes from `trend` and `upIsGood` together | Costs rising is not a success. The direction alone cannot say which colour is right |
| 2026-10-22 | `Slider` is one `<input type="range">` per thumb | The browser gives the `slider` role, the keyboard handling and the live announcement. Thumbs are kept ordered in the change handler |
| 2026-10-22 | Icons drawn rather than traced | Tracing the artwork produced ~130 run-length rectangles per icon: stair-stepped, no curves, emboss lost. Drawing from sampled colour and measured geometry reads correctly at 44 pt |
| 2026-10-23 | Six categorical chart slots, not eight | Bayrust's green has no step that clears the chroma floor in light — it is a desaturated teal. Inventing a hue to fill the slot would break "documented palette only", so a seventh series folds into Other or becomes a facet. Green keeps its separate job as the success status colour |
| 2026-10-23 | The chart palette is derived and validated, never eyeballed | `dataviz` makes the colour step computable. Two candidate orderings failed the validator before the third passed; the numbers are in `styles/charts.css` |
| 2026-10-23 | Charts are written here, with no charting library | Four forms at this size are less code than a dependency's adapter, and the dependency list stays empty. A chart the contract does not cover should pull in a real library rather than grow this file |
| 2026-10-23 | `DataTable` reports a sort, it does not perform one | Sorting server-side and sorting in memory are the same component with a different owner of the data. Reporting `onSortChange` lets both work; sorting internally would quietly break the paged case |
| 2026-10-23 | One `sidebarOpen` state, two behaviours | Docked above `md`, a drawer below it. Two props would make every app write the breakpoint logic the frame already knows |
| 2026-10-22 | `fintech` + `project-management` | Owner's choice |
