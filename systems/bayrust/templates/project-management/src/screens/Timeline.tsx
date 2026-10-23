import { useState } from 'react';
import { Badge, CardContent, CardRoot, PageHeader, SegmentedControl, Stack, Tooltip } from '@krackedui/bayrust';
import { parseDay, projects, today } from '../data';
import { go } from '../router';
import { day } from '../format';

const DAY_MS = 86_400_000;

/**
 * Projects on a time scale. It scrolls inside its own container rather than widening the page,
 * which is what the responsive check asks of wide content.
 */
export function Timeline() {
  const [scale, setScale] = useState('week');
  const pxPerDay = scale === 'week' ? 14 : 5;
  const t = today();
  const origin = new Date(t.getFullYear(), t.getMonth() - 3, 1);
  const span = 180;
  const left = (iso: string) => Math.max(0, ((parseDay(iso).getTime() - origin.getTime()) / DAY_MS) * pxPerDay);
  const width = (from: string, to: string) => Math.max(24, ((parseDay(to).getTime() - parseDay(from).getTime()) / DAY_MS) * pxPerDay);
  const todayLeft = ((t.getTime() - origin.getTime()) / DAY_MS) * pxPerDay;

  return (
    <>
      <PageHeader
        title="Timeline"
        description="Three projects against the calendar."
        actions={
          <SegmentedControl
            aria-label="Scale"
            value={scale}
            onValueChange={setScale}
            size="sm"
            options={[{ value: 'week', label: 'Weeks' }, { value: 'month', label: 'Months' }]}
          />
        }
      />
      <CardRoot>
        <CardContent>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ position: 'relative', width: span * pxPerDay, minWidth: '100%' }}>
              <div
                aria-hidden="true"
                style={{ position: 'absolute', top: 0, bottom: 0, left: todayLeft, width: 2, background: 'var(--ds-accent-default)' }}
              />
              <Stack gap={10}>
                {projects.map((p) => (
                  <div key={p.id} style={{ position: 'relative', height: 44 }}>
                    <Tooltip content={`${p.name}: ${day(p.start)} → ${day(p.target)}`}>
                      <button
                        type="button"
                        onClick={() => go(`/projects/${p.id}`)}
                        style={{
                          position: 'absolute',
                          left: left(p.start),
                          width: width(p.start, p.target),
                          top: 6,
                          height: 32,
                          font: 'inherit',
                          color: 'var(--ds-text-primary)',
                          cursor: 'pointer',
                          borderRadius: 'var(--ds-radius-md)',
                          background: 'var(--ds-bg-surface-selected)',
                          border: '1px solid var(--ds-border-default)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '0 10px',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <span>{p.name}</span>
                        <Badge tone={p.status === 'On track' ? 'success' : p.status === 'At risk' ? 'warning' : 'neutral'}>
                          {p.progress}%
                        </Badge>
                      </button>
                    </Tooltip>
                  </div>
                ))}
              </Stack>
            </div>
          </div>
        </CardContent>
      </CardRoot>
    </>
  );
}
