'use client';

import { createContext, useContext, useId, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Icon } from '../foundations/icon';
import { useControllable } from '../lib/use-controllable';

interface AccordionCtx {
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
}
const AccordionContext = createContext<AccordionCtx | null>(null);

interface ItemCtx {
  value: string;
  disabled?: boolean;
  triggerId: string;
  panelId: string;
}
const ItemContext = createContext<ItemCtx | null>(null);

function useAccordion(part: string): AccordionCtx {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error(`<Accordion.${part}> must be inside <Accordion.Root>.`);
  return ctx;
}
function useItem(part: string): ItemCtx {
  const ctx = useContext(ItemContext);
  if (!ctx) throw new Error(`<Accordion.${part}> must be inside <Accordion.Item>.`);
  return ctx;
}

type RootBase = Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> & { children?: ReactNode };
export type AccordionRootProps = RootBase &
  (
    | { type: 'single'; collapsible?: boolean; value?: string; defaultValue?: string; onValueChange?: (value: string) => void }
    | { type: 'multiple'; value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void }
  );

/**
 * Expandable sections. `single` keeps one open at a time — add `collapsible` to let the open one
 * close; `multiple` lets any number be open.
 */
export function AccordionRoot(props: AccordionRootProps) {
  const { children, className, ...rest } = props as RootBase;
  const multiple = props.type === 'multiple';

  const [single, setSingle] = useControllable<string>(
    multiple ? undefined : (props as { value?: string }).value,
    (!multiple && (props as { defaultValue?: string }).defaultValue) || '',
    !multiple ? (props as { onValueChange?: (v: string) => void }).onValueChange : undefined,
  );
  const [many, setMany] = useControllable<string[]>(
    multiple ? (props as { value?: string[] }).value : undefined,
    (multiple && (props as { defaultValue?: string[] }).defaultValue) || [],
    multiple ? (props as { onValueChange?: (v: string[]) => void }).onValueChange : undefined,
  );

  const ctx: AccordionCtx = {
    isOpen: (v) => (multiple ? many.includes(v) : single === v),
    toggle: (v) => {
      if (multiple) setMany(many.includes(v) ? many.filter((x) => x !== v) : [...many, v]);
      else if (single === v) {
        // only `collapsible` may close the open one, so `single` always has something open otherwise
        if ((props as { collapsible?: boolean }).collapsible) setSingle('');
      } else setSingle(v);
    },
  };

  // these are consumed above, not passed to the DOM
  delete (rest as Record<string, unknown>).type;
  delete (rest as Record<string, unknown>).collapsible;
  delete (rest as Record<string, unknown>).value;
  delete (rest as Record<string, unknown>).defaultValue;
  delete (rest as Record<string, unknown>).onValueChange;

  return (
    <AccordionContext.Provider value={ctx}>
      <div className={cn('bay-accordion', className)} {...rest}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
  children?: ReactNode;
}

/** One section. */
export function AccordionItem({ value, disabled, children, className, ...rest }: AccordionItemProps) {
  const ctx = useAccordion('Item');
  const auto = useId();
  return (
    <ItemContext.Provider value={{ value, disabled, triggerId: `${auto}-trigger`, panelId: `${auto}-panel` }}>
      <div className={cn('bay-accordion__item', className)} data-open={ctx.isOpen(value) ? '' : undefined} {...rest}>
        {children}
      </div>
    </ItemContext.Provider>
  );
}

/** The row that opens its section. */
export function AccordionTrigger({ children, className, ...rest }: HTMLAttributes<HTMLButtonElement> & { children?: ReactNode }) {
  const ctx = useAccordion('Trigger');
  const item = useItem('Trigger');
  const open = ctx.isOpen(item.value);
  return (
    <h3 className="bay-accordion__heading">
      <button
        type="button"
        id={item.triggerId}
        className={cn('bay-accordion__trigger', className)}
        aria-expanded={open}
        aria-controls={item.panelId}
        disabled={item.disabled}
        onClick={() => ctx.toggle(item.value)}
        {...rest}
      >
        <span>{children}</span>
        <Icon name="chevronDown" size={14} className="bay-accordion__chevron" />
      </button>
    </h3>
  );
}

/** A section's body. Removed from the tree when closed, so its controls are not tabbable. */
export function AccordionContent({ children, className, ...rest }: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  const ctx = useAccordion('Content');
  const item = useItem('Content');
  if (!ctx.isOpen(item.value)) return null;
  return (
    <div role="region" id={item.panelId} aria-labelledby={item.triggerId} className={cn('bay-accordion__content', className)} {...rest}>
      {children}
    </div>
  );
}

/** Accordion as an object of parts. The flat aliases above work from React Server Components. */
export const Accordion = {
  Root: AccordionRoot,
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
};
