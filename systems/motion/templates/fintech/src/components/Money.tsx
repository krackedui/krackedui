import { cn } from '@krackedui/motion';
import { formatMoney } from '../lib/format';

interface MoneyProps {
  amount: number;
  /** Show "+" on money in and color it; negative amounts are always red. */
  signed?: boolean;
  className?: string;
}

/** An amount in tabular figures: negative in the danger color, positive (when signed) in success. */
export function Money({ amount, signed = false, className }: MoneyProps) {
  return (
    <span
      className={cn(
        'whitespace-nowrap tabular-nums',
        amount < 0 && 'text-n-red-text-secondary',
        // green-text-secondary is 3.6:1 on white: use the darker shade in light mode (AA in both themes).
        signed && amount > 0 && 'text-n-green-text-primary dark:text-n-green-text-secondary',
        className,
      )}
    >
      {formatMoney(amount, { signed })}
    </span>
  );
}
