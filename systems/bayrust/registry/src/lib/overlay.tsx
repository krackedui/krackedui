'use client';

import { createPortal } from 'react-dom';
import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { ThemeContext } from '../foundations/theme';

/** Mounts children into the nearest `<Theme>`, so an overlay keeps that theme's appearance. */
export function Portal({ children }: { children: ReactNode }) {
  // A Theme is where an overlay wants to land, so it follows that theme's appearance — but a
  // component must not bring an app down for want of one. Outside a Theme it falls back to the
  // document body: the overlay still works, it simply inherits whatever is on the page. Throwing
  // here crashed a Next.js prerender of a page that had not wrapped itself yet.
  const theme = useContext(ThemeContext);
  // Nothing is portalled until after mount. The server renders no overlay, so the first client
  // render must not either — portalling into document.body during hydration is a mismatch, and
  // React fails the whole tree over it (#418). The Theme's own container only exists after its
  // effect anyway, so this is the same timing either way.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const container = theme?.portalContainer ?? (typeof document === 'undefined' ? null : document.body);
  if (!container) return null;
  return createPortal(children, container);
}

/** Escape, and a pointer press outside the panel, both close it. */
export function useDismiss(
  open: boolean,
  onClose: () => void,
  refs: Array<RefObject<HTMLElement | null>>,
) {
  // Callers build `refs` inline, so it is a new array every render and cannot go in the dependency
  // list without tearing the listeners down and putting them back each time. The handler reads the
  // current one through a ref, which keeps the dependencies honest.
  const latest = useRef(refs);
  useEffect(() => {
    latest.current = refs;
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (latest.current.some((r) => r.current?.contains(target))) return;
      onClose();
    };
    document.addEventListener('keydown', onKey, true);
    // pointerdown, not click: the panel should go before anything underneath reacts
    document.addEventListener('pointerdown', onPointer, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('pointerdown', onPointer, true);
    };
  }, [open, onClose]);
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Keeps Tab inside the panel while it is open, and returns focus where it was when it closes.
 * Modal overlays need this; a non-modal popover does not.
 */
export function useFocusTrap(open: boolean, panel: RefObject<HTMLElement | null>) {
  const returnTo = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement as HTMLElement | null;
    const node = panel.current;
    if (!node) return;
    const first = node.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? node).focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return e.preventDefault();
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    };
    node.addEventListener('keydown', onKey);
    return () => {
      node.removeEventListener('keydown', onKey);
      returnTo.current?.focus?.();
    };
  }, [open, panel]);
}

/** Stops the page behind a modal from scrolling, and puts the scrollbar's width back as padding. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [active]);
}

export type Side = 'top' | 'right' | 'bottom' | 'left';
export type Align = 'start' | 'center' | 'end';

/**
 * Positions a floating panel against its trigger, flipping to the opposite side when it would leave
 * the viewport and sliding along the edge when it would overflow sideways.
 *
 * Deliberately small: this is anchoring, not a layout engine. A panel that needs collision handling
 * beyond flip-and-clamp wants a real positioning library, and `REPORT.md` says so.
 */
export function useAnchored(
  open: boolean,
  anchor: RefObject<HTMLElement | null>,
  panel: RefObject<HTMLElement | null>,
  side: Side = 'bottom',
  align: Align = 'start',
  gap = 6,
) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const place = useCallback(() => {
    const a = anchor.current?.getBoundingClientRect();
    const p = panel.current?.getBoundingClientRect();
    if (!a || !p) return;
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;

    let useSide = side;
    if (side === 'bottom' && a.bottom + gap + p.height > vh && a.top - gap - p.height > 0) useSide = 'top';
    if (side === 'top' && a.top - gap - p.height < 0 && a.bottom + gap + p.height < vh) useSide = 'bottom';
    if (side === 'right' && a.right + gap + p.width > vw && a.left - gap - p.width > 0) useSide = 'left';
    if (side === 'left' && a.left - gap - p.width < 0 && a.right + gap + p.width < vw) useSide = 'right';

    const vertical = useSide === 'top' || useSide === 'bottom';
    let top = useSide === 'bottom' ? a.bottom + gap : useSide === 'top' ? a.top - p.height - gap : a.top;
    let left = useSide === 'right' ? a.right + gap : useSide === 'left' ? a.left - p.width - gap : a.left;

    if (vertical) {
      if (align === 'center') left = a.left + a.width / 2 - p.width / 2;
      if (align === 'end') left = a.right - p.width;
    } else {
      if (align === 'center') top = a.top + a.height / 2 - p.height / 2;
      if (align === 'end') top = a.bottom - p.height;
    }

    // keep it on screen
    left = Math.min(Math.max(8, left), Math.max(8, vw - p.width - 8));
    top = Math.min(Math.max(8, top), Math.max(8, vh - p.height - 8));
    setPos({ top, left });
  }, [anchor, panel, side, align, gap]);

  useLayoutEffect(() => {
    if (!open) return setPos(null);
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, place]);

  return pos;
}
