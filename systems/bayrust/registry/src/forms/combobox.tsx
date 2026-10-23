'use client';

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react';
import { cn } from '../lib/cn';
import { Icon } from '../foundations/icon';
import type { Option } from './choice';
import { useFieldControl } from './field';
import { useControllable } from '../lib/use-controllable';
import { Portal, useAnchored, useDismiss } from '../lib/overlay';

type Size = 'sm' | 'md' | 'lg';

export interface ComboboxProps {
  className?: string;
  style?: CSSProperties;
  id?: string;
  options: Option[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: React.ReactNode;
  size?: Size;
  disabled?: boolean;
  invalid?: boolean;
  /** Names the control when it is not inside a Field. */
  label?: string;
}

/**
 * A select you can type into.
 *
 * `Select` is the native element and should stay the default; this is for the case `Select` cannot
 * serve — a long list that needs filtering, or options that carry an icon and a description.
 *
 * The listbox follows the ARIA combobox pattern: the input keeps focus and owns the keyboard, and
 * the active option is pointed at with `aria-activedescendant` rather than by moving focus.
 */
export function Combobox({
  className, style, id, options, value, defaultValue = '', onValueChange, placeholder = 'Select…',
  searchPlaceholder = 'Search…', emptyText = 'Nothing matches', size = 'md', disabled, invalid, label,
}: ComboboxProps) {
  const field = useFieldControl();
  const uid = useId();
  const [selected, setSelected] = useControllable<string>(value, defaultValue, onValueChange);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pos = useAnchored(open, triggerRef, panelRef, 'bottom', 'start');

  useDismiss(open, () => {
    setOpen(false);
    triggerRef.current?.focus();
  }, [panelRef, triggerRef]);

  // An option's label is a ReactNode, which may be an element: only text can be searched, so a
  // non-text label falls back to its value rather than being stringified into "[object Object]".
  const text = (o: Option) => (typeof o.label === 'string' || typeof o.label === 'number' ? String(o.label) : o.value);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => text(o).toLowerCase().includes(q) || o.value.toLowerCase().includes(q));
    // `text` is pure and derived from the option alone
     
  }, [options, query]);

  const chosen = options.find((o) => o.value === selected);

  const commit = (option: Option) => {
    if (option.disabled) return;
    setSelected(option.value);
    setOpen(false);
    setQuery('');
    triggerRef.current?.focus();
  };

  const openPanel = () => {
    setOpen(true);
    setActive(0);
  };

  // The search field takes focus once the panel is in the document. An effect, not a rAF callback:
  // the input does not exist until this render commits, and a frame is not a guarantee that it does.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => {
        const next = e.key === 'ArrowDown' ? i + 1 : i - 1;
        return Math.max(0, Math.min(matches.length - 1, next));
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const option = matches[active];
      if (option) commit(option);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(Math.max(0, matches.length - 1));
    }
  };

  const listId = `${uid}-list`;
  const optionId = (i: number) => `${uid}-opt-${i}`;

  return (
    <span className={cn('bay-combobox', className)} style={style}>
      <button
        ref={triggerRef}
        type="button"
        id={id ?? field?.controlId}
        className={cn('bay-combobox__trigger', `bay-input--${size}`)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        data-invalid={invalid || field?.invalid ? '' : undefined}
        aria-describedby={field?.describedBy}
        aria-label={label}
        data-placeholder={chosen ? undefined : ''}
        onClick={() => (open ? setOpen(false) : openPanel())}
      >
        {chosen?.icon && <Icon name={chosen.icon} size={14} className="bay-combobox__optionIcon" />}
        <span className="bay-combobox__value">{chosen ? chosen.label : placeholder}</span>
        <Icon name="chevronsUpDown" size={14} className="bay-combobox__caret" />
      </button>
      {open && (
        <Portal>
          <div
            ref={panelRef}
            className="bay-combobox__panel"
            style={pos ? { top: pos.top, left: pos.left, minWidth: triggerRef.current?.offsetWidth } : { opacity: 0 }}
          >
            <div className="bay-combobox__search">
              <Icon name="search" size={14} />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                className="bay-combobox__input"
                placeholder={searchPlaceholder}
                value={query}
                aria-autocomplete="list"
                aria-controls={listId}
                aria-expanded={open}
                aria-activedescendant={matches.length ? optionId(active) : undefined}
                aria-label={label ?? searchPlaceholder}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onInputKeyDown}
              />
            </div>
            <div id={listId} role="listbox" className="bay-combobox__list" aria-label={label ?? 'Options'}>
              {matches.length === 0 && <div className="bay-combobox__empty">{emptyText}</div>}
              {matches.map((o, i) => (
                <button
                  key={o.value}
                  type="button"
                  id={optionId(i)}
                  role="option"
                  /* a button, so it is focusable and interactive by construction; tabIndex -1 keeps
                     the keyboard with the input, which is what the combobox pattern asks for */
                  tabIndex={-1}
                  className="bay-combobox__option"
                  aria-selected={o.value === selected}
                  disabled={o.disabled}
                  data-active={i === active ? '' : undefined}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => commit(o)}
                >
                  {o.icon && <Icon name={o.icon} size={14} className="bay-combobox__optionIcon" />}
                  <span className="bay-combobox__optionLabel">
                    {o.label}
                    {o.description && <span className="bay-combobox__optionDescription">{o.description}</span>}
                  </span>
                  {o.value === selected && <Icon name="check" size={14} />}
                </button>
              ))}
            </div>
          </div>
        </Portal>
      )}
    </span>
  );
}
