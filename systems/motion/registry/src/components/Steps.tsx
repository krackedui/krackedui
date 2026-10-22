import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { tv } from '../lib/tv';
import { Icon } from '../icons/Icon';

/**
 * Steps: progress through a multi-step task (checkout, payment, onboarding). A row of 20px markers joined by
 * hairlines: complete = blue disc with a check, current = blue ring with the number, upcoming = grey ring.
 * Labels are 14/20 (current medium), descriptions 12/16 secondary. Under 640px only the current step keeps its
 * label so three to five steps fit a 320px phone. Measurements follow Checkbox/Radio (16–20px, blue accent)
 * and Tabs (14px medium current label); inferred, no reference capture.
 */
export const stepsVariants = tv({
  slots: {
    root: 'min-w-0',
    list: 'm-0 flex min-w-0 list-none items-start gap-2 p-0',
    item: 'flex min-w-0 items-start gap-2 [&:not(:last-child)]:flex-1',
    step: 'flex min-w-0 items-start gap-2 rounded-n-md text-left outline-none',
    button: 'cursor-pointer hover:bg-n-button-hover-bg-a focus-visible:shadow-n-focus-shadow -m-1 p-1 pointer-coarse:min-h-6',
    marker: [
      'flex size-5 shrink-0 items-center justify-center rounded-full text-[12px] font-medium leading-none tabular-nums',
    ],
    text: 'flex min-w-0 flex-col',
    label: 'truncate text-[14px] leading-5',
    description: 'truncate text-[12px] leading-4 text-n-text-secondary',
    connector: 'mt-2.5 h-px min-w-3 flex-1 bg-n-border-primary',
  },
  variants: {
    status: {
      complete: {
        marker: 'bg-n-blue-icon-accent-primary text-n-text-inverse-primary',
        label: 'text-n-text-primary max-sm:sr-only',
        description: 'max-sm:hidden',
      },
      current: {
        marker: 'text-n-blue-text-primary shadow-[inset_0_0_0_1.5px_var(--n-blue-icon-accent-primary)]',
        label: 'font-medium text-n-text-primary',
      },
      upcoming: {
        marker: 'text-n-text-secondary shadow-[inset_0_0_0_1px_var(--n-border-strong)]',
        label: 'text-n-text-secondary max-sm:sr-only',
        description: 'max-sm:hidden',
      },
    },
  },
});

export interface StepItem {
  label: ReactNode;
  /** Second line under the label (hidden on phones except for the current step). */
  description?: ReactNode;
}

export interface StepsProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  steps: StepItem[];
  /** Index of the current step (0-based). Steps before it are complete; `current === steps.length` = all done. */
  current: number;
  /** Makes completed steps buttons that jump back to them (e.g. "edit the payee"). */
  onStepChange?: (index: number) => void;
  /** Accessible name of the navigation landmark (default "Progress"). */
  label?: string;
}

const statusText = { complete: 'completed', current: 'current step', upcoming: 'not started' } as const;

/**
 * Progress through a multi-step form. Renders an ordered list in a labelled `nav`; the current step has
 * `aria-current="step"` and every marker's state is spelled out for screen readers. Use Tabs for switching
 * between independent panels, and Progress for a single percentage.
 */
export const Steps = forwardRef<HTMLElement, StepsProps>(function Steps(
  { steps, current, onStepChange, label = 'Progress', className, ...props }, ref,
) {
  const s = stepsVariants();
  return (
    <nav ref={ref} aria-label={label} className={s.root({ className })} {...props}>
      <ol className={s.list()}>
        {steps.map((step, i) => {
          const status = i < current ? 'complete' : i === current ? 'current' : 'upcoming';
          const st = stepsVariants({ status });
          const body = (
            <>
              <span aria-hidden className={st.marker()}>
                {status === 'complete' ? <Icon name="checkmarkSmall" size={14} /> : i + 1}
              </span>
              <span className={st.text()}>
                <span className={st.label()}>
                  {step.label}
                  <span className="sr-only">{`, step ${i + 1} of ${steps.length}, ${statusText[status]}`}</span>
                </span>
                {step.description && <span className={st.description()}>{step.description}</span>}
              </span>
            </>
          );
          return (
            <li key={i} className={st.item()} aria-current={status === 'current' ? 'step' : undefined}>
              {onStepChange && status === 'complete' ? (
                <button type="button" className={cn(st.step(), st.button())} onClick={() => onStepChange(i)}>{body}</button>
              ) : (
                <span className={st.step()}>{body}</span>
              )}
              {i < steps.length - 1 && <span aria-hidden className={st.connector()} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});
