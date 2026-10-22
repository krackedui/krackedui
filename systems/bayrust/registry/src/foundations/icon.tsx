import { forwardRef, type SVGProps } from 'react';
import { cn } from '../lib/cn';
import { iconPaths, type IconName } from './icon-paths';

export type { IconName };
export { iconPaths };

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  /** Accessible name. Without it the icon is decorative and hidden from assistive tech. */
  label?: string;
}

/**
 * A named interface icon. Decorative by default; give it `label` when it is the only thing
 * carrying meaning, as in an icon-only control.
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, size = 16, label, className, ...rest },
  ref,
) {
  return (
    <svg
      ref={ref}
      className={cn('bay-icon', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...rest}
    >
      <path d={iconPaths[name]} />
    </svg>
  );
});
