import type { IconName } from '@krackedui/motion';
import { Card, Sparkline, Stat } from '@krackedui/motion';
import { formatChange, formatMoney, trendOf } from '../lib/format';

interface KpiCardProps {
  label: string;
  icon: IconName;
  value: number;
  previous: number;
  /** For costs, going up is bad. */
  upIsGood?: boolean;
  history: number[];
  historyLabel: string;
}

/** A KPI: Stat (value, delta vs last month) over a sparkline of its recent history. */
export function KpiCard({ label, icon, value, previous, upIsGood = true, history, historyLabel }: KpiCardProps) {
  const trend = trendOf(value, previous);
  const good = trend === 'flat' ? undefined : (trend === 'up') === upIsGood;
  return (
    <Card.Root>
      <Card.Content className="flex flex-col gap-3">
        <Stat
          label={label}
          icon={icon}
          value={formatMoney(value)}
          delta={formatChange(value, previous)}
          trend={trend}
          upIsGood={upIsGood}
          description="vs last month"
        />
        <Sparkline data={history} height={32} tone={good === false ? 'danger' : good ? 'success' : 'neutral'} label={historyLabel} valueFormat={(v) => formatMoney(v, { whole: true })} />
      </Card.Content>
    </Card.Root>
  );
}
