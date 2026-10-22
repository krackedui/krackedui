import { useContext, useLayoutEffect, useState, type ComponentType, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ThemePortalContext } from './portalContext';

type PortalContainer = Element | DocumentFragment | null;

/** A Radix primitive's Portal part (`DropdownMenu.Portal`, `Dialog.Portal`, `Select.Portal`…). */
export type PortalPrimitive = ComponentType<{ children?: ReactNode; container?: PortalContainer; forceMount?: true }>;

export interface ThemePortalProps {
  children?: ReactNode;
  /**
   * The Radix primitive's Portal part to render through (e.g. `DropdownMenu.Portal`), so the primitive's
   * presence and `forceMount` keep working. Omit it for a plain React portal (custom floating UI).
   */
  primitive?: PortalPrimitive;
  /** Passed to the primitive's Portal: keep the layer mounted while closed (for exit animations you control). */
  forceMount?: true;
  /** Render into this element instead of the nearest Theme's portal container. */
  container?: PortalContainer;
}

/** A plain React portal that renders nothing until mounted (no `document` on the server). */
function PlainPortal({ container, children }: { container: PortalContainer | undefined; children?: ReactNode }) {
  const [body, setBody] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => setBody(document.body), []);
  const target = container ?? body;
  return target ? createPortal(children, target) : null;
}

/**
 * Portal for Motion's floating layers. Inside a `<Theme>` it renders into that Theme's portal container
 * (an element on `<body>` that carries the Theme's `light`/`dark` class and custom properties), so a
 * menu opened from a light Theme stays light even when the page also contains a dark Theme. Outside any
 * Theme it renders into `<body>` as before.
 *
 * Every Motion component that portals goes through this helper; use it for your own floating UI too:
 * `<ThemePortal primitive={DropdownMenu.Portal}>…</ThemePortal>` or `<ThemePortal>…</ThemePortal>`.
 */
export function ThemePortal({ primitive: Primitive, forceMount, container, children }: ThemePortalProps) {
  const theme = useContext(ThemePortalContext);
  const target = container ?? theme?.container ?? undefined;
  // Inside a Theme whose container is not created yet (server, hydration, first commit): render nothing.
  // The container exists before the first paint, and overlays are closed at that point anyway.
  if (theme && !target) return null;
  if (Primitive) {
    return (
      <Primitive container={target} {...(forceMount ? { forceMount } : {})}>
        {children}
      </Primitive>
    );
  }
  return <PlainPortal container={target}>{children}</PlainPortal>;
}
