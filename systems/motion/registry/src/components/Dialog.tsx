import { forwardRef, useEffect, useRef, useState, type ComponentPropsWithoutRef, type ElementRef, type HTMLAttributes, type ReactNode } from 'react';
import { Dialog as D } from 'radix-ui';
import { cn } from '../lib/cn';
import { useEscapeFallback } from '../lib/escapeFallback';
import { tv, type VariantProps } from '../lib/tv';
import { Button } from '../atoms/Button';
import { Spinner } from '../atoms/Spinner';
import { ThemePortal } from '../foundations/ThemePortal';

/**
 * Modal dialog.
 * - underlay: fixed full-screen `modal-underlay-bg-a`
 * - dialog:   centered, bg-elevated, radius 12 (`radius="xl"` = 20 for search-style panels),
 *             layered modal shadow with a 1px ring. That shadow has no token: arbitrary values below.
 * - sizes:    sm 400, md 480, lg 640 px; under 640 px wide the panel fills the width minus 16px margins
 *             and scrolls inside.
 */
export const dialogVariants = tv({
  slots: {
    overlay: 'fixed inset-0 z-50 bg-n-modal-underlay-bg-a',
    surface: [
      'relative overflow-hidden bg-n-bg-elevated outline-none',
      // token-exempt: modal shadow has no token (measured); the ring uses bg-tertiary-translucent like menus
      'shadow-[0_24px_48px_rgba(25,25,25,.24),0_4px_12px_rgba(25,25,25,.14),0_0_0_1px_var(--n-bg-tertiary-translucent-a)]',
      // token-exempt: dark modal shadow and ring (measured), no token
      'dark:shadow-[0_0_0_1px_#383836,0_24px_48px_rgba(25,25,25,.64),0_4px_12px_rgba(25,25,25,.56)]',
    ],
    title: 'text-[16px] font-semibold leading-[1.3] text-n-text-primary',
    description: 'text-[14px] leading-5 text-n-text-secondary',
    footer: 'mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end',
  },
  variants: {
    radius: { md: { surface: 'rounded-n-2xl' }, xl: { surface: 'rounded-[20px]' } },
    size: {
      sm: { surface: 'w-[400px]' },
      md: { surface: 'w-[480px]' },
      lg: { surface: 'w-[640px]' },
    },
  },
  defaultVariants: { radius: 'md' },
});
const s = dialogVariants();

export interface DialogSurfaceProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof dialogVariants> {
  /** Fixed width in px. */
  width?: number;
  /** Fixed height in px. */
  height?: number;
}
/** Static modal card (no overlay, positioning or focus management): for docs, labs and embedding. Never wider than its container. */
export const DialogSurface = forwardRef<HTMLDivElement, DialogSurfaceProps>(function DialogSurface({ className, radius, size, width, height, style, ...props }, ref) {
  return <div ref={ref} className={cn(dialogVariants({ radius, size }).surface(), 'max-w-full', className)} style={{ width, height, ...style }} {...props} />;
});

/** Static underlay (for frozen lab renders). */
export function DialogOverlay({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(s.overlay(), className)} {...props} />;
}

export type DialogContentProps = ComponentPropsWithoutRef<typeof D.Content> & VariantProps<typeof dialogVariants> & {
  /** Fixed width in px; overrides `size`. */
  width?: number;
  /** Fixed height in px. */
  height?: number;
  /** Distance from the top in px (top-anchored, like a search panel). Default: vertically centered. */
  top?: number;
};
const Content = forwardRef<ElementRef<typeof D.Content>, DialogContentProps>(function Content(
  { className, radius, size, width, height, top, style, children, onKeyDown, onEscapeKeyDown, ...props }, ref,
) {
  const escape = useEscapeFallback(onEscapeKeyDown);
  return (
    <ThemePortal primitive={D.Portal}>
      <D.Overlay className={cn('motion-overlay', s.overlay())} />
      <D.Content
        ref={ref}
        aria-modal="true"
        className={cn(
          'motion-portal motion-dialog',
          dialogVariants({ radius, size: width === undefined ? (size ?? 'md') : undefined }).surface(),
          'fixed left-1/2 z-50 flex max-h-[calc(100dvh-32px)] max-w-[calc(100vw-16px)] -translate-x-1/2 flex-col gap-2 overflow-y-auto p-6',
          'max-sm:p-5',
          top === undefined && 'top-1/2 -translate-y-1/2',
          className,
        )}
        style={{ width, height, top, ...style }}
        onEscapeKeyDown={onEscapeKeyDown}
        onKeyDown={(e) => { onKeyDown?.(e); escape.onKeyDown(e); }}
        {...props}
      >
        <D.Close ref={escape.closeRef} hidden tabIndex={-1} aria-hidden />
        {children}
      </D.Content>
    </ThemePortal>
  );
});

/** Radix `Dialog.Portal`, routed through the nearest Theme's portal layer (see `ThemePortal`). */
function Portal(props: D.DialogPortalProps) {
  return <ThemePortal primitive={D.Portal} {...props} />;
}

const Title = forwardRef<ElementRef<typeof D.Title>, ComponentPropsWithoutRef<typeof D.Title>>(function Title({ className, ...p }, ref) {
  return <D.Title ref={ref} className={cn(s.title(), className)} {...p} />;
});
const Description = forwardRef<ElementRef<typeof D.Description>, ComponentPropsWithoutRef<typeof D.Description>>(function Description({ className, ...p }, ref) {
  return <D.Description ref={ref} className={cn(s.description(), className)} {...p} />;
});
/** Action row at the bottom of a dialog: right-aligned buttons, stacked full-width on phones (primary on top). */
const Footer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Footer({ className, ...p }, ref) {
  return <div ref={ref} className={cn(s.footer(), className)} {...p} />;
});

/**
 * Modal dialog (WAI-ARIA dialog-modal): traps focus, closes on Escape or an overlay click, returns focus
 * to the trigger. Every dialog needs a `Dialog.Title` (its accessible name); add a `Dialog.Description`
 * or pass `aria-describedby={undefined}` to Content. Use for focused tasks that block the page; prefer
 * Popover for small inline edits and Sheet for side panels.
 *
 * <Dialog.Root><Dialog.Trigger asChild><Button>Edit</Button></Dialog.Trigger>
 *   <Dialog.Content size="sm"><Dialog.Title>…</Dialog.Title><Dialog.Description>…</Dialog.Description>
 *   <Dialog.Footer><Dialog.Close asChild><Button>Cancel</Button></Dialog.Close></Dialog.Footer></Dialog.Content></Dialog.Root>
 */
export const Dialog = { Root: D.Root, Trigger: D.Trigger, Close: D.Close, Portal, Content, Title, Description, Footer };

/* ---------- confirm dialog ---------- */

export interface ConfirmDialogBodyProps {
  title: ReactNode;
  description?: ReactNode;
  /** Confirm button text (default "Delete" when destructive, otherwise "Confirm"). */
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  /** Red confirm (delete) vs blue. Default true. */
  destructive?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  /** Show a spinner on the confirm button and block both buttons. */
  loading?: boolean;
  /** Use Radix Title/Description/Close (inside Dialog.Content). */
  radix?: boolean;
}

/**
 * Body of the confirm dialog: 300px wide, padding 20, centered 14/20 text, stacked full-width 32px
 * buttons (red or blue confirm, outlined cancel), gap 8.
 */
export function ConfirmDialogBody({ title, description, confirmLabel, cancelLabel = 'Cancel', destructive = true, onConfirm, onCancel, loading, radix }: ConfirmDialogBodyProps) {
  const T = radix ? Title : 'div';
  const Ds = radix ? Description : 'div';
  const cancel = <Button variant="secondary" size="lg" full disabled={loading} data-confirm-cancel="" onClick={onCancel}>{cancelLabel}</Button>;
  return (
    <div className="flex flex-col items-center gap-4 p-5 text-center">
      <div className="flex flex-col gap-1">
        <T className="text-[14px] font-medium leading-5 text-n-text-primary">{title}</T>
        {description && <Ds className="text-[14px] leading-5 text-n-text-secondary">{description}</Ds>}
      </div>
      <div className="flex w-full flex-col gap-2">
        <Button
          variant={destructive ? 'danger' : 'primary'}
          size="lg"
          full
          aria-busy={loading || undefined}
          aria-disabled={loading || undefined}
          className="relative"
          onClick={loading ? undefined : onConfirm}
        >
          <span className={cn(loading && 'invisible')}>{confirmLabel ?? (destructive ? 'Delete' : 'Confirm')}</span>
          {loading && <span className="absolute inset-0 flex items-center justify-center"><Spinner size={16} className="text-current" aria-label="Working" /></span>}
        </Button>
        {radix ? <D.Close asChild>{cancel}</D.Close> : cancel}
      </div>
    </div>
  );
}

export interface ConfirmDialogProps extends Omit<ConfirmDialogBodyProps, 'radix' | 'loading' | 'onConfirm'> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Called on confirm. Return a Promise to keep the dialog open with a busy confirm button until it settles;
   * it closes when the Promise resolves and stays open (so the user can retry) when it rejects. */
  onConfirm: () => void | Promise<void>;
  /** Element that opens the dialog (rendered as the Radix trigger). */
  trigger?: ReactNode;
}

/**
 * Confirm or cancel a consequential action (WAI-ARIA alertdialog). Escape and Cancel dismiss it; focus
 * starts on Cancel so Enter never confirms by accident. Use it for destructive or irreversible actions, not
 * for routine saves.
 */
export function ConfirmDialog({ open: openProp, defaultOpen = false, onOpenChange, trigger, onConfirm, onCancel, ...body }: ConfirmDialogProps) {
  const [inner, setInner] = useState(defaultOpen);
  const open = openProp ?? inner;
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const commit = (next: boolean) => {
    setInner(next);
    onOpenChange?.(next);
  };
  const setOpen = (next: boolean) => {
    if (!next && loading) return;
    commit(next);
  };
  const confirm = () => {
    const result = onConfirm();
    if (result instanceof Promise) {
      setLoading(true);
      result.then(
        () => { if (mounted.current) { setLoading(false); commit(false); } },
        () => { if (mounted.current) setLoading(false); },
      );
    } else {
      commit(false);
    }
  };

  return (
    <D.Root open={open} onOpenChange={setOpen}>
      {trigger && <D.Trigger asChild>{trigger}</D.Trigger>}
      <Content
        width={300}
        role="alertdialog"
        className="p-0 max-sm:p-0"
        onOpenAutoFocus={(e) => {
          // Focus Cancel, the safe choice (APG alertdialog).
          const cancelButton = bodyRef.current?.querySelector<HTMLButtonElement>('[data-confirm-cancel]');
          if (cancelButton) { e.preventDefault(); cancelButton.focus(); }
        }}
        onEscapeKeyDown={(e) => { if (loading) e.preventDefault(); }}
        onPointerDownOutside={(e) => { if (loading) e.preventDefault(); }}
      >
        <div ref={bodyRef}>
          <ConfirmDialogBody radix {...body} loading={loading} onConfirm={confirm} onCancel={onCancel} />
        </div>
      </Content>
    </D.Root>
  );
}
