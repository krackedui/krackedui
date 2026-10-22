import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { tv } from '../lib/tv';
import { Icon, type IconName } from '../icons/Icon';

/**
 * What to show when a list, table or page has nothing yet: a quiet icon, a one-line title, a sentence of
 * explanation and the next action. Matches Motion's empty database states (icon-tertiary, centered,
 * 14px text-secondary copy).
 */
export const emptyStateVariants = tv({
  slots: {
    root: 'flex w-full flex-col items-center justify-center px-4 py-10 text-center',
    icon: 'mb-3 flex size-10 items-center justify-center rounded-n-lg bg-n-bg-tertiary-translucent-a text-n-icon-secondary',
    title: 'text-n-ui-medium text-n-text-primary text-balance',
    description: 'mt-1 max-w-sm text-n-ui text-n-text-secondary text-pretty',
    action: 'mt-4 flex flex-wrap items-center justify-center gap-2',
  },
  variants: {
    size: {
      sm: { root: 'py-6', icon: 'mb-2 size-8' },
      md: {},
    },
  },
  defaultVariants: { size: 'md' },
});

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: IconName;
  title: ReactNode;
  description?: ReactNode;
  /** The next step, usually a primary Button. */
  action?: ReactNode;
  /** `sm` for empty states inside cards and table bodies. */
  size?: 'sm' | 'md';
}

/** Empty list/table/page message with an optional icon and next action. */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { icon, title, description, action, size, className, children, ...props },
  ref,
) {
  const s = emptyStateVariants({ size });
  return (
    <div ref={ref} className={s.root({ className })} {...props}>
      {icon && (
        <span className={s.icon()}>
          <Icon name={icon} size={size === 'sm' ? 18 : 20} />
        </span>
      )}
      <p className={s.title()}>{title}</p>
      {description && <p className={s.description()}>{description}</p>}
      {children}
      {action && <div className={s.action()}>{action}</div>}
    </div>
  );
});
