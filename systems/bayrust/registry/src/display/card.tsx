import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { mergeIntoChild } from '../lib/slot';

export interface CardRootProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Gives the card hover and focus affordances. Use it only when the whole card is a target. */
  interactive?: boolean;
  asChild?: boolean;
}

/** A grouped surface. `interactive` when the whole card is one target — wrap it in a link with `asChild`. */
export const CardRoot = forwardRef<HTMLDivElement, CardRootProps>(function CardRoot(
  { children, interactive, asChild, className, ...rest },
  ref,
) {
  const props = { className: cn('bay-card', className), 'data-interactive': interactive ? '' : undefined, ...rest };
  if (asChild) return mergeIntoChild(children, props);
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});

type PartProps = HTMLAttributes<HTMLDivElement> & { children?: ReactNode };

/** The card's top block: title, description, and anything pinned opposite them. */
export const CardHeader = forwardRef<HTMLDivElement, PartProps>(function CardHeader({ children, className, ...rest }, ref) {
  return (
    <div ref={ref} className={cn('bay-card__header', className)} {...rest}>
      {children}
    </div>
  );
});

/** The card's name. Renders an h3, so a page of cards keeps a sensible outline. */
export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement> & { children?: ReactNode }>(
  function CardTitle({ children, className, ...rest }, ref) {
    return (
      <h3 ref={ref} className={cn('bay-card__title', className)} {...rest}>
        {children}
      </h3>
    );
  },
);

/** One line under the title. */
export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement> & { children?: ReactNode }>(
  function CardDescription({ children, className, ...rest }, ref) {
    return (
      <p ref={ref} className={cn('bay-card__description', className)} {...rest}>
        {children}
      </p>
    );
  },
);

/** The card's body. */
export const CardContent = forwardRef<HTMLDivElement, PartProps>(function CardContent({ children, className, ...rest }, ref) {
  return (
    <div ref={ref} className={cn('bay-card__content', className)} {...rest}>
      {children}
    </div>
  );
});

/** The card's actions, along its bottom edge. */
export const CardFooter = forwardRef<HTMLDivElement, PartProps>(function CardFooter({ children, className, ...rest }, ref) {
  return (
    <div ref={ref} className={cn('bay-card__footer', className)} {...rest}>
      {children}
    </div>
  );
});

/** Card as an object of parts. The flat aliases above work from React Server Components. */
export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
};
