# Standard changelog

## 2.0.0 (2026-10-23)
Systems keep their specialty; the standard guarantees quality, not a component list.
- **Removed** the shared component contract (`standard/contract`: inventory, prop types, shared
  vocabularies, required `--ds-*` tokens) and its gate check. Motion's former contract tests are now
  Motion's own tests (`systems/motion/registry/test/components`).
- **Removed** the docs check from the gate (documentation is recommended, not enforced).
- **Tokens** check is report only: hard-coded colors are flagged, never failed; no required tokens.
- **Tests**: the system's own tests must pass; untested interactive components are flagged.
- **Clean**: denied names inside token names are flagged, not failed.
- **Build**: exports map requires `.`, `./styles.css`, `./package.json`; extra entries are allowed.
- **Onboarding rule**: a design system's components are added exactly as they are. Their UI is never
  changed while onboarding; differences are flagged in the system's REPORT.md (SPEC §3).
- The gate is now 12 checks.

## 1.0.0 (2026-10-21)
First version of the KrackedUI standard.
- Shared component contract (`standard/contract`): 62 inventory entries across foundations, layout,
  actions, forms, data display, charts, navigation, overlays, feedback and app shell; shared
  vocabularies (Size, Tone, Color, core icon names); required `--ds-*` tokens and contrast pairs.
- The gate (14 checks) with publish and deploy enforcement.
- Sector templates: project management, fintech dashboard.
- Motion is the reference system.
