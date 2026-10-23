# Bayrust: report

Bayrust is a dark-first, keyboard-driven system: a launcher's density and quietness, built around a
command surface rather than a page. This report tracks what the gate measured, what had to be
flagged rather than fixed, and the decisions taken. Gate results: `GATE.md`.

**Status: 11 of the 12 gate checks pass.** Only `copy-paste` fails, and only because Bayrust has
no shadcn registry items yet. Not publishable until it is green. `gate-report.json` does not say `pass`,
so `prepublishOnly` and the docs deploy refuse to run, as SPEC §12 requires.

## What was onboarded, and the one deviation that matters

Standard 2.0 §3 says a system's components are added **exactly as they are**. Bayrust does not have
one body of components; it has two, and they are not interchangeable:

| | What it is | Why it is or is not here |
|---|---|---|
| **The authored layer** (here) | 53 components, 80 drawn icons and 467 measured tokens, written in Bayrust's look | Passes build, lint and clean. This is what `systems/bayrust/registry` contains |
| **The shipped runtime** (not here) | `@krackedui/bayrust` 0.2.0 as published: 370 components, 730 icons, the reference application's compiled frontend | Cannot be onboarded without failing two hard checks outright |

**Flag (§3).** What is here is Bayrust re-expressed, not Bayrust's shipped runtime lifted unchanged.
That is a deviation from §3 and the owner should know it, because the alternative was measured and
is worse:

- `styles.css` would be **1.0 MB against a 250 KB budget** — four times over, and not shrinkable
  without editing the components' own CSS, which §3 forbids.
- The clean check fails **once per shipped raster**: 490 `.png`/`.jpg` files, each "captured or
  binary asset shipped in the package", plus the source product's name in ~100 files including
  filenames, which §11 fails outside token names.
- It would put ~60 MB of captured material into this repository permanently, which is the opposite
  of how `capture/` and `mirror/` are kept out for Motion.

Onboarding the shipped runtime is still possible; it is a decision about the gate staying red
forever and about what enters a public repository, so it belongs to the owner, not to this report.

## Gate

See `GATE.md` for the current run. What is green, what is not, and why:

| Check | State | Note |
|---|---|---|
| Typecheck | pass | registry, playground, docs and tests, all strict |
| Lint | pass | 0 errors across 46 files |
| Tokens | pass | report only in 2.0; 0 hard-coded colours |
| Tests | pass | 34 tests; 16 of 40 interactive components covered, the rest flagged (2.0 allows this) |
| Build | pass | client.js 59 KB min of 600; styles.css 78 KB of 250 |
| Clean | pass | 0 denied names, 0 captured assets in the packed tarball |
| Install | pass | both consumer apps build from the tarball; 44/44 examples render clean, light and dark |
| Copy-paste | fail | 2/35 registry items; none generated for Bayrust yet — the only check still red |
| Accessibility | pass | 44/44 examples and all 14 template pages, from 12/44 |
| Responsive | pass | 44/44 examples and all 14 template pages, at every width |
| Visual | pass | 43 baselines recorded for darwin; CI records its own Linux set |
| Templates | pass | both build from the packed tarball; 14 pages, 0 accessibility and 0 responsive problems |

### The bug that was costing most of the accessibility check

The gate's examples app mounts a system as `<div class="bay">` and adds `.dark`. Bayrust scoped
every token to `[data-theme="bayrust-*"]`, so inside that harness **no custom property resolved at
all**. A declaration like `outline: 2px solid var(--ds-border-focus)` is invalid at computed-value
time when the variable is missing, which silently produced *no outline* — 64 "no visible focus
indicator" findings from one unresolved selector.

Every token block now answers to both spellings (`[data-theme='bayrust-dark'], .bay.dark`), and
`Theme` sets the class as well as the attribute. Verified in a browser: `.bay`, `.bay.dark`, and
both with the attribute, all resolve `--ds-bg-app`, `--ds-border-focus`, `--ds-text-primary` and
`--ds-chart-1` to the right values for their appearance. No component changed.

### Real defects the accessibility check found, now fixed

- **A loading button had no accessible name.** `visibility: hidden` on the label took it out of the
  accessibility tree as well as off the screen, so axe saw a nameless button. It is `opacity: 0`
  now: the label still names the button and still holds its width.
- **Orphan list items.** `Sidebar.Footer` held `SidebarItem`s directly, and a `SidebarItem` is an
  `<li>`. The footer wraps them in a list now.
- **Touch targets below 24 px.** The sidebar toggle (30×20), a sidebar link (65×23) and the slider
  thumbs (280×14) are under the WCAG 2.5.8 floor. Density is the point of this system on a desktop,
  so the floor is applied only on a coarse pointer: the hit area grows, the drawn control does not.
- **Axis labels overflowed their gutter.** The value axis reserved 36 px, which fits `60` and clips
  `$36k`. It reserves 48 px now.

### Contrast: ten values measured and raised

Every contrast failure the gate found was in a value this system had tuned, or had claimed to.
Each was re-measured, never estimated:

| What | Was | Now |
|---|---|---|
| Card description on a raised surface (dark) | 4.07:1 — `--ds-text-tertiary` was tuned against the app background, not the lighter raised one | 4.72:1 at 54% |
| White on a filled danger button | 2.9:1 | 4.57:1 via `--ds-status-danger-solid`; the brand red is untouched |
| Warning badge text on its wash (light) | 3.71:1 | 4.51:1 |
| `Tag` text on its own 10% wash (light) | blue 3.13:1, and the other six with it | seven tuned text colours; the washes and the whole dark appearance are untouched |
| Avatar initials, white on the generated hue | **2.63:1 at the worst hue.** The comment above it claimed every hue cleared AA; measured across all 360 at 40% saturation, none did | 34% lightness, where the worst (yellow, hue 60) is 4.57:1 |
| Neutral badge ink on the selected wash (dark) | 4.34:1 | primary ink |
| A danger `Stat` delta as text (dark) | 4.09:1 | 4.63:1 via `--ds-status-danger-text` |

The avatar one is worth singling out: the code carried a comment asserting the thing it got wrong,
which is why it survived a review and only fell to a measurement.

### The charts zoomed instead of reflowing — found sideways, now fixed

The responsive check reported axis labels overflowing at 768, 1024 and 1440 px. The message was a
harness artifact: for SVG text Chrome's `scrollWidth` follows the rendered scale while `clientWidth`
does not, so the comparison fires on any scaled SVG. Measured on a minimal case — one `<text>` in a
`viewBox`'d SVG at `width: 100%` — `scrollWidth` 47 against `clientWidth` 42 at 1400 px, with the
glyphs fully on screen.

The defect underneath was real. The charts rendered a fixed `viewBox` at `width: 100%`, which zooms:
at 1440 px a 10 px axis label drew at roughly 24 px, and every stroke thickened with it. They now
measure their container and render at that width, and the stylesheet no longer stretches them.
Responsive went from 42/44 examples and 35 template problems to **44/44 and none**.

### Still failing, and why

- **Copy-paste.** 2 of 28 registry items install alone and typecheck; none have been generated for
  Bayrust, so the 35 are the standard's own. An earlier run also died on a macOS `cp -c -R` clone
  failure in this environment, which is worth knowing before anyone reads a result as Bayrust's.

## Gaps found by templates

Both sector templates — **fintech** and **project-management** — named the same nine components
Bayrust did not have. Each was added to the system first, with tests, and then used; none was
hand-built inside a template, and no existing component's UI was changed to make a screen work.

| Component | Which template asked, and for what |
|---|---|
| `Combobox` | Both. A category filter over eight options and an assignee picker over eight people: `Select` cannot be typed into, and these options carry a description |
| `DatePicker` | Both. A payment's send date; a task's due date |
| `DateRangePicker` | Fintech. The transactions filter, with the presets the spec asks for (7/30/90 days, this month) |
| `Calendar` | Neither directly — both pickers need it, so it exists as a component in its own right rather than hidden inside them |
| `FileUpload` | Fintech. Attaching a receipt to a transaction |
| `ConfirmDialog` | Both. Freezing a card, cancelling a payment, deleting tasks, deleting a workspace |
| `ContextMenu` | Project management. "Move to…" on a board card, which is also the keyboard route |
| `CommandPalette` | Both, inside the dialog below |
| `CommandPaletteDialog` | Both. ⌘K to jump to a page, payee, transaction, project or task |

Two defects surfaced while their tests were written, both fixed before the templates used them: the
`Combobox` focused its search field from a `requestAnimationFrame` callback, which is not a promise
that the field exists yet; and `Calendar` opened on the current month even when handed a range, so
a range picker hid the range it already had.

### Visual baselines

44 baselines recorded for `darwin` on 2026-10-23, the first set for this system. They were recorded
after the accessibility and responsive work, not before, so they capture the system as it now is;
CI records its own Linux set, because fonts render differently per platform.

They were looked at rather than trusted, and that caught one more defect: **`LineChart` drew no
x-axis labels at all.** A chart of twelve months had no months on it. Nothing failed, because the
hidden data table carried the values and axe is satisfied by that — but the picture was unreadable
on its own. `BarChart` had always labelled its categories; the line chart never had. It now draws
the index along the bottom at a stride computed from the width it measured, so the labels thin out
instead of colliding when the chart is narrow.

That is the second time looking at the output caught something no check did, which is the argument
for the step.

### Two defects in how overlays mount, found by the consumer apps

The install check builds a Next.js App Router page from the packed tarball, and it found two things
no test or example could:

- **An overlay crashed a page that had no `Theme`.** `Portal` called `useTheme`, which throws by
  design — a good rule for a hook the caller reached for, and the wrong one for a component, which
  took down a whole prerender. It now falls back to `document.body` when there is no Theme: the
  overlay still works, it simply inherits the page. Motion degrades the same way.
- **Then it failed hydration** (React #418). The fallback rendered on the first client pass while
  the server had rendered nothing. Portals wait for mount now, so the first client render matches
  the server's.

The second broke two Combobox tests, which was the right alarm: the input is portalled, so an
effect keyed to `open` ran before the input existed. It focuses from the input's own ref callback
now — whenever the node arrives, however the portal is timed.

### Defects the templates found in the system

Fourteen real pages are a harder test than forty-four isolated examples, and they found things the
examples could not:

| Found | Why it only showed up here | Fixed |
|---|---|---|
| **Every page skipped a heading level.** `PageHeader` renders the `h1` and `CardTitle` rendered an `h3`, so a page of cards jumped h1 → h3 — twelve `heading-order` findings | A docs example has no `PageHeader` around it, so the sequence never existed to be wrong | `CardTitle` is an `h2`; `asChild` still covers a card nested under its own heading |
| **The charts zoomed instead of reflowing.** A fixed `viewBox` at `width: 100%` scales everything, so a 10 px axis label drew at ~24 px on a wide screen | Only visible once a chart sat in a real page at several widths | They measure their container and render at that width; the stylesheet no longer stretches them |
| **`Tag` text failed AA in light** — blue at 3.13:1 on its own wash, 25 nodes on one screen | The docs show one tag; a transactions table shows a hundred | The seven tag text colours are darkened for light only; the washes and the dark appearance are untouched |
| **Sort buttons were 41×16 on touch**, under the 24 px floor | The docs' table example is not audited at 375 px with a coarse pointer | Added to the coarse-pointer floor, with the combobox and date triggers |
| **A horizontally scrolling region could not be reached by keyboard** — the board columns and the timeline | Neither exists in the docs | Both take focus and are labelled |
| **A seven-control filter bar overflowed 1024 px** | The docs show controls one at a time | The row wraps |
| **A `Badge` in a `CardHeader` stretched to the full width** — 379 px for the text "1", and the same to any button or control put there | Found by looking at the running template, not by a check: nothing overlaps, nothing overflows, so every check was happy. The docs' card example has only a title and a description in its header | The header no longer stretches its children; the title and description still fill the row |

The first three are system defects, not template ones: they were fixed in Bayrust and every
consumer gets the fix.

## Usability issues

Things that were awkward to build with, with what would fix them. None of these blocked a screen.

| What happened | Proposed fix |
|---|---|
| `NumberInput` is `number \| null` while React state for an optional filter is naturally `number \| undefined`. Every numeric filter needed its state widened to match | Accept `undefined` as well as `null`, or document that `null` is the empty value |
| A nested `Theme` paints no background of its own, so a light panel inside a dark page composites its translucent surfaces over the dark one. The docs example had to set `background: var(--ds-bg-app)` by hand | Have `Theme` paint `--ds-bg-app` when it is not the outermost one, or document the rule beside `appearance` |
| `Field` with `hideLabel` is the only way to get a control's spacing without a visible label, so filter bars are full of `<Field label="…" hideLabel>` wrappers that exist for layout | A `Field`-less control spacing, or a filter-bar layout piece |
| Sheet and Dialog take `size`, but a board's task detail wants a width between `md` and `lg`. The template took `lg` and lives with it | A `width` escape hatch alongside `size` |
| `Stat` has no "secondary value" slot, so "{spent} of {limit}" under a progress bar is a hand-written `<span>` in three places | A `secondary` or `caption` prop on `Stat` |
| There is no `Kbd`-in-input affordance for a search field that opens on ⌘K, so the shortcut is advertised in the `IconButton` label only | A `trailing` slot on `SearchInput` already exists on `TextInput`; make it consistent |

## Flags that are not failures

- **The playground is required in practice.** SPEC §1 calls `playground/` optional, but the
  typecheck check looks for `playground/tsconfig.json` unconditionally and records a missing one as
  an error. Bayrust has a playground, so this costs nothing here; the standard and its gate
  disagree, and the gate wins.
- **`Select` is the native `<select>`.** An option's `icon` and `description` are accepted and not
  drawn. The platform's listbox, keyboard handling and mobile picker are worth more than the icons.
- **24 of 55 interactive components have a test.** 2.0 flags rather than fails this; the 51 tests
  cover the behaviour that is easy to get wrong, not every export. The untested ones are in `GATE.md`.
- **Ten values were raised** to clear WCAG AA where the measured appearance did not; they are listed
  under "Contrast" above and each is marked `tuned` in `standard.css` with its ratio. 2.0 no longer
  requires a token list, but contrast is checked on rendered UI, which is where it counts.

## Decisions

| Date | Decision | Why |
|---|---|---|
| 2026-10-23 | Onboard the authored layer, not the shipped runtime | Measured: the runtime fails the style budget 4× and the clean check 490 times. Recorded above as a §3 deviation rather than hidden |
| 2026-10-23 | Tokens answer to `.bay`/`.bay.dark` as well as `data-theme` | Without it no token resolves in the ecosystem's harnesses. Additive: no component changed |
| 2026-10-23 | The 24 px touch floor applies only on a coarse pointer | The density is the system's character on a desktop and a barrier on a finger |
| 2026-10-23 | `Tag`'s text colours tuned for light, washes untouched | Flagged first, then the templates put a hundred tags on one screen at 3.13:1. Only the ink moved, and only in light; the dark appearance and every wash keep the measured values |
| 2026-10-23 | `CardTitle` is an `h2`, not an `h3` | With `PageHeader` as the h1 every page skipped a level. `asChild` still covers a card under its own heading |
| 2026-10-23 | Charts measure their container instead of scaling a viewBox | A fixed viewBox at `width: 100%` zooms: type grew with the container |
| 2026-10-23 | A filled danger surface is its own token | White had 2.9:1 on the brand red. `--ds-status-danger-solid` moves the button without moving the brand, as `--ds-accent-default` already does for the accent |
| 2026-10-23 | Six categorical chart slots, not eight | Bayrust's green has no step clearing the chroma floor in light. Inventing a hue would break "documented palette only"; a seventh series folds into Other |
| 2026-10-23 | The chart palette is derived and validated, never eyeballed | Two candidate orderings failed the validator before the third passed; the numbers are in `styles/charts.css` |
| 2026-10-23 | `DataTable` reports a sort, it does not perform one | Sorting server-side and in memory are the same component with a different owner of the data |
| 2026-10-23 | Charts written here, no charting library | Four forms at this size are less code than a dependency's adapter |
| 2026-10-22 | Plain CSS, no Tailwind, no UI dependencies | The package must work without Tailwind anyway; starting without it keeps the dependency list empty |
| 2026-10-22 | Icons drawn rather than traced | Tracing produced ~130 run-length rectangles per icon: stair-stepped, no curves. Drawing from sampled colour and measured geometry reads correctly at 44 pt |
| 2026-10-22 | `fintech` + `project-management` | Owner's choice |
