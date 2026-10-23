# Gate: bayrust

**FAIL** · 2026-10-23T19:28:31.377Z · 274s · source `60e85ecd3894`

Command: `npm run gate -- bayrust`

| # | Check | Result | Summary |
|---|---|---|---|
| 1 | Typecheck (`typecheck`) | PASS | 0 errors (playground: 0 errors, registry: 0 errors, docs (apps/docs + systems docs): 0 errors, tests: 0 errors, template fintech: 0 errors, template project-management: 0 errors) |
| 2 | Lint (`lint`) | PASS | 0 errors, 0 warnings in 78 files |
| 3 | Tokens (report only) (`tokens`) | PASS | report only: 0 hard-coded colors flagged in 62 files |
| 4 | Behaviour tests (`tests`) | PASS | 51/51 tests passed in 37 files; 24/55 interactive components have a test (untested ones are flagged) |
| 5 | Build (`build`) | PASS | built in 1s; client.js 76 KB min (≤ 600 KB), styles.css 90 KB (≤ 250 KB); 7 export targets resolve |
| 6 | Install (`install`) | PASS | vite app ok, next RSC app ok (9 compounds); 44/44 examples render clean in light + dark (0 problems) |
| 7 | Copy-paste (`copy-paste`) | FAIL | 2/35 registry items install alone with shadcn and typecheck |
| 8 | Accessibility (`a11y`) | PASS | 44/44 examples clean (axe light+dark, focus-visible, 24px targets on touch); 14 template pages |
| 9 | Responsive (`responsive`) | PASS | 44/44 examples fit at 320/375/768/1024/1440 px (problems by width: 320:0, 375:0, 768:0, 1024:0, 1440:0); 14 template pages |
| 10 | Visual (`visual`) | PASS | 44/44 examples match their baseline (0 changed, 0 without baseline; threshold 0.5% pixels) |
| 11 | Templates (`templates`) | PASS | 2 templates, 2 build from the tarball; 14 pages: 0 a11y problems, 0 responsive problems |
| 12 | Clean (`clean`) | PASS | 130 files scanned, 51 packed files: 0 problems, 0 token names flagged |

## Behaviour tests — PASS

51/51 tests passed in 37 files; 24/55 interactive components have a test (untested ones are flagged)


**Warnings** (do not fail the gate):

- AccordionItem: interactive component (display/accordion.tsx) has no test in systems/bayrust/registry/test
- AccordionRoot: interactive component (display/accordion.tsx) has no test in systems/bayrust/registry/test
- CommandPaletteDialog: interactive component (overlays/command-palette.tsx) has no test in systems/bayrust/registry/test
- ContextMenuCheckboxItem: interactive component (navigation/menu.tsx) has no test in systems/bayrust/registry/test
- ContextMenuItem: interactive component (navigation/menu.tsx) has no test in systems/bayrust/registry/test
- ContextMenuRadioGroup: interactive component (navigation/menu.tsx) has no test in systems/bayrust/registry/test
- ContextMenuRadioItem: interactive component (navigation/menu.tsx) has no test in systems/bayrust/registry/test
- ContextMenuRoot: interactive component (navigation/context-menu.tsx) has no test in systems/bayrust/registry/test
- ContextMenuSub: interactive component (navigation/menu.tsx) has no test in systems/bayrust/registry/test
- DialogRoot: interactive component (overlays/dialog.tsx) has no test in systems/bayrust/registry/test
- MenuCheckboxItem: interactive component (navigation/menu.tsx) has no test in systems/bayrust/registry/test
- MenuItem: interactive component (navigation/menu.tsx) has no test in systems/bayrust/registry/test
- MenuRadioGroup: interactive component (navigation/menu.tsx) has no test in systems/bayrust/registry/test
- MenuRadioItem: interactive component (navigation/menu.tsx) has no test in systems/bayrust/registry/test
- MenuRoot: interactive component (navigation/menu.tsx) has no test in systems/bayrust/registry/test
- MenuSub: interactive component (navigation/menu.tsx) has no test in systems/bayrust/registry/test
- PopoverRoot: interactive component (overlays/popover.tsx) has no test in systems/bayrust/registry/test
- Progress: interactive component (feedback/status.tsx) has no test in systems/bayrust/registry/test
- Radio: interactive component (forms/choice.tsx) has no test in systems/bayrust/registry/test
- SegmentedControl: interactive component (forms/choice.tsx) has no test in systems/bayrust/registry/test
- Select: interactive component (forms/choice.tsx) has no test in systems/bayrust/registry/test
- Sheet: interactive component (overlays/dialog.tsx) has no test in systems/bayrust/registry/test
- SheetRoot: interactive component (overlays/dialog.tsx) has no test in systems/bayrust/registry/test
- Sidebar: interactive component (shell/shell.tsx) has no test in systems/bayrust/registry/test
- SidebarItem: interactive component (shell/shell.tsx) has no test in systems/bayrust/registry/test
- Stat: interactive component (display/stat.tsx) has no test in systems/bayrust/registry/test
- TableHead: interactive component (display/table.tsx) has no test in systems/bayrust/registry/test
- TabsContent: interactive component (navigation/tabs.tsx) has no test in systems/bayrust/registry/test
- TabsRoot: interactive component (navigation/tabs.tsx) has no test in systems/bayrust/registry/test
- TabsTrigger: interactive component (navigation/tabs.tsx) has no test in systems/bayrust/registry/test
- Tag: interactive component (display/badge.tsx) has no test in systems/bayrust/registry/test

## Copy-paste — FAIL

2/35 registry items install alone with shadcn and typecheck

- foundation: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- display-card: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- display-badge: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- actions-actions: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- display-accordion: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- display-data-table: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- charts-charts: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- display-avatar: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- display-table: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- forms-calendar: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- forms-choice: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- display-stat: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- feedback-status: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- feedback-alert: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- forms-combobox: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- forms-date-picker: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- foundations-icon-paths: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- forms-field: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- forms-slider: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- forms-text-inputs: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- forms-file-upload: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- foundations-icon: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- navigation-breadcrumbs: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- layout-layout: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- navigation-menu: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- navigation-context-menu: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- navigation-tabs: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- overlays-command-palette: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- overlays-confirm-dialog: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- overlays-dialog: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- server-safe: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- overlays-popover: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 
- shell-shell: [typecheck] src/components/motion-bayrust/lib/overlay.tsx(5,30): error TS2307: Cannot find module '../foundations/theme' or its corresponding type declarations. src/components/motion-bayrust/lib/overlay.tsx(21,28): error TS2339: Property 'portalContainer' does not exist on type '{}'. 

---
Written by `npm run gate`. Thresholds are part of the standard (standard/SPEC.md §12); change them only through the SPEC process.
