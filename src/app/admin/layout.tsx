'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { authService, AuthUser } from '@/services/auth.service';
import { LoadingState } from '@/components/common/LoadingState';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    const token = authService.getToken();

    if (!token || !user) {
      // If not logged in, redirect to login
      router.push('/login');
      return;
    }

    setCurrentUser(user);
    setAuthorized(true);
  }, [router]);

  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <LoadingState message="Verifying administrative authority..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col antialiased">
      <AdminSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <AdminHeader
        onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
      />
      <main className="lg:pl-64 pl-0 pt-16 flex-1 w-full bg-surface transition-all duration-300 ease-in-out overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
