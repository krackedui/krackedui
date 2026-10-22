import { cn } from '../lib/cn';
import { Icon } from '../icons/Icon';

/**
 * Default page glyph of a database row (title cell, list row). Not exported from the package (atoms own `PageIcon`);
 * an 18px `pageEmpty` glyph centered in a 22px slot.
 */
export function RowPageIcon({ className }: { className?: string }) {
  return (
    <span className={cn('flex size-[22px] shrink-0 items-center justify-center overflow-visible rounded-[3.5px] text-n-icon-secondary', className)}>
      <Icon name="pageEmpty" size={18} />
    </span>
  );
}
