'use client';

import { useCallback, useRef, useState } from 'react';

/**
 * One state that works controlled or uncontrolled, which SPEC §3.3 asks of every value-bearing
 * component. Pass `value` to control it; pass `defaultValue` to let it keep its own.
 *
 * The caller's `onChange` runs either way, so a controlled parent and an uncontrolled one see the
 * same events.
 */
export function useControllable<T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (next: T) => void] {
  const isControlled = controlled !== undefined;
  const [uncontrolled, setUncontrolled] = useState<T>(defaultValue);
  // keeps the setter stable without making it stale
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const set = useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolled(next);
      onChangeRef.current?.(next);
    },
    [isControlled],
  );

  return [isControlled ? (controlled as T) : uncontrolled, set];
}
