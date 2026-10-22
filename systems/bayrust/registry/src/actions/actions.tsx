'use client';

import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn, variants } from '../lib/cn';
import { Icon, type IconName } from '../foundations/icon';
import { mergeIntoChild } from '../lib/slot';

type Size = 'sm' | 'md' | 'lg';

export const buttonVariants = variants('bay-button', {
  variant: { primary: 'bay-button--primary', secondary: 'bay-button--secondary', ghost: 'bay-button--ghost', danger: 'bay-button--danger' },
  size: { sm: 'bay-button--sm', md: 'bay-button--md', lg: 'bay-button--lg' },
});

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: Size;
  icon?: IconName;
  trailingIcon?: IconName;
  /** Shows a spinner, keeps the button's width, sets aria-busy and blocks clicks. */
  loading?: boolean;
  full?: boolean;
  /** Render the child element instead of a button — for a link that should look like one. */
  asChild?: boolean;
}

/** An action. `primary` for the one thing the screen is for, `secondary` beside it, `ghost` in dense rows. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, variant = 'secondary', size = 'md', icon, trailingIcon, loading, full, disabled, asChild, className, type = 'button', onClick, ...rest },
  ref,
) {
  const iconSize = size === 'lg' ? 16 : size === 'sm' ? 12 : 16;
  const inner = (
    <>
      {icon && <Icon name={icon} size={iconSize} />}
      {children != null && <span className="bay-button__label">{children}</span>}
      {trailingIcon && <Icon name={trailingIcon} size={iconSize} />}
    </>
  );
  if (asChild) {
    return mergeIntoChild(children, {
      className: cn(buttonVariants({ variant, size }), className),
      'data-full': full ? '' : undefined,
      ...rest,
    });
  }
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      data-full={full ? '' : undefined}
      data-loading={loading ? '' : undefined}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onClick={loading ? undefined : onClick}
      {...rest}
    >
      {loading && <span className="bay-button__spinner" aria-hidden="true" />}
      <span className="bay-button__content">{inner}</span>
    </button>
  );
});

export const iconButtonVariants = variants('bay-icon-button', {
  variant: { ghost: 'bay-icon-button--ghost', secondary: 'bay-icon-button--secondary' },
  size: { sm: 'bay-icon-button--sm', md: 'bay-icon-button--md', lg: 'bay-icon-button--lg' },
});

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: IconName;
  /** Required: an icon-only control needs an accessible name. Also used as the title. */
  label: string;
  size?: Size;
  variant?: 'ghost' | 'secondary';
  active?: boolean;
}

/** An icon-only action. The label is required, because nothing else names it. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, size = 'md', variant = 'ghost', active, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(iconButtonVariants({ variant, size }), className)}
      aria-label={label}
      title={label}
      aria-pressed={active}
      data-active={active ? '' : undefined}
      {...rest}
    >
      <Icon name={icon} size={size === 'lg' ? 20 : size === 'sm' ? 12 : 16} />
    </button>
  );
});

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: ReactNode;
  /** Opens in a new tab with `rel="noreferrer"`, and says so to assistive tech. */
  external?: boolean;
}

/** An inline link. External links open safely and carry an indicator. */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { children, external, className, target, rel, ...rest },
  ref,
) {
  return (
    <a
      ref={ref}
      className={cn('bay-link', className)}
      target={external ? '_blank' : target}
      rel={external ? 'noreferrer noopener' : rel}
      {...rest}
    >
      {children}
      {external && (
        <>
          <Icon name="externalLink" size={12} className="bay-link__external" />
          <span className="bay-sr-only"> (opens in a new tab)</span>
        </>
      )}
    </a>
  );
});
