'use client';

import React from 'react';
import { Clock, CheckCircle2, PauseCircle, Flag, Activity } from 'lucide-react';
import { Match } from '@/types';
import { formatTime, getCaptainDisplayName } from '@/utils/formatters';

interface ScoreboardHeroProps {
  match: Match;
  isConnected?: boolean;
}

export const ScoreboardHero: React.FC<ScoreboardHeroProps> = ({ match, isConnected = true }) => {
  const isLive = match.status === 'Live' || match.status === 'Half-Time' || match.status === 'Penalty Shootout';
  const isCompleted = match.status === 'Completed';

  const [localScoreA, setLocalScoreA] = React.useState(match.score?.teamA ?? match.teamAScore ?? 0);
  const [localScoreB, setLocalScoreB] = React.useState(match.score?.teamB ?? match.teamBScore ?? 0);

  const stage = match.timer?.currentStage || match.currentStage || 'First Half';
  const remaining = match.timer?.remainingTime ?? 240;

  const shootoutState: any = match.shootout || match.penalties?.shootoutState;
  const isTied = localScoreA === localScoreB;
  const penA = shootoutState?.teamAPenaltyScore ?? 0;
  const penB = shootoutState?.teamBPenaltyScore ?? 0;
  const shootoutWinnerId = shootoutState?.shootoutWinner || shootoutState?.winner;
  const isShootoutPhase = match.status === 'Penalty Shootout' || stage.toLowerCase().includes('penalty') || stage.toLowerCase().includes('shootout');
  const hasPenalties = Boolean(shootoutState?.isShootout || shootoutState?.isCompleted || (penA > 0 || penB > 0) || isShootoutPhase);
  const showPenalties = hasPenalties || (isTied && (isCompleted || isShootoutPhase));

  React.useEffect(() => {
    if (match.score) {
      setLocalScoreA(match.score.teamA);
      setLocalScoreB(match.score.teamB);
    }
  }, [match.score?.teamA, match.score?.teamB]);

  // Determine stage progress across tournament stages including 2-minute Draw Extra Time
  const getStageActiveIndex = () => {
    const s = stage.toLowerCase();
    if (s.includes('first')) return 0;
    if (s.includes('transition') || s.includes('whistle') || s.includes('corner') || s.includes('delay')) return 1;
    if (s.includes('half-time') || s.includes('halftime') || s.includes('break') || s.includes('interval')) return 2;
    if (s.includes('second')) return 3;
    if (s.includes('extra') || s.includes('draw')) return 4;
    if (s.includes('completed') || s.includes('full') || s.includes('ft') || isCompleted) return 5;
    return 0;
  };

  const activeIdx = getStageActiveIndex();
  const isDraw = localScoreA === localScoreB;

  return (
    <div className="relative bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container-high overflow-hidden mb-8">
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-container/10 via-surface-container-lowest to-surface-variant/20" />

      <div className="relative p-5 sm:p-8 flex flex-col gap-6">
        {/* Top Broadcast Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-container-high pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {isLive ? (
              <span className="flex items-center gap-1.5 bg-error text-white font-label-caps text-label-caps px-3 py-1 rounded-full font-bold shadow-sm animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                LIVE BROADCAST
              </span>
            ) : isCompleted ? (
              <span className="flex items-center gap-1.5 bg-surface-container text-on-surface font-label-caps text-label-caps px-3 py-1 rounded-full font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary-container" />
                FINAL RESULT
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-primary-container/10 text-primary-container font-label-caps text-label-caps px-3 py-1 rounded-full font-bold">
                SCHEDULED
              </span>
            )}
            <span className="bg-surface-container-high text-on-surface font-label-caps text-label-caps px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
              {match.stage || (match.tournament as any)?.name || '2026 Inter-College Championship'}
            </span>
          </div>

          <div className="flex items-center gap-3 font-label-ui text-label-ui">
            <span className="flex items-center gap-1.5 text-on-surface font-semibold bg-surface-container-low px-3 py-1 rounded-lg border border-surface-container-high">
              <Clock className="w-4 h-4 text-primary-container" />
              <span>Match Clock:</span>
              <span className="text-error font-extrabold tabular-nums">
                {formatTime(remaining)}
              </span>
              <span className="text-on-surface-variant text-xs">/ {stage}</span>
            </span>
            {isConnected ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-primary font-bold bg-primary-container/10 px-2 py-0.5 rounded border border-primary-container/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
                SYNCED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-error font-bold bg-error-container px-2 py-0.5 rounded">
                OFFLINE
              </span>
            )}
          </div>
        </div>

        {/* Central Team Clash & Score Display */}
        <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6">
          {/* Team A (Home) */}
          <div className="md:col-span-5 flex items-center justify-between md:justify-end gap-5 text-left md:text-right">
            <div className="flex flex-col items-start md:items-end">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary-container/10 text-primary-container mb-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-container inline-block"></span>
                <span className="font-label-caps text-[10px] uppercase font-bold tracking-wider">
                  {match.teamA.seed || 'HOME TEAM'}
                </span>
              </div>
              <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl text-on-surface uppercase font-black tracking-tight">
                {match.teamA.name}
              </h2>
              <span className="font-label-caps text-label-caps text-primary-container font-extrabold tracking-widest">
                {match.teamA.captain ? `CAPTAIN: ${getCaptainDisplayName(match.teamA.captain).toUpperCase()}` : 'VARSITY SQUAD'}
              </span>

              {/* Team A Goalscorers */}
              {match.goals && (
                <div className="mt-3 flex flex-wrap gap-1.5 justify-start md:justify-end">
                  {match.goals
                    .filter((g) => {
                      const tId = typeof g.team === 'string' ? g.team : g.team?._id;
                      return tId === match.teamA._id || (g.team as any)?.name === match.teamA.name;
                    })
                    .map((g, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 bg-surface-container-low px-2 py-0.5 rounded border border-surface-container-high text-xs text-on-surface"
                      >
                        ⚽ <span className="font-semibold">{g.player?.name}</span>
                        <span className="text-on-surface-variant font-medium">{g.matchTime}</span>
                      </span>
                    ))}
                </div>
              )}
            </div>

            <div className="w-20 h-20 rounded-2xl bg-primary-container/15 text-primary-container flex items-center justify-center font-black text-3xl border border-primary-container/30 shadow-md shrink-0">
              {match.teamA.name.slice(0, 1)}
            </div>
          </div>

          {/* Score Counter Middle */}
          <div className="md:col-span-2 flex flex-col items-center justify-center py-2 md:py-0">
            <div className="bg-surface-container-high px-3.5 py-1 rounded-full mb-2 border border-surface-container-high shadow-inner">
              <span className="font-label-caps text-[11px] text-on-surface font-extrabold tracking-widest uppercase">
                {stage}
              </span>
            </div>

            {/* Dark Scoreboard Display Box matching official screenshot */}
            <div className="bg-[#1e2025] px-8 sm:px-10 py-4 rounded-2xl border border-white/10 shadow-xl flex flex-col items-center gap-1.5 min-w-[200px]">
              <div className="flex items-center justify-center gap-6">
                <span className="font-display-score text-4xl sm:text-5xl md:text-6xl text-white font-extrabold tracking-tight tabular-nums">
                  {localScoreA}
                </span>
                <span className="font-display-score text-3xl sm:text-4xl text-slate-400 font-light">
                  -
                </span>
                <span className="font-display-score text-4xl sm:text-5xl md:text-6xl text-white font-extrabold tracking-tight tabular-nums">
                  {localScoreB}
                </span>
              </div>

              {/* Tied Match / Penalty Shootout Result Display */}
              {showPenalties && (
                <div className="flex flex-col items-center mt-1">
                  <div className="text-sm sm:text-base font-semibold text-[#8a94a6] font-label-ui tracking-wide">
                    Penalties: <span className="text-white font-extrabold">{penA} - {penB}</span>
                  </div>
                    { isCompleted && (penA !== penB || Boolean(shootoutWinnerId)) && (
                      <div className="text-[11px] font-bold text-emerald-400 mt-0.5 uppercase tracking-wider">
                        {penA > penB
                          ? `${match.teamA.name} won on penalties`
                          : penB > penA
                            ? `${match.teamB.name} won on penalties`
                            : shootoutWinnerId === match.teamA._id
                              ? `${match.teamA.name} won on penalties`
                              : `${match.teamB.name} won on penalties`}
                      </div>
                    )}
                </div>
              )}
            </div>

            {isLive && (
              <div className="flex items-center gap-1.5 mt-2 bg-error/10 text-error px-3 py-1 rounded-full border border-error/20">
                <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                <span className="font-stat-numeral text-xs font-bold tracking-wider tabular-nums">
                  {formatTime(remaining)}
                </span>
              </div>
            )}
          </div>

          {/* Team B (Away) */}
          <div className="md:col-span-5 flex items-center justify-between md:justify-start gap-5 text-left">
            <div className="w-20 h-20 rounded-2xl bg-surface-container-high text-secondary flex items-center justify-center font-black text-3xl border border-surface-container shadow-md shrink-0 order-2 md:order-1">
              {match.teamB.name.slice(0, 1)}
            </div>

            <div className="flex flex-col items-start order-1 md:order-2">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-container mb-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary inline-block"></span>
                <span className="font-label-caps text-[10px] uppercase font-bold tracking-wider">
                  {match.teamB.seed || 'VISITING CLUB'}
                </span>
              </div>
              <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl text-on-surface uppercase font-black tracking-tight">
                {match.teamB.name}
              </h2>
              <span className="font-label-caps text-label-caps text-secondary font-extrabold tracking-widest">
                {match.teamB.captain ? `CAPTAIN: ${getCaptainDisplayName(match.teamB.captain).toUpperCase()}` : 'VARSITY SQUAD'}
              </span>

              {/* Team B Goalscorers */}
              {match.goals && (
                <div className="mt-3 flex flex-wrap gap-1.5 justify-start">
                  {match.goals
                    .filter((g) => {
                      const tId = typeof g.team === 'string' ? g.team : g.team?._id;
                      return tId === match.teamB._id || (g.team as any)?.name === match.teamB.name;
                    })
                    .map((g, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 bg-surface-container-low px-2 py-0.5 rounded border border-surface-container-high text-xs text-on-surface"
                      >
                        ⚽ <span className="font-semibold">{g.player?.name}</span>
                        <span className="text-on-surface-variant font-medium">{g.matchTime}</span>
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Match Stages Multi-Segment Ribbon (Tournament Cycle with 2-Minute Draw Decider) */}
        <div className="flex flex-col gap-3 pt-4 bg-surface-container-low p-4 rounded-xl border border-surface-container-high">
          {isDraw && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 px-3.5 py-2 rounded-xl text-xs font-bold flex flex-wrap items-center justify-between gap-2 shadow-xs">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Scores Level ({localScoreA} - {localScoreB}): Match is a Draw &rarr; 2 More Minutes Added in Timer!</span>
              </span>
              <span className="text-[10px] uppercase font-black bg-amber-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                2m Draw Decider
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 font-label-caps text-label-caps text-center">
            <div
              className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border font-bold text-[11px] ${activeIdx >= 0
                ? 'bg-surface-container-lowest text-primary-container border-primary-container/30 shadow-xs'
                : 'bg-surface-container-high text-outline border-transparent'
                }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> 1ST HALF (4m)
            </div>
            <div
              className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border font-bold text-[11px] ${activeIdx >= 1
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                : 'bg-surface-container-high text-outline border-transparent'
                }`}
            >
              <PauseCircle className="w-3.5 h-3.5 text-amber-600" /> WHISTLE DELAY (20s)
            </div>
            <div
              className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border font-bold text-[11px] ${activeIdx >= 2
                ? 'bg-surface-container-lowest text-primary-container border-primary-container/30 shadow-xs'
                : 'bg-surface-container-high text-outline border-transparent'
                }`}
            >
              <PauseCircle className="w-3.5 h-3.5" /> BREAK (2m)
            </div>
            <div
              className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border font-bold text-[11px] ${activeIdx >= 3
                ? 'bg-primary-container text-on-primary ring-2 ring-primary-container/30 shadow-xs'
                : 'bg-surface-container-high text-outline border-transparent'
                }`}
            >
              <Activity className="w-3.5 h-3.5 animate-spin" /> 2ND HALF (4m)
            </div>
            <div
              className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border font-bold text-[11px] ${activeIdx >= 4
                ? 'bg-amber-500 text-white ring-2 ring-amber-300 shadow-xs'
                : isDraw
                  ? 'bg-amber-100/70 text-amber-900 border-amber-300 border-dashed'
                  : 'bg-surface-container-high text-outline border-transparent'
                }`}
            >
              <Clock className="w-3.5 h-3.5" /> DRAW DECIDER (2m)
            </div>
            <div
              className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border font-bold text-[11px] col-span-2 sm:col-span-1 ${isCompleted
                ? 'bg-primary-container text-on-primary shadow-xs'
                : 'bg-surface-container-high/60 text-outline border-surface-container-high'
                }`}
            >
              <Flag className="w-3.5 h-3.5" /> FULL TIME
            </div>
          </div>

          {/* Visual progress bar across tournament format */}
          <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden flex gap-1 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${activeIdx >= 0 ? 'bg-primary-container w-[35%]' : 'w-0'
                }`}
              title="First Half (4 mins)"
            />
            <div
              className={`h-full rounded-full transition-all duration-500 ${activeIdx >= 1 ? 'bg-amber-400 w-[5%]' : 'w-0'
                }`}
              title="Whistle & Corner Delay (20s)"
            />
            <div
              className={`h-full rounded-full transition-all duration-500 ${activeIdx >= 2 ? 'bg-tertiary-fixed w-[12%]' : 'w-0'
                }`}
              title="Half-Time Break (2 mins)"
            />
            <div
              className={`h-full rounded-full transition-all duration-500 ${activeIdx >= 3 ? 'bg-primary-container w-[35%]' : 'w-0'
                }`}
              title="Second Half (4 mins)"
            />
            <div
              className={`h-full rounded-full transition-all duration-500 ${activeIdx >= 4 ? 'bg-amber-500 w-[13%]' : isDraw ? 'bg-amber-300/50 w-[13%]' : 'w-0'
                }`}
              title="Draw Decider Extra Time (2 mins)"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-body-sm font-body-sm text-on-surface-variant pt-1">
            <span className="text-xs text-on-surface-variant">
              Match Venue: {match.venue || 'Collegiate Arena'} • Ref: {match.referee || 'FIFA Certified'}
            </span>
            <span className="text-primary-container font-extrabold text-xs uppercase tracking-wider">
              {match.penalties?.shootoutState?.isShootout
                ? 'Penalty Shootout Underway'
                : 'Sudden Death / Shootout Prepared If Drawn'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
