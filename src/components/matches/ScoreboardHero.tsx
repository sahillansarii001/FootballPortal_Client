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
    shootoutState?.isShootout || shootoutState?.isCompleted || penA > 0 || penB > 0 || isShootoutPhase
  );
  const showPenalties = hasPenalties || (isTied && (isCompleted || isShootoutPhase));

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

  // Smooth live 1-second countdown ticker for authentic broadcast feel
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
    <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-gradient-to-b from-[#0c1424] via-[#090e1a] to-[#050811] text-white mb-8">
      {/* Stadium Pitch Top Highlight Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />

      {/* Ambient Stadium Lighting Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(16,185,129,0.25),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.3),transparent)]" />

      <div className="relative p-5 sm:p-7 md:p-8 flex flex-col gap-6">
        {/* Top Broadcast Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {isLive ? (
              <span className="flex items-center gap-1.5 bg-rose-600 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-rose-900/40">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                LIVE BROADCAST
              </span>
            ) : isCompleted ? (
              <span className="flex items-center gap-1.5 bg-slate-800 text-emerald-400 border border-emerald-500/30 text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                FINAL RESULT
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                SCHEDULED
              </span>
            )}

            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-white/10 text-slate-200 text-[11px] font-bold px-3 py-1 rounded-full">
              <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="uppercase tracking-wider">
                {match.stage || (match.tournament as any)?.name || 'Alliance Premier League — Season 9'}
              </span>
            </div>
          </div>

          {/* Broadcast Clock Capsule */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-slate-900/90 border border-white/15 px-3.5 py-1.5 rounded-xl shadow-inner">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Clock:</span>
              <span className="text-sm font-black tabular-nums tracking-tight text-emerald-400 font-mono">
                {formatTime(currentRemaining)}
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider">
                {stage}
              </span>
            </div>

            {isConnected ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-black bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                SYNCED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-black bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                OFFLINE
              </span>
            )}
          </div>
        </div>

        {/* Central Team Clash & Massive Scoreboard */}
        <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 py-2">
          {/* Team A (Home) */}
          <div className="md:col-span-5 flex items-center justify-between md:justify-end gap-4 sm:gap-6 text-left md:text-right">
            <div className="flex flex-col items-start md:items-end">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {match.teamA.seed || 'HOME SQUAD'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight drop-shadow-sm">
                {match.teamA.name}
              </h2>

              <span className="text-xs font-bold text-amber-300/90 tracking-wide mt-0.5">
                {match.teamA.captain ? `(C) ${getCaptainDisplayName(match.teamA.captain).toUpperCase()}` : 'VARSITY ROSTER'}
              </span>

              {/* Team A Goalscorers */}
              {match.goals && localScoreA > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 justify-start md:justify-end">
                  {match.goals
                    .filter((g) => {
                      const tId = typeof g.team === 'string' ? g.team : g.team?._id;
                      return tId === match.teamA._id || (g.team as any)?.name === match.teamA.name;
                    })
                    .slice(0, localScoreA)
                    .map((g, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1 rounded-lg text-xs text-slate-200 shadow-xs"
                      >
                        <span>⚽</span>
                        <span className="font-bold text-white">{g.player?.name}</span>
                        <span className="text-emerald-400 font-mono text-[11px] font-semibold">{g.matchTime}</span>
                      </span>
                    ))}
                </div>
              )}
            </div>

            {/* Team A Crest Emblem */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-600/30 to-emerald-950/60 border-2 border-emerald-500/50 flex items-center justify-center shadow-xl ring-4 ring-black/40 shrink-0 overflow-hidden relative">
              <span className="absolute inset-0 flex items-center justify-center font-black text-3xl sm:text-4xl text-emerald-400/90 select-none">
                {match.teamA.name.slice(0, 2).toUpperCase()}
              </span>
              {match.teamA.logo && (
                <img
                  src={match.teamA.logo}
                  alt={match.teamA.name}
                  className="w-full h-full object-contain p-2 relative z-10"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>

          {/* Broadcast Scoreboard Core */}
          <div className="md:col-span-2 flex flex-col items-center justify-center py-2 md:py-0">
            {/* Stage Pill floating above score */}
            <div className="bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-1 rounded-full mb-2.5 shadow-md">
              <span className="text-[11px] font-black tracking-widest uppercase">
                {stage}
              </span>
            </div>

            {/* LED Score Display Module */}
            <div className="relative bg-[#070b14]/90 backdrop-blur-md px-7 sm:px-9 py-4 rounded-3xl border border-white/15 shadow-2xl flex flex-col items-center gap-1.5 min-w-[190px] sm:min-w-[220px]">
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                <span className="text-5xl sm:text-6xl md:text-7xl font-black text-white tabular-nums tracking-tighter drop-shadow-md">
                  {localScoreA}
                </span>
                <span className="text-2xl sm:text-3xl text-slate-500 font-light select-none">
                  :
                </span>
                <span className="text-5xl sm:text-6xl md:text-7xl font-black text-white tabular-nums tracking-tighter drop-shadow-md">
                  {localScoreB}
                </span>
              </div>

              {/* Digital Clock pill underneath score */}
              {isLive && (
                <div className="flex items-center gap-1.5 mt-1 bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-black text-emerald-300 font-mono tracking-wider tabular-nums">
                    {formatTime(currentRemaining)}
                  </span>
                </div>
              )}

              {/* Penalties score if applicable */}
              {showPenalties && (
                <div className="flex flex-col items-center mt-2 pt-2 border-t border-white/10 w-full text-center">
                  <div className="text-xs sm:text-sm font-bold text-slate-300">
                    Shootout: <span className="text-amber-300 font-extrabold">{penA} — {penB}</span>
                  </div>
                  {isCompleted && (penA !== penB || Boolean(shootoutWinnerId)) && (
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-wider mt-0.5">
                      🏆 {penA > penB ? match.teamA.name : match.teamB.name} WINS ON PENALTIES
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Team B (Away) */}
          <div className="md:col-span-5 flex items-center justify-between md:justify-start gap-4 sm:gap-6 text-left">
            {/* Team B Crest Emblem */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-600/30 to-slate-900/60 border-2 border-blue-500/50 flex items-center justify-center shadow-xl ring-4 ring-black/40 shrink-0 overflow-hidden relative order-2 md:order-1">
              <span className="absolute inset-0 flex items-center justify-center font-black text-3xl sm:text-4xl text-blue-400/90 select-none">
                {match.teamB.name.slice(0, 2).toUpperCase()}
              </span>
              {match.teamB.logo && (
                <img
                  src={match.teamB.logo}
                  alt={match.teamB.name}
                  className="w-full h-full object-contain p-2 relative z-10"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
            </div>

            <div className="flex flex-col items-start order-1 md:order-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {match.teamB.seed || 'VISITING CLUB'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight drop-shadow-sm">
                {match.teamB.name}
              </h2>

              <span className="text-xs font-bold text-amber-300/90 tracking-wide mt-0.5">
                {match.teamB.captain ? `(C) ${getCaptainDisplayName(match.teamB.captain).toUpperCase()}` : 'VARSITY ROSTER'}
              </span>

              {/* Team B Goalscorers */}
              {match.goals && localScoreB > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 justify-start">
                  {match.goals
                    .filter((g) => {
                      const tId = typeof g.team === 'string' ? g.team : g.team?._id;
                      return tId === match.teamB._id || (g.team as any)?.name === match.teamB.name;
                    })
                    .slice(0, localScoreB)
                    .map((g, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1 rounded-lg text-xs text-slate-200 shadow-xs"
                      >
                        <span>⚽</span>
                        <span className="font-bold text-white">{g.player?.name}</span>
                        <span className="text-emerald-400 font-mono text-[11px] font-semibold">{g.matchTime}</span>
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Professional Broadcast Match Progression Stepper */}
        <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
          {/* Tied Decider Banner if applicable */}
          {isTied && (stage.toLowerCase().includes('extra') || stage.toLowerCase().includes('draw') || activeIdx >= 3) && (
            <div className="bg-gradient-to-r from-amber-500/20 via-amber-600/20 to-amber-500/20 border border-amber-500/40 text-amber-200 px-4 py-2 rounded-2xl text-xs font-bold flex flex-wrap items-center justify-between gap-2 shadow-sm">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Scores Tied ({localScoreA} - {localScoreB}): Match in Extra Time / Draw Decider Protocol!</span>
              </span>
              <span className="text-[10px] uppercase font-black bg-amber-500 text-slate-950 px-3 py-0.5 rounded-full shadow-xs">
                2m Draw Decider
              </span>
            </div>
          )}

          {/* Modern Match Progression Stages Ribbon */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
            {stagesList.map((stg) => {
              const isPast = activeIdx > stg.idx;
              const isCurrent = activeIdx === stg.idx;

              let style = 'bg-slate-900/60 border border-white/5 text-slate-500';
              if (isCurrent) {
                style = 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-400/30';
              } else if (isPast) {
                style = 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300';
              }

              return (
                <div
                  key={stg.label}
                  className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all ${style}`}
                >
                  <div className="flex items-center gap-1 font-black text-xs uppercase tracking-wider">
                    {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />}
                    <span>{stg.label}</span>
                  </div>
                  <span className={`text-[10px] font-mono mt-0.5 ${isCurrent ? 'text-emerald-100 font-bold' : 'text-slate-400'}`}>
                    ({stg.duration})
                  </span>
                </div>
              );
            })}
          </div>

          {/* Visual Progress Bar Track */}
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden flex gap-1 p-0.5">
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
                activeIdx >= 4 ? 'bg-purple-400 w-[20%]' : 'w-0'
              }`}
            />
          </div>

          {/* Broadcast Stadium & Telemetry Footer */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/5">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{match.venue || 'Varsity National Field #1'} • Natural Turf Pitch</span>
            </div>
            <div className="flex items-center gap-3 font-semibold">
              <span>Ref: {match.referee || 'FIFA Certified Official'}</span>
              <span>•</span>
              <span className="text-emerald-400 uppercase tracking-wider font-bold">
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
