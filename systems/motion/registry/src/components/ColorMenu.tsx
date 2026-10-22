import { forwardRef, useEffect, useId, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { tv } from '../lib/tv';
import type { MotionColor } from '../atoms/Tag';
import { MenuLabel, MenuList, MenuRow } from './Menu';

/** The 10 colors offered for text/background (atoms' MotionColor minus teal, which is select-option only). */
export type ColorMenuColor = Exclude<MotionColor, 'teal'>;
export type ColorKind = 'text' | 'background';
export interface ColorValue { kind: ColorKind; color: ColorMenuColor }

export const colorMenuColors: ColorMenuColor[] = ['default', 'gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red'];
const cap = (c: string) => c[0].toUpperCase() + c.slice(1);
/** "Gray text", "Yellow background", "Default text"… (block-color-menu labels). */
export const colorLabel = (v: ColorValue) => `${cap(v.color)} ${v.kind}`;

// Measured per color in color-menu.{light,dark}.json: text = <c>-text-secondary, background = <c>-bg-secondary,
// 1px inset ring = <c>-border-primary-translucent-a. Literal classes so Tailwind can see them.
const TEXT: Record<ColorMenuColor, string> = {
  default: 'text-n-text-primary', gray: 'text-n-gray-text-secondary', brown: 'text-n-brown-text-secondary',
  orange: 'text-n-orange-text-secondary', yellow: 'text-n-yellow-text-secondary', green: 'text-n-green-text-secondary',
  blue: 'text-n-blue-text-secondary', purple: 'text-n-purple-text-secondary', pink: 'text-n-pink-text-secondary', red: 'text-n-red-text-secondary',
};
const BG: Record<ColorMenuColor, string> = {
  default: '', gray: 'bg-n-gray-bg-secondary', brown: 'bg-n-brown-bg-secondary', orange: 'bg-n-orange-bg-secondary',
  yellow: 'bg-n-yellow-bg-secondary', green: 'bg-n-green-bg-secondary', blue: 'bg-n-blue-bg-secondary',
  purple: 'bg-n-purple-bg-secondary', pink: 'bg-n-pink-bg-secondary', red: 'bg-n-red-bg-secondary',
};
const RING: Record<ColorMenuColor, string> = {
  default: 'shadow-[inset_0_0_0_1px_var(--n-border-primary-translucent-a)]',
  gray: 'shadow-[inset_0_0_0_1px_var(--n-gray-border-primary-translucent-a)]',
  brown: 'shadow-[inset_0_0_0_1px_var(--n-brown-border-primary-translucent-a)]',
  orange: 'shadow-[inset_0_0_0_1px_var(--n-orange-border-primary-translucent-a)]',
  yellow: 'shadow-[inset_0_0_0_1px_var(--n-yellow-border-primary-translucent-a)]',
  green: 'shadow-[inset_0_0_0_1px_var(--n-green-border-primary-translucent-a)]',
  blue: 'shadow-[inset_0_0_0_1px_var(--n-blue-border-primary-translucent-a)]',
  purple: 'shadow-[inset_0_0_0_1px_var(--n-purple-border-primary-translucent-a)]',
  pink: 'shadow-[inset_0_0_0_1px_var(--n-pink-border-primary-translucent-a)]',
  red: 'shadow-[inset_0_0_0_1px_var(--n-red-border-primary-translucent-a)]',
};
/** Text class for a text color (for consumers rendering colored text). */
export const colorTextClass = (c: ColorMenuColor) => TEXT[c];
/** Background class for a background color. */
export const colorBgClass = (c: ColorMenuColor) => BG[c];

/**
 * Color swatch: 26x26, radius 6, "A" 16/500 for text colors, filled square for backgrounds.
 * Selected: 2px inset ring text-primary (dark: border-strong), measured in color-menu.
 */
export const colorSwatchVariants = tv({
  base: 'flex size-[26px] shrink-0 items-center justify-center rounded-n-md text-[16px] font-medium leading-none',
  variants: {
    selected: { true: '!shadow-[inset_0_0_0_2px_var(--n-text-primary)] dark:!shadow-[inset_0_0_0_2px_var(--n-border-strong)]' },
  },
});

export interface ColorSwatchProps extends HTMLAttributes<HTMLSpanElement> { value: ColorValue; selected?: boolean }
export const ColorSwatch = forwardRef<HTMLSpanElement, ColorSwatchProps>(function ColorSwatch({ value, selected, className, ...props }, ref) {
  const text = value.kind === 'text';
  return (
    <span ref={ref} aria-hidden className={cn(colorSwatchVariants({ selected }), RING[value.color], text ? TEXT[value.color] : BG[value.color], className)} {...props}>
      {text ? 'A' : null}
    </span>
  );
});

const eq = (a: ColorValue, b: ColorValue) => a.kind === b.kind && a.color === b.color;
const same = (a?: ColorValue, b?: ColorValue | ColorValue[]) => !!a && !!b && (Array.isArray(b) ? b.some((x) => eq(a, x)) : eq(a, b));

export interface ColorGridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Current text and/or background color (both are marked). */
  value?: ColorValue | ColorValue[];
  /** Shown above (e.g. "Recently used"). */
  recent?: ColorValue[];
  onSelect?: (v: ColorValue) => void;
}

/**
 * Text-toolbar color popover: sections "Recently used", "Text color", "Background color";
 * 5-column grid, gap 4, padding 0 8; each cell 30x30 (padding 2, radius 6, hover wash).
 * Each section is a labelled group of toggle buttons (`aria-pressed` marks the current colors).
 * Put it inside a <MenuSurface> / <Popover.Content>.
 */
export const ColorGrid = forwardRef<HTMLDivElement, ColorGridProps>(function ColorGrid({ value, recent, onSelect, className, ...props }, ref) {
  const uid = useId();
  const cell = (v: ColorValue) => (
    <button
      key={v.kind + v.color}
      type="button"
      aria-pressed={same(v, value)}
      aria-label={colorLabel(v)}
      title={colorLabel(v)}
      onClick={() => onSelect?.(v)}
      className="cursor-pointer rounded-n-md p-0.5 outline-none hover:bg-n-button-hover-bg-a focus-visible:shadow-n-focus-shadow"
    >
      <ColorSwatch value={v} selected={same(v, value)} />
    </button>
  );
  const section = (key: string, label: string, items: ColorValue[]) => (
    <div role="group" aria-labelledby={`${uid}-${key}`} className="p-1">
      <MenuLabel id={`${uid}-${key}`}>{label}</MenuLabel>
      <div className="grid grid-cols-[repeat(5,30px)] gap-1 px-2">{items.map(cell)}</div>
    </div>
  );
  return (
    <div ref={ref} className={cn('flex flex-col pb-1', className)} {...props}>
      {recent && recent.length > 0 && section('recent', 'Recently used', recent)}
      {section('text', 'Text color', colorMenuColors.map((color) => ({ kind: 'text' as const, color })))}
      {section('background', 'Background color', colorMenuColors.map((color) => ({ kind: 'background' as const, color })))}
    </div>
  );
});

export interface ColorMenuListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  value?: ColorValue | ColorValue[];
  /** "Last used" section rows (with optional shortcut, e.g. ⌘⇧H). */
  lastUsed?: { value: ColorValue; shortcut?: ReactNode }[];
  onSelect?: (v: ColorValue) => void;
  /** Row to show highlighted initially (keyboard position; also used for static renders). */
  highlighted?: ColorValue;
  /** Focus the list on mount so arrow keys work right away. */
  autoFocus?: boolean;
}

const key = (v: ColorValue) => `${v.kind}-${v.color}`;

/**
 * Block "Color" list: 28px rows with a 26px swatch, "Default text", "Gray text"… then "Default background"…;
 * sections separated by the inset divider. A single listbox: ↑/↓ (Home/End) move, Enter or Space picks.
 */
export const ColorMenuList = forwardRef<HTMLDivElement, ColorMenuListProps>(function ColorMenuList(
  { value, lastUsed, onSelect, highlighted, autoFocus, className, onKeyDown, ...props }, ref,
) {
  const uid = useId();
  const all: ColorValue[] = [
    ...(lastUsed ?? []).map((l) => l.value),
    ...colorMenuColors.map((color) => ({ kind: 'text' as const, color })),
    ...colorMenuColors.map((color) => ({ kind: 'background' as const, color })),
  ];
  // Rows are identified by section + value (a last-used color also appears in its own section).
  const ids = all.map((v, i) => `${uid}-${i < (lastUsed?.length ?? 0) ? 'last' : 'all'}-${key(v)}`);
  const initial = Math.max(0, highlighted ? all.findIndex((v, i) => eq(v, highlighted) && i >= (lastUsed?.length ?? 0)) : 0);
  const [active, setActive] = useState(initial);
  const listRef = useRef<HTMLDivElement | null>(null);
  const setRefs = (node: HTMLDivElement | null) => {
    listRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };
  useEffect(() => { if (autoFocus) listRef.current?.focus(); }, [autoFocus]);
  const scrollTo = useRef<string | null>(null);
  useEffect(() => {
    if (!scrollTo.current) return;
    listRef.current?.querySelector(`[id="${scrollTo.current}"]`)?.scrollIntoView({ block: 'nearest' });
    scrollTo.current = null;
  });

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const to = { ArrowDown: active + 1, ArrowUp: active - 1, Home: 0, End: all.length - 1 }[e.key];
    if (to !== undefined) {
      e.preventDefault();
      e.stopPropagation();
      const next = Math.max(0, Math.min(all.length - 1, to));
      scrollTo.current = ids[next];
      setActive(next);
    }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onSelect?.(all[active]); }
  };

  let index = 0;
  const row = (v: ColorValue, shortcut?: ReactNode) => {
    const i = index++;
    return (
      <MenuRow
        key={ids[i]}
        id={ids[i]}
        icon={<ColorSwatch value={v} />}
        shortcut={shortcut}
        checked={same(v, value)}
        aria-selected={same(v, value)}
        highlighted={i === active}
        className="[&>span:first-child]:size-[26px]"
        onPointerMove={() => setActive(i)}
        onClick={() => onSelect?.(v)}
      >
        {colorLabel(v)}
      </MenuRow>
    );
  };
  const groupLabel = (k: string, text: string) => <MenuLabel id={`${uid}-${k}`}>{text}</MenuLabel>;
  return (
    <div
      ref={setRefs}
      role="listbox"
      aria-label="Color"
      tabIndex={0}
      aria-activedescendant={ids[active]}
      onKeyDown={handleKey}
      className={cn('flex flex-col outline-none focus-visible:shadow-n-focus-shadow', className)}
      {...props}
    >
      {lastUsed && lastUsed.length > 0 && (
        <MenuList role="group" aria-labelledby={`${uid}-last`}>{groupLabel('last', 'Last used')}{lastUsed.map((l) => row(l.value, l.shortcut))}</MenuList>
      )}
      <MenuList role="group" aria-labelledby={`${uid}-text`} separator={!!lastUsed?.length}>{groupLabel('text', 'Text color')}{colorMenuColors.map((color) => row({ kind: 'text', color }))}</MenuList>
      <MenuList role="group" aria-labelledby={`${uid}-bg`} separator>{groupLabel('bg', 'Background color')}{colorMenuColors.map((color) => row({ kind: 'background', color }))}</MenuList>
    </div>
  );
});
