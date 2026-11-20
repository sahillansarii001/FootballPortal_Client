import React from 'react';
import Link from 'next/link';
import { Trophy } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-surface-container-high/80 mt-16 py-10 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 mb-8 border-b border-surface-container-high">
          {/* Logo & Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-black border border-amber-500/30 flex items-center justify-center shadow-xs shrink-0">
              <img src="/images/apl-logo.jpg" alt="Alliance Premier League (APL)" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold tracking-tight">
                ALLIANCE PREMIER LEAGUE
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Official Season 9 Championship Authority & Live Portal
              </span>
            </div>
          </div>

          {/* Sanctioned Partners */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-on-surface-variant">
            <span className="font-label-caps text-label-caps uppercase text-outline">Sanctioned Partners:</span>
            <span className="bg-surface-container px-2.5 py-1 rounded tracking-wider text-on-surface">SPORTS-METRICS</span>
            <span className="bg-surface-container px-2.5 py-1 rounded tracking-wider text-on-surface">CAMPUS-GEAR</span>
            <span className="bg-surface-container px-2.5 py-1 rounded tracking-wider text-on-surface">UNI-CORP</span>
          </div>
        </div>

        {/* Bottom copyright and legal */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 font-body-sm text-body-sm text-on-surface-variant">
          <div>
            © 2026 Alliance Premier League (APL Season 9). Official Tournament Regulations Apply.
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="#" className="hover:text-primary-container transition-colors">Tournament Bylaws</Link>
            <Link href="#" className="hover:text-primary-container transition-colors">Disciplinary Code</Link>
            <Link href="#" className="hover:text-primary-container transition-colors">Official Rulebook</Link>
            <Link href="#" className="hover:text-primary-container transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
