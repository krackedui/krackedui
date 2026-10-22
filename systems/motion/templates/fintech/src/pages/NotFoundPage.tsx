import { Button, EmptyState } from '@krackedui/motion';
import { Page } from '../components/Page';
import { href } from '../lib/router';

export function NotFoundPage({ path }: { path: string }) {
  return (
    <Page title="Page not found">
      <EmptyState
        icon="magnifyingGlass"
        title={`Nothing at ${path}`}
        description="The page may have moved. Use search (⌘K) or go back to the overview."
        action={<Button variant="secondary" asChild><a href={href({ page: 'overview' })}>Go to Overview</a></Button>}
      />
    </Page>
  );
}
