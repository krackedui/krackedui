import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { PageIcon } from '../atoms/PageIcon';
import { leafBase, renderLeaf, type TextContentProps } from './parts';

export interface PageTitleProps extends TextContentProps, Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Emoji page icon shown above the title (78px). */
  icon?: string;
}

/**
 * Page title. Measured (page-content): 40/48 weight 700, padding-inline 8, text-primary,
 * placeholder "New page"; then 8px below it (the content column adds its own 8px top padding).
 */
export const PageTitle = forwardRef<HTMLDivElement, PageTitleProps>(function PageTitle({ icon, text, renderLeaf: rl, className, ...props }, ref) {
  return (
    <div ref={ref} className={cn('w-full pb-2', className)} {...props}>
      {icon && (
        <div className="mb-1 ms-1.5" contentEditable={false}>
          <PageIcon emoji={icon} size={78} aria-hidden />
        </div>
      )}
      <div role="heading" aria-level={1} className="break-words text-[32px] font-bold leading-[38.4px] text-n-text-primary sm:text-[40px] sm:leading-[48px]">
        {renderLeaf({ text, renderLeaf: rl }, { className: cn(leafBase, 'm-0 px-2 text-[1em] font-[inherit]'), placeholder: 'New page' })}
      </div>
    </div>
  );
});
