import { useState } from 'react';
import { Popover } from 'radix-ui';
import { cn } from '../lib/cn';
import { Icon } from '../icons/Icon';
import { Checkbox } from '../atoms';
import { RowPageIcon } from './rowIcon';
import { PropertyTypeIcon } from './PropertyTypeIcon';
import { PropertyCell } from './PropertyCell';
import { PropertyMenu } from './PropertyMenu';
import { useDatabaseContext } from './useDatabase';
import { groupRows, queryRows, visibleProperties } from './query';
import type { Property, Row } from './types';

export interface TableViewProps {
  /** Rows selected (row-selection checkboxes). Controlled optional. */
  selected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  /** Open a page (title cell "OPEN" button, row click on title). */
  onOpenRow?: (row: Row) => void;
  /** Render the property menu open for this property (lab / docs). */
  openPropertyMenu?: string;
  /** Force a hovered row (lab). */
  hoveredRowId?: string;
  /** Show a calculation footer ("Count 8"). The reference UI shows it only on hover / when set. */
  calculations?: boolean;
  today?: string;
}

const W_TITLE = 280; // db-table: title column 280
const W_DEFAULT = 200; // other columns 200

/**
 * Table view (capture: db-table). Measured: header row 36px (margin-left 8, inset 1px bottom rule
 * border-secondary-translucent-a, text-secondary 14/21, icons 16 icon-secondary, gap 6, padding 0 8);
 * body rows 37px (36 + 1px bottom rule), cells border-right 1px, padding 8 (title 7.5 8), title 500 weight with
 * 22px page icon; "+ New page" row 28px text-tertiary; selected row halo palette-ui-blue-200-a; checkbox gutter 36px.
 */
export function TableView({ selected: selectedProp, onSelectedChange, onOpenRow, openPropertyMenu, hoveredRowId, calculations, today }: TableViewProps) {
  const db = useDatabaseContext();
  const { collection } = db.data;
  const view = db.activeView;
  const [selectedState, setSelectedState] = useState<string[]>([]);
  const selected = selectedProp ?? selectedState;
  const setSelected = (ids: string[]) => { setSelectedState(ids); onSelectedChange?.(ids); };
  const [menuFor, setMenuFor] = useState<string | undefined>(openPropertyMenu);
  const [wrapped, setWrapped] = useState<string[]>([]);

  const props = visibleProperties(collection, view);
  const rows = queryRows(collection, db.data.rows, view);
  const groups = view.groupBy ? groupRows(collection, rows, view.groupBy) : null;
  const width = (p: Property) => view.widths?.[p.id] ?? (p.type === 'title' ? W_TITLE : W_DEFAULT);
  const total = props.reduce((s, p) => s + width(p), 0);
  const allSelected = rows.length > 0 && rows.every((r) => selected.includes(r.id));

  const resize = (p: Property, startX: number, startW: number) => {
    const move = (e: PointerEvent) => db.updateView(view.id, (v) => ({ widths: { ...v.widths, [p.id]: Math.max(80, startW + e.clientX - startX) } }));
    const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); };
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
  };

  const header = (
    <div role="row" className="group/header relative ml-2 flex h-9 bg-n-bg-primary text-n-text-secondary shadow-[inset_0_-1px_0_var(--n-border-secondary-translucent-a)]" style={{ width: total + 56 }}>
      <SelectBox header className="opacity-0 group-hover/header:opacity-100 focus-within:opacity-100 data-[on]:opacity-100" on={allSelected}
        onChange={(c) => setSelected(c ? rows.map((r) => r.id) : [])} label="Select all" />
      {props.map((p) => (
        <Popover.Root key={p.id} open={menuFor === p.id} onOpenChange={(o) => setMenuFor(o ? p.id : undefined)}>
          <div role="columnheader" className="relative flex h-9 shrink-0 overflow-hidden" style={{ width: width(p) }}>
            <Popover.Trigger asChild>
              <button type="button" aria-label={`${p.name} property options`} className="flex size-full cursor-pointer items-center px-2 text-left text-[14px] leading-[21px] hover:bg-n-button-hover-bg-a data-[state=open]:bg-n-button-hover-bg-a">
                <span className="flex min-w-0 items-center gap-1.5 leading-[16.8px]">
                  <span aria-hidden className="flex h-6 w-[18px] shrink-0 items-center justify-center text-n-icon-secondary"><PropertyTypeIcon type={p.type} size={16} /></span>
                  <span className="truncate">{p.name}</span>
                </span>
              </button>
            </Popover.Trigger>
            <span
              aria-hidden
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); resize(p, e.clientX, width(p)); }}
              className="absolute -right-0.5 top-0 z-10 h-full w-[5px] cursor-col-resize hover:bg-n-palette-ui-blue-200-a"
            />
          </div>
          <Popover.Portal>
            <Popover.Content role="presentation" side="bottom" align="start" sideOffset={4} alignOffset={-6} collisionPadding={8} className="motion-floating z-50 outline-none">
              <PropertyMenu
                property={p}
                wrap={wrapped.includes(p.id)}
                onToggleWrap={() => setWrapped((w) => (w.includes(p.id) ? w.filter((x) => x !== p.id) : [...w, p.id]))}
                onRename={(name) => db.updateProperty(p.id, { name })}
                onChangeType={(type) => db.updateProperty(p.id, { type, ...(type === 'select' || type === 'multi_select' || type === 'status' ? { options: 'options' in p ? p.options : [] } : {}) } as Partial<Property>)}
                onSort={(direction) => { db.updateView(view.id, (v) => ({ sorts: [...v.sorts.filter((s) => s.propertyId !== p.id), { propertyId: p.id, direction }] })); setMenuFor(undefined); }}
                onFilter={() => { db.updateView(view.id, (v) => ({ filters: [...v.filters, { id: `f-${Date.now()}`, propertyId: p.id, operator: p.type === 'checkbox' ? 'checked' : p.type === 'multi_select' || p.type === 'title' || p.type === 'text' ? 'contains' : 'is' }] })); setMenuFor(undefined); }}
                onGroup={() => { db.updateView(view.id, { groupBy: p.id }); setMenuFor(undefined); }}
                onHide={() => { db.updateView(view.id, (v) => ({ visible: (v.visible ?? collection.properties.map((x) => x.id)).filter((x) => x !== p.id) })); setMenuFor(undefined); }}
              />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      ))}
      <div role="columnheader" className="flex w-14 items-center justify-center">
        <button type="button" aria-label="Add property" className="flex size-7 cursor-pointer items-center justify-center rounded-n-md text-n-icon-secondary hover:bg-n-button-hover-bg-a">
          <Icon name="plusSmall" size={16} />
        </button>
      </div>
    </div>
  );

  const renderRow = (row: Row) => {
    const isSel = selected.includes(row.id);
    return (
      <div key={row.id} role="row" data-hovered={hoveredRowId === row.id ? '' : undefined}
        className={cn('group/row relative ml-2 flex', isSel && 'bg-n-palette-ui-blue-200-a')}>
        <SelectBox className="opacity-0 group-hover/row:opacity-100 group-data-[hovered]/row:opacity-100 focus-within:opacity-100 data-[on]:opacity-100" on={isSel}
          onChange={(c) => setSelected(c ? [...selected, row.id] : selected.filter((x) => x !== row.id))} label={`Select ${String(row.values[props.find((x) => x.type === 'title')?.id ?? ''] ?? 'row') || 'row'}`} />
        {props.map((p) => (
          <div key={p.id} role="cell"
            className="relative flex shrink-0 border-b border-r border-n-border-secondary-translucent-a"
            style={{ width: width(p) }}>
            <PropertyCell
              property={p}
              value={row.values[p.id]}
              today={today}
              onChange={(v) => db.updateRow(row.id, p.id, v)}
              onCreateOption={(name) => db.addOption(p.id, name)}
              className={cn('h-9 w-full min-w-0 overflow-hidden px-2 text-[14px] leading-[21px] hover:bg-n-table-row-hover-bg-a', p.type === 'title' ? 'py-[7.5px]' : 'py-2',
                wrapped.includes(p.id) ? 'h-auto min-h-9' : 'whitespace-nowrap')}
            >
              {p.type === 'title' ? (
                <div className="flex items-start gap-px">
                  <RowPageIcon className="-ml-0.5 mr-[3px] -mt-0.5" />
                  <span className="min-w-0 truncate font-medium leading-[21px]">{String(row.values[p.id] ?? '')}</span>
                </div>
              ) : undefined}
            </PropertyCell>
            {p.type === 'title' && (
              <button
                type="button"
                aria-label={`Open ${String(row.values[p.id] ?? '') || 'page'}`}
                onClick={() => onOpenRow?.(row)}
                className="absolute right-1.5 top-1.5 flex h-6 cursor-pointer focus-visible:shadow-n-focus-shadow items-center gap-1 rounded-n-sm bg-n-bg-elevated px-1.5 text-[12px] font-medium leading-[18px] tracking-[0.02em] text-n-text-secondary opacity-0 shadow-n-shadow-outline-md hover:bg-n-card-hover-bg focus-visible:opacity-100 group-hover/row:opacity-100 group-data-[hovered]/row:opacity-100 pointer-coarse:opacity-100"
              >
                <Icon name="peekSide" size={14} />
                OPEN
              </button>
            )}
          </div>
        ))}
        <div role="cell" className="w-14 shrink-0" />
      </div>
    );
  };

  const addRow = (values?: Row['values']) => db.addRow(values);

  return (
    <div className="relative pb-3" style={{ minWidth: total + 64 }}>
      <div role="table" aria-label={view.name} aria-rowcount={rows.length + 1}>
      {header}
      {groups ? groups.map((g) => (
        <div key={g.id} role="rowgroup" className="mt-2">
          <div role="row" className="ml-2 flex h-[42px] items-center">
            <div role="rowheader" aria-colspan={props.length} className="flex items-center gap-2 px-1 text-[14px] font-medium">
              <Icon name="arrowCaretDownFillSmall" size={12} className="text-n-icon-secondary" />
              <span>{g.label}</span>
              <span className="text-n-text-tertiary">{g.rows.length}</span>
            </div>
          </div>
          {g.rows.map(renderRow)}
        </div>
      )) : rows.map(renderRow)}
      </div>
      <button
        type="button"
        onClick={() => addRow()}
        className="ml-2 mt-[5px] flex h-7 cursor-pointer items-center rounded-n-md bg-n-bg-primary px-2 text-[14px] text-n-text-tertiary hover:bg-n-button-hover-bg-a"
      >
        <Icon name="plusSmall" size={16} className="mr-2" />
        New page
      </button>
      {calculations && (
        <div className="ml-2 flex h-8 text-[12px] text-n-text-tertiary">
          {props.map((p, i) => (
            <div key={p.id} className="flex shrink-0 items-center justify-end px-2" style={{ width: width(p) }}>
              {i === 0 ? <><span className="mr-1 uppercase tracking-[0.03em]">Count</span><span className="text-n-text-secondary">{rows.length}</span></> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Row selection checkbox in the 36px gutter left of the table (db-table: 16px box, border-strong-translucent ring). */
function SelectBox({ on, onChange, label, className, header }: { on: boolean; onChange: (c: boolean) => void; label: string; className?: string; header?: boolean }) {
  return (
    <div role={header ? 'columnheader' : 'cell'} data-on={on ? '' : undefined} className={cn('absolute -left-9 top-0 flex size-9 items-center justify-center transition-opacity', className)}>
      <Checkbox aria-label={label} checked={on} onCheckedChange={onChange} />
    </div>
  );
}
