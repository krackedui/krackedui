import {
  createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type HTMLAttributes, type ReactNode,
} from 'react';
import { Dialog } from 'radix-ui';
import { cn } from '../lib/cn';
import { SHELL_MOBILE_QUERY, useCollapse, useDialogReturnFocus, useShellMediaQuery } from './hooks';

/* -------------------------------------------------------------------------------------------------
 * App frame: sidebar + (topbar over scrolling page frame) + optional peek layer.
 *  ≥ 768px  sidebar docked at the left (270 by default, resizable). ⌘\ (Ctrl+\) or the sidebar's
 *           collapse control collapses it; the width animates to 0. While collapsed, hovering the
 *           topbar » button or the left window edge shows the sidebar floating below the topbar.
 *  < 768px  the sidebar is a modal drawer (closed by default) opened by the topbar menu button;
 *           focus is trapped inside, Escape / backdrop / navigating closes it.
 * -----------------------------------------------------------------------------------------------*/

/** Where a sidebar instance is rendered. `Sidebar.Root` reads it to adapt (width, resize handle, rounding). */
export type SidebarPlacement = 'docked' | 'floating' | 'drawer';

export interface AppFrameState {
  /** Phone layout (viewport < 768px): the sidebar is a drawer. */
  mobile: boolean;
  /** Desktop: docked (true) or collapsed. Phone: drawer open. */
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  /** Desktop sidebar collapsed (`!sidebarOpen` on desktop). */
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  /** Collapse/expand on desktop, open/close the drawer on phones. */
  toggleSidebar: () => void;
  /** Floating hover-peek of the collapsed sidebar (desktop). */
  peeking: boolean;
  setPeeking: (peeking: boolean) => void;
  /** Placement of the sidebar instance this state was handed to. */
  placement: SidebarPlacement;
  /** `placement === 'floating'`. */
  floating: boolean;
}

const Ctx = createContext<AppFrameState | null>(null);

/** Shell state from the nearest `AppFrame` (sidebar open / collapsed, hover-peek, phone layout). */
export function useAppFrame(): AppFrameState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppFrame must be used inside <AppFrame>. Wrap your layout in <AppFrame sidebar={…}>.');
  return v;
}
/** Like `useAppFrame`, but returns null outside an `AppFrame` (parts that also work standalone). */
export function useOptionalAppFrame(): AppFrameState | null {
  return useContext(Ctx);
}

type Slot = ReactNode | ((state: AppFrameState) => ReactNode);
const render = (slot: Slot, st: AppFrameState) => (typeof slot === 'function' ? slot(st) : slot);

export interface AppFrameProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The sidebar (usually `<Sidebar.Root>`). A function receives the frame state for the instance it renders. */
  sidebar?: Slot;
  /** Top bar over the page (usually `<Topbar/>`); on phones it shows the menu button that opens the drawer. */
  topbar?: Slot;
  /** The page frame (usually `<PageLayout/>`). */
  children?: Slot;
  /** Overlay layer over the main column (e.g. `<SidePeek/>`). */
  peek?: Slot;
  /** Controlled: desktop docked/collapsed, phone drawer open/closed. */
  sidebarOpen?: boolean;
  /** Uncontrolled initial desktop state (default true). The phone drawer always starts closed. */
  defaultSidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
  /** Accessible name of the phone drawer (default "Sidebar"). */
  drawerLabel?: string;
}

/**
 * Full-window app shell: sidebar, top bar, scrolling page and a peek layer. The sidebar docks on
 * desktop (collapsible with an animated width) and becomes a modal drawer under 768px.
 * Use it as the outermost layout of an app screen; for a plain content page use `PageLayout` alone.
 */
export const AppFrame = forwardRef<HTMLDivElement, AppFrameProps>(function AppFrame(
  { sidebar, topbar, children, peek, sidebarOpen, defaultSidebarOpen = true, onSidebarOpenChange, drawerLabel = 'Sidebar', className, ...props }, ref,
) {
  const mobile = useShellMediaQuery(SHELL_MOBILE_QUERY);
  const [docked, setDocked] = useState(defaultSidebarOpen);
  const [drawer, setDrawer] = useState(false);
  const open = sidebarOpen ?? (mobile ? drawer : docked);
  const [peeking, setPeekingNow] = useState(false);
  const hideTimer = useRef<number | undefined>(undefined);
  // The drawer has no Radix trigger (the topbar button lives elsewhere): return focus to whatever opened it.
  const returnFocus = useDialogReturnFocus();

  // Leaving the phone layout closes the drawer (it has no desktop meaning).
  useEffect(() => { if (!mobile) setDrawer(false); }, [mobile]);
  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  const setSidebarOpen = useCallback((v: boolean) => {
    if (mobile) setDrawer(v); else setDocked(v);
    setPeekingNow(false);
    onSidebarOpenChange?.(v);
  }, [mobile, onSidebarOpenChange]);
  const toggleSidebar = useCallback(() => setSidebarOpen(!open), [open, setSidebarOpen]);
  const setPeeking = useCallback((v: boolean) => {
    window.clearTimeout(hideTimer.current);
    if (v) setPeekingNow(true);
    else hideTimer.current = window.setTimeout(() => setPeekingNow(false), 200);
  }, []);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') { e.preventDefault(); toggleSidebar(); }
    };
    addEventListener('keydown', on);
    return () => removeEventListener('keydown', on);
  }, [toggleSidebar]);

  const collapsed = !mobile && !open;
  const state = useCallback((placement: SidebarPlacement): AppFrameState => ({
    mobile, sidebarOpen: open, setSidebarOpen, collapsed, setCollapsed: (c: boolean) => setSidebarOpen(!c), toggleSidebar,
    peeking, setPeeking, placement, floating: placement === 'floating',
  }), [mobile, open, setSidebarOpen, collapsed, toggleSidebar, peeking, setPeeking]);
  const dockedState = useMemo(() => state('docked'), [state]);
  const floatingState = useMemo(() => state('floating'), [state]);
  const drawerState = useMemo(() => state('drawer'), [state]);
  const showDocked = !mobile && open;
  const dockedCollapse = useCollapse(showDocked);

  return (
    <Ctx.Provider value={dockedState}>
      {/* isolate: the topbar/sidebar z-indexes stay inside the frame, so portalled dialogs and sheets cover them. */}
      <div ref={ref} className={cn('motion-app-inner relative isolate flex size-full overflow-hidden bg-n-bg-primary text-n-text-primary', className)} {...props}>
        {sidebar !== undefined && (
          <>
            {/* Docked sidebar (desktop): width animates between the sidebar's width and 0; unmounted when collapsed. */}
            {!mobile && (
              <div
                ref={dockedCollapse.ref}
                className="motion-shell-collapse relative z-[111] grid h-full shrink-0 max-md:hidden"
                style={{ gridTemplateColumns: dockedCollapse.expanded ? '1fr' : '0fr' }}
                onTransitionEnd={dockedCollapse.onTransitionEnd}
                inert={!showDocked}
                data-state={showDocked ? 'open' : 'closed'}
              >
                <div className="flex h-full min-w-0 overflow-hidden">{dockedCollapse.mounted && render(sidebar, dockedState)}</div>
              </div>
            )}
            {/* Collapsed (desktop): hover the left edge or the topbar » button to float the sidebar. */}
            {collapsed && (
              <>
                <div aria-hidden className="absolute left-0 top-11 z-[120] h-[calc(100%-44px)] w-2 max-md:hidden" onPointerEnter={() => setPeeking(true)} />
                <div
                  className={cn(
                    'absolute left-0 top-[52px] z-[120] flex h-[calc(100%-104px)] transition-[transform,opacity,visibility] duration-200 ease-out motion-reduce:transition-none max-md:hidden',
                    peeking ? 'visible translate-x-0 opacity-100' : 'pointer-events-none invisible -translate-x-full opacity-0 [transition-delay:0s,0s,200ms]',
                  )}
                  // inline so it also applies without the stylesheet: hidden from AT and focus until peeking
                  style={{ visibility: peeking ? 'visible' : 'hidden' }}
                  inert={!peeking}
                  onPointerEnter={() => setPeeking(true)}
                  onPointerLeave={() => setPeeking(false)}
                >
                  <Ctx.Provider value={floatingState}>{render(sidebar, floatingState)}</Ctx.Provider>
                </div>
              </>
            )}
            {/* Phone: modal drawer. */}
            {mobile && (
              <Dialog.Root open={open} onOpenChange={setSidebarOpen}>
                <Dialog.Portal>
                  <Dialog.Overlay className="motion-overlay fixed inset-0 z-[150] bg-n-modal-underlay-bg-a" />
                  <Dialog.Content
                    aria-describedby={undefined}
                    aria-modal="true"
                    {...returnFocus}
                    data-side="left"
                    className="motion-sheet motion-portal fixed inset-y-0 left-0 z-[151] flex w-[min(300px,calc(100vw-48px))] bg-n-bg-secondary text-n-text-primary shadow-n-shadow-outline-lg outline-none"
                  >
                    <Dialog.Title className="sr-only">{drawerLabel}</Dialog.Title>
                    <Ctx.Provider value={drawerState}>{render(sidebar, drawerState)}</Ctx.Provider>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            )}
          </>
        )}
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          {topbar !== undefined && render(topbar, dockedState)}
          {children !== undefined && render(children, dockedState)}
          {peek !== undefined && render(peek, dockedState)}
        </div>
      </div>
    </Ctx.Provider>
  );
});
