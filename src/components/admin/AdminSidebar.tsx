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
  TableProperties,
  ArrowLeft,
  LogOut,
  X
} from 'lucide-react';
import { FootballPortalLogo } from '@/components/common/FootballPortalLogo';
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
    label: 'Dashboard',
    href: '/admin',
    icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
  },
  {
    label: 'Teams',
    href: '/admin/teams',
    icon: <Shield className="w-5 h-5 shrink-0" />,
  },
  {
    label: 'Players',
    href: '/admin/players',
    icon: <Users className="w-5 h-5 shrink-0" />,
  },
  {
    label: 'Matches',
    href: '/admin/schedule',
    icon: <Calendar className="w-5 h-5 shrink-0" />,
  },
  {
    label: 'Live Control',
    href: '/admin/live-control',
    icon: <Radio className="w-5 h-5 shrink-0" />,
    badge: 'LIVE',
    isLive: true,
  },
  {
    label: 'Top Scorers',
    href: '/admin/top-scorers',
    icon: <Trophy className="w-5 h-5 shrink-0" />,
  },
  {
    label: 'Standings',
    href: '/admin/standings',
    icon: <TableProperties className="w-5 h-5 shrink-0" />,
  },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();

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
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200/80 shadow-2xl lg:shadow-xs z-40 flex flex-col justify-between select-none transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand Header with FootballPortalLogo */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200/80">
            <Link href="/admin" onClick={handleNavClick} className="flex items-center">
              <FootballPortalLogo size="md" />
            </Link>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items (Screen 3) */}
          <div className="px-3.5 py-4 overflow-y-auto">
            <nav className="flex flex-col gap-1.5">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98] ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={active ? 'text-white' : 'text-slate-500'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-extrabold tracking-wider ${
                          active
                            ? 'bg-white/20 text-white'
                            : item.isLive
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.isLive && (
                          <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white' : 'bg-rose-600'} animate-pulse`}></span>
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

        {/* Footer Area: Logout & Back to Public Portal (Screen 3) */}
        <div className="p-4 border-t border-slate-200/80 flex flex-col gap-2">
          {/* Logout Button (Screen 3: Red Logout) */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors px-3 py-2.5 rounded-xl w-full text-left"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>

          {/* Back link */}
          <Link
            href="/"
            onClick={handleNavClick}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors px-3 py-2 rounded-xl hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Back to Public Portal</span>
          </Link>
        </div>
      </aside>
    </>
  );
};
