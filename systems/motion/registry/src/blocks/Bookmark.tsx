import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { Icon } from '../icons/Icon';

export interface BookmarkProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  url?: string;
  title?: string;
  description?: string;
  /** Preview image on the right. */
  thumbnail?: string;
  favicon?: string;
  onPlaceholderClick?: () => void;
}

/**
 * Web bookmark card (not in the sandbox captures; inferred defaults): 1px border-primary-translucent,
 * radius 10, text column padding 12 14 14 (title 14/20 primary, description 12/16 secondary ×2 lines,
 * url row 12/16 with 16px favicon), thumbnail flex 1 1 180px × 106.
 */
export const Bookmark = forwardRef<HTMLDivElement, BookmarkProps>(function Bookmark(
  { url, title, description, thumbnail, favicon, onPlaceholderClick, className, ...props }, ref,
) {
  if (!url) {
    return (
      <div ref={ref} className={cn('w-full px-0.5 py-1', className)} {...props}>
        <button type="button" contentEditable={false} onClick={onPlaceholderClick}
          className="mx-1.5 flex w-[calc(100%-12px)] cursor-pointer items-center gap-2.5 rounded-n-sm bg-n-gray-bg-primary-translucent-a px-3 py-3 text-[14px] leading-5 text-n-text-secondary hover:bg-n-bg-interactive-translucent-a">
          <Icon name="bookmark" size={22} className="text-n-icon-secondary" />
          Add a web bookmark
        </button>
      </div>
    );
  }
  const host = (() => { try { return new URL(url).hostname; } catch { return url; } })();
  return (
    <div ref={ref} className={cn('w-full px-0.5 py-1', className)} {...props}>
      <a href={url} target="_blank" rel="noopener noreferrer" contentEditable={false}
        className="flex w-full select-none overflow-hidden rounded-n-xl border border-n-border-primary-translucent-a text-start text-inherit no-underline hover:bg-n-bg-interactive-translucent-a">
        <div className="min-w-0 flex-[4_1_180px] overflow-hidden px-3.5 pb-3.5 pt-3 text-start">
          <div className="mb-0.5 min-h-6 truncate text-[14px] leading-5 text-n-text-primary">{title ?? host}</div>
          {description && <div className="line-clamp-2 h-8 overflow-hidden text-[12px] leading-4 text-n-text-secondary">{description}</div>}
          <div className="mt-1.5 flex items-center">
            {favicon ? <img src={favicon} alt="" className="me-1.5 size-4 min-w-4" /> : <Icon name="globe" size={16} className="me-1.5 text-n-icon-secondary" />}
            <div className="truncate text-[12px] leading-4 text-n-text-primary">{url}</div>
          </div>
        </div>
        {thumbnail && (
          <div className="relative hidden flex-[1_1_180px] sm:block">
            <img src={thumbnail} alt="" className="absolute inset-0 block size-full object-cover" />
          </div>
        )}
      </a>
    </div>
  );
});
