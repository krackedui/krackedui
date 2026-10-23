# Gate: bayrust

**INCOMPLETE** (partial run: not valid for publishing) · 2026-10-23T14:04:15.704Z · 12s · source `10fc60f467d9`

Command: `npm run gate -- bayrust --only typecheck,lint,tests,build,clean`

| # | Check | Result | Summary |
|---|---|---|---|
| 1 | Typecheck (`typecheck`) | PASS | 0 errors (playground: 0 errors, registry: 0 errors, docs (apps/docs + systems docs): 0 errors, tests: 0 errors) |
| 2 | Lint (`lint`) | PASS | 0 errors, 0 warnings in 54 files |
| 3 | Tokens (report only) (`tokens`) | skip | not selected (--only) |
| 4 | Behaviour tests (`tests`) | PASS | 51/51 tests passed in 37 files; 24/55 interactive components have a test (untested ones are flagged) |
| 5 | Build (`build`) | PASS | built in 1s; client.js 75 KB min (≤ 600 KB), styles.css 88 KB (≤ 250 KB); 7 export targets resolve |
| 6 | Install (`install`) | skip | not selected (--only) |
| 7 | Copy-paste (`copy-paste`) | skip | not selected (--only) |
| 8 | Accessibility (`a11y`) | skip | not selected (--only) |
| 9 | Responsive (`responsive`) | skip | not selected (--only) |
| 10 | Visual (`visual`) | skip | not selected (--only) |
| 11 | Templates (`templates`) | skip | not selected (--only) |
| 12 | Clean (`clean`) | PASS | 89 files scanned, 51 packed files: 0 problems, 0 token names flagged |

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

---
Written by `npm run gate`. Thresholds are part of the standard (standard/SPEC.md §12); change them only through the SPEC process.
