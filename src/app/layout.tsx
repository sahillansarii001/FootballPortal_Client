import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Varsity Football League | Inter-College Championship 2026',
  description: 'Official tournament portal for the 2026 Inter-College Football Championship. Live match tracker, real-time scorelines, penalty shootouts, verified standings, and team rosters.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface font-sans flex flex-col min-h-screen overflow-x-hidden">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
