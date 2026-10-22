import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Popover } from 'radix-ui';
import { cn } from '../lib/cn';
import { Checkbox } from '../atoms';
import { SelectPicker } from './SelectPicker';
import { DateCellPicker } from './DateCellPicker';
import { PropertyValueView } from './PropertyValue';
import type { Property, PropertyValue, SelectOption } from './types';
import { ThemePortal } from '../foundations/ThemePortal';

export interface PropertyCellProps {
  property: Property;
  value: PropertyValue | undefined;
  onChange: (value: PropertyValue) => void;
  onCreateOption?: (name: string) => SelectOption | undefined;
  /** Custom display (title cell with icon + OPEN button). Defaults to PropertyValueView. */
  children?: ReactNode;
  className?: string;
  /** Class for the inline <input> used by text-like types. */
  inputClassName?: string;
  /** Placeholder for empty display (side peek: "Empty"). */
  empty?: ReactNode;
  /** "Today" for the date picker. */
  today?: string;
  /** Display size for tags. */
  size?: 'md' | 'sm';
}

const TEXT_TYPES = new Set(['title', 'text', 'number', 'url', 'email', 'phone']);

/**
 * An editable property value: the click target of a table cell or a side-peek property row.
 * select/multi-select/status open the SelectPicker over the cell (aligned to its top-left);
 * date opens the DateCellPicker below; checkbox toggles; text-like types edit inline.
 */
export function PropertyCell({ property: p, value, onChange, onCreateOption, children, className, inputClassName, empty, today, size }: PropertyCellProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(36);
  const checkboxId = useId();
  useLayoutEffect(() => { if (open && ref.current) setH(ref.current.offsetHeight); }, [open]);

  const display = children ?? (
    <PropertyValueView property={p} value={value} size={size} empty={empty} onToggle={(c) => onChange(c)} />
  );

  if (p.type === 'checkbox') {
    // The whole cell is the checkbox's label, so a click anywhere in it toggles the value.
    return (
      <div ref={ref} className={cn('flex', className)}>
        <label htmlFor={checkboxId} className="flex min-h-full flex-1 cursor-pointer items-center">
          <Checkbox id={checkboxId} aria-label={p.name} checked={!!value} onCheckedChange={(c) => onChange(c)} onClick={(e) => e.stopPropagation()} />
        </label>
      </div>
    );
  }

  if (TEXT_TYPES.has(p.type)) {
    if (editing) {
      return (
        <div ref={ref} className={cn(className)}>
          <input
            autoFocus
            defaultValue={value === null || value === undefined ? '' : String(value)}
            onBlur={(e) => { commit(e.target.value); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              if (e.key === 'Escape') setEditing(false);
            }}
            className={cn('w-full bg-transparent text-inherit outline-none', p.type === 'title' && 'font-medium', inputClassName)}
          />
        </div>
      );
    }
    return <div ref={ref} role="button" tabIndex={0} className={cn('cursor-text', className)} onClick={() => setEditing(true)} onKeyDown={(e) => e.key === 'Enter' && setEditing(true)}>{display}</div>;
  }

  function commit(raw: string) {
    setEditing(false);
    if (p.type === 'number') onChange(raw.trim() === '' ? null : Number(raw));
    else onChange(raw);
  }

  if (p.type === 'select' || p.type === 'multi_select' || p.type === 'status' || p.type === 'date') {
    const isDate = p.type === 'date';
    const ids = Array.isArray(value) ? value : value ? [String(value)] : [];
    return (
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Anchor asChild>
          <div ref={ref} role="button" tabIndex={0} aria-haspopup="dialog" aria-expanded={open} className={cn('cursor-pointer', className)}
            onClick={() => setOpen(true)} onKeyDown={(e) => e.key === 'Enter' && setOpen(true)}>
            {display}
          </div>
        </Popover.Anchor>
        <ThemePortal primitive={Popover.Portal}>
          <Popover.Content
            aria-label={p.name}
            side="bottom"
            align="start"
            sideOffset={isDate ? 4 : -h}
            alignOffset={isDate ? 0 : -1}
            collisionPadding={8}
            className="motion-floating z-50 outline-none"
            onOpenAutoFocus={(e) => { if (isDate) e.preventDefault(); }}
          >
            {isDate ? (
              <DateCellPicker value={(value as string | null) ?? null} today={today} onChange={(v) => onChange(v)} />
            ) : (
              <SelectPicker
                autoFocus
                options={p.options}
                value={ids}
                multi={p.type === 'multi_select'}
                status={p.type === 'status'}
                width={Math.max(300, ref.current?.offsetWidth ?? 0)}
                onChange={(next) => onChange(p.type === 'multi_select' ? next : next[0] ?? null)}
                onCreate={p.type === 'status' ? undefined : onCreateOption}
                onDone={() => setOpen(false)}
              />
            )}
          </Popover.Content>
        </ThemePortal>
      </Popover.Root>
    );
  }

  return <div ref={ref} className={className}>{display}</div>;
}
