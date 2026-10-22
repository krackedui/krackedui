'use client';

import { Children, forwardRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Icon } from '../foundations/icon';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** First letters of the first and last word: "Ada Lovelace" → "AL". */
function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  const first = words[0][0] ?? '';
  const last = words.length > 1 ? (words[words.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase();
}

/** A stable colour per name, so the same person keeps the same one across sessions and machines. */
function hue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name?: string;
  src?: string;
  size?: AvatarSize;
}

/**
 * A person or workspace. Falls back to initials, and to a neutral glyph when there is no name —
 * so it never renders an empty circle.
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { name, src, size = 'md', className, ...rest },
  ref,
) {
  const [broken, setBroken] = useState(false);
  const text = name ? initials(name) : '';
  const showImage = src && !broken;
  return (
    <span
      ref={ref}
      className={cn('bay-avatar', `bay-avatar--${size}`, className)}
      // a stable hue per name; the lightness and saturation come from the theme
      style={name ? ({ ['--bay-avatar-hue' as string]: String(hue(name)) } as React.CSSProperties) : undefined}
      title={name}
      {...rest}
    >
      {showImage ? (
        <img className="bay-avatar__image" src={src} alt={name ?? ''} onError={() => setBroken(true)} />
      ) : text ? (
        <span className="bay-avatar__initials" aria-hidden={rest['aria-label'] ? undefined : true}>
          {text}
        </span>
      ) : (
        <Icon name="user" size={14} />
      )}
    </span>
  );
});

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  max?: number;
  size?: AvatarSize;
}

/** Overlapping avatars, with the overflow counted rather than hidden. */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { children, max = 4, size = 'md', className, ...rest },
  ref,
) {
  const all = Children.toArray(children);
  const shown = all.slice(0, max);
  const overflow = all.length - shown.length;
  return (
    <div ref={ref} className={cn('bay-avatars', className)} {...rest}>
      {shown}
      {overflow > 0 && (
        <span className={cn('bay-avatar', `bay-avatar--${size}`, 'bay-avatar--overflow')} aria-label={`${overflow} more`}>
          <span className="bay-avatar__initials">+{overflow}</span>
        </span>
      )}
    </div>
  );
});
