import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { tv } from '../lib/tv';
import { Icon, type IconName } from '../icons/Icon';
import type { Tone } from './tone';

/**
 * Inline message in the shape of Motion's callout block: tinted surface, small radius, leading tone icon,
 * a medium-weight title over 14px body text, an optional action and a dismiss button.
 * Danger and warning alerts use `role="alert"` (announced immediately); the others use `role="status"`.
 */
export const alertVariants = tv({
  slots: {
    root: 'flex w-full min-w-0 flex-wrap items-start gap-x-2.5 gap-y-2 rounded-n-md px-3 py-2.5 text-n-ui',
    icon: 'mt-0.5 shrink-0',
    body: 'min-w-0 flex-1 basis-48',
    title: 'font-medium text-n-text-primary',
    content: 'text-n-text-secondary [overflow-wrap:anywhere]',
    action: 'flex shrink-0 items-center gap-1.5',
    dismiss: [
      '-my-0.5 -mr-1 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-n-sm text-n-icon-secondary',
      'hover:bg-n-button-hover-bg-a active:bg-n-button-pressed-bg-a',
    ],
  },
  variants: {
    tone: {
      neutral: { root: 'bg-n-bg-tertiary-translucent-a', icon: 'text-n-icon-secondary' },
      accent: { root: 'bg-n-blue-bg-secondary', icon: 'text-n-blue-icon-accent-primary' },
      info: { root: 'bg-n-blue-bg-secondary', icon: 'text-n-blue-icon-accent-primary' },
      success: { root: 'bg-n-green-bg-secondary', icon: 'text-n-green-icon-accent-primary' },
      warning: { root: 'bg-n-orange-bg-secondary', icon: 'text-n-orange-icon-accent-primary' },
      danger: { root: 'bg-n-red-bg-secondary', icon: 'text-n-red-icon-accent-primary' },
    },
  },
  defaultVariants: { tone: 'info' },
});

const defaultIcon: Record<Tone, IconName> = {
  neutral: 'info',
  accent: 'info',
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'error',
};

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: Tone;
  title?: ReactNode;
  /** Leading icon; defaults per tone (info, success, warning, error). */
  icon?: IconName;
  /** A button or link for the next step (e.g. "Review"). */
  action?: ReactNode;
  /** Shows a close button that calls this. */
  onDismiss?: () => void;
  /** Accessible name of the close button. */
  dismissLabel?: string;
}

/** Inline, in-flow message about the page or a section. For transient feedback use a toast. */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { tone = 'info', title, icon, action, onDismiss, dismissLabel = 'Dismiss', className, children, ...props },
  ref,
) {
  const s = alertVariants({ tone });
  const urgent = tone === 'danger' || tone === 'warning';
  return (
    <div ref={ref} role={urgent ? 'alert' : 'status'} className={s.root({ className })} {...props}>
      <Icon name={icon ?? defaultIcon[tone]} size={16} className={s.icon()} />
      <div className={s.body()}>
        {title && <div className={s.title()}>{title}</div>}
        {children && <div className={s.content()}>{children}</div>}
      </div>
      {action && <div className={s.action()}>{action}</div>}
      {onDismiss && (
        <button type="button" aria-label={dismissLabel} title={dismissLabel} onClick={onDismiss} className={s.dismiss()}>
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  );
});
