import { useState } from 'react';
import {
  BarChart, Button, CardContent, CardHeader, CardRoot, CardTitle, NumberInput, PageHeader, Progress,
  Stack, Table, useToast,
} from '@krackedui/bayrust';
import { budgets as seed } from '../data';
import { money } from '../format';

export function Budgets() {
  const { toast } = useToast();
  const [budgets, setBudgets] = useState(seed);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<number | null>(null);

  const save = (category: string) => {
    if (draft !== null && draft > 0) {
      setBudgets((list) => list.map((b) => (b.category === category ? { ...b, limit: draft } : b)));
      toast({ message: `${category} budget updated`, description: money(draft), tone: 'success' });
    }
    setEditing(null);
    setDraft(null);
  };

  return (
    <>
      <PageHeader title="Budgets" description="Five categories, this month." />
      <Stack gap={12}>
        <CardRoot>
          <CardHeader>
            <CardTitle>Spend against budget</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={budgets.map((b) => ({ category: b.category, spent: b.spent, limit: b.limit }))}
              index="category"
              series={[{ key: 'spent', label: 'Spent' }, { key: 'limit', label: 'Budget' }]}
              label="Spend against budget by category"
              valueFormat={money}
            />
          </CardContent>
        </CardRoot>

        <CardRoot>
          <CardContent>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Category</Table.Head>
                  <Table.Head>Progress</Table.Head>
                  <Table.Head align="end">Limit</Table.Head>
                  <Table.Head align="end">Action</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {budgets.map((b) => {
                  const ratio = b.spent / b.limit;
                  return (
                    <Table.Row key={b.category}>
                      <Table.Cell>{b.category}</Table.Cell>
                      <Table.Cell>
                        <Stack gap={2}>
                          <Progress
                            value={Math.min(100, Math.round(ratio * 100))}
                            label={`${b.category}: ${money(b.spent)} of ${money(b.limit)}`}
                            tone={ratio > 1 ? 'danger' : ratio >= 0.8 ? 'warning' : 'accent'}
                          />
                          <span>
                            {money(b.spent)} of {money(b.limit)}
                          </span>
                        </Stack>
                      </Table.Cell>
                      <Table.Cell align="end">
                        {editing === b.category ? (
                          <NumberInput
                            aria-label={`${b.category} limit`}
                            min={0}
                            step={500}
                            defaultValue={b.limit}
                            onValueChange={setDraft}
                            format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
                          />
                        ) : (
                          money(b.limit)
                        )}
                      </Table.Cell>
                      <Table.Cell align="end">
                        {editing === b.category ? (
                          <Button size="sm" variant="primary" onClick={() => save(b.category)}>
                            Save
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => { setEditing(b.category); setDraft(b.limit); }}>
                            Edit limit
                          </Button>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
          </CardContent>
        </CardRoot>
      </Stack>
    </>
  );
}
