'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User } from 'lucide-react';
import { cn } from '@/utils/cn';
import { tournamentService } from '@/services/tournament.service';
import { FootballPortalLogo } from '@/components/common/FootballPortalLogo';

interface NavItem {
  name: string;
  href: string;
  hasLiveBadge?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Home', href: '/' },
  { name: 'Fixtures', href: '/fixtures' },
  { name: 'Teams', href: '/teams' },
  { name: 'Players', href: '/players' },
  { name: 'Standings', href: '/standings' },
  { name: 'Results', href: '/results' },
  { name: 'Top Scorers', href: '/top-scorers' },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tournamentTitle, setTournamentTitle] = useState('APL Season 9');

  useEffect(() => {
    async function loadTournament() {
      try {
        const res = await tournamentService.getTournaments();
        if (res && res.length > 0 && res[0]?.name) {
          setTournamentTitle(res[0].name);
        }
      } catch {}
    }
    loadTournament();
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo & Name Matching Reference Design */}
        <Link href="/" className="shrink-0">
          <FootballPortalLogo size="md" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-all flex items-center gap-1.5 py-1 text-sm font-semibold relative',
                  active
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <span>{item.name}</span>
                {item.hasLiveBadge && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Button & Mobile Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 bg-blue-50/80 hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-200/80 font-bold text-xs px-4 py-2 rounded-full transition-all shadow-xs active:scale-95"
          >
            <User className="w-3.5 h-3.5" />
            <span>Admin Login</span>
          </Link>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1 shadow-md animate-in slide-in-from-top-2 duration-150">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                  active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <span>{item.name}</span>
                {item.hasLiveBadge && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500 text-white font-label-caps text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    LIVE
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
