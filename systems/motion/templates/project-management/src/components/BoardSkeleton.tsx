import { Skeleton } from '@krackedui/motion';
import { STATUSES } from '../data/types';

/** Placeholder columns while the board loads. */
export function BoardSkeleton() {
  return (
    <div role="status" className="-mx-4 overflow-hidden px-4 sm:-mx-8 sm:px-8">
      <span className="sr-only">Loading tasks…</span>
      <div className="flex w-max gap-3">
        {STATUSES.map((s, i) => (
          <div key={s} className="flex w-[272px] shrink-0 flex-col gap-2 rounded-n-lg bg-n-bg-secondary p-2">
            <Skeleton width={110} height={20} />
            {Array.from({ length: 3 - (i % 2) }, (_, j) => (
              <div key={j} className="flex flex-col gap-2 rounded-n-lg border border-n-border-primary bg-n-bg-primary p-3">
                <Skeleton width={48} height={12} />
                <Skeleton lines={2} />
                <Skeleton width={90} height={16} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
