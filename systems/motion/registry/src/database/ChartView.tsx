import { cn } from '../lib/cn';
import { Icon } from '../icons/Icon';
import { optionColors } from './colors';
import { useDatabaseContext } from './useDatabase';
import { getProperty, groupRows, queryRows } from './query';

/**
 * Locked chart state (capture: db-chart). Measured: 400px tall centered block; chartBarXAxisLock 32px icon-tertiary;
 * 14/20 text-secondary lines (first 500), gap 2; "Upgrade now" 32px, padding 0 12, gap 8, 1px border-primary-translucent-a,
 * radius 6, 14/500 with a blue arrowInCircleUpFill.
 */
export function ChartLockedState({ onUpgrade, learnMoreHref, className }: { onUpgrade?: () => void; learnMoreHref?: string; className?: string }) {
  return (
    <div className={cn('flex h-[400px] items-center justify-center', className)}>
      <div className="flex flex-col items-center justify-center gap-1.5 py-5">
        <Icon name="chartBarXAxisLock" size={32} className="text-n-icon-tertiary" />
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-0.5 text-center text-[14px] leading-5 text-n-text-secondary">
            <div className="font-medium">Your workspace has already used its 1 free chart.</div>
            <div>
              Upgrade to get unlimited charts.
              {learnMoreHref && <> <a href={learnMoreHref} className="rounded-n-xs text-n-text-secondary underline">Learn more.</a></>}
            </div>
          </div>
          <button type="button" onClick={onUpgrade}
            className="flex h-8 cursor-pointer items-center gap-2 rounded-n-md border border-n-border-primary-translucent-a px-3 text-[14px] font-medium leading-[16.8px] hover:bg-n-button-hover-bg-a">
            <Icon name="arrowInCircleUpFill" size={16} className="text-n-blue-icon-accent-primary" />
            Upgrade now
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Chart view. `view.chart.locked` renders the captured upgrade state; otherwise a vertical bar chart of row
 * counts grouped by `view.chart.groupBy` (bars take the option colors; gridlines border-secondary-translucent-a).
 */
export function ChartView({ height = 320 }: { height?: number }) {
  const db = useDatabaseContext();
  const { collection } = db.data;
  const view = db.activeView;
  if (view.chart?.locked) return <ChartLockedState className="ml-2 mr-5" />;
  const prop = getProperty(collection, view.chart?.groupBy ?? view.groupBy) ?? collection.properties.find((p) => p.type === 'status' || p.type === 'select');
  const groups = groupRows(collection, queryRows(collection, db.data.rows, view), prop?.id);
  const max = Math.max(1, ...groups.map((g) => g.rows.length));
  const ticks = Array.from({ length: max + 1 }, (_, i) => i).filter((i) => max <= 5 || i % Math.ceil(max / 5) === 0);
  const plot = height - 72; // room for value labels + axis labels
  return (
    <div className="ml-2 mr-5 py-4" style={{ height }}>
      <div className="relative ml-8 mr-2 mt-6" style={{ height: plot }}>
        {ticks.map((t) => (
          <div key={t} className="absolute inset-x-0 border-t border-n-border-secondary-translucent-a" style={{ bottom: (t / max) * plot }}>
            <span className="absolute -left-8 -top-2 w-6 text-right text-[12px] leading-4 text-n-text-tertiary">{t}</span>
          </div>
        ))}
        <div className="absolute inset-0 flex items-end justify-around">
          {groups.map((g) => (
            <div key={g.id} className="relative flex h-full w-16 flex-col items-center justify-end" title={`${g.label}: ${g.rows.length}`}>
              <div className={cn('relative w-12 rounded-t-n-sm', optionColors[g.option?.color ?? 'gray'].dot)} style={{ height: (g.rows.length / max) * plot }}>
                <span className="absolute -top-5 left-0 right-0 text-center text-[12px] text-n-text-secondary">{g.rows.length}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="ml-8 mr-2 mt-2 flex justify-around text-[12px] leading-4 text-n-text-secondary">
        {groups.map((g) => <span key={g.id} className="w-16 truncate text-center">{g.label}</span>)}
      </div>
    </div>
  );
}
