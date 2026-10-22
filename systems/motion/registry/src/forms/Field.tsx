import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  Fragment,
  isValidElement,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { tv } from '../lib/tv';
import { Icon } from '../icons/Icon';
import { joinIds } from './internal';
import { composeRefs } from '../lib/refs';
import { devWarn } from '../lib/dev';

/**
 * Field: the label / description / error frame around one control (settings rows, invite forms).
 * Type follows the settings modal: label 14/20 medium text-primary, description 12/16 text-secondary,
 * 6px between label and control; error 12/16 red-text-secondary with a 14px info glyph (inferred, no
 * error state captured).
 */
export const fieldVariants = tv({
  slots: {
    root: 'flex min-w-0 flex-col',
    label: 'mb-1.5 flex items-baseline gap-0.5 text-[14px] font-medium leading-5 text-n-text-primary',
    required: 'text-n-red-text-secondary',
    description: '-mt-1 mb-1.5 text-[12px] leading-4 text-n-text-secondary',
    error: 'mt-1.5 flex items-start gap-1 text-[12px] leading-4 text-n-red-text-secondary',
  },
  variants: {
    hideLabel: { true: { label: 'sr-only' } },
    // Disabled: the label turns secondary (not 50% opacity) so label and help text keep AA contrast.
    disabled: { true: { label: 'text-n-text-secondary' } },
  },
});

export interface FieldContextValue {
  /** id for the control (label `htmlFor` points at it). */
  controlId: string;
  labelId: string;
  descriptionId?: string;
  errorId?: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

/** The surrounding Field's wiring, or null outside a Field. For controls that need ids (e.g. aria-labelledby). */
export function useFieldControl(): FieldContextValue | null {
  return useContext(FieldContext);
}

/** Stops a Field's wiring at a boundary (e.g. the calendar inside a DatePicker popover). */
export function FieldBoundary({ children }: { children?: ReactNode }) {
  return <FieldContext.Provider value={null}>{children}</FieldContext.Provider>;
}

/** Props a control accepts that a Field can fill in. */
export interface FieldControlProps {
  id?: string;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling';
  'aria-required'?: boolean | 'true' | 'false';
}

/**
 * Merge the surrounding Field into a control's props: `id`, `aria-describedby` (description + error),
 * `aria-invalid`, `aria-required`, plus `invalid` / `required` / `disabled` for styling. Explicit props win.
 * Outside a Field it returns the props with `aria-invalid` / `aria-required` derived from `invalid` / `required`.
 *
 * ```tsx
 * const { invalid, required, ...rest } = useFieldProps(props);
 * ```
 */
export function useFieldProps<P extends FieldControlProps>(
  props: P,
): P & Required<Pick<FieldControlProps, 'invalid' | 'required' | 'disabled'>> & Pick<FieldControlProps, 'id' | 'aria-describedby' | 'aria-invalid' | 'aria-required'> {
  const ctx = useContext(FieldContext);
  const invalid = props.invalid ?? (props['aria-invalid'] === true || props['aria-invalid'] === 'true' ? true : ctx?.invalid ?? false);
  const required = props.required ?? ctx?.required ?? false;
  const disabled = props.disabled ?? ctx?.disabled ?? false;
  return {
    ...props,
    id: props.id ?? ctx?.controlId,
    invalid,
    required,
    disabled,
    'aria-describedby': joinIds(ctx?.descriptionId, ctx?.invalid ? ctx.errorId : undefined, props['aria-describedby']),
    'aria-invalid': invalid || undefined,
    'aria-required': props['aria-required'] ?? (required || undefined),
  };
}

export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Visible label (also the control's accessible name). */
  label: ReactNode;
  /** Help text under the label, announced with the control. */
  description?: ReactNode;
  /** Error message. Its presence marks the control invalid; it is announced politely when it appears. */
  error?: ReactNode;
  /** Marks the control required (adds `aria-required` and a red asterisk). */
  required?: boolean;
  /** Visually hide the label; it stays the accessible name. */
  hideLabel?: boolean;
  /** Disable the control and dim the label. */
  disabled?: boolean;
  /** id for the control. Defaults to a generated id. */
  htmlFor?: string;
  /** One control. Controls from this package read the Field automatically; any other element gets the props cloned in. */
  children?: ReactNode;
}

/** Native elements a `<label for>` can name. */
const LABELABLE = 'input:not([type="hidden"]),select,textarea,button,meter,output,progress';
/** Elements that are form controls by role (named through `aria-labelledby`). */
const CONTROL_ROLES = ['combobox', 'listbox', 'slider', 'spinbutton', 'switch', 'checkbox', 'radiogroup', 'textbox', 'searchbox', 'grid', 'group'];
const CONTROL_SELECTOR = `${LABELABLE},${CONTROL_ROLES.filter((r) => r !== 'group').map((r) => `[role="${r}"]`).join(',')}`;
const LABELABLE_TAGS = new Set(['input', 'select', 'textarea', 'button']);
const attrSelector = (name: string, value: string) => `[${name}="${value.replace(/["\\]/g, '\\$&')}"]`;
const WORKS_WITH =
  'Use a Motion control (TextInput, Textarea, SearchInput, NumberInput, Select, Combobox, Checkbox, Switch, RadioGroup, Slider, ' +
  'SegmentedControl, Calendar, DatePicker, DateRangePicker, FileUpload) or a native input / select / textarea, directly or inside a wrapper. ' +
  'For a menu-style picker use Select or Combobox instead of Menu. For anything else, pass `htmlFor` and give your control the same `id`.';

/** Is `el` (the element the label points at) named by this Field? */
function isWired(el: Element, labelId: string): boolean {
  if (el.matches(LABELABLE)) return true;
  const role = el.getAttribute('role');
  if (!role || !CONTROL_ROLES.includes(role)) return false;
  return (el.getAttribute('aria-labelledby') ?? '').split(/\s+/).includes(labelId) || el.hasAttribute('aria-label');
}

/**
 * Field: label, description and error around one control, wired for assistive tech. Use it for every
 * labelled form control; the control inside gets `id`, `aria-describedby`, `aria-invalid` and invalid styling.
 * Motion controls read the Field through context, also inside wrappers; a native input / select / textarea child
 * (or any component) gets the props cloned in. In development, Field warns when its label names no control.
 */
export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { label, description, error, required = false, hideLabel = false, disabled = false, htmlFor, className, children, ...props }, ref,
) {
  const uid = useId();
  const controlId = htmlFor ?? `${uid}-control`;
  const labelId = `${uid}-label`;
  const descriptionId = description ? `${uid}-description` : undefined;
  const errorId = `${uid}-error`;
  const invalid = error !== undefined && error !== null && error !== false && error !== '';
  const s = fieldVariants({ hideLabel, disabled });
  const ctx: FieldContextValue = { controlId, labelId, descriptionId, errorId, invalid, required, disabled };
  const rootRef = useRef<HTMLDivElement | null>(null);
  const controlRef = useRef<HTMLDivElement | null>(null);
  // The id the label points at: the Field's id, or the id of a native control found inside a wrapper.
  const [labelFor, setLabelFor] = useState(controlId);

  // Fallback for elements that don't read the context (a plain <input>, a third-party control): clone the wiring
  // in. Package controls read the same values from context, so this is idempotent. Host wrappers (<div>, <span>…)
  // and fragments are not cloned: the control inside them gets the wiring from context (or the check below).
  const only = Children.count(children) === 1 && isValidElement(children) ? (children as ReactElement<Record<string, unknown>>) : null;
  const cloneable = !!only && only.type !== Fragment && (typeof only.type !== 'string' || LABELABLE_TAGS.has(only.type));
  const control = cloneable && only
    ? cloneElement(only, {
        id: (only.props.id as string | undefined) ?? controlId,
        'aria-describedby': joinIds(descriptionId, invalid ? errorId : undefined, only.props['aria-describedby'] as string | undefined),
        'aria-invalid': (only.props['aria-invalid'] as boolean | undefined) ?? (invalid || undefined),
        'aria-required': (only.props['aria-required'] as boolean | undefined) ?? (required || undefined),
      })
    : children;

  // After render: make sure the label names a control. If nothing has the Field's id (e.g. a native <input> inside
  // a <div>), adopt the first control inside the Field; otherwise warn (development only) with what works instead.
  useLayoutEffect(() => {
    const area = controlRef.current;
    if (!area) return;
    const byId = (id: string) => area.querySelector(attrSelector('id', id)) ?? rootRef.current?.ownerDocument.getElementById(id) ?? null;
    const target = byId(controlId);
    if (target && isWired(target, labelId)) { if (labelFor !== controlId) setLabelFor(controlId); return; }
    const found = area.querySelector(CONTROL_SELECTOR);
    if (found && (found.getAttribute('aria-labelledby') ?? '').split(/\s+/).includes(labelId)) return; // wired through context
    if (found && !found.hasAttribute('aria-labelledby') && !found.hasAttribute('aria-label')) {
      // A control that doesn't read the Field (a native input inside a wrapper): point the label at it.
      if (found.matches(LABELABLE) && found.id) { if (labelFor !== found.id) setLabelFor(found.id); }
      else found.setAttribute('aria-labelledby', labelId);
      const described = joinIds(descriptionId, invalid ? errorId : undefined);
      if (described && !found.hasAttribute('aria-describedby')) found.setAttribute('aria-describedby', described);
      if (invalid) found.setAttribute('aria-invalid', 'true');
      else if (found.getAttribute('aria-invalid') === 'true') found.removeAttribute('aria-invalid');
      if (found.getAttribute('aria-haspopup') === 'menu') devWarn(`<Field> is labelling a menu button. Menus are for actions, not form values: use Select or Combobox inside a Field.`);
      return;
    }
    const text = rootRef.current?.querySelector(attrSelector('id', labelId))?.textContent?.replace(/\*$/, '').trim() || 'Field';
    devWarn(`<Field label="${text}"> could not find a form control to label, so the label names nothing for assistive tech. ${WORKS_WITH}`);
  }, [controlId, labelId, labelFor, descriptionId, errorId, invalid, children]);

  return (
    <div ref={composeRefs(ref, rootRef)} className={s.root({ className })} data-invalid={invalid || undefined} data-disabled={disabled || undefined} {...props}>
      <label id={labelId} htmlFor={labelFor} className={s.label()}>
        {label}
        {required && <span aria-hidden="true" className={s.required()}>*</span>}
      </label>
      {description && <p id={descriptionId} className={s.description()}>{description}</p>}
      <div ref={controlRef} className="contents">
        <FieldContext.Provider value={ctx}>{control}</FieldContext.Provider>
      </div>
      <div id={errorId} aria-live="polite" aria-atomic="true">
        {invalid && (
          <p className={s.error()}>
            <Icon name="infoCircleFill" size={14} className="mt-px shrink-0" />
            <span className="min-w-0">{error}</span>
          </p>
        )}
      </div>
    </div>
  );
});
