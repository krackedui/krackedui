import { forwardRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Select as RSelect } from 'radix-ui';
import { tv } from '../lib/tv';
import { Icon, type IconName } from '../icons/Icon';
import { useFieldProps } from './Field';
import { controlBox, controlDisabled, controlFocusVisible, controlInvalid, controlSizes } from './internal';
import { ThemePortal } from '../foundations/ThemePortal';

/** One choice in a Select, Combobox or SegmentedControl. */
export interface ControlOption {
  value: string;
  label: ReactNode;
  icon?: IconName;
  /** Second line under the label. */
  description?: ReactNode;
  disabled?: boolean;
  /** Plain text used for typeahead and filtering when `label` is not a string. */
  textValue?: string;
}

/** Plain text of an option, for typeahead, filtering and the trigger's title. */
export function optionText(o: ControlOption): string {
  if (o.textValue) return o.textValue;
  return typeof o.label === 'string' || typeof o.label === 'number' ? String(o.label) : o.value;
}

/**
 * Select: the TextInput box as a trigger (value + chevron) and a Menu surface listing the options.
 * Rows reuse the menu row measurements (28px, radius 6, 14/16.8, hover wash) with a check on the selected row.
 */
export const selectVariants = tv({
  slots: {
    trigger: [controlBox, controlFocusVisible, 'cursor-pointer gap-1.5 text-left'],
    value: 'min-w-0 flex-1 truncate',
    placeholder: 'text-n-text-secondary',
    chevron: 'shrink-0 text-n-icon-tertiary',
    content: [
      // .motion-floating (styles/motion.css): fade + 4px slide from the trigger side, fade only under reduced motion.
      'motion-floating relative z-50 max-h-[min(320px,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)]',
      'max-w-[calc(100vw-16px)] overflow-hidden rounded-n-xl bg-n-popover-bg shadow-n-shadow-outline-lg outline-none',
    ],
    viewport: 'flex flex-col gap-px p-1',
    item: [
      'relative flex min-h-7 w-full cursor-pointer select-none items-center gap-2 rounded-n-md px-2 py-1.5 text-left text-[14px] leading-[16.8px] text-n-text-primary outline-none',
      'data-[highlighted]:bg-n-button-hover-bg-a data-[disabled]:pointer-events-none data-[disabled]:opacity-40 pointer-coarse:min-h-9',
    ],
    itemIcon: 'flex size-5 shrink-0 items-center justify-center text-n-icon-primary',
    itemText: 'flex min-w-0 flex-1 flex-col',
    itemDescription: 'mt-0.5 text-[12px] leading-4 text-n-text-secondary',
    check: 'ml-auto flex shrink-0 items-center text-n-icon-primary',
    scroll: 'flex h-6 cursor-default items-center justify-center text-n-icon-tertiary',
  },
  variants: {
    size: {
      sm: { trigger: controlSizes.sm },
      md: { trigger: controlSizes.md },
      lg: { trigger: controlSizes.lg },
    },
    invalid: { true: { trigger: controlInvalid } },
    disabled: { true: { trigger: controlDisabled } },
  },
  defaultVariants: { size: 'md' },
});

export interface SelectProps {
  /** The choices. One option may have `value: ''` (e.g. "All categories"): picking it reports `''`. */
  options: ControlOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Shown when nothing is selected. */
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  /** Form field name (a native select is rendered for form submission). */
  name?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  id?: string;
  className?: string;
  style?: CSSProperties;
  /** Class for the floating list. */
  contentClassName?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

/** Radix forbids an item value of '': an option with `value: ''` is mapped to this internally. */
const EMPTY = '__motion-select-empty__';

/**
 * Select: pick one option from a short list (up to ~15). For long or searchable lists use Combobox.
 * Keyboard: Enter / Space / ArrowDown opens, arrows move, typing jumps to a match, Enter selects, Escape closes.
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(props, ref) {
  const {
    options, value, defaultValue, onValueChange, placeholder = 'Select…', size, invalid, disabled, required, name,
    open, defaultOpen, onOpenChange, id, className, style, contentClassName, ...aria
  } = useFieldProps(props);
  const s = selectVariants({ size, invalid, disabled });
  // An "All" / "None" option with value '' is selectable: '' maps to a sentinel inside Radix and back outside.
  const hasEmpty = options.some((o) => o.value === '');
  const toInner = (v: string | undefined) => (v === '' && hasEmpty ? EMPTY : v);
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? '');
  const current = value ?? uncontrolled;
  return (
    <>
    <RSelect.Root
      value={toInner(value)}
      defaultValue={toInner(defaultValue)}
      onValueChange={(v) => { const out = v === EMPTY ? '' : v; setUncontrolled(out); onValueChange?.(out); }}
      disabled={disabled}
      required={required}
      // With an empty option the native form value would be the sentinel: submit through our own input instead.
      name={hasEmpty ? undefined : name}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <RSelect.Trigger ref={ref} id={id} className={s.trigger({ className })} style={style} {...aria}>
        {/* Radix Value drops className, so the layout lives on a wrapper. */}
        <span className={s.value()}><RSelect.Value placeholder={<span className={s.placeholder()}>{placeholder}</span>} /></span>
        <RSelect.Icon className={s.chevron()}>
          <Icon name="arrowChevronSingleDownSmall" size={16} />
        </RSelect.Icon>
      </RSelect.Trigger>
      <ThemePortal primitive={RSelect.Portal}>
        <RSelect.Content position="popper" sideOffset={4} collisionPadding={8} className={s.content({ className: contentClassName })}>
          <RSelect.ScrollUpButton className={s.scroll()}><Icon name="arrowChevronSingleUp" size={16} /></RSelect.ScrollUpButton>
          <RSelect.Viewport className={s.viewport()}>
            {options.map((o) => (
              <RSelect.Item key={o.value} value={o.value === '' ? EMPTY : o.value} disabled={o.disabled} textValue={optionText(o)} className={s.item()}>
                {o.icon && <span className={s.itemIcon()}><Icon name={o.icon} size={20} /></span>}
                <span className={s.itemText()}>
                  <RSelect.ItemText>{o.label}</RSelect.ItemText>
                  {o.description && <span className={s.itemDescription()}>{o.description}</span>}
                </span>
                <RSelect.ItemIndicator className={s.check()}>
                  <Icon name="checkmarkSmall" size={16} />
                </RSelect.ItemIndicator>
              </RSelect.Item>
            ))}
          </RSelect.Viewport>
          <RSelect.ScrollDownButton className={s.scroll()}><Icon name="arrowChevronSingleDown" size={16} /></RSelect.ScrollDownButton>
        </RSelect.Content>
      </ThemePortal>
    </RSelect.Root>
    {hasEmpty && name && <input type="hidden" name={name} value={current} />}
    </>
  );
});
