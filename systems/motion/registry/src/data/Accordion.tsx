import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import { Accordion as RAccordion } from 'radix-ui';
import { cn } from '../lib/cn';
import { Icon } from '../icons/Icon';

/**
 * Expandable sections (WAI-ARIA accordion, Radix). Items are separated by hairlines; the trigger is a full-width
 * 14px row with a chevron that turns when open; content animates its height (`.motion-collapse`, off under
 * reduced motion).
 */
export type AccordionRootProps = ComponentPropsWithoutRef<typeof RAccordion.Root>;

/** Accordion container. `type="single"` (optionally `collapsible`) or `type="multiple"`. */
const Root = forwardRef<ElementRef<typeof RAccordion.Root>, AccordionRootProps>(function AccordionRoot({ className, ...props }, ref) {
  return <RAccordion.Root ref={ref} className={cn('w-full min-w-0', className)} {...props} />;
});

export type AccordionItemProps = ComponentPropsWithoutRef<typeof RAccordion.Item>;

/** One section: a Trigger and its Content. */
const Item = forwardRef<ElementRef<typeof RAccordion.Item>, AccordionItemProps>(function AccordionItem({ className, ...props }, ref) {
  return <RAccordion.Item ref={ref} className={cn('border-b border-n-border-secondary-translucent-a', className)} {...props} />;
});

export interface AccordionTriggerProps extends ComponentPropsWithoutRef<typeof RAccordion.Trigger> {
  /** Heading level wrapping the trigger (APG: each trigger sits in a heading). Defaults to 3. */
  level?: 2 | 3 | 4 | 5 | 6;
}

/** The button that toggles its section, inside a heading. */
const Trigger = forwardRef<ElementRef<typeof RAccordion.Trigger>, AccordionTriggerProps>(function AccordionTrigger(
  { level = 3, className, children, ...props },
  ref,
) {
  return (
    <RAccordion.Header asChild>
      <div role="heading" aria-level={level} className="flex">
        <RAccordion.Trigger
          ref={ref}
          className={cn(
            'group/accordion flex min-h-10 flex-1 cursor-pointer items-center justify-between gap-3 rounded-n-sm py-2 text-left',
            'text-n-ui-medium text-n-text-primary transition-[background] duration-[20ms] ease-in',
            'hover:bg-n-button-hover-bg-a disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent',
            '-mx-1.5 px-1.5',
            className,
          )}
          {...props}
        >
          <span className="min-w-0">{children}</span>
          <Icon
            name="chevronDown"
            size={16}
            className="shrink-0 text-n-icon-secondary transition-transform duration-200 ease-out group-data-[state=open]/accordion:rotate-180 motion-reduce:transition-none"
          />
        </RAccordion.Trigger>
      </div>
    </RAccordion.Header>
  );
});

export type AccordionContentProps = ComponentPropsWithoutRef<typeof RAccordion.Content>;

/** The collapsible panel. */
const Content = forwardRef<ElementRef<typeof RAccordion.Content>, AccordionContentProps>(function AccordionContent(
  { className, children, ...props },
  ref,
) {
  return (
    <RAccordion.Content ref={ref} className="motion-collapse text-n-ui text-n-text-secondary" {...props}>
      <div className={cn('pb-3 pt-0.5', className)}>{children}</div>
    </RAccordion.Content>
  );
});

/** Expandable sections: `Accordion.Root`, `Item`, `Trigger`, `Content`. For FAQs and grouped settings. */
export const Accordion = { Root, Item, Trigger, Content };
