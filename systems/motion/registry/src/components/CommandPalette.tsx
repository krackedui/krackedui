import { forwardRef, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { Dialog as D } from 'radix-ui';
import { cn } from '../lib/cn';
import { tv } from '../lib/tv';
import { Icon, iconNames, type IconName } from '../icons/Icon';
import { dialogVariants } from './Dialog';
import { ThemePortal } from '../foundations/ThemePortal';

/**
 * Command palette (⌘K). Search-panel look:
 * - panel: radius 20, translucent wax-paper background + 40px backdrop blur, modal shadow; no smoke underlay
 * - header 48: magnifier 22 icon-secondary, 16px input
 * - optional filter chips row 44: 24px chips, radius 32, 14px text-secondary
 * - results: groups padding 4, gap 1, section label 12/14.4 500 text-secondary; rows 36px (radius 12,
 *   selected = hover wash), 20px icon, 14/20 500 title, optional "— path" in 12px text-tertiary, shortcut right
 * - optional preview pane (md+), footer 41 with key hints 12/18 text-tertiary
 * On phones the dialog fills the screen.
 */
export const commandPaletteVariants = tv({
  slots: {
    root: 'flex flex-col overflow-hidden',
    header: 'flex h-12 shrink-0 items-center justify-between',
    input: 'min-w-0 flex-1 appearance-none bg-transparent text-[16px] leading-6 text-n-text-primary outline-none placeholder:text-n-text-tertiary [&::-webkit-search-cancel-button]:hidden',
    roundButton: 'flex size-8 cursor-pointer items-center justify-center rounded-full text-n-blue-icon-accent-primary outline-none hover:bg-n-button-hover-bg-a focus-visible:shadow-n-focus-shadow',
    filters: 'flex h-11 shrink-0 items-center gap-1.5 overflow-x-auto px-3 [scrollbar-width:none]',
    chip: 'flex h-6 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[32px] px-2 text-[14px] leading-6 text-n-text-secondary outline-none hover:bg-n-button-hover-bg-a focus-visible:shadow-n-focus-shadow',
    list: 'flex min-h-0 flex-col overflow-y-auto overscroll-contain px-2.5 pb-2',
    group: 'flex flex-col gap-px p-1',
    label: 'mb-2 mt-1.5 flex px-2 text-[12px] font-medium leading-[14.4px] text-n-text-secondary',
    row: 'flex h-9 shrink-0 cursor-pointer items-center rounded-n-2xl px-2 py-1 outline-none data-[selected]:bg-n-button-hover-bg-a pointer-coarse:h-11',
    rowInner: 'flex h-7 min-w-0 flex-1 items-center gap-2 pr-2 text-[14px] leading-[16.8px]',
    rowTitle: 'truncate font-medium leading-5 text-n-text-primary',
    shortcut: 'ml-auto shrink-0 pl-2 text-[12px] leading-4 text-n-text-secondary',
    path: 'flex min-w-0 shrink items-center truncate text-[12px] text-n-text-secondary',
    empty: 'px-3 py-8 text-center text-[14px] text-n-text-secondary',
    footer: 'mt-px flex h-[41px] shrink-0 items-center justify-between py-2 pl-4 pr-3 shadow-[0_-1px_0_var(--n-bg-tertiary-translucent-a)] max-sm:hidden',
    hint: 'flex items-center gap-1.5',
    glyph: 'flex items-center gap-0.5 text-[12px] leading-4 text-n-text-secondary [&_svg]:text-n-icon-secondary',
  },
});
const s = commandPaletteVariants();

export interface CommandItem {
  id: string;
  title: ReactNode;
  /** Icon name or emoji. Default: none. */
  icon?: string;
  /** Extra words that match the search (synonyms, ids). */
  keywords?: string;
  /** Keyboard shortcut hint shown at the right ("⌘N"). */
  shortcut?: ReactNode;
  /** Parent path segments shown after an em dash ("Workspace / Tasks"). */
  path?: string[];
  /** Body of the preview pane for this item. */
  preview?: ReactNode;
  disabled?: boolean;
}
export interface CommandGroup { label: string; items: CommandItem[] }
export interface CommandFilter { label: string; icon?: IconName; menu?: boolean; muted?: boolean; onClick?: () => void }

export const defaultCommandHints: { keys: ReactNode; label: string }[] = [
  { keys: <><Icon name="arrowUp" size={12} /><Icon name="arrowDown" size={12} /></>, label: 'Navigate' },
  { keys: <Icon name="arrowTurnDownLeftSmall" size={12} />, label: 'Select' },
  { keys: 'esc', label: 'Close' },
];

function ItemIcon({ icon }: { icon: string }) {
  const isIcon = (iconNames as string[]).includes(icon);
  return (
    <span aria-hidden className="flex size-5 shrink-0 items-center justify-center text-[16px] text-n-icon-secondary">
      {isIcon ? <Icon name={icon as IconName} size={18} /> : icon}
    </span>
  );
}

const Path = ({ path, className }: { path: string[]; className?: string }) => (
  <span className={cn(s.path(), className)}>
    {path.map((p, i) => <span key={i} className="flex min-w-0">{i > 0 && <span className="px-1">/</span>}<span className="truncate">{p}</span></span>)}
  </span>
);

const text = (node: ReactNode): string => (typeof node === 'string' || typeof node === 'number' ? String(node) : '');

export interface CommandPaletteProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  groups: CommandGroup[];
  /** Input placeholder; also the input's accessible name unless `aria-label`/`inputLabel` is given. */
  placeholder?: string;
  /** Accessible name of the search input (default: the placeholder). */
  inputLabel?: string;
  /** Shown when nothing matches (default "No results"). */
  emptyText?: ReactNode;
  /** Filter chips under the input (Motion extra). */
  filters?: CommandFilter[];
  /** Key hints in the footer; `[]` hides the footer. */
  hints?: { keys: ReactNode; label: string }[];
  /** Show the right-hand preview pane on wide screens (default false). */
  preview?: boolean;
  // Method syntax: callers may pass a handler typed for a narrower item (e.g. the contract's CommandPaletteItem).
  /** Called with the chosen item (Enter or click). */
  onSelect?(this: void, item: CommandItem): void;
  /** Initially selected item id (defaults to the first). */
  defaultSelectedId?: string;
  /** Controlled search text. */
  query?: string;
  onQueryChange?: (query: string) => void;
  autoFocus?: boolean;
  /** Content at the right end of the search row (e.g. a close button). */
  headerEnd?: ReactNode;
}

/**
 * Searchable list of commands (WAI-ARIA combobox with a listbox popup that is always shown): type to
 * filter by title and keywords, ↑/↓ (Home/End) to move, Enter to run. Use it inline in a panel, or as
 * `CommandPaletteDialog` on ⌘K. For a short fixed list of actions use Menu.
 */
export const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(function CommandPalette(
  { groups, placeholder = 'Search…', inputLabel, emptyText = 'No results', filters = [], hints = defaultCommandHints, preview = false,
    onSelect, defaultSelectedId, query: queryProp, onQueryChange, autoFocus, headerEnd, className, ...props }, ref,
) {
  const uid = useId();
  const listId = `${uid}-list`;
  const optionId = (id: string) => `${uid}-opt-${id.replace(/[^\w-]/g, '_')}`;
  const [inner, setInner] = useState('');
  const query = queryProp ?? inner;
  const [showPreview, setShowPreview] = useState(preview);
  const [showFilters, setShowFilters] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    const words = q.split(/\s+/);
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((it) => {
          const hay = `${text(it.title)} ${it.keywords ?? ''} ${(it.path ?? []).join(' ')}`.toLowerCase();
          return words.every((w) => hay.includes(w));
        }),
      }))
      .filter((g) => g.items.length);
  }, [groups, query]);
  const flat = useMemo(() => shown.flatMap((g) => g.items).filter((it) => !it.disabled), [shown]);
  const [selected, setSelected] = useState<string | undefined>(defaultSelectedId);
  const activeId = flat.some((f) => f.id === selected) ? selected : flat[0]?.id;
  const current = flat.find((f) => f.id === activeId);

  useEffect(() => {
    if (!activeId) return;
    listRef.current?.querySelector<HTMLElement>('[data-selected]')?.scrollIntoView({ block: 'nearest' });
  }, [activeId]);

  const move = (to: number) => setSelected(flat[Math.max(0, Math.min(flat.length - 1, to))]?.id);
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const i = flat.findIndex((f) => f.id === activeId);
    if (e.key === 'ArrowDown') { e.preventDefault(); move(i + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(i - 1); }
    else if (e.key === 'Home' && e.ctrlKey) { e.preventDefault(); move(0); }
    else if (e.key === 'End' && e.ctrlKey) { e.preventDefault(); move(flat.length - 1); }
    else if (e.key === 'Enter' && current) { e.preventDefault(); onSelect?.(current); }
  };

  const footer = hints.length > 0;
  return (
    <div ref={ref} className={cn(s.root(), className)} {...props}>
      <div className={s.header()}>
        <div className="m-3 flex min-w-0 flex-1 items-center gap-2">
          <Icon name="magnifyingGlass" size={22} className="mx-1 text-n-icon-secondary" />
          <input
            type="search"
            role="combobox"
            aria-label={inputLabel ?? placeholder}
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeId ? optionId(activeId) : undefined}
            autoComplete="off"
            spellCheck={false}
            autoFocus={autoFocus}
            value={query}
            onChange={(e) => { setInner(e.target.value); onQueryChange?.(e.target.value); }}
            onKeyDown={onKey}
            placeholder={placeholder}
            className={s.input()}
          />
        </div>
        {headerEnd}
        {(preview || filters.length > 0) && (
          <div className="mr-2.5 flex items-center gap-1">
            {preview && (
              <button type="button" aria-pressed={showPreview} aria-label="Preview pane" className={cn(s.roundButton(), 'max-md:hidden', !showPreview && 'text-n-icon-secondary')} onClick={() => setShowPreview((v) => !v)}>
                <Icon name="sidebarRight" size={22} />
              </button>
            )}
            {filters.length > 0 && (
              <button type="button" aria-pressed={showFilters} aria-label="Filters" className={cn(s.roundButton(), !showFilters && 'text-n-icon-secondary')} onClick={() => setShowFilters((v) => !v)}>
                <Icon name="filterCircle" size={22} />
              </button>
            )}
          </div>
        )}
      </div>
      {showFilters && filters.length > 0 && (
        <div className={s.filters()}>
          {filters.map((f) => (
            <button key={f.label} type="button" onClick={f.onClick} className={cn(s.chip(), f.muted && 'text-n-text-secondary')}>
              {f.icon && <Icon name={f.icon} size={f.muted ? 16 : 18} />}
              <span>{f.label}</span>
              {f.menu && <Icon name="arrowChevronSingleDownSmall" size={14} />}
            </button>
          ))}
        </div>
      )}
      <div className="flex min-h-0 flex-1">
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={inputLabel ?? placeholder}
          className={cn(s.list(), showPreview && preview ? 'min-w-0 flex-1 md:w-[600px] md:flex-none md:shrink-0' : 'flex-1')}
        >
          {shown.map((g, gi) => (
            <div key={g.label} role="group" aria-labelledby={`${uid}-g${gi}`} className={s.group()}>
              <div id={`${uid}-g${gi}`} className={s.label()}>{g.label}</div>
              {g.items.map((it) => (
                <div
                  key={it.id}
                  id={optionId(it.id)}
                  role="option"
                  aria-selected={it.id === activeId}
                  aria-disabled={it.disabled || undefined}
                  data-selected={it.id === activeId ? '' : undefined}
                  className={cn(s.row(), it.disabled && 'cursor-default opacity-40')}
                  onPointerMove={() => { if (!it.disabled && it.id !== activeId) setSelected(it.id); }}
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault() /* keep focus in the input */}
                  onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !it.disabled) { e.preventDefault(); onSelect?.(it); } }}
                  onClick={() => { if (!it.disabled) onSelect?.(it); }}
                >
                  <div className={s.rowInner()}>
                    {it.icon && <ItemIcon icon={it.icon} />}
                    <div className="flex min-w-0 items-center gap-1">
                      <span className={s.rowTitle()}>{it.title}</span>
                      {it.path?.length ? <><span aria-hidden className="shrink-0 text-[12px] text-n-text-secondary">—</span><Path path={it.path} /></> : null}
                    </div>
                    {it.shortcut && <span className={s.shortcut()}>{it.shortcut}</span>}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        {preview && showPreview && (
          <aside aria-label="Preview" className="hidden min-w-0 flex-1 flex-col pb-3 pl-4 pr-3.5 pt-[34px] md:flex">
            {current && (
              <div className="relative flex min-h-0 flex-1 flex-col overflow-auto rounded-n-2xl bg-n-popover-bg shadow-n-shadow-outline-lg">
                <div className="h-20 shrink-0 bg-n-bg-secondary" />
                <div className="flex flex-col gap-1.5 px-6 pb-6 pt-7">
                  {current.path?.length ? <Path path={current.path} className="leading-[18px]" /> : null}
                  <div className="text-[20px] font-semibold leading-6 text-n-text-primary">{current.title}</div>
                  {current.preview && <div className="mt-2 text-[14px] leading-5 text-n-text-secondary">{current.preview}</div>}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
      {flat.length === 0 && <div role="status" className={s.empty()}>{emptyText}</div>}
      {footer && (
        <div className={s.footer()}>
          <ul className="m-0 flex list-none items-center gap-5 p-0 text-[12px] leading-[18px] text-n-text-secondary">
            {hints.map((h) => (
              <li key={h.label} className={s.hint()}><span aria-hidden className={s.glyph()}>{h.keys}</span>{h.label}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

/** Search panel surface classes: radius 20, translucent wax-paper background with 40px blur. */
export const commandPaletteSurfaceClass = cn(
  dialogVariants({ radius: 'xl' }).surface(),
  'bg-n-popover-wax-paper-bg-a backdrop-blur-[40px]',
);

export interface CommandPaletteDialogProps extends CommandPaletteProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Register ⌘K / Ctrl+K to toggle (default true). */
  hotkey?: boolean;
  /** Width in px on screens ≥ 640px (default 640, or 1006 with `preview`). */
  width?: number;
  /** Height in px on screens ≥ 640px (default: fits the results, up to 76% of the viewport; 700 with `preview`). */
  height?: number;
  /** Accessible name of the dialog (default "Command palette"). */
  title?: string;
}

/**
 * Command palette in a modal, toggled with ⌘K / Ctrl+K (WAI-ARIA dialog containing a combobox). Focus goes
 * to the search input, Escape or an outside click closes it and focus returns to where it was. Selecting an
 * item closes the dialog (`onOpenChange(false)`) and then calls `onSelect`, so a command can open another dialog. Full screen on phones.
 */
export function CommandPaletteDialog({
  open: openProp, defaultOpen = false, onOpenChange, hotkey = true, width, height, title = 'Command palette', onSelect, preview = false, ...props
}: CommandPaletteDialogProps) {
  const [inner, setInner] = useState(defaultOpen);
  const open = openProp ?? inner;
  const set = (v: boolean) => { setInner(v); onOpenChange?.(v); };
  // Opened by the hotkey there is no trigger: remember what had focus and return there on close.
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!hotkey) return;
    const on = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setInner(!open);
        onOpenChange?.(!open);
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [hotkey, open, onOpenChange]);

  const w = width ?? (preview ? 1006 : 640);
  const h = height ?? (preview ? 700 : undefined);
  const size = { '--cp-width': `${w}px`, '--cp-height': h === undefined ? 'auto' : `${h}px` } as CSSProperties;
  return (
    <D.Root open={open} onOpenChange={set}>
      <ThemePortal primitive={D.Portal}>
        {/* The search panel keeps the page visible: a transparent click-catcher, no smoke underlay. */}
        <D.Overlay className="motion-overlay fixed inset-0 z-50" />
        <D.Content
          aria-describedby={undefined}
          aria-modal="true"
          onOpenAutoFocus={() => {
            // Runs before focus moves in, so activeElement is still where the user was.
            returnTo.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
          }}
          onCloseAutoFocus={(e) => {
            const target = returnTo.current;
            returnTo.current = null;
            if (target && target.isConnected) { e.preventDefault(); target.focus(); }
          }}
          className={cn(
            'motion-portal motion-dialog', commandPaletteSurfaceClass,
            'fixed z-50 flex flex-col',
            'inset-0 h-dvh w-full rounded-none', // phones: full screen
            'sm:inset-auto sm:left-1/2 sm:top-[12vh] sm:h-(--cp-height) sm:max-h-[76vh] sm:w-(--cp-width) sm:max-w-[calc(100vw-48px)] sm:-translate-x-1/2 sm:rounded-[20px]',
          )}
          style={size}
        >
          <D.Title className="sr-only">{title}</D.Title>
          <CommandPalette
            preview={preview}
            className="min-h-0 flex-1"
            // Close first, then run the command: a command may open another dialog, and the close must not undo that.
            onSelect={(it) => { set(false); onSelect?.(it); }}
            headerEnd={(
              // Phones have no Escape key: a visible way out.
              <D.Close className="mr-2 flex h-8 shrink-0 cursor-pointer items-center rounded-n-md px-2 text-[14px] text-n-text-primary outline-none hover:bg-n-button-hover-bg-a focus-visible:shadow-n-focus-shadow sm:hidden">
                Cancel
              </D.Close>
            )}
            {...props}
          />
        </D.Content>
      </ThemePortal>
    </D.Root>
  );
}
