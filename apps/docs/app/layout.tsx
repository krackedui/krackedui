import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ThemeProvider, themeInitScript } from '@/components/theme';
import { rootDomain } from '@/systems-meta';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(`https://${rootDomain}`),
  title: 'KrackedUI',
  description: 'Production-ready React design systems, each with its own character, held to one standard.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
