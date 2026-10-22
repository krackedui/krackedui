import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { Icon } from '../icons/Icon';

/**
 * The ▸ triangle of toggle blocks / toggle headings / sidebar tree (capture/states/toggle-open).
 * Measured: 24x24 button, radius 4, hover button-hover-bg-a (background 20ms ease-in);
 * `arrowCaretDownFillSmall` at 13px, rotated -90deg when closed, 0 when open (transform 200ms ease-out).
 * `size="sm"` (20px box, 12px glyph) is the compact sidebar variant.
 */
export interface DisclosureToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onToggle'> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: 'sm' | 'md';
}

export const DisclosureToggle = forwardRef<HTMLButtonElement, DisclosureToggleProps>(function DisclosureToggle(
  { open = false, onOpenChange, size = 'md', className, onClick, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={open ? 'Close' : 'Open'}
      aria-expanded={open}
      className={cn(
        'inline-flex shrink-0 cursor-pointer select-none items-center justify-center rounded-n-sm text-n-text-primary outline-none focus-visible:shadow-n-focus-shadow pointer-coarse:min-h-6 pointer-coarse:min-w-6',
        'transition-[background] duration-[20ms] ease-in hover:bg-n-button-hover-bg-a active:bg-n-button-pressed-bg-a',
        size === 'sm' ? 'size-5' : 'size-6',
        className,
      )}
      onClick={(e) => { onClick?.(e); if (!e.defaultPrevented) onOpenChange?.(!open); }}
      {...props}
    >
      <Icon
        name="arrowCaretDownFillSmall"
        size={size === 'sm' ? 12 : 13}
        className="transition-transform duration-200 ease-out"
        style={{ transform: open ? 'none' : 'rotate(-90deg)' }}
      />
    </button>
  );
});
