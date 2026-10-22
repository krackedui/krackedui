import { forwardRef, useEffect, useId, useMemo, useRef, useState, type ButtonHTMLAttributes, type KeyboardEvent, type CSSProperties, type ReactNode } from 'react';
import { Dialog, Popover } from 'radix-ui';
import { cn } from '../lib/cn';
import { Icon, type IconName } from '../icons/Icon';
import { MenuList, MenuSurface } from '../components/Menu';
import { DatabaseProvider, useDatabase, type DatabaseApi } from './useDatabase';
import { viewTypeIcons, PropertyTypeIcon } from './PropertyTypeIcon';
import { FilterEditor, FilterMenu, SortEditor, SortMenu } from './FilterSortMenus';
import { ViewSettingsPanel } from './ViewSettingsPanel';
import { NewViewMenu, ViewsMenu } from './NewViewMenu';
import { DbMenuItem } from './menuParts';
import { TableView } from './TableView';
import { BoardView } from './BoardView';
import { GalleryView } from './GalleryView';
import { ListView } from './ListView';
import { CalendarView } from './CalendarView';
import { TimelineView } from './TimelineView';
import { ChartView } from './ChartView';
import { PropertyList } from './PropertyList';
import { useDialogReturnFocus } from '../shell/hooks';
import { getProperty, operatorLabels, findOption, rowTitle } from './query';
import type { DatabaseData, Filter, Property, Row, View } from './types';
import { ThemePortal } from '../foundations/ThemePortal';

export type DatabaseMenu = 'filter' | 'sort' | 'settings' | 'views' | 'new-view' | 'new' | 'filter-add';

export interface DatabaseViewProps {
  /** Uncontrolled: initial data. */
  data?: DatabaseData;
  /** Controlled: a `useDatabase()` instance (share state across several DatabaseViews). */
  db?: DatabaseApi;
  initialViewId?: string;
  /**
   * Width of the page column the block lives in. Default `'auto'`: fills its container and follows resizes
   * (responsive). Pass a number for a fixed column (the page column is 720).
   */
  width?: number | 'auto';
  /** Horizontal bleed of wide views (table, board) to the page edges: the 366px padding of the scroller. */
  bleed?: { left: number; right: number };
  /** "Today" for date pickers, calendar and timeline (capture: 2026-10-15). */
  today?: string;
  onOpenRow?: (row: Row) => void;
  /** Open one of the toolbar menus initially (lab / docs). */
  defaultOpenMenu?: DatabaseMenu;
  /** Extra props forwarded to the active view (lab: hoveredRowId, openPropertyMenu, selected…). */
  viewProps?: Record<string, unknown>;
  /** Hide the database title (full-page databases show the page title instead). */
  hideTitle?: boolean;
  className?: string;
  style?: CSSProperties;
}

/* ---------- tabs ---------- */

// Text measuring context: created once; null where OffscreenCanvas is missing (old browsers, test DOMs).
let measureCtx: OffscreenCanvasRenderingContext2D | null | undefined;
function textWidth(s: string, measure = true) {
  // SSR and the first client render use the estimate so hydration matches; real measuring starts after mount
  if (!measure || typeof document === 'undefined') return s.length * 7.5;
  if (measureCtx === undefined) measureCtx = typeof OffscreenCanvas === 'undefined' ? null : new OffscreenCanvas(1, 1).getContext('2d');
  const canvas = measureCtx;
  if (!canvas) return s.length * 7.5;
  canvas.font = `500 14px ${getComputedStyle(document.body).fontFamily || 'sans-serif'}`;
  return canvas.measureText(s).width;
}
const tabWidth = (v: View, measure = true) => 12 + 20 + 6 + Math.ceil(textWidth(v.name, measure)) + 12 + 1; // padding 6 12, icon 20 + 6

/**
 * Database view tab (db-*: tablist). Measured: 32px, padding 6 12, radius 20, 14/16.8 500, icon 20 + 6 gap;
 * inactive text-secondary; active bg-interactive-translucent-a + text-primary; keyboard focus ring 2px bg + 4px blue.
 */
function ViewTab({ view, active, id, panelId, onClick, onKeyDown }: { view: View; active: boolean; id: string; panelId: string; onClick: () => void; onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void }) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={active}
      aria-controls={active ? panelId : undefined}
      tabIndex={active ? 0 : -1}
      data-view-id={view.id}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={cn(
        'mr-px flex h-8 shrink-0 cursor-pointer items-center whitespace-nowrap rounded-[20px] px-3 py-1.5 text-[14px] font-medium leading-[16.8px] transition-[background] duration-[20ms]',
        'focus-visible:shadow-[0_0_0_2px_var(--n-bg-primary),0_0_0_4px_var(--n-palette-ui-blue-600)]',
        active ? 'bg-n-bg-interactive-translucent-a text-n-text-primary' : 'text-n-text-secondary hover:bg-n-button-hover-bg-a',
      )}
    >
      <Icon name={viewTypeIcons[view.type]} size={20} className="mr-1.5" />
      <span className="mt-px truncate">{view.name}</span>
    </button>
  );
}

/** 28px toolbar icon button (db toolbar: padding 6, radius 6, 16px icon icon-secondary). */
function ToolbarButton({ icon, label, active, className, ...props }: { icon: IconName; label: string; active?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" aria-label={label} title={label}
      className={cn('flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-n-md text-n-icon-secondary hover:bg-n-button-hover-bg-a data-[state=open]:bg-n-button-hover-bg-a', active && 'text-n-blue-icon-accent-primary', className)}
      {...props}>
      <Icon name={icon} size={16} />
    </button>
  );
}

/* ---------- filter / sort pills ---------- */

function filterSummary(p: Property, f: Filter) {
  const vals = Array.isArray(f.value) ? f.value : f.value !== undefined && f.value !== '' ? [String(f.value)] : [];
  if (['is_empty', 'is_not_empty', 'checked', 'unchecked'].includes(f.operator)) return operatorLabels[f.operator].toLowerCase();
  if (!vals.length) return '';
  const names = vals.map((v) => findOption(p, v)?.name ?? v);
  return (f.operator === 'is_not' || f.operator === 'does_not_contain' ? 'not ' : '') + names.join(', ');
}

/** Filter/sort rule pill under the toolbar: 24px, radius 12, blue tint when the rule is active. Opens its editor. */
const RulePill = forwardRef<HTMLButtonElement, { icon: ReactNode; children: ReactNode; active?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>>(function RulePill(
  { icon, children, active, className, ...props }, ref,
) {
  return (
    <button ref={ref} type="button" {...props}
      className={cn('flex h-6 shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-xl px-2 text-[14px] leading-6 focus-visible:shadow-n-focus-shadow',
        active ? 'bg-n-blue-bg-secondary-translucent-a text-n-blue-text-primary shadow-[inset_0_0_0_1px_var(--n-blue-border-secondary-translucent-a)]'
          : 'text-n-text-secondary shadow-[inset_0_0_0_1px_var(--n-border-primary-translucent-a)] hover:bg-n-button-hover-bg-a', className)}>
      {icon}
      {children}
      <Icon name="arrowChevronSingleDownSmall" size={12} className="opacity-60" />
    </button>
  );
});

/* ---------- shell ---------- */

/**
 * Database block: title, view tabs (+ "N more…"), toolbar and the active view. Measured (db-table):
 * title 24/31.2 600 with padding 4 0 4 8 and 6px gap; tab row 40px with tablist margin-left 8; toolbar right-aligned,
 * padding-right 8: filter, sort, automations, AI, search, open-as-full-page, settings (28px each) + 6px gap +
 * split "New" (45+24 x 28, blue-icon-accent-primary bg, blue-bg-primary text, radius 6, 1px inset divider).
 * Chart views only show filter, open and settings.
 */
export function DatabaseView(props: DatabaseViewProps) {
  const fixed = typeof props.width === 'number' ? props.width : undefined;
  const ref = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState(0);
  useEffect(() => {
    if (fixed !== undefined || !ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver(([e]) => setMeasured(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [fixed]);
  const width = fixed ?? (measured || 720);
  const inner = props.db ? <DatabaseViewInner {...props} width={width} db={props.db} /> : <Uncontrolled {...props} width={width} />;
  return fixed !== undefined ? inner : <div ref={ref} className="w-full min-w-0">{inner}</div>;
}
function Uncontrolled(props: DatabaseViewProps & { width: number }) {
  const db = useDatabase(() => props.data!, props.initialViewId);
  return <DatabaseViewInner {...props} db={db} />;
}

function DatabaseViewInner({ db, width, bleed, today, onOpenRow, defaultOpenMenu, viewProps, hideTitle, className, style }: DatabaseViewProps & { db: DatabaseApi; width: number }) {
  const { collection, views } = db.data;
  const view = db.activeView;
  const [menu, setMenu] = useState<DatabaseMenu | undefined>(defaultOpenMenu);
  const [peek, setPeek] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState('');
  const open = (m: DatabaseMenu) => (o: boolean) => setMenu(o ? m : menu === m ? undefined : menu);
  const openRow = onOpenRow ?? ((r: Row) => setPeek(r.id));

  // toolbar + tabs width budget (708 inner = 720 - padding; tablist margin 8). Narrow blocks (< 560) put the
  // toolbar on its own row and drop the secondary tools, so the tabs get the full width.
  const isChart = view.type === 'chart';
  const compact = width < 560;
  const toolIcons = isChart ? 3 : compact ? 4 + (view.type === 'timeline' ? 1 : 0) : 7 + (view.type === 'timeline' ? 1 : 0);
  const toolbarW = compact ? 0 : 8 + toolIcons * 28 + 6 + 69 + 8;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const visibleTabs = useMemo(() => {
    const tabW = (v: View) => tabWidth(v, mounted);
    const budget = width - 12 - 8 - toolbarW - 77; // 77 = "N more…"
    const shown: View[] = [];
    let used = 0;
    for (const v of views) {
      const w = tabW(v);
      if (used + w > budget) break;
      shown.push(v); used += w;
    }
    if (!shown.length) shown.push(views[0]);
    if (!shown.includes(view)) {
      // active view always visible: replace the last tab(s) until it fits
      while (shown.length > 1 && shown.reduce((sum, v) => sum + tabW(v), 0) + tabW(view) > budget) shown.pop();
      shown.push(view);
    }
    return shown;
  }, [views, view, width, toolbarW, mounted]);
  const baseId = useId();
  const tabId = (v: View) => `${baseId}-tab-${v.id}`;
  const panelId = `${baseId}-panel`;
  // Tabs: ←/→/Home/End move between views (automatic activation, roving focus).
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = visibleTabs.findIndex((v) => v.id === view.id);
    const next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? visibleTabs.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const v = visibleTabs[(next + visibleTabs.length) % visibleTabs.length];
    db.setActiveView(v.id);
    const list = e.currentTarget.parentElement;
    requestAnimationFrame(() => list?.querySelector<HTMLElement>(`[data-view-id="${v.id}"]`)?.focus());
  };
  const hidden = views.length - visibleTabs.length;

  // Views read db.activeView; give them the search-augmented view through a shallow proxy api.
  const viewDb = useMemo<DatabaseApi>(() => {
    const titleId = collection.properties.find((p) => p.type === 'title')?.id;
    if (!searching || !search.trim() || !titleId) return db;
    const filters = [...view.filters, { id: '__search', propertyId: titleId, operator: 'contains' as const, value: search }];
    return { ...db, activeView: { ...view, filters } };
  }, [db, view, searching, search, collection.properties]);

  const addFilter = (p: Property) => {
    db.updateView(view.id, (v) => ({ filters: [...v.filters, { id: `f-${Date.now()}`, propertyId: p.id, operator: p.type === 'checkbox' ? 'checked' : p.type === 'multi_select' || p.type === 'title' || p.type === 'text' ? 'contains' : 'is' }] }));
    setMenu(undefined);
  };
  const addSort = (p: Property) => {
    db.updateView(view.id, (v) => ({ sorts: [...v.sorts.filter((s) => s.propertyId !== p.id), { propertyId: p.id, direction: 'ascending' }] }));
    setMenu(undefined);
  };

  const bleedStyle: CSSProperties | undefined = bleed && { marginLeft: -bleed.left, marginRight: -bleed.right, paddingLeft: bleed.left, paddingRight: bleed.right };
  // Wide layouts scroll horizontally inside the block (never the page).
  const wide = view.type === 'table' || view.type === 'board' || view.type === 'calendar' || view.type === 'timeline';
  const vp = viewProps ?? {};

  let body: ReactNode;
  switch (view.type) {
    case 'table': body = <TableView onOpenRow={openRow} today={today} {...vp} />; break;
    case 'board': body = <BoardView onOpenRow={openRow} {...vp} />; break;
    case 'gallery': body = <GalleryView onOpenRow={openRow} {...vp} />; break;
    case 'list': body = <ListView onOpenRow={openRow} {...vp} />; break;
    case 'calendar': body = <CalendarView onOpenRow={openRow} today={today} {...vp} />; break;
    case 'timeline': body = <TimelineView onOpenRow={openRow} today={today} width={Math.max(width - 12, 560)} {...vp} />; break;
    case 'chart': body = <ChartView {...vp} />; break;
  }

  const peekRow = peek ? db.data.rows.find((r) => r.id === peek) : undefined;
  const newButton = (
    <div className="relative ml-1.5 flex h-7 text-[14px] font-medium leading-[21px]">
      <button type="button" onClick={() => openRow(db.addRow({}, { viewId: view.id, position: 'start' }))}
        className="flex h-7 cursor-pointer items-center rounded-l-n-md bg-n-blue-bg-solid px-2 text-n-text-on-solid hover:bg-n-blue-bg-solid-hover">
        New
      </button>
      <Popover.Root open={menu === 'new'} onOpenChange={open('new')}>
        <Popover.Trigger asChild>
          <button type="button" aria-label="More add options"
            className="flex h-7 w-6 cursor-pointer focus-visible:shadow-n-focus-shadow items-center justify-center rounded-r-n-md bg-n-blue-bg-solid text-n-text-on-solid shadow-[inset_1px_0_0_var(--n-border-primary-translucent-a)] hover:bg-n-blue-bg-solid-hover">
            <Icon name="arrowChevronSingleDownFill" size={16} className="mt-0.5" />
          </button>
        </Popover.Trigger>
        <ThemePortal primitive={Popover.Portal}>
          <Popover.Content aria-label="More ways to add" collisionPadding={8} align="end" sideOffset={4} className="motion-floating z-50 outline-none">
            <MenuSurface width={240}>
              <MenuList role="group">
                <DbMenuItem icon="page" onClick={() => { openRow(db.addRow()); setMenu(undefined); }}>Empty page</DbMenuItem>
                <DbMenuItem icon="templates">New template</DbMenuItem>
              </MenuList>
            </MenuSurface>
          </Popover.Content>
        </ThemePortal>
      </Popover.Root>
    </div>
  );

  return (
    <DatabaseProvider value={viewDb}>
      <div className={cn('relative text-n-text-primary', className)} style={{ width, ...style }}>
        {/* title */}
        {!hideTitle && (
          <div className="mb-1.5 flex h-[39px] items-center py-1 pl-2">
            <div className="truncate pr-1 text-[24px] font-semibold leading-[31.2px]">{collection.name}</div>
          </div>
        )}
        {/* tabs + toolbar */}
        <div className={cn('mr-3 flex items-center', compact ? 'flex-wrap' : 'h-10')}>
          <div className={cn('ml-2 flex h-10 min-w-0 items-center overflow-hidden', compact ? 'w-full' : 'flex-1')}>
            <div role="tablist" aria-label={`${collection.name} views`} className="flex min-w-0 items-center overflow-hidden">
              {visibleTabs.map((v) => <ViewTab key={v.id} view={v} id={tabId(v)} panelId={panelId} active={v.id === view.id} onClick={() => db.setActiveView(v.id)} onKeyDown={onTabKey} />)}
            </div>
            {hidden > 0 && (
              <Popover.Root open={menu === 'views' || menu === 'new-view'} onOpenChange={open('views')}>
                <Popover.Trigger asChild>
                  <button type="button" className="flex h-8 shrink-0 cursor-pointer items-center whitespace-nowrap rounded-[20px] px-2.5 text-[14px] leading-[16.8px] text-n-text-secondary hover:bg-n-button-hover-bg-a data-[state=open]:bg-n-bg-interactive-translucent-a">
                    {hidden} more…
                  </button>
                </Popover.Trigger>
                <ThemePortal primitive={Popover.Portal}>
                  <Popover.Content aria-label="Views" collisionPadding={8} align="start" sideOffset={4} className="motion-floating z-50 outline-none">
                    <div className="relative">
                      <ViewsMenu views={views} activeViewId={view.id} newViewHighlighted={menu === 'new-view'}
                        onSelect={(v) => { db.setActiveView(v.id); setMenu(undefined); }}
                        onNewView={() => setMenu('new-view')} />
                      {menu === 'new-view' && (
                        <NewViewMenu className="absolute left-[286px] top-[154px]" highlighted="table" onSelect={(t) => { db.addView(t); setMenu(undefined); }} />
                      )}
                    </div>
                  </Popover.Content>
                </ThemePortal>
              </Popover.Root>
            )}
          </div>
          <div className={cn('flex shrink-0 items-center justify-end pr-2', compact && 'ml-auto h-9')}>
            {view.type === 'timeline' && <ToolbarButton icon="arrowChevronDoubleForwardSmall" label="Open table" />}
            <Popover.Root open={menu === 'filter'} onOpenChange={open('filter')}>
              <Popover.Trigger asChild><ToolbarButton icon="filterSmall" label="Filter" active={view.filters.length > 0} /></Popover.Trigger>
              <ThemePortal primitive={Popover.Portal}>
                <Popover.Content aria-label="Filter by property" collisionPadding={8} align="start" sideOffset={4} className="motion-floating z-50 outline-none" onCloseAutoFocus={(e) => e.preventDefault()}>
                  <FilterMenu autoFocus highlightFirst properties={collection.properties} onSelect={addFilter} />
                </Popover.Content>
              </ThemePortal>
            </Popover.Root>
            {!isChart && (
              <>
                <Popover.Root open={menu === 'sort'} onOpenChange={open('sort')}>
                  <Popover.Trigger asChild><ToolbarButton icon="arrowUpDownSmall" label="Sort" active={view.sorts.length > 0} /></Popover.Trigger>
                  <ThemePortal primitive={Popover.Portal}>
                    <Popover.Content aria-label="Sort by property" collisionPadding={8} align="start" sideOffset={4} className="motion-floating z-50 outline-none">
                      <SortMenu autoFocus highlightFirst properties={collection.properties} onSelect={addSort} />
                    </Popover.Content>
                  </ThemePortal>
                </Popover.Root>
                {!compact && <ToolbarButton icon="lightningSmall" label="Automations" />}
                {!compact && <ToolbarButton icon="magicWandSmall" label="AI Autofill" />}
                {searching ? (
                  <div className="flex h-7 items-center gap-1 px-1.5 text-n-icon-secondary">
                    <Icon name="magnifyingGlassSmall" size={16} />
                    <input autoFocus type="search" aria-label={`Search ${collection.name}`} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Type to search…"
                      onBlur={() => !search && setSearching(false)} onKeyDown={(e) => e.key === 'Escape' && (setSearch(''), setSearching(false))}
                      className="w-[120px] bg-transparent text-[14px] text-n-text-primary outline-none placeholder:text-n-text-tertiary" />
                  </div>
                ) : <ToolbarButton icon="magnifyingGlassSmall" label="Search" onClick={() => setSearching(true)} />}
              </>
            )}
            {!compact && <ToolbarButton icon="arrowExpandDiagonalBottomLeftToTopRightSmall" label="Open as full page" />}
            <Popover.Root open={menu === 'settings'} onOpenChange={open('settings')}>
              <Popover.Trigger asChild><ToolbarButton icon="slidersSmall" label="Settings" /></Popover.Trigger>
              <ThemePortal primitive={Popover.Portal}>
                <Popover.Content role="presentation" align="start" sideOffset={-1} alignOffset={109} avoidCollisions={false} className="motion-floating z-50 outline-none">{/* db-view-settings: panel docks at the toolbar end (x+109 from the button), 1px under it */}
                  <ViewSettingsPanel collection={collection} view={view} height={627}
                    onChange={(patch) => db.updateView(view.id, patch)} onClose={() => setMenu(undefined)} />
                </Popover.Content>
              </ThemePortal>
            </Popover.Root>
            {newButton}
          </div>
        </div>
        {/* active filter / sort rules */}
        {(view.filters.length > 0 || view.sorts.length > 0) && (
          <div className="ml-2 flex flex-wrap items-center gap-1.5 py-1.5">
            {view.sorts.length > 0 && (
              <Popover.Root>
                <Popover.Trigger asChild>
                  <RulePill active icon={<Icon name="arrowUpDownSmall" size={14} />}>{view.sorts.length === 1 ? getProperty(collection, view.sorts[0].propertyId)?.name : `${view.sorts.length} sorts`}</RulePill>
                </Popover.Trigger>
                <ThemePortal primitive={Popover.Portal}>
                  <Popover.Content aria-label="Sorts" collisionPadding={8} align="start" sideOffset={4} className="motion-floating z-50 outline-none">
                    <SortEditor properties={collection.properties} sorts={view.sorts} onChange={(sorts) => db.updateView(view.id, { sorts })} />
                  </Popover.Content>
                </ThemePortal>
              </Popover.Root>
            )}
            {view.sorts.length > 0 && view.filters.length > 0 && <span className="mx-1 h-6 w-px bg-n-border-primary-translucent-a" />}
            {view.filters.map((f) => {
              const p = getProperty(collection, f.propertyId);
              if (!p) return null;
              const summary = filterSummary(p, f);
              return (
                <Popover.Root key={f.id} defaultOpen={!summary && f.operator !== 'checked'}>
                  <Popover.Trigger asChild>
                    <RulePill active={!!summary} icon={<PropertyTypeIcon type={p.type} size={14} />}>
                      {p.name}{summary ? <span className="font-medium">: {summary}</span> : null}
                    </RulePill>
                  </Popover.Trigger>
                  <ThemePortal primitive={Popover.Portal}>
                    <Popover.Content aria-label={`${p.name} filter`} collisionPadding={8} align="start" sideOffset={4} className="motion-floating z-50 outline-none">
                      <FilterEditor property={p} filter={f}
                        onChange={(nf) => db.updateView(view.id, (v) => ({ filters: v.filters.map((x) => (x.id === f.id ? nf : x)) }))}
                        onRemove={() => db.updateView(view.id, (v) => ({ filters: v.filters.filter((x) => x.id !== f.id) }))} />
                    </Popover.Content>
                  </ThemePortal>
                </Popover.Root>
              );
            })}
            <Popover.Root open={menu === 'filter-add'} onOpenChange={(o) => setMenu(o ? ('filter-add') : undefined)}>
              <Popover.Trigger asChild>
                <button type="button" className="flex h-6 cursor-pointer items-center gap-1 rounded-xl px-2 text-[14px] text-n-text-tertiary hover:bg-n-button-hover-bg-a">
                  <Icon name="plusSmall" size={14} />Filter
                </button>
              </Popover.Trigger>
              <ThemePortal primitive={Popover.Portal}>
                <Popover.Content aria-label="Add a filter" collisionPadding={8} align="start" sideOffset={4} className="motion-floating z-50 outline-none" onCloseAutoFocus={(e) => e.preventDefault()}>
                  <FilterMenu autoFocus properties={collection.properties} onSelect={addFilter} />
                </Popover.Content>
              </ThemePortal>
            </Popover.Root>
          </div>
        )}
        {/* body */}
        <div
          role="tabpanel"
          id={panelId}
          aria-labelledby={tabId(view)}
          tabIndex={0}
          className={cn('relative rounded-n-md outline-none', wide && 'overflow-x-auto overflow-y-hidden overscroll-x-contain')}
          style={wide ? bleedStyle : undefined}
        >
          {body}
        </div>
      </div>
      {peekRow && (
        <PagePeek row={peekRow} title={rowTitle(collection, peekRow)} onClose={() => setPeek(null)}>
          <PropertyList properties={collection.properties} row={peekRow} today={today}
            onChange={(pid, v) => db.updateRow(peekRow.id, pid, v)} onCreateOption={(pid, name) => db.addOption(pid, name)} />
        </PagePeek>
      )}
    </DatabaseProvider>
  );
}

/**
 * Minimal row peek used when no `onOpenRow` is given: a modal panel on the right (full-screen on phones)
 * with the row title and its properties. Radix Dialog: focus trap, Escape, focus return.
 * For the full page chrome pass `onOpenRow` and render `SidePeek` / `CenterPeek` from the shell.
 */
function PagePeek({ row, title, onClose, children }: { row: Row; title: string; onClose: () => void; children: ReactNode }) {
  const returnFocus = useDialogReturnFocus();
  return (
    <Dialog.Root open onOpenChange={(o) => { if (!o) onClose(); }}>
      <ThemePortal primitive={Dialog.Portal}>
        <Dialog.Overlay className="motion-overlay fixed inset-0 z-40 bg-n-modal-underlay-bg-a" />
        <Dialog.Content
          aria-describedby={undefined}
          aria-modal="true"
          {...returnFocus}
          data-row={row.id}
          data-side="right"
          className="motion-sheet motion-portal fixed bottom-0 right-0 top-0 z-40 flex w-[min(676px,100vw)] flex-col bg-n-bg-primary text-n-text-primary shadow-n-shadow-outline-scroll outline-none"
        >
          <div className="flex h-11 shrink-0 items-center gap-1 px-3">
            <Dialog.Close aria-label="Close" className="flex size-7 cursor-pointer items-center justify-center rounded-n-md text-n-icon-secondary hover:bg-n-button-hover-bg-a">
              <Icon name="arrowChevronDoubleForward" size={20} />
            </Dialog.Close>
          </div>
          <div className="overflow-y-auto px-4 pb-10 pt-6 sm:px-20 sm:pt-[50px]">
            <Dialog.Title className="m-0 mb-5 break-words text-[32px] font-bold leading-[1.2] sm:text-[40px]">{title || 'New page'}</Dialog.Title>
            {children}
          </div>
        </Dialog.Content>
      </ThemePortal>
    </Dialog.Root>
  );
}
