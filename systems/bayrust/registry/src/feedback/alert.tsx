'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Icon, type IconName } from '../foundations/icon';
import type { Tone } from '../display/badge';
import { Portal } from '../lib/overlay';

const TONE_ICON: Record<Tone, IconName> = {
  neutral: 'info', accent: 'info', info: 'info', success: 'success', warning: 'warning', danger: 'error',
};

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  children?: ReactNode;
  tone?: Tone;
  title?: ReactNode;
  icon?: IconName;
  action?: ReactNode;
  onDismiss?: () => void;
}

/**
 * An inline message.
 *
 * It always carries an icon as well as its tone, so the meaning never rests on colour alone. A
 * `danger` or `warning` alert is announced assertively; the quieter tones are announced politely.
 */
export function Alert({ children, tone = 'info', title, icon, action, onDismiss, className, ...rest }: AlertProps) {
  const urgent = tone === 'danger' || tone === 'warning';
  return (
    <div
      role={urgent ? 'alert' : 'status'}
      aria-live={urgent ? 'assertive' : 'polite'}
      className={cn('bay-alert', className)}
      data-tone={tone}
      {...rest}
    >
      <Icon name={icon ?? TONE_ICON[tone]} size={16} className="bay-alert__icon" />
      <div className="bay-alert__body">
        {title && <p className="bay-alert__title">{title}</p>}
        {children && <div className="bay-alert__text">{children}</div>}
      </div>
      {action && <div className="bay-alert__action">{action}</div>}
      {onDismiss && (
        <button type="button" className="bay-alert__x" onClick={onDismiss} aria-label="Dismiss">
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  );
}

/* ---------- toasts ---------- */

export interface ToastOptions {
  message: ReactNode;
  description?: ReactNode;
  tone?: 'neutral' | 'success' | 'danger';
  action?: { label: string; onClick: () => void };
  /** ms. 0 keeps it until it is dismissed. */
  duration?: number;
}

export interface ToastApi {
  toast: (options: ToastOptions) => string | number;
  dismiss: (id: string | number) => void;
}

interface ToastRecord extends ToastOptions {
  id: number;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Show and dismiss toasts. Throws outside a `ToastProvider`, naming what to add. */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider> — add <ToastProvider> near the root of your app.');
  return ctx;
}

export interface ToastProviderProps {
  children?: ReactNode;
}

/** Hosts the toasts. One of these, near the root. */
export function ToastProvider({ children }: ToastProviderProps) {
  const [items, setItems] = useState<ToastRecord[]>([]);
  const next = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string | number) => {
    const key = Number(id);
    const t = timers.current.get(key);
    if (t) {
      clearTimeout(t);
      timers.current.delete(key);
    }
    setItems((list) => list.filter((i) => i.id !== key));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = ++next.current;
      setItems((list) => [...list, { ...options, id }]);
      const duration = options.duration ?? 5000;
      if (duration > 0) timers.current.set(id, setTimeout(() => dismiss(id), duration));
      return id;
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {items.length > 0 && (
        <Portal>
          {/* the region is always announced; a danger toast is assertive, the rest polite */}
          <ol className="bay-toasts" aria-label="Notifications">
            {items.map((t) => (
              <li
                key={t.id}
                className="bay-toast"
                data-tone={t.tone ?? 'neutral'}
                role={t.tone === 'danger' ? 'alert' : 'status'}
                aria-live={t.tone === 'danger' ? 'assertive' : 'polite'}
              >
                <Icon name={t.tone === 'danger' ? 'error' : t.tone === 'success' ? 'success' : 'info'} size={16} className="bay-toast__icon" />
                <div className="bay-toast__body">
                  <p className="bay-toast__message">{t.message}</p>
                  {t.description && <p className="bay-toast__description">{t.description}</p>}
                </div>
                {t.action && (
                  <button type="button" className="bay-toast__action" onClick={() => { t.action?.onClick(); dismiss(t.id); }}>
                    {t.action.label}
                  </button>
                )}
                <button type="button" className="bay-toast__x" onClick={() => dismiss(t.id)} aria-label="Dismiss">
                  <Icon name="close" size={12} />
                </button>
              </li>
            ))}
          </ol>
        </Portal>
      )}
    </ToastContext.Provider>
  );
}
