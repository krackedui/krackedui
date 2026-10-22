import {
  Children, createContext, forwardRef, isValidElement, useContext, useId, useLayoutEffect, useRef, useState,
  type AnchorHTMLAttributes, type ButtonHTMLAttributes, type HTMLAttributes, type KeyboardEvent, type MouseEvent,
  type ReactElement, type ReactNode,
} from 'react';
import { Slot } from 'radix-ui';
import { cn } from '../lib/cn';
import { tv } from '../lib/tv';
import { Icon, iconNames, type IconName } from '../icons/Icon';
import { ShellGlyph, type ShellGlyphName } from './glyphs';
import { Kbd } from '../atoms/Kbd';
import { Avatar } from '../atoms/Avatar';
import { PageIcon } from '../atoms/PageIcon';
import { useOptionalAppFrame, type SidebarPlacement } from './AppFrame';
import { useCollapse } from './hooks';
import { ResizeHandle } from './ResizeHandle';

/* -------------------------------------------------------------------------------------------------
 * Left sidebar.
 *  nav        270 wide (resizable 200–480), bg-secondary, right hairline, z 111
 *  header     search row 44 (pad 6 12) + tab row 44 (pad 6 12 6 8)
 *  scroller   pad-top 6, inner column gap 12, pad 0 8
 *  row        30 tall, radius 6, pad 4 8 (tree rows 5 8), 14/21, icon box 22 + 8 gap
 *  section    header 30 (12/16 text-tertiary), column gap 1, margin-bottom 12; sections gap 4
 *  footer     pinned under the scroller; bottom bar 44, pad 0 8, gap 2, border-top
 * In an AppFrame the same sidebar renders docked, floating (collapsed hover-peek) or in the phone drawer.
 * -----------------------------------------------------------------------------------------------*/

export const sidebarStyles = tv({
  slots: {
    root: [
      'group/sidebar relative flex h-full shrink-0 flex-col bg-n-bg-secondary text-n-text-primary',
      'shadow-[inset_-1px_0_0_0_var(--n-border-secondary)] text-[14px] leading-6',
    ],
    scroller: 'relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden pt-1.5 font-medium text-n-text-accent-primary',
    scrollInner: 'flex min-h-full flex-col gap-3 px-2',
    row: [
      'group/row relative flex min-h-[30px] w-full min-w-0 select-none items-center rounded-n-md',
      'text-left text-[14px] leading-[21px] font-normal transition-[background] duration-[20ms] ease-in',
      'hover:bg-n-bg-interactive-translucent-a has-[>[data-sidebar-control]:focus-visible]:shadow-n-focus-shadow',
      'pointer-coarse:min-h-11',
    ],
    rowControl: [
      'flex min-h-[30px] min-w-0 flex-1 cursor-pointer items-center self-stretch rounded-n-md px-2 py-1 text-left text-inherit no-underline',
      'outline-none focus-visible:shadow-none',
    ],
    rowIcon: 'mr-2 flex size-[22px] shrink-0 items-center justify-center rounded-n-sm',
    rowLabel: 'min-w-0 flex-1 truncate',
    rowTrailing: 'ml-auto flex shrink-0 items-center pl-1 pr-2 text-[12px] text-n-text-tertiary',
    rowActions: 'flex shrink-0 items-center gap-0.5 pr-2 pl-[3px] opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 pointer-coarse:opacity-100',
    action: [
      'flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-n-sm text-n-icon-secondary',
      'hover:bg-n-button-hover-bg-a active:bg-n-button-pressed-bg-a pointer-coarse:size-6',
    ],
  },
  variants: {
    tone: {
      default: { rowIcon: 'text-n-icon-secondary' },
      muted: { row: 'text-n-text-tertiary', rowIcon: 'text-n-icon-tertiary' },
      // secondary: text-secondary (AA); the captured sidebar-secondary-color is 3:1 on the sidebar background
      secondary: { row: 'text-n-text-secondary', rowIcon: 'text-n-icon-secondary' },
    },
    active: { true: { row: 'bg-n-bg-interactive-translucent-a text-n-text-primary' } },
  },
  defaultVariants: { tone: 'default' },
});
const s = sidebarStyles();

/* ---------------------------------------------- Root ---------------------------------------------- */

const SidebarCtx = createContext<{ placement: SidebarPlacement; close: (() => void) | undefined }>({ placement: 'docked', close: undefined });

export interface SidebarRootProps extends HTMLAttributes<HTMLElement> {
  /** Width in px (default 270). Controlled when `onWidthChange` is given. Ignored in the phone drawer (full width). */
  width?: number;
  onWidthChange?: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
  /** Top region: `<Sidebar.Search/>` + `<Sidebar.Tabs/>`. Same as a `<Sidebar.Header>` child. */
  header?: ReactNode;
  /** Region between scroller and bottom bar, e.g. `<Sidebar.InviteCard/>`. Same as a `<Sidebar.Footer>` child. */
  footer?: ReactNode;
  /** The 44px bottom bar: `<Sidebar.BottomBar/>`. */
  bottomBar?: ReactNode;
  /** Render as the floating hover-peek. Inside an AppFrame this is set for you. */
  floating?: boolean;
  /** Click on the resize handle collapses the sidebar. Inside an AppFrame it collapses the frame's sidebar. */
  onCollapse?: () => void;
  /** Accessible name of the navigation landmark (default "Sidebar"). */
  label?: string;
}

const isPart = (node: ReactNode, part: unknown): node is ReactElement => isValidElement(node) && node.type === part;

/**
 * App navigation: header, scrolling content (items, sections, page tree), footer and bottom bar, with
 * a resize handle on the right edge (drag or arrow keys 200–480, click to collapse). Use it as the
 * `sidebar` of an `AppFrame`; outside one it renders as a plain docked column.
 */
const Root = forwardRef<HTMLElement, SidebarRootProps>(function SidebarRoot(
  { width = 270, onWidthChange, minWidth = 200, maxWidth = 480, header, footer, bottomBar, floating, onCollapse, label = 'Sidebar', className, style, children, ...props },
  ref,
) {
  const frame = useOptionalAppFrame();
  const placement: SidebarPlacement = floating ? 'floating' : frame?.placement ?? 'docked';
  const collapse = onCollapse ?? (frame ? () => frame.setSidebarOpen(false) : undefined);
  const close = placement === 'drawer' && frame ? () => frame.setSidebarOpen(false) : undefined;
  const [w, setW] = useState(width);
  const cur = onWidthChange ? width : w;
  const setWidth = (v: number) => { if (onWidthChange) onWidthChange(v); else setW(v); };

  const headers: ReactNode[] = [];
  const footers: ReactNode[] = [];
  const body: ReactNode[] = [];
  Children.forEach(children, (child) => {
    if (isPart(child, Header)) headers.push(child);
    else if (isPart(child, Footer)) footers.push(child);
    else body.push(child);
  });

  return (
    <SidebarCtx.Provider value={{ placement, close }}>
      <nav
        ref={ref}
        aria-label={label}
        data-placement={placement}
        className={cn(
          s.root(),
          'z-[111]',
          placement === 'floating' && 'rounded-r-n-lg shadow-n-shadow-outline-lg',
          placement === 'drawer' && 'w-full shadow-none',
          className,
        )}
        style={placement === 'drawer' ? style : { width: cur, ...style }}
        {...props}
      >
        {header && <div className="shrink-0">{header}</div>}
        {headers}
        <div className={s.scroller()}>
          <div className={s.scrollInner()}>{body}</div>
        </div>
        {footer && <div className="shrink-0 px-2 pb-2">{footer}</div>}
        {footers}
        {bottomBar}
        {placement === 'docked' && (
          <ResizeHandle label="Sidebar width" edge="right" value={cur} min={minWidth} max={maxWidth} onResize={setWidth} onActivate={collapse} className="right-[-11px]" />
        )}
      </nav>
    </SidebarCtx.Provider>
  );
});

/* ------------------------------------------ Header / Footer ---------------------------------------- */

/** Pinned top region of `Sidebar.Root` (workspace switcher, search, tabs). Does not scroll. */
const Header = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function SidebarHeader({ className, ...props }, ref) {
  return <div ref={ref} className={cn('flex shrink-0 flex-col gap-0.5 px-2 pt-1.5', className)} {...props} />;
});

/** Pinned bottom region of `Sidebar.Root` (account, settings, help). Does not scroll. */
const Footer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function SidebarFooter({ className, ...props }, ref) {
  return <div ref={ref} className={cn('flex shrink-0 flex-col gap-px border-t border-n-border-secondary px-2 py-1.5', className)} {...props} />;
});

/* -------------------------------------------- Search / Tabs ---------------------------------------- */

export interface SidebarSearchProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  shortcut?: string;
}
/** "Search or ask ⌘K" button that opens your search/command palette: 32px, radius 8, hairline border. */
const Search = forwardRef<HTMLButtonElement, SidebarSearchProps>(function SidebarSearch(
  { label = 'Search or ask', shortcut = '⌘K', className, ...props }, ref,
) {
  return (
    <div className="px-3 py-1.5">
      <button
        ref={ref}
        type="button"
        aria-label={label}
        aria-keyshortcuts={shortcut === '⌘K' ? 'Meta+K' : undefined}
        className={cn(
          'flex h-8 w-full cursor-pointer items-center rounded-n-lg border border-n-border-primary-translucent-a pl-2 pr-1.5',
          'text-[14px] leading-[16.8px] text-n-text-tertiary whitespace-nowrap transition-[background] duration-[20ms]',
          'hover:bg-n-button-hover-bg-a',
          className,
        )}
        {...props}
      >
        <span className="truncate">{label}</span>
        {/* text-primary: the secondary grey on the key chip over the sidebar's bg-secondary is 4.39:1 (< AA) */}
        {shortcut && <Kbd className="ml-auto text-n-text-primary">{shortcut}</Kbd>}
      </button>
    </div>
  );
});

export interface SidebarTab { id: string; label: string; icon: ShellGlyphName | IconName }
export interface SidebarTabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs?: SidebarTab[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  /** Right side of the tab row; by default a "«" collapse button revealed on sidebar hover. */
  trailing?: ReactNode;
  /** Collapse handler for the default "«" button. Inside an AppFrame it defaults to collapsing the frame's sidebar. */
  onCollapse?: () => void;
}
const defaultTabs: SidebarTab[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'chat', label: 'Chat', icon: 'chat' },
  { id: 'meetings', label: 'Meetings', icon: 'calendar' },
];
const glyphs = new Set<string>(['home', 'chat', 'calendar']);

/**
 * Icon tabs at the top of the sidebar (Home / Chat / Meetings). The active tab expands to show its label.
 * Arrow keys move between tabs (automatic activation).
 */
const Tabs = forwardRef<HTMLDivElement, SidebarTabsProps>(function SidebarTabs(
  { tabs = defaultTabs, value, defaultValue, onValueChange, trailing, onCollapse, className, ...props }, ref,
) {
  const frame = useOptionalAppFrame();
  const { placement } = useContext(SidebarCtx);
  const [inner, setInner] = useState(defaultValue ?? tabs[0]?.id);
  const cur = value ?? inner;
  const select = (id: string) => { setInner(id); onValueChange?.(id); };
  const collapse = onCollapse ?? (frame && placement === 'docked' ? () => frame.setSidebarOpen(false) : undefined);
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = tabs.findIndex((t) => t.id === cur);
    const next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const t = tabs[(next + tabs.length) % tabs.length];
    select(t.id);
    e.currentTarget.parentElement?.querySelector<HTMLElement>(`[data-tab-id="${t.id}"]`)?.focus();
  };
  return (
    <div ref={ref} className={cn('flex h-11 items-center gap-0.5 py-1.5 pl-2 pr-3', className)} {...props}>
      <div role="tablist" aria-label="Sidebar sections" className="flex min-w-0 pl-[3px]">
        {tabs.map((t) => {
          const active = t.id === cur;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              data-tab-id={t.id}
              aria-selected={active}
              aria-label={t.label}
              tabIndex={active ? 0 : -1}
              onClick={() => select(t.id)}
              onKeyDown={onTabKey}
              className={cn(
                'flex h-8 min-w-0 cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap rounded-n-lg',
                'text-[14px] font-medium leading-[16.8px] transition-[padding,margin,background] duration-200 ease-out motion-reduce:transition-none',
                active ? 'mr-1 bg-n-bg-interactive-translucent-a pl-[5px] text-n-text-primary' : 'px-[5px] text-n-text-secondary hover:bg-n-button-hover-bg-a',
              )}
            >
              <span className={cn('flex size-[22px] items-center justify-center text-n-text-accent-primary', !active && 'opacity-50')}>
                {glyphs.has(t.icon) ? <ShellGlyph name={t.icon as ShellGlyphName} /> : <Icon name={t.icon as IconName} size={20} />}
              </span>
              <span className="grid min-w-0 overflow-hidden transition-[grid-template-columns] duration-200 ease-out motion-reduce:transition-none" style={{ gridTemplateColumns: active ? '1fr' : '0fr' }}>
                <span className={cn('min-w-0 overflow-hidden', active && 'pr-2')}>
                  <span className="pl-1.5">{t.label}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="ml-auto flex items-center">
        {trailing ?? (collapse && (
          <button
            type="button"
            aria-label="Close sidebar"
            aria-keyshortcuts="Meta+Backslash"
            title="Close sidebar  ⌘\"
            onClick={collapse}
            className="flex size-7 cursor-pointer items-center justify-center rounded-n-md text-n-icon-secondary opacity-0 transition-opacity group-hover/sidebar:opacity-100 hover:bg-n-button-hover-bg-a focus-visible:opacity-100 pointer-coarse:opacity-100"
          >
            <Icon name="arrowChevronDoubleForward" size={20} className="-scale-x-100" />
          </button>
        ))}
      </div>
    </div>
  );
});

/* ---------------------------------------------- Rows ---------------------------------------------- */

const knownIcons = new Set<string>(iconNames);
/** Sidebar.Item icon: an icon name (autocompleted), another short string such as an emoji, or an element. */
type ItemIcon = IconName | (string & {}) | ReactElement;
function renderIcon(icon: ItemIcon, size = 22) {
  if (typeof icon === 'string') return knownIcons.has(icon) ? <Icon name={icon as IconName} size={size} /> : <span aria-hidden>{icon}</span>;
  return icon;
}

type ItemElementProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement> & ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'>;
export interface SidebarItemProps extends ItemElementProps {
  /** Icon name, emoji or other short text, or an element (20–22px box). */
  icon?: ItemIcon;
  iconSize?: number;
  children?: ReactNode;
  tone?: 'default' | 'muted' | 'secondary';
  /** Current page: highlighted and `aria-current="page"`. */
  active?: boolean;
  /** Renders a link (`<a href>`); without it the item is a `<button>`. */
  href?: string;
  /** Render the given child element (e.g. a router `<Link>`) as the item's control. */
  asChild?: boolean;
  /** Right-side content always visible (count, badge, shortcut). */
  trailing?: ReactNode;
  /** Hover actions on the right (e.g. `<Sidebar.Action icon="ellipsisSmall" label="…"/>`). */
  actions?: ReactNode;
  /** Class for the row container (the item's `className` goes there too). */
  rowClassName?: string;
}
/**
 * A sidebar navigation row: a link (`href`) or button with an icon, label, optional trailing content and
 * hover actions. `active` marks the current page. In the phone drawer, activating it closes the drawer.
 */
const Item = forwardRef<HTMLElement, SidebarItemProps>(function SidebarItem(
  { icon, iconSize = 22, children, tone, active, href, asChild, trailing, actions, className, rowClassName, onClick, ...props }, ref,
) {
  const { close } = useContext(SidebarCtx);
  const st = sidebarStyles({ tone, active });
  const handleClick = (e: MouseEvent<HTMLAnchorElement & HTMLButtonElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented) close?.();
  };
  const content = (
    <>
      {icon !== undefined && <span className={st.rowIcon()} aria-hidden>{renderIcon(icon, iconSize)}</span>}
      <span className={st.rowLabel()}>{children}</span>
    </>
  );
  const shared = {
    'data-sidebar-control': '',
    'aria-current': active ? ('page' as const) : undefined,
    onClick: handleClick,
    className: st.rowControl(),
    ...props,
  };
  let control: ReactNode;
  if (asChild) {
    control = <Slot.Root ref={ref} {...shared}>{children}</Slot.Root>;
  } else if (href !== undefined) {
    control = <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} {...shared}>{content}</a>;
  } else {
    control = <button ref={ref as React.Ref<HTMLButtonElement>} type="button" {...shared}>{content}</button>;
  }
  return (
    <div className={cn(st.row(), className, rowClassName)} data-active={active ? '' : undefined}>
      {control}
      {trailing !== undefined && <span className={st.rowTrailing()}>{trailing}</span>}
      {actions && <div className={st.rowActions()}>{actions}</div>}
    </div>
  );
});

export interface SidebarActionProps extends ButtonHTMLAttributes<HTMLButtonElement> { icon: IconName; label: string }
/** 20x20 icon button inside a row or section header (radius 4, 16px icon); 24px on touch screens. */
const Action = forwardRef<HTMLButtonElement, SidebarActionProps>(function SidebarAction({ icon, label, className, ...props }, ref) {
  return (
    <button ref={ref} type="button" aria-label={label} title={label} className={cn(s.action(), className)} {...props}>
      <Icon name={icon} size={16} />
    </button>
  );
});

/** Column of rows with 1px gap (quick items). */
function Group({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-px', className)} {...props} />;
}

/** Wrapper for consecutive sections (gap 4). */
function Sections({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1', className)} {...props} />;
}

/* -------------------------------------------- Section --------------------------------------------- */

export interface SidebarSectionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Section heading. With a title the section can be collapsed (click the heading). */
  title?: ReactNode;
  /** Header hover actions (e.g. "…" section options, "+" add page). */
  actions?: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
/**
 * A titled group of sidebar items ("Favorites", "Private"). The 30px heading (12/16 tertiary) toggles the
 * content with an animated height; hover reveals the chevron and header actions.
 */
const Section = forwardRef<HTMLDivElement, SidebarSectionProps>(function SidebarSection(
  { title, actions, defaultOpen = true, open, onOpenChange, className, children, ...props }, ref,
) {
  const [inner, setInner] = useState(defaultOpen);
  const isOpen = title === undefined ? true : open ?? inner;
  const toggle = () => { setInner(!isOpen); onOpenChange?.(!isOpen); };
  const titleId = useId();
  const contentId = useId();
  const c = useCollapse(isOpen);
  return (
    <div ref={ref} role="group" aria-labelledby={title !== undefined ? titleId : undefined} className={cn('mb-3 flex flex-col gap-px', className)} {...props}>
      {title !== undefined && (
        <div className="group/sec flex h-[30px] items-center rounded-n-md transition-[background] duration-[20ms] hover:bg-n-bg-interactive-translucent-a has-[>button:focus-visible]:shadow-n-focus-shadow pointer-coarse:h-9">
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls={contentId}
            onClick={toggle}
            className="flex h-full min-w-0 flex-1 cursor-pointer select-none items-center gap-1 rounded-n-md px-2 text-left outline-none focus-visible:shadow-none"
          >
            <span id={titleId} className="truncate text-[12px] leading-4 text-n-text-tertiary">{title}</span>
            <Icon
              name="arrowChevronSingleDownFillSmall"
              size={12}
              className={cn('text-n-icon-tertiary opacity-0 transition-[opacity,transform] duration-200 motion-reduce:transition-none group-hover/sec:opacity-100 group-focus-within/sec:opacity-100', !isOpen && '-rotate-90')}
            />
          </button>
          {actions && (
            <div className="flex items-center gap-0.5 pr-2 opacity-0 group-hover/sec:opacity-100 group-focus-within/sec:opacity-100 pointer-coarse:opacity-100">
              {actions}
            </div>
          )}
        </div>
      )}
      <div
        ref={c.ref}
        id={contentId}
        className="motion-shell-collapse grid"
        style={{ gridTemplateRows: c.expanded ? '1fr' : '0fr' }}
        onTransitionEnd={c.onTransitionEnd}
        inert={!isOpen}
        hidden={!c.mounted}
      >
        <div className="flex min-h-0 flex-col gap-px overflow-hidden">{c.mounted && children}</div>
      </div>
    </div>
  );
});

/* ---------------------------------------------- Tree ---------------------------------------------- */

interface TreeCtxValue {
  tabStop: string | null;
  setTabStop: (id: string) => void;
  /** Tree-level keys from a focused item: ↑/↓/Home/End, → into the first child, ← to the parent. */
  navigate: (e: KeyboardEvent<HTMLElement>) => void;
}
const TreeCtx = createContext<TreeCtxValue | null>(null);
const DepthCtx = createContext(0);

const treeItems = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLElement>('[role="treeitem"]:not([aria-disabled="true"])')].filter((el) => !el.closest('[inert]'));

/**
 * `role="tree"` container for page items. One tab stop; ↑/↓ move, → expands or enters, ← collapses or
 * goes to the parent, Home/End jump, Enter opens the page.
 */
const Tree = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { label?: string }>(function SidebarTree(
  { className, label, children, ...props }, ref,
) {
  const local = useRef<HTMLDivElement | null>(null);
  const [tabStop, setTabStop] = useState<string | null>(null);
  // Pick the tab stop when the items change: keep the current one, else the selected item, else the first.
  useLayoutEffect(() => {
    const root = local.current;
    if (!root) return;
    const items = treeItems(root);
    if (tabStop && items.some((el) => el.dataset.treeId === tabStop)) return;
    const first = items.find((el) => el.getAttribute('aria-selected') === 'true') ?? items[0];
    if (first?.dataset.treeId) setTabStop(first.dataset.treeId);
  }, [tabStop, children]);
  const navigate = (e: KeyboardEvent<HTMLElement>) => {
    const root = local.current;
    const current = e.currentTarget;
    if (!root || e.target !== current || e.defaultPrevented) return;
    const items = treeItems(root);
    const i = items.indexOf(current);
    let next: HTMLElement | undefined;
    if (e.key === 'ArrowDown') next = items[i + 1];
    else if (e.key === 'ArrowUp') next = items[i - 1];
    else if (e.key === 'Home') next = items[0];
    else if (e.key === 'End') next = items[items.length - 1];
    else if (e.key === 'ArrowRight' && current.getAttribute('aria-expanded') === 'true') {
      const child = items[i + 1];
      if (child && Number(child.getAttribute('aria-level')) > Number(current.getAttribute('aria-level'))) next = child;
    } else if (e.key === 'ArrowLeft' && current.getAttribute('aria-expanded') !== 'true') {
      next = current.parentElement?.closest<HTMLElement>('[role="treeitem"]') ?? undefined;
    }
    if (next) { e.preventDefault(); next.focus(); }
  };
  return (
    <TreeCtx.Provider value={{ tabStop, setTabStop, navigate }}>
      <div
        ref={(el) => { local.current = el; if (typeof ref === 'function') ref(el); else if (ref) ref.current = el; }}
        role="tree"
        aria-label={label}
        className={cn('flex flex-col gap-px', className)}
        {...props}
      >
        {children}
      </div>
    </TreeCtx.Provider>
  );
});

export interface SidebarTreeItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect'> {
  label: ReactNode;
  /** Icon name (default "page") or an element; use `emoji` for an emoji. */
  icon?: IconName | ReactElement;
  emoji?: string;
  active?: boolean;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Nested `Sidebar.TreeItem`s. When expanded with none, shows "No pages inside". */
  children?: ReactNode;
  emptyLabel?: ReactNode;
  onSelect?: () => void;
  /** Shows the hover "+" action (opt-in). */
  onAdd?: () => void;
  /** Label of the "+" action. Default "Add a page inside". */
  addLabel?: string;
  /** Shows the hover "…" action (opt-in); or pass `moreSlot`, e.g. a Menu trigger. */
  onMore?: (e: MouseEvent<HTMLButtonElement>) => void;
  /** Label of the "…" action. Default "Delete, duplicate, and more…". */
  moreLabel?: string;
  /** Your own "…" control (e.g. a `Menu.Trigger` around `<Sidebar.Action/>`); shows the actions area. */
  moreSlot?: ReactNode;
}
/**
 * Page row in a `Sidebar.Tree` (`role="treeitem"`). 30px, +8px indent per level. Hover or focus shows
 * the expand chevron in place of the icon and "+" / "…" actions; children expand with an animated height.
 */
const TreeItem = forwardRef<HTMLDivElement, SidebarTreeItemProps>(function SidebarTreeItem(
  { label, icon = 'page', emoji, active, defaultExpanded = false, expanded, onExpandedChange, children, emptyLabel = 'No pages inside', onSelect, onAdd, addLabel = 'Add a page inside', onMore, moreLabel = 'Delete, duplicate, and more…', moreSlot, className, onKeyDown, onFocus, ...props },
  ref,
) {
  const depth = useContext(DepthCtx);
  const tree = useContext(TreeCtx);
  const { close } = useContext(SidebarCtx);
  const id = useId();
  const labelId = `${id}-label`;
  const [inner, setInner] = useState(defaultExpanded);
  const isOpen = expanded ?? inner;
  const setOpen = (v: boolean) => { setInner(v); onExpandedChange?.(v); };
  const select = () => { onSelect?.(); close?.(); };
  const hasChildren = Children.toArray(children).some(Boolean);
  const isTabStop = tree ? tree.tabStop === id : true;
  const pad = 8 + depth * 8;
  const c = useCollapse(isOpen);
  const iconNode = emoji
    ? <PageIcon emoji={emoji} size={20} aria-hidden />
    : icon === 'page'
      ? <span className="motion-record-icon flex size-5 items-center justify-center text-n-sidebar-secondary-color"><Icon name="page" size={18} /></span>
      : typeof icon === 'string' ? <PageIcon icon={icon} size={20} aria-hidden /> : icon;

  return (
    <div
      ref={ref}
      role="treeitem"
      data-tree-id={id}
      tabIndex={isTabStop ? 0 : -1}
      aria-level={depth + 1}
      aria-expanded={isOpen}
      aria-selected={!!active}
      aria-current={active ? 'page' : undefined}
      aria-labelledby={labelId}
      onFocus={(e) => { if (e.target === e.currentTarget) tree?.setTabStop(id); onFocus?.(e); }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.target !== e.currentTarget || e.defaultPrevented) return;
        if (e.key === 'Enter') { e.preventDefault(); select(); }
        else if (e.key === 'ArrowRight' && !isOpen) { e.preventDefault(); setOpen(true); }
        else if (e.key === 'ArrowLeft' && isOpen) { e.preventDefault(); setOpen(false); }
        else tree?.navigate(e);
      }}
      onClick={(e) => {
        // A click on this item's row (not on a nested item, its buttons, or portalled menu content) opens the page.
        const target = e.target as Element;
        if (target.closest('[role="treeitem"]') === e.currentTarget && !target.closest('button, a, input')) select();
      }}
      className={cn('group/ti flex flex-col gap-px outline-none focus-visible:shadow-none [&:focus-visible>[data-tree-row]]:shadow-n-focus-shadow', className)}
      {...props}
    >
      <div
        data-tree-row=""
        className={cn(
          'group/row flex h-[30px] cursor-pointer select-none items-center rounded-n-md py-[5px] pr-2 text-[14px] leading-[21px] font-normal pointer-coarse:h-11',
          'transition-[background] duration-[20ms] ease-in hover:bg-n-bg-interactive-translucent-a',
          active && 'bg-n-bg-interactive-translucent-a text-n-text-primary',
        )}
        style={{ paddingLeft: pad }}
      >
        <div className="relative mr-2 flex h-[18px] w-[22px] shrink-0 items-center justify-center">
          <div aria-hidden className="flex size-5 items-center justify-center rounded-[3.5px] group-hover/row:opacity-0">{iconNode}</div>
          <button
            type="button"
            tabIndex={-1}
            aria-label={isOpen ? 'Collapse' : 'Expand'}
            onClick={(e) => { e.stopPropagation(); setOpen(!isOpen); }}
            className="absolute left-px top-[-1px] hidden size-5 cursor-pointer items-center justify-center rounded-n-sm text-n-icon-secondary hover:bg-n-button-hover-bg-a group-hover/row:flex"
          >
            <Icon name="arrowChevronSingleDownFillSmall" size={12} className={cn('transition-transform duration-200 motion-reduce:transition-none', !isOpen && '-rotate-90')} />
          </button>
        </div>
        <div id={labelId} className="min-w-0 flex-1 truncate">{label}</div>
        {(onAdd || onMore || moreSlot) && (
          <div className="flex shrink-0 items-center gap-0.5 pl-[3px] opacity-0 group-hover/row:opacity-100 group-focus-within/ti:opacity-100 pointer-coarse:opacity-100">
            {onAdd && <Action icon="plusSmall" label={addLabel} onClick={onAdd} tabIndex={isTabStop ? 0 : -1} />}
            {moreSlot ?? (onMore && <Action icon="ellipsisSmall" label={moreLabel} onClick={onMore} tabIndex={isTabStop ? 0 : -1} className="motion-sidebar-page-menu" />)}
          </div>
        )}
      </div>
      <div
        ref={c.ref}
        role="group"
        className="motion-shell-collapse grid"
        style={{ gridTemplateRows: c.expanded ? '1fr' : '0fr' }}
        onTransitionEnd={c.onTransitionEnd}
        inert={!isOpen}
        hidden={!c.mounted}
      >
        <div className="flex min-h-0 flex-col gap-px overflow-hidden">
          {c.mounted && (
            <DepthCtx.Provider value={depth + 1}>
              {hasChildren ? children : (
                <div role="treeitem" aria-disabled="true" aria-level={depth + 2} aria-selected={false} className="mt-px flex h-[30px] items-center py-[5px] pr-2 text-[14px] font-normal leading-[21px]" style={{ paddingLeft: pad + 8 }}>
                  <div className="truncate pl-4 text-n-text-tertiary">{emptyLabel}</div>
                </div>
              )}
            </DepthCtx.Provider>
          )}
        </div>
      </div>
    </div>
  );
});

/* --------------------------------------------- Footer --------------------------------------------- */

/** Pushes its content to the bottom of the scroller ("Customize sidebar"). Pad-bottom 8. */
function ScrollFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-auto flex flex-col gap-px pb-2', className)} {...props} />;
}

export interface SidebarInviteCardProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  icon?: IconName;
  onDismiss?: () => void;
}
/** Dismissible promo card above the bottom bar ("Invite members"). The card is a button; X dismisses it. */
const InviteCard = forwardRef<HTMLButtonElement, SidebarInviteCardProps>(function SidebarInviteCard(
  { title = 'Invite members', description = 'Collaborate with your team.', icon = 'inviteMember', onDismiss, className, ...props }, ref,
) {
  const [shown, setShown] = useState(true);
  if (!shown) return null;
  return (
    <div className="relative m-2">
      <button
        ref={ref}
        type="button"
        className={cn('block w-full cursor-pointer focus-visible:shadow-n-focus-shadow overflow-hidden rounded-n-lg bg-n-bg-secondary p-2 text-left shadow-n-shadow-outline-sm backdrop-blur-[30px] hover:bg-n-bg-interactive', className)}
        {...props}
      >
        <span className="flex">
          <span aria-hidden className="flex size-6 shrink-0 items-center justify-center"><Icon name={icon} size={20} /></span>
          <span className="flex min-w-0 flex-col gap-1 px-2 pb-1 pt-1">
            <span className="pr-6 text-[12px] font-semibold leading-4">{title}</span>
            <span className="text-[12px] leading-4 text-n-text-secondary">{description}</span>
          </span>
        </span>
      </button>
      <div className="absolute right-2 top-2 z-[1] flex h-6 items-center">
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => { setShown(false); onDismiss?.(); }}
          className="flex size-5 cursor-pointer items-center justify-center rounded-n-sm text-n-icon-secondary hover:bg-n-button-hover-bg-a pointer-coarse:size-6"
        >
          <Icon name="xMarkSmall" size={14} />
        </button>
      </div>
    </div>
  );
});

/* ------------------------------------------- Bottom bar ------------------------------------------- */

/** 44px bottom bar: pad 0 8, gap 2, border-top border-secondary. */
function BottomBar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex h-11 shrink-0 items-center gap-0.5 border-t border-n-border-secondary px-2', className)} {...props} />;
}

export interface WorkspaceSwitcherProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  name: string;
  /** Letter avatar (defaults to first letter) or a custom node. */
  avatar?: ReactNode;
}
/** Workspace switcher button (avatar, name, chevron); usually the trigger of a `WorkspaceMenu`. */
const WorkspaceSwitcher = forwardRef<HTMLButtonElement, WorkspaceSwitcherProps>(function WorkspaceSwitcher(
  { name, avatar, className, ...props }, ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'motion-sidebar-switcher flex h-7 min-w-0 flex-1 cursor-pointer items-center overflow-hidden rounded-n-md px-2 text-left',
        'text-[14px] leading-[21px] text-n-text-accent-primary transition-[background] duration-[20ms]',
        'hover:bg-n-bg-interactive-translucent-a data-[state=open]:bg-n-bg-interactive-translucent-a',
        className,
      )}
      {...props}
    >
      <span aria-hidden className="mr-2 flex size-[22px] shrink-0 items-center justify-center">
        {avatar ?? <Avatar name={name} size={20} shape="workspace" className="font-medium" />}
      </span>
      <span className="mr-1.5 min-w-0 truncate font-medium leading-5">{name}</span>
      <Icon name="arrowChevronSingleDown" size={14} className="ml-auto text-n-icon-secondary" />
    </button>
  );
});

export interface BarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { icon: IconName; label: string; dot?: boolean }
/** 28x28 bottom-bar icon button (radius 6, 20px icon); `dot` = blue unread dot. */
const BarButton = forwardRef<HTMLButtonElement, BarButtonProps>(function SidebarBarButton({ icon, label, dot, className, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn('relative flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-n-md text-n-icon-secondary hover:bg-n-button-hover-bg-a data-[state=open]:bg-n-button-hover-bg-a', className)}
      {...props}
    >
      <Icon name={icon} size={20} />
      {dot && <span aria-hidden className="absolute right-[3px] top-[3px] size-1.5 rounded-full bg-n-blue-icon-accent-primary shadow-[0_0_0_1.5px_var(--n-bg-secondary)]" />}
    </button>
  );
});

/* ---------------------------------------------- Export -------------------------------------------- */

/** True inside the floating hover-peek copy of the sidebar (collapsed AppFrame). */
export function useSidebarFloating() { return useContext(SidebarCtx).placement === 'floating'; }
/** Where the surrounding `Sidebar.Root` is rendered: docked, floating hover-peek, or the phone drawer. */
export function useSidebarPlacement(): SidebarPlacement { return useContext(SidebarCtx).placement; }

/**
 * App navigation. Contract parts: `Root`, `Header`, `Section`, `Item`, `Footer`; Motion extras: `Search`,
 * `Tabs`, `Tree`/`TreeItem` (page tree), `Group`, `Sections`, `Action`, `ScrollFooter`, `InviteCard`,
 * `BottomBar`, `WorkspaceSwitcher`, `BarButton`.
 */
export const Sidebar = {
  Root, Header, Footer, Search, Tabs, Item, Action, Group, Sections, Section, Tree, TreeItem,
  ScrollFooter, InviteCard, BottomBar, WorkspaceSwitcher, BarButton,
};
