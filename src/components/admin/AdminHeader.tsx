'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Trophy, Zap, Menu } from 'lucide-react';
import { authService } from '@/services/auth.service';

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  onQuickAction?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar, onQuickAction }) => {
  const user = authService.getCurrentUser();

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface-container-lowest border-b border-surface-container-high z-30 flex items-center justify-between px-3 sm:px-6 gap-2 sm:gap-4 select-none transition-all duration-300">
      {/* Left: Hamburger menu (mobile) & Global Search & Active Tournament */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative flex-1 min-w-[120px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
          <input
            type="text"
            placeholder="Search matches, teams, rosters..."
            className="w-full pl-9 pr-3 py-1.5 bg-surface text-xs text-on-surface rounded-xl border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
          />
        </div>

        <div className="hidden md:flex items-center gap-1.5 bg-surface-container-high/60 px-3 py-1.5 rounded-xl border border-surface-container-high text-xs shrink-0">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-semibold text-on-surface">Alliance Premier League — Season 9</span>
        </div>
      </div>

      {/* Right: Telemetry & Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Telemetry pill */}
        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-primary-container px-3 py-1 rounded-full text-[11px] font-bold border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
          <span className="hidden md:inline">LIVE TELEMETRY ACTIVE</span>
          <span className="md:hidden">LIVE</span>
        </div>

        {/* Quick Action Button */}
        <Link
          href="/admin/live-control"
          className="flex items-center gap-1.5 bg-primary-container hover:bg-primary text-white px-2.5 sm:px-3.5 py-1.5 rounded-xl font-label-ui text-xs font-bold shadow-xs transition-all active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 fill-white" />
          <span className="hidden sm:inline">Live Match Control</span>
          <span className="sm:hidden">Live Control</span>
        </Link>
      </div>
    </header>
  );
};
