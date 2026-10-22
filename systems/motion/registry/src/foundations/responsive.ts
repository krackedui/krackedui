// Responsive props for the layout primitives (Stack, Grid). Every class is written out literally so
// Tailwind's scanner compiles it into the precompiled styles.css. Breakpoints: sm 640, md 768, lg 1024, xl 1280.

export const breakpoints = ['base', 'sm', 'md', 'lg', 'xl'] as const;
export type Breakpoint = (typeof breakpoints)[number];

/** A value, or one value per breakpoint (mobile first): `{ base: 'column', md: 'row' }`. */
export type Responsive<T> = T | Partial<Record<Breakpoint, T>>;

/** The spacing scale for gaps, in 4px steps (`4` = 16px). */
export type Space = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
export type StackDirection = 'row' | 'column';
export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 12;

export const GAP = {
  base: { 0: 'gap-0', 1: 'gap-1', 2: 'gap-2', 3: 'gap-3', 4: 'gap-4', 5: 'gap-5', 6: 'gap-6', 8: 'gap-8', 10: 'gap-10', 12: 'gap-12', 16: 'gap-16' },
  sm: { 0: 'sm:gap-0', 1: 'sm:gap-1', 2: 'sm:gap-2', 3: 'sm:gap-3', 4: 'sm:gap-4', 5: 'sm:gap-5', 6: 'sm:gap-6', 8: 'sm:gap-8', 10: 'sm:gap-10', 12: 'sm:gap-12', 16: 'sm:gap-16' },
  md: { 0: 'md:gap-0', 1: 'md:gap-1', 2: 'md:gap-2', 3: 'md:gap-3', 4: 'md:gap-4', 5: 'md:gap-5', 6: 'md:gap-6', 8: 'md:gap-8', 10: 'md:gap-10', 12: 'md:gap-12', 16: 'md:gap-16' },
  lg: { 0: 'lg:gap-0', 1: 'lg:gap-1', 2: 'lg:gap-2', 3: 'lg:gap-3', 4: 'lg:gap-4', 5: 'lg:gap-5', 6: 'lg:gap-6', 8: 'lg:gap-8', 10: 'lg:gap-10', 12: 'lg:gap-12', 16: 'lg:gap-16' },
  xl: { 0: 'xl:gap-0', 1: 'xl:gap-1', 2: 'xl:gap-2', 3: 'xl:gap-3', 4: 'xl:gap-4', 5: 'xl:gap-5', 6: 'xl:gap-6', 8: 'xl:gap-8', 10: 'xl:gap-10', 12: 'xl:gap-12', 16: 'xl:gap-16' },
} as const satisfies Record<Breakpoint, Record<string, string>>;
export const DIRECTION = {
  base: { row: 'flex-row', column: 'flex-col' },
  sm: { row: 'sm:flex-row', column: 'sm:flex-col' },
  md: { row: 'md:flex-row', column: 'md:flex-col' },
  lg: { row: 'lg:flex-row', column: 'lg:flex-col' },
  xl: { row: 'xl:flex-row', column: 'xl:flex-col' },
} as const satisfies Record<Breakpoint, Record<string, string>>;
export const COLUMNS = {
  base: { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6', 12: 'grid-cols-12' },
  sm: { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4', 5: 'sm:grid-cols-5', 6: 'sm:grid-cols-6', 12: 'sm:grid-cols-12' },
  md: { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4', 5: 'md:grid-cols-5', 6: 'md:grid-cols-6', 12: 'md:grid-cols-12' },
  lg: { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6', 12: 'lg:grid-cols-12' },
  xl: { 1: 'xl:grid-cols-1', 2: 'xl:grid-cols-2', 3: 'xl:grid-cols-3', 4: 'xl:grid-cols-4', 5: 'xl:grid-cols-5', 6: 'xl:grid-cols-6', 12: 'xl:grid-cols-12' },
} as const satisfies Record<Breakpoint, Record<string, string>>;

function isPerBreakpoint<T>(value: Responsive<T>): value is Partial<Record<Breakpoint, T>> {
  return typeof value === 'object' && value !== null;
}

/** Map a responsive value to its classes through a per-breakpoint table. */
export function responsiveClasses<T extends string | number>(
  value: Responsive<T> | undefined,
  table: Record<Breakpoint, Record<T, string>>,
): string[] {
  if (value === undefined) return [];
  if (!isPerBreakpoint(value)) return [table.base[value]];
  return breakpoints.flatMap((bp) => {
    const v = value[bp];
    return v === undefined ? [] : [table[bp][v]];
  });
}
