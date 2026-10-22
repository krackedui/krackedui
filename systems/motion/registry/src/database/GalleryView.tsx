import { cn } from '../lib/cn';
import { CardActions } from './BoardView';
import { PropertyValueView } from './PropertyValue';
import { useDatabaseContext } from './useDatabase';
import { queryRows, rowTitle, visibleProperties } from './query';
import type { Row } from './types';

export interface GalleryViewProps {
  onOpenRow?: (row: Row) => void;
  /** Card size: "medium" gives 2 columns in a 692px page column. */
  cardSize?: 'small' | 'medium' | 'large';
  hoveredRowId?: string;
}

const COLS = { small: 'grid-cols-[repeat(auto-fill,minmax(min(180px,100%),1fr))]', medium: 'grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))]', large: 'grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))]' };

/**
 * Gallery view (capture: db-gallery). Measured: grid gap 16, padding 16 0 4, inset 8px from the block;
 * cards 338x185 radius 10, bg-elevated, shadow-base-sm + 1px border-secondary-translucent ring; preview 146 tall
 * (bg-secondary-translucent-a, 1px bottom rule, padding 8 8 0); title row padding 8 10, 15/22.5 500.
 */
export function GalleryView({ onOpenRow, cardSize = 'medium', hoveredRowId }: GalleryViewProps) {
  const db = useDatabaseContext();
  const { collection } = db.data;
  const view = db.activeView;
  const rows = queryRows(collection, db.data.rows, view);
  const props = visibleProperties(collection, view).filter((p) => p.type !== 'title');
  return (
    <div role="list" aria-label={view.name} className={cn('ml-2 mr-2 grid gap-4 pb-1 pt-4 sm:mr-5', COLS[cardSize])}>
      {rows.map((row) => (
        <div
          key={row.id}
          role="listitem"
          data-hovered={hoveredRowId === row.id ? '' : undefined}
          className="group/card relative flex cursor-pointer flex-col overflow-hidden rounded-[10px] bg-n-bg-elevated shadow-[var(--n-shadow-base-sm),0_0_0_1px_var(--n-border-secondary-translucent-a)] transition-[background] duration-100 hover:bg-n-card-hover-bg has-[[data-card-open]:focus-visible]:shadow-n-focus-shadow"
        >
          <CardActions className="opacity-0 group-hover/card:opacity-100 group-data-[hovered]/card:opacity-100 focus-within:opacity-100 pointer-coarse:opacity-100" onEdit={() => onOpenRow?.(row)} />
          <div aria-hidden className="h-[146px] overflow-hidden border-b border-n-border-secondary-translucent-a bg-n-bg-secondary-translucent-a px-2 pt-2" />
          <div className="flex flex-col gap-1.5 px-2.5 py-2">
            {/* Stretched title button: the whole card opens on click or Enter. */}
            <button type="button" data-card-open="" onClick={() => onOpenRow?.(row)}
              className="min-h-[23px] cursor-pointer truncate px-px text-left text-[15px] font-medium leading-[22.5px] outline-none after:absolute after:inset-0 focus-visible:shadow-none">
              {rowTitle(collection, row) || <span className="text-n-text-tertiary">New page</span>}
            </button>
            {props.map((p) => (row.values[p.id] !== undefined ? <PropertyValueView key={p.id} property={p} value={row.values[p.id]} size="sm" wrap /> : null))}
          </div>
        </div>
      ))}
      <div role="listitem" className="flex"><button
        type="button"
        onClick={() => db.addRow()}
        className="flex min-h-[185px] w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] text-[14px] text-n-text-tertiary opacity-0 transition-opacity hover:bg-n-button-hover-bg-a hover:opacity-100 focus-visible:opacity-100"
      >
        + New page
      </button></div>
    </div>
  );
}
