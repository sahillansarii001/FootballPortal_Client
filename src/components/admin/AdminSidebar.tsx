'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Trophy,
  Shield,
  Users,
  Calendar,
  Radio,
  FileCheck2,
  TableProperties,
  Settings,
  ArrowLeft,
  LogOut,
  UserCheck,
  X
} from 'lucide-react';
import { authService } from '@/services/auth.service';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  isLive?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Overview',
    href: '/admin',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'Live Match Control',
    href: '/admin/live-control',
    icon: <Radio className="w-5 h-5 text-primary-container" />,
    badge: 'LIVE',
    isLive: true,
  },
  {
    label: 'Match Schedule',
    href: '/admin/schedule',
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    label: 'Teams & Rosters',
    href: '/admin/teams',
    icon: <Shield className="w-5 h-5" />,
  },
  {
    label: 'Players Management',
    href: '/admin/players',
    icon: <Users className="w-5 h-5 text-primary-container" />,
  },
  {
    label: 'Top Scorers',
    href: '/admin/top-scorers',
    icon: <Trophy className="w-5 h-5 text-amber-500" />,
    badge: 'GOLDEN BOOT',
  },
  {
    label: 'Point Table',
    href: '/admin/standings',
    icon: <TableProperties className="w-5 h-5" />,
  },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay with smooth fade */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-surface-container-high shadow-2xl lg:shadow-xs z-50 flex flex-col justify-between select-none transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-surface-container-high">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-container text-white flex items-center justify-center font-display-score text-base font-black shadow-xs shrink-0">
                VK
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-sm leading-tight text-on-surface font-extrabold tracking-tight">
                  LEAGUE ADMIN
                </span>
                <span className="font-label-caps text-[10px] text-primary-container uppercase font-bold tracking-wider">
                  Super Admin Console
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <div className="px-3.5 py-4 overflow-y-auto">
            <div className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold tracking-wider px-2 mb-2">
              Operations Console
            </div>
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-label-ui text-xs font-semibold transition-all active:scale-[0.98] ${
                      active
                        ? 'bg-emerald-50 text-primary-container font-bold shadow-xs'
                        : 'text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`flex items-center gap-1 font-label-caps text-[10px] px-2 py-0.5 rounded-full font-extrabold tracking-wider ${
                          item.isLive
                            ? 'bg-emerald-100 text-primary-container ring-1 ring-primary-container/30'
                            : 'bg-surface-container text-on-surface'
                        }`}
                      >
                        {item.isLive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
                        )}
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Area: Back to Public & Admin Profile */}
        <div className="p-4 border-t border-surface-container-high flex flex-col gap-3">
          {/* Back link */}
          <Link
            href="/"
            onClick={handleNavClick}
            className="flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-primary-container transition-colors px-2 py-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Public Portal</span>
          </Link>

          {/* Admin User Card */}
          <div className="bg-surface-container-low p-3 rounded-xl border border-surface-container flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-primary-container flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-emerald-300">
                AD
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-on-surface truncate">
                  {user?.fullName || 'Super Admin'}
                </span>
                <span className="text-[10px] text-primary-container font-semibold truncate">
                  {user?.email || 'admin@footballportal.com'}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
