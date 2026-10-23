'use client';

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Icon, type IconName } from '../foundations/icon';
import { Portal, useDismiss, useFocusTrap, useScrollLock } from '../lib/overlay';

export interface CommandPaletteItem {
  id: string;
  label: string;
  /** Extra words that should match, e.g. a task's project or a page's old name. */
  keywords?: string;
  icon?: IconName;
  shortcut?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface CommandPaletteProps {
  className?: string;
  style?: CSSProperties;
  id?: string;
  groups: { label: string; items: CommandPaletteItem[] }[];
  onSelect?: (item: CommandPaletteItem) => void;
  placeholder?: string;
  emptyText?: ReactNode;
  /** Names the listbox when the palette is used outside a dialog. */
  label?: string;
}

/** Subsequence match, the way a launcher filters: "clh" finds "Clipboard history". */
function matches(query: string, item: CommandPaletteItem): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = `${item.label} ${item.keywords ?? ''}`.toLowerCase();
  if (hay.includes(q)) return true;
  let i = 0;
  for (const ch of hay) {
    if (ch === q[i]) i++;
    if (i === q.length) return true;
  }
  return false;
}

/**
 * The command surface the system is named for: type, and the list narrows.
 *
 * The input keeps focus and owns the keyboard throughout; the highlighted row is pointed at with
 * `aria-activedescendant` rather than by moving focus, so typing never stops working.
 */
export function CommandPalette({
  className, style, id, groups, onSelect, placeholder = 'Type a command or search…', emptyText = 'No matches',
  label = 'Commands',
}: CommandPaletteProps) {
  const uid = useId();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(
    () => groups.map((g) => ({ ...g, items: g.items.filter((i) => matches(query, i)) })).filter((g) => g.items.length > 0),
    [groups, query],
  );
  const flat = useMemo(() => filtered.flatMap((g) => g.items), [filtered]);

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    listRef.current?.querySelector('[data-active]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const choose = (item: CommandPaletteItem) => {
    if (item.disabled) return;
    onSelect?.(item);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (flat.length ? (i + 1) % flat.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (flat.length ? (i - 1 + flat.length) % flat.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = flat[active];
      if (item) choose(item);
    }
  };

  const optionId = (item: CommandPaletteItem) => `${uid}-${item.id}`;

  return (
    <div className={cn('bay-palette', className)} style={style} id={id}>
      <div className="bay-palette__search">
        <Icon name="search" size={16} className="bay-palette__searchIcon" />
        <input
          autoFocus
          type="text"
          role="combobox"
          className="bay-palette__input"
          placeholder={placeholder}
          value={query}
          aria-expanded
          aria-controls={`${uid}-list`}
          aria-activedescendant={flat[active] ? optionId(flat[active]) : undefined}
          aria-label={label}
          aria-autocomplete="list"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
      <div ref={listRef} id={`${uid}-list`} role="listbox" aria-label={label} className="bay-palette__list">
        {flat.length === 0 && <div className="bay-palette__empty">{emptyText}</div>}
        {filtered.map((group) => (
          <div key={group.label} className="bay-palette__group" role="group" aria-label={group.label}>
            <div className="bay-palette__groupLabel">{group.label}</div>
            {group.items.map((item) => {
              const isActive = flat[active]?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  id={optionId(item)}
                  role="option"
                  /* a button so the row is interactive by construction; the input keeps the
                     keyboard, so the row is never a tab stop */
                  tabIndex={-1}
                  aria-selected={isActive}
                  disabled={item.disabled}
                  data-active={isActive ? '' : undefined}
                  className="bay-palette__item"
                  onMouseEnter={() => setActive(flat.findIndex((f) => f.id === item.id))}
                  onClick={() => choose(item)}
                >
                  {item.icon && <Icon name={item.icon} size={15} className="bay-palette__itemIcon" />}
                  <span className="bay-palette__itemLabel">
                    {item.label}
                    {item.description && <span className="bay-palette__itemDescription">{item.description}</span>}
                  </span>
                  {item.shortcut && <span className="bay-palette__itemShortcut">{item.shortcut}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export interface CommandPaletteDialogProps extends CommandPaletteProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * The palette as a modal layer, which is how it is almost always used.
 *
 * It does not bind ⌘K itself: a shortcut belongs to the application, which knows what else is bound
 * and whether the palette should open at all on that screen.
 */
export function CommandPaletteDialog({
  open, defaultOpen = false, onOpenChange, ...palette
}: CommandPaletteDialogProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const isOpen = open ?? internal;
  const panelRef = useRef<HTMLDivElement | null>(null);

  const close = () => {
    if (open === undefined) setInternal(false);
    onOpenChange?.(false);
  };

  useDismiss(isOpen, close, [panelRef]);
  useFocusTrap(isOpen, panelRef);
  useScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="bay-palette__backdrop" />
      <div className="bay-palette__positioner">
        <div ref={panelRef} role="dialog" aria-modal="true" aria-label={palette.label ?? 'Commands'} className="bay-palette__dialog">
          <CommandPalette
            {...palette}
            onSelect={(item) => {
              palette.onSelect?.(item);
              close();
            }}
          />
        </div>
      </div>
    </Portal>
  );
}
