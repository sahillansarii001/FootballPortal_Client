'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Trophy, Zap, Bell, CheckCircle2, Radio, Activity } from 'lucide-react';
import { authService } from '@/services/auth.service';

interface AdminHeaderProps {
  onQuickAction?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onQuickAction }) => {
  const user = authService.getCurrentUser();

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest border-b border-surface-container-high z-40 flex items-center justify-between px-6 gap-4 select-none">
      {/* Left: Global Search & Active Tournament */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
          <input
            type="text"
            placeholder="Search matches, teams, rosters, officials..."
            className="w-full pl-9 pr-4 py-1.5 bg-surface text-xs text-on-surface rounded-xl border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
          />
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-surface-container-high/60 px-3 py-1.5 rounded-xl border border-surface-container-high text-xs shrink-0">
          <Trophy className="w-3.5 h-3.5 text-primary-container" />
          <span className="font-semibold text-on-surface">2026 Inter-College Spring Cup</span>
        </div>
      </div>

      {/* Right: Telemetry & Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Telemetry pill */}
        <div className="hidden lg:flex items-center gap-2 bg-emerald-50 text-primary-container px-3 py-1 rounded-full text-[11px] font-bold border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
          <span>LIVE TELEMETRY ACTIVE</span>
        </div>

        {/* Quick Action Button */}
        <Link
          href="/admin/live-control"
          className="flex items-center gap-1.5 bg-primary-container hover:bg-primary text-on-primary px-3.5 py-1.5 rounded-xl font-label-ui text-xs font-bold shadow-xs transition-all active:scale-95"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Live Match Control</span>
        </Link>
      </div>
    </header>
  );
};
