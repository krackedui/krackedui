import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { Icon, type IconName } from '../icons/Icon';

export type PageIconSize = 16 | 18 | 20 | 22 | 24 | 78;

/**
 * A page's record icon (`.motion-record-icon`). Measured:
 * - sidebar row: 20px box, radius 3.5, default `page` glyph 18px in sidebar-secondary-color
 * - db-table title cell: 22px box, `pageEmpty` glyph 18px
 * - callout: 24px box, radius 4, emoji at 0.9 × box (21.6px)
 * - page title: 78px box (emoji at 78px, line-height 1.1), not in the captured page (it has no icon)
 * Pass `emoji`, an `icon` name, or an image `src`; with none, the default page glyph is shown
 * (`empty` → `pageEmpty`, used for pages without content).
 */
export interface PageIconProps extends HTMLAttributes<HTMLSpanElement> {
  emoji?: string;
  icon?: IconName;
  src?: string;
  size?: PageIconSize;
  empty?: boolean;
  /** Hover background like the clickable icon in a page title / table cell. */
  interactive?: boolean;
}

export const PageIcon = forwardRef<HTMLSpanElement, PageIconProps>(function PageIcon(
  { emoji, icon, src, size = 20, empty, interactive, className, style, ...props },
  ref,
) {
  const big = size >= 64;
  const glyph = big ? Math.round(size * 0.9) : Math.min(size - 2, 18);
  const radius = big ? 'rounded-n-sm' : size >= 24 ? 'rounded-n-sm' : 'rounded-[3.5px]'; // 3.5px: measured, no token
  return (
    <span
      ref={ref}
      {...(props['aria-label'] ? { role: 'img' } : { 'aria-hidden': true })}
      className={cn(
        'motion-record-icon inline-flex shrink-0 select-none items-center justify-center overflow-hidden text-n-sidebar-secondary-color',
        radius,
        interactive && 'cursor-pointer transition-[background] duration-[20ms] ease-in hover:bg-n-button-hover-bg-a',
        className,
      )}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      {emoji ? (
        <span className="font-[Apple_Color_Emoji,Segoe_UI_Emoji,sans-serif] text-n-primary-black" style={{ fontSize: big ? size : size * 0.9, lineHeight: 1.1 }}>
          {emoji}
        </span>
      ) : src ? (
        <img src={src} alt="" className={cn('object-cover', radius)} style={{ width: glyph, height: glyph }} draggable={false} />
      ) : (
        <Icon name={icon ?? (empty ? 'pageEmpty' : 'page')} size={glyph} />
      )}
    </span>
  );
});
