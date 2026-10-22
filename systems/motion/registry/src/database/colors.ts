import type { OptionColor } from './types';

/**
 * Class sets per option color, read from db-table / db-board / db-list captures:
 * - tag:   bg `<c>-bg-tertiary-translucent-a`, text `<c>-text-primary` (default: bg-tertiary-translucent-a, inherited text)
 * - dot:   status dot 8px, `<c>-text-accent-primary` (gray/default: gray-text-accent-primary)
 * - group: board column bg `<c>-bg-primary-translucent-a`; count + "New page" text `<c>-text-primary` (default/gray:
 *          text-accent-primary). The capture uses `<c>-text-accent-primary`, which is 3.0–4.3:1 on the tint; the
 *          tag text color keeps WCAG AA (7:1+) in both themes.
 * - card:  board card bg `<c>-bg-elevated` + 1px ring `<c>-border-secondary-translucent-a` (dark mode tints cards)
 * Literal strings so Tailwind can see every class.
 */
export interface OptionColorClasses { tag: string; dot: string; group: string; accent: string; card: string; label: string }

export const optionColors: Record<OptionColor, OptionColorClasses> = {
  default: {
    tag: 'bg-n-bg-tertiary-translucent-a text-n-text-primary',
    dot: 'bg-n-gray-text-accent-primary',
    group: 'bg-n-gray-bg-primary-translucent-a',
    accent: 'text-n-text-accent-primary',
    card: 'bg-n-bg-elevated shadow-[var(--n-shadow-base-sm),0_0_0_1px_var(--n-border-secondary-translucent-a)]',
    label: 'Default',
  },
  gray: {
    tag: 'bg-n-gray-bg-tertiary-translucent-a text-n-gray-text-primary',
    dot: 'bg-n-gray-text-accent-primary',
    group: 'bg-n-gray-bg-primary-translucent-a',
    accent: 'text-n-text-accent-primary',
    card: 'bg-n-bg-elevated shadow-[var(--n-shadow-base-sm),0_0_0_1px_var(--n-border-secondary-translucent-a)]',
    label: 'Gray',
  },
  brown: {
    tag: 'bg-n-brown-bg-tertiary-translucent-a text-n-brown-text-primary',
    dot: 'bg-n-brown-text-accent-primary',
    group: 'bg-n-brown-bg-primary-translucent-a',
    accent: 'text-n-brown-text-primary',
    card: 'bg-n-brown-bg-elevated shadow-[var(--n-shadow-base-sm),0_0_0_1px_var(--n-brown-border-secondary-translucent-a)]',
    label: 'Brown',
  },
  orange: {
    tag: 'bg-n-orange-bg-tertiary-translucent-a text-n-orange-text-primary',
    dot: 'bg-n-orange-text-accent-primary',
    group: 'bg-n-orange-bg-primary-translucent-a',
    accent: 'text-n-orange-text-primary',
    card: 'bg-n-orange-bg-elevated shadow-[var(--n-shadow-base-sm),0_0_0_1px_var(--n-orange-border-secondary-translucent-a)]',
    label: 'Orange',
  },
  yellow: {
    tag: 'bg-n-yellow-bg-tertiary-translucent-a text-n-yellow-text-primary',
    dot: 'bg-n-yellow-text-accent-primary',
    group: 'bg-n-yellow-bg-primary-translucent-a',
    accent: 'text-n-yellow-text-primary',
    card: 'bg-n-yellow-bg-elevated shadow-[var(--n-shadow-base-sm),0_0_0_1px_var(--n-yellow-border-secondary-translucent-a)]',
    label: 'Yellow',
  },
  green: {
    tag: 'bg-n-green-bg-tertiary-translucent-a text-n-green-text-primary',
    dot: 'bg-n-green-text-accent-primary',
    group: 'bg-n-green-bg-primary-translucent-a',
    accent: 'text-n-green-text-primary',
    card: 'bg-n-green-bg-elevated shadow-[var(--n-shadow-base-sm),0_0_0_1px_var(--n-green-border-secondary-translucent-a)]',
    label: 'Green',
  },
  blue: {
    tag: 'bg-n-blue-bg-tertiary-translucent-a text-n-blue-text-primary',
    dot: 'bg-n-blue-text-accent-primary',
    group: 'bg-n-blue-bg-primary-translucent-a',
    accent: 'text-n-blue-text-primary',
    card: 'bg-n-blue-bg-elevated shadow-[var(--n-shadow-base-sm),0_0_0_1px_var(--n-blue-border-secondary-translucent-a)]',
    label: 'Blue',
  },
  purple: {
    tag: 'bg-n-purple-bg-tertiary-translucent-a text-n-purple-text-primary',
    dot: 'bg-n-purple-text-accent-primary',
    group: 'bg-n-purple-bg-primary-translucent-a',
    accent: 'text-n-purple-text-primary',
    card: 'bg-n-purple-bg-elevated shadow-[var(--n-shadow-base-sm),0_0_0_1px_var(--n-purple-border-secondary-translucent-a)]',
    label: 'Purple',
  },
  pink: {
    tag: 'bg-n-pink-bg-tertiary-translucent-a text-n-pink-text-primary',
    dot: 'bg-n-pink-text-accent-primary',
    group: 'bg-n-pink-bg-primary-translucent-a',
    accent: 'text-n-pink-text-primary',
    card: 'bg-n-pink-bg-elevated shadow-[var(--n-shadow-base-sm),0_0_0_1px_var(--n-pink-border-secondary-translucent-a)]',
    label: 'Pink',
  },
  red: {
    tag: 'bg-n-red-bg-tertiary-translucent-a text-n-red-text-primary',
    dot: 'bg-n-red-text-accent-primary',
    group: 'bg-n-red-bg-primary-translucent-a',
    accent: 'text-n-red-text-primary',
    card: 'bg-n-red-bg-elevated shadow-[var(--n-shadow-base-sm),0_0_0_1px_var(--n-red-border-secondary-translucent-a)]',
    label: 'Red',
  },
  teal: {
    tag: 'bg-n-teal-bg-tertiary-translucent-a text-n-teal-text-primary',
    dot: 'bg-n-teal-text-accent-primary',
    group: 'bg-n-teal-bg-primary-translucent-a',
    accent: 'text-n-teal-text-primary',
    card: 'bg-n-teal-bg-elevated shadow-[var(--n-shadow-base-sm),0_0_0_1px_var(--n-teal-border-secondary-translucent-a)]',
    label: 'Teal',
  },
};

export const optionColorNames = Object.keys(optionColors) as OptionColor[];
