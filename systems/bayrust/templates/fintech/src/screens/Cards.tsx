import { useState } from 'react';
import {
  Badge, Button, CardContent, CardRoot, Combobox, ConfirmDialog, Dialog, Field, Grid, NumberInput,
  PageHeader, Progress, Stack, Switch, useToast,
} from '@krackedui/bayrust';
import { cards as seed, team } from '../data';
import { money } from '../format';

export function Cards() {
  const { toast } = useToast();
  const [cards, setCards] = useState(seed);
  const [freezing, setFreezing] = useState<string | null>(null);
  const [issuing, setIssuing] = useState(false);
  const [holder, setHolder] = useState('');
  const [limit, setLimit] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);

  const card = cards.find((c) => c.id === freezing);
  const holderError = touched && !holder ? 'Choose who the card is for.' : undefined;
  const limitError = touched && (limit === null || limit <= 0) ? 'Set a limit above zero.' : undefined;

  const issue = () => {
    setTouched(true);
    if (!holder || limit === null || limit <= 0) return;
    setCards((list) => [
      ...list,
      { id: `c${list.length + 1}`, holder, last4: String(1000 + list.length * 7).slice(-4), limit, spent: 0, status: 'Active' },
    ]);
    toast({ message: 'Card issued', description: holder, tone: 'success' });
    setIssuing(false);
    setHolder('');
    setLimit(null);
    setTouched(false);
  };

  const setStatus = (id: string, status: 'Active' | 'Frozen') => {
    setCards((list) => list.map((c) => (c.id === id ? { ...c, status } : c)));
    toast({ message: status === 'Frozen' ? 'Card frozen' : 'Card unfrozen', tone: status === 'Frozen' ? 'neutral' : 'success' });
  };

  return (
    <>
      <PageHeader
        title="Cards"
        description="Four cards on the Operating account."
        actions={<Button variant="primary" icon="plus" onClick={() => setIssuing(true)}>Issue card</Button>}
      />

      <Grid columns={{ base: 1, md: 2 }} gap={10}>
        {cards.map((c) => {
          const ratio = c.spent / c.limit;
          return (
            <CardRoot key={c.id}>
              <CardContent>
                <Stack gap={8}>
                  <Stack direction="row" justify="between" align="center">
                    <strong>{c.holder}</strong>
                    <Badge tone={c.status === 'Active' ? 'success' : 'neutral'}>{c.status}</Badge>
                  </Stack>
                  <span>•••• {c.last4}</span>
                  <Progress
                    value={Math.min(100, Math.round(ratio * 100))}
                    label={`${c.holder}: ${money(c.spent)} of ${money(c.limit)}`}
                    tone={ratio > 1 ? 'danger' : ratio >= 0.8 ? 'warning' : 'accent'}
                  />
                  <span>
                    {money(c.spent)} of {money(c.limit)} this month
                  </span>
                  <Switch
                    label="Frozen"
                    checked={c.status === 'Frozen'}
                    onCheckedChange={(next) => {
                      if (next) setFreezing(c.id);
                      else setStatus(c.id, 'Active');
                    }}
                  />
                </Stack>
              </CardContent>
            </CardRoot>
          );
        })}
      </Grid>

      <ConfirmDialog
        open={freezing !== null}
        onOpenChange={(v) => !v && setFreezing(null)}
        title={`Freeze ${card?.holder ?? ''}'s card?`}
        description="Payments on this card will be declined until it is unfrozen."
        confirmLabel="Freeze card"
        destructive
        onConfirm={() => {
          if (freezing) setStatus(freezing, 'Frozen');
          setFreezing(null);
        }}
      />

      <Dialog.Root open={issuing} onOpenChange={setIssuing}>
        <Dialog.Content>
          <Dialog.Title>Issue a card</Dialog.Title>
          <Dialog.Description>The card is active as soon as it is issued.</Dialog.Description>
          <Stack gap={10}>
            <Field label="Card holder" error={holderError} required>
              <Combobox
                label="Card holder"
                value={holder}
                onValueChange={setHolder}
                placeholder="Choose a person"
                options={team.map((t) => ({ value: t.name, label: t.name, description: t.role }))}
              />
            </Field>
            <Field label="Monthly limit" error={limitError} required>
              <NumberInput
                aria-label="Monthly limit"
                min={0}
                step={500}
                value={limit}
                onValueChange={setLimit}
                format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
              />
            </Field>
          </Stack>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button>Cancel</Button>
            </Dialog.Close>
            <Button variant="primary" onClick={issue}>
              Issue card
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
