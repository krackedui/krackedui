import { forwardRef, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { Popover as RPopover } from 'radix-ui';
import { cn } from '../lib/cn';
import { tv } from '../lib/tv';
import { Icon } from '../icons/Icon';
import { Tag } from '../atoms/Tag';
import { Popover } from '../components/Popover';
import { useFieldProps } from './Field';
import { optionText, selectVariants, type ControlOption } from './Select';
import { controlBox, controlDisabled, controlFocusVisible, controlInvalid, controlSizes, useControllableState } from './internal';

/**
 * Combobox: the Select trigger plus a popover with a search field (the menu search: 28px, magnifier,
 * input-blue-focus-ring) above a filtered list of menu rows.
 */
export const comboboxVariants = tv({
  slots: {
    trigger: [controlBox, controlFocusVisible, 'cursor-pointer gap-1.5 text-left'],
    value: 'min-w-0 flex-1 truncate',
    chips: 'flex min-w-0 flex-1 flex-wrap items-center gap-1 py-0.5',
    placeholder: 'min-w-0 flex-1 truncate text-n-text-secondary',
    chevron: 'shrink-0 text-n-icon-tertiary',
    content: 'flex min-w-[200px] max-w-[calc(100vw-16px)] flex-col',
    search: 'p-1 pb-0',
    searchBox: [controlBox, controlSizes.md, 'focus-within:shadow-n-input-blue-focus-ring gap-1.5'],
    input: 'min-w-0 flex-1 bg-transparent text-[14px] text-n-text-primary outline-none placeholder:text-n-text-tertiary focus-visible:shadow-none',
    list: 'flex max-h-[min(280px,calc(var(--radix-popover-content-available-height)-48px))] flex-col gap-px overflow-y-auto p-1',
    empty: 'px-2 py-3 text-center text-[14px] leading-5 text-n-text-secondary',
  },
  variants: {
    size: {
      sm: { trigger: controlSizes.sm },
      md: { trigger: controlSizes.md },
      lg: { trigger: controlSizes.lg },
    },
    invalid: { true: { trigger: controlInvalid } },
    disabled: { true: { trigger: controlDisabled } },
    // Multiple: the trigger grows to fit wrapped chips (min height = the size's height).
    multiple: { true: { trigger: 'h-auto' } },
  },
  compoundVariants: [
    { multiple: true, size: 'sm', class: { trigger: 'min-h-6' } },
    { multiple: true, size: 'md', class: { trigger: 'min-h-7' } },
    { multiple: true, size: 'lg', class: { trigger: 'min-h-8' } },
  ],
  defaultVariants: { size: 'md' },
});

interface ComboboxBaseProps {
  options: ControlOption[];
  /** Trigger text when nothing is selected. */
  placeholder?: string;
  /** Search field placeholder (also its accessible name). */
  searchPlaceholder?: string;
  /** Shown when no option matches the search. */
  emptyText?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  /** Form field name (a hidden input carries the value). */
  name?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Custom matcher. Default: case- and accent-insensitive "contains" on the option text. */
  filter?: (option: ControlOption, query: string) => boolean;
  id?: string;
  className?: string;
  style?: CSSProperties;
  /** Class for the popover. */
  contentClassName?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

/** One value (the contract Combobox). */
export interface ComboboxSingleProps extends ComboboxBaseProps {
  /** Pick several values (Motion extra). */
  multiple?: false;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

/** Several values (Motion extra): chips in the trigger; Enter or a click toggles an option and keeps the list open. */
export interface ComboboxMultipleProps extends ComboboxBaseProps {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps;

const toList = (v: string | string[] | undefined): string[] | undefined => (v === undefined ? undefined : Array.isArray(v) ? v : v ? [v] : []);

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const defaultFilter = (o: ControlOption, q: string) => fold(optionText(o)).includes(fold(q.trim()));

/**
 * Combobox: a searchable select for long lists (countries, people, projects). Type to filter, arrows to move,
 * Enter to pick, Escape to close. With `multiple`, Enter or a click toggles options (the list stays open), chips
 * show the selection and Backspace in the empty search removes the last one. For under ~15 options use Select.
 */
export const Combobox = forwardRef<HTMLButtonElement, ComboboxProps>(function Combobox(props, ref) {
  const fieldProps = useFieldProps(props);
  const {
    options, value: valueProp, defaultValue, placeholder = 'Select…', searchPlaceholder = 'Search…',
    emptyText = 'No results', size, invalid, disabled, required, name, open: openProp, defaultOpen = false, onOpenChange,
    filter = defaultFilter, id, className, style, contentClassName,
    'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, 'aria-describedby': ariaDescribedBy,
  } = fieldProps;
  const multiple = fieldProps.multiple === true;
  // One state for both modes: the selected values as a list (single mode holds at most one).
  const [values, setValues] = useControllableState<string[]>(toList(valueProp), toList(defaultValue) ?? [], (next) => {
    if (fieldProps.multiple) fieldProps.onValueChange?.(next);
    else fieldProps.onValueChange?.(next[0] ?? '');
  });
  const value = values[0] ?? '';
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const listId = `${uid}-list`;
  const optionId = (v: string) => `${uid}-opt-${options.findIndex((o) => o.value === v)}`;

  const selected = options.find((o) => o.value === value);
  const selectedOptions = values.map((v) => options.find((o) => o.value === v)).filter((o): o is ControlOption => !!o);
  const matches = useMemo(() => (query ? options.filter((o) => filter(o, query)) : options), [options, query, filter]);
  const enabled = matches.filter((o) => !o.disabled);

  // Reset the search when closing; when opening or filtering, highlight the selected option or the first match.
  useEffect(() => { if (!open) setQuery(''); }, [open]);
  useEffect(() => {
    if (!open) return;
    setActive((cur) => {
      if (cur && enabled.some((o) => o.value === cur)) return cur;
      if (!query && enabled.some((o) => o.value === value)) return value;
      return enabled[0]?.value ?? null;
    });
  }, [open, query, enabled, value]);
  useEffect(() => {
    if (!open || !active) return;
    const el = listRef.current?.querySelector(`[id="${optionId(active)}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  });

  const choose = (o: ControlOption) => {
    if (o.disabled) return;
    if (multiple) {
      setValues(values.includes(o.value) ? values.filter((v) => v !== o.value) : [...values, o.value]);
      return;
    }
    setValues([o.value]);
    setOpen(false);
  };
  const removeLast = () => { if (values.length) setValues(values.slice(0, -1)); };
  const move = (delta: number) => {
    if (!enabled.length) return;
    const i = enabled.findIndex((o) => o.value === active);
    const next = i < 0 ? (delta > 0 ? 0 : enabled.length - 1) : (i + delta + enabled.length) % enabled.length;
    setActive(enabled[next].value);
  };
  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'PageDown') { e.preventDefault(); move(10); }
    else if (e.key === 'PageUp') { e.preventDefault(); move(-10); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const o = enabled.find((x) => x.value === active);
      if (o) choose(o);
    }
    else if (multiple && e.key === 'Backspace' && !query) { e.preventDefault(); removeLast(); }
  };
  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setOpen(true); }
    else if (multiple && (e.key === 'Backspace' || e.key === 'Delete')) { e.preventDefault(); removeLast(); }
    else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey && e.key !== ' ') {
      // Typing on the closed trigger opens it and starts the search.
      e.preventDefault();
      setQuery(e.key);
      setOpen(true);
    }
  };

  const s = comboboxVariants({ size, invalid, disabled, multiple });
  const summaryId = `${uid}-summary`;
  // The trigger's name is its label, so the current value is announced through its description.
  const summary = multiple ? (selectedOptions.length ? `${selectedOptions.map(optionText).join(', ')} selected` : 'None selected') : selected ? optionText(selected) : '';
  return (
    <RPopover.Root open={open} onOpenChange={setOpen}>
      <RPopover.Trigger asChild>
        <button
          ref={ref}
          type="button"
          id={id}
          disabled={disabled}
          className={s.trigger({ className })}
          style={style}
          onKeyDown={onTriggerKeyDown}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          // APG: a button that opens a dialog (search field + listbox), unlike Select, whose trigger is a select-only
          // combobox because its popup is the listbox itself. Two nested comboboxes would be ambiguous.
          aria-haspopup="dialog"
          aria-describedby={summary ? [summaryId, ariaDescribedBy].filter(Boolean).join(' ') : ariaDescribedBy}
        >
          {multiple ? (
            selectedOptions.length ? (
              <span className={s.chips()} aria-hidden="true">
                {selectedOptions.map((o) => <Tag key={o.value} size="sm">{o.label}</Tag>)}
              </span>
            ) : <span className={s.placeholder()}>{placeholder}</span>
          ) : selected ? <span className={s.value()}>{selected.label}</span> : <span className={s.placeholder()}>{placeholder}</span>}
          <Icon name="arrowChevronSingleDownSmall" size={16} className={s.chevron()} />
        </button>
      </RPopover.Trigger>
      {summary && <span id={summaryId} hidden>{summary}</span>}
      {name && !multiple && <input type="hidden" name={name} value={value} required={required} />}
      {name && multiple && values.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
      <Popover.Content
        className={s.content({ className: contentClassName })}
        style={{ width: 'var(--radix-popover-trigger-width)' }}
        aria-label={searchPlaceholder}
        onOpenAutoFocus={(e) => { e.preventDefault(); inputRef.current?.focus(); }}
      >
        <div className={s.search()}>
          <label className={s.searchBox()}>
            <Icon name="magnifyingGlassSmall" size={16} className="shrink-0 text-n-icon-secondary" />
            <input
              ref={inputRef}
              role="combobox"
              aria-expanded="true"
              aria-controls={matches.length > 0 ? listId : undefined}
              aria-autocomplete="list"
              aria-activedescendant={active ? optionId(active) : undefined}
              aria-label={searchPlaceholder}
              placeholder={searchPlaceholder}
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              className={s.input()}
            />
          </label>
        </div>
        {matches.length > 0 ? (
        <div ref={listRef} id={listId} role="listbox" aria-label={placeholder} aria-multiselectable={multiple || undefined} className={s.list()}>
          {matches.map((o) => {
            const isSelected = values.includes(o.value);
            const isActive = o.value === active;
            const row = selectVariants();
            return (
              <div
                key={o.value}
                id={optionId(o.value)}
                role="option"
                aria-selected={isSelected}
                aria-disabled={o.disabled || undefined}
                data-highlighted={isActive ? '' : undefined}
                data-disabled={o.disabled ? '' : undefined}
                className={row.item()}
                onPointerMove={() => { if (!o.disabled && active !== o.value) setActive(o.value); }}
                onPointerDown={(e) => e.preventDefault() /* keep focus in the search field */}
                onClick={() => choose(o)}
                // Options are reached through aria-activedescendant from the search field; these only matter if one is focused directly.
                tabIndex={-1}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(o); } }}
              >
                {o.icon && <span className={row.itemIcon()}><Icon name={o.icon} size={20} /></span>}
                <span className={row.itemText()}>
                  <span className="truncate">{o.label}</span>
                  {o.description && <span className={row.itemDescription()}>{o.description}</span>}
                </span>
                {isSelected && <span className={cn(row.check())}><Icon name="checkmarkSmall" size={16} /></span>}
              </div>
            );
          })}
        </div>
        ) : (
          <div className={s.empty()}>{emptyText}</div>
        )}
        <div aria-live="polite" className="sr-only">{open && query ? `${enabled.length} result${enabled.length === 1 ? '' : 's'}` : ''}</div>
      </Popover.Content>
    </RPopover.Root>
  );
});
