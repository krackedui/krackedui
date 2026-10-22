import { createContext, forwardRef, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type HTMLAttributes } from 'react';
import { Slot } from 'radix-ui';
import { cn } from '../lib/cn';
import { PORTAL_ROOT_CLASS, ThemePortalContext, type ThemePortalContextValue } from './portalContext';

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

/** The custom properties (`--*`) of a style object, as a stable string key and a list. */
function customProperties(style: CSSProperties | undefined): [string, string][] {
  if (!style) return [];
  return Object.entries(style as Record<string, unknown>)
    .filter(([k, v]) => k.startsWith('--') && (typeof v === 'string' || typeof v === 'number'))
    .map(([k, v]) => [k, String(v)]);
}

/**
 * The portal container of one Theme: an empty `<div class="motion-portal-root light|dark">` appended
 * to `<body>` (right after the parent Theme's container when nested, so inner Themes' layers stack
 * above outer ones at equal z-index). Created after mount, so server and hydration output are unchanged.
 */
function usePortalContainer(
  resolvedAppearance: Appearance,
  style: CSSProperties | undefined,
  dir: string | undefined,
): ThemePortalContextValue {
  const parent = useContext(ThemePortalContext);
  const ref = useRef<HTMLElement | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const ensureContainer = useCallback((): HTMLElement => {
    if (ref.current) return ref.current;
    const el = document.createElement('div');
    el.className = PORTAL_ROOT_CLASS;
    const anchor = parent?.ensureContainer();
    if (anchor?.isConnected) anchor.after(el);
    else document.body.appendChild(el);
    ref.current = el;
    return el;
  }, [parent]);

  useLayoutEffect(() => {
    const el = ensureContainer();
    setContainer(el);
    return () => {
      el.remove();
      if (ref.current === el) ref.current = null;
      setContainer(null);
    };
  }, [ensureContainer]);

  // Keep the container's appearance (and the Theme's own custom properties and direction) in sync,
  // so tokens resolve inside portalled layers exactly as they do inside the Theme.
  const vars = customProperties(style);
  const varsKey = JSON.stringify(vars);
  useLayoutEffect(() => {
    if (!container) return;
    container.className = cn(PORTAL_ROOT_CLASS, resolvedAppearance);
    container.dataset.appearance = resolvedAppearance;
    container.style.colorScheme = resolvedAppearance;
    if (dir) container.dir = dir;
    else container.removeAttribute('dir');
    const applied = JSON.parse(varsKey) as [string, string][];
    for (const [k, v] of applied) container.style.setProperty(k, v);
    return () => {
      for (const [k] of applied) container.style.removeProperty(k);
    };
  }, [container, resolvedAppearance, dir, varsKey]);

  return useMemo(() => ({ container, ensureContainer }), [container, ensureContainer]);
}

/**
 * The Motion root: applies Motion's fonts, tokens, base styles and light/dark appearance to everything
 * inside it. Portalled layers (menus, popovers, selects, tooltips, dialogs, sheets…) render into a
 * container that carries this Theme's appearance, so each overlay follows the Theme it was opened from,
 * even with light and dark Themes on one page. Wrap your app (or a section) once.
 */
export const Theme = forwardRef<HTMLDivElement, ThemeProps>(function Theme(
  { appearance = 'light', asChild, className, style, children, ...props },
  ref,
) {
  const system = useSystemAppearance();
  const resolvedAppearance: Appearance = appearance === 'system' ? system : appearance;
  const value = useMemo(() => ({ appearance, resolvedAppearance }), [appearance, resolvedAppearance]);
  const portal = usePortalContainer(resolvedAppearance, style, props.dir);
  const Comp = asChild ? Slot.Root : 'div';
  return (
    <ThemeContext.Provider value={value}>
      <ThemePortalContext.Provider value={portal}>
        <Comp
          ref={ref}
          data-appearance={resolvedAppearance}
          className={cn('motion-root', resolvedAppearance, className)}
          style={{ colorScheme: resolvedAppearance, ...style }}
          {...props}
        >
          {children}
        </Comp>
      </ThemePortalContext.Provider>
    </ThemeContext.Provider>
  );
});

/** The appearance of the nearest `<Theme>`: `{ appearance, resolvedAppearance }`. Throws outside a `<Theme>`. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme() must be used inside <Theme>. Wrap your app in <Theme appearance="light"> from @krackedui/motion.');
  return ctx;
}
