import React from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, ChevronRight, Trophy } from 'lucide-react';
import { Match } from '@/types';

interface RecentResultsProps {
  results: Match[];
}

export const RecentResults: React.FC<RecentResultsProps> = ({ results }) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container" id="recent-results">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-container">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary-container" />
          <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
            Recent Results
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded bg-secondary-container/40 text-on-secondary-container font-label-caps text-label-caps font-extrabold tracking-wider">
          VERIFIED FINAL SCORES
        </span>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {!results || results.length === 0 ? (
          <div className="p-8 text-center bg-surface-container-low/60 rounded-xl border border-surface-container/40">
            <p className="font-body-md text-on-surface-variant font-medium">No completed matches recorded yet.</p>
          </div>
        ) : (
          results.slice(0, 3).map((match) => {
            const scoreA = match.score?.teamA ?? match.teamAScore ?? 0;
            const scoreB = match.score?.teamB ?? match.teamBScore ?? 0;
            const teamAName = match.teamA?.name || 'Team A';
            const teamBName = match.teamB?.name || 'Team B';

            const penA = match.shootout?.teamAPenaltyScore ?? 0;
            const penB = match.shootout?.teamBPenaltyScore ?? 0;
            const hasPenalties = Boolean(
              match.shootout?.isShootout ||
              match.shootout?.isCompleted ||
              penA > 0 ||
              penB > 0 ||
              (match.matchResult && match.matchResult.toLowerCase().includes('penalt'))
            );

            // Determine authoritative winner name
            let winnerName: string | null = null;
            if (typeof match.winner === 'object' && match.winner?.name) {
              winnerName = match.winner.name;
            } else if (typeof match.shootout?.shootoutWinner === 'object' && match.shootout?.shootoutWinner?.name) {
              winnerName = match.shootout.shootoutWinner.name;
            } else if (match.winner) {
              const wId = String(match.winner);
              const tAId = match.teamA?._id ? String(match.teamA._id) : '';
              winnerName = wId === tAId ? teamAName : teamBName;
            } else if (scoreA > scoreB) {
              winnerName = teamAName;
            } else if (scoreB > scoreA) {
              winnerName = teamBName;
            } else if (hasPenalties) {
              if (penA > penB) winnerName = teamAName;
              else if (penB > penA) winnerName = teamBName;
            }

            const isDraw = scoreA === scoreB && !winnerName;

            return (
              <Link
                key={match._id}
                href={`/matches/${match._id}`}
                className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container hover:bg-surface-container-low/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs block group"
              >
                <div className="flex items-center gap-4">
                  {/* FT Badge */}
                  <div className="flex flex-col text-center w-14 shrink-0 py-1 bg-surface-container-high rounded-lg text-on-surface-variant border border-surface-container">
                    <span className="font-label-caps text-[10px] uppercase font-bold">FT</span>
                    <CheckCircle2 className="w-4 h-4 mx-auto text-primary-container" />
                  </div>

                  {/* Score & Teams */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        {teamAName} {scoreA}
                      </span>
                      <span className="text-on-surface-variant font-bold">–</span>
                      <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        {scoreB} {teamBName}
                      </span>
                      {hasPenalties && (
                        <span className="text-xs font-black text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md shadow-2xs">
                          ({penA} - {penB} PK)
                        </span>
                      )}
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant font-medium mt-0.5">
                      {match.venue || 'Championship Match'} •{' '}
                      {hasPenalties && winnerName
                        ? `${winnerName} won (${penA} - ${penB}) on penalties`
                        : match.matchResult || 'Final Score'}
                    </span>
                  </div>
                </div>

                {/* Winner pill */}
                <div className="shrink-0 self-end sm:self-center flex items-center gap-2">
                  {isDraw ? (
                    <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps font-bold border border-surface-container">
                      DRAW (+1 PT)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-label-caps text-label-caps font-extrabold border border-emerald-200 shadow-2xs flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>
                        WINNER: {(winnerName || 'WINNER').toUpperCase()}{' '}
                        {hasPenalties ? `(${penA}-${penB} PK)` : '(+3)'}
                      </span>
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-outline group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};
