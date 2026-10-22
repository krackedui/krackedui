import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { initialActivity } from '../data/activity';
import { initialTasks } from '../data/tasks';
import { members as initialMembers, projects as initialProjects, workspace as initialWorkspace } from '../data/workspace';
import type { ActivityEvent, ActivityKind, Member, Project, Role, Status, Task, Workspace } from '../data/types';
import { nowStamp, toISODay, today } from '../lib/dates';

export interface NewTaskInput {
  projectSlug: string;
  title: string;
  status: Status;
  assigneeId?: string | null;
  priority?: Task['priority'];
  due?: string | null;
}

interface State {
  workspace: Workspace;
  members: Member[];
  projects: Project[];
  tasks: Task[];
  activity: ActivityEvent[];
}

export interface Store extends State {
  me: Member;
  memberById: (id: string | null | undefined) => Member | undefined;
  projectBySlug: (slug: string) => Project | undefined;
  taskById: (id: string) => Task | undefined;
  /** Tasks of a project, sorted by their board order. */
  projectTasks: (slug: string) => Task[];
  addTask: (input: NewTaskInput) => Task;
  updateTask: (id: string, patch: Partial<Omit<Task, 'id'>>, log?: { kind: ActivityKind; detail?: string }) => void;
  /** Move to a status column, before `beforeId` (or at the end). */
  moveTask: (id: string, status: Status, beforeId?: string) => void;
  /** Put earlier versions of tasks back (undo), re-adding deleted ones. */
  restoreTasks: (snapshot: Task[]) => void;
  deleteTasks: (ids: string[]) => Task[];
  addComment: (taskId: string, text: string) => void;
  addProject: (project: Omit<Project, 'key'>) => Project;
  inviteMember: (member: Pick<Member, 'name' | 'email' | 'role'>) => Member;
  setMemberRole: (id: string, role: Role) => void;
  updateWorkspace: (patch: Partial<Workspace>) => void;
}

const Ctx = createContext<Store | null>(null);

const byOrder = (a: Task, b: Task) => a.order - b.order;

/** Next free number for a project key ("WEB" → "WEB-19"). */
function nextTaskId(tasks: Task[], key: string): string {
  const max = tasks.reduce((m, t) => (t.id.startsWith(`${key}-`) ? Math.max(m, Number(t.id.slice(key.length + 1)) || 0) : m), 0);
  return `${key}-${max + 1}`;
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}

/** App state: the workspace's members, projects, tasks and activity, with the actions the screens use. */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => ({
    workspace: initialWorkspace,
    members: initialMembers,
    projects: initialProjects,
    tasks: initialTasks,
    activity: initialActivity,
  }));
  // Actions read the latest state synchronously (to return the created task, compute ids…).
  const latest = useRef(state);
  latest.current = state;
  const seq = useRef(0);

  const commit = useCallback((next: (s: State) => State) => {
    latest.current = next(latest.current);
    setState(latest.current);
  }, []);

  const log = useCallback((s: State, taskId: string, kind: ActivityKind, detail?: string): ActivityEvent[] => {
    seq.current += 1;
    return [{ id: `local-${seq.current}`, kind, actorId: s.workspace.meId, taskId, at: nowStamp(), detail }, ...s.activity];
  }, []);

  const addTask = useCallback((input: NewTaskInput): Task => {
    const s = latest.current;
    const project = s.projects.find((p) => p.slug === input.projectSlug);
    const day = toISODay(today());
    const task: Task = {
      id: nextTaskId(s.tasks, project?.key ?? 'TASK'),
      projectSlug: input.projectSlug,
      title: input.title.trim(),
      description: '',
      status: input.status,
      priority: input.priority ?? 'None',
      assigneeId: input.assigneeId ?? null,
      labels: [],
      due: input.due ?? null,
      estimate: 1,
      created: day,
      updated: day,
      comments: [],
      subtasks: [],
      order: Math.max(0, ...s.tasks.map((t) => t.order)) + 1,
    };
    commit((st) => ({ ...st, tasks: [...st.tasks, task], activity: log(st, task.id, 'created') }));
    return task;
  }, [commit, log]);

  const updateTask = useCallback<Store['updateTask']>((id, patch, entry) => {
    commit((st) => ({
      ...st,
      tasks: st.tasks.map((t) => (t.id === id ? { ...t, ...patch, updated: toISODay(today()) } : t)),
      activity: entry ? log(st, id, entry.kind, entry.detail) : st.activity,
    }));
  }, [commit, log]);

  const moveTask = useCallback<Store['moveTask']>((id, status, beforeId) => {
    commit((st) => {
      const task = st.tasks.find((t) => t.id === id);
      if (!task) return st;
      const column = st.tasks.filter((t) => t.projectSlug === task.projectSlug && t.status === status && t.id !== id).sort(byOrder);
      const at = beforeId ? column.findIndex((t) => t.id === beforeId) : -1;
      column.splice(at < 0 ? column.length : at, 0, { ...task, status });
      const order = new Map(column.map((t, i) => [t.id, i]));
      const statusChanged = task.status !== status;
      return {
        ...st,
        tasks: st.tasks.map((t) => {
          if (t.id === id) return { ...t, status, order: order.get(id) ?? 0, updated: statusChanged ? toISODay(today()) : t.updated };
          const o = order.get(t.id);
          return o === undefined ? t : { ...t, order: o };
        }),
        activity: statusChanged ? log(st, id, 'moved', status) : st.activity,
      };
    });
  }, [commit, log]);

  const restoreTasks = useCallback((snapshot: Task[]) => {
    commit((st) => {
      const prev = new Map(snapshot.map((t) => [t.id, t]));
      const kept = st.tasks.map((t) => prev.get(t.id) ?? t);
      const missing = snapshot.filter((t) => !st.tasks.some((x) => x.id === t.id));
      return { ...st, tasks: [...kept, ...missing] };
    });
  }, [commit]);

  const deleteTasks = useCallback((ids: string[]) => {
    const removed = latest.current.tasks.filter((t) => ids.includes(t.id));
    commit((st) => ({ ...st, tasks: st.tasks.filter((t) => !ids.includes(t.id)) }));
    return removed;
  }, [commit]);

  const addComment = useCallback((taskId: string, text: string) => {
    commit((st) => {
      seq.current += 1;
      const comment = { id: `local-c${seq.current}`, authorId: st.workspace.meId, at: nowStamp(), text };
      return {
        ...st,
        tasks: st.tasks.map((t) => (t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t)),
        activity: log(st, taskId, 'commented', text),
      };
    });
  }, [commit, log]);

  const addProject = useCallback((input: Omit<Project, 'key'>): Project => {
    const key = input.name.replace(/[^a-z]/gi, '').slice(0, 3).toUpperCase() || 'PRJ';
    const project: Project = { ...input, key };
    commit((st) => ({ ...st, projects: [...st.projects, project] }));
    return project;
  }, [commit]);

  const inviteMember = useCallback((input: Pick<Member, 'name' | 'email' | 'role'>): Member => {
    seq.current += 1;
    const member: Member = { ...input, id: `invited-${seq.current}`, initials: initials(input.name), title: 'Invited' };
    commit((st) => ({ ...st, members: [...st.members, member] }));
    return member;
  }, [commit]);

  const setMemberRole = useCallback((id: string, role: Role) => {
    commit((st) => ({ ...st, members: st.members.map((m) => (m.id === id ? { ...m, role } : m)) }));
  }, [commit]);

  const updateWorkspace = useCallback((patch: Partial<Workspace>) => {
    commit((st) => ({ ...st, workspace: { ...st.workspace, ...patch } }));
  }, [commit]);

  const value = useMemo<Store>(() => {
    const memberMap = new Map(state.members.map((m) => [m.id, m]));
    const taskMap = new Map(state.tasks.map((t) => [t.id, t]));
    return {
      ...state,
      me: memberMap.get(state.workspace.meId) ?? state.members[0],
      memberById: (id) => (id ? memberMap.get(id) : undefined),
      projectBySlug: (slug) => state.projects.find((p) => p.slug === slug),
      taskById: (id) => taskMap.get(id),
      projectTasks: (slug) => state.tasks.filter((t) => t.projectSlug === slug).sort(byOrder),
      addTask, updateTask, moveTask, restoreTasks, deleteTasks, addComment, addProject, inviteMember, setMemberRole, updateWorkspace,
    };
  }, [state, addTask, updateTask, moveTask, restoreTasks, deleteTasks, addComment, addProject, inviteMember, setMemberRole, updateWorkspace]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const store = useContext(Ctx);
  if (!store) throw new Error('useStore() must be used inside <StoreProvider>.');
  return store;
}
