import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Icon } from '../icons/Icon';
import { RichTextView } from './RichText';
import type { RichText as RichTextValue } from './types';

export interface ImageBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  src?: string;
  alt?: string;
  caption?: RichTextValue;
  /** Rendered width in px (defaults to the full column). */
  width?: number;
  /** Replace the caption (editor). */
  captionSlot?: ReactNode;
  /** Shown when there is no `src` ("Add an image"). */
  onPlaceholderClick?: () => void;
}

/**
 * Image block (not in the captures; inferred defaults): centered image, radius 4, caption 14/1.4
 * text-secondary with padding 6 2. Empty state: gray-bg-primary-translucent row "Add an image".
 */
export const ImageBlock = forwardRef<HTMLDivElement, ImageBlockProps>(function ImageBlock(
  { src, alt = '', caption, width, captionSlot, onPlaceholderClick, className, ...props }, ref,
) {
  return (
    <div ref={ref} className={cn('w-full px-0.5 py-1', className)} {...props}>
      {src ? (
        <figure className="m-0 flex flex-col items-center" contentEditable={false}>
          <img src={src} alt={alt} className="block max-w-full rounded-n-sm object-cover" style={{ width: width ?? '100%' }} />
        </figure>
      ) : (
        <button
          type="button"
          contentEditable={false}
          onClick={onPlaceholderClick}
          className="mx-1.5 flex w-[calc(100%-12px)] cursor-pointer items-center gap-2.5 rounded-n-sm bg-n-gray-bg-primary-translucent-a px-3 py-3 text-[14px] leading-5 text-n-text-secondary hover:bg-n-bg-interactive-translucent-a"
        >
          <Icon name="photo" size={22} className="text-n-icon-secondary" />
          Add an image
        </button>
      )}
      {(captionSlot || (caption && caption.length > 0)) && (
        <figcaption className="px-0.5 py-1.5 text-[14px] leading-[1.4] text-n-text-secondary">{captionSlot ?? <RichTextView value={caption} />}</figcaption>
      )}
    </div>
  );
});
