import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { Slot } from 'radix-ui';
import { tv, type VariantProps } from '../lib/tv';
import { Icon } from '../icons/Icon';

/**
 * Link styles.
 * - `inline` (links in running text): inherits the text color, underlined, 70% opacity until hovered.
 * - `accent` (UI links such as "Upgrade"): accent blue text, underline on hover.
 * - `subtle` (secondary UI links such as "Learn more"): secondary text, primary on hover.
 */
export const linkVariants = tv({
  base: 'cursor-pointer rounded-n-xs outline-none focus-visible:shadow-n-focus-shadow',
  variants: {
    variant: {
      inline: 'text-inherit underline opacity-70 [text-decoration-thickness:1px] [text-underline-offset:2px] hover:opacity-100',
      accent: 'text-n-blue-text-accent-primary no-underline hover:underline',
      subtle: 'text-n-text-secondary no-underline hover:text-n-text-primary',
    },
  },
  defaultVariants: { variant: 'inline' },
});

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, VariantProps<typeof linkVariants> {
  /** Opens in a new tab (`target="_blank"`, `rel="noreferrer"`) and shows an external-link icon. */
  external?: boolean;
  /** Render the styles on your router's link component instead of `<a>`. */
  asChild?: boolean;
}

/**
 * Text link for navigation, inline in sentences or as a UI link. Use Button (`asChild`) when a link
 * should look like a button; use `external` for links that leave the app.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { variant, external = false, asChild, className, children, target, rel, ...props },
  ref,
) {
  const cls = linkVariants({ variant, className: [external && 'inline-flex items-baseline gap-0.5', className].filter(Boolean).join(' ') });
  if (asChild) {
    return <Slot.Root ref={ref} className={cls} {...props} {...(target ? { target } : {})} {...(rel ? { rel } : {})}>{children}</Slot.Root>;
  }
  return (
    <a
      ref={ref}
      className={cls}
      target={external ? '_blank' : target}
      rel={external ? 'noreferrer' : rel}
      {...props}
    >
      {children}
      {external && (
        <>
          <Icon name="arrowUpRight" size={14} className="self-center opacity-70" />
          <span className="sr-only"> (opens in a new tab)</span>
        </>
      )}
    </a>
  );
});
