import { useState } from 'react';
import { Badge, Card, ConfirmDialog, Grid, Progress, Switch, useToast } from '@krackedui/motion';
import { Page } from '../components/Page';
import { IssueCardDialog } from '../components/IssueCardDialog';
import type { CompanyCard } from '../data/types';
import { useStore } from '../state/store';
import { formatMoney } from '../lib/format';

function spendTone(c: CompanyCard) {
  const ratio = c.spent / c.limit;
  return ratio > 1 ? 'danger' : ratio >= 0.8 ? 'warning' : 'accent';
}

export function CardsPage() {
  const { state, dispatch } = useStore();
  const { toast } = useToast();
  const [freezing, setFreezing] = useState<CompanyCard | null>(null);
  const totalLimit = state.cards.reduce((s, c) => s + c.limit, 0);
  const totalSpent = state.cards.reduce((s, c) => s + c.spent, 0);

  const setStatus = (card: CompanyCard, status: CompanyCard['status']) => {
    dispatch({ type: 'card/status', id: card.id, status });
    toast({ message: status === 'Frozen' ? `Card •• ${card.last4} frozen` : `Card •• ${card.last4} unfrozen`, tone: 'success' });
  };

  return (
    <Page
      title="Cards"
      description={`${state.cards.length} cards · ${formatMoney(totalSpent)} spent of ${formatMoney(totalLimit, { whole: true })} this month`}
      actions={<IssueCardDialog />}
    >
      <Grid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
        {state.cards.map((c) => {
          const frozen = c.status === 'Frozen';
          return (
            <Card.Root key={c.id}>
              <Card.Header>
                <div className="flex items-center justify-between gap-2">
                  <Card.Title asChild><h2>{c.holder}</h2></Card.Title>
                  <Badge tone={frozen ? 'info' : 'success'}>{c.status}</Badge>
                </div>
                <Card.Description>Card •• {c.last4}</Card.Description>
              </Card.Header>
              <Card.Content>
                <Progress
                  label="Spent this month"
                  value={c.spent}
                  max={c.limit}
                  tone={spendTone(c)}
                  valueText={`${formatMoney(c.spent)} of ${formatMoney(c.limit, { whole: true })}`}
                  description={`${formatMoney(Math.max(0, c.limit - c.spent))} available`}
                />
              </Card.Content>
              <Card.Footer>
                <Switch
                  label="Freeze card"
                  checked={frozen}
                  onCheckedChange={(on) => (on ? setFreezing(c) : setStatus(c, 'Active'))}
                />
              </Card.Footer>
            </Card.Root>
          );
        })}
      </Grid>
      <ConfirmDialog
        open={!!freezing}
        onOpenChange={(o) => { if (!o) setFreezing(null); }}
        title={`Freeze card •• ${freezing?.last4 ?? ''}?`}
        description={`${freezing?.holder ?? 'The cardholder'} won't be able to make purchases until you unfreeze it. Pending charges still go through.`}
        confirmLabel="Freeze card"
        destructive
        onConfirm={() => { if (freezing) setStatus(freezing, 'Frozen'); }}
      />
    </Page>
  );
}
