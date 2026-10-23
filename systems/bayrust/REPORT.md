# Bayrust: report

Bayrust is a dark-first, keyboard-driven system: a launcher's density and quietness, built around a
command surface rather than a page. This report tracks what the gate measured, what had to be
flagged rather than fixed, and the decisions taken. Gate results: `GATE.md`.

**Status: onboarded against Standard 2.0; not gate-ready.** `gate-report.json` does not say `pass`,
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
| Install | fail | 43/44 examples render clean; the Next.js RSC app does not build — see below |
| Copy-paste | fail | 2/28 registry items; none generated for Bayrust yet |
| Accessibility | fail | 43/44 examples clean, from 12/44 — one flag left, below |
| Responsive | fail | 42/44; the two are the charts, below |
| Visual | fail | no baselines recorded yet; a first run needs `--update-baselines` |
| Templates | fail | neither template is built yet |

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

### The one accessibility failure left, which is a flag rather than a fix

`Tag`'s categorical colours come straight from the measured palette: `color: var(--blue)` on
`background: var(--blue-10)`. In the light appearance that pair is **3.13:1 at 12 px**, against the
4.5:1 AA needs. Fixing it means re-tuning the brand's categorical palette, not a component, so it is
recorded here for the owner rather than changed (§3). Every other contrast failure was in a value
this system had already tuned, and those were re-tuned:

| What | Was | Now |
|---|---|---|
| Card description on a raised surface (dark) | 4.07:1 — `--ds-text-tertiary` was tuned against the app background, not the lighter raised one | 4.72:1 at 54% |
| White on a filled danger button | 2.9:1 | 4.57:1 via `--ds-status-danger-solid`; the brand red itself is untouched |
| Warning badge text on its wash (light) | 3.71:1 | 4.51:1 |

### The charts scale instead of reflowing — a real defect the responsive check found sideways

The responsive check reports axis labels overflowing at 768, 1024 and 1440 px. The message is a
harness artifact: for SVG text Chrome's `scrollWidth` follows the rendered scale while `clientWidth`
does not, so `scrollWidth > clientWidth` fires on any scaled SVG. Measured directly on a minimal
case — one `<text>` in a `viewBox`'d SVG at `width: 100%` — `scrollWidth` 47 against `clientWidth`
42 at 1400 px, with the glyphs fully on screen and nothing clipped.

What it exposed underneath is real, though. The charts render a fixed `viewBox` at `width: 100%`,
which *zooms* them: at 1440 px a 10 px axis label is drawn at roughly 24 px. Type in a design system
should not grow with its container. The fix is to measure the container and render at that width
rather than scale to it, which is a deliberate change to the charts' sizing model and is not made
here at the end of other work.

### Still failing, and why

- **Install — the Next.js RSC app.** `Cannot find module '@swc/helpers/_/_interop_require_default'`.
  This is the harness's own dependency tree, not Bayrust's code: the Vite app builds and installs
  from the same tarball. Flagged rather than worked around.
- **Copy-paste.** 2 of 28 registry items install alone and typecheck; none have been generated for
  Bayrust, so the 28 are the standard's own. An earlier run also died on a macOS `cp -c -R` clone
  failure in this environment, which is worth knowing before anyone reads a result as Bayrust's.
- **Visual.** A system with no baselines cannot match them. The first run has to record them, and a
  recorded baseline should be looked at before it is trusted.
- **Templates.** Two sectors were chosen — **fintech** and **project-management** — and neither is
  built. Until they are, §9's gap loop has not run, so this report cannot yet list what the system
  turns out to be missing in practice.

## Flags that are not failures

- **The playground is required in practice.** SPEC §1 calls `playground/` optional, but the
  typecheck check looks for `playground/tsconfig.json` unconditionally and records a missing one as
  an error. Bayrust has a playground, so this costs nothing here; the standard and its gate
  disagree, and the gate wins.
- **`Select` is the native `<select>`.** An option's `icon` and `description` are accepted and not
  drawn. The platform's listbox, keyboard handling and mobile picker are worth more than the icons.
- **16 of 40 interactive components have a test.** 2.0 flags rather than fails this. The untested
  ones are listed in `GATE.md`.
- **Four token values were raised** to clear WCAG AA where the source appearance did not:
  `--ds-text-tertiary`, `--ds-accent-text`, `--ds-accent-default`. Each is marked `tuned` in
  `standard.css` with its measured ratio. 2.0 no longer requires a token list, but contrast is
  still checked on rendered UI, which is where it counts.

## Decisions

| Date | Decision | Why |
|---|---|---|
| 2026-10-23 | Onboard the authored layer, not the shipped runtime | Measured: the runtime fails the style budget 4× and the clean check 490 times. Recorded above as a §3 deviation rather than hidden |
| 2026-10-23 | Tokens answer to `.bay`/`.bay.dark` as well as `data-theme` | Without it no token resolves in the ecosystem's harnesses. Additive: no component changed |
| 2026-10-23 | The 24 px touch floor applies only on a coarse pointer | The density is the system's character on a desktop and a barrier on a finger |
| 2026-10-23 | `Tag`'s palette contrast is flagged, not fixed | It is the measured brand palette, not a component. §3 puts that with the owner |
| 2026-10-23 | A filled danger surface is its own token | White had 2.9:1 on the brand red. `--ds-status-danger-solid` moves the button without moving the brand, as `--ds-accent-default` already does for the accent |
| 2026-10-23 | Six categorical chart slots, not eight | Bayrust's green has no step clearing the chroma floor in light. Inventing a hue would break "documented palette only"; a seventh series folds into Other |
| 2026-10-23 | The chart palette is derived and validated, never eyeballed | Two candidate orderings failed the validator before the third passed; the numbers are in `styles/charts.css` |
| 2026-10-23 | `DataTable` reports a sort, it does not perform one | Sorting server-side and in memory are the same component with a different owner of the data |
| 2026-10-23 | Charts written here, no charting library | Four forms at this size are less code than a dependency's adapter |
| 2026-10-22 | Plain CSS, no Tailwind, no UI dependencies | The package must work without Tailwind anyway; starting without it keeps the dependency list empty |
| 2026-10-22 | Icons drawn rather than traced | Tracing produced ~130 run-length rectangles per icon: stair-stepped, no curves. Drawing from sampled colour and measured geometry reads correctly at 44 pt |
| 2026-10-22 | `fintech` + `project-management` | Owner's choice |
