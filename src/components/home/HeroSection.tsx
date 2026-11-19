import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, ListOrdered } from 'lucide-react';
import { TournamentOverviewStats } from '@/types';

interface HeroSectionProps {
  stats: TournamentOverviewStats;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ stats }) => {
  return (
    <section className="relative w-full rounded-2xl overflow-hidden shadow-xl bg-inverse-surface mb-10 border border-surface-container-highest/20">
      {/* Dynamic atmospheric sports photography background */}
      <div
        className="absolute inset-0 bg-cover bg-center mix-blend-luminosity opacity-35 transform scale-105 transition-transform duration-1000 hover:scale-100"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1920&auto=format&fit=crop')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-on-background via-on-background/90 to-transparent" />
      <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-primary-container/20 blur-3xl pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 px-6 sm:px-10 py-12 lg:py-16 max-w-4xl flex flex-col justify-center">
        {/* Tier badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/30 backdrop-blur-md text-on-primary-container font-label-caps text-label-caps uppercase w-max mb-4 border border-primary-container/40 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-fixed opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary-fixed"></span>
          </span>
          <span>2025 Inter-College Championship • NCAA Tier-1 Sanctioned</span>
        </div>

        {/* Title */}
        <h1 className="font-display-score text-4xl sm:text-5xl lg:text-6xl text-on-primary font-black tracking-tight leading-none mb-3 uppercase">
          Inter-College Football
          <br />
          <span className="text-primary-fixed drop-shadow-sm">Championship 2025</span>
        </h1>

        {/* Tagline */}
        <p className="font-body-lg text-body-lg text-inverse-on-surface/90 max-w-2xl mb-8 font-medium leading-relaxed">
          Elite Collegiate Dynasties. High-Octane Clashes. One Crown. Real-time tactical tracking,
          verified varsity matchday data, and high-velocity college athletics.
        </p>

        {/* Call-to-actions */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <Link
            href="/fixtures"
            className="inline-flex items-center gap-2 bg-primary-container hover:bg-primary text-on-primary font-headline-sm text-headline-sm px-6 py-3 rounded-lg shadow-lg shadow-primary-container/25 transition-all transform active:scale-95 group font-bold"
          >
            <Calendar className="w-5 h-5" />
            <span>Explore Fixtures</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/standings"
            className="inline-flex items-center gap-2 bg-surface/10 hover:bg-surface/20 text-on-primary border border-surface/20 backdrop-blur-md font-label-ui text-label-ui px-5 py-3 rounded-lg transition-all font-semibold"
          >
            <ListOrdered className="w-4 h-4" />
            <span>View Standings</span>
          </Link>
        </div>

        {/* Statistics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-surface-container-highest/20">
          <div className="flex flex-col p-3 rounded-xl bg-surface/10 backdrop-blur-md border border-surface/10 hover:border-surface/20 transition-all">
            <span className="font-stat-numeral text-stat-numeral text-primary-fixed">{stats?.totalTeams ?? 0}</span>
            <span className="font-label-caps text-label-caps text-inverse-on-surface/70 uppercase mt-0.5">Total Teams</span>
          </div>
          <div className="flex flex-col p-3 rounded-xl bg-surface/10 backdrop-blur-md border border-surface/10 hover:border-surface/20 transition-all">
            <span className="font-stat-numeral text-stat-numeral text-on-primary">{stats?.totalPlayers ?? 0}</span>
            <span className="font-label-caps text-label-caps text-inverse-on-surface/70 uppercase mt-0.5">Total Players</span>
          </div>
          <div className="flex flex-col p-3 rounded-xl bg-surface/10 backdrop-blur-md border border-surface/10 hover:border-surface/20 transition-all">
            <span className="font-stat-numeral text-stat-numeral text-on-primary">{stats?.totalMatches ?? 0}</span>
            <span className="font-label-caps text-label-caps text-inverse-on-surface/70 uppercase mt-0.5">Total Matches</span>
          </div>
          <div className="flex flex-col p-3 rounded-xl bg-surface/10 backdrop-blur-md border border-surface/10 hover:border-surface/20 transition-all">
            <span className="font-stat-numeral text-stat-numeral text-secondary-fixed">{stats?.completedMatches ?? 0}</span>
            <span className="font-label-caps text-label-caps text-inverse-on-surface/70 uppercase mt-0.5">Completed</span>
          </div>
          <div className="flex flex-col p-3 rounded-xl bg-surface/10 backdrop-blur-md border border-surface/10 hover:border-surface/20 transition-all">
            <span className="font-stat-numeral text-stat-numeral text-primary-fixed-dim">{stats?.upcomingMatches ?? 0}</span>
            <span className="font-label-caps text-label-caps text-inverse-on-surface/70 uppercase mt-0.5">Upcoming</span>
          </div>
          <div className="flex flex-col p-3 rounded-xl bg-surface/10 backdrop-blur-md border border-surface/10 hover:border-surface/20 transition-all">
            <div className="flex items-baseline gap-1">
              <span className="font-stat-numeral text-stat-numeral text-secondary-fixed">{stats?.totalGoals ?? 0}</span>
              <span className="font-body-sm text-body-sm text-secondary-fixed-dim">({stats?.goalsPerMatch ?? '0.00'}/m)</span>
            </div>
            <span className="font-label-caps text-label-caps text-inverse-on-surface/70 uppercase mt-0.5">Total Goals</span>
          </div>
        </div>
      </div>
    </section>
  );
};
