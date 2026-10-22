import type { SVGProps } from 'react';
import { iconPaths, type IconName } from './paths';

export type { IconName };
export const iconNames = Object.keys(iconPaths) as IconName[];

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  /** Icon name: a portable name (`plus`, `close`, `chevronDown`, `search`…) or a Motion extra (`dragHandle`, `viewBoard`…). */
  name: IconName;
  /** Rendered size in px. Defaults to the icon's default size (20, or 16 for small variants). */
  size?: number;
  /** Accessible name. With it the icon is announced as an image; without it the icon is decorative (hidden). */
  label?: string;
}

/**
 * Named UI icon (Lucide drawings, ISC), colored by `currentColor`. Use names, never inline SVG, so every
 * icon matches the set. Give a `label` only when the icon carries meaning on its own.
 */
export function Icon({ name, size, label, style, ...props }: IconProps) {
  const icon = iconPaths[name];
  const px = size ?? icon.size;
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const };
  return (
    <svg
      {...a11y}
      viewBox={icon.viewBox}
      width={px}
      height={px}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      style={{ flexShrink: 0, display: 'block', ...style }}
      dangerouslySetInnerHTML={{ __html: icon.svg }}
      {...props}
    />
  );
}
