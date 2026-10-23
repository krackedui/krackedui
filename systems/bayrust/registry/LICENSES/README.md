# Third-party licenses

None. Nothing in this package is third-party.

The 80 interface icons and the six product icons are drawn for Bayrust (`src/foundations/icon-paths.ts`
and `src/icons/`). No icon set is bundled or traced. No font files are shipped: `--ds-font-sans` and
`--ds-font-mono` name families and fall back to the platform's own, so an app that wants Inter or
JetBrains Mono loads it itself, under whatever licence it chooses.

There are no runtime dependencies. `react` and `react-dom` are peers, supplied by the app.

This directory exists so the claim is explicit rather than assumed, and so anything added later has
somewhere to put its licence.
