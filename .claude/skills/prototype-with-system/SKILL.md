---
name: prototype-with-system
description: Prototype a screen with one of the KrackedUI design systems (e.g. "prototype a settings page in Motion", "build this dashboard with @krackedui/motion"). Loads the system's SYSTEM.md rules and builds with its @krackedui/<name> package.
---

# Prototype with a KrackedUI design system

1. Identify the system (folders under `systems/`, e.g. `motion`). If unclear, ask which one.
2. Read `systems/<name>/registry/SYSTEM.md` fully before writing any UI. It is the source of truth for
   tokens, components, recipes and do/don't rules. Each system has its own components and props, so
   never assume another system's API.
3. Build the prototype as a page in `systems/<name>/playground/src/prototypes/<slug>.tsx` (default export)
   using only `@krackedui/<name>` components and tokens (`--ds-*` for portable code, the system's own
   tokens for its look). Open it at `http://localhost:3001/#/proto/<slug>` (start the lab with
   `npm run playground` if it isn't running).
4. Check it in light and dark (`?dark`) and at 375 px wide.
5. If you need a component that doesn't exist, don't hand-build it in the prototype: say so, and add it
   to the system following `systems/<name>/AGENTS.md` (code, tests, docs) if the user agrees.
