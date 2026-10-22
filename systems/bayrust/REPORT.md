# Bayrust: report

Bayrust is a dark-first, keyboard-driven system: a launcher's density and quietness, built around a
command surface rather than a page. This report tracks what is here, what the gate will say, and what
is left. Gate results: `GATE.md` (written by `npm run gate -- bayrust`).

**Status: not gate-ready.** Nothing here claims to pass. `gate-report.json` is deliberately absent, so
`prepublishOnly` and the docs deploy refuse to run, as `/standard/SPEC.md` §12 requires. The sections
below say exactly what is missing, so the next person does not have to rediscover it.

## Sector templates

Chosen by the owner, as `/standard/SPEC.md` §14 step 1 requires: **fintech** and **project-management**.
Neither is built yet — §14 step 5 comes after the contract inventory exists, and building a template
before then would mean hand-building components the system lacks, which rule 4 forbids.

## What is here

| Path | What | Provenance |
|---|---|---|
| `registry/src/styles/tokens.css` | 526 declarations, 467 tokens, in `bayrust-dark` and `bayrust-light` | Measured: resolved from the reference's computed styles, each with its source rule in `tooling/tokens.json` |
| `tooling/tokens.json` | The same tokens as data: value, the declaration it came from, and both appearances | Measured |
| `registry/src/icons/*.svg` | Six product icons, drawn | Ours. Shape is a superellipse; gradients and glyph colours are sampled from the reference, the glyphs are drawn as curves |
| `tooling/build-icons.py` | Regenerates those six | Ours |

Per `/standard/SPEC.md` §5, every value above is traceable; nothing here is inferred.

## What is missing, in the order it has to be done

1. **The contract.** `/standard/contract/src/inventory.ts` lists what every system exports. Bayrust
   exports none of it yet. This is the bulk of the work: each entry needs the component, its variants,
   a behaviour test, a docs page and a registry item.
2. **`--ds-*` mapping.** The tokens are Bayrust's own names. `styles/standard.css` has to map them onto
   the standard vocabulary before check 3 can pass.
3. **Contrast.** Check 3 wants every contrast pair at 4.5:1. The reference is a dark, low-contrast
   surface; its secondary and tertiary greys have not been measured against AA yet, and some will need
   tuning. Motion's rule applies — tune them up, do not lighten them back.
4. **Icons.** Six of roughly 192 product icons are drawn. The rest are still only in the reference, and
   the reference's own interface icon set (a sprite) is not ours to ship.
5. **Templates.** Both, after the contract.
6. **Docs, playground, tests, baselines.** All absent.

## The clean rule, and why this system is unusual

`/standard/SPEC.md` §11 and gate check 14: the published package, docs and templates carry no
third-party names or captured assets, and the gate greps for the names in `.clean-deny`.

Bayrust was derived from a shipped desktop application, and in its own repository it is built **by
running that application's frontend** — its compiled JavaScript, stylesheets, fonts, icon sprite and
around 490 images. That material is the opposite of what §11 allows, so none of it is here, the same
way Motion keeps `capture/` and `mirror/` out of this repository.

The consequence is that **the system cannot simply be ported; the components have to be written.** The
tokens and the measurements come across, because a measurement is not an asset. The components do not.
Anyone picking this up should treat the reference as a specification to build against, not a source to
copy from — and should expect check 14 to fail loudly until the last copied string is gone.

A related detail worth knowing early: the original package resolved components by their exported names,
and some of those names contain the product's name. Those cannot be renamed without breaking the
loader, which is one more reason the components are rewritten here rather than wrapped.

## Decisions

| Date | Decision | Why |
|---|---|---|
| 2026-10-22 | Tokens and drawn icons ported; no component code | §11. The component code that exists elsewhere is the reference's own, not this system's |
| 2026-10-22 | Icons drawn rather than traced | Tracing the artwork produced ~130 run-length rectangles per icon: stair-stepped, no curves, emboss lost. Drawing from sampled colour and measured geometry reads correctly at 44 pt |
| 2026-10-22 | `fintech` + `project-management` | Owner's choice |
