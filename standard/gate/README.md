# The gate

`npm run gate -- <system>` checks a system against the KrackedUI standard (`standard/SPEC.md` §12) and
writes `systems/<system>/gate-report.json` (machine-readable) and `systems/<system>/GATE.md` (for people).
A system is published and deployed only when the full gate passes for the exact current source.

```bash
npm run gate -- motion                              # everything
npm run gate -- motion --only typecheck,lint,tokens,tests   # fast loop while working
npm run gate -- motion --skip-slow                  # skip install, copy-paste, a11y, responsive, visual, templates
npm run gate -- motion --only visual --update-baselines   # approve new screenshots (log why in REPORT.md)
npm run gate:verify -- motion                       # is there a valid passing report for the current source?
```

`--only` / `--skip-slow` runs are **partial**: the report says `"partial": true` and can never be used to
publish. Exit code: 0 when everything that ran passed, 1 otherwise. `GATE_VISUAL_FILTER=<regex>` limits the
visual check to matching example names (for trying baselines locally; a filtered run is still partial
only if combined with `--only`, so use it with `--only visual`).

## Checks (in order)

| id | What it does | Fails when |
|---|---|---|
| `typecheck` | `tsc --noEmit` for registry, playground, apps/docs (which includes `systems/<name>/docs`), the system's tests (`registry/test`, `@system` → this system) and every template | any error, or a project that is not `strict` |
| `lint` | ESLint 9 with the root `eslint.config.mjs` (typescript-eslint recommended-type-checked, react-hooks, jsx-a11y recommended) over registry/src, registry/test, templates, docs; plus a scan for `eslint-disable`, `@ts-ignore`, `@ts-nocheck` in registry/src and templates (where `noInlineConfig` is also on) | any error. Warnings (e.g. `react-hooks/exhaustive-deps`) are listed, not failed. The summary counts errors per rule |
| `tokens` | **report only**: hard-coded colors in registry/src `*.ts(x)` (not `styles/`, not generated files) and template sources: `#hex`, `rgb()`, `hsl()`, Tailwind palette / `white` / `black` classes, listed as warnings in GATE.md | never (systems keep their own tokens; contrast is checked on rendered UI by `a11y`) |
| `tests` | Vitest (`vitest.config.ts`): `systems/<name>/registry/test/**` against `@system`, with the shared jsdom setup in `standard/gate/tests/setup.ts` | a failing test or suite, or no tests at all. Interactive components without a test are warnings |
| `build` | `npm run build -w @krackedui/<name>`; `dist/client.js` minified with esbuild ≤ 600 KB, `styles.css` ≤ 250 KB; the exports map has `.`, `./styles.css`, `./package.json` (extra entries allowed) and every target exists; ESM, `sideEffects: ["*.css"]`, exact dependency pins, React ^19 peers | any |
| `install` | `npm pack` into fresh apps outside the monorepo: Vite (tsc + build, importing every export and rendering the README's full-page example when it has one), Next.js App Router with a **server component** page that imports every export of the package and renders recipes for the common compound components the system has (built, started, loaded in Chromium); then every docs example rendered alone from the tarball, in light and dark | build/type errors, console errors, uncaught exceptions, crashes, empty renders |
| `copy-paste` | `checks/sweep-copy-paste.mjs`: every registry item (`/r/<name>/*.json`) installs alone with `shadcn add` into a fresh project and typechecks | any item fails |
| `a11y` | each example (and template route): axe-core (WCAG 2.0–2.2 A/AA + best-practice) in light and dark; Tab through the page with a visible focus indicator required at every stop; touch emulation at 375 px (`pointer: coarse`) with WCAG 2.5.8 targets ≥ 24×24 | any violation |
| `responsive` | each example (and template route) at 320/375/768/1024/1440: page-level horizontal scroll; visible elements past the viewport that no ancestor clips or scrolls; nowrap text overflowing its own box | any |
| `visual` | full-page screenshot of each example (light, 1280 px, reduced motion, animations off) compared with `systems/<name>/gate/baselines/<page>--<example>.png` (pixelmatch, per-pixel threshold 0.1) | > 0.5% of pixels changed, a size change, or a missing baseline |
| `templates` | each `systems/<name>/templates/<sector>`: package name, depends on the system, imports only `@krackedui/<name>` (+ its exported CSS files), no relative imports out of the template; copied to a temp dir, dependency replaced by the tarball, installed, `vite build`, served; a11y + responsive on every route in `routes.json` | fewer than 2 templates, or any problem |
| `clean` | each line of `systems/<name>/.clean-deny` (or the `GATE_CLEAN_DENY_<NAME>` secret; case-insensitive, whole word) searched in `dist/`, `systems/<name>/docs`, `apps/docs/public/<name>` and `/r/<name>`, templates (src + build), README.md and SYSTEM.md; hits inside **token names** (`--brand-text`, `bg-brand-gray`) are warnings; the packed file list must have no capture/mirror/raw files and no images outside LICENSES; no references to files in capture/ or mirror/ | any hit outside a token name, or any shipped/referenced captured file |

### What the browser checks see

- Examples come from the docs registry (`hero`, `examples`, and examples inside sections), completed with
  `apps/docs/lib/snippet.ts` exactly as the docs Code tab shows them. Each one is rendered **alone** in a
  Vite app built from the packed tarball: `http://127.0.0.1:<port>/?ex=<id>[&theme=dark]`, inside
  `<div class="<previewRootClassName> [dark]">` with 16 px padding, `lang="en"` and a `<main>`.
  An example that fails to build is replaced by a stub that throws the build error, so the others still run.
- Names in reports are `<page-slug>#<example-id>` (e.g. `ui/button#hero`). Widths are written `@320`.
- axe page-level rules that belong to the harness are off: `region`, `landmark-one-main`, `page-has-heading-one`.
- Focus visible: an element passes if it has a non-transparent outline wider than 0, or its outline,
  box-shadow or border-color (or that of a pseudo-element, or of one of its two nearest ancestors) differs
  from the unfocused state. Elements smaller than 2 px (visually hidden) are skipped. At most 25 Tab stops
  per example (60 per template page).
- Target size: interactive means links, buttons, inputs, selects, textareas, ARIA widget roles and
  `tabindex ≥ 0`. Hidden, `aria-hidden`, `inert`, disabled and nested-inside-another-target elements are
  skipped. A control inside a `<label>` is measured by its label. Exempt: inline links inside text, and
  undersized targets whose 24 px circle overlaps no other target or circle (the WCAG 2.5.8 spacing exception).
- Responsive: elements inside an ancestor with `overflow(-x)` auto/hidden/scroll/clip are not reported
  (they scroll or clip by design). Invisible and screen-reader-only elements are ignored. Once an element
  is reported, its descendants are not.
- Slow checks share one build, one tarball, one examples app and one Chromium (6 pages in parallel).
  Scratch apps live in `$TMPDIR/krackedui-gate-<system>/` and keep `node_modules` between runs.
- The docs and copy-paste checks use `DOCS_URL` or a docs site on :3002. If none answers, they start
  `next dev` on a free port and stop it afterwards. They regenerate the docs assets first
  (`docs/generated/exports.json`, `/r/<name>`, `llms.txt`). A stale `exports.json` fails the run.
- Playwright's bundled Chromium is used (CI installs it). Locally, an installed Chrome is the fallback.

## Reading failures

The terminal prints each check's summary and its first 8 problems. `GATE.md` lists up to 300 per check,
and the report file has all of them (`checks[].details[]`, each `{ where, message }`; `warnings[]` where
relevant; `data` with counts). Raw outputs stay in `.scratch/gate/<system>/` (`eslint.json`,
`vitest.json`, `visual/` diffs and actual screenshots), `.scratch/snippets/<system>/` and
`.scratch/api-check/`.

## Templates convention

`systems/<name>/templates/<sector>/` is a Vite app named `@krackedui/<name>-template-<sector>` that depends
on `@krackedui/<name>` and has a `routes.json`: a JSON array of routes relative to the app's base URL,
for example `["/", "/#/projects", "/#/settings"]`. Dark mode is audited through
`prefers-color-scheme: dark`, so templates follow the OS setting (`<Theme appearance="system">`).
A template's publish script uses `verify` from `standard/gate/verify.mjs`, the same way the package does.

## Enforcement

- `verify.mjs <system>` exits non-zero unless the report has `status: "pass"`, is not `partial`, and its
  `sourceHash` equals the current hash (sha256 over registry/src, registry/build, registry/package.json,
  docs/, templates/, gate/baselines/ and standard/gate; node_modules and dist
  excluded). The package's `prepublishOnly` runs it. A run during which the sources changed writes an
  invalid hash.
- `.claude/settings.json` runs `guard.mjs` before every Bash command. It blocks `npm|pnpm|yarn publish` with
  `--ignore-scripts` or for a system whose verify fails, `vercel deploy` / `vercel --prod` unless every
  system verifies, `git … --no-verify` (and `git commit -n`), and shell edits or deletes of the report file.
  Heredoc bodies are treated as data.
- `.github/workflows/gate.yml` runs the full gate for every system on pull requests and on pushes to main,
  and uploads `GATE.md`, the report and visual diffs.

## Baselines

Baselines are PNGs in `systems/<name>/gate/baselines/`, one per example. When a visual change is intended,
run `npm run gate -- <name> --only visual --update-baselines`, review the new PNGs in the diff, and add a
REPORT.md entry saying why. Then run the full gate (baselines are part of the source hash).

## Thresholds are part of the standard

The budgets (600 KB / 250 KB), contrast 4.5:1, 24 px targets, the five widths, the 0.5% visual threshold,
the lint rule set and the required docs sections are part of the standard. Change them only through the
"Changing the standard" process in `standard/SPEC.md`: a PR that edits SPEC.md, the gate and
CHANGELOG.md together and runs the gate on every system. Never loosen them to make a system pass.
