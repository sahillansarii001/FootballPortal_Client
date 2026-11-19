import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Varsity Football League | Inter-College Championship 2025',
  description: 'Official tournament portal for the 2025 Inter-College Football Championship. Live match tracker, real-time scorelines, penalty shootouts, verified standings, and team rosters.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface font-sans flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 w-full pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
