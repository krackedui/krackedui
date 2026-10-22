import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Slot } from 'radix-ui';
import { cn } from '../lib/cn';
import { tv } from '../lib/tv';

/**
 * Grouped content surface: primary background, hairline border, 8px radius, no shadow (Motion's gallery
 * cards and settings panels). `interactive` adds the card hover wash and a focus ring, for cards that are a
 * single link or button (`asChild`).
 */
export const cardVariants = tv({
  base: 'flex min-w-0 flex-col rounded-n-lg border border-n-border-primary bg-n-bg-primary text-n-text-primary',
  variants: {
    interactive: {
      true: [
        'cursor-pointer text-left no-underline outline-none transition-[background] duration-[20ms] ease-in',
        'hover:bg-n-card-hover-bg active:bg-n-card-pressed-bg focus-visible:shadow-[var(--n-focus-shadow)]',
      ],
    },
  },
});

export interface CardRootProps extends HTMLAttributes<HTMLDivElement> {
  /** Hover + pressed states and a focus ring; use with `asChild` around a link or button. */
  interactive?: boolean;
  /** Render as the child element (e.g. `<a>`), keeping the card styles. */
  asChild?: boolean;
}

/** Card surface. Compose Header (Title, Description), Content and Footer inside. */
const Root = forwardRef<HTMLDivElement, CardRootProps>(function CardRoot({ interactive, asChild, className, ...props }, ref) {
  const Comp = asChild ? Slot.Root : 'div';
  return <Comp ref={ref} className={cardVariants({ interactive, className })} {...props} />;
});

type PartProps = HTMLAttributes<HTMLDivElement> & { asChild?: boolean };

function part(displayName: string, base: string) {
  const Part = forwardRef<HTMLDivElement, PartProps>(function CardPart({ asChild, className, ...props }, ref) {
    const Comp = asChild ? Slot.Root : 'div';
    return <Comp ref={ref} className={cn(base, className)} {...props} />;
  });
  Part.displayName = displayName;
  return Part;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Right-aligned control next to the title ("View all", a segmented toggle, a "…" menu). Wraps under it when narrow. */
  action?: ReactNode;
  /** Render as the child element (ignored when `action` is set: the header then lays out two columns). */
  asChild?: boolean;
}

/** Top area: title and description, with an optional right-aligned `action`. */
const Header = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader({ action, asChild, className, children, ...props }, ref) {
  if (action === undefined || action === null || action === false) {
    const Comp = asChild ? Slot.Root : 'div';
    return <Comp ref={ref} className={cn('flex flex-col gap-0.5 px-4 pt-4 last:pb-4', className)} {...props}>{children}</Comp>;
  }
  return (
    <div ref={ref} className={cn('flex flex-wrap items-start justify-between gap-x-3 gap-y-2 px-4 pt-4 last:pb-4', className)} {...props}>
      <div className="flex min-w-0 flex-1 basis-40 flex-col gap-0.5">{children}</div>
      <div className="flex shrink-0 items-center gap-2">{action}</div>
    </div>
  );
});
Header.displayName = 'Card.Header';
/** Card title (16px semibold). Use `asChild` to render a heading element (`<h2>`, `<h3>`). */
const Title = part('Card.Title', 'text-[16px] font-semibold leading-6 text-n-text-primary');
/** Secondary line under the title. */
const Description = part('Card.Description', 'text-n-ui text-n-text-secondary');
/** Main area. */
const Content = part('Card.Content', 'min-w-0 px-4 py-3 first:pt-4 last:pb-4');
/** Bottom area for actions or meta, separated by a hairline. */
const Footer = part('Card.Footer', 'mt-auto flex flex-wrap items-center gap-2 border-t border-n-border-secondary-translucent-a px-4 py-3');

/**
 * Grouped content surface (`Card.Root`, `Header`, `Title`, `Description`, `Content`, `Footer`).
 * Use it to group a metric, a chart or a short list; don't nest cards.
 */
export const Card = { Root, Header, Title, Description, Content, Footer };
