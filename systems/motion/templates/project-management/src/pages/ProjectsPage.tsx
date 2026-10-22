import { useState } from 'react';
import { Avatar, AvatarGroup, Badge, Button, Card, EmptyState, Field, Grid, Progress, Select } from '@krackedui/motion';
import { ScreenLayout } from '../components/ScreenLayout';
import { projectTone } from '../data/meta';
import { PROJECT_STATUSES, type Project } from '../data/types';
import { formatDay } from '../lib/dates';
import { href } from '../lib/router';
import { progressOf } from '../lib/selectors';
import { useStore } from '../state/store';

const ALL = 'all';

/** All projects as cards, filterable by status, with "New project". */
export function ProjectsPage({ onNewProject }: { onNewProject: () => void }) {
  const { projects } = useStore();
  const [status, setStatus] = useState(ALL);
  const shown = projects.filter((p) => status === ALL || p.status === status);
  return (
    <ScreenLayout
      title="Projects"
      description={`${projects.length} projects in Northwind Studio`}
      actions={<Button variant="primary" icon="plus" onClick={onNewProject}>New project</Button>}
    >
      <Field label="Status" hideLabel className="w-48">
        <Select
          options={[{ value: ALL, label: 'All statuses' }, ...PROJECT_STATUSES.map((s) => ({ value: s, label: s }))]}
          value={status}
          onValueChange={setStatus}
        />
      </Field>
      {shown.length ? (
        <Grid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
          {shown.map((p) => <ProjectCard key={p.slug} project={p} />)}
        </Grid>
      ) : (
        <EmptyState
          icon="folder"
          title={`No ${status.toLowerCase()} projects`}
          description="Try another status, or start a new project."
          action={<Button variant="secondary" onClick={() => setStatus(ALL)}>Show all projects</Button>}
        />
      )}
    </ScreenLayout>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const { projectTasks, memberById } = useStore();
  const tasks = projectTasks(project.slug);
  const lead = memberById(project.leadId);
  const people = [...new Set(tasks.map((t) => t.assigneeId).filter((id): id is string => !!id))].map((id) => memberById(id)).filter((m) => !!m);
  const open = tasks.filter((t) => t.status !== 'Done').length;
  const progress = progressOf(tasks);
  return (
    <Card.Root className="relative transition-[background] duration-[20ms] hover:bg-n-card-hover-bg has-[a:focus-visible]:shadow-n-focus-shadow">
      <Card.Header>
        <div className="flex items-start justify-between gap-3">
          <Card.Title asChild>
            <h2 className="m-0">
              <a href={href({ name: 'project', slug: project.slug })} className="text-n-text-primary no-underline outline-none after:absolute after:inset-0 focus-visible:shadow-none">
                <span aria-hidden className="mr-2">{project.emoji}</span>{project.name}
              </a>
            </h2>
          </Card.Title>
          <Badge tone={projectTone[project.status]}>{project.status}</Badge>
        </div>
        <Card.Description className="line-clamp-2">{project.description || 'No description'}</Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-3">
        <Progress value={progress} label="Progress" size="sm" description={`${open} open of ${tasks.length} tasks`} />
      </Card.Content>
      <Card.Footer className="justify-between">
        <span className="flex items-center gap-2 text-n-ui">
          <Avatar name={lead?.name} shape="user" size="md" />
          <span className="text-n-text-secondary">{lead?.name.split(' ')[0] ?? 'No lead'} · {formatDay(project.target)}</span>
        </span>
        {people.length > 0 && (
          <AvatarGroup max={4} size="sm" aria-label={`${people.length} people`}>
            {people.map((m) => <Avatar key={m.id} name={m.name} shape="user" />)}
          </AvatarGroup>
        )}
      </Card.Footer>
    </Card.Root>
  );
}
