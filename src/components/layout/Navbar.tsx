'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X, Trophy, LogIn } from 'lucide-react';
import { cn } from '@/utils/cn';
import { tournamentService } from '@/services/tournament.service';

interface NavItem {
  name: string;
  href: string;
  hasLiveBadge?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Home', href: '/' },
  { name: 'Fixtures', href: '/fixtures' },
  { name: 'Live Matches', href: '/live', hasLiveBadge: true },
  { name: 'Teams', href: '/teams' },
  { name: 'Players', href: '/players' },
  { name: 'Standings', href: '/standings' },
  { name: 'Results', href: '/results' },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tournamentTitle, setTournamentTitle] = useState('2026 Inter-College Championship');

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
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface-container-lowest border-b border-surface-container-high/60 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container group-hover:bg-primary-container group-hover:text-white transition-all shadow-xs">
            <Trophy className="w-5 h-5 transition-transform group-hover:scale-110" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface leading-tight tracking-tight font-extrabold uppercase">
              Varsity Football League
            </span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold truncate max-w-[200px] sm:max-w-xs">
              {tournamentTitle}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-6">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-all flex items-center gap-1.5 py-1 text-sm font-medium',
                  active
                    ? 'text-primary-container font-semibold border-b-2 border-primary-container pb-0.5'
                    : 'text-on-surface-variant hover:text-on-surface'
                )}
              >
                <span>{item.name}</span>
                {item.hasLiveBadge && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container"></span>
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
            className="inline-flex items-center gap-1.5 bg-primary-container text-on-primary font-label-ui text-label-ui px-3.5 py-2 rounded-lg hover:bg-primary transition-all shadow-xs active:scale-95 font-semibold"
          >
            <LogIn className="w-4 h-4" />
            <span>Log In</span>
          </Link>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            className="xl:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-surface-container-lowest border-b border-surface-container-high px-4 py-3 space-y-1 shadow-md">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary-container/10 text-primary-container font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                )}
              >
                <span>{item.name}</span>
                {item.hasLiveBadge && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-error text-white font-label-caps text-[10px] font-bold uppercase tracking-wider">
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
