import { useState } from 'react';
import { Button, ConfirmDialog, DataTable, Grid, useToast, type DataTableColumn } from '@krackedui/motion';
import { Page } from '../components/Page';
import { Panel } from '../components/Panel';
import { NewPaymentForm } from '../components/NewPaymentForm';
import type { ScheduledPayment } from '../data/types';
import { payeeById } from '../data/payees';
import { accountById } from '../data/accounts';
import { useStore } from '../state/store';
import { formatMoney, formatShortDate } from '../lib/format';

export function PaymentsPage() {
  const { state, dispatch } = useStore();
  const { toast } = useToast();
  const [cancelling, setCancelling] = useState<ScheduledPayment | null>(null);
  const total = state.scheduled.reduce((s, p) => s + p.amount, 0);

  const columns: DataTableColumn<ScheduledPayment>[] = [
    {
      key: 'payee',
      header: 'Payee',
      sortValue: (p) => payeeById[p.payeeId].name,
      sortable: true,
      cell: (p) => (
        <span className="flex min-w-0 flex-col py-0.5">
          <span>{payeeById[p.payeeId].name}</span>
          <span className="text-n-ui-sm text-n-text-secondary">{p.memo || payeeById[p.payeeId].destination}</span>
        </span>
      ),
    },
    { key: 'date', header: 'Date', sortable: true, cell: (p) => <span className="whitespace-nowrap tabular-nums">{formatShortDate(p.date)}</span> },
    { key: 'account', header: 'From', hideBelow: 'sm', cell: (p) => accountById[p.account].name },
    { key: 'amount', header: 'Amount', sortable: true, align: 'end', cell: (p) => <span className="whitespace-nowrap tabular-nums">{formatMoney(p.amount)}</span> },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'end',
      cell: (p) => <Button size="sm" variant="ghost" onClick={() => setCancelling(p)} aria-label={`Cancel payment to ${payeeById[p.payeeId].name}`}>Cancel</Button>,
    },
  ];

  return (
    <Page title="Payments" description="Pay vendors and manage scheduled payments.">
      <Grid columns={{ base: 1, xl: 2 }} gap={4}>
        <NewPaymentForm />
        <Panel title="Scheduled" description={`${state.scheduled.length} payments · ${formatMoney(total)}`}>
          <DataTable
            label="Scheduled payments"
            columns={columns}
            rows={state.scheduled}
            defaultSort={{ key: 'date', direction: 'asc' }}
            empty="No scheduled payments"
          />
        </Panel>
      </Grid>
      <ConfirmDialog
        open={!!cancelling}
        onOpenChange={(o) => { if (!o) setCancelling(null); }}
        title="Cancel this payment?"
        description={cancelling ? `${formatMoney(cancelling.amount)} to ${payeeById[cancelling.payeeId].name} on ${formatShortDate(cancelling.date)} won't be sent.` : undefined}
        confirmLabel="Cancel payment"
        cancelLabel="Keep it"
        destructive
        onConfirm={() => {
          if (!cancelling) return;
          dispatch({ type: 'payment/cancel', id: cancelling.id });
          toast({ message: 'Payment cancelled', tone: 'success' });
        }}
      />
    </Page>
  );
}
