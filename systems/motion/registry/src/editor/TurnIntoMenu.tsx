import { forwardRef, useEffect, useId, useState, type HTMLAttributes, type KeyboardEvent } from 'react';
import { cn } from '../lib/cn';
import { MenuList, MenuRow, MenuSurface } from '../components/Menu';
import type { Block } from '../blocks/types';
import { isKind, turnIntoItems, type TurnIntoItem } from './commands';

export interface TurnIntoMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** The block being converted (gets the checkmark). */
  block?: Pick<Block, 'type' | 'props'>;
  onSelect?: (item: TurnIntoItem) => void;
  /** Highlighted row id (static renders). */
  highlightedId?: string;
  /** Render without the floating surface (inside another menu). */
  bare?: boolean;
  /** Focus the list on mount (open from the keyboard). */
  autoFocus?: boolean;
}

/**
 * "Turn into" submenu (turn-into-menu): 220 wide, 28px rows with 20px icons, current type checked,
 * "Page in" has a chevron; Text, Heading 1–4, Page, lists, Code, Quote, Callout, Block equation, Synced block,
 * Toggle heading 1–4, 2–5 columns. The list is one tab stop (a listbox): ↑/↓/Home/End move the highlight,
 * Enter/Space pick the highlighted type.
 */
export const TurnIntoMenu = forwardRef<HTMLDivElement, TurnIntoMenuProps>(function TurnIntoMenu(
  { block, onSelect, highlightedId, bare, autoFocus, className, ...props }, ref,
) {
  const baseId = useId();
  const listId = `${baseId}-list`;
  const rowId = (i: number) => `${baseId}-${i}`;
  const [active, setActive] = useState(-1);
  useEffect(() => { if (autoFocus) document.getElementById(listId)?.focus(); }, [autoFocus, listId]);

  const move = (i: number) => {
    setActive(i);
    document.getElementById(rowId(i))?.scrollIntoView({ block: 'nearest' });
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = turnIntoItems.length - 1;
    const to = { ArrowDown: Math.min(last, active + 1), ArrowUp: Math.max(0, active - 1), Home: 0, End: last }[e.key];
    if (to !== undefined) { e.preventDefault(); move(to); }
    else if ((e.key === 'Enter' || e.key === ' ') && active >= 0) { e.preventDefault(); onSelect?.(turnIntoItems[active]); }
  };

  const list = (
    <MenuList
      id={listId}
      aria-label="Turn into"
      tabIndex={0}
      aria-activedescendant={active >= 0 ? rowId(active) : undefined}
      onKeyDown={onKeyDown}
      onFocus={() => { if (active < 0) setActive(Math.max(0, turnIntoItems.findIndex((it) => it.id === highlightedId))); }}
    >
      {turnIntoItems.map((it, i) => (
        <MenuRow
          key={it.id}
          id={rowId(i)}
          icon={it.icon}
          checked={!!block && isKind(block, it.kind)}
          submenu={it.submenu}
          highlighted={active >= 0 ? i === active : it.id === highlightedId}
          onMouseEnter={() => setActive(i)}
          onClick={() => onSelect?.(it)}
        >
          {it.label}
        </MenuRow>
      ))}
    </MenuList>
  );
  if (bare) return <div ref={ref} className={className} {...props}>{list}</div>;
  return (
    <MenuSurface ref={ref} width={220} className={cn('max-h-[70vh] overflow-y-auto', className)} {...props}>
      {list}
    </MenuSurface>
  );
});
