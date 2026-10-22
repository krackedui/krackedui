import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type HTMLAttributes } from 'react';
import { Dialog as D } from 'radix-ui';
import { cn } from '../lib/cn';
import { useEscapeFallback } from '../lib/escapeFallback';
import { tv, type VariantProps } from '../lib/tv';
import { Icon } from '../icons/Icon';
import { dialogVariants } from './Dialog';
import { ThemePortal } from '../foundations/ThemePortal';

/**
 * Sheet: a modal panel that slides in from the left, right or bottom edge. Same surface as dialogs
 * (bg-elevated, modal shadow), square on the attached edge, radius 12 on the free corners of a bottom
 * sheet. Widths sm 320 / md 400 / lg 560 px for side sheets (full width under 640 px); heights
 * sm 40% / md 60% / lg 90% of the viewport for bottom sheets.
 */
export const sheetVariants = tv({
  slots: {
    content: [
      'motion-portal motion-sheet fixed z-50 flex flex-col bg-n-bg-elevated outline-none',
      // token-exempt: modal shadow has no token (same measured values as dialogVariants)
      'shadow-[0_24px_48px_rgba(25,25,25,.24),0_4px_12px_rgba(25,25,25,.14),0_0_0_1px_var(--n-bg-tertiary-translucent-a)]',
      // token-exempt: dark modal shadow and ring (measured), no token
      'dark:shadow-[0_0_0_1px_#383836,0_24px_48px_rgba(25,25,25,.64),0_4px_12px_rgba(25,25,25,.56)]',
    ],
    body: 'flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-5',
    close: [
      'absolute right-3 top-3 flex size-7 cursor-pointer items-center justify-center rounded-n-md text-n-icon-secondary outline-none',
      'hover:bg-n-button-hover-bg-a focus-visible:shadow-n-focus-shadow pointer-coarse:size-9',
    ],
    title: 'pr-8 text-[16px] font-semibold leading-[1.3] text-n-text-primary',
    description: 'text-[14px] leading-5 text-n-text-secondary',
    footer: [
      'sticky bottom-0 -mx-5 -mb-5 mt-auto flex flex-col-reverse gap-2 bg-n-bg-elevated px-5 py-3',
      'shadow-[inset_0_1px_0_var(--n-bg-tertiary-translucent-a)] sm:flex-row sm:items-center sm:justify-end',
    ],
  },
  variants: {
    side: {
      right: { content: 'inset-y-0 right-0 h-dvh w-full max-w-full' },
      left: { content: 'inset-y-0 left-0 h-dvh w-full max-w-full' },
      bottom: { content: 'inset-x-0 bottom-0 max-h-[calc(100dvh-32px)] w-full rounded-t-n-2xl' },
    },
    size: { sm: {}, md: {}, lg: {} },
  },
  compoundVariants: [
    { side: ['left', 'right'], size: 'sm', class: { content: 'sm:w-[320px]' } },
    { side: ['left', 'right'], size: 'md', class: { content: 'sm:w-[400px]' } },
    { side: ['left', 'right'], size: 'lg', class: { content: 'sm:w-[560px]' } },
    { side: 'bottom', size: 'sm', class: { content: 'h-[40dvh]' } },
    { side: 'bottom', size: 'md', class: { content: 'h-[60dvh]' } },
    { side: 'bottom', size: 'lg', class: { content: 'h-[90dvh]' } },
  ],
  defaultVariants: { side: 'right', size: 'md' },
});

export type SheetContentProps = ComponentPropsWithoutRef<typeof D.Content> & VariantProps<typeof sheetVariants> & {
  /** Show the close button in the top-right corner (default true). */
  showClose?: boolean;
  /** Accessible name of the close button (default "Close"). */
  closeLabel?: string;
};

const Content = forwardRef<ElementRef<typeof D.Content>, SheetContentProps>(function Content(
  { side = 'right', size = 'md', showClose = true, closeLabel = 'Close', className, children, onKeyDown, onEscapeKeyDown, ...props }, ref,
) {
  const s = sheetVariants({ side, size });
  const escape = useEscapeFallback(onEscapeKeyDown);
  return (
    <ThemePortal primitive={D.Portal}>
      <D.Overlay className={cn('motion-overlay', dialogVariants().overlay())} />
      <D.Content
        ref={ref}
        aria-modal="true"
        data-side={side}
        className={cn(s.content(), className)}
        onEscapeKeyDown={onEscapeKeyDown}
        onKeyDown={(e) => { onKeyDown?.(e); escape.onKeyDown(e); }}
        {...props}
      >
        <D.Close ref={escape.closeRef} hidden tabIndex={-1} aria-hidden />
        <div className={s.body()}>{children}</div>
        {showClose && (
          <D.Close aria-label={closeLabel} className={s.close()}>
            <Icon name="close" size={18} />
          </D.Close>
        )}
      </D.Content>
    </ThemePortal>
  );
});

const st = sheetVariants();
const Title = forwardRef<ElementRef<typeof D.Title>, ComponentPropsWithoutRef<typeof D.Title>>(function Title({ className, ...p }, ref) {
  return <D.Title ref={ref} className={cn(st.title(), className)} {...p} />;
});
const Description = forwardRef<ElementRef<typeof D.Description>, ComponentPropsWithoutRef<typeof D.Description>>(function Description({ className, ...p }, ref) {
  return <D.Description ref={ref} className={cn(st.description(), className)} {...p} />;
});
/** Action row pinned to the bottom of the sheet while its body scrolls. */
const Footer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Footer({ className, ...p }, ref) {
  return <div ref={ref} className={cn(st.footer(), className)} {...p} />;
});

/**
 * Panel that slides in from an edge (WAI-ARIA dialog-modal): filters, details, settings and mobile navigation.
 * Traps focus, closes on Escape, the close button or an overlay click, returns focus to the trigger, and fills
 * the width on phones. Every sheet needs a `Sheet.Title`. Use Dialog for short centered tasks.
 *
 * <Sheet.Root><Sheet.Trigger asChild><Button>Filters</Button></Sheet.Trigger>
 *   <Sheet.Content side="right"><Sheet.Title>Filters</Sheet.Title>…<Sheet.Footer>…</Sheet.Footer></Sheet.Content></Sheet.Root>
 */
export const Sheet = { Root: D.Root, Trigger: D.Trigger, Close: D.Close, Content, Title, Description, Footer };
