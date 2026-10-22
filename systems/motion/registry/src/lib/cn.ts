import { extendTailwindMerge } from 'tailwind-merge';
import { twMergeConfig } from './merge-config';

const merge = extendTailwindMerge(twMergeConfig);

type ClassValue = string | number | null | undefined | false | ClassValue[];

/** Join class names, resolving Tailwind conflicts (later wins), including Motion's own utilities. */
export function cn(...inputs: ClassValue[]): string {
  const flat: string[] = [];
  const walk = (v: ClassValue) => {
    if (!v) return;
    if (Array.isArray(v)) v.forEach(walk);
    else flat.push(String(v));
  };
  inputs.forEach(walk);
  return merge(flat.join(' '));
}
