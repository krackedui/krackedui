import { forwardRef, useId, useState, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { Icon, type IconName } from '../icons/Icon';
import { MenuLabel, MenuList, MenuSurface } from '../components/Menu';
import { DbMenuItem, DbMenuRule, DbMenuSearch, useMenuKeys } from './menuParts';
import { viewTypeIcons } from './PropertyTypeIcon';
import type { View, ViewType } from './types';

export interface ViewsMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  views: View[];
  activeViewId?: string;
  onSelect?: (view: View) => void;
  onNewView?: () => void;
  /** Force the "New view" row highlighted (as captured, while the grid flyout is open). */
  newViewHighlighted?: boolean;
}

/**
 * "N more…" views menu (capture: db-new-view-menu, left surface). Measured: 290 wide, radius 10; search 258x28 at
 * 16px inset ("Search for a view…"); rows 28px: drag handle 16 (icon-secondary) in a 20x24 slot, view icon 20, name,
 * 24px "…" button; inset rule; "New view" (plus) and "New data source" (squareOnSquarePlus).
 */
export const ViewsMenu = forwardRef<HTMLDivElement, ViewsMenuProps>(function ViewsMenu(
  { views, activeViewId, onSelect, onNewView, newViewHighlighted, onKeyDown, ...props }, ref,
) {
  const [q, setQ] = useState('');
  const keys = useMenuKeys();
  const list = views.filter((v) => v.name.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <MenuSurface ref={ref} width={290} onKeyDown={(e) => { keys(e); onKeyDown?.(e); }} {...props}>
      <DbMenuSearch wrapperClassName="px-4" placeholder="Search for a view…" value={q} onChange={(e) => setQ(e.target.value)} />
      <MenuList role="group" aria-label="Views" className="max-h-[320px] overflow-y-auto">
        {list.map((v) => (
          <DbMenuItem
            key={v.id}
            aria-pressed={v.id === activeViewId}
            className="gap-2 [&>span:first-child]:w-12 [&>span:first-child]:justify-start"
            onClick={() => onSelect?.(v)}
            icon={
              <span className="flex items-center gap-2">
                <span aria-hidden className="flex h-6 w-5 cursor-grab items-center justify-center text-n-icon-secondary"><Icon name="dragHandleFillSmall" size={16} /></span>
                <Icon name={viewTypeIcons[v.type]} size={20} className="text-n-icon-primary" />
              </span>
            }
            trailing={
              <span aria-hidden className="mr-2 flex size-6 items-center justify-center rounded-n-md text-n-icon-secondary hover:bg-n-button-hover-bg-a">
                <Icon name="ellipsisSmall" size={16} />
              </span>
            }
          >
            {v.name}
          </DbMenuItem>
        ))}
      </MenuList>
      <DbMenuRule />
      <MenuList role="group" aria-label="Add">
        <DbMenuItem icon="plus" highlighted={newViewHighlighted} onClick={onNewView}>New view</DbMenuItem>
        <DbMenuItem icon="squareOnSquarePlus">New data source</DbMenuItem>
      </MenuList>
    </MenuSurface>
  );
});

/** Every layout in the "Add a new view" grid; types this package renders are selectable. */
export const newViewLayouts: { type: ViewType | 'dashboard' | 'feed' | 'map' | 'form'; label: string; icon: IconName }[] = [
  { type: 'table', label: 'Table', icon: 'viewTable' },
  { type: 'board', label: 'Board', icon: 'viewBoard' },
  { type: 'gallery', label: 'Gallery', icon: 'squareGrid2X2' },
  { type: 'list', label: 'List', icon: 'bulletedList' },
  { type: 'chart', label: 'Chart', icon: 'viewChart' },
  { type: 'dashboard', label: 'Dashboard', icon: 'viewDashboard' },
  { type: 'timeline', label: 'Timeline', icon: 'viewTimeline' },
  { type: 'feed', label: 'Feed', icon: 'newspaper' },
  { type: 'map', label: 'Map', icon: 'map' },
  { type: 'calendar', label: 'Calendar', icon: 'viewCalendar' },
  { type: 'form', label: 'Form', icon: 'form' },
];
const SUPPORTED = new Set<string>(['table', 'board', 'gallery', 'list', 'calendar', 'timeline', 'chart']);

export interface NewViewMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  onSelect?: (type: ViewType) => void;
  /** Highlight a cell (captured: "Table" hovered). */
  highlighted?: string;
}

/**
 * "Add a new view" grid (capture: db-new-view-menu, right surface). Measured: 390 wide, radius 10, padding 8;
 * label 12/500 text-secondary; 4 columns of 92x62 cells (gap 2, radius 8, icon 22 + label 14/20 gray-text-primary, gap 4),
 * hover bg button-hover-bg-a.
 */
export const NewViewMenu = forwardRef<HTMLDivElement, NewViewMenuProps>(function NewViewMenu({ onSelect, highlighted, className, ...props }, ref) {
  const labelId = useId();
  return (
    <MenuSurface ref={ref} width={390} className={cn('p-2', className)} {...props}>
      <MenuLabel id={labelId} className="mb-2 mt-1.5">Add a new view</MenuLabel>
      <div role="group" aria-labelledby={labelId} className="grid grid-cols-3 gap-0.5 sm:grid-cols-4">
        {newViewLayouts.map((l) => {
          const ok = SUPPORTED.has(l.type);
          return (
            <button
              key={l.type}
              type="button"
              data-highlighted={highlighted === l.type ? '' : undefined}
              aria-disabled={!ok}
              onClick={() => ok && onSelect?.(l.type as ViewType)}
              className="flex h-[62px] cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-n-lg text-n-icon-primary hover:bg-n-button-hover-bg-a focus-visible:bg-n-button-hover-bg-a data-[highlighted]:bg-n-button-hover-bg-a"
            >
              <Icon name={l.icon} size={22} />
              <span className="w-full truncate px-1 text-[14px] leading-5 text-n-gray-text-primary">{l.label}</span>
            </button>
          );
        })}
      </div>
    </MenuSurface>
  );
});
