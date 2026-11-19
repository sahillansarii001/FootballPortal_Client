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
    <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border-2 border-secondary/40 flex flex-col gap-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-secondary" />
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-extrabold">
            Official Penalty Shootout
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {isSuddenDeath && (
            <span className="px-2.5 py-0.5 rounded bg-error-container text-on-error-container font-label-caps text-label-caps font-bold">
              SUDDEN DEATH
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-caps text-label-caps font-bold">
            {isCompleted ? 'SHOOTOUT COMPLETED' : `ROUND ${round}`}
          </span>
        </div>
      </div>

      {/* Scoreboard for shootout */}
      <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-surface-container">
        <div className="flex items-center gap-3">
          <span className="font-headline-sm font-extrabold text-on-surface">{teamAName}</span>
        </div>
        <div className="flex items-center gap-3 font-display-score text-3xl font-black text-on-surface tabular-nums">
          <span className="text-primary-container">{teamAPenaltyScore}</span>
          <span className="text-outline font-light">:</span>
          <span className="text-secondary">{teamBPenaltyScore}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-headline-sm font-extrabold text-on-surface">{teamBName}</span>
        </div>
      </div>

      {/* Kicks Log */}
      {kicks.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm text-body-sm">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-label-caps uppercase">
                <th className="py-2 px-3">Round</th>
                <th className="py-2 px-3">Team</th>
                <th className="py-2 px-3">Penalty Taker</th>
                <th className="py-2 px-3">Opposing Goalkeeper</th>
                <th className="py-2 px-3 text-right">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {kicks.map((kick, i) => {
                const teamName =
                  typeof kick.team === 'object' && kick.team ? kick.team.name : kick.kickingTeam === 'teamA' ? teamAName : teamBName;
                const kickerName =
                  typeof kick.kicker === 'object' && kick.kicker ? kick.kicker.name : 'Taker';
                const keeperName =
                  typeof kick.goalkeeper === 'object' && kick.goalkeeper ? kick.goalkeeper.name : 'Goalkeeper';

                return (
                  <tr key={i} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold tabular-nums">#{kick.round}</td>
                    <td className="py-2.5 px-3 font-medium">{teamName}</td>
                    <td className="py-2.5 px-3 font-bold text-on-surface">{kickerName}</td>
                    <td className="py-2.5 px-3 text-on-surface-variant">{keeperName}</td>
                    <td className="py-2.5 px-3 text-right">
                      {kick.outcome === 'Goal' ? (
                        <span className="inline-flex items-center gap-1 text-primary-container font-extrabold">
                          <CheckCircle className="w-4 h-4" /> Goal
                        </span>
                      ) : kick.outcome === 'Saved' ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-extrabold">
                          <AlertCircle className="w-4 h-4" /> Saved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-error font-extrabold">
                          <XCircle className="w-4 h-4" /> Missed
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
        <div className="p-3 bg-secondary-container/40 rounded-lg text-center font-headline-sm text-headline-sm text-on-secondary-container font-extrabold">
          Shootout Winner: {winner}
        </div>
      )}
    </div>
  );
};
