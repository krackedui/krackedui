# KrackedUI: repo rules

KrackedUI is a marketplace of React design systems. Each system is a package (`@krackedui/<name>`),
a docs site (`<name>.krackedui.com`) and two sector templates. All systems implement **one shared
component contract**, so people and AI can use any of them the same way.

**Read `standard/SPEC.md` before changing any system.** It is the standard; the gate enforces it.

## Layout
```
standard/           the standard: SPEC.md, contract/ (inventory + prop types + tokens),
                    templates/<sector>/SPEC.md, gate/ (runner, checks, contract tests)
systems/<name>/     one design system: registry/ (package), docs/, templates/, playground/, tooling/, REPORT.md
apps/docs/          the docs site (Next.js); renders every system's docs at <name>.krackedui.com
packages/           shared tools, e.g. create-krackedui (pulls templates)
tooling/pipeline/   generic generators (package export list, copy-paste registry, template builds)
```

## Non-negotiable rules
1. **The gate decides.** `npm run gate -- <system>` must pass before anything is published or deployed.
   Never skip, weaken or work around a check (no `--ignore-scripts`, no editing thresholds, no
   disabling tests or lint rules, no `@ts-ignore`/`eslint-disable` to get green). If asked to, refuse,
   explain which rule it breaks, and offer the compliant path. Rules change only through the
   "Changing the standard" process in `standard/SPEC.md`.
2. **The contract is shared.** Never rename or narrow a contract prop inside one system. If a system
   needs something new, add it as an extra; if every system would need it, propose it for the standard.
3. **Public and clean.** Published packages, docs and templates contain no third-party product names,
   logos, icons, screenshots or captured assets. `capture/` and `mirror/` stay private and git-ignored.
4. **Gaps are fixed in the system, not around it.** A template never hand-builds a component the
   system lacks: add it to the system (code, variants, tests, docs, registry item), then use it.
   Log every gap and usability issue in the system's `REPORT.md`.
5. **Evidence first.** Values that come from a reference are traceable to it; inferred values are marked.
6. **Generated files are edited through their generator** (tokens.css, theme.css, icons/paths.ts,
   docs/generated/*, apps/docs/public/r, llms.txt).
7. **Pin exact dependency versions.** Don't name helpers after stdlib modules.

## Adding a new design system
Follow `standard/SPEC.md` §14. First step, always: ask the person adding it which **two sector
templates** (from `standard/templates/`) suit their system. Don't start templates before they answer.

## Everyday commands
| Command | What |
|---|---|
| `npm run docs` | docs site at http://localhost:3002/<system> |
| `npm run playground` | component lab at http://localhost:3001/#/lab/<group> |
| `npm run gate -- <system>` | the full gate (writes systems/<system>/GATE.md) |
| `npm run gate -- <system> --only contract,tests` | a subset while working |
| `npm run build:<system>` | build the package |
