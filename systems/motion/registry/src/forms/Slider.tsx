import { forwardRef, useId, type CSSProperties } from 'react';
import { Slider as RSlider } from 'radix-ui';
import { tv } from '../lib/tv';
import { useFieldControl } from './Field';
import { joinIds, useControllableState } from './internal';

/**
 * Slider: 4px track in bg-tertiary-translucent (the segmented-control track tone), blue accent range,
 * 14px white thumb with the outline-sm shadow (the switch knob, enlarged). On touch (pointer: coarse) the thumb is 24px.
 */
export const sliderVariants = tv({
  slots: {
    root: 'relative flex h-5 w-full min-w-0 touch-none select-none items-center data-[disabled]:opacity-50 pointer-coarse:h-6',
    track: 'relative h-1 grow overflow-hidden rounded-full bg-n-bg-tertiary-translucent-a',
    range: 'absolute h-full rounded-full bg-n-blue-icon-accent-primary',
    thumb: [
      'relative block size-3.5 cursor-grab rounded-full bg-n-white shadow-n-shadow-outline-md dark:bg-n-primary-black outline-none active:cursor-grabbing',
      'transition-shadow duration-[var(--ds-duration-fast)] focus-visible:shadow-n-focus-shadow data-[disabled]:cursor-default',
      'before:absolute before:-inset-[5px] before:content-[""] pointer-coarse:size-6',
    ],
  },
  variants: {
    invalid: { true: { range: 'bg-n-red-icon-accent-primary' } },
  },
});

export interface SliderProps {
  /** One value for a single thumb, two for a range. */
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  /** Called once when the person releases the thumb (or after a keyboard step). */
  onValueCommit?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Smallest gap between range thumbs, in steps. */
  minStepsBetweenThumbs?: number;
  disabled?: boolean;
  invalid?: boolean;
  /** Accessible name when there is no Field around it. Range thumbs are named "<label> minimum" / "<label> maximum". */
  label?: string;
  /** Human text for a value, read by screen readers (e.g. currency). */
  formatValue?: (value: number) => string;
  orientation?: 'horizontal' | 'vertical';
  /** Form field name (one hidden input per thumb). */
  name?: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
  'aria-describedby'?: string;
}

/**
 * Slider: pick a number or a range by dragging or with arrow keys (Page Up/Down for big steps,
 * Home/End for the ends). Use it when the exact value matters less than the position; otherwise NumberInput.
 */
export const Slider = forwardRef<HTMLSpanElement, SliderProps>(function Slider(
  { value: valueProp, defaultValue, onValueChange, onValueCommit, min = 0, max = 100, step = 1, minStepsBetweenThumbs, disabled, invalid, label,
    formatValue, orientation, name, id, className, style, 'aria-describedby': describedBy }, ref,
) {
  const field = useFieldControl();
  const [value, setValue] = useControllableState<number[]>(valueProp, defaultValue ?? [min], onValueChange);
  const s = sliderVariants({ invalid: invalid ?? field?.invalid });
  const isDisabled = disabled ?? field?.disabled ?? false;
  const uid = useId();
  const range = value.length > 1;
  const thumbName = (i: number) => (range ? (i === 0 ? 'minimum' : 'maximum') : undefined);
  return (
    <RSlider.Root
      ref={ref}
      id={id ?? field?.controlId}
      value={value}
      onValueChange={setValue}
      onValueCommit={onValueCommit}
      min={min}
      max={max}
      step={step}
      minStepsBetweenThumbs={minStepsBetweenThumbs}
      disabled={isDisabled}
      orientation={orientation}
      name={name}
      className={s.root({ className })}
      style={style}
    >
      <RSlider.Track className={s.track()}>
        <RSlider.Range className={s.range()} />
      </RSlider.Track>
      {value.map((v, i) => (
        <RSlider.Thumb
          key={i}
          className={s.thumb()}
          id={`${uid}-thumb-${i}`}
          // Named by `label`, else by the Field label (+ "minimum"/"maximum" for a range: the thumb's own aria-label).
          aria-label={label ? [label, thumbName(i)].filter(Boolean).join(' ') : thumbName(i)}
          aria-labelledby={!label && field ? joinIds(field.labelId, range && `${uid}-thumb-${i}`) : undefined}
          aria-describedby={joinIds(field?.descriptionId, field?.invalid ? field.errorId : undefined, describedBy)}
          aria-invalid={invalid ?? field?.invalid ? true : undefined}
          aria-valuetext={formatValue ? formatValue(v) : undefined}
        />
      ))}
    </RSlider.Root>
  );
});
