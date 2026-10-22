import { createTV } from 'tailwind-variants';
import { twMergeConfig } from './merge-config';

/** tailwind-variants preconfigured for this system (twMerge on, with Motion's utilities registered). */
export const tv = createTV({ twMerge: true, twMergeConfig });
export type { VariantProps } from 'tailwind-variants';
