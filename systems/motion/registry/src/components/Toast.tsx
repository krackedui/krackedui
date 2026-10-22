import { createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { Toast as T } from 'radix-ui';
import { cn } from '../lib/cn';
import { tv, type VariantProps } from '../lib/tv';
import { Icon, type IconName } from '../icons/Icon';

/**
 * Toast: the small inverted pill at the bottom center ("Copied link to clipboard", "Moved to Trash · Undo").
 * 14/20 text, padding 6 12, radius 8, inverted colors (text-primary background, bg-primary text),
 * shadow base-lg, 24px from the bottom. Tones keep the pill and color the leading icon (success green, danger red).
 */
export const toastVariants = tv({
  slots: {
    root: [
      'pointer-events-auto flex w-max max-w-[min(480px,calc(100vw-32px))] items-start gap-2 rounded-n-lg px-3 py-1.5 shadow-n-shadow-base-lg',
      'bg-n-text-primary text-[14px] leading-5 text-n-bg-primary outline-none focus-visible:shadow-n-focus-shadow',
    ],
    icon: 'mt-0.5 shrink-0',
    body: 'flex min-w-0 flex-1 flex-col break-words',
    description: 'text-[12px] leading-4 opacity-80',
    action: [
      'shrink-0 cursor-pointer rounded-n-sm px-1 font-medium underline-offset-2 outline-none hover:underline',
      'focus-visible:shadow-n-focus-shadow pointer-coarse:min-h-6',
    ],
    close: [
      'flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-n-sm opacity-70 outline-none hover:opacity-100',
      'focus-visible:shadow-n-focus-shadow pointer-coarse:size-6',
    ],
  },
  variants: {
    tone: {
      neutral: {},
      success: { icon: 'text-n-green-icon-accent-primary' },
      danger: { icon: 'text-n-red-icon-accent-primary' },
    },
  },
  defaultVariants: { tone: 'neutral' },
});

type Tone = 'neutral' | 'success' | 'danger';
const toneIcon: Record<Tone, IconName | undefined> = { neutral: undefined, success: 'success', danger: 'error' };

export interface ToastPillProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
  /** Leading icon. Defaults by tone (success: check circle, danger: error). */
  icon?: IconName;
  /** Second line under the message. */
  description?: ReactNode;
  /** Action label ("Undo", "View"). */
  action?: ReactNode;
  onAction?: () => void;
  /** Show a close button (×). */
  onClose?: () => void;
}
/** Static toast pill (no timers, portal or live region): for docs and static renders. */
export const ToastPill = forwardRef<HTMLDivElement, ToastPillProps>(function ToastPill(
  { icon, description, action, onAction, onClose, tone, className, children, ...props }, ref,
) {
  const s = toastVariants({ tone });
  const shownIcon = icon ?? toneIcon[tone ?? 'neutral'];
  return (
    <div ref={ref} className={cn(s.root(), className)} {...props}>
      {shownIcon && <Icon name={shownIcon} size={16} className={s.icon()} />}
      <div className={s.body()}>
        <span>{children}</span>
        {description && <span className={s.description()}>{description}</span>}
      </div>
      {action && <button type="button" className={s.action()} onClick={onAction}>{action}</button>}
      {onClose && <button type="button" aria-label="Dismiss" className={s.close()} onClick={onClose}><Icon name="close" size={14} /></button>}
    </div>
  );
});

/* ---------- imperative API ---------- */

export interface ToastOptions {
  message: ReactNode;
  /** Second line under the message. */
  description?: ReactNode;
  /** `danger` is announced assertively (role alert); the others politely (role status). */
  tone?: Tone;
  /** One action button ("Undo"). Clicking it runs `onClick` and dismisses the toast. */
  action?: { label: string; onClick: () => void };
  /** Milliseconds before it hides; 0 keeps it until dismissed. Default 4000 (6000 with an action or danger). */
  duration?: number;
  /** Leading icon (Motion extra). Defaults by tone. */
  icon?: IconName;
  /** Use your own id (to replace or dismiss a known toast). */
  id?: string | number;
}

export interface ToastApi {
  /** Show a toast; returns its id. */
  toast: (options: ToastOptions) => string | number;
  /** Hide a toast by id (with its exit animation). */
  dismiss: (id: string | number) => void;
}

interface Item extends ToastOptions { id: string | number; open: boolean }
const Ctx = createContext<ToastApi | null>(null);

/**
 * Show and dismiss toasts: `const { toast, dismiss } = useToast(); const id = toast({ message: 'Saved' })`.
 * Throws when used outside `<ToastProvider>`.
 */
export function useToast(): ToastApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast() must be used inside <ToastProvider>. Wrap your app (or the subtree) in <ToastProvider>.');
  return ctx;
}

export interface ToastProviderProps {
  children?: ReactNode;
  /** Default duration in ms (default 4000). */
  duration?: number;
  /** Accessible label of the toast region (Radix appends the hotkey, default "Notifications ({hotkey})"). */
  label?: string;
}

const EXIT_MS = 400; // longer than the slowest exit animation; then the item is dropped from state

/**
 * Hosts toasts: put it once near the root. Toasts stack at the bottom center, pause while hovered or
 * focused, close on Escape (when focused) or a downward swipe, and are announced by a live region.
 * F8 moves focus to the toast region.
 */
export function ToastProvider({ children, duration = 4000, label = 'Notifications ({hotkey})' }: ToastProviderProps) {
  const [items, setItems] = useState<Item[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<string | number, ReturnType<typeof setTimeout>>());

  const remove = useCallback((id: string | number) => {
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, open: false } : x)));
    clearTimeout(timers.current.get(id));
    timers.current.set(id, setTimeout(() => {
      timers.current.delete(id);
      setItems((xs) => xs.filter((x) => x.id !== id || x.open));
    }, EXIT_MS));
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    const id = options.id ?? `toast-${nextId.current++}`;
    clearTimeout(timers.current.get(id));
    setItems((xs) => [...xs.filter((x) => x.id !== id), { ...options, id, open: true }]);
    return id;
  }, []);

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((t) => clearTimeout(t));
  }, []);

  const value = useMemo<ToastApi>(() => ({ toast, dismiss: remove }), [toast, remove]);

  return (
    <Ctx.Provider value={value}>
      <T.Provider duration={duration} swipeDirection="down" label={label}>
        {children}
        {items.map((it) => {
          const tone = it.tone ?? 'neutral';
          const s = toastVariants({ tone });
          const icon = it.icon ?? toneIcon[tone];
          const ms = it.duration ?? (it.action || tone === 'danger' ? Math.max(duration, 6000) : duration);
          return (
            <T.Root
              key={it.id}
              open={it.open}
              onOpenChange={(o) => { if (!o) remove(it.id); }}
              duration={ms === 0 ? Infinity : ms}
              type={tone === 'danger' ? 'foreground' : 'background'}
              // The li is a list item; the live-region role sits on the body (see below).
              role={undefined}
              className={cn('motion-toast', s.root())}
            >
              {icon && <Icon name={icon} size={16} className={s.icon()} />}
              {/* status / alert (danger) semantics with aria-live off: Radix's announcer (assertive for danger) reads it once. */}
              <div className={s.body()} role={tone === 'danger' ? 'alert' : 'status'} aria-live="off" aria-atomic="true">
                <T.Title>{it.message}</T.Title>
                {it.description && <T.Description className={s.description()}>{it.description}</T.Description>}
              </div>
              {it.action && (
                <T.Action altText={it.action.label} className={s.action()} onClick={it.action.onClick}>
                  {it.action.label}
                </T.Action>
              )}
              {(ms === 0 || it.action) && (
                <T.Close aria-label="Dismiss" className={s.close()}>
                  <Icon name="close" size={14} />
                </T.Close>
              )}
            </T.Root>
          );
        })}
        <T.Viewport className="motion-portal fixed bottom-6 left-1/2 z-[100] m-0 flex w-max max-w-[calc(100vw-32px)] -translate-x-1/2 list-none flex-col items-center gap-2 p-0 outline-none" />
      </T.Provider>
    </Ctx.Provider>
  );
}
