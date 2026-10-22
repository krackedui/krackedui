import { Children, forwardRef, isValidElement, cloneElement, type HTMLAttributes, type ReactElement } from 'react';
import { cn } from '../lib/cn';

/** Named sizes (xs 16, sm 20, md 24, lg 28, xl 32) or the same values in px. */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 16 | 20 | 24 | 28 | 32;
type AvatarPx = 16 | 20 | 24 | 28 | 32;
const PX: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', AvatarPx> = { xs: 16, sm: 20, md: 24, lg: 28, xl: 32 };
const toPx = (size: AvatarSize): AvatarPx => (typeof size === 'number' ? size : PX[size]);

/**
 * Avatar. Two shapes:
 * - `workspace` (default; sidebar switcher / workspace-menu "A"): rounded square, radius 4 at 20px
 *   (3.5 in the sidebar), bg-tertiary-translucent-a, text-secondary, letter at 0.6875 × size, uppercase.
 * - `user` (share-menu member row "A", 32px): circle, bg-primary with a 1px border-primary ring,
 *   letter in text-secondary (AA contrast) at 14px (≈0.44 × size); two initials at 0.4 × size, at least 10px.
 * Images fill the same shape (object-cover).
 */
const RADIUS: Record<AvatarPx, string> = { 16: 'rounded-n-xs', 20: 'rounded-n-sm', 24: 'rounded-n-sm', 28: 'rounded-n-md', 32: 'rounded-n-md' };

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Used for the initial and the accessible label. */
  name?: string;
  src?: string;
  size?: AvatarSize;
  shape?: 'workspace' | 'user';
}

/**
 * Fallback text: first + last initial ("Priya Shah" → "PS") from 24px up, so people with the same first
 * initial stay distinguishable; one letter on the 16/20px avatars and for single-word names.
 */
function initials(name: string, size: number = 24): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  const first = Array.from(words[0])[0] ?? '';
  const last = words.length > 1 && size >= 24 ? Array.from(words[words.length - 1])[0] ?? '' : '';
  return (first + last).toUpperCase();
}

/** Person or workspace picture with an initial fallback. Pass `name` for the accessible label. */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { name = '', src, size: sizeProp = 'sm', shape = 'workspace', className, style, ...props },
  ref,
) {
  const size = toPx(sizeProp);
  const user = shape === 'user';
  const letter = initials(name, size);
  return (
    <span
      ref={ref}
      {...(name ? { role: 'img', 'aria-label': name } : { 'aria-hidden': true })}
      className={cn(
        'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden uppercase',
        user ? 'rounded-full bg-n-bg-primary text-n-text-secondary shadow-[inset_0_0_0_1px_var(--n-border-primary)]' : cn(RADIUS[size], 'bg-n-bg-tertiary-translucent-a text-n-text-secondary'),
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: letter.length > 1 ? Math.max(10, Math.round(size * (user ? 0.4 : 0.4375))) : user ? Math.max(9, Math.round(size * 0.4375)) : size * 0.6875,
        lineHeight: 1,
        ...style,
      }}
      {...props}
    >
      {src ? <img src={src} alt="" className="size-full object-cover" draggable={false} /> : letter}
    </span>
  );
});

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Max avatars before collapsing the rest into a "+N" chip. */
  max?: number;
  size?: AvatarSize;
}

/** Overlapping facepile (topbar/collaborator lists): each avatar ringed by bg-primary and overlapped by ~30%. */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup({ max = 4, size: sizeProp = 'md', className, children, ...props }, ref) {
  const size = toPx(sizeProp);
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<AvatarProps>[];
  const shown = items.slice(0, max);
  const rest = items.length - shown.length;
  const overlap = -Math.round(size * 0.3);
  const ring = 'ring-2 ring-n-bg-primary'; // ring composes with the user avatar's inset border shadow
  return (
    <div ref={ref} role="group" className={cn('flex items-center', className)} {...props}>
      {shown.map((el, i) =>
        cloneElement(el, {
          key: i,
          size,
          shape: el.props.shape ?? 'user',
          className: cn(el.props.className, ring),
          style: { marginLeft: i ? overlap : 0, zIndex: shown.length - i, ...el.props.style },
        }),
      )}
      {rest > 0 && (
        <span
          role="img"
          aria-label={`${rest} more`}
          className={cn('relative inline-flex shrink-0 items-center justify-center rounded-full bg-n-bg-tertiary text-n-text-secondary', ring)}
          style={{ width: size, height: size, marginLeft: overlap, fontSize: Math.max(9, Math.round(size * 0.42)) }}
        >
          +{rest}
        </span>
      )}
    </div>
  );
});
