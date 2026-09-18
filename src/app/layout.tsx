import type { Metadata } from 'next';
import { JetBrains_Mono, Inter } from 'next/font/google';
import './globals.css';
import TerminalShell from '@/components/terminal/TerminalShell';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'ARUS Terminal — IDX Capital Flow Intelligence',
  description:
    'Professional-grade capital flow intelligence terminal for the Indonesia Stock Exchange. Track smart money flows, accumulation scores, sector rotation, and price-flow divergence signals.',
  keywords: ['IDX', 'Indonesia Stock Exchange', 'capital flow', 'smart money', 'SMFI', 'trading terminal'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className={`${jetbrainsMono.variable} ${inter.variable}`}>
      <body>
        <TerminalShell>{children}</TerminalShell>
      </body>
    </html>
  );
}
