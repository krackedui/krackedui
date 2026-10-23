# The KrackedUI standard (v2.0)

KrackedUI collects React design systems. Each system keeps **its own components, APIs and tokens**:
its specialty is the point. The standard doesn't dictate which components a system has or how
they're named. It makes sure that **what a system ships is excellent**: it typechecks, lints,
is tested, builds small, installs anywhere, is accessible and responsive, looks the same release to
release, and is proven by two real templates.

The standard has two halves:
- **This document** says what is required and why.
- **The gate** (`npm run gate -- <system>`, `standard/gate/`) checks it. A system that fails the gate
  is not published to npm and not deployed. The only way to change a rule is to change this standard
  (see "Changing the standard").

---

## 1. What a system is

```
systems/<name>/
├── CLAUDE.md, AGENTS.md   system rules (tokens, naming, conventions); extends the root rules
├── registry/              the package @krackedui/<name> (published to npm)
│   ├── src/               the system's components, organised the way the system is organised
│   ├── test/              the system's behaviour tests
│   ├── build/             build pipeline → dist/
│   ├── README.md          install + usage (shipped)
│   └── SYSTEM.md          rules for building with the system, for people and AI (shipped)
├── docs/                  docs content, rendered by apps/docs → <name>.krackedui.com
├── templates/<sector>/    two sector templates → <name>.krackedui.com/<sector>, @krackedui/<name>-template-<sector>
├── playground/            internal lab (optional); never published
├── tooling/               the system's own generators (tokens, icons)
├── REPORT.md              gate results, flags, gaps found by templates, decisions
└── gate-report.json       written by the gate; required to publish
```

`<name>` is the system's own name (lowercase, one word). Never a third-party product name.

## 2. Package rules (`registry/`)

| Rule | Why |
|---|---|
| Name `@krackedui/<name>`, ESM only, `"sideEffects": ["*.css"]` | one install pattern, tree-shaking |
| Exports: `.`, `./styles.css`, `./package.json` (plus `./tailwind.css`, `./tokens.json` when the system has them) | predictable imports |
| `react` and `react-dom` ^19 are peers; every other dependency pinned to an exact version | reproducible installs |
| Works without Tailwind (`styles.css` is precompiled) | any React app |
| Styles stay inside the system's root and its portals | never restyles the host app |
| Works in React Server Components: client components carry `"use client"`; compound parts also have flat aliases (`MenuItem` for `Menu.Item`) | Next.js App Router |
| No runtime CSS-in-JS, no global side effects at import, no `window` access during render | SSR-safe |
| Bundle budget: `dist/client.js` ≤ 600 KB min, `styles.css` ≤ 250 KB (gate) | stay installable |
| Ships `README.md`, `SYSTEM.md`, `LICENSES/` for any third-party assets | usable offline, by AI |

```bash
npm install @krackedui/<name>
```
```tsx
import '@krackedui/<name>/styles.css';
// then use the system's components as its README and SYSTEM.md describe
```

## 3. Onboarding a system: use its components as they are

When a design system is brought into KrackedUI, **its components are added exactly as they are.**
- **Never change the UI nature of a component** while onboarding it: no visual changes, no behaviour
  changes, no renamed props, no restyled variants, no "alignment" with another system. Not to pass a
  check, not for consistency, not because a convention here differs. No exceptions.
- Tokens, class names or identifiers that still carry the source design system's name are **flagged**
  in `REPORT.md` (the gate's clean check lists them as warnings) and onboarding continues.
- Anything else that differs from these conventions is flagged in `REPORT.md`, not "fixed".
- If an onboarded component fails a hard gate check (e.g. accessibility or responsive), it is **not
  modified**: the failure is recorded in `REPORT.md` and the owner of KrackedUI decides what happens.
  Until then the gate stays red and the system is not published.

New components a system *gains* inside KrackedUI (e.g. found missing by a template, see §9) follow the
system's own look and conventions.

## 4. Component conventions (recommended, not enforced)

For systems built here from scratch, these keep code predictable; onboarded systems keep their own.
PascalCase components with an exported `XProps`; no default exports; compound components as objects
of parts (`Dialog.Root`) with flat aliases; controlled + uncontrolled state (`value`/`defaultValue`/
`onValueChange`, `open`/`defaultOpen`/`onOpenChange`); boolean props as adjectives (`disabled`,
`loading`); `forwardRef` + `className` merge + rest props on leaf components; a clear error when a
required provider is missing; a one-line JSDoc per exported component.

## 5. Tokens and theming

- **No token requirements.** A system keeps its own tokens and naming, as many as it wants.
- The gate's tokens check is **report only**: hard-coded colors are listed as warnings in `GATE.md`.
- Color contrast is enforced where users see it, on rendered UI, by the accessibility check (§6).

## 6. Accessibility (WCAG 2.2 AA, verified on rendered UI)

- **axe-core:** zero violations (any impact) on every docs example and template page, light and dark,
  including color contrast.
- **Focus visible:** every focusable element shows a visible focus indicator, distinct from its
  resting state.
- **Target size:** interactive targets are at least 24×24 CSS px on touch devices (`pointer: coarse`).
- Recommended (verified by the system's tests where it has them): WAI-ARIA keyboard patterns, labels on
  icon-only controls, reduced motion, no nested interactive elements.

## 7. Responsive

Every docs example and template page works at **320, 375, 768, 1024 and 1440 px**: no horizontal page
scroll (wide content scrolls inside its own container), nothing off-screen.

## 8. Behaviour tests

- Each system has its own tests in `systems/<name>/registry/test/` (Vitest + Testing Library, importing
  the system as `@system`); they must all pass and there must be at least one.
- Interactive components without a test are **flagged** in `GATE.md`, not failed.
- Tests check behaviour and accessibility semantics (roles, names, states, keyboard), not class names.

## 9. Templates

Each system is proven by building **two sector templates** chosen by the person adding the system
(catalog and specs in `standard/templates/`). Templates:
- are built only from the published package (imports from `@krackedui/<name>` only, no deep imports,
  no copied component code);
- meet the accessibility and responsive checks;
- list every route in `routes.json`, and follow the OS appearance by default when the system has themes;
- are served at `<name>.krackedui.com/<sector>` and published as `@krackedui/<name>-template-<sector>`,
  pulled with `npm create @krackedui my-app -- --system <name> --template <sector>`.

**The gap loop.** Whatever a template needs that the system lacks is added to the system as a **new**
component (with tests and docs), never hand-built inside the template and never by changing an
existing component's UI (§3). Every gap and usability problem found is written in `REPORT.md`.

## 10. Documentation (recommended, not gate-enforced)

Each system has a docs site (`docs/` → `<name>.krackedui.com`): installation, examples per component,
API tables, accessibility notes, and `SYSTEM.md` + `llms.txt` for AI. Examples should render on their
own (no reliance on the docs page around them), because the gate renders every example alone for the
install, accessibility, responsive and visual checks.

## 11. Public and clean

Everything published (package, docs, templates) contains no third-party product names, logos,
screenshots or captured assets. The gate greps the built package, docs output and templates for the
names in `systems/<name>/.clean-deny` (or the `GATE_CLEAN_DENY_<NAME>` CI secret). A denied name
inside a **token name** (e.g. `--brand-text`) is flagged, not failed (§3); anywhere else it fails.

## 12. The gate

`npm run gate -- <system>` runs, in order, and writes `systems/<name>/gate-report.json` +
`systems/<name>/GATE.md`:

| # | Check | Pass when |
|---|---|---|
| 1 | Typecheck | registry, docs, templates, playground, tests: 0 errors (strict) |
| 2 | Lint | ESLint (typescript-eslint, react-hooks, jsx-a11y): 0 errors |
| 3 | Tokens | **report only**: never fails; hard-coded colors flagged |
| 4 | Tests | the system's tests all pass (at least one); untested interactive components flagged |
| 5 | Build | package builds; bundle budget met; exports map resolves |
| 6 | Install | packed tarball installs and builds in fresh Vite and Next.js (RSC) apps; every docs example renders from the tarball |
| 7 | Copy-paste | every registry item installs alone with `shadcn add` and typechecks |
| 8 | Accessibility | axe: 0 violations on every example + template page, light and dark; focus visible; target size |
| 9 | Responsive | every example + template page at 320/375/768/1024/1440: no page overflow, nothing off-screen |
| 10 | Visual | screenshots match the approved baselines per OS (changes need `--update-baselines` and a REPORT entry) |
| 11 | Templates | both templates build from the packed package, import only the public API, pass 8–9 |
| 12 | Clean | no denied names (outside token names) or captured assets in dist, docs output or templates |

`prepublishOnly` and the docs deploy refuse to run unless `gate-report.json` says `pass` for the
current source hash. CI runs the gate on every pull request.

## 13. Versioning

Semver per system. Deprecate before removing: keep the old name working for one minor version with a
console warning in development.

## 14. Adding a new system (the procedure Claude follows)

1. Ask the person adding it to choose **two sector templates** from `standard/templates/` (or propose a new sector spec).
2. Create `systems/<name>/` from this layout; name the package `@krackedui/<name>`.
3. Add the system's components **as they are** (§3). Flag anything that differs from conventions in `REPORT.md`.
4. Make it installable (§2), add or keep its tests, write its docs and `SYSTEM.md`.
5. Build both templates from the package; run the gap loop (new components only); log gaps and usability issues in `REPORT.md`.
6. Run the gate. Hard failures in onboarded components go to the owner (§3). With the owner's approval, publish and deploy.

## Changing the standard

Changes go through a pull request that edits this file, `standard/gate/` and `standard/CHANGELOG.md`
together, says why, and runs the gate on every system. Only the KrackedUI owner approves changes.
