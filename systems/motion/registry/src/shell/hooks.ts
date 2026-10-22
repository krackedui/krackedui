import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type TransitionEvent } from 'react';

/** Below this width (px) the app shell switches to its phone layout (sidebar drawer, full-screen peeks). */
export const SHELL_MOBILE_QUERY = '(max-width: 767.98px)';

/** `matchMedia(query).matches`, subscribed to changes. `false` on the server and during hydration. */
export function useShellMediaQuery(query: string): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    if (typeof window === 'undefined' || !window.matchMedia) return () => {};
    const mql = window.matchMedia(query);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return useSyncExternalStore(
    subscribe,
    () => (typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(query).matches),
    () => false,
  );
}

/** True when an element has no running CSS transition (reduced motion, tests, or no styles loaded). */
function hasNoTransition(el: HTMLElement | null) {
  if (!el || typeof getComputedStyle === 'undefined') return true;
  const durations = getComputedStyle(el).transitionDuration.split(',').map((d) => parseFloat(d) || 0);
  return durations.every((d) => d === 0);
}

/** True when an element has no CSS animation (reduced motion, tests, or no styles loaded). */
function hasNoAnimation(el: HTMLElement | null) {
  if (!el || typeof getComputedStyle === 'undefined') return true;
  const cs = getComputedStyle(el);
  return !cs.animationName || cs.animationName === 'none' || (parseFloat(cs.animationDuration) || 0) === 0;
}

/**
 * Expand/collapse with a size transition on a `grid` wrapper (0fr <-> 1fr). Content mounts before it
 * expands and unmounts after the collapse transition ends (immediately when nothing transitions).
 */
export function useCollapse<T extends HTMLElement = HTMLDivElement>(open: boolean) {
  const ref = useRef<T>(null);
  const [mounted, setMounted] = useState(open);
  const [expanded, setExpanded] = useState(open);
  useEffect(() => {
    if (open) {
      setMounted(true);
      // let the collapsed (0fr) frame paint before expanding so the transition runs
      let inner = 0;
      const outer = requestAnimationFrame(() => { inner = requestAnimationFrame(() => setExpanded(true)); });
      return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner); };
    }
    setExpanded(false);
    if (hasNoTransition(ref.current)) setMounted(false);
    return undefined;
  }, [open]);
  const onTransitionEnd = useCallback((e: TransitionEvent<T>) => {
    if (e.target === e.currentTarget && !open) setMounted(false);
  }, [open]);
  return { ref, mounted, expanded, onTransitionEnd };
}

/**
 * Mount/unmount with exit animations for non-Radix overlays. Returns `present` (render it) and the
 * `data-state` to put on the animated element; unmounts after its `closed` animation ends.
 */
export function usePresence<T extends HTMLElement = HTMLDivElement>(open: boolean) {
  const ref = useRef<T>(null);
  const [present, setPresent] = useState(open);
  useEffect(() => {
    if (open) setPresent(true);
    else if (hasNoAnimation(ref.current)) setPresent(false);
  }, [open]);
  const onAnimationEnd = useCallback((e: { target: EventTarget; currentTarget: EventTarget }) => {
    if (e.target === e.currentTarget && !open) setPresent(false);
  }, [open]);
  return { ref, present: open || present, state: open ? ('open' as const) : ('closed' as const), onAnimationEnd };
}

/**
 * Focus return for Radix dialogs opened without a `Dialog.Trigger` (controlled from elsewhere): remembers
 * the element focused when the dialog opens and focuses it again when it closes. Spread on `Dialog.Content`.
 */
export function useDialogReturnFocus() {
  const opener = useRef<HTMLElement | null>(null);
  return {
    onOpenAutoFocus: () => {
      opener.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
    },
    onCloseAutoFocus: (e: Event) => {
      const el = opener.current;
      opener.current = null;
      if (el?.isConnected) { e.preventDefault(); el.focus(); }
    },
  };
}
