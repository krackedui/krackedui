import { useRef, type KeyboardEvent } from 'react';

/**
 * Escape for modal content when another layer swallowed it. Radix gives Escape only to the most recently
 * opened layer, and a toast shown while a dialog is open is such a layer: Escape then hid the toast and the
 * dialog stayed open. Layers that handle Escape call preventDefault; this keydown handler (bubbling from the
 * focused element inside the content) closes the content when nobody did, by clicking a hidden Close.
 */
export function useEscapeFallback(onEscapeKeyDown?: (event: globalThis.KeyboardEvent) => void) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    onEscapeKeyDown?.(event.nativeEvent);
    if (event.nativeEvent.defaultPrevented) return;
    event.preventDefault();
    closeRef.current?.click();
  };
  return { closeRef, onKeyDown };
}
