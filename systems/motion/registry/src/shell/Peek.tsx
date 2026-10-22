import { createContext, forwardRef, useContext, useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { Dialog } from 'radix-ui';
import { cn } from '../lib/cn';
import { Icon, type IconName } from '../icons/Icon';
import { Avatar } from '../atoms/Avatar';
import { useDialogReturnFocus, usePresence } from './hooks';
import { ResizeHandle } from './ResizeHandle';

/* -------------------------------------------------------------------------------------------------
 * Page peeks. Measured (capture/states/side-peek, 1710x1037):
 *  side peek  660 wide at the right edge, full height, bg-primary, shadow-outline-md, z 109, resize handle on the left
 *  top bar    44, pad 0 10 0 12; left: Close (») + Open full page (24px buttons, radius 6, icon-secondary),
 *             then (hover only) | Switch peek mode, | Previous / Next; right: Share, Copy link, Favorite, Actions
 *  content    76px side padding (508 column @660); title 32/38.4 700; properties 14/21 rows 34 (+4);
 *             "Comments" 13/18 500 text-secondary, input row: 24px avatar + "Add a comment…"
 * -----------------------------------------------------------------------------------------------*/

function PeekIconButton({ icon, label, size = 20, onClick, className }: { icon: IconName; label: string; size?: number; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn('flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-n-md text-n-icon-secondary hover:bg-n-button-hover-bg-a', className)}
    >
      <Icon name={icon} size={size} />
    </button>
  );
}
const Divider = () => <div aria-hidden className="mx-1.5 h-3.5 w-px bg-n-border-primary-translucent-a" />;

export interface PeekTopBarProps {
  mode?: 'side' | 'center';
  onClose?: () => void;
  onOpenFull?: () => void;
  onSwitchMode?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  actions?: ReactNode;
}
/** The 44px peek header (close/expand/mode/prev-next on the left, page actions on the right). */
export function PeekTopBar({ mode = 'side', onClose, onOpenFull, onSwitchMode, onPrev, onNext, actions }: PeekTopBarProps) {
  return (
    <div className="peek-top-hover-area group/peekbar relative z-[100] flex h-11 shrink-0 items-center justify-between rounded-t-n-2xl bg-n-bg-primary pl-3 pr-2.5">
      <div className="flex items-center gap-0.5">
        <PeekIconButton icon={mode === 'side' ? 'arrowChevronDoubleForward' : 'xMark'} label="Close" onClick={onClose} className="motion-peek-close" />
        <PeekIconButton icon="arrowExpandDiagonalSmall" label="Open in full page" size={16} onClick={onOpenFull} />
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/peekbar:opacity-100 focus-within:opacity-100">
          <Divider />
          <PeekIconButton icon="peekSide" label="Switch peek mode" onClick={onSwitchMode} />
          <Divider />
          <PeekIconButton icon="arrowChevronSingleUp" label="Previous page" onClick={onPrev} />
          <PeekIconButton icon="arrowChevronSingleDown" label="Next page" onClick={onNext} />
        </div>
      </div>
      <div className="z-[1] flex items-center justify-end gap-0.5 pl-3">{actions}</div>
    </div>
  );
}

export interface PeekCommentsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  avatar?: ReactNode;
  placeholder?: string;
  onSubmit?: (text: string) => void;
  /** Existing discussion rendered above the input. */
  children?: ReactNode;
}
/** "Comments" block under the properties: label + discussion input (attach, mention, send revealed on focus). */
export function PeekComments({ avatar = <Avatar name="A" size={24} shape="user" />, placeholder = 'Add a comment…', onSubmit, children, className, ...props }: PeekCommentsProps) {
  const [text, setText] = useState('');
  return (
    <div className={cn('flex flex-col gap-0.5 border-b border-n-border-primary-translucent-a pl-2', className)} {...props}>
      <div className="flex items-center gap-0.5 py-[3px] text-[13px] font-medium leading-[18px] text-n-text-secondary">Comments</div>
      {children}
      <div className="pb-3 pr-1 pt-2">
        <div className="group/cmt flex items-center">
          <div className="mr-2 flex size-6 shrink-0 items-center justify-center">{avatar}</div>
          <div className="-my-[3.5px] -mx-1 flex min-w-0 flex-1 flex-wrap items-center justify-end gap-x-1.5 gap-y-1 rounded-n-md px-1 pb-[3px] pt-[3.5px] text-[14px] leading-[21px]">
            <input
              aria-label={placeholder}
              placeholder={placeholder}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && text.trim()) { onSubmit?.(text); setText(''); } }}
              className="min-w-0 flex-1 bg-transparent pt-0.5 leading-5 outline-none placeholder:text-n-text-tertiary"
            />
            <div className={cn('flex items-center gap-1.5 transition-opacity', text ? 'opacity-100' : 'opacity-0 group-focus-within/cmt:opacity-100')}>
              <PeekIconButton icon="paperClip" label="Attach file" />
              <PeekIconButton icon="at" label="Mention a person, page, or date" />
              <button
                type="button"
                aria-label="Send comment"
                disabled={!text.trim()}
                onClick={() => { onSubmit?.(text); setText(''); }}
                className="flex size-6 cursor-pointer items-center justify-center rounded-n-md text-n-blue-icon-accent-primary disabled:cursor-default disabled:text-n-icon-secondary disabled:opacity-40"
              >
                <Icon name="arrowInCircleUpFill" size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PeekTableCtx = createContext(false);

export interface PeekPropertyProps extends HTMLAttributes<HTMLDivElement> {
  icon?: IconName;
  label: ReactNode;
  children?: ReactNode;
  /** Shown in tertiary when there is no value. */
  empty?: ReactNode;
}
/** Property row: 160px label cell (pad 0 6, radius 6, text-secondary, 16px icon) + value cell (pad 6, radius 4). */
export function PeekProperty({ icon = 'textNormal', label, children, empty = 'Empty', className, ...props }: PeekPropertyProps) {
  const inTable = useContext(PeekTableCtx);
  return (
    <div role={inTable ? 'row' : undefined} className={cn('mb-1 flex min-h-[34px] text-[14px] leading-[21px]', className)} {...props}>
      <div role={inTable ? 'rowheader' : undefined} className="flex h-[34px] w-[120px] shrink-0 cursor-pointer sm:w-[160px] items-center rounded-n-md px-1.5 text-n-text-secondary hover:bg-n-button-hover-bg-a">
        <div className="flex min-w-0 items-center gap-1.5 leading-5">
          <span aria-hidden className="flex h-6 w-[18px] shrink-0 items-center justify-center text-n-icon-secondary"><Icon name={icon} size={16} /></span>
          <span className="truncate">{label}</span>
        </div>
      </div>
      <div role={inTable ? 'cell' : undefined} className="ml-1 flex min-w-0 flex-1">
        <div className="ml-1 flex min-h-[34px] w-full cursor-pointer items-center overflow-hidden rounded-n-sm px-1.5 py-1.5 hover:bg-n-button-hover-bg-a">
          {children ?? <span className="text-n-text-tertiary">{empty}</span>}
        </div>
      </div>
    </div>
  );
}
/** Properties table wrapper + "Add a property" row. */
export function PeekProperties({ children, onAddProperty, className, ...props }: HTMLAttributes<HTMLDivElement> & { onAddProperty?: () => void }) {
  return (
    <div className={cn('mb-3 pb-2 pl-0.5 pt-2', className)} {...props}>
      <div role="table" aria-label="Page properties"><PeekTableCtx.Provider value>{children}</PeekTableCtx.Provider></div>
      <button
        type="button"
        onClick={onAddProperty}
        className="flex h-[34px] cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-n-md pl-1.5 pr-2 text-[14px] leading-[16.8px] text-n-text-tertiary hover:bg-n-button-hover-bg-a"
      >
        <Icon name="plusFillSmall" size={16} className="mt-px text-n-icon-tertiary" />
        Add a property
      </button>
    </div>
  );
}

export interface PeekBodyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Header (usually `<PageHeader size="peek"/>`). */
  header?: ReactNode;
  properties?: ReactNode;
  comments?: ReactNode;
  children?: ReactNode;
  /** Side padding of the content column (side 76, center 96). */
  gutter?: number;
}
/** Scrolling peek content: header, properties, comments, page body in a padded column. */
export function PeekBody({ header, properties, comments, children, gutter = 76, className, ...props }: PeekBodyProps) {
  return (
    <div className={cn('motion-scroller relative z-[1] min-h-0 flex-1 overflow-y-auto overflow-x-hidden', className)} {...props}>
      <div className="grid pb-[120px] [grid-template-columns:16px_minmax(0,1fr)_16px] sm:[grid-template-columns:var(--peek-gutter)_minmax(0,1fr)_var(--peek-gutter)]" style={{ '--peek-gutter': `${gutter}px` } as CSSProperties}>
        <div className="col-start-2 mb-2 min-w-0">{header}</div>
        {properties && <div className="col-start-2 min-w-0">{properties}</div>}
        {comments && <div className="col-start-2 min-w-0">{comments}</div>}
        <div className="col-start-2 mt-2 min-w-0 pt-2">{children}</div>
      </div>
    </div>
  );
}

export interface SidePeekProps extends Omit<HTMLAttributes<HTMLDialogElement>, 'title'>, Omit<PeekTopBarProps, 'mode'> {
  /** Shown while true; closing plays the exit animation, then unmounts. */
  open?: boolean;
  width?: number;
  minWidth?: number;
  /** Widest the handle can resize it to (default 1200; it never exceeds its container). */
  maxWidth?: number;
  /** Accessible name of the peek (default "Page preview"). */
  label?: string;
  /** Move focus into the peek when it opens (default true). Turn off for peeks shown on page load. */
  autoFocus?: boolean;
  /** Top bar right side. */
  actions?: ReactNode;
  children?: ReactNode;
}
/**
 * Side peek: a page preview panel anchored to the right of the main column (660 wide, resizable from
 * its left edge), full-screen on phones. A non-modal `<dialog open>`: focus moves into it on open and
 * returns to the opener on close; Escape closes; the page behind stays usable. Children are usually `<PeekBody/>`. Use `CenterPeek` for a modal preview.
 */
export const SidePeek = forwardRef<HTMLDialogElement, SidePeekProps>(function SidePeek(
  { open = true, width = 660, minWidth = 400, maxWidth = 1200, label = 'Page preview', autoFocus = true, onClose, onOpenFull, onSwitchMode, onPrev, onNext, actions, className, style, children, onKeyDown, ...props }, ref,
) {
  const [w, setW] = useState(width);
  const presence = usePresence<HTMLDialogElement>(open);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return undefined;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (autoFocus) presence.ref.current?.focus({ preventScroll: true });
    return () => {
      const el = opener.current;
      if (el && el.isConnected && (!document.activeElement || document.activeElement === document.body || presence.ref.current?.contains(document.activeElement))) el.focus({ preventScroll: true });
    };
  }, [open, autoFocus, presence.ref]);
  if (!presence.present) return null;
  const setRef = (el: HTMLDialogElement | null) => {
    presence.ref.current = el;
    if (typeof ref === 'function') ref(el); else if (ref) ref.current = el;
  };
  return (
    <dialog
      ref={setRef}
      open
      aria-label={label}
      tabIndex={-1}
      data-state={presence.state}
      data-side="right"
      onAnimationEnd={presence.onAnimationEnd}
      onKeyDown={(e) => { onKeyDown?.(e); if (e.key === 'Escape' && !e.defaultPrevented && open) { e.preventDefault(); onClose?.(); } }}
      inert={!open}
      className={cn(
        // reset the dialog element's UA box (margin, border, padding, fit-content size, inline insets)
        'motion-sheet motion-peek-renderer absolute bottom-0 left-auto right-0 top-0 z-[109] m-0 flex h-auto flex-col border-0 bg-n-bg-primary p-0 text-n-text-primary shadow-n-shadow-outline-md outline-none',
        'max-md:fixed max-md:inset-0 max-md:z-[160] max-md:!w-full max-md:shadow-none',
        className,
      )}
      style={{ width: w, maxWidth: '100%', ...style }}
      {...props}
    >
      <ResizeHandle label="Preview width" edge="left" value={w} min={minWidth} max={maxWidth} step={20} onResize={setW} className="left-0 z-[109]" />
      <PeekTopBar mode="side" {...{ onClose, onOpenFull, onSwitchMode, onPrev, onNext, actions }} />
      {children}
    </dialog>
  );
});

export interface CenterPeekProps extends Omit<PeekTopBarProps, 'mode'> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dialog title for assistive tech (visually hidden), default "Page". */
  title?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}
/**
 * Center peek: a modal page preview over a dimmed underlay (970 max wide, 72px from top and bottom),
 * full-screen on phones. Radix Dialog: focus is trapped, Escape and the underlay close it, focus
 * returns to the opener. Use it when the preview should take over; use `SidePeek` to keep the page usable.
 */
export function CenterPeek({ open, onOpenChange, title = 'Page', onClose, onOpenFull, onSwitchMode, onPrev, onNext, actions, children, className }: CenterPeekProps) {
  const change = (v: boolean) => { onOpenChange(v); if (!v) onClose?.(); };
  const returnFocus = useDialogReturnFocus();
  return (
    <Dialog.Root open={open} onOpenChange={change}>
      <Dialog.Portal>
        <Dialog.Overlay className="motion-overlay fixed inset-0 z-[108] bg-n-modal-underlay-bg-a" />
        <Dialog.Content
          aria-describedby={undefined}
          aria-modal="true"
          {...returnFocus}
          className={cn(
            'motion-dialog motion-portal fixed inset-0 z-[109] flex flex-col overflow-hidden bg-n-bg-primary text-n-text-primary outline-none',
            'md:inset-auto md:left-0 md:right-0 md:top-[72px] md:mx-auto md:h-[calc(100vh-144px)] md:w-[calc(100vw-144px)] md:max-w-[970px] md:rounded-n-2xl md:shadow-n-shadow-outline-scroll',
            className,
          )}
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <PeekTopBar mode="center" onClose={() => change(false)} {...{ onOpenFull, onSwitchMode, onPrev, onNext, actions }} />
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
