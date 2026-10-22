import { useState, type FormEvent } from 'react';
import { Button, Field, NumberInput, Progress, toneText, useToast } from '@krackedui/motion';
import type { Budget } from '../data/types';
import { budgetTone } from '../data/budgets';
import { formatMoney } from '../lib/format';
import { useStore } from '../state/store';
import { CategoryTag } from './TransactionBits';

/** One budget: spent vs limit with a tone, and an inline editor for the limit. */
export function BudgetRow({ budget }: { budget: Budget }) {
  const { dispatch } = useStore();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<number | null>(budget.limit);
  const [error, setError] = useState<string>();
  const tone = budgetTone(budget);
  const left = budget.limit - budget.spent;

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (draft === null || draft <= 0) { setError('Enter a limit above $0.'); return; }
    dispatch({ type: 'budget/limit', category: budget.category, limit: draft });
    toast({ message: `${budget.category} budget set to ${formatMoney(draft, { whole: true })}`, tone: 'success' });
    setEditing(false);
  };

  return (
    <li className="flex flex-col gap-3 border-b border-n-border-secondary py-4 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CategoryTag category={budget.category} />
        {!editing && (
          <Button size="sm" variant="ghost" icon="edit" onClick={() => { setDraft(budget.limit); setError(undefined); setEditing(true); }} aria-label={`Edit ${budget.category} limit`}>
            Edit limit
          </Button>
        )}
      </div>
      <Progress
        label={`${budget.category} budget`}
        hideValue={false}
        value={budget.spent}
        max={budget.limit}
        tone={tone}
        valueText={`${formatMoney(budget.spent)} of ${formatMoney(budget.limit, { whole: true })}`}
        description={
          <span className={left < 0 ? toneText.danger : undefined}>
            {left < 0 ? `${formatMoney(-left)} over budget` : `${formatMoney(left)} left · ${Math.round((budget.spent / budget.limit) * 100)}% used`}
          </span>
        }
      />
      {editing && (
        <form onSubmit={save} noValidate className="flex flex-wrap items-end gap-2">
          <Field label={`${budget.category} monthly limit`} error={error} className="min-w-[180px] flex-1">
            <NumberInput
              autoFocus
              value={draft}
              onValueChange={(v) => { setDraft(v); setError(undefined); }}
              min={0}
              step={100}
              format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
            />
          </Field>
          <div className="flex gap-2 pb-px">
            <Button size="md" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
            <Button size="md" variant="primary" type="submit">Save</Button>
          </div>
        </form>
      )}
    </li>
  );
}
