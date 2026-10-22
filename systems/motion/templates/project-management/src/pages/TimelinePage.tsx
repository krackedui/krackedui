import { useState } from 'react';
import { Field, SegmentedControl, Select, Timeline, type TimelineItem, type TimelineScale } from '@krackedui/motion';
import { ScreenLayout } from '../components/ScreenLayout';
import { statusColor } from '../data/meta';
import { parseDay, toISODay, today } from '../lib/dates';
import { navigate } from '../lib/router';
import { useStore } from '../state/store';

/** Empty value = no filter (Select shows the "All …" option for it). */
const ALL = '';

/** Projects and their dated tasks on a week / month scale; tasks move with drag or ← / →. */
export function TimelinePage() {
  const { projects, projectTasks, updateTask } = useStore();
  const [scale, setScale] = useState<TimelineScale>('week');
  const [project, setProject] = useState(ALL);

  const items: TimelineItem[] = projects
    .filter((p) => project === ALL || p.slug === project)
    .flatMap((p) => [
      { id: `project:${p.slug}`, group: true, label: `${p.emoji} ${p.name}`, start: parseDay(p.start), end: parseDay(p.target) },
      ...projectTasks(p.slug)
        .filter((t): t is typeof t & { due: string } => !!t.due)
        .sort((a, b) => a.due.localeCompare(b.due))
        .map((t) => ({
          id: t.id, meta: t.id, label: t.title, description: t.status, color: statusColor[t.status],
          // A task runs from its creation to its due date.
          start: parseDay(t.created < t.due ? t.created : t.due), end: parseDay(t.due),
        })),
    ]);

  return (
    <ScreenLayout
      wide
      title="Timeline"
      description="Projects from start to target date, and each task from creation to its due date. Drag a task, or focus it and use ← / →, to change its due date."
      actions={(
        <SegmentedControl
          aria-label="Scale"
          value={scale}
          onValueChange={(v) => setScale(v as TimelineScale)}
          options={[{ value: 'week', label: 'Weeks' }, { value: 'month', label: 'Months' }]}
        />
      )}
    >
      <Field label="Project" hideLabel className="w-56">
        <Select
          value={project}
          onValueChange={setProject}
          options={[{ value: ALL, label: 'All projects' }, ...projects.map((p) => ({ value: p.slug, label: `${p.emoji} ${p.name}`, textValue: p.name }))]}
        />
      </Field>
      <Timeline
        label="Project timeline"
        items={items}
        scale={scale}
        today={today()}
        onOpen={(item) => navigate(item.group ? { name: 'project', slug: item.id.replace('project:', '') } : { name: 'task', id: item.id })}
        onChange={({ id, end }) => updateTask(id, { due: toISODay(end) }, { kind: 'updated', detail: 'due date' })}
      />
    </ScreenLayout>
  );
}
