'use client';

import React from 'react';
import {
  Clock,
  CheckCircle2,
  Trophy,
  MapPin,
  Users
} from 'lucide-react';
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
  const initialRemaining = match.timer?.remainingTime ?? 240;
  const [currentRemaining, setCurrentRemaining] = React.useState(initialRemaining);

  const shootoutState: any = match.shootout || match.penalties?.shootoutState;
  const isTied = localScoreA === localScoreB;
  const penA = shootoutState?.teamAPenaltyScore ?? 0;
  const penB = shootoutState?.teamBPenaltyScore ?? 0;
  const shootoutWinnerId = shootoutState?.shootoutWinner || shootoutState?.winner;
  const isShootoutPhase =
    match.status === 'Penalty Shootout' ||
    stage.toLowerCase().includes('penalty') ||
    stage.toLowerCase().includes('shootout');
  const hasPenalties = Boolean(
    shootoutState?.isShootout || penA > 0 || penB > 0 || isShootoutPhase
  );
  const showPenalties = hasPenalties;

  let winnerDisplayName = '';
  if (match.winner) {
    if (typeof match.winner === 'object' && match.winner.name) {
      winnerDisplayName = match.winner.name;
    } else {
      const wId = String(match.winner);
      const tAId = typeof match.teamA === 'object' ? String(match.teamA?._id) : String(match.teamA);
      winnerDisplayName = wId === tAId ? (match.teamA?.name || 'Team A') : (match.teamB?.name || 'Team B');
    }
  } else if (penA > penB) {
    winnerDisplayName = match.teamA?.name || 'Team A';
  } else if (penB > penA) {
    winnerDisplayName = match.teamB?.name || 'Team B';
  } else if (shootoutWinnerId) {
    const swId = typeof shootoutWinnerId === 'object' ? String((shootoutWinnerId as any)._id) : String(shootoutWinnerId);
    const tAId = typeof match.teamA === 'object' ? String(match.teamA?._id) : String(match.teamA);
    winnerDisplayName = swId === tAId ? (match.teamA?.name || 'Team A') : (match.teamB?.name || 'Team B');
  }

  React.useEffect(() => {
    if (match.score) {
      setLocalScoreA(match.score.teamA);
      setLocalScoreB(match.score.teamB);
    }
  }, [match.score?.teamA, match.score?.teamB]);

  React.useEffect(() => {
    if (match.timer?.remainingTime !== undefined) {
      setCurrentRemaining(match.timer.remainingTime);
    }
  }, [match.timer?.remainingTime]);

  // Smooth live 1-second countdown ticker
  React.useEffect(() => {
    const isRunning = Boolean(match.timer?.isRunning && !match.timer?.isPaused && isLive);
    if (!isRunning) return;

    const interval = setInterval(() => {
      setCurrentRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [match.timer?.isRunning, match.timer?.isPaused, isLive]);

  // Determine stage progress index across match phases
  const getStageActiveIndex = () => {
    if (isCompleted || match.status === 'Completed') return 5;
    const s = stage.toLowerCase();
    if (s.includes('penalty') || s.includes('shootout') || s === 'pk') return 4;
    if (s.includes('extra') || s.includes('draw') || s === 'et') return 3;
    if (s.includes('second') || s === '2h') return 2;
    if (s.includes('half-time') || s.includes('halftime') || s.includes('break') || s.includes('whistle') || s.includes('delay') || s.includes('interval')) return 1;
    if (s.includes('first') || s === '1h') return 0;
    return 0;
  };

  const activeIdx = getStageActiveIndex();

  const stagesList = [
    { label: '1st Half', duration: '4m', idx: 0 },
    { label: 'Half-Time', duration: '2m', idx: 1 },
    { label: '2nd Half', duration: '4m', idx: 2 },
    { label: 'Extra Time', duration: '2m', idx: 3 },
    { label: 'Shootout', duration: '3 PK', idx: 4 },
    { label: 'Full Time', duration: 'FT', idx: 5 }
  ];

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-md mb-8 text-slate-900 border border-slate-200/90 transition-all bg-white select-none">
      <div className="p-5 sm:p-6 sm:p-8 flex flex-col gap-6">
        {/* Top Match Header Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2.5">
            {isLive ? (
              <span className="flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200/80 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                LIVE MATCH
              </span>
            ) : isCompleted ? (
              <span className="flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                FINAL RESULT
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                SCHEDULED
              </span>
            )}

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
              <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="uppercase tracking-wider">
                {match.stage || (match.tournament as any)?.name || 'Alliance Premier League — Season 9'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{match.venue || 'Alliance National Field #1'}</span>
          </div>
        </div>

        {/* Spacious Main Match Clashes & Scoreboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-6 lg:gap-8 py-2">
          {/* Team A (Home Squad) */}
          <div className="lg:col-span-5 flex items-center justify-between lg:justify-end gap-5 sm:gap-6 text-left lg:text-right">
            <div className="flex flex-col items-start lg:items-end min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {match.teamA?.seed || 'HOME SQUAD'}
                </span>
              </div>

              <h2 className={`text-2xl sm:text-3xl lg:text-4xl uppercase tracking-tight truncate max-w-full flex items-center gap-2 ${
                isCompleted && (winnerDisplayName === match.teamA?.name || (!winnerDisplayName && localScoreA > localScoreB))
                  ? 'font-black text-emerald-700'
                  : 'font-black text-slate-900'
              }`}>
                {isCompleted && (winnerDisplayName === match.teamA?.name || (!winnerDisplayName && localScoreA > localScoreB)) && (
                  <span className="text-2xl">🏆</span>
                )}
                <span>{match.teamA?.name || 'Team A'}</span>
              </h2>

              <span className="text-xs font-bold text-slate-500 tracking-wide mt-0.5">
                {match.teamA?.captain ? `(C) ${getCaptainDisplayName(match.teamA.captain).toUpperCase()}` : 'OFFICIAL ROSTER'}
              </span>

              {/* Team A Goalscorers */}
              {match.goals && localScoreA > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 justify-start lg:justify-end">
                  {match.goals
                    .filter((g) => {
                      const tId = typeof g.team === 'string' ? g.team : g.team?._id;
                      return tId === match.teamA?._id || (g.team as any)?.name === match.teamA?.name;
                    })
                    .slice(0, localScoreA)
                    .map((g, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs text-slate-700 shadow-2xs transition-colors"
                      >
                        <span>⚽</span>
                        <span className="font-bold text-slate-900">{g.player?.name || 'Goal'}</span>
                        <span className="text-emerald-700 font-mono text-[11px] font-semibold">{g.matchTime}</span>
                      </span>
                    ))}
                </div>
              )}
            </div>

            {/* Team A Crest Emblem */}
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/80 border-2 flex items-center justify-center shadow-xs shrink-0 overflow-hidden relative ${
              isCompleted && (winnerDisplayName === match.teamA?.name || (!winnerDisplayName && localScoreA > localScoreB))
                ? 'border-emerald-500 ring-4 ring-emerald-500/20'
                : 'border-emerald-200'
            }`}>
              <span className="absolute inset-0 flex items-center justify-center font-black text-2xl sm:text-3xl text-emerald-700 select-none">
                {match.teamA?.name ? match.teamA.name.slice(0, 2).toUpperCase() : 'TA'}
              </span>
              {match.teamA?.logo && (
                <img
                  src={match.teamA.logo}
                  alt={match.teamA.name}
                  className="w-full h-full object-contain p-2 relative z-10 bg-white/70"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>

          {/* Central Scoreboard Core */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center py-2 lg:py-0 px-2">
            {/* Stage Pill */}
            <div className="bg-slate-100 border border-slate-200 text-slate-700 px-3.5 py-1 rounded-full mb-2.5 shadow-2xs">
              <span className="text-[11px] font-black tracking-widest uppercase">
                {stage}
              </span>
            </div>

            {/* High-Contrast Score Box */}
            <div className="bg-slate-900 text-white px-7 sm:px-9 py-3 sm:py-4 rounded-2xl shadow-md border border-slate-800 flex flex-col items-center gap-1 min-w-[170px] sm:min-w-[200px]">
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                <span className="text-5xl sm:text-6xl font-black text-white tabular-nums tracking-tighter drop-shadow-xs">
                  {localScoreA}
                </span>
                <span className="text-2xl sm:text-3xl text-slate-500 font-light select-none">
                  -
                </span>
                <span className="text-5xl sm:text-6xl font-black text-white tabular-nums tracking-tighter drop-shadow-xs">
                  {localScoreB}
                </span>
              </div>

              {/* Digital Clock pill underneath score */}
              {isLive && (
                <div className="flex items-center gap-1.5 mt-1 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span
                    data-testid="spectator-clock"
                    className="text-[11px] font-black text-emerald-300 font-mono tracking-wider tabular-nums"
                  >
                    {formatTime(currentRemaining)}
                  </span>
                </div>
              )}

              {/* Penalties score if applicable */}
              {showPenalties && (
                <div className="flex flex-col items-center mt-2 pt-2 border-t border-slate-800 w-full text-center">
                  <div className="text-xs font-bold text-slate-300">
                    Shootout: <span className="text-amber-400 font-extrabold">{penA} — {penB}</span>
                  </div>
                  {isCompleted && (winnerDisplayName || penA !== penB || Boolean(shootoutWinnerId)) && (
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-wider mt-0.5">
                      🏆 {winnerDisplayName || (penA > penB ? match.teamA?.name : match.teamB?.name)} WON ({penA} - {penB} ON PENALTIES)
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Team B (Visiting Club) */}
          <div className="lg:col-span-5 flex items-center justify-between lg:justify-start gap-5 sm:gap-6 text-left">
            {/* Team B Crest Emblem */}
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/80 border-2 flex items-center justify-center shadow-xs shrink-0 overflow-hidden relative order-2 lg:order-1 ${
              isCompleted && (winnerDisplayName === match.teamB?.name || (!winnerDisplayName && localScoreB > localScoreA))
                ? 'border-emerald-500 ring-4 ring-emerald-500/20'
                : 'border-blue-200'
            }`}>
              <span className="absolute inset-0 flex items-center justify-center font-black text-2xl sm:text-3xl text-blue-700 select-none">
                {match.teamB?.name ? match.teamB.name.slice(0, 2).toUpperCase() : 'TB'}
              </span>
              {match.teamB?.logo && (
                <img
                  src={match.teamB.logo}
                  alt={match.teamB.name}
                  className="w-full h-full object-contain p-2 relative z-10 bg-white/70"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
            </div>

            <div className="flex flex-col items-start order-1 lg:order-2 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {match.teamB?.seed || 'VISITING CLUB'}
                </span>
              </div>

              <h2 className={`text-2xl sm:text-3xl lg:text-4xl uppercase tracking-tight truncate max-w-full flex items-center gap-2 ${
                isCompleted && (winnerDisplayName === match.teamB?.name || (!winnerDisplayName && localScoreB > localScoreA))
                  ? 'font-black text-emerald-700'
                  : 'font-black text-slate-900'
              }`}>
                <span>{match.teamB?.name || 'Team B'}</span>
                {isCompleted && (winnerDisplayName === match.teamB?.name || (!winnerDisplayName && localScoreB > localScoreA)) && (
                  <span className="text-2xl">🏆</span>
                )}
              </h2>

              <span className="text-xs font-bold text-slate-500 tracking-wide mt-0.5">
                {match.teamB?.captain ? `(C) ${getCaptainDisplayName(match.teamB.captain).toUpperCase()}` : 'OFFICIAL ROSTER'}
              </span>

              {/* Team B Goalscorers */}
              {match.goals && localScoreB > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 justify-start">
                  {match.goals
                    .filter((g) => {
                      const tId = typeof g.team === 'string' ? g.team : g.team?._id;
                      return tId === match.teamB?._id || (g.team as any)?.name === match.teamB?.name;
                    })
                    .slice(0, localScoreB)
                    .map((g, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs text-slate-700 shadow-2xs transition-colors"
                      >
                        <span>⚽</span>
                        <span className="font-bold text-slate-900">{g.player?.name || 'Goal'}</span>
                        <span className="text-blue-700 font-mono text-[11px] font-semibold">{g.matchTime}</span>
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Match Progression Stepper & Protocol Ribbon */}
        <div className="flex flex-col gap-3.5 pt-4 border-t border-slate-100">
          {/* Tied Decider Banner if in Extra Time */}
          {isTied && (stage.toLowerCase().includes('extra') || stage.toLowerCase().includes('draw') || activeIdx >= 3) && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-2xl text-xs font-bold flex flex-wrap items-center justify-between gap-2 shadow-xs">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Scores Level ({localScoreA} - {localScoreB}): Match in 2-Minute Extra Time / Draw Decider Protocol!</span>
              </span>
              <span className="text-[10px] uppercase font-black bg-amber-500 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                2m Draw Decider
              </span>
            </div>
          )}

          {/* Spacious Stages Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center">
            {stagesList.map((stg) => {
              const isPast = activeIdx > stg.idx;
              const isCurrent = activeIdx === stg.idx;

              let style = 'bg-slate-50 border border-slate-200/80 text-slate-400 font-medium';
              if (isCurrent) {
                style = 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/30 font-bold';
              } else if (isPast) {
                style = 'bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold';
              }

              return (
                <div
                  key={stg.label}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all ${style}`}
                >
                  <div className="flex items-center gap-1 font-black text-xs uppercase tracking-wider">
                    {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />}
                    <span>{stg.label}</span>
                  </div>
                  <span className={`text-[10px] font-mono mt-0.5 ${isCurrent ? 'text-emerald-100 font-bold' : isPast ? 'text-emerald-700' : 'text-slate-400'}`}>
                    ({stg.duration})
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress Bar Track */}
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                activeIdx >= 0 ? 'bg-emerald-500 w-[20%]' : 'w-0'
              }`}
            />
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                activeIdx >= 1 ? 'bg-emerald-500 w-[20%]' : 'w-0'
              }`}
            />
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                activeIdx >= 2 ? 'bg-emerald-500 w-[20%]' : 'w-0'
              }`}
            />
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                activeIdx >= 3 ? 'bg-amber-400 w-[20%]' : 'w-0'
              }`}
            />
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                activeIdx >= 4 ? 'bg-purple-500 w-[20%]' : 'w-0'
              }`}
            />
          </div>

          {/* Telemetry Footer */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{match.venue || 'Alliance National Field #1'} • Natural Turf Pitch</span>
            </div>
            <div className="flex items-center gap-3 font-semibold">
              <span>Ref: {match.referee || 'FIFA Certified Official'}</span>
              <span>•</span>
              <span className="text-emerald-700 uppercase tracking-wider font-bold">
                {match.penalties?.shootoutState?.isShootout
                  ? 'Penalty Shootout Active'
                  : 'APL Championship Protocol'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
