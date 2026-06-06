import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: {
    default: 'NextRound — AI Interview Preparation',
    template: '%s | NextRound',
  },
  description: 'Practice interviews with AI. Get detailed coaching. Walk in confident.',
  keywords: ['interview prep', 'AI interview coach', 'mock interview', 'software engineering'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'NextRound',
    description: 'Practice the interview before it matters.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
