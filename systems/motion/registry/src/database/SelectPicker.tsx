import { forwardRef, useId, useMemo, useRef, useState, type HTMLAttributes, type KeyboardEvent } from 'react';
import { cn } from '../lib/cn';
import { Icon } from '../icons/Icon';
import { MenuLabel, MenuList } from '../components/Menu';
import { StatusPill, Tag } from '../atoms';
import type { SelectOption, StatusOption } from './types';

export interface SelectPickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: (SelectOption | StatusOption)[];
  /** Selected option ids. */
  value: string[];
  multi?: boolean;
  /** Render options as status pills (status property). */
  status?: boolean;
  onChange?: (ids: string[]) => void;
  /** Create a new option from the search text; return it so it can be selected. */
  onCreate?: (name: string) => SelectOption | undefined;
  /** Close request (Enter on single select, Escape). */
  onDone?: () => void;
  width?: number;
  autoFocus?: boolean;
}

/**
 * Select / multi-select / status picker (capture: db-select-picker). Measured:
 * surface 300 wide, radius 6, shadow outline-lg; token area padding 4 + inner 5.25/8, gap 6, bg token-input-menu-item-bg-a,
 * 1px bottom rule (border-primary-translucent-a); label "Select an option or create one" 12/500 text-secondary;
 * option rows 28px, padding 0 8, gap 8: drag handle 16 (icon-secondary) + tag + hover "…" button.
 */
export const SelectPicker = forwardRef<HTMLDivElement, SelectPickerProps>(function SelectPicker(
  { options, value, multi, status, onChange, onCreate, onDone, width = 300, autoFocus, className, style, ...props }, ref,
) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [navigated, setNavigated] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const inputId = `${listId}-input`;
  /* Focus stays in the search field (aria-activedescendant); Enter/Space also work if AT focuses an option. */
  const optionKeys = (e: KeyboardEvent, run: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); run(); }
  };
  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => options.filter((o) => o.name.toLowerCase().includes(q)), [options, q]);
  const canCreate = !!onCreate && q.length > 0 && !options.some((o) => o.name.toLowerCase() === q);
  const count = filtered.length + (canCreate ? 1 : 0);
  const Pill = status ? StatusPill : Tag;

  const toggle = (id: string) => {
    if (multi) onChange?.(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
    else { onChange?.(value[0] === id ? [] : [id]); onDone?.(); }
    setQuery('');
  };
  const create = () => {
    const o = onCreate?.(query.trim());
    if (o) { onChange?.(multi ? [...value, o.id] : [o.id]); if (!multi) onDone?.(); }
    setQuery('');
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setNavigated(true); setActive((a) => Math.min(count - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setNavigated(true); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (active < filtered.length) toggle(filtered[active].id);
      else if (canCreate) create();
    } else if (e.key === 'Backspace' && !query && value.length) onChange?.(value.slice(0, -1));
    else if (e.key === 'Escape') onDone?.();
  };

  return (
    <div
      ref={ref}
      className={cn('flex flex-col overflow-hidden rounded-n-md bg-n-bg-elevated shadow-n-shadow-outline-lg', className)}
      style={{ width, ...style }}
      {...props}
    >
      <div className="shadow-[inset_0_-1px_0_var(--n-border-primary-translucent-a)]">
        {/* The token area is the search field's label: a click anywhere in it focuses the field. */}
        <label
          htmlFor={inputId}
          className="flex cursor-text items-start bg-n-token-input-menu-item-bg-a p-1 text-[14px] leading-[21px]"
        >
          <div className="flex min-h-[31px] flex-1 flex-wrap items-center gap-1.5 px-2 py-[5.25px]">
            {value.map((id) => {
              const o = options.find((x) => x.id === id);
              if (!o) return null;
              return status
                ? <StatusPill key={id} color={o.color}>{o.name}</StatusPill>
                : <Tag key={id} color={o.color} onRemove={() => onChange?.(value.filter((x) => x !== id))}>{o.name}</Tag>;
            })}
            <input
              ref={input}
              id={inputId}
              role="combobox"
              aria-label={multi ? 'Search or create options' : 'Search or create an option'}
              aria-expanded
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={count > 0 ? `${listId}-${active}` : undefined}
              autoFocus={autoFocus}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActive(0); }}
              onKeyDown={onKey}
              placeholder={value.length ? '' : 'Search for an option…'}
              className="h-5 min-w-[60px] flex-1 bg-transparent text-[14px] leading-5 text-n-text-primary outline-none placeholder:text-n-text-tertiary"
            />
          </div>
        </label>
      </div>
      <MenuLabel id={`${listId}-label`} className="mx-1 mb-1 mt-2.5">{filtered.length || !canCreate ? 'Select an option or create one' : 'No matching options'}</MenuLabel>
      <MenuList id={listId} aria-labelledby={`${listId}-label`} aria-multiselectable={multi || undefined} className="max-h-[300px] overflow-y-auto pt-0">
        {filtered.map((o, i) => (
          <div
            key={o.id}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={value.includes(o.id)}
            data-highlighted={i === active && (query || navigated) ? '' : undefined}
            tabIndex={-1}
            onMouseEnter={() => setActive(i)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggle(o.id)}
            onKeyDown={(e) => optionKeys(e, () => toggle(o.id))}
            className="group/opt flex h-7 cursor-pointer items-center gap-2 rounded-n-md px-2 hover:bg-n-button-hover-bg-a data-[highlighted]:bg-n-button-hover-bg-a"
          >
            <span aria-hidden className="flex h-6 w-5 shrink-0 cursor-grab items-center justify-center text-n-icon-secondary">
              <Icon name="dragHandleFillSmall" size={16} />
            </span>
            <span className="mr-1.5 flex min-w-0 flex-1"><Pill color={o.color}>{o.name}</Pill></span>
            <span aria-hidden className="-mr-1.5 flex size-6 items-center justify-center rounded-n-md text-n-icon-secondary opacity-0 hover:bg-n-button-hover-bg-a group-hover/opt:opacity-100">
              <Icon name="ellipsisSmall" size={16} />
            </span>
          </div>
        ))}
        {canCreate && (
          <div
            id={`${listId}-${filtered.length}`}
            role="option"
            aria-selected={false}
            data-highlighted={active === filtered.length ? '' : undefined}
            tabIndex={-1}
            onMouseEnter={() => setActive(filtered.length)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={create}
            onKeyDown={(e) => optionKeys(e, create)}
            className="flex h-7 cursor-pointer items-center gap-2 rounded-n-md px-2 text-[14px] hover:bg-n-button-hover-bg-a data-[highlighted]:bg-n-button-hover-bg-a"
          >
            <span className="text-n-text-secondary">Create</span>
            <Pill color="default">{query.trim()}</Pill>
          </div>
        )}
      </MenuList>
    </div>
  );
});
