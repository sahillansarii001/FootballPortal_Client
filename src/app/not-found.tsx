import React from 'react';
import Link from 'next/link';
import { Trophy, ArrowLeft, Radio, Calendar } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center select-none">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/5">
        <Trophy className="w-8 h-8 text-amber-500" />
      </div>

      <span className="font-label-caps text-xs font-black tracking-widest uppercase text-primary-container bg-primary-container/10 px-3 py-1 rounded-full mb-3">
        404 • Page or Fixture Not Found
      </span>

      <h1 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight uppercase max-w-lg">
        The Match or Page You Are Looking For Does Not Exist
      </h1>

      <p className="text-sm text-on-surface-variant max-w-md mt-3 mb-8">
        This fixture may have been completed, rescheduled, or the link might be outdated. Explore the active tournament center below:
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/live"
          className="inline-flex items-center gap-2 bg-primary-container hover:bg-primary-container/90 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md transition-all active:scale-95"
        >
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Active Match Center</span>
        </Link>

        <Link
          href="/fixtures"
          className="inline-flex items-center gap-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl border border-surface-container-high transition-all active:scale-95"
        >
          <Calendar className="w-4 h-4 text-primary-container" />
          <span>View All Fixtures</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-transparent hover:bg-surface-container text-on-surface-variant font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
      </div>
    </div>
  );
}
