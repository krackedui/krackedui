import { forwardRef, useCallback, useLayoutEffect, useRef, useState, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react';
import { RadioGroup } from 'radix-ui';
import { cn } from '../lib/cn';
import { tv, type VariantProps } from '../lib/tv';
import { Icon, type IconName } from '../icons/Icon';
import { useFieldControl } from '../forms/Field';
import { joinIds, useControllableState } from '../forms/internal';

/**
 * Segmented control (view settings "Left/Center", chart/layout pickers, page width options):
 * track bg-tertiary-translucent, radius 8, padding 2, gap 2; segments 24px (md 28px), radius 6, 14px,
 * text-secondary; selected segment bg-elevated with shadow-base-sm ring and text-primary.
 * The selected surface is one indicator that slides between segments (inferred; reduced motion: no slide).
 */
export const segmentedControlVariants = tv({
  slots: {
    root: 'relative inline-flex max-w-full items-center gap-0.5 rounded-n-lg bg-n-bg-tertiary-translucent-a p-0.5',
    indicator: [
      // .motion-indicator (styles/motion.css): transform/width transition, off under reduced motion.
      'motion-indicator pointer-events-none absolute left-0 top-0.5 rounded-n-md bg-n-bg-elevated shadow-n-shadow-outline-sm',
    ],
    item: [
      'relative z-[1] inline-flex min-w-0 flex-[0_1_auto] cursor-pointer select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-n-md px-2 text-[14px] leading-[16.8px]',
      'text-n-text-secondary outline-none hover:text-n-text-primary focus-visible:shadow-n-focus-shadow',
      'data-[state=checked]:text-n-text-primary',
      // Until the indicator is measured (SSR, first paint) the checked segment paints its own surface.
      'group-data-[measured=false]/seg:data-[state=checked]:bg-n-bg-elevated group-data-[measured=false]/seg:data-[state=checked]:shadow-n-shadow-outline-sm',
      'disabled:cursor-default disabled:opacity-40',
    ],
    label: 'truncate',
  },
  variants: {
    size: {
      sm: { item: 'h-6 pointer-coarse:h-7', indicator: 'h-6 pointer-coarse:h-7' },
      md: { item: 'h-7', indicator: 'h-7' },
      lg: { item: 'h-8 px-3', indicator: 'h-8' },
    },
    // Natural widths so every label fits; `full` stretches the segments to equal widths.
    full: { true: { root: 'flex w-full', item: 'flex-1' } },
  },
  defaultVariants: { size: 'sm' },
});

/** One segment. Give icon-only segments an `aria-label`. */
export interface SegmentedOption {
  value: string;
  label?: ReactNode;
  icon?: IconName;
  /** Tooltip-style hint (title attribute). */
  description?: ReactNode;
  disabled?: boolean;
  'aria-label'?: string;
}

export interface SegmentedControlProps
  extends Omit<ComponentPropsWithoutRef<typeof RadioGroup.Root>, 'value' | 'defaultValue' | 'onValueChange' | 'orientation' | 'dir'>,
    VariantProps<typeof segmentedControlVariants> {
  options: SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

/**
 * SegmentedControl: a small set (2–5) of exclusive options shown inline, e.g. a view or alignment switch.
 * Behaves as a radio group: Tab focuses the selected segment, arrow keys move and select. For more
 * options or long labels use Select; for switching panels use Tabs.
 */
export const SegmentedControl = forwardRef<ElementRef<typeof RadioGroup.Root>, SegmentedControlProps>(function SegmentedControl(
  { options, value: valueProp, defaultValue, onValueChange, size, full, className, disabled, 'aria-describedby': describedBy, onKeyDown, onPointerDown, ...props }, ref,
) {
  const field = useFieldControl();
  const s = segmentedControlVariants({ size, full });
  const [value, setValueRaw] = useControllableState(valueProp, defaultValue ?? options.find((o) => !o.disabled)?.value ?? '', onValueChange);
  const setValue = (v: string) => { if (v !== value) setValueRaw(v); };
  // APG radio group: arrow keys move focus *and* select. Radix selects on focus only while the arrow key is
  // still down, which misses when keyup lands first; track arrow navigation until the next Tab or pointer press.
  const arrowNav = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState<{ x: number; w: number } | null>(null);

  const measure = useCallback(() => {
    const root = rootRef.current;
    const el = root?.querySelector<HTMLElement>('[data-state="checked"]');
    setBox(el ? { x: el.offsetLeft, w: el.offsetWidth } : null);
  }, []);
  useLayoutEffect(() => { measure(); }, [measure, value, options, size, full]);
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <RadioGroup.Root
      ref={(el) => { rootRef.current = el; if (typeof ref === 'function') ref(el); else if (ref) ref.current = el; }}
      value={value}
      onValueChange={setValue}
      orientation="horizontal"
      disabled={disabled ?? field?.disabled}
      aria-labelledby={props['aria-label'] || props['aria-labelledby'] ? props['aria-labelledby'] : field?.labelId}
      aria-describedby={joinIds(field?.descriptionId, field?.invalid ? field.errorId : undefined, describedBy)}
      data-measured={box ? 'true' : 'false'}
      onKeyDown={(e) => { arrowNav.current = e.key.startsWith('Arrow'); onKeyDown?.(e); }}
      onPointerDown={(e) => { arrowNav.current = false; onPointerDown?.(e); }}
      className={cn('group/seg', s.root(), className)}
      {...props}
      id={props.id ?? field?.controlId}
    >
      {box && <span aria-hidden="true" className={s.indicator()} style={{ width: box.w, transform: `translateX(${box.x}px)` }} />}
      {options.map((o) => (
        <RadioGroup.Item
          key={o.value}
          value={o.value}
          disabled={o.disabled}
          aria-label={o['aria-label']}
          title={typeof o.description === 'string' ? o.description : o['aria-label']}
          className={s.item()}
          onFocus={() => { if (arrowNav.current && !o.disabled) setValue(o.value); }}
        >
          {o.icon && <Icon name={o.icon} size={16} />}
          {o.label !== undefined && o.label !== null && <span className={s.label()}>{o.label}</span>}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
});
