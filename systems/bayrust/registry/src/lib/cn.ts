/** Joins class names, dropping anything falsy. The last word wins, as `className` should. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Builds a class-name function for a component: a base class, and one class per variant value.
 * Returned as `xVariants` per SPEC §3.2, so a consumer can style against the same classes.
 */
export function variants<V extends Record<string, Record<string, string>>>(base: string, map: V) {
  type Props = { [K in keyof V]?: keyof V[K] } & { className?: string };
  return (props: Props = {} as Props): string => {
    const out = [base];
    for (const key of Object.keys(map) as (keyof V)[]) {
      const chosen = props[key];
      if (chosen != null) {
        const cls = map[key][chosen as string];
        if (cls) out.push(cls);
      }
    }
    if (props.className) out.push(props.className);
    return out.join(' ');
  };
}
