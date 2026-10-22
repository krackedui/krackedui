import { useState, type FormEvent } from 'react';
import {
  Alert, Button, Card, DatePicker, EmptyState, Field, NumberInput, Radio, RadioGroup, Select, Steps, TextInput, useToast,
} from '@krackedui/motion';
import type { AccountId } from '../data/types';
import { accounts, accountById } from '../data/accounts';
import { payees, payeeById } from '../data/payees';
import { TODAY } from '../data/company';
import { addDays, toIsoDate } from '../lib/dates';
import { formatLongDate, formatMoney } from '../lib/format';
import { useStore } from '../state/store';

const steps = [
  { label: 'Payee' },
  { label: 'Details', description: 'Amount, account, date' },
  { label: 'Review' },
];

const accountOptions = accounts.map((a) => ({ value: a.id, label: `${a.name} •• ${a.last4}`, description: `${formatMoney(a.balance)} available` }));

interface Draft { payeeId: string; amount: number | null; account: AccountId; date: Date | null; memo: string }
type Errors = Partial<Record<'payeeId' | 'amount' | 'date', string>>;

const emptyDraft: Draft = { payeeId: '', amount: null, account: 'operating', date: addDays(TODAY, 1), memo: '' };

function validate(step: number, d: Draft): Errors {
  const e: Errors = {};
  if (step === 0 && !d.payeeId) e.payeeId = 'Choose who to pay.';
  if (step === 1) {
    const balance = accountById[d.account].balance;
    if (d.amount === null) e.amount = 'Enter an amount.';
    else if (d.amount <= 0) e.amount = 'The amount must be more than $0.';
    else if (d.amount > balance) e.amount = `That's more than the ${accountById[d.account].name} balance (${formatMoney(balance)}).`;
    if (!d.date) e.date = 'Choose a payment date.';
  }
  return e;
}

/** Multi-step "New payment" form: payee → amount, account and date → review → confirmation. */
export function NewPaymentForm() {
  const { state, dispatch } = useStore();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState<string | null>(null);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const next = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(step, draft);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    if (step < 2) { setStep(step + 1); return; }
    const id = `pay_${state.scheduled.length + 1}_${draft.payeeId}`;
    dispatch({ type: 'payment/schedule', payment: { id, payeeId: draft.payeeId, amount: draft.amount ?? 0, account: draft.account, date: toIsoDate(draft.date ?? TODAY), memo: draft.memo } });
    toast({ message: 'Payment scheduled', description: `${formatMoney(draft.amount ?? 0)} to ${payeeById[draft.payeeId].name}.`, tone: 'success' });
    setDone(id);
  };

  const restart = () => { setDraft(emptyDraft); setErrors({}); setStep(0); setDone(null); };

  if (done) {
    return (
      <Card.Root>
        <Card.Content>
          <EmptyState
            icon="checkmarkCircle"
            title="Payment scheduled"
            description={`${formatMoney(draft.amount ?? 0)} to ${payeeById[draft.payeeId].name} on ${formatLongDate(toIsoDate(draft.date ?? TODAY))}. You can cancel it until then.`}
            action={<Button variant="primary" onClick={restart}>Make another payment</Button>}
          />
        </Card.Content>
      </Card.Root>
    );
  }

  const payee = payeeById[draft.payeeId];
  const account = accountById[draft.account];

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title asChild><h2>New payment</h2></Card.Title>
        <Card.Description>Pay a vendor from one of your accounts.</Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-5">
        <Steps steps={steps} current={step} label="Payment steps" />
        <form noValidate onSubmit={next} className="flex flex-col gap-4" aria-label={`New payment, step ${step + 1} of ${steps.length}: ${steps[step].label}`}>
          {step === 0 && (
            <Field label="Payee" required error={errors.payeeId}>
              <RadioGroup value={draft.payeeId} onValueChange={(v) => set('payeeId', v)} className="grid gap-1 sm:grid-cols-2">
                {payees.map((p) => (
                  <Radio
                    key={p.id}
                    value={p.id}
                    label={<span className="flex flex-col"><span>{p.name}</span><span className="text-n-ui-sm text-n-text-secondary">{p.destination} · {p.category}</span></span>}
                  />
                ))}
              </RadioGroup>
            </Field>
          )}

          {step === 1 && (
            <>
              <Field label="Amount" required error={errors.amount}>
                <NumberInput value={draft.amount} onValueChange={(v) => set('amount', v)} min={0} format={{ style: 'currency', currency: 'USD' }} placeholder="$0.00" />
              </Field>
              <Field label="Pay from" description={`${formatMoney(account.balance)} available`}>
                <Select options={accountOptions} value={draft.account} onValueChange={(v) => { set('account', v as AccountId); setErrors((e) => ({ ...e, amount: undefined })); }} />
              </Field>
              <Field label="Payment date" required error={errors.date}>
                <DatePicker value={draft.date} onValueChange={(v) => set('date', v)} min={TODAY} today={TODAY} />
              </Field>
              <Field label="Memo" description="Shown on the payee's statement.">
                <TextInput value={draft.memo} onChange={(e) => set('memo', e.target.value)} placeholder="Invoice number or note" />
              </Field>
            </>
          )}

          {step === 2 && payee && (
            <>
              <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-n-ui">
                <dt className="text-n-text-secondary">Payee</dt><dd className="m-0">{payee.name} ({payee.destination})</dd>
                <dt className="text-n-text-secondary">Amount</dt><dd className="m-0 font-semibold tabular-nums">{formatMoney(draft.amount ?? 0)}</dd>
                <dt className="text-n-text-secondary">From</dt><dd className="m-0">{account.name} •• {account.last4}</dd>
                <dt className="text-n-text-secondary">Date</dt><dd className="m-0">{formatLongDate(toIsoDate(draft.date ?? TODAY))}</dd>
                <dt className="text-n-text-secondary">Memo</dt><dd className="m-0">{draft.memo || '—'}</dd>
              </dl>
              <Alert tone="info" icon="info">
                {payee.method === 'Wire' ? 'Wires are sent the same day and can’t be recalled.' : 'ACH payments arrive in 1–2 business days.'}
              </Alert>
            </>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button variant="secondary" disabled={step === 0} onClick={() => { setErrors({}); setStep(step - 1); }} icon="arrowLeft">Back</Button>
            <Button variant="primary" type="submit" trailingIcon={step < 2 ? 'arrowRight' : undefined}>
              {step < 2 ? 'Continue' : `Confirm payment`}
            </Button>
          </div>
        </form>
      </Card.Content>
    </Card.Root>
  );
}

