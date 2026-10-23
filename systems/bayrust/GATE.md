# Gate: bayrust

**FAIL** (partial run: not valid for publishing) · 2026-10-23T13:49:16.874Z · 43s · source `c1c2922f5db5`

Command: `npm run gate -- bayrust --only a11y`

| # | Check | Result | Summary |
|---|---|---|---|
| 1 | Typecheck (`typecheck`) | skip | not selected (--only) |
| 2 | Lint (`lint`) | skip | not selected (--only) |
| 3 | Tokens (report only) (`tokens`) | skip | not selected (--only) |
| 4 | Behaviour tests (`tests`) | skip | not selected (--only) |
| 5 | Build (`build`) | skip | not selected (--only) |
| 6 | Install (`install`) | skip | not selected (--only) |
| 7 | Copy-paste (`copy-paste`) | skip | not selected (--only) |
| 8 | Accessibility (`a11y`) | FAIL | 43/44 examples clean (axe light+dark, focus-visible, 24px targets on touch); 0 template pages (no templates yet) — by rule: axe/color-contrast 2 |
| 9 | Responsive (`responsive`) | skip | not selected (--only) |
| 10 | Visual (`visual`) | skip | not selected (--only) |
| 11 | Templates (`templates`) | skip | not selected (--only) |
| 12 | Clean (`clean`) | skip | not selected (--only) |

## Accessibility — FAIL

43/44 examples clean (axe light+dark, focus-visible, 24px targets on touch); 0 template pages (no templates yet) — by rule: axe/color-contrast 2

- badge#hero (light): axe/color-contrast: Elements must meet minimum color contrast ratio thresholds (serious, 1 nodes) — .bay-tag__label — Element has insufficient color contrast of 3.13 (foreground color: #138af2, background color: #e7f3fe, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1
- badge#hero (light): axe/color-contrast: Elements must meet minimum color contrast ratio thresholds (serious, 1 nodes) — .bay-tag__label — Element has insufficient color contrast of 3.13 (foreground color: #138af2, background color: #e7f3fe, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---
Written by `npm run gate`. Thresholds are part of the standard (standard/SPEC.md §12); change them only through the SPEC process.
