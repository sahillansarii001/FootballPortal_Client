'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, Clock, PlayCircle, MapPin, Radio, Calendar } from 'lucide-react';
import { Match } from '@/types';
import { matchService } from '@/services/match.service';
import { formatTime } from '@/utils/formatters';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';

export default function LiveMatchesPage() {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLive() {
      setLoading(true);
      const data = await matchService.getLiveMatches();
      setLiveMatches(data);
      setLoading(false);
    }
    fetchLive();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <PageHeader
        badge="Real-Time Broadcast Feed"
        badgeIcon={<Radio className="w-4 h-4 text-error animate-pulse" />}
        title="Live Match Center"
        description="Follow live collegiate matches with backend-authoritative match clocks, real-time scorelines, penalty shootouts, and field events."
        action={
          <div className="flex items-center gap-2 bg-error/10 border border-error/20 px-4 py-2 rounded-xl text-error font-label-caps text-label-caps font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
            <span>{liveMatches.length} Ongoing Fixtures</span>
          </div>
        }
      />

      {loading ? (
        <LoadingState message="Connecting to live pitch telemetry..." />
      ) : liveMatches.length === 0 ? (
        <EmptyState
          title="No Matches Currently Live"
          description="There are no active matches in progress right now. Please explore our upcoming fixtures to check when the next college clash kicks off."
          action={
            <Link
              href="/fixtures"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary font-headline-sm text-sm rounded-xl font-bold shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Explore Upcoming Fixtures</span>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-8">
          {liveMatches.map((match) => {
            const remaining = match.timer?.remainingTime ?? 180;
            const currentStage = match.timer?.currentStage || match.currentStage || 'Live';

            return (
              <div
                key={match._id}
                className="bg-surface-container-lowest rounded-2xl shadow-md border-2 border-primary-container/30 p-6 sm:p-8 overflow-hidden relative group hover:shadow-xl transition-all"
              >
                <div className="absolute top-0 left-0 bottom-0 w-2.5 bg-primary-container" />

                {/* Top strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-surface-container-high">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error text-white font-label-caps text-label-caps font-bold">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                      LIVE STREAM
                    </span>
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase font-extrabold">
                      {match.stage || 'Championship Match'}
                    </span>
                    <span className="font-body-sm text-xs text-on-surface-variant flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary-container" />
                      {match.venue || 'Central Arena'}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2 bg-surface-container-low px-4 py-1.5 rounded-full text-primary-container font-headline-sm text-headline-sm border border-surface-container shadow-xs">
                    <Clock className="w-4 h-4 text-error animate-spin" />
                    <span className="font-extrabold tabular-nums">{formatTime(remaining)}</span>
                    <span className="text-body-sm text-on-surface-variant font-medium">
                      ({currentStage})
                    </span>
                  </div>
                </div>

                {/* Scoreboard */}
                <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-6 py-2">
                  {/* Home */}
                  <div className="md:col-span-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center font-black text-primary-container text-2xl border border-surface-container-high shrink-0">
                      {match.teamA.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <span className="font-label-caps text-[10px] text-primary-container font-bold">
                        {match.teamA.seed || 'RANK #1'}
                      </span>
                      <h3 className="font-headline-lg text-xl sm:text-2xl text-on-surface font-extrabold truncate">
                        {match.teamA.name}
                      </h3>
                      {match.goals && match.goals.length > 0 && (
                        <p className="text-xs text-on-surface-variant truncate mt-0.5">
                          {match.goals
                            .filter((g) => (g.team as any)?._id === match.teamA._id || (g.team as any)?.name === match.teamA.name)
                            .map((g) => `${g.player?.name} ${g.matchTime}`)
                            .join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="md:col-span-3 flex flex-col items-center justify-center py-3 px-6 bg-surface-container-low rounded-2xl border border-surface-container shadow-inner">
                    <div className="flex items-center gap-3 leading-none font-display-score text-4xl sm:text-5xl font-black text-on-surface tabular-nums">
                      <span className="text-primary-container">{match.score?.teamA ?? match.teamAScore ?? 0}</span>
                      <span className="text-outline font-light">:</span>
                      <span>{match.score?.teamB ?? match.teamBScore ?? 0}</span>
                    </div>
                    <span className="font-label-caps text-[10px] uppercase font-bold text-on-surface-variant mt-1.5">
                      Possession: 54% - 46%
                    </span>
                  </div>

                  {/* Away */}
                  <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-4 text-left md:text-right">
                    <div className="min-w-0 order-2 md:order-1">
                      <span className="font-label-caps text-[10px] text-secondary font-bold">
                        {match.teamB.seed || 'RANK #2'}
                      </span>
                      <h3 className="font-headline-lg text-xl sm:text-2xl text-on-surface font-extrabold truncate">
                        {match.teamB.name}
                      </h3>
                      {match.goals && match.goals.length > 0 && (
                        <p className="text-xs text-on-surface-variant truncate mt-0.5">
                          {match.goals
                            .filter((g) => (g.team as any)?._id === match.teamB._id || (g.team as any)?.name === match.teamB.name)
                            .map((g) => `${g.player?.name} ${g.matchTime}`)
                            .join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-surface-container-high text-secondary flex items-center justify-center font-black text-2xl border border-surface-container shrink-0 order-1 md:order-2">
                      {match.teamB.name.slice(0, 1)}
                    </div>
                  </div>
                </div>

                {/* Footer and CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-surface-container-high">
                  <div className="flex items-center gap-3 text-xs text-on-surface-variant font-medium">
                    <Activity className="w-4 h-4 text-primary-container" />
                    <span>Real-time Socket.IO room subscribed • Zero layout shift</span>
                  </div>
                  <Link
                    href={`/matches/${match._id}`}
                    className="inline-flex items-center gap-2 bg-primary-container hover:bg-primary text-on-primary font-headline-sm text-sm px-6 py-2.5 rounded-xl transition-all font-bold shadow-xs active:scale-95 shrink-0"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Open Live Match Center</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
