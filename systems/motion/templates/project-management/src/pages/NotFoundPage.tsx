import { Button, EmptyState } from '@krackedui/motion';
import { href } from '../lib/router';
import { ScreenLayout } from '../components/ScreenLayout';

export function NotFoundPage({ what }: { what: string }) {
  return (
    <ScreenLayout title="Not found">
      <EmptyState
        icon="magnifyingGlass"
        title={`${what} does not exist`}
        description="It may have been deleted, or the link is wrong."
        action={<Button variant="secondary" asChild><a href={href({ name: 'home' })}>Go to My work</a></Button>}
      />
    </ScreenLayout>
  );
}
