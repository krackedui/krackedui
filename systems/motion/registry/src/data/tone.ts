// Contract tone → Motion palette color (systems/motion/AGENTS.md). Warning uses orange for fills and icons:
// Motion's yellow accent is too light against white to read as a graphic (WCAG 1.4.11).
export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export const toneColor = {
  neutral: 'gray',
  accent: 'blue',
  success: 'green',
  warning: 'orange',
  danger: 'red',
  info: 'blue',
} as const satisfies Record<Tone, string>;

/**
 * Text color class per contract tone, AA (4.5:1) on every Motion surface in both themes: use it for money and
 * status text ("+$1,240", "Overdue"). `neutral` is secondary text; `accent` and `info` share the blue.
 * `<span className={toneText.success}>+$1,240.00</span>`
 */
export const toneText = {
  neutral: 'text-n-text-secondary',
  accent: 'text-n-text-info',
  success: 'text-n-text-success',
  warning: 'text-n-text-warning',
  danger: 'text-n-text-danger',
  info: 'text-n-text-info',
} as const satisfies Record<Tone, string>;
