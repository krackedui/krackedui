import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ThemeProvider, themeInitScript } from '@/components/theme';
import { rootDomain } from '@/systems-meta';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(`https://${rootDomain}`),
  title: 'KrackedUI',
  description: 'React design systems that speak the same language.',
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
