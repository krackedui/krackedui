import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from 'react';
import { cn } from '../lib/cn';

// Shared chart building blocks: container measuring, reduced motion, the mount animation, keyboard
// exploration, the tooltip, the legend and the visually hidden data table.

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Width of the element, kept in sync with a ResizeObserver. `fallback` is used on the server and first render. */
export function useElementWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setWidth(Math.floor(w));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** True when the user asked for reduced motion (false on the server). */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

type Keyframes = Keyframe[] | ((el: Element, index: number) => Keyframe[]);

/**
 * Plays a short entrance animation once, on mount, on every element in `root` matching `selector`
 * (Web Animations API, so the server-rendered markup is already in its final state). Skipped entirely
 * under reduced motion and where the API is missing.
 */
export function useEntrance(root: RefObject<Element | null>, selector: string, keyframes: Keyframes, options: KeyframeAnimationOptions & { stagger?: number } = {}) {
  const config = useRef({ keyframes, options });
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const { keyframes: frames, options: { stagger = 0, ...opts } } = config.current;
    const animations: Animation[] = [];
    el.querySelectorAll(selector).forEach((node, i) => {
      if (typeof node.animate !== 'function') return;
      animations.push(
        node.animate(typeof frames === 'function' ? frames(node, i) : frames, {
          duration: 420,
          easing: 'cubic-bezier(0.2, 0, 0, 1)',
          fill: 'backwards',
          ...opts,
          delay: (opts.delay ?? 0) + i * stagger,
        }),
      );
    });
    return () => animations.forEach((a) => a.cancel());
  }, [root, selector]);
}

/**
 * Keyboard exploration of a chart's data points: ← → (and ↑ ↓) move, Home / End jump, Escape clears.
 * Returns the active index and a handler for the focusable chart element.
 */
export function useChartKeyboard(count: number) {
  const [active, setActive] = useState<number | null>(null);
  const [fromKeyboard, setFromKeyboard] = useState(false);
  const onKeyDown = (e: KeyboardEvent) => {
    if (!count) return;
    const last = count - 1;
    const current = active ?? -1;
    let next: number | null | undefined;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = current < 0 ? 0 : Math.min(last, current + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = current < 0 ? last : Math.max(0, current - 1);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    else if (e.key === 'Escape' && active !== null) next = null;
    if (next === undefined) return;
    e.preventDefault();
    setActive(next);
    setFromKeyboard(next !== null);
  };
  const point = (index: number | null) => {
    setActive(index);
    setFromKeyboard(false);
  };
  return { active, fromKeyboard, onKeyDown, point, clear: () => point(null) };
}

export interface TooltipRow {
  label: string;
  value: string;
  color: string;
}

/**
 * Floating value box for the point at (x, y) inside the chart. It measures itself and stays inside the chart:
 * right of the point if it fits, else left, else centered above it.
 */
export function ChartTooltip({ x, y, width, title, rows }: { x: number; y: number; width: number; title?: string; rows: TooltipRow[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  // Re-measure after every render (content changes size); only store real changes.
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    setBox((b) => (b && b.w === w && b.h === h ? b : { w, h }));
  });
  const gap = 12;
  let left = x + gap;
  let top = y;
  if (box) {
    top = y - box.h / 2;
    if (left + box.w > width) left = x - gap - box.w;
    if (left < 0) {
      left = Math.min(Math.max(0, x - box.w / 2), Math.max(0, width - box.w));
      top = y - box.h - gap;
    }
  }
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 z-10 w-max min-w-28 max-w-[min(14rem,100%)] rounded-n-md bg-n-bg-elevated px-2.5 py-2 text-n-ui-sm shadow-n-shadow-outline-lg"
      style={{ transform: `translate(${Math.round(left)}px, ${Math.round(top)}px)`, visibility: box ? 'visible' : 'hidden' }}
    >
      {title && <div className="mb-1 truncate font-medium text-n-text-primary">{title}</div>}
      <div className="flex flex-col gap-0.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full" style={{ background: r.color }} />
            <span className="min-w-0 flex-1 truncate text-n-text-secondary">{r.label}</span>
            <span className="font-medium text-n-text-primary tabular-nums">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Color key for multi-series charts. Decorative for screen readers (the data table names the series). */
export function ChartLegend({ items, className }: { items: { label: string; color: string; value?: string }[]; className?: string }) {
  return (
    <ul aria-hidden className={cn('flex flex-wrap items-center gap-x-4 gap-y-1 text-n-ui-sm text-n-text-secondary', className)}>
      {items.map((item) => (
        <li key={item.label} className="flex min-w-0 items-center gap-1.5">
          <span className="size-2 shrink-0 rounded-full" style={{ background: item.color }} />
          <span className={cn("min-w-0 truncate", item.value && "flex-1")}>{item.label}</span>
          {item.value && <span className="font-medium text-n-text-primary tabular-nums">{item.value}</span>}
        </li>
      ))}
    </ul>
  );
}

/** The chart's data as a visually hidden table, so screen reader users get every value. */
export function ChartDataTable({ caption, columns, rows }: { caption: string; columns: string[]; rows: (string | number)[][] }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((c, i) => (
            <th key={`${c}-${i}`} scope="col">{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((cell, j) => (j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Polite live region that reads the point reached with the keyboard. */
export function ChartReadout({ children }: { children: ReactNode }) {
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {children}
    </div>
  );
}

/** Classes for the focusable chart surface (focus ring follows Motion's focus shadow). */
export const chartSurface = 'block max-w-full touch-pan-y select-none overflow-visible rounded-n-sm outline-none focus-visible:shadow-[var(--n-focus-shadow)]';

/** Instructions announced with the chart (by id). */
export const keyboardHint = 'Use the arrow keys to read each value.';
