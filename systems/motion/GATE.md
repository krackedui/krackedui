# Gate: motion

**PASS** · 2026-10-22T11:53:56.984Z · 1222s · source `1ada92e77b31`

Command: `npm run gate -- motion`

| # | Check | Result | Summary |
|---|---|---|---|
| 1 | Typecheck (`typecheck`) | PASS | 0 errors (docs (apps/docs + systems docs): 0 errors, registry: 0 errors, playground: 0 errors, template fintech: 0 errors, tests: 0 errors, template project-management: 0 errors) |
| 2 | Lint (`lint`) | PASS | 0 errors, 0 warnings in 271 files |
| 3 | Tokens (`tokens`) | PASS | 0 hard-coded colors, 0 missing token values (of 56×2), 0 contrast pairs below 4.5:1 (of 8×2) |
| 4 | Contract (`contract`) | PASS | 62/62 inventory entries conform |
| 5 | Behaviour tests (`tests`) | PASS | 433/433 tests passed in 240 files; 36/36 interactive inventory entries have a contract test; 74/74 interactive extras tested (warning only) |
| 6 | Build (`build`) | PASS | built in 6s; client.js 401 KB min (≤ 600 KB), styles.css 178 KB (≤ 250 KB); 7 export targets resolve |
| 7 | Install (`install`) | PASS | vite app ok, next RSC app ok (10 compounds); 388/388 examples render clean in light + dark (0 problems); 1 whole-document examples built but not rendered (ui/theme#next-js-root-layout) |
| 8 | Copy-paste (`copy-paste`) | PASS | 146/146 registry items install alone with shadcn and typecheck |
| 9 | Docs (`docs`) | PASS | coverage: 184/184 exports have a complete page (0 without page, 0 incomplete); API: 0 wrong, 0 undocumented props, 0 tables not matched; snippets: 0 errors; pages: 0 problems on 128; SYSTEM.md misses 0 entries |
| 10 | Accessibility (`a11y`) | PASS | 388/388 examples clean (axe light+dark, focus-visible, 24px targets on touch); 22 template pages |
| 11 | Responsive (`responsive`) | PASS | 388/388 examples fit at 320/375/768/1024/1440 px (problems by width: 320:0, 375:0, 768:0, 1024:0, 1440:0); 22 template pages |
| 12 | Visual (`visual`) | PASS | 388/388 examples match their baseline (0 changed, 0 without baseline; threshold 0.5% pixels) |
| 13 | Templates (`templates`) | PASS | 2 templates, 2 build from the tarball; 22 pages: 0 a11y problems, 0 responsive problems |
| 14 | Clean (`clean`) | PASS | 284 files scanned, 24 packed files: 0 problems |

---
Written by `npm run gate`. Thresholds are part of the standard (standard/SPEC.md §12); change them only through the SPEC process.
