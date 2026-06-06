import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'NextRound — AI Interview Preparation', template: '%s | NextRound' },
  description: 'Practice interviews with AI. Get detailed feedback. Land your next role.',
  keywords: ['interview prep', 'AI interview', 'mock interview', 'software engineering'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'NextRound',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
