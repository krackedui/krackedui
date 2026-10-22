import { forwardRef, type ComponentPropsWithoutRef, type HTMLAttributes, type ReactNode } from 'react';
import { Tooltip as RTooltip } from 'radix-ui';
import { cn } from '../lib/cn';

/**
 * Tooltip bubble: 5px 8px padding, 6px radius, 12/16.8 text, dark in both themes (light: primary text
 * color as the fill; dark: border-secondary fill), soft drop shadow, 6px from the trigger, no arrow.
 * Optional second line for a shortcut.
 */
const bubble = cn(
  'relative max-w-[240px] overflow-hidden rounded-n-md px-2 py-[5px] font-sans text-[12px] font-normal leading-[16.8px]',
  'bg-n-text-primary text-n-bg-tertiary dark:bg-n-border-secondary dark:text-n-text-primary',
  'shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),inset_0_0_0_1px_rgba(255,255,255,0.05)]', /* token-exempt: measured tooltip shadow, no shadow token matches */
);

export interface TooltipBubbleProps extends HTMLAttributes<HTMLDivElement> {
  shortcut?: ReactNode;
}

/** The tooltip surface alone (static; for docs and composition). */
export const TooltipBubble = forwardRef<HTMLDivElement, TooltipBubbleProps>(function TooltipBubble({ shortcut, role = 'tooltip', className, children, ...props }, ref) {
  return (
    <div ref={ref} role={role} className={cn(bubble, className)} {...props}>
      <div>{children}</div>
      {shortcut && <div className="text-n-text-inverse-secondary dark:text-n-text-secondary">{shortcut}</div>}
    </div>
  );
});

export const TooltipProvider = RTooltip.Provider;

export interface TooltipProps extends Omit<ComponentPropsWithoutRef<typeof RTooltip.Content>, 'content'> {
  /** Tooltip text. */
  content: ReactNode;
  /** Optional shortcut line, e.g. "⌘⇧L". */
  shortcut?: ReactNode;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Hover delay in ms (tooltips show after a short pause). */
  delayDuration?: number;
}

/**
 * Short hint shown on hover and keyboard focus, e.g. an icon button's name or a shortcut. Wrap the
 * trigger: `<Tooltip content="Share"><IconButton …/></Tooltip>`. Never put essential content or
 * interactive elements in a tooltip; use Popover for that.
 */
export function Tooltip({ content, shortcut, children, open, defaultOpen, onOpenChange, delayDuration = 400, side = 'bottom', sideOffset = 6, className, ...props }: TooltipProps) {
  return (
    <RTooltip.Provider delayDuration={delayDuration} skipDelayDuration={300}>
      <RTooltip.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
        <RTooltip.Portal>
          <RTooltip.Content side={side} sideOffset={sideOffset} collisionPadding={8} className={cn('motion-tooltip z-[1000] select-none', className)} {...props}>
            {/* Radix renders the accessible role="tooltip" copy itself; the visible bubble is presentational. */}
            <TooltipBubble role="none" shortcut={shortcut}>{content}</TooltipBubble>
          </RTooltip.Content>
        </RTooltip.Portal>
      </RTooltip.Root>
    </RTooltip.Provider>
  );
}
