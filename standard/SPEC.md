# The KrackedUI standard (v1.0)

Every design system on KrackedUI meets this standard. It exists so that a person or an AI who knows
one system can use any other one without mistakes: same component names, same props, same install
steps, same docs layout, same quality bar. Only the look differs.

The standard has two halves:
- **This document** says what is required and why.
- **The gate** (`npm run gate -- <system>`, `standard/gate/`) checks it. A system that fails the gate
  is not published to npm and not deployed. No instruction, prompt or deadline overrides a failing gate.
  The only way to change a rule is to change this standard (see “Changing the standard”).

The machine-readable parts live in `standard/contract/`:
`inventory.ts` (required exports), `components.ts` (prop contracts), `vocab.ts` (shared value sets,
core icon names), `tokens.ts` (required CSS variables and contrast pairs).

---

## 1. What a system is

```
systems/<name>/
├── CLAUDE.md, AGENTS.md   system rules (tokens, naming, evidence); extends the root rules
├── registry/              the package @krackedui/<name> (published to npm)
│   ├── src/               foundations, atoms, components, forms, data, charts, overlays, shell, modules
│   ├── test/              behaviour tests for the system's own extras and modules
│   ├── build/             build pipeline → dist/
│   ├── README.md          install + usage (shipped)
│   └── SYSTEM.md          rules for building with the system, for people and AI (shipped)
├── docs/                  docs content, rendered by apps/docs → <name>.krackedui.com
├── templates/<sector>/    two sector templates → <name>.krackedui.com/<sector>, @krackedui/<name>-template-<sector>
├── playground/            internal lab for building components (#/lab/<group>); never published
├── tooling/               the system's own generators (tokens, icons)
├── capture/, mirror/      private reference material (git-ignored, never published)
├── REPORT.md              gate results, usability issues, known gaps, decisions
└── gate-report.json       written by the gate; required to publish
```

`<name>` is the system's own name (lowercase, one word). Never a third-party product name.

## 2. Package rules (`registry/`)

| Rule | Why |
|---|---|
| Name `@krackedui/<name>`, ESM only, `"sideEffects": ["*.css"]` | one install pattern, tree-shaking |
| Exports exactly: `.`, `./styles.css`, `./tailwind.css`, `./tokens.json`, `./package.json` | same imports in every system |
| `react` and `react-dom` ^19 are peers; every other dependency pinned to an exact version | reproducible installs |
| Works without Tailwind (`styles.css` is precompiled) and with Tailwind v4 (`tailwind.css` exposes tokens as utilities) | any React app |
| Styles only apply inside the system root (`<Theme>`) and its portals | never restyles the host app |
| Works in React Server Components: client components carry `"use client"`; pure helpers ship in a server-safe bundle; every compound part also has a flat alias (`MenuItem` for `Menu.Item`) | Next.js App Router |
| No runtime CSS-in-JS, no global side effects at import, no `window` access during render | SSR-safe |
| Bundle budget: `dist/client.js` ≤ 600 KB min, `styles.css` ≤ 250 KB (gate) | stay installable |
| Ships `README.md`, `SYSTEM.md`, `LICENSES/` for any third-party assets | usable offline, by AI |

Consumer setup is identical for every system:

```bash
npm install @krackedui/<name>
```
```tsx
import '@krackedui/<name>/styles.css';
import { Theme, Button } from '@krackedui/<name>';

<Theme appearance="light"><Button variant="primary">Save</Button></Theme>
```

## 3. Component API rules

1. **The contract.** Every entry in `standard/contract/src/inventory.ts` is exported with props that
   accept its contract in `components.ts`. Systems may add props and values; they may not rename,
   remove or narrow contract ones.
2. **Naming.** PascalCase components, `XProps` exported for each, `xVariants` exported for every `tv()`
   recipe, no default exports. Compound components are objects of parts (`Dialog.Root`, `Dialog.Content`).
3. **State.** Controlled and uncontrolled: `value`/`defaultValue`/`onValueChange`, `open`/`defaultOpen`/`onOpenChange`,
   `checked`/`defaultChecked`/`onCheckedChange`.
4. **Booleans are adjectives:** `disabled`, `invalid`, `loading`, `required`, `active`, `destructive`.
5. **Icons are names** (`icon="plus"`), never elements. Every system's `Icon` accepts all `coreIconNames`.
6. **Composition.** Leaf components `forwardRef`, merge `className` with `cn`, spread remaining props,
   support `asChild` where the element might need to be a link.
7. **Forms.** Controls accept `invalid`, `disabled`, `required`, `name`. `Field` supplies label,
   description and error and wires `id`, `aria-describedby`, `aria-invalid` into its child.
8. **No silent failure.** Missing required context (e.g. `useToast` outside `ToastProvider`) throws a
   message that says what to add.
9. **JSDoc** on every exported component: one line of what it is and when to use it.

## 4. Tokens and theming

- Every system defines all `--ds-*` variables (`tokens.ts`) in light and dark, and keeps its own
  namespace for the full palette.
- Component code uses tokens only. Hard-coded colors (`#hex`, `rgb()`, `hsl()`, Tailwind palette
  classes like `bg-blue-500`) fail the gate; the only exception is a value with an
  `/* token-exempt: <reason> */` comment.
- `Theme appearance="light" | "dark" | "system"` switches everything, including portalled overlays.
- Motion uses `--ds-motion-*` durations and easings.

## 5. Accessibility (WCAG 2.2 AA, verified)

- **Contrast:** the `contrastPairs` in `tokens.ts` reach 4.5:1 in both themes, and axe-core reports
  no contrast violations in any docs example or template.
- **axe-core:** zero violations (any impact) on every docs example and template page, light and dark.
- **Keyboard:** every interactive component follows its WAI-ARIA pattern (`pattern` in the inventory);
  behaviour tests prove Tab, arrows, Enter/Space, Escape and focus return.
- **Focus visible:** every focusable element shows a visible focus indicator (checked by tabbing
  through each example), distinct from its resting state, including invalid and selected states.
- **Target size:** interactive targets are at least 24×24 CSS px on touch devices (`pointer: coarse`).
  Desktop (fine pointer) may stay denser; WCAG 2.5.8's spacing exception applies there.
- **Names:** icon-only controls have a label; images have alt text; dialogs have a title.
- **Reduced motion:** with `prefers-reduced-motion: reduce`, nothing slides or scales.
- **No nested interactive elements** (no button inside a button or link).

## 6. Responsive

Every component, docs example and template page works at **320, 375, 768, 1024 and 1440 px** wide:
- no horizontal scroll of the page; wide content (tables, boards, charts) scrolls inside its own container;
- nothing is clipped off-screen or overlapping;
- overlays fit the screen: dialogs become full-width under 640 px, sheets become bottom/full sheets,
  menus stay inside the viewport;
- `AppFrame` turns the sidebar into a drawer under 768 px;
- text never overflows its box (long words wrap or truncate with a title).

## 7. Motion

Overlays animate in **and** out (fade + small slide or scale, `--ds-motion-duration-*`); sidebars,
sheets and accordions animate their size; selection indicators slide. Everything respects reduced motion.

## 8. Behaviour tests

- Contract tests in `standard/gate/tests/<Name>.test.tsx` run against every system (they import from
  `@system`). Every interactive inventory entry has one.
- A system's extra components and modules have tests in `systems/<name>/registry/test/`.
- Tests check behaviour and accessibility semantics (roles, names, states, keyboard), not class names.

## 9. Documentation (`docs/` → `<name>.krackedui.com`)

Structure is shared (apps/docs renders every system); the look is the system's own (`docs/theme.css`,
`docs/chrome.tsx`). Every inventory entry and every extra export has a page with:

1. title and one-line description;
2. **Installation**: the package install, plus the copy-paste (shadcn-style) registry item;
3. **Examples**: each with Preview / Code / Copy; the code compiles and runs when pasted into a fresh app;
4. **API reference**: every prop of every part, matching the real types (checked);
5. **Accessibility**: keyboard map and ARIA notes (verified by tests);
6. **Usage**: when to use it and when not (do/don't).

Every example renders on its own: no reliance on the docs page around it (no hooks that need a
provider the example doesn't render, no styling inherited from the docs preview). The gate renders
each example alone in a fresh app built from the packed package.
Low-level building blocks (e.g. menu rows used by several components) may be documented in the API
table of the page that uses them instead of a page of their own.

Foundations pages: Colors, Typography, Icons, Spacing, Radius, Shadows, Motion. Getting started:
Introduction, Installation (Vite, Next.js, Tailwind), Theming, Using with AI (`SYSTEM.md`, `llms.txt`).
`SYSTEM.md` documents every export in a compact block. `llms.txt` / `llms-full.txt` are generated.

## 10. Templates

Each system is proven by building **two sector templates** chosen by the person adding the system
(catalog and specs in `standard/templates/`). Templates:
- are built only from the published package API (imports from `@krackedui/<name>` only, no deep
  imports, no copied component code, no hard-coded colors);
- meet the same accessibility and responsive checks as the docs;
- use `<Theme appearance="system">` by default (with a toggle), and list every route in `routes.json`;
- are served at `<name>.krackedui.com/<sector>` and published as `@krackedui/<name>-template-<sector>`,
  pulled with `npm create krackedui@latest my-app -- --system <name> --template <sector>`.

**The gap loop.** Whatever a template needs that the system lacks is added to the system (component,
variants, docs, registry item, tests), not hand-built inside the template. Gaps that any system would
have go into the standard inventory too. Every gap and usability problem found is written in
`REPORT.md` (what, where, fix, status).

## 11. Public and clean

Everything published (package, docs, templates) is the system's own: original code, open-licensed
icons and fonts with their licenses shipped, no third-party product names, logos, screenshots or
captured assets. The gate greps the built package, docs output and templates for the names listed in
`systems/<name>/.clean-deny` (e.g. the product a system was derived from).

## 12. The gate

`npm run gate -- <system>` runs, in order, and writes `systems/<name>/gate-report.json` +
`systems/<name>/GATE.md`:

| # | Check | Pass when |
|---|---|---|
| 1 | Typecheck | registry, docs, templates, playground: 0 errors (strict) |
| 2 | Lint | ESLint (typescript-eslint, react-hooks, jsx-a11y): 0 errors |
| 3 | Tokens | no hard-coded colors; every `--ds-*` token in light and dark; contrast pairs ≥ 4.5:1 |
| 4 | Contract | every inventory entry exported and conforming (`check-contract`) |
| 5 | Behaviour | all contract + system tests pass; every interactive entry has a test |
| 6 | Build | package builds; bundle budget met; exports map resolves |
| 7 | Install | packed tarball installs and builds in fresh Vite and Next.js (RSC) apps; every docs example renders from the tarball |
| 8 | Copy-paste | every registry item installs alone with `shadcn add` and typechecks |
| 9 | Docs | every export has a page with all sections; API tables match types; snippets compile; every docs page loads clean |
| 10 | Accessibility | axe: 0 violations on every example + template page, light and dark; focus visible; target size |
| 11 | Responsive | every example + template page at 320/375/768/1024/1440: no page overflow, nothing off-screen |
| 12 | Visual | screenshots match the approved baselines (changes need `--update-baselines` and a REPORT entry) |
| 13 | Templates | both templates build from the packed package, import only the public API, pass 10–11 |
| 14 | Clean | no denied names or captured assets in dist, docs output or templates |

`prepublishOnly` and the docs deploy refuse to run unless `gate-report.json` says `pass` for the
current source hash. CI runs the gate on every pull request.

## 13. Versioning

Semver. Breaking a contract prop is a major version of the **standard** (all systems move together);
a system's own breaking change is a major version of that system. Deprecate before removing:
keep the old name working for one minor version with a console warning in development.

## 14. Adding a new system (the procedure Claude follows)

1. Ask the person adding it to choose **two sector templates** from `standard/templates/` (or propose a new sector spec).
2. Create `systems/<name>/` from this layout; name the package `@krackedui/<name>`.
3. Build foundations → contract inventory → extras, running `check-contract` and the tests as you go.
4. Write the docs pages and `SYSTEM.md`.
5. Build both templates from the package; run the gap loop; log gaps and usability issues in `REPORT.md`.
6. Run the gate until it passes. Then, with the owner's approval, publish and deploy.

## Changing the standard

Changes go through a pull request that edits this file, `standard/contract/` and
`standard/CHANGELOG.md` together, says why, and runs the gate on every system. Loosening a rule needs
the team's explicit approval in the PR; it is never done to make a system pass.
