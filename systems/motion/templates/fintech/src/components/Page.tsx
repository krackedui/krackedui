import type { ReactNode } from 'react';
import { PageHeader, PageLayout } from '@krackedui/motion';

interface PageProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

/** Every screen: Motion's app page layout (scrolling main column) with a compact header. */
export function Page({ title, description, actions, children }: PageProps) {
  return (
    <PageLayout variant="app" header={<PageHeader title={title} description={description} actions={actions} />}>
      {children}
    </PageLayout>
  );
}
