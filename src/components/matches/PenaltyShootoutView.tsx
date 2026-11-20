import React from 'react';
import { PenaltyShootoutState } from '@/types';
import { ShieldAlert, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface PenaltyShootoutViewProps {
  penalties?: PenaltyShootoutState;
  teamAName: string;
  teamBName: string;
}

export const PenaltyShootoutView: React.FC<PenaltyShootoutViewProps> = ({
  penalties,
  teamAName,
  teamBName,
}) => {
  if (!penalties || !penalties.shootoutState?.isShootout) {
    return null;
  }

  const { teamAPenaltyScore, teamBPenaltyScore, round, isSuddenDeath, isCompleted, winner } =
    penalties.shootoutState;
  const kicks = penalties.kicks || [];

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-gradient-to-b from-[#0c1424] via-[#090e1a] to-[#050811] text-white p-5 sm:p-6 mb-8">
      {/* Stadium Pitch Top Highlight Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-purple-500 to-emerald-500" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-purple-400" />
          <h3 className="text-base sm:text-lg font-black tracking-tight uppercase text-white">
            Official Penalty Shootout
          </h3>
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline">• 3 Kicks Standard</span>
        </div>
        <div className="flex items-center gap-2">
          {isSuddenDeath && (
            <span className="px-3 py-1 rounded-full bg-rose-600/30 border border-rose-500/50 text-rose-300 text-[11px] font-black uppercase tracking-wider animate-pulse">
              SUDDEN DEATH
            </span>
          )}
          <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[11px] font-black uppercase tracking-wider">
            {isCompleted ? 'SHOOTOUT COMPLETED' : `ROUND ${round || 1}`}
          </span>
        </div>
      </div>

      {/* Scoreboard for shootout */}
      <div className="my-5 flex items-center justify-between p-4 sm:p-5 bg-[#070b14]/90 rounded-2xl border border-white/10 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center font-black text-xs text-emerald-400">
            {teamAName.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-sm sm:text-base font-black text-white uppercase tracking-tight">{teamAName}</span>
        </div>

        <div className="flex items-center gap-3 text-3xl sm:text-4xl font-black text-white tabular-nums tracking-wider font-mono">
          <span className="text-emerald-400">{teamAPenaltyScore}</span>
          <span className="text-slate-600 font-light">:</span>
          <span className="text-purple-400">{teamBPenaltyScore}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm sm:text-base font-black text-white uppercase tracking-tight text-right">{teamBName}</span>
          <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/40 flex items-center justify-center font-black text-xs text-purple-400">
            {teamBName.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Kicks Log */}
      {kicks.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 font-black uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3.5">Round</th>
                <th className="py-2.5 px-3.5">Team</th>
                <th className="py-2.5 px-3.5">Penalty Taker</th>
                <th className="py-2.5 px-3.5">Opposing Goalkeeper</th>
                <th className="py-2.5 px-3.5 text-right">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-950/40">
              {kicks.map((kick, i) => {
                const teamName =
                  typeof kick.team === 'object' && kick.team ? kick.team.name : kick.kickingTeam === 'teamA' ? teamAName : teamBName;
                const kickerName =
                  typeof kick.kicker === 'object' && kick.kicker ? kick.kicker.name : 'Taker';
                const keeperName =
                  typeof kick.goalkeeper === 'object' && kick.goalkeeper ? kick.goalkeeper.name : 'Goalkeeper';

                return (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3.5 font-bold tabular-nums text-slate-300">#{kick.round}</td>
                    <td className="py-2.5 px-3.5 font-semibold text-slate-200">{teamName}</td>
                    <td className="py-2.5 px-3.5 font-bold text-white">{kickerName}</td>
                    <td className="py-2.5 px-3.5 text-slate-400">{keeperName}</td>
                    <td className="py-2.5 px-3.5 text-right">
                      {kick.outcome === 'Goal' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-black">
                          <CheckCircle className="w-3.5 h-3.5" /> GOAL
                        </span>
                      ) : kick.outcome === 'Saved' ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-black">
                          <AlertCircle className="w-3.5 h-3.5" /> SAVED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-black">
                          <XCircle className="w-3.5 h-3.5" /> MISSED
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isCompleted && winner && (
        <div className="mt-4 p-3 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border border-emerald-500/40 rounded-xl text-center text-sm font-black text-emerald-300 uppercase tracking-wider">
          🏆 Shootout Winner: {winner}
        </div>
      )}
    </div>
  );
};
