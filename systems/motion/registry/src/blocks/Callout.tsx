import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import type { BlockColor, RichText as RichTextValue } from './types';
import { textColorClass } from './colors';
import type { ColorName } from './types';
import { TextBlock } from './Text';
import type { LeafRenderer } from './parts';
import { PageIcon } from '../atoms/PageIcon';

/** Callout backgrounds use the lighter `<c>-bg-primary` (default gray = --c-graBacPri, measured). */
export const calloutBgClass: Record<ColorName, string> = {
  gray: 'bg-n-gray-bg-primary', brown: 'bg-n-brown-bg-primary', orange: 'bg-n-orange-bg-primary', yellow: 'bg-n-yellow-bg-primary',
  green: 'bg-n-green-bg-primary', blue: 'bg-n-blue-bg-primary', purple: 'bg-n-purple-bg-primary', pink: 'bg-n-pink-bg-primary', red: 'bg-n-red-bg-primary',
};

export interface CalloutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Emoji icon (default 💡). */
  icon?: ReactNode;
  /** Block color; callouts default to gray background. */
  color?: BlockColor;
  text?: RichTextValue;
  renderLeaf?: LeafRenderer;
  /** Extra blocks inside the callout, under the first line. */
  children?: ReactNode;
  onIconClick?: () => void;
}

/**
 * Callout. Measured (callout / page-scroll-2): block padding 8; box radius 10, 1px transparent border,
 * padding 12, bg gray-bg-primary (default); icon 24×24 button with 21.6px emoji, margin-top 7.5;
 * content column (min-height 32) holds a text block (6px padding).
 */
export const Callout = forwardRef<HTMLDivElement, CalloutProps>(function Callout(
  { icon = '💡', color = 'gray_background', text, renderLeaf, children, onIconClick, className, ...props }, ref,
) {
  const c = color.replace('_background', '') as ColorName | 'default';
  const isBg = color.endsWith('_background');
  return (
    <div ref={ref} className={cn('w-full p-2', className)} {...props}>
      <div role="note" aria-roledescription="callout" className="flex">
        <div
          className={cn(
            'flex w-full rounded-n-xl border border-transparent p-3',
            isBg && c !== 'default' ? calloutBgClass[c] : !isBg ? 'border-n-border-primary' : '',
            !isBg && c !== 'default' && textColorClass[c],
          )}
        >
          <div className="mt-[7.5px]" contentEditable={false}>
            <PageIcon emoji={typeof icon === 'string' ? icon : undefined} size={24} interactive role="button" tabIndex={0} aria-label="Change callout icon" onClick={onIconClick}>
              {typeof icon === 'string' ? null : icon}
            </PageIcon>
          </div>
          <div className="flex min-h-8 w-full min-w-0 flex-col">
            <TextBlock text={text} renderLeaf={renderLeaf} />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
});
