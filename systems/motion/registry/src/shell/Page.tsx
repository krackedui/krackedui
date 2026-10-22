import {
  createContext, forwardRef, useContext, useEffect, useId, useRef, useState,
  type HTMLAttributes, type ReactNode,
} from 'react';
import { cn } from '../lib/cn';
import { useScrollRegion } from '../blocks/scrollRegion';
import { Icon, type IconName } from '../icons/Icon';

/* -------------------------------------------------------------------------------------------------
 * Page frame, cover, header and table-of-contents rail. Measured (capture/states/app, page-header,
 * page-scroll-1..3; frame 1440x993 at 270,44):
 *  frame     main.motion-frame bg-primary; scroller centred column, bottom padding 30vh
 *  columns   default: minmax(96px,1fr) | minmax(auto,720px) | minmax(96px,1fr)  (720 content, 360 gutters @1440)
 *            full width: 96px | 1fr | 96px
 *  cover     full row, height 30vh capped at 280, object-fit cover, object-position center 28%
 *  controls  pad 16 0 4, margin-left -1, text-tertiary; buttons 28 tall, pad 0 8, gap 6, 14px icon, 14/16.8
 *  title     40/48 700, pad 0 8 ("New page" placeholder); page content starts 8px below
 *  icon      78px emoji/record icon, pulled 42px up into the cover when there is one
 *  rail      right edge (48x56 box, pad-left 20), marks 2px tall, gap 12, widths 16/12/8 by level;
 *            active palette-gray-800, others border-primary-translucent (dark: border-strong-translucent + glow);
 *            sits cover+66 below the frame top and sticks at 130 while scrolling
 * -----------------------------------------------------------------------------------------------*/

interface LayoutCtx { hasCover: boolean; hasIcon: boolean; fullWidth: boolean; variant: 'document' | 'app' }
const PageCtx = createContext<LayoutCtx>({ hasCover: false, hasIcon: false, fullWidth: false, variant: 'document' });

/** Page grid columns at ≥ 768px (720 content column between 96px gutters). */
export const PAGE_COLUMNS = {
  default: 'minmax(96px,1fr) minmax(auto,720px) minmax(96px,1fr)',
  full: '96px minmax(0,1fr) 96px',
} as const;
/** Responsive page grid: 16px gutters on phones, 48px on tablets, `PAGE_COLUMNS` from 1024px. */
const PAGE_GRID = {
  default: 'grid-cols-[16px_minmax(0,1fr)_16px] sm:grid-cols-[48px_minmax(0,1fr)_48px] lg:grid-cols-[minmax(96px,1fr)_minmax(auto,720px)_minmax(96px,1fr)]',
  full: 'grid-cols-[16px_minmax(0,1fr)_16px] sm:grid-cols-[48px_minmax(0,1fr)_48px] lg:grid-cols-[96px_minmax(0,1fr)_96px]',
  /** App screens (dashboards, tables): 16 / 24 / 32px gutters, content up to 1200px, centered. */
  app: 'grid-cols-[16px_minmax(0,1fr)_16px] sm:grid-cols-[24px_minmax(0,1fr)_24px] lg:grid-cols-[minmax(32px,1fr)_minmax(0,1200px)_minmax(32px,1fr)]',
} as const;

export interface TocEntry { id: string; label: ReactNode; level?: 1 | 2 | 3 }

export interface PageLayoutProps extends HTMLAttributes<HTMLElement> {
  /** `<PageCover/>` (spans the full width). */
  cover?: ReactNode;
  /** `<PageHeader/>` (icon, controls, title). */
  header?: ReactNode;
  fullWidth?: boolean;
  /** Headings for the right-edge table-of-contents rail; omit to hide the rail. */
  toc?: TocEntry[];
  activeTocId?: string;
  onTocSelect?: (id: string) => void;
  /** Cover height used to place the rail (default 280). */
  coverHeight?: number;
  hasIcon?: boolean;
  scrollerRef?: React.Ref<HTMLDivElement>;
  /** Root element (default `main`). Use `div` when the page is not the document's main content. */
  as?: 'main' | 'div';
  /**
   * `document` (default): the 720px reading column with wide gutters. `app`: dense screens beside a sidebar
   * (dashboards, tables, settings): narrow gutters, content up to 1200px, compact `PageHeader`.
   */
  variant?: 'document' | 'app';
}

/**
 * Scrolling page frame with the 3-column page grid (720px content column; 16px gutters on phones), an
 * optional cover, header and table-of-contents rail. Children are the page body. Renders a `<main>`
 * landmark unless you pass `as="div"` (e.g. when several pages are on screen).
 */
export const PageLayout = forwardRef<HTMLElement, PageLayoutProps>(function PageLayout(
  { cover, header, fullWidth = false, toc, activeTocId, onTocSelect, coverHeight = 280, hasIcon = false, scrollerRef, as = 'main', variant = 'document', className, children, ...props },
  ref,
) {
  const [scrollTop, setScrollTop] = useState(0);
  const local = useRef<HTMLDivElement | null>(null);
  // A page with nothing focusable that still scrolls becomes a labelled, focusable region (keyboard scrolling).
  const [observeScroller, scrollRegion] = useScrollRegion<HTMLDivElement>('Page', 'y');
  const setRef = (el: HTMLDivElement | null) => {
    local.current = el;
    observeScroller(el);
    if (typeof scrollerRef === 'function') scrollerRef(el);
    else if (scrollerRef) (scrollerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
  };
  // `main` and `div` take the same props; typing both as `main` keeps the HTMLElement ref.
  const Root = as as 'main';
  const railTop = Math.max(130, (cover ? coverHeight : 0) + 66 - scrollTop);

  return (
    <PageCtx.Provider value={{ hasCover: !!cover, hasIcon, fullWidth, variant }}>
      <Root ref={ref} className={cn('motion-frame relative flex min-h-0 flex-1 flex-col bg-n-bg-primary', className)} {...props}>
        <div
          ref={setRef}
          {...scrollRegion}
          onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
          className="motion-scroller relative z-[1] flex h-full flex-col items-center overflow-y-auto overflow-x-hidden"
        >
          <div className={cn('layout grid w-full', variant === 'app' ? cn('pb-16', PAGE_GRID.app) : cn('pb-[30vh]', fullWidth ? PAGE_GRID.full : PAGE_GRID.default))}>
            {cover && <div className="col-span-3">{cover}</div>}
            {header && <div className="col-start-2 min-w-0">{header}</div>}
            <div className={cn('motion-page-content col-start-2 min-w-0', variant === 'app' ? 'pt-4' : 'mt-2 pt-2')}>{children}</div>
          </div>
        </div>
        {toc && toc.length > 0 && (
          <PageTocRail entries={toc} activeId={activeTocId ?? toc[0].id} onSelect={onTocSelect} className="absolute right-0 z-[80] max-lg:hidden" style={{ top: railTop }} />
        )}
      </Root>
    </PageCtx.Provider>
  );
});

/* ---------------------------------------------- Cover --------------------------------------------- */

export interface PageCoverProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  /** CSS object-position (stored as a vertical %, default "center 28%"). */
  position?: string;
  /** Use instead of `src` for a gradient/colour cover or a custom image node. */
  children?: ReactNode;
  onChangeCover?: () => void;
  onReposition?: () => void;
}
/**
 * Page cover: full-width, 30vh capped at 280. Hover shows a "Change cover | Reposition" button group
 * at the bottom-right of the content column (26px, 12px text-secondary, bg-primary, shadow-outline-sm, radius 4).
 */
export const PageCover = forwardRef<HTMLDivElement, PageCoverProps>(function PageCover(
  { src, position = 'center 28%', children, onChangeCover, onReposition, className, ...props }, ref,
) {
  const { fullWidth } = useContext(PageCtx);
  return (
    <div ref={ref} className={cn('group/cover relative h-[30vh] max-h-[280px] w-full overflow-hidden', className)} {...props}>
      {src ? <img alt="" src={src} className="motion-page-cover block size-full object-cover" style={{ objectPosition: position }} /> : children}
      <div className={cn('pointer-events-none absolute inset-0 grid', fullWidth ? PAGE_GRID.full : PAGE_GRID.default)}>
        <div className="col-start-2 flex items-end justify-end pb-2.5">
          <div className="pointer-events-auto flex overflow-hidden rounded-n-sm bg-n-bg-primary text-[12px] leading-[26px] text-n-text-secondary opacity-0 shadow-n-shadow-outline-sm transition-opacity duration-100 group-hover/cover:opacity-100 focus-within:opacity-100">
            <button type="button" onClick={onChangeCover} className="cursor-pointer whitespace-nowrap px-1.5 hover:bg-n-button-hover-bg-a">Change cover</button>
            <span aria-hidden className="my-1.5 w-px bg-n-border-primary-translucent-a" />
            <button type="button" onClick={onReposition} className="cursor-pointer whitespace-nowrap px-1.5 hover:bg-n-button-hover-bg-a">Reposition</button>
          </div>
        </div>
      </div>
    </div>
  );
});

/* --------------------------------------------- Header --------------------------------------------- */

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Page title (`h1`). A string can be edited in place (see `editable`). */
  title?: ReactNode;
  /** One line under the title (14/20, secondary). */
  description?: ReactNode;
  /** Actions aligned with the title on the right (wrap under it on phones). */
  actions?: ReactNode;
  /** Emoji string or node (78px), above the title; pulled into the cover when there is one. */
  icon?: ReactNode;
  /** Placeholder of an empty editable title. */
  placeholder?: string;
  onTitleChange?: (title: string) => void;
  /** Edit the title in place. Default: true when `onTitleChange` is given and the title is a string or empty. */
  editable?: boolean;
  /**
   * Title size: page 40/48 (32/38.4 on phones); side peek uses 32/38.4; app 24/32 semibold for dense app screens
   * (default inside `PageLayout variant="app"`), aligned flush with the content.
   */
  size?: 'page' | 'peek' | 'app';
  /**
   * The Add icon / Add cover / Add comment row: "hover" (revealed on hover/focus), "always", or "none".
   * Default: "hover" when a handler (`onAddIcon`, `onAddCover`, `onAddComment`) or `extraControls` is given, else "none".
   */
  controls?: 'hover' | 'always' | 'none';
  onAddIcon?: () => void;
  onAddCover?: () => void;
  onAddComment?: () => void;
  /** Extra controls (e.g. "Customize layout" in side peek). */
  extraControls?: ReactNode;
  /** Rendered under the title (properties, backlinks…). */
  children?: ReactNode;
}

function ControlButton({ icon, children, onClick }: { icon: IconName; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-7 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-n-md px-2 text-[14px] leading-[16.8px] hover:bg-n-button-hover-bg-a pointer-coarse:h-9"
    >
      <Icon name={icon} size={14} />
      {children}
    </button>
  );
}

/** Editable title text: a single-line `textbox` inside the page's `h1`. */
function EditableTitle({ title, placeholder, onTitleChange }: { title: string; placeholder: string; onTitleChange?: (t: string) => void }) {
  const el = useRef<HTMLSpanElement>(null);
  const [empty, setEmpty] = useState(!title);
  useEffect(() => {
    if (el.current && el.current.textContent !== title) el.current.textContent = title;
    setEmpty(!title);
  }, [title]);
  return (
    <span
      ref={el}
      role="textbox"
      aria-label="Page title"
      aria-placeholder={placeholder}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      tabIndex={0}
      onInput={(e) => { const t = e.currentTarget.textContent ?? ''; setEmpty(!t); onTitleChange?.(t); }}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
      data-empty={empty || undefined}
      data-placeholder={placeholder}
      className={cn(
        'block min-w-0 outline-none',
        'data-[empty]:before:pointer-events-none data-[empty]:before:text-n-page-title-placeholder-text-color data-[empty]:before:content-[attr(data-placeholder)]',
      )}
    />
  );
}

/**
 * Page header: optional 78px icon (overlapping the cover), the Add icon / cover / comment row, the
 * title (`h1`, editable when `onTitleChange` is given), a description and right-aligned actions.
 * Use it as the `header` of `PageLayout` or `PeekBody`; for a settings-style header use `SettingsPage`.
 */
export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(function PageHeader(
  { icon, title, description, actions, placeholder = 'New page', onTitleChange, editable, size: sizeProp, controls, onAddIcon, onAddCover, onAddComment, extraControls, className, children, ...props },
  ref,
) {
  const { hasCover, variant } = useContext(PageCtx);
  const size = sizeProp ?? (variant === 'app' ? 'app' : 'page');
  const app = size === 'app';
  const textTitle = typeof title === 'string' || title === undefined || title === null;
  const canEdit = (editable ?? !!onTitleChange) && textTitle;
  const ctrl = controls ?? (onAddIcon || onAddCover || onAddComment || extraControls ? 'hover' : 'none');

  return (
    <div ref={ref} className={cn('group/header relative', !hasCover && size === 'page' && 'pt-12 sm:pt-[80px]', app && 'pt-6 sm:pt-8', className)} {...props}>
      {icon && (
        <div className={cn('relative z-[1] flex size-[78px] items-center justify-center pl-0.5 text-[78px] leading-none', hasCover ? 'mt-[-42px]' : '')}>
          {onAddIcon ? (
            <button type="button" aria-label="Change page icon" onClick={onAddIcon} className="flex size-[78px] cursor-pointer items-center justify-center rounded-n-xs hover:bg-n-button-hover-bg-a">
              <span aria-hidden>{icon}</span>
            </button>
          ) : <span aria-hidden className="flex size-[78px] items-center justify-center">{icon}</span>}
        </div>
      )}
      {ctrl !== 'none' && (
        <div
          className={cn(
            'motion-page-controls ml-[-1px] flex flex-wrap justify-start text-n-text-tertiary transition-opacity duration-100',
            size === 'page' ? 'pb-1 pt-4' : 'py-1',
            ctrl === 'hover' && 'opacity-0 group-hover/header:opacity-100 focus-within:opacity-100 pointer-coarse:opacity-100',
          )}
        >
          {!icon && <ControlButton icon="emojiFaceFill" onClick={onAddIcon}>Add icon</ControlButton>}
          {!hasCover && <ControlButton icon="photoFill" onClick={onAddCover}>Add cover</ControlButton>}
          {onAddComment !== undefined || size === 'page' ? <ControlButton icon="commentFilledFill" onClick={onAddComment}>Add comment</ControlButton> : null}
          {extraControls}
        </div>
      )}
      <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
        {/* App headers keep the description under the title, so on phones the actions wrap below both. */}
        <div className={cn('min-w-0 flex-1 basis-[240px]', !app && 'contents')}>
          <h1
            className={cn(
              'motion-page-block notranslate m-0 min-w-0 flex-1 basis-[240px] whitespace-break-spaces break-words',
              app ? 'px-0 text-[24px] font-semibold leading-8' : 'px-2 font-bold',
              size === 'page' && 'text-[32px] leading-[38.4px] sm:text-[40px] sm:leading-[48px]',
              size === 'peek' && 'text-[26px] leading-[32px] sm:text-[32px] sm:leading-[38.4px]',
            )}
          >
            {canEdit ? <EditableTitle title={typeof title === 'string' ? title : ''} placeholder={placeholder} onTitleChange={onTitleChange} /> : (title || <span className="text-n-page-title-placeholder-text-color">{placeholder}</span>)}
          </h1>
          {app && description && <p className="m-0 mt-1 text-[14px] leading-5 text-n-text-secondary">{description}</p>}
        </div>
        {actions && <div className={cn('flex shrink-0 flex-wrap items-center gap-2', app ? 'sm:pt-0.5' : 'px-2 sm:pt-2')}>{actions}</div>}
      </div>
      {!app && description && <p className="m-0 mt-1 px-2 text-[14px] leading-5 text-n-text-secondary">{description}</p>}
      {children}
    </div>
  );
});

/* ----------------------------------------------- TOC ---------------------------------------------- */

export interface PageTocRailProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  entries: TocEntry[];
  activeId?: string;
  onSelect?: (id: string) => void;
}
const markWidth = { 1: 16, 2: 12, 3: 8 } as const;
const markIndent = { 1: 0, 2: 4, 3: 8 } as const;
/**
 * Right-edge table-of-contents rail: one 2px mark per heading (16/12/8 wide by level, gap 12).
 * Hover opens the heading list to the left (popover surface, 14px rows).
 */
export const PageTocRail = forwardRef<HTMLDivElement, PageTocRailProps>(function PageTocRail({ entries, activeId, onSelect, className, ...props }, ref) {
  const [open, setOpen] = useState(false);
  const navId = useId();
  return (
    <div
      ref={ref}
      className={cn('flex', className)}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      // Keyboard: the rail is a disclosure button; the list closes when focus leaves the rail.
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}
      {...props}
    >
      <button
        type="button"
        aria-label="Table of contents"
        aria-expanded={open}
        aria-controls={open ? navId : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => { if (e.key === 'Escape' && open) { e.preventDefault(); setOpen(false); } }}
        className="flex cursor-pointer flex-col justify-center rounded-n-md pb-3 pr-2"
      >
        <span aria-hidden className="flex flex-col gap-3 pb-3 pl-5">
          {entries.map((e) => {
            const lvl = e.level ?? 1;
            const on = e.id === activeId;
            return (
              <span key={e.id} className="flex w-7">
                <span
                  className={cn(
                    'h-[2px] rounded-[2px]',
                    on ? 'bg-n-palette-gray-800 dark:shadow-[0_0_3px_0_var(--n-palette-gray-800)]' : 'bg-n-border-primary-translucent-a dark:bg-n-border-strong-translucent-a',
                  )}
                  style={{ width: markWidth[lvl], marginLeft: markIndent[lvl] }}
                />
              </span>
            );
          })}
        </span>
      </button>
      {open && (
        <nav
          id={navId}
          aria-label="Table of contents"
          className="motion-floating absolute right-full top-[-8px] max-h-[60vh] w-[240px] overflow-y-auto rounded-n-xl bg-n-bg-elevated p-1 shadow-n-shadow-outline-lg"
          data-state="open"
          data-side="left"
        >
          {entries.map((e) => (
            <button
              key={e.id}
              type="button"
              aria-current={e.id === activeId ? 'location' : undefined}
              onClick={() => onSelect?.(e.id)}
              onKeyDown={(ev) => {
                if (ev.key !== 'Escape') return;
                ev.preventDefault();
                setOpen(false);
                ev.currentTarget.closest('nav')?.parentElement?.querySelector<HTMLButtonElement>('button[aria-expanded]')?.focus();
              }}
              className={cn(
                'flex h-7 w-full cursor-pointer items-center truncate rounded-n-md px-2 text-left text-[14px] leading-[16.8px] hover:bg-n-button-hover-bg-a',
                e.id === activeId ? 'text-n-text-primary' : 'text-n-text-secondary',
              )}
              style={{ paddingLeft: 8 + ((e.level ?? 1) - 1) * 12 }}
            >
              <span className="truncate">{e.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
});

export function usePageLayout() { return useContext(PageCtx); }
