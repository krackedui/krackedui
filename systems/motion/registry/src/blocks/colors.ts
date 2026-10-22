import type { BlockColor, ColorName } from './types';

/**
 * Color classes (literal so Tailwind generates them). Measured in block-color-menu: text colors =
 * `<c>-text-secondary` (e.g. Blue text #387dc9), backgrounds = `<c>-bg-secondary` (#e5f2fc).
 *
 * Text colors are adjusted for WCAG AA (inferred, not from the captures): the measured `<c>-text-secondary`
 * values are 2.7–4.6:1 on the page in light mode and 3.9–4.4:1 for gray/brown/blue/purple/pink in dark mode.
 * Light uses the palette's 600 step (5.8–6.5:1 on white); dark uses `<c>-icon-secondary` (7.1–10:1), or
 * `<c>-text-accent-primary` for gray and purple (5.2 / 5.5:1), whose icon-secondary is also below 4.5:1.
 */
export const textColorClass: Record<ColorName, string> = {
  gray: 'text-[var(--n-palette-gray-600)] dark:text-n-gray-text-accent-primary',
  brown: 'text-[var(--n-palette-brown-600)] dark:text-n-brown-icon-secondary',
  orange: 'text-[var(--n-palette-orange-600)] dark:text-n-orange-icon-secondary',
  yellow: 'text-[var(--n-palette-yellow-600)] dark:text-n-yellow-icon-secondary',
  green: 'text-[var(--n-palette-green-600)] dark:text-n-green-icon-secondary',
  blue: 'text-[var(--n-palette-blue-600)] dark:text-n-blue-icon-secondary',
  purple: 'text-[var(--n-palette-purple-600)] dark:text-n-purple-text-accent-primary',
  pink: 'text-[var(--n-palette-pink-600)] dark:text-n-pink-icon-secondary',
  red: 'text-[var(--n-palette-red-600)] dark:text-n-red-icon-secondary',
};
export const bgColorClass: Record<ColorName, string> = {
  gray: 'bg-n-gray-bg-secondary',
  brown: 'bg-n-brown-bg-secondary',
  orange: 'bg-n-orange-bg-secondary',
  yellow: 'bg-n-yellow-bg-secondary',
  green: 'bg-n-green-bg-secondary',
  blue: 'bg-n-blue-bg-secondary',
  purple: 'bg-n-purple-bg-secondary',
  pink: 'bg-n-pink-bg-secondary',
  red: 'bg-n-red-bg-secondary',
};
/** Swatch ring (inset 1px) per color, as in block-color-menu (`--ca-<c>BacTerTra`). */
export const swatchRingClass: Record<ColorName, string> = {
  gray: 'shadow-[inset_0_0_0_1px_var(--n-gray-bg-tertiary-translucent-a)]',
  brown: 'shadow-[inset_0_0_0_1px_var(--n-brown-bg-tertiary-translucent-a)]',
  orange: 'shadow-[inset_0_0_0_1px_var(--n-orange-bg-tertiary-translucent-a)]',
  yellow: 'shadow-[inset_0_0_0_1px_var(--n-yellow-bg-tertiary-translucent-a)]',
  green: 'shadow-[inset_0_0_0_1px_var(--n-green-bg-tertiary-translucent-a)]',
  blue: 'shadow-[inset_0_0_0_1px_var(--n-blue-bg-tertiary-translucent-a)]',
  purple: 'shadow-[inset_0_0_0_1px_var(--n-purple-bg-tertiary-translucent-a)]',
  pink: 'shadow-[inset_0_0_0_1px_var(--n-pink-bg-tertiary-translucent-a)]',
  red: 'shadow-[inset_0_0_0_1px_var(--n-red-bg-tertiary-translucent-a)]',
};
/** Swatch text color (icon-secondary, a hair different from text-secondary). */
export const swatchTextClass: Record<ColorName, string> = {
  gray: 'text-n-gray-icon-secondary',
  brown: 'text-n-brown-icon-secondary',
  orange: 'text-n-orange-icon-secondary',
  yellow: 'text-n-yellow-icon-secondary',
  green: 'text-n-green-icon-secondary',
  blue: 'text-n-blue-icon-secondary',
  purple: 'text-n-purple-icon-secondary',
  pink: 'text-n-pink-icon-secondary',
  red: 'text-n-red-icon-secondary',
};

/** Class for a block/text color value. */
export function colorClass(color?: BlockColor): string {
  if (!color || color === 'default') return '';
  if (color.endsWith('_background')) return bgColorClass[color.replace('_background', '') as ColorName];
  return textColorClass[color as ColorName];
}
