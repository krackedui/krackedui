/*
 * Pure data and helpers with no React: importable from a React Server Component and from Node.
 *
 * The package entry re-exports these names from here rather than from the "use client" bundle, so
 * `import { cn, iconPaths } from '@krackedui/bayrust'` in a server component does not drag the whole
 * client bundle across the boundary (SPEC §2). Everything that renders lives in `client.js`.
 *
 * Nothing in this file may import a module that calls a React hook.
 */
export { cn, variants } from './lib/cn';
export { iconPaths, type IconName } from './foundations/icon-paths';

import { iconPaths } from './foundations/icon-paths';

/** Every icon name the system accepts, in declaration order. */
export const iconNames = Object.keys(iconPaths) as (keyof typeof iconPaths)[];
