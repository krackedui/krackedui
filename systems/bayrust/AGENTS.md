# Bayrust: system rules

Bayrust is a dark-first, keyboard-driven system: the density and quietness of a launcher, built around
a command surface rather than a page. Root rules: `/AGENTS.md`; the standard: `/standard/SPEC.md`.
These rules add Bayrust's specifics.

**Read `REPORT.md` first.** This system is in progress: 53 of the 62 contract inventory entries are
implemented and the package builds, but there are no tests, docs, templates or visual baselines, so
the gate fails — `GATE.md` has the current run. Do not treat anything here as finished.

## Where things go
```
registry/build/     build.mjs (writes dist/), styles.css and tailwind.css (the two stylesheet entries)
registry/src/
  index.ts       the public API: groups own their exports, this file only re-exports them
  server-safe.ts the pure, React-free exports, for React Server Components
  styles/        tokens.css (generated, do not hand-edit), standard.css (--ds-* mapping), then one per group
  icons/         product icons as SVG, drawn (tooling/build-icons.py regenerates)
  foundations/   Theme, Icon, icon-paths.ts (the 80 interface icons)
  layout/        Stack, Grid, Divider
  actions/       Button, IconButton, Link
  forms/         Field, the text inputs, the choice controls, Slider
  display/       Badge, Avatar, Card, Table, DataTable, Accordion, Stat
  feedback/      Skeleton/Progress/Spinner, Alert and the toasts
  navigation/    Tabs, Breadcrumbs, Menu
  overlays/      Dialog, Sheet, Popover, Tooltip
  charts/        LineChart, BarChart, DonutChart, Sparkline
  shell/         AppFrame, Sidebar, Topbar, PageHeader
  lib/           cn, the variant helper, the asChild merge, the overlay primitives (no components)
tooling/         tokens.json (tokens as data, with the rule each came from), build-icons.py
docs/            registry.tsx (nav + pages), pages/<group>.tsx
templates/       fintech/, project-management/
playground/      lab pages (internal)
```

## Tokens
- Bayrust tokens keep their own names and live in `registry/src/styles/tokens.css`, under
  `[data-theme="bayrust-dark"]` and `[data-theme="bayrust-light"]`. 467 of them.
- They are **generated**. Edit them through `tooling/tokens.json` and the generator, per root rule 6.
- `--ds-*` is the portable vocabulary and must be mapped in `styles/standard.css`. Prefer the Bayrust
  names inside the system, `--ds-*` in anything that leaves it.
- No hard-coded colours. A measured value with no token takes an arbitrary value and
  `/* token-exempt: reason */`.
- The reference is a dark, low-contrast surface. Its secondary and tertiary greys have **not** been
  checked against WCAG AA yet; expect to raise some. Do not lower them again to match the reference —
  check 3 is the authority, not the reference.

## Look and feel
Dark by default. Quiet surfaces, hairline borders, small radii, 13–14 px UI text, selection shown by a
translucent wash rather than a border, one accent for the focused row and primary actions. Everything
reachable by keyboard first: if a thing cannot be driven from the keyboard, it is not finished.

## Provenance
Bayrust is derived from a shipped desktop application. The measurements are kept outside this
repository, as Motion keeps `capture/` and `mirror/`. Values here are traceable to a measurement
(`tooling/tokens.json` records the declaration each token came from); anything inferred is marked.

**Never copy code, markup, class names, icons or images from the reference into this package, its docs
or its templates.** The reference is a specification to build against. This matters more here than in
most systems: the original material is an entire shipped frontend, and copying from it would put the
product's own name and assets into a public package — which `/standard/SPEC.md` §11 forbids and gate
check 14 greps for.

## Verifying a change (before you call it done)
1. `npm run gate -- bayrust --only typecheck,lint,contract,build` — the subset that runs today.
   `tokens`, `docs`, `a11y`, `responsive` and `visual` all load `docs/registry.tsx` and crash until
   the docs exist, so running them now tells you nothing.
2. Add the component to the lab and check it dark, light and at 375 px.
3. Docs page updated; `npm run gate -- bayrust --only docs`.
4. Log every gap and usability issue in `REPORT.md`, per root rule 4.
