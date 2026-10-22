import { cn, toneText } from '@krackedui/motion';
import { formatMoney } from '../lib/format';

interface MoneyProps {
  amount: number;
  /** Show "+" on money in and color it; negative amounts are always red. */
  signed?: boolean;
  className?: string;
}

/** An amount in tabular figures: negative in the danger tone, positive (when signed) in success. */
export function Money({ amount, signed = false, className }: MoneyProps) {
  return (
    <span className={cn('whitespace-nowrap tabular-nums', amount < 0 && toneText.danger, signed && amount > 0 && toneText.success, className)}>
      {formatMoney(amount, { signed })}
    </span>
  );
}
