import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { mergeIntoChild } from '../lib/slot';

type Space = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
type Responsive<T> = T | { base?: T; sm?: T; md?: T; lg?: T; xl?: T };
type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl';
const BREAKPOINTS: Breakpoint[] = ['base', 'sm', 'md', 'lg', 'xl'];

/**
 * Turns a responsive prop into custom properties the stylesheet reads at each breakpoint
 * (`--bay-gap-md` and so on). Doing it in CSS keeps the markup identical on server and client.
 */
function responsiveVars(name: string, value: Responsive<string | number> | undefined): CSSProperties {
  if (value == null) return {};
  if (typeof value !== 'object') return { [`--bay-${name}-base`]: String(value) } as CSSProperties;
  const out: Record<string, string> = {};
  for (const bp of BREAKPOINTS) {
    const v = value[bp];
    if (v != null) out[`--bay-${name}-${bp}`] = String(v);
  }
  return out as CSSProperties;
}

const space = (v: Responsive<Space> | undefined): Responsive<string> | undefined => {
  if (v == null) return undefined;
  if (typeof v !== 'object') return `${v * 4}px`;
  const out: Record<string, string> = {};
  for (const bp of BREAKPOINTS) if (v[bp] != null) out[bp] = `${(v[bp] as number) * 4}px`;
  return out as Responsive<string>;
};

export interface StackProps extends Omit<HTMLAttributes<HTMLDivElement>, 'dir'> {
  children?: ReactNode;
  direction?: Responsive<'row' | 'column'>;
  gap?: Responsive<Space>;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between';
  wrap?: boolean;
  /** Render the child element instead of a div, keeping these styles. */
  asChild?: boolean;
}

/** A flex row or column with token-sized gaps. Direction and gap can change per breakpoint. */
export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  { children, direction = 'column', gap = 0, align, justify, wrap, asChild, className, style, ...rest },
  ref,
) {
  const props = {
    className: cn('bay-stack', className),
    'data-align': align,
    'data-justify': justify,
    'data-wrap': wrap ? '' : undefined,
    style: { ...responsiveVars('dir', direction), ...responsiveVars('gap', space(gap)), ...style },
    ...rest,
  };
  if (asChild) return mergeIntoChild(children, props);
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  columns?: Responsive<1 | 2 | 3 | 4 | 5 | 6 | 12>;
  gap?: Responsive<Space>;
  /** Render the child element instead of a div, keeping these styles. */
  asChild?: boolean;
}

/** A column grid with token-sized gaps. Columns can change per breakpoint. */
export const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid(
  { children, columns = 1, gap = 0, asChild, className, style, ...rest },
  ref,
) {
  const props = {
    className: cn('bay-grid', className),
    style: { ...responsiveVars('cols', columns), ...responsiveVars('gap', space(gap)), ...style },
    ...rest,
  };
  if (asChild) return mergeIntoChild(children, props);
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

/** A hairline separator. Vertical dividers stretch to the height of their row. */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  { orientation = 'horizontal', className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      className={cn('bay-divider', className)}
      data-orientation={orientation}
      {...rest}
    />
  );
});
