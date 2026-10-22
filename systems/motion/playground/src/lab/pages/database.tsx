import { useEffect, useState, type ReactNode } from 'react';
import {
  DatabaseView, useDatabase, createTasksSample, SAMPLE_TODAY,
  PropertyMenu, SelectPicker, DateCellPicker, FilterMenu, SortMenu, ViewSettingsPanel, ViewsMenu, NewViewMenu,
  PropertyList, ChartLockedState, type ViewType, type DatabaseData,
} from '@krackedui/motion';

/*
 * Database lab. `#/lab/database` shows the sandbox "Tasks" database in every view plus the menus opened statically.
 * `#/lab/database?view=<type>` renders one view at the captured page geometry (block at x=630, captured y) for pixel
 * diffs against systems/motion/mirror/states/db-<type>.<theme>.png.
 */
const CAPTURE_Y: Partial<Record<ViewType, number>> = { table: 294, board: 307, gallery: 344, list: 307, calendar: 351, chart: 298, timeline: 384 };
const VIEW_ID: Record<ViewType, string> = { table: 'v-table', board: 'v-board', gallery: 'v-gallery', list: 'v-list', calendar: 'v-calendar', timeline: 'v-timeline', chart: 'v-chart' };
const BLEED = { left: 366, right: 360 }; // reference scroller padding: 366px either side of the 720 column in a 1710 window

function useQuery() {
  const get = () => new URLSearchParams(location.hash.split('?')[1] ?? '');
  const [q, setQ] = useState(get);
  useEffect(() => { const on = () => setQ(get()); addEventListener('hashchange', on); return () => removeEventListener('hashchange', on); }, []);
  return q;
}

function Section({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return (
    <section className="mb-16">
      <h2 className="mb-1 text-[12px] font-medium uppercase tracking-wide text-n-text-tertiary">{title}</h2>
      {note && <p className="mb-3 text-[12px] text-n-text-tertiary">{note}</p>}
      {children}
    </section>
  );
}

function Tasks({ type, data, ...rest }: { type: ViewType; data?: DatabaseData } & Partial<Parameters<typeof DatabaseView>[0]>) {
  return <DatabaseView data={data ?? createTasksSample()} initialViewId={VIEW_ID[type]} width={720} bleed={BLEED} today={SAMPLE_TODAY} {...rest} />;
}

export default function DatabaseLab() {
  const q = useQuery();
  const only = q.get('view') as ViewType | null;
  if (only) {
    return (
      <div className="relative h-[1037px] w-[1710px] overflow-hidden bg-n-bg-primary">
        <div className="absolute left-[630px]" style={{ top: CAPTURE_Y[only] ?? 294 }}>
          <Tasks type={only} />
        </div>
      </div>
    );
  }
  return <Gallery />;
}

function Gallery() {
  const shared = useDatabase(createTasksSample);
  const { collection, rows } = shared.data;
  const priority = collection.properties.find((p) => p.id === 'priority')!;
  const row = rows[1];
  return (
    <div className="bg-n-bg-primary py-10 pl-[630px]">
      <Section title="Interactive (shared state)" note="Switch views, sort/filter from the toolbar, edit cells, drag board cards, add rows. All views below share nothing; this one keeps state across tabs.">
        <DatabaseView db={shared} width={720} bleed={BLEED} today={SAMPLE_TODAY} />
      </Section>
      {(['table', 'board', 'gallery', 'list', 'calendar', 'timeline', 'chart'] as ViewType[]).map((t) => (
        <Section key={t} title={`${t} view`}>
          <Tasks type={t} viewProps={t === 'list' ? { hoveredRowId: 'r4' } : undefined} />
        </Section>
      ))}
      <Section title="table: row hover (OPEN) + selection + calculation footer">
        <Tasks type="table" viewProps={{ hoveredRowId: 'r2', selected: ['r3'], calculations: true }} />
      </Section>
      <Section title="board: card hover actions">
        <Tasks type="board" viewProps={{ hoveredRowId: 'r8' }} />
      </Section>
      <Section title="chart: bar variant">
        <Tasks type="chart" data={{ ...createTasksSample(), views: createTasksSample().views.map((v) => (v.type === 'chart' ? { ...v, chart: { groupBy: 'status' } } : v)) }} />
      </Section>

      <Section title="Menus (static)">
        <div className="-ml-[600px] flex flex-wrap items-start gap-6">
          <PropertyMenu property={priority} autoFocus={false} />
          <SelectPicker options={priority.type === 'select' ? priority.options : []} value={['medium']} />
          <DateCellPicker value="2026-10-12" today={SAMPLE_TODAY} />
          <FilterMenu properties={[...collection.properties].sort((a, b) => ['title', 'due', 'priority', 'status', 'team'].indexOf(a.id) - ['title', 'due', 'priority', 'status', 'team'].indexOf(b.id))} highlightFirst />
          <SortMenu properties={[...collection.properties].sort((a, b) => ['title', 'due', 'priority', 'status', 'team'].indexOf(a.id) - ['title', 'due', 'priority', 'status', 'team'].indexOf(b.id))} highlightFirst />
          <ViewSettingsPanel collection={collection} view={shared.data.views[0]} height={627} />
          <div className="relative h-[400px] w-[700px]">
            <ViewsMenu views={shared.data.views} activeViewId="v-table" newViewHighlighted />
            <NewViewMenu className="absolute left-[286px] top-[154px]" highlighted="table" />
          </div>
        </div>
      </Section>
      <Section title="Page properties (side peek)">
        <div className="w-[506px]">
          <h1 className="mb-4 text-[40px] font-bold leading-[1.2]">{String(row.values.title)}</h1>
          <PropertyList properties={[collection.properties[4], collection.properties[2], collection.properties[1], collection.properties[3]]} row={row} today={SAMPLE_TODAY}
            onChange={(pid, v) => shared.updateRow(row.id, pid, v)} onCreateOption={(pid, n) => shared.addOption(pid, n)} />
        </div>
      </Section>
      <Section title="Chart locked state"><div className="w-[720px]"><ChartLockedState className="ml-2 mr-5" /></div></Section>
    </div>
  );
}
