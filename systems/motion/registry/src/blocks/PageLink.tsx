import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { PageIcon } from '../atoms/PageIcon';
import { leafBase, renderLeaf, type TextContentProps } from './parts';

export interface PageLinkProps extends TextContentProps, Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Emoji icon; default page glyph. */
  icon?: string;
  href?: string;
  /** True for a page without content (pageEmpty glyph). */
  empty?: boolean;
}

/**
 * Sub-page / link-to-page block (not in the sandbox captures; inferred defaults): row padding 3 2,
 * hover bg-interactive, 22px icon box + 4px gap, title 16/1.3 weight 500 underlined by a 1px
 * border-primary-translucent-a bottom border.
 */
export const PageLink = forwardRef<HTMLDivElement, PageLinkProps>(function PageLink({ icon, href, empty, text, renderLeaf: rl, className, ...props }, ref) {
  return (
    <div ref={ref} className={cn('w-full px-0.5 py-px', className)} {...props}>
      <a href={href} className="flex cursor-pointer select-none items-center rounded-n-sm px-0.5 py-[3px] text-inherit no-underline transition-[background] duration-[20ms] ease-in hover:bg-n-bg-interactive-translucent-a">
        <span className="me-1 flex h-6 w-[22px] shrink-0 items-center justify-center" contentEditable={false}>
          <PageIcon emoji={icon} size={22} empty={empty} className="text-n-icon-secondary" aria-hidden />
        </span>
        <span className="min-w-0 flex-1 truncate">
          {renderLeaf({ text, renderLeaf: rl }, {
            className: cn(leafBase, 'inline w-auto border-b border-n-border-primary-translucent-a font-medium leading-[1.3]'),
            placeholder: 'Untitled',
          })}
        </span>
      </a>
    </div>
  );
});
