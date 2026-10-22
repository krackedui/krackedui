// Small shared helpers for the forms group (not exported from the package).
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Controlled/uncontrolled state in one hook: `value` wins when defined, otherwise internal state
 * seeded from `defaultValue`. `setValue` updates internal state (when uncontrolled) and calls `onChange`.
 */
export function useControllableState<T>(value: T | undefined, defaultValue: T, onChange?: (value: T) => void) {
  const [inner, setInner] = useState<T>(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : inner;
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; });
  const setValue = useCallback((next: T) => {
    if (!controlled) setInner(next);
    onChangeRef.current?.(next);
  }, [controlled]);
  return [current, setValue] as const;
}

/** Join id lists for aria-describedby / aria-labelledby, dropping empties and duplicates. */
export function joinIds(...ids: (string | false | null | undefined)[]): string | undefined {
  const out: string[] = [];
  for (const group of ids) if (group) for (const id of group.split(/\s+/)) if (id && !out.includes(id)) out.push(id);
  return out.length ? out.join(' ') : undefined;
}

/** `window.matchMedia(query).matches`, false during SSR and the first client render. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [query]);
  return matches;
}

/* ---------- shared control styles (the TextInput box, measured in atoms/TextInput.tsx) ---------- */

/** The 28px translucent box with a hairline ring every Motion text field uses. */
export const controlBox = [
  'relative flex w-full min-w-0 items-center rounded-n-md bg-n-bg-secondary-translucent-a text-n-text-primary outline-none',
  'shadow-[0_0_0_1px_var(--n-border-primary-translucent-a)]',
].join(' ');
/** Box sizes: 24 / 28 / 32px like TextInput. */
export const controlSizes = {
  sm: 'h-6 px-1.5 text-[12px] leading-4',
  md: 'h-7 px-1.5 text-[14px] leading-5',
  lg: 'h-8 px-2 text-[14px] leading-5',
} as const;
/** Blue ring when the box (or something inside it) is focused. */
export const controlFocusWithin = 'focus-within:shadow-n-input-blue-focus-ring';
export const controlFocusVisible = 'focus-visible:shadow-n-input-blue-focus-ring';
/** Red ring when invalid; focus adds a soft red halo so the focused state stays distinct from rest (WCAG 2.4.7). */
export const controlInvalid = 'shadow-n-input-red-focus-ring focus-within:shadow-[var(--n-input-red-focus-ring),0_0_0_3px_var(--n-red-border-strong-translucent-a)] focus-visible:shadow-[var(--n-input-red-focus-ring),0_0_0_3px_var(--n-red-border-strong-translucent-a)]';
export const controlDisabled = 'cursor-default opacity-50';
