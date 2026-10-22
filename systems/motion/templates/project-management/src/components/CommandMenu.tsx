import { CommandPaletteDialog, type CommandGroup } from '@krackedui/motion';
import { navigate } from '../lib/router';
import { useStore } from '../state/store';

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask: () => void;
  onNewProject: () => void;
}

/** ⌘K: jump to a task or project, or create one. */
export function CommandMenu({ open, onOpenChange, onCreateTask, onNewProject }: CommandMenuProps) {
  const { projects, tasks, projectBySlug } = useStore();
  const groups: CommandGroup[] = [
    {
      label: 'Actions',
      items: [
        { id: 'action:create-task', title: 'Create task…', icon: 'plus', keywords: 'new add issue' },
        { id: 'action:new-project', title: 'New project…', icon: 'folder', keywords: 'create add' },
      ],
    },
    {
      label: 'Projects',
      items: projects.map((p) => ({ id: `project:${p.slug}`, title: p.name, icon: p.emoji, keywords: p.key })),
    },
    {
      label: 'Tasks',
      items: tasks.map((t) => ({ id: `task:${t.id}`, title: `${t.id} ${t.title}`, icon: 'checkmarkSquare', keywords: t.labels.join(' '), path: [projectBySlug(t.projectSlug)?.name ?? ''] })),
    },
  ];
  return (
    <CommandPaletteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search tasks and projects"
      placeholder="Search tasks, projects, or type a command…"
      emptyText="No tasks or projects match your search."
      groups={groups}
      onSelect={(item) => {
        const [kind, id] = item.id.split(/:(.*)/s);
        if (kind === 'action' && id === 'create-task') onCreateTask();
        else if (kind === 'action' && id === 'new-project') onNewProject();
        else if (kind === 'project') navigate({ name: 'project', slug: id });
        else if (kind === 'task') navigate({ name: 'task', id });
      }}
    />
  );
}
