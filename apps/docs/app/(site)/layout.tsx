// KrackedUI site (krackedui.com): landing page and marketplace. Docs live under /[system].
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import './site.css';

export const metadata: Metadata = {
  title: { default: 'KrackedUI: design systems that speak the same language', template: '%s · KrackedUI' },
  description:
    'A marketplace of React design systems built to one shared component contract. Learn one, use them all: swap the look by changing an import.',
};

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="kui flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--kui-surface)] focus:px-3 focus:py-2">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
