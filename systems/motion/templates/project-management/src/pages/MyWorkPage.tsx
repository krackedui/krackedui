import { Card, EmptyState, Grid, Stat } from '@krackedui/motion';
import { ActivityItem } from '../components/ActivityItem';
import { ScreenLayout } from '../components/ScreenLayout';
import { DueDate, PriorityIcon, StatusLabel } from '../components/TaskMeta';
import { STATUSES, type Task } from '../data/types';
import { daysBetween, isOverdue, isThisWeek, parseDay, today } from '../lib/dates';
import { href } from '../lib/router';
import { useStore } from '../state/store';

function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

/** Home: my numbers, my tasks by status, upcoming deadlines and recent activity. */
export function MyWorkPage() {
  const { me, tasks, activity, projectBySlug } = useStore();
  const mine = tasks.filter((t) => t.assigneeId === me.id);
  const open = mine.filter((t) => t.status !== 'Done');
  const dueThisWeek = open.filter((t) => isThisWeek(t.due));
  const overdue = open.filter((t) => isOverdue(t.due, false));
  const doneThisWeek = tasks.filter((t) => t.status === 'Done' && isThisWeek(t.updated));
  const upcoming = tasks
    .filter((t) => t.status !== 'Done' && t.due && daysBetween(today(), parseDay(t.due)) >= 0)
    .sort((a, b) => (a.due ?? '').localeCompare(b.due ?? ''))
    .slice(0, 6);

  return (
    <ScreenLayout title={`${greeting()}, ${me.name.split(' ')[0]}`} description="Here is what is on your plate across Northwind Studio.">
      <Grid columns={{ base: 2, md: 4 }} gap={3}>
        <StatCard label="Assigned to me" value={open.length} description="open tasks" icon="person" />
        <StatCard label="Due this week" value={dueThisWeek.length} description="until Sunday" icon="calendar" />
        <StatCard label="Overdue" value={overdue.length} description={overdue.length ? 'need attention' : 'all on time'} icon="warning" />
        <StatCard label="Done this week" value={doneThisWeek.length} description="by the team" icon="checkmarkCircle" />
      </Grid>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section aria-labelledby="my-tasks" className="flex min-w-0 flex-col gap-3">
          <h2 id="my-tasks" className="m-0 text-n-h3">My tasks</h2>
          {mine.length === 0 && <EmptyState icon="checkmarkCircle" title="Nothing assigned to you" description="Tasks assigned to you show up here." />}
          {STATUSES.map((status) => {
            const group = mine.filter((t) => t.status === status);
            if (!group.length) return null;
            return (
              <Card.Root key={status}>
                <Card.Header className="flex-row items-center gap-2 pb-1">
                  <h3 className="m-0 font-normal"><StatusLabel status={status} /></h3>
                  <span className="text-n-ui-sm text-n-text-secondary">{group.length}</span>
                </Card.Header>
                <Card.Content className="py-1">
                  <ul className="m-0 list-none p-0">{group.map((t) => <TaskRow key={t.id} task={t} project={projectBySlug(t.projectSlug)?.name} />)}</ul>
                </Card.Content>
              </Card.Root>
            );
          })}
        </section>
        <div className="flex min-w-0 flex-col gap-6">
          <Card.Root>
            <Card.Header><Card.Title asChild><h2 className="m-0">Upcoming deadlines</h2></Card.Title></Card.Header>
            <Card.Content className="py-1">
              <ul className="m-0 list-none p-0">{upcoming.map((t) => <TaskRow key={t.id} task={t} compact />)}</ul>
            </Card.Content>
          </Card.Root>
          <Card.Root>
            <Card.Header><Card.Title asChild><h2 className="m-0">Recent activity</h2></Card.Title></Card.Header>
            <Card.Content className="py-1">
              <ul className="m-0 list-none p-0">{activity.slice(0, 6).map((e) => <ActivityItem key={e.id} event={e} />)}</ul>
            </Card.Content>
          </Card.Root>
        </div>
      </div>
    </ScreenLayout>
  );
}

function StatCard(props: { label: string; value: number; description: string; icon: 'person' | 'calendar' | 'warning' | 'checkmarkCircle' }) {
  return (
    <Card.Root>
      <Card.Content><Stat {...props} /></Card.Content>
    </Card.Root>
  );
}

function TaskRow({ task, project, compact }: { task: Task; project?: string; compact?: boolean }) {
  return (
    <li className="flex min-h-10 flex-wrap items-center gap-x-3 gap-y-1 border-b border-n-border-primary py-2 last:border-b-0">
      <PriorityIcon priority={task.priority} />
      <a href={href({ name: 'task', id: task.id })} className="min-w-0 flex-1 truncate text-n-ui text-n-text-primary no-underline hover:underline">
        <span className="mr-2 text-n-text-secondary">{task.id}</span>{task.title}
      </a>
      {!compact && project && <span className="text-n-ui-sm text-n-text-secondary max-sm:hidden">{project}</span>}
      <DueDate due={task.due} done={task.status === 'Done'} />
    </li>
  );
}
