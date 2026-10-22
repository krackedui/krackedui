/**
 * tailwind-merge taught Motion's own utilities, so `text-n-ui` (a type size) does not cancel
 * `text-n-text-primary` (a color), and `rounded-n-md` / `shadow-n-*` merge with their stock
 * counterparts. Used by both `cn` and `tv` so recipes and class merging resolve conflicts alike.
 */
const typeSizes = ['page-title', 'h1', 'h2', 'h3', 'body', 'ui-lg', 'ui', 'ui-medium', 'ui-sm', 'caption', 'code', 'code-inline'];
const radii = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'];

export const twMergeConfig = {
  extend: {
    classGroups: {
      'font-size': [{ text: typeSizes.map((s) => `n-${s}`) }],
      rounded: [{ rounded: radii.map((r) => `n-${r}`) }],
      shadow: [{ shadow: [(value: string) => value.startsWith('n-')] }],
    },
  },
};
