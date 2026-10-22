import { forwardRef, useCallback, useLayoutEffect, useEffect, useRef, useState, type ComponentPropsWithoutRef, type CSSProperties, type ElementRef } from 'react';
import { Tabs as T } from 'radix-ui';
import { cn } from '../lib/cn';
import { tv, type VariantProps } from '../lib/tv';

/**
 * Underline tabs. Bar 40px with a 1px inset bottom line; each tab sits in a 6px vertical padding wrapper,
 * 28px tall, padding 0 8, radius 6, 14/16.8, hover wash. Inactive text-tertiary (or icon-secondary), active
 * text-primary, with a 2px text-primary underline at the bottom of the bar, full tab width or inset 8.
 * The underline slides between tabs (`.motion-indicator`); before hydration each tab draws its own.
 */
export const tabsVariants = tv({
  slots: {
    list: 'relative flex h-10 shrink-0 items-stretch overflow-x-auto px-2 shadow-[inset_0_-1px_0_var(--n-bg-tertiary-translucent-a)] [scrollbar-width:none]',
    trigger: [
      'group/tab relative flex cursor-pointer items-center whitespace-nowrap py-1.5 outline-none',
      'data-[state=active]:text-n-text-primary data-[disabled]:cursor-default data-[disabled]:opacity-40',
    ],
    inner: 'inline-flex h-7 items-center gap-1 rounded-n-md px-2 text-[14px] leading-[16.8px] group-hover/tab:bg-n-button-hover-bg-a group-focus-visible/tab:shadow-n-focus-shadow group-data-[disabled]/tab:bg-transparent',
    underline: 'absolute bottom-0 hidden h-0.5 bg-n-text-primary group-data-[state=active]/tab:block group-data-[indicator=ready]/list:!hidden',
    indicator: 'motion-indicator pointer-events-none absolute bottom-0 left-0 h-0.5 bg-n-text-primary',
  },
  variants: {
    tone: {
      // both inactive tones use text-secondary: tertiary misses 4.5:1 on popover backgrounds in dark
      tertiary: { trigger: 'text-n-text-secondary' },
      secondary: { trigger: 'text-n-text-secondary' },
    },
    weight: { medium: { inner: 'font-medium' }, regular: {} },
    underline: { full: { underline: 'inset-x-0' }, inset: { underline: 'inset-x-2' } },
  },
  defaultVariants: { tone: 'tertiary', weight: 'medium', underline: 'full' },
});

type Style = VariantProps<typeof tabsVariants>;

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const List = forwardRef<ElementRef<typeof T.List>, ComponentPropsWithoutRef<typeof T.List>>(function List({ className, children, ...p }, ref) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState<{ x: number; width: number } | null>(null);

  const setRefs = useCallback((node: HTMLDivElement | null) => {
    listRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  }, [ref]);

  const measure = useCallback(() => {
    const list = listRef.current;
    const tab = list?.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
    if (!list || !tab) { setBox(null); return; }
    const inset = tab.dataset.underline === 'inset' ? 8 : 0;
    const next = { x: tab.offsetLeft + inset, width: tab.offsetWidth - inset * 2 };
    setBox((prev) => (prev && prev.x === next.x && prev.width === next.width ? prev : next));
  }, []);

  useIsoLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    measure();
    const mo = new MutationObserver(measure);
    mo.observe(list, { subtree: true, attributes: true, attributeFilter: ['data-state'], childList: true });
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    list.querySelectorAll('[role="tab"]').forEach((tab) => ro.observe(tab));
    return () => { mo.disconnect(); ro.disconnect(); };
  }, [measure]);

  const s = tabsVariants();
  const indicatorStyle: CSSProperties | undefined = box ? { width: box.width, transform: `translateX(${box.x}px)` } : undefined;
  return (
    <T.List ref={setRefs} data-indicator={box ? 'ready' : undefined} className={cn('group/list', s.list(), className)} {...p}>
      {children}
      {box && <span aria-hidden className={s.indicator()} style={indicatorStyle} />}
    </T.List>
  );
});

type TriggerProps = ComponentPropsWithoutRef<typeof T.Trigger> & Style;
const Trigger = forwardRef<ElementRef<typeof T.Trigger>, TriggerProps>(function Trigger({ className, tone, weight, underline, children, ...p }, ref) {
  const s = tabsVariants({ tone, weight, underline });
  return (
    <T.Trigger ref={ref} data-underline={underline ?? 'full'} className={cn(s.trigger(), className)} {...p}>
      <span className={s.inner()}>{children}</span>
      <span aria-hidden className={s.underline()} />
    </T.Trigger>
  );
});

const Content = forwardRef<ElementRef<typeof T.Content>, ComponentPropsWithoutRef<typeof T.Content>>(function Content({ className, ...p }, ref) {
  return <T.Content ref={ref} className={cn('outline-none focus-visible:shadow-n-focus-shadow', className)} {...p} />;
});

/**
 * Switch between views of the same context (WAI-ARIA tabs): Left/Right arrows move and activate,
 * Home/End jump to the ends, Tab moves into the panel. Use SegmentedControl for a compact option toggle
 * and Sidebar/links for navigation between pages.
 *
 * <Tabs.Root defaultValue="share"><Tabs.List><Tabs.Trigger value="share">Share</Tabs.Trigger>…</Tabs.List>
 * <Tabs.Content value="share">…</Tabs.Content></Tabs.Root>
 */
export const Tabs = { Root: T.Root, List, Trigger, Content };
