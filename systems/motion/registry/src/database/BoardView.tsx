import { useState, type DragEvent } from 'react';
import { cn } from '../lib/cn';
import { Icon } from '../icons/Icon';
import { StatusPill, Tag } from '../atoms';
import { optionColors } from './colors';
import { PropertyValueView } from './PropertyValue';
import { useDatabaseContext } from './useDatabase';
import { getProperty, groupRows, queryRows, rowTitle, visibleProperties } from './query';
import type { Row } from './types';

export interface CardActionsProps { onEdit?: () => void; onMore?: () => void; className?: string }

/**
 * Hover actions on board/gallery cards (db-board, db-gallery): 57x24 group, radius 4, bg-elevated, shadow outline-md,
 * 12px text-secondary; pencilLineSmall + ellipsisSmall separated by a 1px rule; 8px from the card's top-right.
 */
export function CardActions({ onEdit, onMore, className }: CardActionsProps) {
  return (
    <div className={cn('absolute right-2 top-2 z-[2] flex h-6 overflow-hidden rounded-n-sm bg-n-bg-elevated text-n-text-secondary shadow-n-shadow-outline-md', className)}>
      <button type="button" aria-label="Edit" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit?.(); }}
        className="flex cursor-pointer items-center justify-center border-r border-n-border-secondary-translucent-a px-1.5 hover:bg-n-button-hover-bg-a">
        <Icon name="pencilLineSmall" size={16} />
      </button>
      <button type="button" aria-label="More" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMore?.(); }}
        className="flex cursor-pointer items-center justify-center px-1.5 hover:bg-n-button-hover-bg-a">
        <Icon name="ellipsisSmall" size={16} />
      </button>
    </div>
  );
}

export interface BoardViewProps {
  onOpenRow?: (row: Row) => void;
  /** Force a hovered card (lab). */
  hoveredRowId?: string;
}

/**
 * Board view (capture: db-board), grouped by the view's `groupBy` (status by default).
 * Measured: columns 276 wide + 12 gap; header 40px (bg = option color group bg, radius 10 10 0 0, padding 0 8) with the
 * status pill (3px padded button) and count (accent color, padding 0 6); body padding 0 8 8, radius 0 0 10 10;
 * cards 260x40, radius 10, mb 8, title 15/22.5 500, padding 8 10, bg <c>-bg-elevated + shadow-base-sm + 1px tinted ring;
 * "+ New page" 40px, radius 10, 1px ring, 15/18 in the accent color. Cards drag between columns (HTML5 DnD).
 */
export function BoardView({ onOpenRow, hoveredRowId }: BoardViewProps) {
  const db = useDatabaseContext();
  const { collection } = db.data;
  const view = db.activeView;
  const groupProp = getProperty(collection, view.groupBy) ?? collection.properties.find((p) => p.type === 'status' || p.type === 'select');
  const rows = queryRows(collection, db.data.rows, view);
  const groups = groupRows(collection, rows, groupProp?.id);
  const cardProps = visibleProperties(collection, view).filter((p) => p.type !== 'title');
  const [drag, setDrag] = useState<{ row: string; over?: string; before?: string } | null>(null);

  const drop = (e: DragEvent, groupId: string, beforeRowId?: string) => {
    e.preventDefault();
    const rowId = e.dataTransfer.getData('text/x-motion-row') || drag?.row;
    if (!rowId || !groupProp) return;
    const value = groupId === '__none' ? null : groupProp.type === 'multi_select' ? [groupId] : groupId;
    db.updateRow(rowId, groupProp.id, value);
    db.moveRow(view.id, rowId, beforeRowId);
    setDrag(null);
  };

  // Keyboard alternative to dragging (WCAG 2.5.7): Alt+←/→ moves a card to the previous / next column.
  const moveToGroup = (rowId: string, groupId: string) => {
    if (!groupProp) return;
    db.updateRow(rowId, groupProp.id, groupId === '__none' ? null : groupProp.type === 'multi_select' ? [groupId] : groupId);
  };
  const [moved, setMoved] = useState('');

  const isStatus = groupProp?.type === 'status';
  return (
    <div className="relative w-max pl-2">
      <div role="status" className="sr-only">{moved}</div>
      {/* sticky header row: padding-top 8 */}
      <div className="sticky top-0 z-[3] flex bg-n-bg-primary pt-2">
        {groups.map((g) => {
          const c = optionColors[g.option?.color ?? 'default'];
          return (
            <div key={g.id} className="mr-3 flex w-[276px] shrink-0">
              <div className={cn('flex h-10 w-full items-center rounded-t-[10px] px-2 text-[14px] leading-[21px]', c.group)}>
                <div className="flex items-center overflow-hidden rounded-n-md p-[3px]">
                  {g.option ? (isStatus ? <StatusPill color={g.option.color}>{g.label}</StatusPill> : <Tag color={g.option.color}>{g.label}</Tag>)
                    : <span className="px-1 text-n-text-secondary">{g.label}</span>}
                </div>
                <div aria-label={`${g.rows.length} pages`} className={cn('flex h-5 items-center rounded-n-sm px-1.5 leading-[16.8px]', c.accent)}>{g.rows.length}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex">
        {groups.map((g) => {
          const c = optionColors[g.option?.color ?? 'default'];
          const over = drag?.over === g.id;
          return (
            <div
              key={g.id}
              role="group"
              aria-label={g.label}
              onDragOver={(e) => { e.preventDefault(); if (drag && drag.over !== g.id) setDrag({ ...drag, over: g.id }); }}
              onDrop={(e) => drop(e, g.id)}
              className={cn('mb-4 mr-3 w-[276px] shrink-0 self-start rounded-b-[10px] px-2 pb-2', c.group, over && 'ring-2 ring-inset ring-n-palette-ui-blue-200-a')}
            >
              <div className="h-[3px]" />
              <div role="list" aria-label={`${g.label} pages`}>
              {g.rows.map((row) => (
                <div
                  key={row.id}
                  role="listitem"
                  draggable
                  data-hovered={hoveredRowId === row.id ? '' : undefined}
                  onDragStart={(e) => { e.dataTransfer.setData('text/x-motion-row', row.id); e.dataTransfer.effectAllowed = 'move'; setDrag({ row: row.id }); }}
                  onDragEnd={() => setDrag(null)}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); if (drag) setDrag({ ...drag, over: g.id, before: row.id }); }}
                  onDrop={(e) => { e.stopPropagation(); drop(e, g.id, row.id); }}
                  className={cn(
                    'group/card relative mb-2 cursor-pointer overflow-hidden rounded-[10px] min-h-10 has-[[data-card-open]:focus-visible]:shadow-n-focus-shadow',
                    c.card,
                    drag?.row === row.id && 'opacity-40',
                    drag?.before === row.id && drag.over === g.id && drag.row !== row.id && 'before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-n-palette-ui-blue-600',
                  )}
                >
                  <CardActions className="opacity-0 group-hover/card:opacity-100 group-data-[hovered]/card:opacity-100 focus-within:opacity-100 pointer-coarse:opacity-100" onEdit={() => onOpenRow?.(row)} />
                  <div className="flex flex-col gap-1.5 px-2.5 py-2">
                    {/* The title button covers the whole card (stretched), so the card opens on click or Enter. */}
                    <button type="button" data-card-open="" onClick={() => onOpenRow?.(row)}
                      aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight"
                      onKeyDown={(e) => {
                        if (!e.altKey || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
                        const gi = groups.findIndex((x) => x.id === g.id) + (e.key === 'ArrowRight' ? 1 : -1);
                        const target = groups[gi];
                        if (!target) return;
                        e.preventDefault();
                        const el = e.currentTarget;
                        moveToGroup(row.id, target.id);
                        setMoved(`Moved to ${target.label}`);
                        // keep focus on the card in its new column
                        requestAnimationFrame(() => el.isConnected ? el.focus() : document.querySelector<HTMLElement>(`[data-card-row="${row.id}"]`)?.focus());
                      }}
                      data-card-row={row.id}
                      className="min-h-[22.5px] cursor-pointer px-px text-left text-[15px] font-medium leading-[22.5px] outline-none after:absolute after:inset-0 focus-visible:shadow-none">
                      {rowTitle(collection, row) || <span className="text-n-text-tertiary">New page</span>}
                    </button>
                    {cardProps.map((p) => (row.values[p.id] !== undefined && p.id !== groupProp?.id ? (
                      <PropertyValueView key={p.id} property={p} value={row.values[p.id]} size="sm" wrap />
                    ) : null))}
                  </div>
                </div>
              ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  const values: Row['values'] = {};
                  if (groupProp && g.id !== '__none') values[groupProp.id] = groupProp.type === 'multi_select' ? [g.id] : g.id;
                  db.addRow(values);
                }}
                className={cn('flex h-10 w-full cursor-pointer focus-visible:shadow-n-focus-shadow items-center gap-[9px] whitespace-nowrap rounded-[10px] px-2.5 text-[15px] leading-[18px] shadow-[0_0_0_1px_var(--n-border-secondary-translucent-a)] transition-[background] duration-100 hover:bg-n-button-hover-bg-a', c.accent,
                  g.option && g.option.color !== 'default' && g.option.color !== 'gray' && SHADOW_RING[g.option.color])}
              >
                <Icon name="plusSmall" size={16} width={11} className="ml-0.5" />
                New page
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// "New page" ring takes the column tint (db-board: blue column ring rgba(0,124,215,.094) = blue-border-secondary-translucent-a)
const SHADOW_RING: Record<string, string> = {
  brown: 'shadow-[0_0_0_1px_var(--n-brown-border-secondary-translucent-a)]',
  orange: 'shadow-[0_0_0_1px_var(--n-orange-border-secondary-translucent-a)]',
  yellow: 'shadow-[0_0_0_1px_var(--n-yellow-border-secondary-translucent-a)]',
  green: 'shadow-[0_0_0_1px_var(--n-green-border-secondary-translucent-a)]',
  blue: 'shadow-[0_0_0_1px_var(--n-blue-border-secondary-translucent-a)]',
  purple: 'shadow-[0_0_0_1px_var(--n-purple-border-secondary-translucent-a)]',
  pink: 'shadow-[0_0_0_1px_var(--n-pink-border-secondary-translucent-a)]',
  red: 'shadow-[0_0_0_1px_var(--n-red-border-secondary-translucent-a)]',
  teal: 'shadow-[0_0_0_1px_var(--n-teal-border-secondary-translucent-a)]',
};
