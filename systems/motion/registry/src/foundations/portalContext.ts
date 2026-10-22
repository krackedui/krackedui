// Internal: the per-Theme portal container, shared by <Theme> (provider) and <ThemePortal> (consumer).
// Not exported from the package.
import { createContext } from 'react';

/**
 * Where the nearest `<Theme>` mounts its portalled layers (menus, popovers, dialogs, tooltips…).
 * `container` is `null` until the Theme has mounted (always on the server and during hydration).
 * Internal: read it through `<ThemePortal>`, never directly.
 */
export interface ThemePortalContextValue {
  container: HTMLElement | null;
  /** Creates the container on first call (in an effect, never during render) and returns it. */
  ensureContainer: () => HTMLElement;
}
export const ThemePortalContext = createContext<ThemePortalContextValue | null>(null);

/** Class of the per-Theme portal container appended to `<body>`. */
export const PORTAL_ROOT_CLASS = 'motion-portal-root';
