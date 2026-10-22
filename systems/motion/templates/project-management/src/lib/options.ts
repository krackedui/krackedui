import type { ControlOption } from '@krackedui/motion';
import { LABELS, PRIORITIES, STATUSES, type Member, type Project } from '../data/types';

export const statusOptions: ControlOption[] = STATUSES.map((s) => ({ value: s, label: s }));
export const priorityOptions: ControlOption[] = PRIORITIES.map((p) => ({ value: p, label: p }));
export const labelOptions: ControlOption[] = LABELS.map((l) => ({ value: l, label: l }));

export const memberOptions = (members: Member[]): ControlOption[] =>
  members.map((m) => ({ value: m.id, label: m.name, description: m.title, textValue: m.name }));

export const projectOptions = (projects: Project[]): ControlOption[] =>
  projects.map((p) => ({ value: p.slug, label: `${p.emoji} ${p.name}`, textValue: p.name }));
