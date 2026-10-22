import { Icon } from '../icons/Icon';
import { RowPageIcon } from './rowIcon';
import { PropertyValueView } from './PropertyValue';
import { useDatabaseContext } from './useDatabase';
import { queryRows, rowTitle, visibleProperties } from './query';
import type { Row } from './types';

export interface ListViewProps {
  onOpenRow?: (row: Row) => void;
  hoveredRowId?: string;
}

/**
 * List view (capture: db-list). Measured: inset 8px, padding 4 0; rows 30px with 1px vertical margin,
 * radius 6, padding-left 4; 22px page icon (mr 5) + 14/21 500 title; properties right-aligned as `sm` pills
 * (18px, 13px) in a padding 0 8 cell; hover bg button-hover-bg-a with a pencil edit button after the title;
 * "+ New page" 30px text-tertiary.
 */
export function ListView({ onOpenRow, hoveredRowId }: ListViewProps) {
  const db = useDatabaseContext();
  const { collection } = db.data;
  const view = db.activeView;
  const rows = queryRows(collection, db.data.rows, view);
  const props = visibleProperties(collection, view).filter((p) => p.type !== 'title');
  return (
    <div className="ml-2 mr-2 flex flex-col py-1 sm:mr-5">
      <div role="list" aria-label={view.name} className="flex flex-col">
      {rows.map((row) => (
        <div key={row.id} role="listitem" className="my-px">
          <button
            type="button"
            data-hovered={hoveredRowId === row.id ? '' : undefined}
            onClick={() => onOpenRow?.(row)}
            className="group/row relative flex h-[30px] w-full cursor-pointer items-center overflow-hidden rounded-n-md pl-1 text-left text-n-text-primary hover:bg-n-button-hover-bg-a data-[hovered]:bg-n-button-hover-bg-a pointer-coarse:h-11"
          >
            <div className="flex min-w-0 flex-1 items-center pr-2 text-[14px] leading-[21px]">
              <RowPageIcon className="mr-[5px]" />
              <span className="mr-[5px] truncate font-medium">{rowTitle(collection, row) || <span className="text-n-text-tertiary">New page</span>}</span>
              <span aria-hidden className="ml-1 hidden h-6 items-center rounded-n-md bg-n-bg-elevated px-1.5 text-n-icon-secondary shadow-n-shadow-outline-sm group-hover/row:flex group-data-[hovered]/row:flex">
                <Icon name="pencilLineSmall" size={16} />
              </span>
            </div>
            {props.map((p) => (
              <div key={p.id} className="flex h-[30px] shrink-0 items-center px-2 text-[14px] leading-[21px] max-sm:hidden">
                <PropertyValueView property={p} value={row.values[p.id]} size="sm" />
              </div>
            ))}
          </button>
        </div>
      ))}
      </div>
      <button
        type="button"
        onClick={() => db.addRow()}
        className="flex h-[30px] cursor-pointer items-center whitespace-nowrap rounded-n-md pl-1.5 pr-2 text-[14px] leading-[21px] text-n-text-tertiary hover:bg-n-button-hover-bg-a"
      >
        <Icon name="plusSmall" size={16} className="ml-px mr-2 text-n-icon-tertiary" />
        New page
      </button>
    </div>
  );
}
