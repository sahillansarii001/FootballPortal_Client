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
    <div className="min-h-screen bg-surface flex flex-col">
      <AdminSidebar />
      <AdminHeader />
      <main className="pl-64 pt-16 flex-1 w-full bg-surface">
        {children}
      </main>
    </div>
  );
}
