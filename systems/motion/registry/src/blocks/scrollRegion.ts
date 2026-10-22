import { useEffect, useState } from 'react';

/** Elements that already give keyboard users a way into (and so a way to scroll) a container. */
const TABBABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled]):not([type="hidden"])', 'select:not([disabled])',
  'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])', '[contenteditable]:not([contenteditable="false"])',
].join(',');

type ScrollRegionProps = { role: 'region'; 'aria-label': string; tabIndex: 0 } | Record<string, never>;

/**
 * Keyboard access for a scroll container (WCAG 2.1.1, axe `scrollable-region-focusable`): while the content
 * overflows and holds nothing focusable, the container becomes a labelled `region` and a Tab stop, so it can be
 * scrolled with the arrow keys. Otherwise it stays a plain, unfocusable box (no extra Tab stop).
 * Returns a callback ref and the props to spread on the container.
 */
export function useScrollRegion<T extends HTMLElement = HTMLDivElement>(label: string, axis: 'x' | 'y' | 'both' = 'both') {
  const [el, setEl] = useState<T | null>(null);
  const [needsFocus, setNeedsFocus] = useState(false);
  useEffect(() => {
    if (!el) return undefined;
    const check = () => {
      const overflows = (axis !== 'y' && el.scrollWidth > el.clientWidth + 1) || (axis !== 'x' && el.scrollHeight > el.clientHeight + 1);
      setNeedsFocus(overflows && !el.querySelector(TABBABLE));
    };
    check();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(check);
    ro.observe(el);
    for (const child of Array.from(el.children)) ro.observe(child);
    return () => ro.disconnect();
  }, [el, axis]);
  const props: ScrollRegionProps = needsFocus ? { role: 'region', 'aria-label': label, tabIndex: 0 } : {};
  return [setEl, props] as const;
}
