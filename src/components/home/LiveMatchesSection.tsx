'use client';

import React from 'react';
import Link from 'next/link';
import { PlayCircle, Clock, MapPin, Activity } from 'lucide-react';
import { Match } from '@/types';
import { formatTime } from '@/utils/formatters';

interface LiveMatchesSectionProps {
  liveMatch: Match | null;
}

export const LiveMatchesSection: React.FC<LiveMatchesSectionProps> = ({ liveMatch }) => {
  if (!liveMatch) {
    return null;
  }

  const remaining = liveMatch.timer?.remainingTime ?? 180;
  const currentStage = liveMatch.timer?.currentStage || liveMatch.currentStage || 'Live';

  return (
    <section className="mb-12" id="live-card">
      <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden border border-surface-container-high">
        {/* Emerald side accent */}
        <div className="absolute top-0 left-0 bottom-0 w-2.5 bg-primary-container" />

        {/* Header Ribbon */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 mb-6 border-b border-surface-container-high">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-caps text-label-caps font-bold tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
              </span>
              LIVE MATCH • {liveMatch.stage || 'INTER-COLLEGE CHAMPIONSHIP'}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-primary-container shrink-0" />
              {liveMatch.venue || 'Collegiate Stadium • Grass Turf'}
              {liveMatch.attendance && ` • ${liveMatch.attendance} In Attendance`}
            </span>
          </div>

          {/* Live Timer Pill */}
          <div className="inline-flex items-center gap-2 bg-surface-container-low px-4 py-1.5 rounded-full text-primary-container font-headline-sm text-headline-sm border border-surface-container shadow-xs self-start lg:self-auto">
            <Clock className="w-4 h-4 text-error animate-spin" />
            <span className="font-bold tabular-nums">{formatTime(remaining)}</span>
            <span className="text-body-sm text-on-surface-variant font-medium">
              ({currentStage})
            </span>
          </div>
        </div>

        {/* Main Teams & Score Display */}
        <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-y-6 py-2">
          {/* Home Team */}
          <div className="md:col-span-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center shadow-inner font-headline-lg text-primary-container font-black shrink-0 border border-surface-container-high text-2xl">
              {liveMatch.teamA.name.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-1.5 py-0.5 rounded bg-surface-container-high font-label-caps text-[10px] text-on-surface-variant font-bold">
                  HOST
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                <span className="font-label-caps text-label-caps text-primary-container font-extrabold tracking-wider">
                  {liveMatch.teamA.seed || 'RANK #1'}
                </span>
              </div>
              <h2 className="font-headline-lg text-headline-md lg:text-headline-lg text-on-surface truncate font-extrabold tracking-tight">
                {liveMatch.teamA.name}
              </h2>
              {liveMatch.goals && liveMatch.goals.length > 0 && (
                <p className="font-body-sm text-body-sm text-on-surface-variant font-medium truncate mt-0.5">
                  {liveMatch.goals
                    .filter((g) => {
                      const tId = typeof g.team === 'string' ? g.team : g.team?._id;
                      return tId === liveMatch.teamA._id || (g.team as any)?.name === liveMatch.teamA.name;
                    })
                    .map((g) => `${g.player?.name || 'Player'} ${g.matchTime}`)
                    .join(', ') || 'No goals yet'}
                </p>
              )}
            </div>
          </div>

          {/* Scoreboard Middle */}
          <div className="md:col-span-3 flex flex-col items-center justify-center py-3 px-6 bg-surface-container-low rounded-2xl border border-surface-container shadow-inner">
            <div className="flex items-center justify-center gap-4 leading-none">
              <span className="font-display-score text-display-score text-primary-container font-black tabular-nums">
                {liveMatch.score.teamA}
              </span>
              <span className="font-headline-lg text-on-surface-variant font-light">:</span>
              <span className="font-display-score text-display-score text-on-surface font-black tabular-nums">
                {liveMatch.score.teamB}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded bg-surface-container font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
              High-Pressing Tactical Block
            </div>
          </div>

          {/* Away Team */}
          <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-4 text-left md:text-right">
            <div className="min-w-0 order-2 md:order-1">
              <div className="flex items-center justify-start md:justify-end gap-2 mb-1">
                <span className="font-label-caps text-label-caps text-secondary font-extrabold tracking-wider">
                  {liveMatch.teamB.seed || 'RANK #2'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span className="px-1.5 py-0.5 rounded bg-surface-container-high font-label-caps text-[10px] text-on-surface-variant font-bold">
                  VISITOR
                </span>
              </div>
              <h2 className="font-headline-lg text-headline-md lg:text-headline-lg text-on-surface truncate font-extrabold tracking-tight">
                {liveMatch.teamB.name}
              </h2>
              {liveMatch.goals && liveMatch.goals.length > 0 && (
                <p className="font-body-sm text-body-sm text-on-surface-variant font-medium truncate mt-0.5">
                  {liveMatch.goals
                    .filter((g) => {
                      const tId = typeof g.team === 'string' ? g.team : g.team?._id;
                      return tId === liveMatch.teamB._id || (g.team as any)?.name === liveMatch.teamB.name;
                    })
                    .map((g) => `${g.player?.name || 'Player'} ${g.matchTime}`)
                    .join(', ') || 'No goals yet'}
                </p>
              )}
            </div>
            <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center shadow-inner font-headline-lg text-secondary font-black shrink-0 border border-surface-container text-2xl order-1 md:order-2">
              {liveMatch.teamB.name.slice(0, 1)}
            </div>
          </div>
        </div>

        {/* Footer Meta & CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-surface-container-high bg-surface-container-lowest">
          <div className="flex flex-wrap items-center gap-4 text-on-surface-variant font-body-sm text-body-sm">
            <span className="inline-flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-primary-container" />
              Possession: <strong className="text-on-surface font-bold">54% - 46%</strong>
            </span>
            <span className="text-outline-variant">•</span>
            <span className="inline-flex items-center gap-1">
              Shots on Target: <strong className="text-on-surface font-bold">6 - 4</strong>
            </span>
            <span className="text-outline-variant">•</span>
            <span className="inline-flex items-center gap-1">
              Fouls: <strong className="text-on-surface font-bold">8 - 11</strong>
            </span>
          </div>

          <Link
            href={`/matches/${liveMatch._id}`}
            className="inline-flex items-center gap-2 bg-primary-container hover:bg-primary text-on-primary font-headline-sm text-headline-sm px-5 py-2.5 rounded-xl transition-all font-bold shadow-xs active:scale-95 shrink-0"
          >
            <PlayCircle className="w-5 h-5" />
            <span>View Match Center</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
