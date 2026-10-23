import { useState } from 'react';
import {
  Alert, Badge, Button, CardContent, CardHeader, CardRoot, CardTitle, Combobox, ConfirmDialog,
  DatePicker, EmptyState, Field, NumberInput, PageHeader, Select, Stack, Table, useToast,
} from '@krackedui/bayrust';
import { accounts, payees, scheduled as seed } from '../data';
import { day, moneyExact } from '../format';

type Step = 'payee' | 'details' | 'review' | 'done';
const STEPS: Step[] = ['payee', 'details', 'review'];
const TITLE: Record<Step, string> = { payee: 'Who is being paid', details: 'How much, and when', review: 'Check it over', done: 'Sent' };

export function Payments() {
  const { toast } = useToast();
  const [rows, setRows] = useState(seed);
  const [step, setStep] = useState<Step>('payee');
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState<number | null>(null);
  const [accountId, setAccountId] = useState(accounts[0].id);
  const [date, setDate] = useState<Date | null>(null);
  const [touched, setTouched] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const account = accounts.find((a) => a.id === accountId) ?? accounts[0];
  const payeeError = touched && !payee ? 'Choose a payee.' : undefined;
  const amountError =
    touched && (amount === null || amount <= 0)
      ? 'Enter an amount above zero.'
      : amount !== null && amount > account.balance
        ? `That is more than the ${account.name} balance of ${moneyExact(account.balance)}.`
        : undefined;
  const dateError = touched && !date ? 'Choose a date.' : undefined;

  const next = () => {
    setTouched(true);
    if (step === 'payee') {
      if (!payee) return;
      setTouched(false);
      setStep('details');
    } else if (step === 'details') {
      if (amount === null || amount <= 0 || amount > account.balance || !date) return;
      setTouched(false);
      setStep('review');
    }
  };

  const send = () => {
    setRows((list) => [
      ...list,
      { id: `s${list.length + 1}`, payee, amount: amount ?? 0, date: date ? date.toISOString().slice(0, 10) : '', accountId },
    ]);
    toast({ message: 'Payment scheduled', description: `${moneyExact(amount ?? 0)} to ${payee}`, tone: 'success' });
    setStep('done');
  };

  const restart = () => {
    setStep('payee');
    setPayee('');
    setAmount(null);
    setDate(null);
    setTouched(false);
  };

  return (
    <>
      <PageHeader title="Payments" description="Pay a vendor, or look at what is already scheduled." />
      <Stack gap={12}>
        <CardRoot>
          <CardHeader>
            <CardTitle>New payment · {TITLE[step]}</CardTitle>
            {step !== 'done' && (
              <span>
                Step {STEPS.indexOf(step) + 1} of {STEPS.length}
              </span>
            )}
          </CardHeader>
          <CardContent>
            {step === 'done' ? (
              <Stack gap={10}>
                <Alert tone="success" title="Payment scheduled">
                  {moneyExact(amount ?? 0)} to {payee}, from {account.name}.
                </Alert>
                <Button variant="primary" onClick={restart}>
                  Make another payment
                </Button>
              </Stack>
            ) : (
              <Stack gap={12}>
                {step === 'payee' && (
                  <Field label="Payee" error={payeeError} required>
                    <Combobox
                      label="Payee"
                      value={payee}
                      onValueChange={setPayee}
                      placeholder="Choose a vendor"
                      options={payees.map((p) => ({ value: p.name, label: p.name, description: p.account }))}
                    />
                  </Field>
                )}

                {step === 'details' && (
                  <>
                    <Field label="Amount" error={amountError} required>
                      <NumberInput
                        aria-label="Amount"
                        min={0}
                        step={50}
                        value={amount}
                        onValueChange={setAmount}
                        format={{ style: 'currency', currency: 'USD' }}
                      />
                    </Field>
                    <Field label="From account" description={`Balance ${moneyExact(account.balance)}`}>
                      <Select
                        aria-label="From account"
                        value={accountId}
                        onValueChange={setAccountId}
                        options={accounts.map((a) => ({ value: a.id, label: `${a.name} •• ${a.last4}` }))}
                      />
                    </Field>
                    <Field label="Send on" error={dateError} required>
                      <DatePicker label="Send on" value={date} onValueChange={setDate} placeholder="Choose a date" />
                    </Field>
                  </>
                )}

                {step === 'review' && (
                  <Table.Root>
                    <Table.Body>
                      <Table.Row>
                        <Table.Cell>Payee</Table.Cell>
                        <Table.Cell align="end">{payee}</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>Amount</Table.Cell>
                        <Table.Cell align="end">{moneyExact(amount ?? 0)}</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>From</Table.Cell>
                        <Table.Cell align="end">
                          {account.name} •• {account.last4}
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>Send on</Table.Cell>
                        <Table.Cell align="end">{date ? day(date.toISOString().slice(0, 10)) : ''}</Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table.Root>
                )}

                <Stack direction="row" gap={8}>
                  {step !== 'payee' && (
                    <Button onClick={() => setStep(step === 'review' ? 'details' : 'payee')}>Back</Button>
                  )}
                  {step === 'review' ? (
                    <Button variant="primary" onClick={send}>
                      Send payment
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={next}>
                      Continue
                    </Button>
                  )}
                </Stack>
              </Stack>
            )}
          </CardContent>
        </CardRoot>

        <CardRoot>
          <CardHeader>
            <CardTitle>Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <EmptyState icon="send" title="Nothing scheduled" description="Payments you schedule will appear here." />
            ) : (
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Payee</Table.Head>
                    <Table.Head>Date</Table.Head>
                    <Table.Head align="end">Amount</Table.Head>
                    <Table.Head align="end">Action</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {rows.map((s) => (
                    <Table.Row key={s.id}>
                      <Table.Cell>{s.payee}</Table.Cell>
                      <Table.Cell>
                        {s.date ? day(s.date) : <Badge tone="neutral">No date</Badge>}
                      </Table.Cell>
                      <Table.Cell align="end">{moneyExact(s.amount)}</Table.Cell>
                      <Table.Cell align="end">
                        <Button size="sm" onClick={() => setCancelling(s.id)}>
                          Cancel
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </CardContent>
        </CardRoot>
      </Stack>

      <ConfirmDialog
        open={cancelling !== null}
        onOpenChange={(v) => !v && setCancelling(null)}
        title="Cancel this payment?"
        description="It will not be sent. You can schedule it again."
        confirmLabel="Cancel payment"
        cancelLabel="Keep it"
        destructive
        onConfirm={() => {
          setRows((list) => list.filter((s) => s.id !== cancelling));
          toast({ message: 'Payment cancelled', tone: 'neutral' });
          setCancelling(null);
        }}
      />
    </>
  );
}
