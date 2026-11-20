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
  const shootout = penalties?.shootoutState || (penalties as any);
  const penA = shootout?.teamAPenaltyScore ?? 0;
  const penB = shootout?.teamBPenaltyScore ?? 0;
  const hasShootout = Boolean(shootout?.isShootout || penA > 0 || penB > 0);

  if (!shootout || !hasShootout) {
    return null;
  }

  const teamAPenaltyScore = shootout.teamAPenaltyScore ?? penA;
  const teamBPenaltyScore = shootout.teamBPenaltyScore ?? penB;
  const round = shootout.round || 1;
  const isSuddenDeath = Boolean(shootout.isSuddenDeath);
  const isCompleted = Boolean(shootout.isCompleted);
  const winner = shootout.shootoutWinner
    ? typeof shootout.shootoutWinner === 'object'
      ? shootout.shootoutWinner.name || (shootout.shootoutWinner._id === teamAName ? teamAName : teamBName)
      : String(shootout.shootoutWinner)
    : shootout.winner
      ? typeof shootout.winner === 'object'
        ? shootout.winner.name
        : String(shootout.winner)
      : penA > penB
        ? teamAName
        : penB > penA
          ? teamBName
          : null;
  const kicks = penalties?.kicks || [];

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200 bg-white text-slate-900 p-6 sm:p-7 mb-8">
      {/* Top Highlight Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-purple-500 to-emerald-500" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-purple-600" />
          <h3 className="text-base sm:text-lg font-black tracking-tight uppercase text-slate-900">
            Official Penalty Shootout
          </h3>
          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">• 3 Kicks Standard</span>
        </div>
        <div className="flex items-center gap-2">
          {isSuddenDeath && (
            <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-black uppercase tracking-wider animate-pulse">
              SUDDEN DEATH
            </span>
          )}
          <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-black uppercase tracking-wider">
            {isCompleted ? 'SHOOTOUT COMPLETED' : `ROUND ${round || 1}`}
          </span>
        </div>
      </div>

      {/* Scoreboard for shootout */}
      <div className="my-5 flex items-center justify-between p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center font-black text-xs text-emerald-800">
            {teamAName.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">{teamAName}</span>
        </div>

        <div className="flex items-center gap-3 text-3xl sm:text-4xl font-black text-slate-900 tabular-nums tracking-wider font-mono">
          <span className="text-emerald-600">{teamAPenaltyScore}</span>
          <span className="text-slate-400 font-light">:</span>
          <span className="text-purple-600">{teamBPenaltyScore}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight text-right">{teamBName}</span>
          <div className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-300 flex items-center justify-center font-black text-xs text-purple-800">
            {teamBName.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Kicks Log */}
      {kicks.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-black uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="py-2.5 px-3.5">Round</th>
                <th className="py-2.5 px-3.5">Team</th>
                <th className="py-2.5 px-3.5">Penalty Taker</th>
                <th className="py-2.5 px-3.5">Opposing Goalkeeper</th>
                <th className="py-2.5 px-3.5 text-right">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kicks.map((kick, i) => {
                const teamName =
                  typeof kick.team === 'object' && kick.team ? kick.team.name : kick.kickingTeam === 'teamA' ? teamAName : teamBName;
                const kickerName =
                  typeof kick.kicker === 'object' && kick.kicker ? kick.kicker.name : 'Taker';
                const keeperName =
                  typeof kick.goalkeeper === 'object' && kick.goalkeeper ? kick.goalkeeper.name : 'Goalkeeper';

                return (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3.5 font-bold tabular-nums text-slate-500">#{kick.round}</td>
                    <td className="py-2.5 px-3.5 font-semibold text-slate-700">{teamName}</td>
                    <td className="py-2.5 px-3.5 font-bold text-slate-900">{kickerName}</td>
                    <td className="py-2.5 px-3.5 text-slate-500">{keeperName}</td>
                    <td className="py-2.5 px-3.5 text-right">
                      {kick.outcome === 'Goal' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-black">
                          <CheckCircle className="w-3.5 h-3.5" /> GOAL
                        </span>
                      ) : kick.outcome === 'Saved' ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-black">
                          <AlertCircle className="w-3.5 h-3.5" /> SAVED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-black">
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
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-sm font-black text-emerald-800 uppercase tracking-wider">
          🏆 Shootout Winner: {winner}
        </div>
      )}
    </div>
  );
};
