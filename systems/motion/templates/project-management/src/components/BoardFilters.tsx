import { Button, Combobox, Field, SearchInput, Select } from '@krackedui/motion';
import { ANY, emptyFilters, isFiltered, type TaskFilters } from '../lib/selectors';
import { labelOptions, memberOptions, priorityOptions } from '../lib/options';
import { useStore } from '../state/store';

/** Search plus assignee, label and priority filters, with "Clear filters". */
export function BoardFilters({ value, onChange }: { value: TaskFilters; onChange: (next: TaskFilters) => void }) {
  const { members } = useStore();
  const set = (patch: Partial<TaskFilters>) => onChange({ ...value, ...patch });
  return (
    <div role="search" aria-label="Filter tasks" className="flex flex-wrap items-center gap-2">
      <Field label="Search tasks" hideLabel className="w-full sm:w-56">
        <SearchInput value={value.query} onChange={(e) => set({ query: e.target.value })} onClear={() => set({ query: '' })} placeholder="Search tasks" />
      </Field>
      <Field label="Assignee" hideLabel className="w-[calc(50%-4px)] sm:w-44">
        <Combobox
          options={[{ value: ANY, label: 'Any assignee' }, { value: 'none', label: 'Unassigned' }, ...memberOptions(members)]}
          value={value.assigneeId}
          onValueChange={(v) => set({ assigneeId: v })}
          searchPlaceholder="Search people"
        />
      </Field>
      <Field label="Label" hideLabel className="w-[calc(50%-4px)] sm:w-36">
        <Select options={[{ value: ANY, label: 'Any label' }, ...labelOptions]} value={value.label} onValueChange={(v) => set({ label: v })} />
      </Field>
      <Field label="Priority" hideLabel className="w-[calc(50%-4px)] sm:w-36">
        <Select options={[{ value: ANY, label: 'Any priority' }, ...priorityOptions]} value={value.priority} onValueChange={(v) => set({ priority: v })} />
      </Field>
      {isFiltered(value) && <Button icon="close" onClick={() => onChange(emptyFilters)}>Clear filters</Button>}
    </div>
  );
}
