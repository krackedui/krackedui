# Sector templates

Every design system proves itself by building **two** of these templates. The person adding the
system picks which two. A template spec is the same for every system, so templates are comparable:
the same screens, the same data, the same flows, each built with a different system.

| Sector | Spec | Stresses |
|---|---|---|
| Project management | [project-management/SPEC.md](project-management/SPEC.md) | boards, tables, detail panels, inline editing, drag and drop |
| Fintech dashboard | [fintech/SPEC.md](fintech/SPEC.md) | dense data, charts, money formatting, forms, filters |

New sectors (CRM, e-commerce admin, healthcare, knowledge base, analytics, …) are added by writing a
spec in the same format and a PR to the standard.

## Rules for every template
- **Only the public package.** Import everything from `@krackedui/<system>` (and React). No deep imports,
  no copied component code, no extra UI libraries. Prefer the system's tokens over raw colors
  (hard-coded colors are flagged by the gate, not failed). Layout uses the system's
  `Stack`/`Grid` or Tailwind utilities with the system's `tailwind.css` tokens.
- **The gap loop.** If a screen needs something the system lacks, stop, add it to the system as a
  **new** component (tests, docs page, registry item), then use it. Never change an existing
  component's UI to fit a template. Log it in the system's
  `REPORT.md` under "Gaps found by templates". Never work around a gap inside the template.
- **Realistic, local data.** Sample data lives in `src/data/`, typed, deterministic (no random values at
  render), plausible names/amounts/dates. No network calls.
- **Every screen in the spec, at every width.** 320–1440 px, light and dark, keyboard-only usable.
- **Routes.** Hash routes (`#/`, `#/board`, …) so the build works from any base path. List them in
  `routes.json` (the gate checks each).
- **Shape.** Vite + React + TypeScript (strict). `package.json` name `@krackedui/<system>-template-<sector>`,
  scripts `dev`, `build`, `preview`, `typecheck`. A `README.md` that explains how to run and adapt it.
- **Usability log.** While building, note anything that was confusing, verbose or error-prone in the
  system's API (props you had to guess, missing variants, awkward composition) in `REPORT.md` under
  "Usability issues", with a proposed fix.

## Where templates live and how people get them
- Source: `systems/<system>/templates/<sector>/`
- Live: `https://<system>.krackedui.com/<sector>`
- Pull: `npm create @krackedui my-app -- --system <system> --template <sector>`
