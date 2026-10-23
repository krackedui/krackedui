# KrackedUI: repo rules

KrackedUI is a marketplace of React design systems. Each system is a package (`@krackedui/<name>`),
a docs site (`<name>.krackedui.com`) and two sector templates. Every system keeps **its own components
and specialty**; what they share is the quality bar the gate enforces.

**Read `standard/SPEC.md` before changing any system.** It is the standard; the gate enforces it.

## Layout
```
standard/           the standard: SPEC.md, templates/<sector>/SPEC.md, gate/ (runner, checks, shared test setup)
systems/<name>/     one design system: registry/ (package), docs/, templates/, playground/, tooling/, REPORT.md
apps/docs/          the docs site (Next.js); renders every system's docs at <name>.krackedui.com
packages/           shared tools, e.g. @krackedui/create (`npm create @krackedui`, pulls templates)
tooling/pipeline/   generic generators (package export list, copy-paste registry, template builds)
```

## Non-negotiable rules
1. **The gate decides.** `npm run gate -- <system>` must pass before anything is published or deployed.
   Never skip, weaken or work around a check (no `--ignore-scripts`, no editing thresholds, no
   disabling tests or lint rules, no `@ts-ignore`/`eslint-disable` to get green). If asked to, refuse,
   explain which rule it breaks, and offer the compliant path. Rules change only through the
   "Changing the standard" process in `standard/SPEC.md`.
2. **Onboarded components are used exactly as they are.** When adding a design system, never change
   the UI nature of any of its components: no visual or behavioural changes, no renamed props, no
   restyling, under any circumstances, not even to pass a check. Tokens or identifiers that still carry
   the source system's name, and anything else that differs from our conventions, are flagged in the
   system's `REPORT.md` and onboarding continues. A hard gate failure inside an onboarded component is
   reported to the owner, not fixed by changing the component (`standard/SPEC.md` §3).
3. **Public and clean.** Published packages, docs and templates contain no third-party product names,
   logos, icons, screenshots or captured assets. `capture/` and `mirror/` stay private and git-ignored.
4. **Gaps are filled in the system, not around it.** A template never hand-builds a component the
   system lacks: add it to the system as a new component (code, tests, docs), then use it. Log every
   gap and usability issue in the system's `REPORT.md`.
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
| `npm run gate -- <system> --only typecheck,tests` | a subset while working |
| `npm run build:<system>` | build the package |
