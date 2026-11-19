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
  const isAdminPage = pathname.startsWith('/admin');

  if (isAuthPage) {
    return (
      <main className="w-full h-screen max-h-screen overflow-hidden bg-surface flex flex-col select-none">
        {children}
      </main>
    );
  }

  if (isAdminPage) {
    return <div className="w-full min-h-screen bg-surface">{children}</div>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full pt-16">{children}</main>
      <Footer />
    </>
  );
};
