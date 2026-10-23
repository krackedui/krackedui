'use client';

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../lib/cn';
import { mergeIntoChild } from '../lib/slot';
import { useControllable } from '../lib/use-controllable';
import { Portal, useAnchored, useDismiss, type Align, type Side } from '../lib/overlay';

interface PopoverCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}
const PopoverContext = createContext<PopoverCtx | null>(null);

function usePopover(part: string): PopoverCtx {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error(`<Popover.${part}> must be inside <Popover.Root>.`);
  return ctx;
}

export interface PopoverRootProps {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** A floating panel anchored to a trigger. Not modal: the page behind stays usable. */
export function PopoverRoot({ children, open, defaultOpen, onOpenChange }: PopoverRootProps) {
  const [isOpen, setOpen] = useControllable<boolean>(open, defaultOpen ?? false, onOpenChange);
  const triggerRef = useRef<HTMLElement | null>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  return (
    <PopoverContext.Provider value={{ open: isOpen, setOpen, anchorRef, triggerRef, contentRef }}>
      {children}
    </PopoverContext.Provider>
  );
}

export interface PopoverTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  asChild?: boolean;
}

/** What opens it. */
export function PopoverTrigger({ children, asChild, className, ...rest }: PopoverTriggerProps) {
  const ctx = usePopover('Trigger');
  const props = {
    ref: ctx.triggerRef as React.Ref<HTMLButtonElement>,
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': ctx.open,
    onClick: () => ctx.setOpen(!ctx.open),
    className,
    ...rest,
  };
  if (asChild) return mergeIntoChild(children, props as Record<string, unknown>);
  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
}

/** Anchors the panel to something other than the trigger. */
export function PopoverAnchor({ children, className, ...rest }: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  const ctx = usePopover('Anchor');
  return (
    <div ref={ctx.anchorRef as React.Ref<HTMLDivElement>} className={className} {...rest}>
      {children}
    </div>
  );
}

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  align?: Align;
  side?: Side;
}

/** The panel. Escape closes it and returns focus to the trigger; a press outside closes it too. */
export function PopoverContent({ children, align = 'start', side = 'bottom', className, ...rest }: PopoverContentProps) {
  const ctx = usePopover('Content');
  const anchor = ctx.anchorRef.current ? ctx.anchorRef : ctx.triggerRef;
  const pos = useAnchored(ctx.open, anchor, ctx.contentRef, side, align);
  useDismiss(ctx.open, () => {
    ctx.setOpen(false);
    ctx.triggerRef.current?.focus();
  }, [ctx.contentRef, ctx.triggerRef, ctx.anchorRef]);
  if (!ctx.open) return null;
  return (
    <Portal>
      <div
        ref={ctx.contentRef}
        role="dialog"
        tabIndex={-1}
        className={cn('bay-popover', className)}
        style={pos ? { top: pos.top, left: pos.left } : { opacity: 0 }}
        {...rest}
      >
        {children}
      </div>
    </Portal>
  );
}

/** Anything that closes it. */
export function PopoverClose({ children, asChild, className, ...rest }: PopoverTriggerProps) {
  const ctx = usePopover('Close');
  const props = { onClick: () => ctx.setOpen(false), className, ...rest };
  if (asChild) return mergeIntoChild(children, props as Record<string, unknown>);
  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
}

export const Popover = {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Anchor: PopoverAnchor,
  Content: PopoverContent,
  Close: PopoverClose,
};

/* ---------- tooltip ---------- */

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'content'> {
  content: ReactNode;
  side?: Side;
  children: ReactNode;
  /** How long to hover before it appears. Focus shows it at once. */
  delayDuration?: number;
}

/**
 * A short hint, on hover and on focus.
 *
 * It describes the trigger rather than naming it, so a control still needs its own label — a
 * tooltip is not a substitute for one. Escape hides it while the pointer is still there, which
 * WCAG 1.4.13 asks for.
 */
export function Tooltip({ content, side = 'top', children, delayDuration = 400, className, ...rest }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  const pos = useAnchored(open, triggerRef, panelRef, side, 'center');

  const show = (immediate = false) => {
    if (timer.current) clearTimeout(timer.current);
    if (immediate) return setOpen(true);
    timer.current = setTimeout(() => setOpen(true), delayDuration);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(false);
  };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') hide(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <span
        ref={triggerRef}
        className={cn('bay-tooltip__trigger', className)}
        aria-describedby={open ? id : undefined}
        onPointerEnter={() => show()}
        onPointerLeave={hide}
        onFocus={() => show(true)}
        onBlur={hide}
        {...rest}
      >
        {children}
      </span>
      {open && (
        <Portal>
          <div
            ref={panelRef}
            id={id}
            role="tooltip"
            className="bay-tooltip"
            style={pos ? { top: pos.top, left: pos.left } : { opacity: 0 }}
          >
            {content}
          </div>
        </Portal>
      )}
    </>
  );
}
