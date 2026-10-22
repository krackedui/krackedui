import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { tv } from '../lib/tv';

/**
 * Loading placeholder shaped like the content it stands in for: a quiet grey block (or N text lines)
 * that pulses gently, and holds still under reduced motion. Decorative: mark the loading region with
 * `aria-busy` and keep a text status for screen readers.
 */
export const skeletonVariants = tv({
  base: 'block animate-pulse bg-n-bg-tertiary-translucent-a motion-reduce:animate-none',
  variants: {
    radius: { sm: 'rounded-n-sm', md: 'rounded-n-md', lg: 'rounded-n-lg', full: 'rounded-full' },
  },
  defaultVariants: { radius: 'sm' },
});

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Width (number = px). Defaults to the full width. */
  width?: number | string;
  /** Height (number = px). Defaults to one 14px text line (20px for blocks without `lines`). */
  height?: number | string;
  radius?: 'sm' | 'md' | 'lg' | 'full';
  /** Render N text lines instead of one block; the last line is shorter. */
  lines?: number;
}

const px = (v: number | string | undefined) => (typeof v === 'number' ? `${v}px` : v);

/** Grey placeholder block or text lines, shown while content loads. */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { width, height, radius, lines, className, style, ...props },
  ref,
) {
  if (lines && lines > 0) {
    return (
      <div ref={ref} aria-hidden className={cn('flex flex-col gap-2', className)} style={{ width: px(width), ...style }} {...props}>
        {Array.from({ length: lines }, (_, i) => (
          <span
            key={i}
            className={skeletonVariants({ radius })}
            style={{ height: px(height) ?? '0.75rem', width: i === lines - 1 && lines > 1 ? '60%' : '100%' }}
          />
        ))}
      </div>
    );
  }
  const box: CSSProperties = { width: px(width) ?? '100%', height: px(height) ?? '1.25rem', ...style };
  return <div ref={ref} aria-hidden className={skeletonVariants({ radius, className })} style={box} {...props} />;
});
