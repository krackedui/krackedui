'use client';

import { createContext, useContext, useId, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Icon } from '../foundations/icon';
import { mergeIntoChild } from '../lib/slot';
import { useControllable } from '../lib/use-controllable';
import { Portal, useDismiss, useFocusTrap, useScrollLock } from '../lib/overlay';

interface DialogCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
  panelRef: React.RefObject<HTMLDivElement | null>;
  titleId: string;
  descriptionId: string;
  modal: boolean;
}
const DialogContext = createContext<DialogCtx | null>(null);

function useDialog(part: string, kind = 'Dialog'): DialogCtx {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error(`<${kind}.${part}> must be inside <${kind}.Root>.`);
  return ctx;
}

export interface DialogRootProps {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Modal by default: the page behind is inert and does not scroll. */
  modal?: boolean;
}

/** A modal dialog. */
export function DialogRoot({ children, open, defaultOpen, onOpenChange, modal = true }: DialogRootProps) {
  const [isOpen, setOpen] = useControllable<boolean>(open, defaultOpen ?? false, onOpenChange);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const base = useId();
  return (
    <DialogContext.Provider
      value={{ open: isOpen, setOpen, panelRef, titleId: `${base}-title`, descriptionId: `${base}-description`, modal }}
    >
      {children}
    </DialogContext.Provider>
  );
}

export interface DialogTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  asChild?: boolean;
}

/** What opens it. */
export function DialogTrigger({ children, asChild, className, ...rest }: DialogTriggerProps) {
  const ctx = useDialog('Trigger');
  const props = { onClick: () => ctx.setOpen(true), 'aria-haspopup': 'dialog' as const, className, ...rest };
  if (asChild) return mergeIntoChild(children, props as Record<string, unknown>);
  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
}

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * The panel. While it is open, Tab stays inside it, Escape closes it, the page behind does not
 * scroll, and focus returns to whatever opened it.
 */
export function DialogContent({ children, size = 'md', className, ...rest }: DialogContentProps) {
  const ctx = useDialog('Content');
  const close = () => ctx.setOpen(false);
  useDismiss(ctx.open, close, [ctx.panelRef]);
  useFocusTrap(ctx.open, ctx.panelRef);
  useScrollLock(ctx.open && ctx.modal);
  if (!ctx.open) return null;
  return (
    <Portal>
      <div className="bay-overlay" data-modal={ctx.modal ? '' : undefined}>
        <div
          ref={ctx.panelRef}
          role="dialog"
          aria-modal={ctx.modal}
          aria-labelledby={ctx.titleId}
          aria-describedby={ctx.descriptionId}
          tabIndex={-1}
          className={cn('bay-dialog', `bay-dialog--${size}`, className)}
          {...rest}
        >
          {children}
          <button type="button" className="bay-dialog__x" aria-label="Close" onClick={close}>
            <Icon name="close" size={14} />
          </button>
        </div>
      </div>
    </Portal>
  );
}

/** The dialog's name. Required: `aria-labelledby` points at it. */
export function DialogTitle({ children, className, ...rest }: HTMLAttributes<HTMLHeadingElement> & { children?: ReactNode }) {
  const ctx = useDialog('Title');
  return (
    <h2 id={ctx.titleId} className={cn('bay-dialog__title', className)} {...rest}>
      {children}
    </h2>
  );
}

/** One line explaining the dialog. */
export function DialogDescription({ children, className, ...rest }: HTMLAttributes<HTMLParagraphElement> & { children?: ReactNode }) {
  const ctx = useDialog('Description');
  return (
    <p id={ctx.descriptionId} className={cn('bay-dialog__description', className)} {...rest}>
      {children}
    </p>
  );
}

/** The dialog's actions. */
export function DialogFooter({ children, className, ...rest }: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div className={cn('bay-dialog__footer', className)} {...rest}>
      {children}
    </div>
  );
}

export interface DialogCloseProps extends HTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  asChild?: boolean;
}

/** Anything that closes it. */
export function DialogClose({ children, asChild, className, ...rest }: DialogCloseProps) {
  const ctx = useDialog('Close');
  const props = { onClick: () => ctx.setOpen(false), className, ...rest };
  if (asChild) return mergeIntoChild(children, props as Record<string, unknown>);
  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
}

export const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Content: DialogContent,
  Title: DialogTitle,
  Description: DialogDescription,
  Footer: DialogFooter,
  Close: DialogClose,
};

/* ---------- sheet: the same dialog, entering from an edge ---------- */

export interface SheetContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  side?: 'left' | 'right' | 'bottom';
  size?: 'sm' | 'md' | 'lg';
}

/** A panel that slides in from an edge. Full width on a phone, whichever side it comes from. */
export function SheetContent({ children, side = 'right', size = 'md', className, ...rest }: SheetContentProps) {
  const ctx = useDialog('Content', 'Sheet');
  const close = () => ctx.setOpen(false);
  useDismiss(ctx.open, close, [ctx.panelRef]);
  useFocusTrap(ctx.open, ctx.panelRef);
  useScrollLock(ctx.open && ctx.modal);
  if (!ctx.open) return null;
  return (
    <Portal>
      <div className="bay-overlay" data-modal="">
        <div
          ref={ctx.panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={ctx.titleId}
          aria-describedby={ctx.descriptionId}
          tabIndex={-1}
          className={cn('bay-sheet', `bay-sheet--${size}`, className)}
          data-side={side}
          {...rest}
        >
          {children}
          <button type="button" className="bay-dialog__x" aria-label="Close" onClick={close}>
            <Icon name="close" size={14} />
          </button>
        </div>
      </div>
    </Portal>
  );
}

/*
 * A sheet is a dialog that enters from an edge, so every part but the content is the dialog's own.
 * The flat names exist for the same reason the dialog's do: a React Server Component cannot dot
 * into `Sheet`, so `SheetTitle` has to be an export in its own right (SPEC §2).
 */
export const SheetRoot = DialogRoot;
export const SheetTrigger = DialogTrigger;
export const SheetTitle = DialogTitle;
export const SheetDescription = DialogDescription;
export const SheetFooter = DialogFooter;
export const SheetClose = DialogClose;

export const Sheet = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Content: SheetContent,
  Title: DialogTitle,
  Description: DialogDescription,
  Footer: DialogFooter,
  Close: DialogClose,
};
