// Required CSS custom properties. Every system defines all of them, in light and dark, so code and
// prompts written against --ds-* work in any system. Systems keep their own token names too.

export const requiredTokens = {
  bg: ['app', 'sidebar', 'surface', 'surface-raised', 'surface-hover', 'surface-selected', 'overlay', 'inverse'],
  text: ['primary', 'secondary', 'tertiary', 'disabled', 'inverse', 'link', 'on-accent'],
  border: ['subtle', 'default', 'strong', 'focus'],
  accent: ['default', 'hover', 'subtle', 'text'],
  status: ['success', 'success-subtle', 'warning', 'warning-subtle', 'danger', 'danger-subtle', 'info', 'info-subtle'],
  font: ['sans', 'mono', 'display'],
  radius: ['xs', 'sm', 'md', 'lg', 'xl', 'full'],
  shadow: ['sm', 'md', 'lg', 'popover', 'modal'],
  motion: ['duration-fast', 'duration-base', 'duration-slow', 'easing-standard', 'easing-emphasized'],
  size: ['control-sm', 'control-md', 'control-lg', 'sidebar-width', 'icon-sm', 'icon-md'],
} as const;

/** Flat list: `--ds-bg-app`, `--ds-text-primary`, … */
export const requiredTokenNames: string[] = Object.entries(requiredTokens).flatMap(([group, names]) =>
  names.map((n) => `--ds-${group}-${n}`),
);

/** Text/background pairs that must meet WCAG AA (4.5:1) in both themes. */
export const contrastPairs: [text: string, bg: string][] = [
  ['--ds-text-primary', '--ds-bg-app'],
  ['--ds-text-secondary', '--ds-bg-app'],
  ['--ds-text-tertiary', '--ds-bg-app'],
  ['--ds-text-primary', '--ds-bg-sidebar'],
  ['--ds-text-secondary', '--ds-bg-sidebar'],
  ['--ds-text-primary', '--ds-bg-surface-raised'],
  ['--ds-text-on-accent', '--ds-accent-default'],
  ['--ds-accent-text', '--ds-bg-app'],
];
