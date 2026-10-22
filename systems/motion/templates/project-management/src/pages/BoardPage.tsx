import { useEffect, useState } from 'react';
import { AvatarGroup, Avatar, Badge, Button, ConfirmDialog, EmptyState, Progress, SegmentedControl } from '@krackedui/motion';
import { BoardFilters } from '../components/BoardFilters';
import { BoardSkeleton } from '../components/BoardSkeleton';
import { ProjectBoard } from '../components/ProjectBoard';
import { ScreenLayout } from '../components/ScreenLayout';
import { TaskListView } from '../components/TaskListView';
import { TaskSheet } from '../components/TaskSheet';
import { projectTone } from '../data/meta';
import type { Task } from '../data/types';
import { formatDay } from '../lib/dates';
import { navigate } from '../lib/router';
import { emptyFilters, filterTasks, isFiltered, progressOf, type TaskFilters } from '../lib/selectors';
import { useStore } from '../state/store';
import { useTaskActions } from '../state/useTaskActions';
import { NotFoundPage } from './NotFoundPage';

type View = 'board' | 'list';
const LOAD_MS = 400; // simulated first load: the board shows skeletons meanwhile

/** A project's board (or list), with filters. `openTaskId` shows that task in a side sheet over it. */
export function BoardPage({ slug, openTaskId }: { slug: string; openTaskId?: string }) {
  const store = useStore();
  const { remove } = useTaskActions();
  const project = store.projectBySlug(slug);
  const [view, setView] = useState<View>('board');
  const [filters, setFilters] = useState<TaskFilters>(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [startAdding, setStartAdding] = useState(false);
  const [deleting, setDeleting] = useState<Task | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), LOAD_MS);
    return () => window.clearTimeout(t);
  }, []);

  if (!project) return <NotFoundPage what="This project" />;
  const all = store.projectTasks(slug);
  const shown = filterTasks(all, filters);
  const people = [...new Set(all.map((t) => t.assigneeId).filter((id): id is string => !!id))].map((id) => store.memberById(id)).filter((m) => !!m);
  const lead = store.memberById(project.leadId);
  const openTask = openTaskId ? store.taskById(openTaskId) : undefined;

  const body = () => {
    if (loading) return <BoardSkeleton />;
    if (!all.length && !startAdding) {
      return (
        <EmptyState
          icon="checklist"
          title="No tasks in this project yet"
          description="Add the first task to start planning. You can also create tasks from anywhere with ⌘K."
          action={<Button variant="primary" icon="plus" onClick={() => setStartAdding(true)}>Add a task</Button>}
        />
      );
    }
    if (!shown.length && isFiltered(filters)) {
      return (
        <EmptyState
          icon="magnifyingGlass"
          title="No tasks match these filters"
          description={filters.query ? `Nothing found for “${filters.query.trim()}”. Try another search or clear the filters.` : 'Try other filters or clear them.'}
          action={<Button variant="secondary" onClick={() => setFilters(emptyFilters)}>Clear filters</Button>}
        />
      );
    }
    return view === 'board'
      ? <ProjectBoard projectSlug={slug} tasks={shown} onDelete={setDeleting} quickAddStatus={startAdding ? 'To do' : undefined} />
      : <TaskListView tasks={shown} />;
  };

  return (
    <ScreenLayout
      wide
      title={<span className="flex items-center gap-3"><span aria-hidden>{project.emoji}</span>{project.name}</span>}
      description={project.description}
      actions={(
        <SegmentedControl
          aria-label="View"
          value={view}
          onValueChange={(v) => setView(v as View)}
          options={[{ value: 'board', label: 'Board', icon: 'viewBoard' }, { value: 'list', label: 'List', icon: 'viewTable' }]}
        />
      )}
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-n-ui text-n-text-secondary">
        <Badge tone={projectTone[project.status]}>{project.status}</Badge>
        <span className="flex items-center gap-2">Lead <Avatar name={lead?.name} shape="user" size="sm" /> <span className="text-n-text-primary">{lead?.name}</span></span>
        <span>Target <span className="text-n-text-primary">{formatDay(project.target)}</span></span>
        <Progress value={progressOf(all)} label="Progress" size="sm" className="w-40" />
        {people.length > 0 && (
          <AvatarGroup max={5} size="lg" aria-label={`${people.length} people on this project`}>
            {people.map((m) => <Avatar key={m.id} name={m.name} shape="user" />)}
          </AvatarGroup>
        )}
      </div>
      <BoardFilters value={filters} onChange={setFilters} />
      {body()}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => { if (!o) setDeleting(null); }}
        title={`Delete ${deleting?.id ?? 'task'}?`}
        description={deleting ? `“${deleting.title}” is removed from ${project.name}. You can undo right after.` : undefined}
        onConfirm={() => { if (deleting) remove([deleting.id]); setDeleting(null); }}
      />
      {openTask && (
        <TaskSheet task={openTask} onClose={() => navigate({ name: 'project', slug })} />
      )}
    </ScreenLayout>
  );
}
