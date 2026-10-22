import { useState, type FormEvent } from 'react';
import { Button, Combobox, Dialog, Field, NumberInput, Select, useToast } from '@krackedui/motion';
import { cardholders } from '../data/team';
import { formatMoney } from '../lib/format';
import { useStore } from '../state/store';

const MIN_LIMIT = 100;
const MAX_LIMIT = 50_000;
const holderOptions = cardholders.map((name) => ({ value: name, label: name }));
const typeOptions = [
  { value: 'virtual', label: 'Virtual', description: 'Ready to use right away' },
  { value: 'physical', label: 'Physical', description: 'Ships in 5–7 business days' },
];

interface Errors { holder?: string; limit?: string }

/** "Issue card" button + dialog form: cardholder, monthly limit (currency) and card type, validated on submit. */
export function IssueCardDialog() {
  const { state, dispatch } = useStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [holder, setHolder] = useState('');
  const [limit, setLimit] = useState<number | null>(null);
  const [type, setType] = useState('virtual');
  const [errors, setErrors] = useState<Errors>({});

  const reset = () => { setHolder(''); setLimit(null); setType('virtual'); setErrors({}); };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!holder) next.holder = 'Choose who the card is for.';
    if (limit === null) next.limit = 'Enter a monthly limit.';
    else if (limit < MIN_LIMIT || limit > MAX_LIMIT) next.limit = `Limit must be between ${formatMoney(MIN_LIMIT, { whole: true })} and ${formatMoney(MAX_LIMIT, { whole: true })}.`;
    setErrors(next);
    if (next.holder || next.limit || limit === null) return;
    const last4 = String(3100 + state.cards.length * 1371).slice(-4);
    dispatch({ type: 'card/issue', card: { id: `card_${state.cards.length + 1}`, holder, last4, limit, spent: 0, status: 'Active' } });
    toast({ message: `${type === 'virtual' ? 'Virtual' : 'Physical'} card issued`, description: `${holder} •• ${last4}, ${formatMoney(limit, { whole: true })} a month.`, tone: 'success' });
    setOpen(false);
    reset();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <Dialog.Trigger asChild><Button variant="primary" icon="plus">Issue card</Button></Dialog.Trigger>
      <Dialog.Content size="sm">
        <Dialog.Title>Issue a card</Dialog.Title>
        <Dialog.Description>New cards start active. You can freeze them at any time.</Dialog.Description>
        <form noValidate onSubmit={submit} className="flex flex-col gap-4 pt-2">
          <Field label="Cardholder" required error={errors.holder}>
            <Combobox
              options={holderOptions}
              value={holder}
              onValueChange={(v) => { setHolder(v); setErrors((er) => ({ ...er, holder: undefined })); }}
              placeholder="Choose a person"
              searchPlaceholder="Search people"
            />
          </Field>
          <Field label="Monthly limit" required error={errors.limit} description={`Between ${formatMoney(MIN_LIMIT, { whole: true })} and ${formatMoney(MAX_LIMIT, { whole: true })}.`}>
            <NumberInput
              value={limit}
              onValueChange={(v) => { setLimit(v); setErrors((er) => ({ ...er, limit: undefined })); }}
              format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
              step={100}
              placeholder="$0"
            />
          </Field>
          <Field label="Card type">
            <Select options={typeOptions} value={type} onValueChange={setType} />
          </Field>
          <Dialog.Footer>
            <Dialog.Close asChild><Button variant="secondary">Cancel</Button></Dialog.Close>
            <Button variant="primary" type="submit">Issue card</Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
