import { forwardRef, useState, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { Icon } from '../icons/Icon';
import { MenuList, MenuSurface } from '../components/Menu';
import { DbMenuItem, DbMenuRule, DbMenuSearch, useMenuKeys } from './menuParts';
import { PropertyTypeIcon } from './PropertyTypeIcon';
import { StatusPill, Tag } from '../atoms';
import { operatorLabels, operatorsFor, optionsOf } from './query';
import type { Filter, Property, Sort } from './types';

/* ------------------------------------------------------------------ */
/* Property picker: the body of "Filter by…" and "Sort by…" menus      */
/* ------------------------------------------------------------------ */

export interface PropertyPickerMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  properties: Property[];
  placeholder: string;
  onSelect?: (property: Property) => void;
  /** Footer row ("Add advanced filter"). */
  footer?: { label: string; onSelect?: () => void };
  /** Highlight the first row (as captured: keyboard focus starts on "Task"). */
  highlightFirst?: boolean;
  autoFocus?: boolean;
  width?: number;
}

/**
 * Property list with search (captures: db-filter-menu "Filter by…", db-sort-menu "Sort by…"). Measured: 290 wide,
 * radius 10, search 28px placed 12px in; rows 28px with the property-type icon (icon-primary) in a 24px slot, text at 40px;
 * footer separated by an inset rule, text-secondary with a 20px plus.
 */
export const PropertyPickerMenu = forwardRef<HTMLDivElement, PropertyPickerMenuProps>(function PropertyPickerMenu(
  { properties, placeholder, onSelect, footer, highlightFirst, autoFocus, width = 290, onKeyDown, ...props }, ref,
) {
  const [q, setQ] = useState('');
  const keys = useMenuKeys();
  const list = properties.filter((p) => p.name.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <MenuSurface ref={ref} width={width} onKeyDown={(e) => { keys(e); onKeyDown?.(e); }} {...props}>
      <DbMenuSearch placeholder={placeholder} value={q} onChange={(e) => setQ(e.target.value)} autoFocus={autoFocus}
        onKeyDown={(e) => { if (e.key === 'Enter' && list[0]) onSelect?.(list[0]); }} />
      <MenuList role="group" className="max-h-[300px] overflow-y-auto">
        {list.map((p, i) => (
          <DbMenuItem
            key={p.id}
            highlighted={highlightFirst && i === 0 && !q}
            icon={<PropertyTypeIcon type={p.type} size={16} className="text-n-icon-primary" />}
            className="[&>span:first-child]:w-6"
            onClick={() => onSelect?.(p)}
          >
            {p.name}
          </DbMenuItem>
        ))}
        {!list.length && <div className="px-2 py-1 text-[14px] text-n-text-secondary">No results</div>}
      </MenuList>
      {footer && (
        <>
          <DbMenuRule />
          <MenuList role="group">
            <DbMenuItem icon="plus" className="text-n-text-secondary [&>span:first-child]:text-n-icon-secondary" onClick={footer.onSelect}>{footer.label}</DbMenuItem>
          </MenuList>
        </>
      )}
    </MenuSurface>
  );
});

/** "Filter by…" menu (db-filter-menu). */
export const FilterMenu = forwardRef<HTMLDivElement, Omit<PropertyPickerMenuProps, 'placeholder' | 'footer'> & { onAdvanced?: () => void }>(
  function FilterMenu({ onAdvanced, ...props }, ref) {
    return <PropertyPickerMenu ref={ref} placeholder="Filter by…" footer={{ label: 'Add advanced filter', onSelect: onAdvanced }} {...props} />;
  },
);

/** "Sort by…" menu (db-sort-menu). */
export const SortMenu = forwardRef<HTMLDivElement, Omit<PropertyPickerMenuProps, 'placeholder' | 'footer'>>(function SortMenu(props, ref) {
  return <PropertyPickerMenu ref={ref} placeholder="Sort by…" {...props} />;
});

/* ------------------------------------------------------------------ */
/* Filter rule editor (opened from a filter pill)                      */
/* ------------------------------------------------------------------ */

export interface FilterEditorProps {
  property: Property;
  filter: Filter;
  onChange: (f: Filter) => void;
  onRemove: () => void;
}

/** The popover behind a filter pill: "Status  is ▾" + value picker (options checklist / text / date) + delete. */
export function FilterEditor({ property: p, filter, onChange, onRemove }: FilterEditorProps) {
  const ops = operatorsFor[p.type];
  const [opsOpen, setOpsOpen] = useState(false);
  const values = Array.isArray(filter.value) ? filter.value : filter.value !== undefined && filter.value !== '' ? [String(filter.value)] : [];
  const needsValue = !['is_empty', 'is_not_empty', 'checked', 'unchecked'].includes(filter.operator);
  const options = optionsOf(p);
  return (
    <MenuSurface width={290}>
      <div className="flex items-center gap-1 px-3 pt-2.5 text-[12px] leading-4 text-n-text-secondary">
        <span className="font-medium">{p.name}</span>
        <div className="relative">
          <button type="button" aria-expanded={opsOpen} onClick={() => setOpsOpen(!opsOpen)}
            className="flex h-5 cursor-pointer items-center gap-0.5 rounded-n-sm px-1 font-medium hover:bg-n-button-hover-bg-a">
            {operatorLabels[filter.operator].toLowerCase()}
            <Icon name="arrowChevronSingleDownSmall" size={12} />
          </button>
          {opsOpen && (
            <MenuSurface width={180} className="absolute left-0 top-6 z-10">
              <MenuList role="group">
                {ops.map((op) => (
                  <DbMenuItem key={op} checked={op === filter.operator} onClick={() => { onChange({ ...filter, operator: op }); setOpsOpen(false); }}>
                    {operatorLabels[op]}
                  </DbMenuItem>
                ))}
              </MenuList>
            </MenuSurface>
          )}
        </div>
        <button type="button" aria-label="Delete filter" onClick={onRemove}
          className="ml-auto flex size-6 cursor-pointer items-center justify-center rounded-n-md text-n-icon-secondary hover:bg-n-button-hover-bg-a">
          <Icon name="trash" size={16} />
        </button>
      </div>
      {needsValue && (options.length ? (
        <MenuList role="group">
          {options.map((o) => {
            const on = values.includes(o.id);
            return (
              <DbMenuItem key={o.id}
                icon={<span className={cn('flex size-4 items-center justify-center rounded-n-xs', on ? 'bg-n-blue-icon-accent-primary text-n-text-on-solid' : 'shadow-[inset_0_0_0_1px_var(--n-border-strong-translucent-a)]')}>{on && <Icon name="checkmarkSmall" size={14} />}</span>}
                onClick={() => onChange({ ...filter, value: on ? values.filter((v) => v !== o.id) : [...values, o.id] })}>
                {p.type === 'status' ? <StatusPill color={o.color}>{o.name}</StatusPill> : <Tag color={o.color}>{o.name}</Tag>}
              </DbMenuItem>
            );
          })}
        </MenuList>
      ) : (
        <DbMenuSearch
          autoFocus
          type={p.type === 'date' || p.type === 'created_time' ? 'date' : p.type === 'number' ? 'number' : 'text'}
          placeholder="Type a value…"
          value={values[0] ?? ''}
          onChange={(e) => onChange({ ...filter, value: e.target.value })}
        />
      ))}
      {!needsValue && <div className="h-2" />}
    </MenuSurface>
  );
}

/** The popover behind the sort pill: one row per sort with direction toggle and remove. */
export function SortEditor({ properties, sorts, onChange, onAdd }: { properties: Property[]; sorts: Sort[]; onChange: (s: Sort[]) => void; onAdd?: () => void }) {
  return (
    <MenuSurface width={320}>
      <MenuList role="group">
        {sorts.map((s, i) => {
          const p = properties.find((x) => x.id === s.propertyId);
          if (!p) return null;
          return (
            <div key={s.propertyId} className="flex h-8 items-center gap-2 px-2 text-[14px]">
              <Icon name="dragHandleFillSmall" size={16} className="text-n-icon-tertiary" />
              <span className="flex h-7 flex-1 items-center gap-1.5 rounded-n-md px-2 shadow-[0_0_0_1px_var(--n-border-primary-translucent-a)]">
                <PropertyTypeIcon type={p.type} size={16} className="text-n-icon-secondary" />{p.name}
              </span>
              <button type="button" onClick={() => onChange(sorts.map((x, j) => (j === i ? { ...x, direction: x.direction === 'ascending' ? 'descending' : 'ascending' } : x)))}
                className="flex h-7 cursor-pointer focus-visible:shadow-n-focus-shadow items-center gap-1 rounded-n-md px-2 shadow-[0_0_0_1px_var(--n-border-primary-translucent-a)] hover:bg-n-button-hover-bg-a">
                {s.direction === 'ascending' ? 'Ascending' : 'Descending'}
                <Icon name="arrowChevronSingleDownSmall" size={14} className="text-n-icon-tertiary" />
              </button>
              <button type="button" aria-label="Remove sort" onClick={() => onChange(sorts.filter((_, j) => j !== i))}
                className="flex size-6 cursor-pointer items-center justify-center rounded-n-md text-n-icon-tertiary hover:bg-n-button-hover-bg-a">
                <Icon name="xMarkSmall" size={16} />
              </button>
            </div>
          );
        })}
      </MenuList>
      <DbMenuRule />
      <MenuList role="group">
        <DbMenuItem icon="plus" className="text-n-text-secondary" onClick={onAdd}>Add sort</DbMenuItem>
        <DbMenuItem icon="trash" className="text-n-text-secondary" onClick={() => onChange([])}>Delete sort</DbMenuItem>
      </MenuList>
    </MenuSurface>
  );
}
