'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, Clock, PlayCircle, MapPin, Radio, Calendar, Pause, Play, CheckCircle2 } from 'lucide-react';
import { Match } from '@/types';
import { matchService } from '@/services/match.service';
import { formatTime } from '@/utils/formatters';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';

export default function LiveMatchesPage() {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial and recurring live polling to synchronize with Admin Live Control
  useEffect(() => {
    let isMounted = true;

    async function fetchLive(showSpinner = false) {
      if (showSpinner) setLoading(true);
      try {
        const data = await matchService.getLiveMatches();
        if (isMounted) {
          setLiveMatches(data);
        }
      } catch (err) {
        console.error('Failed fetching live matches:', err);
      } finally {
        if (showSpinner && isMounted) {
          setLoading(false);
        }
      }
    }

    fetchLive(true);

    // Poll every 2.5 seconds for instant authoritative synchronization
    const pollInterval = setInterval(() => {
      fetchLive(false);
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, []);

  // Smooth local 1-second countdown ticker for active matches
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setLiveMatches((prevMatches) =>
        prevMatches.map((m) => {
          if (m.timer?.isRunning && !m.timer?.isPaused && (m.timer?.remainingTime ?? 0) > 0) {
            return {
              ...m,
              timer: {
                ...m.timer,
                remainingTime: Math.max(0, (m.timer.remainingTime ?? 0) - 1),
              },
            };
          }
          return m;
        })
      );
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 select-none">
      {/* Header */}
      <PageHeader
        badge="Real-Time Broadcast Feed"
        badgeIcon={<Radio className="w-4 h-4 text-error animate-pulse" />}
        title="Live Match Center"
        description="Follow live collegiate matches with backend-authoritative match clocks, real-time scorelines, penalty shootouts, and field events."
        action={
          <div className="flex items-center gap-2 bg-error/10 border border-error/20 px-4 py-2 rounded-xl text-error font-label-caps text-label-caps font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
            <span>{liveMatches.length} Ongoing Fixture{liveMatches.length === 1 ? '' : 's'}</span>
          </div>
        }
      />

      {loading ? (
        <LoadingState message="Connecting to live pitch telemetry..." />
      ) : liveMatches.length === 0 ? (
        <EmptyState
          title="No Matches Currently Live"
          description="There are no active matches in progress right now. Matches start live when launched from the Tournament Admin Control Desk."
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
            const remaining = match.timer?.remainingTime ?? 240;
            const currentStage = match.timer?.currentStage || match.currentStage || 'Live';
            const isPaused = match.timer?.isPaused || !match.timer?.isRunning;
            const scoreA = match.score?.teamA ?? match.teamAScore ?? 0;
            const scoreB = match.score?.teamB ?? match.teamBScore ?? 0;
            const hasPenalties =
              Boolean(match.shootout?.isShootout) ||
              ((match.shootout?.teamAPenaltyScore ?? 0) > 0 || (match.shootout?.teamBPenaltyScore ?? 0) > 0);

            return (
              <div
                key={match._id}
                className="bg-surface-container-lowest rounded-3xl shadow-md border-2 border-primary-container/30 p-6 sm:p-8 overflow-hidden relative group hover:shadow-xl transition-all"
              >
                <div className="absolute top-0 left-0 bottom-0 w-2.5 bg-primary-container" />

                {/* Top strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-surface-container-high">
                  <div className="flex flex-wrap items-center gap-3">
                    {isPaused ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500 text-white font-label-caps text-xs font-bold tracking-wider shadow-xs">
                        <Pause className="w-3 h-3 text-white fill-white" />
                        CLOCK PAUSED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error text-white font-label-caps text-xs font-bold tracking-wider shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                        LIVE STREAM
                      </span>
                    )}

                    <span className="font-label-caps text-xs text-on-surface-variant uppercase font-extrabold tracking-wide">
                      {match.stage || 'Quarter Final'}
                    </span>
                    <span className="text-xs text-on-surface-variant flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-primary-container" />
                      {match.venue || 'Cardinal Athletic Complex Field 1'}
                    </span>
                  </div>

                  <div
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-headline-sm text-sm border shadow-xs transition-colors ${
                      isPaused
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-surface-container-low border-surface-container text-primary-container'
                    }`}
                  >
                    <Clock className={`w-4 h-4 ${isPaused ? 'text-amber-600' : 'text-error animate-spin'}`} />
                    <span className="font-black tabular-nums font-mono text-base">{formatTime(remaining)}</span>
                    <span className="text-xs text-on-surface-variant font-medium">
                      ({currentStage})
                    </span>
                  </div>
                </div>

                {/* Scoreboard */}
                <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-6 py-2">
                  {/* Home Team */}
                  <div className="md:col-span-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center font-black text-primary-container text-2xl border border-surface-container-high shrink-0 overflow-hidden shadow-xs">
                      {match.teamA.logo ? (
                        <img src={match.teamA.logo} alt={match.teamA.name} className="w-full h-full object-cover" />
                      ) : (
                        match.teamA.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-label-caps text-[10px] text-primary-container font-bold uppercase">
                        {match.teamA.seed || 'HOST TEAM'}
                      </span>
                      <h3 className="font-headline-lg text-xl sm:text-2xl text-on-surface font-extrabold truncate">
                        {match.teamA.name}
                      </h3>
                      {match.goals && match.goals.length > 0 && (
                        <p className="text-xs text-on-surface-variant truncate mt-0.5">
                          ⚽{' '}
                          {match.goals
                            .filter(
                              (g) =>
                                (g.team as any)?._id === match.teamA._id ||
                                (g.team as any)?.name === match.teamA.name
                            )
                            .map((g) => `${g.player?.name || 'Athlete'} (${g.matchTime})`)
                            .join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Central Score Display */}
                  <div className="md:col-span-3 flex flex-col items-center justify-center py-4 px-6 bg-surface-container-low rounded-2xl border border-surface-container shadow-inner">
                    <div className="flex items-center gap-3 leading-none font-display-score text-4xl sm:text-5xl font-black text-on-surface tabular-nums">
                      <span className="text-primary-container">{scoreA}</span>
                      <span className="text-outline font-light">:</span>
                      <span>{scoreB}</span>
                    </div>

                    {/* Penalties or Live Stage Indicator (No hardcoded possession) */}
                    {hasPenalties ? (
                      <div className="mt-2.5 px-3.5 py-1.5 bg-[#1e2025] text-white rounded-xl flex items-center justify-center gap-2 text-xs font-mono shadow-md border border-slate-700/60 animate-in fade-in">
                        <span className="text-slate-300 font-sans text-[11px] font-bold uppercase tracking-wider">
                          Penalties:
                        </span>
                        <span className="font-black text-emerald-400 text-sm">
                          {match.shootout?.teamAPenaltyScore ?? 0}
                        </span>
                        <span className="text-slate-500 font-bold">-</span>
                        <span className="font-black text-emerald-400 text-sm">
                          {match.shootout?.teamBPenaltyScore ?? 0}
                        </span>
                      </div>
                    ) : (
                      <span className="font-label-caps text-[10px] uppercase font-bold text-on-surface-variant mt-2 tracking-wider">
                        {isPaused ? 'Match Clock Paused' : scoreA === scoreB ? 'Scores Level' : 'Live Match Score'}
                      </span>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-4 text-left md:text-right">
                    <div className="min-w-0 order-2 md:order-1">
                      <span className="font-label-caps text-[10px] text-secondary font-bold uppercase">
                        {match.teamB.seed || 'VISITING TEAM'}
                      </span>
                      <h3 className="font-headline-lg text-xl sm:text-2xl text-on-surface font-extrabold truncate">
                        {match.teamB.name}
                      </h3>
                      {match.goals && match.goals.length > 0 && (
                        <p className="text-xs text-on-surface-variant truncate mt-0.5">
                          ⚽{' '}
                          {match.goals
                            .filter(
                              (g) =>
                                (g.team as any)?._id === match.teamB._id ||
                                (g.team as any)?.name === match.teamB.name
                            )
                            .map((g) => `${g.player?.name || 'Athlete'} (${g.matchTime})`)
                            .join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-surface-container-high text-secondary flex items-center justify-center font-black text-2xl border border-surface-container shrink-0 order-1 md:order-2 overflow-hidden shadow-xs">
                      {match.teamB.logo ? (
                        <img src={match.teamB.logo} alt={match.teamB.name} className="w-full h-full object-cover" />
                      ) : (
                        match.teamB.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer and CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-surface-container-high">
                  <div className="flex items-center gap-3 text-xs text-on-surface-variant font-medium">
                    <Activity className="w-4 h-4 text-primary-container" />
                    <span>Real-time Pitch Telemetry Synchronized • 2.5s Polling Interval</span>
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
