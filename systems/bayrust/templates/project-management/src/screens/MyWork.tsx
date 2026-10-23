import {
  Avatar, Badge, CardContent, CardHeader, CardRoot, CardTitle, Grid, PageHeader, Stack, Stat, Table,
} from '@krackedui/bayrust';
import { activity, me, parseDay, today, type Status, type Task } from '../data';
import { day, due } from '../format';
import { go } from '../router';

const STATUS_TONE: Record<Status, 'neutral' | 'info' | 'accent' | 'warning' | 'success'> = {
  Backlog: 'neutral', 'To do': 'info', 'In progress': 'accent', 'In review': 'warning', Done: 'success',
};

export function MyWork({ tasks }: { tasks: Task[] }) {
  const mine = tasks.filter((t) => t.assignee === me.name);
  const t0 = today();
  const inDays = (iso: string) => Math.round((parseDay(iso).getTime() - new Date(t0.getFullYear(), t0.getMonth(), t0.getDate()).getTime()) / 86_400_000);
  const overdue = mine.filter((t) => t.due && t.status !== 'Done' && inDays(t.due) < 0);
  const thisWeek = mine.filter((t) => t.due && t.status !== 'Done' && inDays(t.due) >= 0 && inDays(t.due) <= 7);
  const doneThisWeek = mine.filter((t) => t.status === 'Done');

  const grouped = (['In progress', 'In review', 'To do', 'Backlog', 'Done'] as Status[])
    .map((status) => ({ status, items: mine.filter((t) => t.status === status) }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <PageHeader title={`Good morning, ${me.name.split(' ')[0]}`} description="What is on you this week." />
      <Stack gap={12}>
        <Grid columns={{ base: 2, lg: 4 }} gap={10}>
          <CardRoot><CardContent><Stat label="Assigned" value={String(mine.length)} /></CardContent></CardRoot>
          <CardRoot><CardContent><Stat label="Due this week" value={String(thisWeek.length)} /></CardContent></CardRoot>
          <CardRoot><CardContent><Stat label="Overdue" value={String(overdue.length)} trend={overdue.length > 0 ? 'up' : 'flat'} upIsGood={false} /></CardContent></CardRoot>
          <CardRoot><CardContent><Stat label="Done" value={String(doneThisWeek.length)} trend="up" /></CardContent></CardRoot>
        </Grid>

        <Grid columns={{ base: 1, lg: 2 }} gap={10}>
          <Stack gap={10}>
            {grouped.map((group) => (
              <CardRoot key={group.status}>
                <CardHeader>
                  <CardTitle>{group.status}</CardTitle>
                  <Badge tone={STATUS_TONE[group.status]}>{group.items.length}</Badge>
                </CardHeader>
                <CardContent>
                  <Table.Root>
                    <Table.Body>
                      {group.items.map((t) => {
                        const d = t.due ? due(t.due) : null;
                        return (
                          <Table.Row key={t.id} onClick={() => go(`/tasks/${t.id}`)}>
                            <Table.Cell>{t.id}</Table.Cell>
                            <Table.Cell>{t.title}</Table.Cell>
                            <Table.Cell align="end">{t.priority}</Table.Cell>
                            <Table.Cell align="end">
                              {d && <Badge tone={d.overdue ? 'danger' : d.soon ? 'warning' : 'neutral'}>{d.text}</Badge>}
                            </Table.Cell>
                          </Table.Row>
                        );
                      })}
                    </Table.Body>
                  </Table.Root>
                </CardContent>
              </CardRoot>
            ))}
          </Stack>

          <Stack gap={10}>
            <CardRoot>
              <CardHeader><CardTitle>Upcoming deadlines</CardTitle></CardHeader>
              <CardContent>
                <Table.Root>
                  <Table.Body>
                    {thisWeek.slice(0, 6).map((t) => (
                      <Table.Row key={t.id}>
                        <Table.Cell>{t.title}</Table.Cell>
                        <Table.Cell align="end">{day(t.due)}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </CardContent>
            </CardRoot>

            <CardRoot>
              <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
              <CardContent>
                <Stack gap={8}>
                  {activity.slice(0, 8).map((a) => (
                    <Stack key={a.id} direction="row" gap={8} align="center">
                      <Avatar name={a.who} size="xs" />
                      <span>
                        <strong>{a.who}</strong> {a.what} {a.taskId}
                      </span>
                      <span>{day(a.when)}</span>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </CardRoot>
          </Stack>
        </Grid>
      </Stack>
    </>
  );
}
