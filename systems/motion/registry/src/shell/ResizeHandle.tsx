import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { cn } from '../lib/cn';

export interface ResizeHandleProps {
  /** Accessible name of the width slider, e.g. "Sidebar width". */
  label: string;
  /** Current width in px. */
  value: number;
  min: number;
  max: number;
  /** Arrow-key step in px (Page Up/Down move 5 steps). Default 10. */
  step?: number;
  /** Edge of the panel the handle sits on. Dragging (or arrowing) away from the panel makes it wider. */
  edge: 'left' | 'right';
  /** New width, already clamped to min/max. */
  onResize: (width: number) => void;
  /** A press on the strip without dragging (the sidebar collapses). */
  onActivate?: () => void;
  className?: string;
}

/**
 * Internal resize handle for shell panels (Sidebar, SidePeek): a pointer drag strip on the panel edge
 * plus a visually hidden range input, so the width works with the pointer, the keyboard and assistive
 * tech (a slider announcing the width). The input is the only tab stop; its focus lights the strip's
 * accent line. ←/→ follow the drag direction for the edge, ↑/↓ grow/shrink, Home/End jump to min/max.
 */
export function ResizeHandle({ label, value, min, max, step = 10, edge, onResize, onActivate, className }: ResizeHandleProps) {
  const drag = useRef<{ x: number; w: number; moved: boolean } | null>(null);
  const clamp = (n: number) => Math.max(min, Math.min(max, Math.round(n)));
  const grow = edge === 'right' ? 1 : -1;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, w: value, moved: false };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const dx = (e.clientX - drag.current.x) * grow;
    if (Math.abs(dx) > 2) drag.current.moved = true;
    if (drag.current.moved) onResize(clamp(drag.current.w + dx));
  };
  const onPointerUp = () => {
    if (drag.current && !drag.current.moved) onActivate?.();
    drag.current = null;
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const delta: Record<string, number> = {
      ArrowRight: step * grow, ArrowLeft: -step * grow, ArrowUp: step, ArrowDown: -step, PageUp: step * 5, PageDown: -step * 5,
    };
    let next: number | undefined;
    if (e.key === 'Home') next = min;
    else if (e.key === 'End') next = max;
    else if (e.key in delta) next = value + delta[e.key];
    if (next === undefined) return;
    e.preventDefault();
    onResize(clamp(next));
  };

  return (
    <div className={cn('absolute top-0 z-[1] h-full w-3 max-md:hidden', className)}>
      <input
        type="range"
        aria-label={label}
        aria-valuetext={`${value} pixels`}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onResize(clamp(Number(e.target.value)))}
        onKeyDown={onKeyDown}
        className="peer sr-only"
      />
      <div
        aria-hidden
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { drag.current = null; }}
        className={cn(
          'size-full cursor-col-resize after:absolute after:top-0 after:h-full after:w-[2px] after:opacity-0 after:transition-opacity hover:after:opacity-100',
          'after:bg-n-border-primary-translucent-a peer-focus-visible:after:bg-n-blue-icon-accent-primary peer-focus-visible:after:opacity-100',
          edge === 'right' ? 'after:left-[-1px]' : 'after:left-0',
        )}
      />
    </div>
  );
}
