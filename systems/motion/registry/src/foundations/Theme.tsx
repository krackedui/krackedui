import { createContext, forwardRef, useContext, useMemo, useSyncExternalStore, type HTMLAttributes } from 'react';
import { Slot } from 'radix-ui';
import { cn } from '../lib/cn';

export type Appearance = 'light' | 'dark';

export interface ThemeProps extends HTMLAttributes<HTMLDivElement> {
  /** `light`, `dark`, or `system` (follows the OS setting; renders light on the server, then updates after mount). */
  appearance?: Appearance | 'system';
  /** Put the theme on your own element (e.g. `<body>`) instead of a wrapping `<div>`. */
  asChild?: boolean;
}

export interface ThemeContextValue {
  /** The requested appearance, as passed to `<Theme>`. */
  appearance: Appearance | 'system';
  /** What is actually shown: `system` resolved through `prefers-color-scheme`. */
  resolvedAppearance: Appearance;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const QUERY = '(prefers-color-scheme: dark)';

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}
const getSnapshot = (): Appearance =>
  typeof window !== 'undefined' && window.matchMedia?.(QUERY).matches ? 'dark' : 'light';
const getServerSnapshot = (): Appearance => 'light';

/** The OS color scheme. `light` on the server and during hydration, then the real value. */
function useSystemAppearance(): Appearance {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * The Motion root: applies Motion's fonts, tokens, base styles and light/dark appearance to everything
 * inside it, including menus, popovers and dialogs portalled to `<body>`. Wrap your app (or a section) once.
 */
export const Theme = forwardRef<HTMLDivElement, ThemeProps>(function Theme(
  { appearance = 'light', asChild, className, style, children, ...props },
  ref,
) {
  const system = useSystemAppearance();
  const resolvedAppearance: Appearance = appearance === 'system' ? system : appearance;
  const value = useMemo(() => ({ appearance, resolvedAppearance }), [appearance, resolvedAppearance]);
  const Comp = asChild ? Slot.Root : 'div';
  return (
    <ThemeContext.Provider value={value}>
      <Comp
        ref={ref}
        data-appearance={resolvedAppearance}
        className={cn('motion-root', resolvedAppearance, className)}
        style={{ colorScheme: resolvedAppearance, ...style }}
        {...props}
      >
        {children}
      </Comp>
    </ThemeContext.Provider>
  );
});

/** The appearance of the nearest `<Theme>`: `{ appearance, resolvedAppearance }`. Throws outside a `<Theme>`. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme() must be used inside <Theme>. Wrap your app in <Theme appearance="light"> from @krackedui/motion.');
  return ctx;
}
