'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Radio, Zap, LogOut } from 'lucide-react';
import { FootballPortalLogo } from '@/components/common/FootballPortalLogo';
import { authService } from '@/services/auth.service';

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  onQuickAction?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
  const router = useRouter();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 z-30 flex items-center justify-between px-4 sm:px-6 gap-3 select-none transition-all duration-300 shadow-2xs">
      {/* Left: Mobile Toggle & Admin Panel Branding */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="lg:hidden">
            <FootballPortalLogo size="sm" showText={false} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800 text-base md:text-lg tracking-tight">
              Admin Panel
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              Console
            </span>
          </div>
        </div>
      </div>

      {/* Right: Live Desk Pill & Admin Profile Badge (Screen 3) */}
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {/* Live Desk Shortcut */}
        <Link
          href="/admin/live-control"
          className="hidden sm:inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95"
        >
          <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
          <span>Live Desk</span>
        </Link>

        {/* User Profile Pill (Screen 3: Blue circular A + Admin / Administrator) */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs shrink-0 ring-2 ring-blue-100">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-black text-slate-800 leading-tight">
              {user?.fullName || 'Admin'}
            </span>
            <span className="text-[10px] font-medium text-slate-500 leading-tight">
              Administrator
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
