'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login';

  if (isAuthPage) {
    return (
      <main className="w-full h-screen max-h-screen overflow-hidden bg-surface flex flex-col select-none">
        {children}
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full pt-16">{children}</main>
      <Footer />
    </>
  );
};
