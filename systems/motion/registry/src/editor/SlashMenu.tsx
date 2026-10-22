import { forwardRef, useEffect, useId, useMemo, useRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { MenuLabel, MenuList, MenuRow, MenuSurface } from '../components/Menu';
import { filterSlash, slashGroups, type SlashGroup, type SlashItem } from './commands';

export interface SlashMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Text typed after "/" (filters the list). */
  query?: string;
  /** Index (in the filtered, flattened list) of the keyboard-highlighted row. */
  activeIndex?: number;
  onActiveIndexChange?: (i: number) => void;
  onSelect?: (item: SlashItem) => void;
  onClose?: () => void;
  groups?: SlashGroup[];
}

/** Flattened filtered items, in display order (for keyboard navigation). */
export function slashItems(query = '', groups: SlashGroup[] = slashGroups): SlashItem[] {
  return filterSlash(query, groups).flatMap((g) => g.items);
}

/**
 * "/" command menu. Measured (slash-menu): width 324, radius 10, list scroller 373 tall;
 * group labels 12/14.4 500 text-secondary (margin 6 0 8); rows 32 tall, radius 6, padding 0 8, gap 8,
 * 20px icons, 14/16.8; shortcut hints 12px text-tertiary; "New" badge 11/14.3 500 blue on blue-bg-secondary-translucent;
 * footer "Close menu" + "esc" under a 1px border-primary line.
 */
export const SlashMenu = forwardRef<HTMLDivElement, SlashMenuProps>(function SlashMenu(
  { query = '', activeIndex = 0, onActiveIndexChange, onSelect, onClose, groups = slashGroups, className, ...props }, ref,
) {
  const filtered = useMemo(() => filterSlash(query, groups), [query, groups]);
  const listRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const optionId = (idx: number) => `${baseId}-${idx}`;
  const count = filtered.reduce((n, g) => n + g.items.length, 0);
  useEffect(() => {
    listRef.current?.querySelector('[data-highlighted]')?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, query]);
  let i = -1;
  return (
    <MenuSurface ref={ref} width={324} className={cn('flex flex-col', className)} role="dialog" aria-label="Slash commands" onMouseDown={(e) => e.preventDefault()} {...props}>
      {filtered.length === 0 && (
        <div role="status" className="flex h-8 items-center px-3 text-[14px] text-n-text-secondary">No results</div>
      )}
      {/* One scrollable listbox of labelled groups. The editor keeps focus while typing (activeIndex); the list is
          focusable too, so it can be scrolled and read on its own (aria-activedescendant names the highlighted row). */}
      <div
        ref={listRef}
        role="listbox"
        aria-label="Commands"
        tabIndex={0}
        aria-activedescendant={count > 0 && activeIndex < count ? optionId(activeIndex) : undefined}
        hidden={filtered.length === 0}
        className="max-h-[373px] overflow-y-auto overflow-x-hidden outline-none [mask-image:linear-gradient(to_bottom,black_calc(100%-40px),transparent)]"
      >
        {filtered.map((g, gi) => (
          <MenuList key={g.label} role="group" aria-label={g.label} separator={gi > 0} className={gi > 0 ? 'mt-1.5 pt-1.5' : undefined}>
            <MenuLabel aria-hidden>{g.label}</MenuLabel>
            {g.items.map((it) => {
              i += 1;
              const idx = i;
              return (
                <MenuRow
                  key={it.id}
                  id={optionId(idx)}
                  icon={it.icon}
                  highlighted={idx === activeIndex}
                  shortcut={it.shortcut}
                  className="h-8"
                  onMouseMove={() => idx !== activeIndex && onActiveIndexChange?.(idx)}
                  onClick={() => onSelect?.(it)}
                >
                  <span className="flex items-center">
                    <span className="me-1.5">{it.label}</span>
                    {it.description && (
                      <>
                        <span aria-hidden className="me-1.5 text-n-text-secondary">·</span>
                        <span className="me-1.5 text-n-text-secondary">{it.description}</span>
                      </>
                    )}
                    {it.badge && (
                      <span className="ms-2 rounded-n-sm bg-n-blue-bg-secondary-translucent-a px-1 py-0.5 text-[11px] font-medium leading-[14.3px] text-n-blue-text-primary">
                        {it.badge}
                      </span>
                    )}
                  </span>
                </MenuRow>
              );
            })}
          </MenuList>
        ))}
      </div>
      <footer className="flex flex-col">
        <div role="separator" className="h-px bg-n-border-primary" />
        <div className="p-1">
          <MenuRow className="h-8" shortcut="esc" onClick={onClose} role="button" aria-selected={undefined}>Close menu</MenuRow>
        </div>
      </footer>
    </MenuSurface>
  );
});
