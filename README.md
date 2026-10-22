# KrackedUI

A marketplace of React design systems that all speak the same language. Every system is:

- an npm package, **`@krackedui/<name>`**, built to one shared component contract (same names, same props);
- a docs site at **`<name>.krackedui.com`**;
- two sector templates at **`<name>.krackedui.com/<sector>`**, pulled with `npm create @krackedui`.

Learn one system and you can use them all: switching systems is changing the import. Only the look differs.

| System | Package | Look | Templates |
|---|---|---|---|
| **Motion** (reference) | `@krackedui/motion` | calm, content-first, dense; block editor + database views | project management, fintech |

> Capture tooling and private reference material are not part of this repository. Everything published
> (packages, docs, templates) is clean: original code, open-licensed icons, no third-party branding.

---

## Use a system

```bash
npm install @krackedui/motion
```

```tsx
import '@krackedui/motion/styles.css';
import { Theme, Button, Menu, IconButton } from '@krackedui/motion';

export function App() {
  return (
    <Theme appearance="system">
      <Button variant="primary" icon="plus">New</Button>
      <Menu.Root>
        <Menu.Trigger asChild><IconButton icon="more" label="Actions" /></Menu.Trigger>
        <Menu.Content>
          <Menu.Item icon="link" shortcut="⌘L">Copy link</Menu.Item>
          <Menu.Item icon="trash" destructive>Delete</Menu.Item>
        </Menu.Content>
      </Menu.Root>
    </Theme>
  );
}
```

Or start from a template:

```bash
npm create @krackedui my-app -- --system motion --template fintech
```

---

## How the repo works

```
standard/           THE STANDARD
  SPEC.md           what every system must do, and why
  contract/         the contract in code: inventory, prop types, shared vocabularies, required tokens
  templates/        sector template specs (project management, fintech, …)
  gate/             the gate: one command that checks a system against the standard
systems/<name>/     ONE DESIGN SYSTEM
  registry/         the npm package @krackedui/<name>
  docs/             its docs content (rendered by apps/docs)
  templates/        its two sector templates
  playground/       internal component lab
  REPORT.md         gate results, gaps found by templates, usability issues
apps/docs/          the docs site; serves <name>.krackedui.com and <name>.krackedui.com/<template>/
packages/
  create/           `npm create @krackedui` (pulls a template from npm)
tooling/pipeline/   generators (export list, copy-paste registry, template builds)
```

### The gate

```bash
npm run gate -- motion                      # everything; writes systems/motion/GATE.md
npm run gate -- motion --only contract,tests
```

The gate checks types, lint, tokens and contrast, the contract, behaviour tests, the build and bundle
size, installing the packed package in fresh Vite and Next.js apps, copy-paste installs, docs
completeness and accuracy, accessibility (axe, focus, target size), responsiveness (320–1440 px),
visual baselines, both templates, and that nothing third-party ships. Publishing refuses to run
unless the gate passed on the exact current source. See [standard/gate/README.md](standard/gate/README.md).

### Everyday commands

| Command | What | URL |
|---|---|---|
| `npm run docs` | docs site | http://localhost:3002/motion (or http://motion.localhost:3002) |
| `npm run playground` | component lab | http://localhost:3001/#/lab/atoms |
| `npm run build:motion` | build the package | |
| `npm run docs:assets` | regenerate copy-paste registry, llms.txt, template builds | |

### Add a design system

Follow [standard/SPEC.md §14](standard/SPEC.md). In short: pick two templates from
[standard/templates](standard/templates/README.md), create `systems/<name>/`, implement the contract,
document it, build the templates (fixing gaps in the system), and run the gate until it passes.

### Release

1. `npm run gate -- <name>` passes (GATE.md, gate-report.json).
2. Bump the version, `npm publish -w @krackedui/<name>` (prepublishOnly re-verifies the gate).
3. Publish the templates and deploy the docs.

## Rules for contributors and AI agents

[AGENTS.md](AGENTS.md) (repo), `systems/<name>/AGENTS.md` (per system), [standard/SPEC.md](standard/SPEC.md).
