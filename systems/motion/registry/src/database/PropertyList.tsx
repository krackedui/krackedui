import { useContext, createContext, forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { Icon } from '../icons/Icon';
import { PropertyTypeIcon } from './PropertyTypeIcon';
import { PropertyCell } from './PropertyCell';
import type { Property, PropertyValue, Row, SelectOption } from './types';

export interface PropertyRowProps {
  property: Property;
  value: PropertyValue | undefined;
  onChange?: (value: PropertyValue) => void;
  onCreateOption?: (name: string) => SelectOption | undefined;
  today?: string;
}

const InTableCtx = createContext(false);

/**
 * One page property in the page header / side peek (capture: side-peek). Measured: row 34px, margin-bottom 4;
 * label cell 160 wide, padding 0 6, radius 6, text-secondary, icon 16 in an 18px slot, gap 6, 14/20;
 * value cell margin-left 4, padding 6, radius 4, hover bg button-hover-bg-a; empty shows "Empty" in text-tertiary.
 */
export function PropertyRow({ property: p, value, onChange, onCreateOption, today }: PropertyRowProps) {
  // Table semantics only inside a PropertyList; a standalone row is a plain label + value pair.
  const inTable = useContext(InTableCtx);
  return (
    <div role={inTable ? 'row' : undefined} className="mb-1 flex min-h-[34px]">
      <div role={inTable ? 'rowheader' : undefined} className="flex w-28 shrink-0 sm:w-40 cursor-pointer items-center rounded-n-md px-1.5 text-n-text-secondary hover:bg-n-button-hover-bg-a">
        <span className="flex items-center gap-1.5 leading-5">
          <span aria-hidden className="flex h-6 w-[18px] items-center justify-center text-n-icon-secondary"><PropertyTypeIcon type={p.type} size={16} /></span>
          <span className="truncate">{p.name}</span>
        </span>
      </div>
      <div role={inTable ? 'cell' : undefined} className="ml-1 flex min-w-0 flex-1 flex-col">
        <PropertyCell
          property={p}
          value={value}
          today={today}
          onChange={(v) => onChange?.(v)}
          onCreateOption={onCreateOption}
          empty={<span className="text-n-text-tertiary">Empty</span>}
          className="flex min-h-[34px] w-full items-center rounded-n-sm p-1.5 text-[14px] leading-5 hover:bg-n-button-hover-bg-a"
        />
      </div>
    </div>
  );
}

export interface PropertyListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  properties: Property[];
  row: Row;
  onChange?: (propertyId: string, value: PropertyValue) => void;
  onCreateOption?: (propertyId: string, name: string) => SelectOption | undefined;
  onAddProperty?: () => void;
  today?: string;
}

/** The property table under a database page's title (side peek / full page). Title property is omitted. */
export const PropertyList = forwardRef<HTMLDivElement, PropertyListProps>(function PropertyList(
  { properties, row, onChange, onCreateOption, onAddProperty, today, className, ...props }, ref,
) {
  return (
    <div ref={ref} className={cn('text-[14px]', className)} {...props}>
      <div role="table" aria-label="Page properties">
        <InTableCtx.Provider value>
          {properties.filter((p) => p.type !== 'title').map((p) => (
            <PropertyRow key={p.id} property={p} value={row.values[p.id]} today={today}
              onChange={(v) => onChange?.(p.id, v)} onCreateOption={(name) => onCreateOption?.(p.id, name)} />
          ))}
        </InTableCtx.Provider>
      </div>
      <button
        type="button"
        onClick={onAddProperty}
        className="flex h-[34px] cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-n-md pl-1.5 pr-2 leading-[16.8px] text-n-text-secondary hover:bg-n-button-hover-bg-a"
      >
        <Icon name="plusFillSmall" size={16} className="mt-px text-n-icon-tertiary" />
        Add a property
      </button>
    </div>
  );
});
