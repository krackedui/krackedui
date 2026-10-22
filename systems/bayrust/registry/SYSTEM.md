# Bayrust

A dark-first, keyboard-driven design system: the density and quietness of a launcher, built around a
command surface rather than a page.

## State

Early. The tokens are measured and complete; the components are not written. See
`../REPORT.md` for exactly what exists and what is left, and `../AGENTS.md` for how to work on it.

`private: true` and no `gate-report.json`, so neither `npm publish` nor the docs deploy will run —
`prepublishOnly` calls the gate's `verify.mjs`, which refuses without a passing report for the
current source hash.

## Foundations

| | |
|---|---|
| Tokens | 467, as `[data-theme="bayrust-dark"]` and `[data-theme="bayrust-light"]` |
| Appearances | Dark is the default; light is a full peer, not a derivation |
| Icons | Six product icons drawn as SVG; the rest are not drawn yet |

Every token value is traceable to the declaration it was measured from, recorded in
`../tooling/tokens.json`. Nothing is inferred.

## Contract

Not implemented. `/standard/contract/src/inventory.ts` is the list to work through.
