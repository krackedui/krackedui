'use client';

import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { cn } from './cn';

/**
 * Renders the caller's own element instead of the component's, merging props onto it. This is what
 * `asChild` does: `<Button asChild><a href="/x">Open</a></Button>` renders one `<a>` that looks like
 * a button, rather than an anchor inside a button.
 *
 * Class names are merged, `style` is merged, and the child's own handlers win — a child that already
 * does something keeps doing it.
 */
export function mergeIntoChild(children: ReactNode, props: Record<string, unknown>): ReactElement {
  const child = Children.only(children) as ReactElement<Record<string, unknown>>;
  if (!isValidElement(child)) {
    throw new Error('asChild expects exactly one React element as its child.');
  }
  const own = child.props;
  const merged: Record<string, unknown> = { ...props, ...own };

  merged.className = cn(props.className as string | undefined, own.className as string | undefined);
  if (props.style || own.style) {
    merged.style = { ...(props.style as object), ...(own.style as object) };
  }
  return cloneElement(child, merged);
}
