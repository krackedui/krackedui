import { forwardRef, useId, useMemo, useRef, useState, type HTMLAttributes } from 'react';
import { Tabs as T } from 'radix-ui';
import { cn } from '../lib/cn';
import { tv } from '../lib/tv';
import { Icon, iconNames, type IconName } from '../icons/Icon';
import { SearchField } from './Menu';
import { Tabs } from './Tabs';
import { emojiCategories, type EmojiCategory } from './emojiData';

/**
 * Page/callout icon picker. 408 x 390 (never wider than the viewport minus 16px), popover surface.
 * - header: underline tabs "Emoji | Icons | Upload" (inactive icon-secondary, 400 weight, inset underline) + "Remove" right
 * - search row: padding 4 8, gap 8 → search field (magnifier, blue focus ring), 28px outlined "random" button
 * - category label 12/12 500 text-secondary, padding 6 8 0, margin 6 0 8
 * - grid: padding 0 12, as many 32px columns as fit (12 at full width), radius 6, emoji 24px; hover wash
 * - footer: category jump bar, 1px top line, 32px buttons with 22px icons
 */
export const emojiPickerVariants = tv({
  slots: {
    root: 'flex h-[390px] w-[408px] max-w-[calc(100vw-16px)] flex-col',
    label: 'mb-2 mt-1.5 flex px-2 pt-1.5 text-[12px] font-medium leading-3 text-n-text-secondary',
    grid: 'grid grid-cols-[repeat(auto-fill,32px)] px-3',
    cell: 'flex size-8 cursor-pointer items-center justify-center rounded-n-md text-[24px] leading-none outline-none hover:bg-n-button-hover-bg-a focus-visible:bg-n-button-hover-bg-a focus-visible:shadow-n-focus-shadow data-[highlighted]:bg-n-button-hover-bg-a',
    square: 'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-n-md text-n-icon-secondary outline-none hover:bg-n-button-hover-bg-a focus-visible:shadow-n-focus-shadow',
    footer: 'flex h-12 shrink-0 items-center justify-between px-3 shadow-[inset_0_1px_0_var(--n-bg-tertiary-translucent-a)]',
    nav: 'flex size-8 cursor-pointer items-center justify-center rounded-n-md text-n-icon-secondary outline-none hover:bg-n-button-hover-bg-a focus-visible:shadow-n-focus-shadow',
  },
});
const s = emojiPickerVariants();

/** "arrowChevronSingleDown" → "Arrow chevron single down" */
const iconLabel = (name: string) => name.replace(/([a-z])([A-Z0-9])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase()).replace(/ (\w)/g, (_, c: string) => ` ${c.toLowerCase()}`);

export interface EmojiPickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect' | 'defaultValue' | 'dir'> {
  onSelect?: (emoji: string) => void;
  /** Called with a icon name from the Icons tab. */
  onSelectIcon?: (icon: IconName) => void;
  onRemove?: () => void;
  onUpload?: () => void;
  defaultTab?: 'emoji' | 'icons' | 'upload';
  categories?: EmojiCategory[];
  /** Emoji to show highlighted (static renders). */
  highlighted?: string;
  /** Focus the search field on mount. */
  autoFocus?: boolean;
}

/** Emoji/icon picker panel. Wrap in <Popover.Content> or <PopoverSurface>. */
export const EmojiPicker = forwardRef<HTMLDivElement, EmojiPickerProps>(function EmojiPicker(
  { onSelect, onSelectIcon, onRemove, onUpload, defaultTab = 'emoji', categories = emojiCategories, highlighted, autoFocus, className, ...props }, ref,
) {
  const [query, setQuery] = useState('');
  const uid = useId();
  const scroller = useRef<HTMLDivElement>(null);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((c) => (c.label.toLowerCase().includes(q) ? c : { ...c, emoji: c.emoji.filter((e) => e === q) }))
      .filter((c) => c.emoji.length);
  }, [categories, query]);
  const random = () => {
    const all = categories.flatMap((c) => c.emoji);
    onSelect?.(all[Math.floor(Math.random() * all.length)]);
  };
  const jump = (id: string) => {
    const el = scroller.current?.querySelector<HTMLElement>(`[data-category="${id}"]`);
    if (el && scroller.current) scroller.current.scrollTop = el.offsetTop - scroller.current.offsetTop;
  };

  return (
    <T.Root ref={ref} defaultValue={defaultTab} className={cn(s.root(), className)} {...props}>
      <div className="flex shrink-0 items-center justify-between shadow-[inset_0_-1px_0_var(--n-bg-tertiary-translucent-a)]">
        <Tabs.List className="shadow-none">
          <Tabs.Trigger value="emoji" tone="secondary" weight="regular" underline="inset">Emoji</Tabs.Trigger>
          <Tabs.Trigger value="icons" tone="secondary" weight="regular" underline="inset">Icons</Tabs.Trigger>
          <Tabs.Trigger value="upload" tone="secondary" weight="regular" underline="inset">Upload</Tabs.Trigger>
        </Tabs.List>
        {onRemove && <button type="button" onClick={onRemove} className="mr-2 flex h-7 cursor-pointer items-center rounded-n-md px-2 text-[14px] leading-[16.8px] text-n-text-secondary outline-none hover:bg-n-button-hover-bg-a focus-visible:shadow-n-focus-shadow">Remove</button>}
      </div>

      <T.Content value="emoji" className="flex min-h-0 flex-1 flex-col outline-none">
        <div className="mt-1 flex shrink-0 items-center gap-2 px-2 py-1">
          <SearchField aria-label="Search emoji" placeholder="Filter…" value={query} onChange={(e) => setQuery(String(e.target.value))} autoFocus={autoFocus} className="flex-1" />
          <button type="button" aria-label="Random emoji" title="Random emoji" onClick={random} className={cn(s.square(), 'shadow-[inset_0_0_0_1px_var(--n-border-primary-translucent-a)]')}>
            <Icon name="arrowIntersectRightSmall" size={14} />
          </button>
        </div>
        <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto pb-2 pt-2.5">
          {filtered.map((c) => (
            <div key={c.id} data-category={c.id} role="group" aria-labelledby={`${uid}-${c.id}`} className="flex flex-col">
              <div id={`${uid}-${c.id}`} className={s.label()}>{c.label}</div>
              <div className={s.grid()}>
                {c.emoji.map((e, i) => (
                  <button key={e + i} type="button" aria-label={e} data-highlighted={e === highlighted ? '' : undefined} className={s.cell()} onClick={() => onSelect?.(e)}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div role="status" className="px-3 py-6 text-center text-[14px] text-n-text-secondary">No results</div>}
        </div>
        <nav aria-label="Emoji categories" className={s.footer()}>
          {categories.map((c) => (
            <button key={c.id} type="button" aria-label={c.label} title={c.label} className={s.nav()} onClick={() => jump(c.id)}>
              <Icon name={c.icon as IconName} size={22} />
            </button>
          ))}
        </nav>
      </T.Content>

      <T.Content value="icons" className="min-h-0 flex-1 overflow-y-auto pb-2 outline-none">
        <div id={`${uid}-icons`} className={s.label()}>Icons</div>
        <div role="group" aria-labelledby={`${uid}-icons`} className={s.grid()}>
          {iconNames.filter((n) => !n.includes('@')).map((n) => (
            <button key={n} type="button" aria-label={iconLabel(n)} title={iconLabel(n)} className={cn(s.cell(), 'text-n-icon-secondary')} onClick={() => onSelectIcon?.(n)}>
              <Icon name={n} size={22} />
            </button>
          ))}
        </div>
      </T.Content>

      <T.Content value="upload" className="flex flex-1 flex-col items-center gap-3 px-4 py-4 outline-none">
        <button type="button" onClick={onUpload} className="flex h-8 w-full cursor-pointer items-center justify-center rounded-n-md text-[14px] text-n-text-primary shadow-n-button-box-shadow outline-none hover:bg-n-button-hover-bg-a focus-visible:shadow-n-focus-shadow">
          Upload an image
        </button>
        <p className="text-center text-[12px] leading-4 text-n-text-secondary">Recommended size is 280 × 280 pixels<br />The maximum size per file is 5 MB.</p>
      </T.Content>
    </T.Root>
  );
});
