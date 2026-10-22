import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { DropdownMenu } from 'radix-ui';
import { cn } from '../lib/cn';
import { tv } from '../lib/tv';
import { Icon, iconNames, type IconName } from '../icons/Icon';
import { menuStyles } from './Menu';
import { ThemePortal } from '../foundations/ThemePortal';

/**
 * Topbar breadcrumb. Region 44px tall, 14/16.8 text-primary.
 * Segment: 24px, padding 2 6, radius 6, hover wash, max-width 240 truncated; icon 20px (emoji 16px)
 * with 6px gap. Separator "/" text-tertiary, margin 0 2. When the row is too narrow, middle segments
 * collapse into a "…" button that opens a menu of the hidden ones.
 */
export const breadcrumbsVariants = tv({
  slots: {
    root: 'flex h-11 min-w-0 items-center overflow-hidden text-[14px] leading-[16.8px] text-n-text-primary',
    list: 'm-0 flex min-w-0 list-none items-center p-0',
    item: 'flex min-w-0 shrink items-center last:shrink-0 last:max-w-[60%]',
    segment: [
      'flex h-6 min-w-0 max-w-[240px] items-center gap-1.5 whitespace-nowrap rounded-n-md px-1.5 py-0.5 text-inherit no-underline outline-none',
      'focus-visible:shadow-n-focus-shadow pointer-coarse:h-8',
    ],
    interactive: 'cursor-pointer hover:bg-n-button-hover-bg-a',
    icon: 'flex size-5 shrink-0 items-center justify-center text-[16px] leading-none text-n-icon-secondary',
    label: 'truncate',
    separator: 'mx-0.5 shrink-0 text-n-text-tertiary',
    chip: 'flex h-6 shrink-0 cursor-pointer items-center whitespace-nowrap rounded-n-md px-1.5 outline-none hover:bg-n-button-hover-bg-a focus-visible:shadow-n-focus-shadow',
  },
});
const s = breadcrumbsVariants();
const m = menuStyles();

export interface BreadcrumbItem {
  label: ReactNode;
  /** Icon name (`IconName`) or an emoji string. */
  icon?: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  /** Most segments shown before the middle ones collapse into "…" (default 4). Narrow rows collapse more. */
  maxItems?: number;
  /** Content after the last segment (e.g. <BreadcrumbAccess />). */
  trailing?: ReactNode;
  /** Accessible name of the "…" button (default "Show hidden breadcrumbs"). */
  collapsedLabel?: string;
}

function SegmentIcon({ icon }: { icon: string }) {
  const isIcon = (iconNames as string[]).includes(icon);
  return <span aria-hidden className={s.icon()}>{isIcon ? <Icon name={icon as IconName} size={20} /> : icon}</span>;
}

function Segment({ item, current }: { item: BreadcrumbItem; current: boolean }) {
  const content = (
    <>
      {item.icon && <SegmentIcon icon={item.icon} />}
      <span data-crumb-label="" className={s.label()}>{item.label}</span>
    </>
  );
  const aria = current ? ('page' as const) : undefined;
  if (item.href) return <a href={item.href} onClick={item.onClick} aria-current={aria} className={cn(s.segment(), s.interactive())}>{content}</a>;
  if (item.onClick) return <button type="button" onClick={item.onClick} aria-current={aria} className={cn(s.segment(), s.interactive())}>{content}</button>;
  return <span aria-current={aria} className={s.segment()}>{content}</span>;
}

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Location in a hierarchy (WAI-ARIA breadcrumb): an ordered list of links inside `nav aria-label="Breadcrumb"`;
 * the last item is the current page (`aria-current="page"`). Middle items collapse into a "…" menu when
 * there are more than `maxItems` or the row runs out of space (down to first + "…" + current).
 */
export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs(
  { items, maxItems = 4, trailing, collapsedLabel = 'Show hidden breadcrumbs', className, 'aria-label': ariaLabel = 'Breadcrumb', ...props }, ref,
) {
  // Number of middle items hidden. Starts from maxItems, grows while the row overflows.
  const base = Math.max(0, items.length - Math.max(2, maxItems));
  const maxHidden = Math.max(0, items.length - 2);
  const [hidden, setHidden] = useState(base);
  const rootRef = useRef<HTMLElement | null>(null);
  const width = useRef(0);

  const setRefs = useCallback((node: HTMLElement | null) => {
    rootRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  }, [ref]);

  // Reset when the items or the limit change.
  useIsoLayoutEffect(() => { setHidden(base); }, [base, items.length]);

  // After each render: if the row overflows and more can be hidden, hide one more.
  useIsoLayoutEffect(() => {
    const el = rootRef.current;
    if (!el || hidden >= maxHidden) return;
    // Overflowing, or an ancestor segment had to truncate its label: hide one more middle item.
    const labels = [...el.querySelectorAll<HTMLElement>('[data-crumb-label]')].slice(0, -1);
    const squeezed = labels.some((l) => l.scrollWidth > l.clientWidth + 1);
    if (el.scrollWidth > el.clientWidth + 1 || squeezed) setHidden((h) => Math.min(maxHidden, h + 1));
  });

  // When the row (or its container) gets wider, start again from the configured limit.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const container = el.parentElement ?? el;
    const ro = new ResizeObserver(() => {
      const w = container.getBoundingClientRect().width;
      if (w > width.current + 1) setHidden(base);
      width.current = w;
    });
    ro.observe(el);
    if (container !== el) ro.observe(container);
    return () => ro.disconnect();
  }, [base]);

  const collapsed = hidden > 0 ? items.slice(1, 1 + hidden) : [];
  const shown: (BreadcrumbItem | 'ellipsis')[] = hidden > 0 ? [items[0], 'ellipsis', ...items.slice(1 + hidden)] : items;

  return (
    <nav ref={setRefs} aria-label={ariaLabel} className={cn(s.root(), className)} {...props}>
      <ol className={s.list()}>
        {shown.map((it, i) => (
          <li key={it === 'ellipsis' ? 'ellipsis' : i} className={cn(s.item(), it === 'ellipsis' && 'shrink-0')}>
            {i > 0 && <span aria-hidden className={s.separator()}>/</span>}
            {it === 'ellipsis' ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger aria-label={collapsedLabel} className={cn(s.segment(), s.interactive(), 'shrink-0')}>…</DropdownMenu.Trigger>
                <ThemePortal primitive={DropdownMenu.Portal}>
                  <DropdownMenu.Content align="start" sideOffset={4} collisionPadding={8} className={cn('motion-floating', m.surface(), 'z-50 p-1')}>
                    {collapsed.map((c, j) => (
                      <DropdownMenu.Item
                        key={j}
                        asChild={!!c.href}
                        onSelect={() => c.onClick?.()}
                        className={m.row()}
                      >
                        {c.href ? (
                          <a href={c.href}>
                            {c.icon && <SegmentIcon icon={c.icon} />}
                            <span className={m.rowLabel()}>{c.label}</span>
                          </a>
                        ) : (
                          <>
                            {c.icon && <SegmentIcon icon={c.icon} />}
                            <span className={m.rowLabel()}>{c.label}</span>
                          </>
                        )}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </ThemePortal>
              </DropdownMenu.Root>
            ) : (
              <Segment item={it} current={i === shown.length - 1} />
            )}
          </li>
        ))}
      </ol>
      {trailing}
    </nav>
  );
});

/** The access chip after the breadcrumb ("🔒 Private ⌄"): a button that opens sharing settings. */
export const BreadcrumbAccess = forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement> & { label?: ReactNode; icon?: IconName }>(function BreadcrumbAccess(
  { label = 'Private', icon = 'lockFill', className, ...props }, ref,
) {
  return (
    <button ref={ref} type="button" className={cn(s.chip(), className)} {...props}>
      <Icon name={icon} size={16} className="text-n-icon-tertiary" />
      <span className="ml-1 mr-[5px] text-n-text-secondary">{label}</span>
      <Icon name="arrowChevronSingleDownFill" size={11} className="text-n-icon-tertiary" />
    </button>
  );
});
