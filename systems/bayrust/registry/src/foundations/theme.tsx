'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export type Appearance = 'light' | 'dark';

export interface ThemeProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  children?: ReactNode;
  /** `system` follows the OS setting. Bayrust is dark by default. */
  appearance?: Appearance | 'system';
}

interface ThemeValue {
  /** The appearance actually in effect — never `system`. */
  appearance: Appearance;
  /**
   * Where overlays mount. Portalling into the Theme rather than `document.body` is what makes a
   * menu or dialog follow the appearance of the Theme it belongs to, including a nested one.
   */
  portalContainer: HTMLElement | null;
}

/* Exported for Portal, which must not throw when there is no Theme: an overlay falls back to the
   document body rather than crashing a page that has not wrapped itself. The hooks below still
   throw, because a hook is something the caller reached for on purpose. */
export const ThemeContext = createContext<ThemeValue | null>(null);

/** The appearance in effect. Throws outside a `<Theme>`, per SPEC §3.8. */
export function useAppearance(): Appearance {
  return useTheme('useAppearance').appearance;
}

/** The whole theme context. Throws outside a `<Theme>`, naming what to add. */
export function useTheme(who = 'This component'): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error(`${who} must be used inside <Theme> — wrap your app in <Theme> from @krackedui/bayrust.`);
  return ctx;
}

const QUERY = '(prefers-color-scheme: light)';

/**
 * Root that applies Bayrust's fonts, tokens and appearance.
 *
 * Put one near the top of the app. Styles only apply inside it, so the host app is never restyled.
 * Nested roots are allowed: a panel can set its own appearance.
 */
export function Theme({ appearance = 'dark', className, style, id, children }: ThemeProps) {
  // `system` is resolved after mount: reading matchMedia during render would differ between the
  // server and the first client paint. Until then it renders dark, the system's default.
  const [systemAppearance, setSystemAppearance] = useState<Appearance>('dark');
  useEffect(() => {
    if (appearance !== 'system' || typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(QUERY);
    const sync = () => setSystemAppearance(mq.matches ? 'light' : 'dark');
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [appearance]);

  const resolved: Appearance = appearance === 'system' ? systemAppearance : appearance;
  const portalRef = useRef<HTMLDivElement | null>(null);
  // the container only exists after the first paint, so overlays mount on the client
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  useEffect(() => setPortalContainer(portalRef.current), []);
  const value = useMemo(() => ({ appearance: resolved, portalContainer }), [resolved, portalContainer]);

  return (
    <ThemeContext.Provider value={value}>
      {/*
        Two spellings of the same thing: `data-theme` is Bayrust's own, and `.dark` is what the
        ecosystem's harnesses look for. Both are set so the tokens resolve either way — see the note
        at the top of styles/standard.css.
      */}
      <div
        id={id}
        className={cn('bay', resolved === 'dark' && 'dark', className)}
        style={style}
        data-theme={`bayrust-${resolved}`}
      >
        {children}
        <div ref={portalRef} className="bay-portal" />
      </div>
    </ThemeContext.Provider>
  );
}
