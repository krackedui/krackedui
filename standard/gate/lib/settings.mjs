// Gate thresholds shared by several checks. Part of the standard: change them through the
// "Changing the standard" process in standard/SPEC.md, never to make one system pass.

/** Every example and template page must fit these viewport widths without page overflow. */
export const responsiveWidths = [320, 375, 768, 1024, 1440];

/** Minimum interactive target on touch devices, in CSS px (WCAG 2.5.8 AA). */
export const minTouchTarget = 24;
