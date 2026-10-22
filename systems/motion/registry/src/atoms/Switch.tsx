import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react';
import { Switch as RSwitch } from 'radix-ui';
import { cn } from '../lib/cn';
import { tv, type VariantProps } from '../lib/tv';
import { useFieldProps } from '../forms/Field';

/**
 * Toggle switch (settings rows, "Lock page"). Track 30×18, 2px padding, pill radius; off = translucent
 * teal-grey, on = accent; 14px white knob moving 12px. `sm` = 24×14 with a 10px knob for dense rows.
 * The button is the hit area (24px tall on touch screens); the track is drawn inside it.
 */
export const switchVariants = tv({
  slots: {
    root: [
      'group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-[44px] outline-none', // radius 44: pill, no token
      'focus-visible:shadow-n-focus-shadow disabled:cursor-default pointer-coarse:min-h-6',
    ],
    track: [
      'flex items-center rounded-[44px] p-0.5', // radius 44: pill, no token
      'bg-n-switch-button-teal-bg-a dark:bg-n-switch-toggle-desaturated-translucent-bg-var-a',
      'group-data-[state=checked]/switch:bg-n-blue-icon-accent-primary dark:group-data-[state=checked]/switch:bg-n-blue-icon-accent-primary',
      'transition-[background] duration-200 ease-out motion-reduce:transition-none',
    ],
    thumb: 'block rounded-[44px] bg-n-text-on-solid transition-transform duration-200 ease-out motion-reduce:transition-none', // knob is white in both themes
    label: 'inline-flex cursor-pointer items-center gap-2 text-n-ui text-n-text-primary has-[button:disabled]:cursor-default has-[button:disabled]:text-n-text-tertiary',
  },
  variants: {
    size: {
      sm: { track: 'h-3.5 w-6', thumb: 'size-2.5 data-[state=checked]:translate-x-2.5' },
      md: { track: 'h-[18px] w-[30px]', thumb: 'size-3.5 data-[state=checked]:translate-x-3' },
    },
    invalid: { true: { track: 'shadow-[0_0_0_1px_var(--n-red-icon-accent-primary)]' } },
    disabled: { true: { root: 'opacity-40' } },
  },
  defaultVariants: { size: 'md' },
});

export interface SwitchProps extends ComponentPropsWithoutRef<typeof RSwitch.Root>, Pick<VariantProps<typeof switchVariants>, 'size'> {
  /** Text next to the switch; clicking it toggles. Without it, pass `aria-label` or use a Field. */
  label?: ReactNode;
  /** Marks the value as invalid (red outline, `aria-invalid`). */
  invalid?: boolean;
}

/**
 * On/off switch for settings that take effect immediately. Use Checkbox inside forms that are
 * submitted, and when the choice is part of a list.
 */
export const Switch = forwardRef<ElementRef<typeof RSwitch.Root>, SwitchProps>(function Switch(
  rawProps,
  ref,
) {
  // Inside a Field: id, aria-describedby, aria-invalid/required and invalid styling come from it.
  const { size, label, invalid, disabled, className, style, ...props } = useFieldProps(rawProps);
  const s = switchVariants({ size, invalid: !!invalid, disabled: !!disabled });
  const control = (
    <RSwitch.Root
      ref={ref}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      className={s.root({ className: label ? undefined : className })}
      style={label ? undefined : style}
      {...props}
    >
      <span className={s.track()}>
        <RSwitch.Thumb className={s.thumb()} />
      </span>
    </RSwitch.Root>
  );
  if (!label) return control;
  return (
    <label className={cn(s.label(), className)} style={style}>
      {control}
      <span>{label}</span>
    </label>
  );
});
