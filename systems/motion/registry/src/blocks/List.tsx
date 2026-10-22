import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import type { BlockColor } from './types';
import {
  BlockCheckbox, blockColorClass, EmptyToggleHint, leafBase, listPadding, renderLeaf, ToggleButton,
  type ListSpacing, type TextContentProps,
} from './parts';

/*
 * List-like blocks, measured in page-content / page-scroll-2:
 * - block: padding-inline 6, vertical rhythm via `listPadding` (6 at run edges, 1 between, nested 2/0)
 * - row: padding-inline-start 2; marker box 24 wide × 28 tall (padding 2), centered
 * - leaf: padding 2 0, padding-inline-start 6
 * - bullets per depth: • ◦ ▪ (Arial, 1.5em, line-height 1); numbers: 1. a. i. (24 wide, centered)
 */

const BULLETS = ['•', '◦', '▪'];
/** Bullet glyph for a nesting depth (0-based). */
export const bulletFor = (depth: number) => BULLETS[depth % 3];

function toAlpha(n: number): string {
  let s = '';
  while (n > 0) { n -= 1; s = String.fromCharCode(97 + (n % 26)) + s; n = Math.floor(n / 26); }
  return s;
}
function toRoman(n: number): string {
  const map: [number, string][] = [[1000, 'm'], [900, 'cm'], [500, 'd'], [400, 'cd'], [100, 'c'], [90, 'xc'], [50, 'l'], [40, 'xl'], [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']];
  let s = '';
  for (const [v, r] of map) while (n >= v) { s += r; n -= v; }
  return s;
}
/** Numbered list marker for an index (1-based) and depth: 1. → a. → i. */
export function numberFor(index: number, depth: number): string {
  const k = depth % 3;
  return `${k === 0 ? index : k === 1 ? toAlpha(index) : toRoman(index)}.`;
}

interface ShellProps extends TextContentProps, Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  marker: ReactNode;
  markerStyle?: CSSProperties;
  placeholder: string;
  spacing?: ListSpacing;
  color?: BlockColor;
  leafClassName?: string;
  leafStyle?: CSSProperties;
  children?: ReactNode;
  after?: ReactNode;
}

const ListShell = forwardRef<HTMLDivElement, ShellProps>(function ListShell(
  { marker, markerStyle, placeholder, spacing, color, text, renderLeaf: rl, leafClassName, leafStyle, children, after, className, style, ...props }, ref,
) {
  return (
    <div ref={ref} className={cn('w-full', className)} style={style} {...props}>
      <div className="w-full px-1.5" style={listPadding(spacing)}>
        <div className={cn('flex rounded-n-md', blockColorClass(color))}>
          <div className="flex w-full items-start ps-0.5">
            <div
              className="flex h-7 min-h-[1.5em] w-6 shrink-0 grow-0 items-center justify-center py-0.5"
              style={markerStyle}
              contentEditable={false}
              data-list-marker=""
            >
              {marker}
            </div>
            <div className="flex min-w-px flex-1 flex-col">
              {renderLeaf({ text, renderLeaf: rl }, { className: cn(leafBase, 'py-0.5 ps-1.5', leafClassName), placeholder, style: leafStyle })}
              {children}
              {after}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export interface ListItemProps extends TextContentProps, Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Nesting depth (0 = top level); picks the marker style. */
  depth?: number;
  spacing?: ListSpacing;
  color?: BlockColor;
  /** Nested blocks (rendered under the text, aligned with it). */
  children?: ReactNode;
}

/** Bulleted list item: • / ◦ / ▪ by depth (Arial 1.5em, line-height 1). */
export const BulletedListItem = forwardRef<HTMLDivElement, ListItemProps>(function BulletedListItem({ depth = 0, ...props }, ref) {
  return (
    <ListShell
      ref={ref}
      placeholder="List"
      marker={<span className="font-[Arial] text-[1.5em] leading-none">{bulletFor(depth)}</span>}
      {...props}
    />
  );
});

export interface NumberedListItemProps extends ListItemProps {
  /** 1-based position within its run of numbered siblings. */
  index?: number;
}
/** Numbered list item: 1. / a. / i. by depth, 24px wide centered marker. */
export const NumberedListItem = forwardRef<HTMLDivElement, NumberedListItemProps>(function NumberedListItem({ depth = 0, index = 1, ...props }, ref) {
  return (
    <ListShell
      ref={ref}
      placeholder="List"
      marker={<span className="w-6 whitespace-nowrap text-center">{numberFor(index, depth)}</span>}
      {...props}
    />
  );
});

export interface ToDoProps extends ListItemProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}
/**
 * To-do. Checkbox 16 in a 24×28 box; checked text: line-through (decoration text-primary/50%),
 * opacity .7.
 */
export const ToDo = forwardRef<HTMLDivElement, ToDoProps>(function ToDo({ checked, onCheckedChange, depth: _d, ...props }, ref) {
  return (
    <ListShell
      ref={ref}
      placeholder="To-do"
      marker={<BlockCheckbox checked={!!checked} aria-label="To-do" onCheckedChange={onCheckedChange} readOnly={!onCheckedChange} />}
      leafStyle={checked ? { textDecorationLine: 'line-through', textDecorationColor: 'color-mix(in srgb, var(--n-text-primary) 50%, transparent)', opacity: 0.7 } : undefined}
      {...props}
    />
  );
});

export interface ToggleProps extends ListItemProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Called by the "Empty toggle" hint (open toggle without children). */
  onEmptyClick?: () => void;
}
/** Toggle list: 24×24 triangle button (radius 4, hover bg), children shown when open. */
export const Toggle = forwardRef<HTMLDivElement, ToggleProps>(function Toggle({ open, onOpenChange, onEmptyClick, children, depth: _d, ...props }, ref) {
  return (
    <ListShell
      ref={ref}
      placeholder="Toggle"
      marker={<ToggleButton open={!!open} onOpenChange={onOpenChange} contentEditable={false} />}
      after={open ? children ?? <div className="-ms-1.5"><EmptyToggleHint onClick={onEmptyClick} /></div> : null}
      {...props}
    />
  );
});
