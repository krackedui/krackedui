import type { ReactNode } from 'react';
import { PageHeader, cn } from '@krackedui/motion';

interface ScreenLayoutProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Full width for boards and timelines; default is a readable 1120 px column. */
  wide?: boolean;
  children: ReactNode;
}

/** Page column with the page header: the frame of every screen. */
export function ScreenLayout({ title, description, actions, wide, children }: ScreenLayoutProps) {
  return (
    <div className={cn('mx-auto flex w-full flex-col gap-6 px-4 pb-16 pt-2 sm:px-8 sm:pt-4', !wide && 'max-w-[1120px]')}>
      <PageHeader size="app" title={title} description={description} actions={actions} className="-mx-2" />
      {children}
    </div>
  );
}
