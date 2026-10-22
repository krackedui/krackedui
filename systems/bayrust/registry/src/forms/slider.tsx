'use client';

import { useId } from 'react';
import { cn } from '../lib/cn';
import { useFieldControl } from './field';
import { useControllable } from '../lib/use-controllable';

export interface SliderProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** Accessible name when there is no `Field` around it. */
  label?: string;
}

/**
 * Pick a number by dragging or with the arrow keys.
 *
 * The value is an array, so a range is two numbers. Each thumb is a real `<input type="range">`:
 * the browser gives the keyboard handling and the `slider` role, and a screen reader announces the
 * value as the user moves it. Thumbs are kept in order — the lower one cannot pass the upper.
 */
export function Slider({
  className,
  style,
  id,
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  label,
}: SliderProps) {
  const field = useFieldControl();
  const auto = useId();
  const [values, setValues] = useControllable<number[]>(value, defaultValue ?? [min], onValueChange);

  const setAt = (index: number, next: number) => {
    const copy = [...values];
    // keep the thumbs ordered, so a range cannot invert
    const lower = index > 0 ? copy[index - 1] : min;
    const upper = index < copy.length - 1 ? copy[index + 1] : max;
    copy[index] = Math.min(upper, Math.max(lower, next));
    setValues(copy);
  };

  const pct = (n: number) => ((n - min) / (max - min)) * 100;
  const from = values.length > 1 ? pct(Math.min(...values)) : 0;
  const to = pct(Math.max(...values));

  return (
    <div
      className={cn('bay-slider', className)}
      style={{ ['--bay-slider-from' as string]: `${from}%`, ['--bay-slider-to' as string]: `${to}%`, ...style }}
      data-disabled={disabled ? '' : undefined}
      id={id}
    >
      <span className="bay-slider__track" aria-hidden="true">
        <span className="bay-slider__fill" />
      </span>
      {values.map((v, i) => (
        <input
          key={i}
          type="range"
          className="bay-slider__input"
          min={min}
          max={max}
          step={step}
          value={v}
          disabled={disabled}
          aria-label={label ?? (values.length > 1 ? (i === 0 ? 'Minimum' : 'Maximum') : undefined)}
          aria-describedby={field?.describedBy}
          id={i === 0 ? (id ?? field?.controlId ?? auto) : undefined}
          onChange={(e) => setAt(i, Number(e.target.value))}
        />
      ))}
    </div>
  );
}
