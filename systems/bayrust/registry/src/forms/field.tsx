'use client';

import { createContext, useContext, useId, type ReactNode } from 'react';
import { cn } from '../lib/cn';

interface FieldContextValue {
  /** The id the control must take, so the label's `for` finds it. */
  controlId: string;
  /** Ids of the description and error, for the control's aria-describedby. */
  describedBy?: string;
  invalid: boolean;
  required: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

/**
 * What a control inside a `Field` should apply to itself. Returns null outside one, so every control
 * works standalone — the contract does not require a Field.
 */
export function useFieldControl(): FieldContextValue | null {
  return useContext(FieldContext);
}

export interface FieldProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  children?: ReactNode;
  label: ReactNode;
  description?: ReactNode;
  /** The message. Its presence is what marks the control invalid. */
  error?: ReactNode;
  required?: boolean;
  /** Hide the label visually. It stays the control's accessible name. */
  hideLabel?: boolean;
}

/**
 * Label, description and error around one control.
 *
 * The control reads its id, `aria-describedby` and `aria-invalid` from here, so they cannot drift
 * apart: write `<Field label="Email"><TextInput /></Field>` and the wiring is done.
 */
export function Field({ children, label, description, error, required = false, hideLabel, className, style, id }: FieldProps) {
  const auto = useId();
  const controlId = id ?? `${auto}-control`;
  const descriptionId = description ? `${auto}-description` : undefined;
  const errorId = error ? `${auto}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <FieldContext.Provider value={{ controlId, describedBy, invalid: Boolean(error), required }}>
      <div className={cn('bay-field', className)} style={style}>
        <label className={cn('bay-field__label', hideLabel && 'bay-sr-only')} htmlFor={controlId}>
          {label}
          {required && (
            <span className="bay-field__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {description && (
          <p id={descriptionId} className="bay-field__description">
            {description}
          </p>
        )}
        {children}
        {error && (
          <p id={errorId} className="bay-field__error" role="alert">
            {error}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
}
