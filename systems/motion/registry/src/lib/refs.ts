import type { Ref, RefCallback } from 'react';

/** One ref callback that forwards the node to several refs (a forwarded ref plus an internal one). */
export function composeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    }
  };
}
