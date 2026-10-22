import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ThemeProvider, themeInitScript } from '@/components/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'Motion Docs',
  description: 'Internal design-system documentation. Not for public deployment.',
  robots: { index: false, follow: false },
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
