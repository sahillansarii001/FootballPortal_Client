import React from 'react';
import Link from 'next/link';
import { Match } from '@/types';
import { CheckCircle2, Trophy, ChevronRight } from 'lucide-react';
import { formatDate, getCaptainDisplayName } from '@/utils/formatters';

interface ResultsListProps {
  results: Match[];
}

export const ResultsList: React.FC<ResultsListProps> = ({ results }) => {
  return (
    <div className="flex flex-col gap-4">
      {results.map((match) => {
        const scoreA = match.score?.teamA ?? match.teamAScore ?? 0;
        const scoreB = match.score?.teamB ?? match.teamBScore ?? 0;
        const shootout = match.shootout || match.penalties?.shootoutState;
        const penA = shootout?.teamAPenaltyScore ?? 0;
        const penB = shootout?.teamBPenaltyScore ?? 0;
        const hasPenalties = Boolean(shootout?.isShootout || penA > 0 || penB > 0 || shootout?.isCompleted);
        const rawWinner = match.winner || shootout?.shootoutWinner;
        const winnerId = typeof rawWinner === 'object' && rawWinner ? (rawWinner as any)._id : rawWinner;
        const winnerName = typeof rawWinner === 'object' && rawWinner ? (rawWinner as any).name : null;
        const teamAId = match.teamA?._id ? match.teamA._id.toString() : '';
        const teamBId = match.teamB?._id ? match.teamB._id.toString() : '';

        const isTeamAWinner =
          scoreA > scoreB ||
          (hasPenalties && penA > penB) ||
          Boolean(winnerId && teamAId && winnerId.toString() === teamAId) ||
          Boolean(winnerName && winnerName === match.teamA?.name);

        const isTeamBWinner =
          scoreB > scoreA ||
          (hasPenalties && penB > penA) ||
          Boolean(winnerId && teamBId && winnerId.toString() === teamBId) ||
          Boolean(winnerName && winnerName === match.teamB?.name);

        const isDraw = scoreA === scoreB && !isTeamAWinner && !isTeamBWinner;

        return (
          <div
            key={match._id}
            className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high hover:shadow-md transition-all p-5 sm:p-6 flex flex-col gap-4"
          >
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-surface-container-high text-xs text-on-surface-variant font-medium">
              <div className="flex items-center gap-2">
                <span className="font-label-caps text-label-caps uppercase bg-surface-container px-2.5 py-1 rounded text-on-surface font-extrabold border border-surface-container-high">
                  {match.stage || `MATCH #${match.matchNumber || 1}`}
                </span>
                <span>{formatDate(match.matchDate)} • {match.venue || 'APL Stadium'}</span>
              </div>
              <div className="flex items-center gap-2">
                {hasPenalties ? (
                  <span className="font-label-caps text-label-caps bg-purple-100 text-purple-900 px-3 py-1 rounded-full font-bold border border-purple-200">
                    PENALTIES ({penA} - {penB})
                  </span>
                ) : (
                  <span className="font-label-caps text-label-caps bg-surface-container text-on-surface px-3 py-1 rounded-full font-bold border border-surface-container-high">
                    FULL TIME (90&apos;)
                  </span>
                )}
                {match.attendance && <span className="font-semibold">Att: {match.attendance}</span>}
              </div>
            </div>

            {/* Scoreboard grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Team A */}
              <div className="md:col-span-5 flex items-center justify-between md:justify-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center p-1 shadow-inner border border-surface-container-high shrink-0 font-headline-sm font-black">
                  {match.teamA.name.slice(0, 1)}
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-1.5 font-extrabold">
                    {match.teamA.name}
                    {isTeamAWinner && <Trophy className="w-4 h-4 text-primary-container" />}
                  </span>
                  <span className="font-body-sm text-xs text-on-surface-variant font-medium">
                    Captain: {getCaptainDisplayName(match.teamA.captain)}
                  </span>
                </div>
              </div>

              {/* Score Center */}
              <div className="md:col-span-2 flex flex-col items-center justify-center py-2 bg-surface-container-low rounded-xl border border-surface-container shadow-inner">
                <div className="flex items-center gap-2 font-display-score text-3xl font-black text-on-surface tabular-nums">
                  <span className={isTeamAWinner ? 'text-primary-container' : 'text-on-surface'}>
                    {scoreA}
                  </span>
                  <span className="text-outline font-light">:</span>
                  <span className={isTeamBWinner ? 'text-primary-container' : 'text-on-surface'}>
                    {scoreB}
                  </span>
                </div>
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold mt-0.5 text-center px-1">
                  {isTeamAWinner
                    ? `${match.teamA.name} Win${hasPenalties ? ` (${penA}-${penB} Pen)` : ''}`
                    : isTeamBWinner
                      ? `${match.teamB.name} Win${hasPenalties ? ` (${penA}-${penB} Pen)` : ''}`
                      : (match.matchResult && !match.matchResult.toLowerCase().includes('draw'))
                        ? match.matchResult
                        : 'Draw'}
                </span>
                {hasPenalties && (
                  <span className="text-[10px] text-purple-800 font-extrabold mt-0.5 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 shadow-2xs">
                    Penalties: {penA} - {penB}
                  </span>
                )}
              </div>

              {/* Team B */}
              <div className="md:col-span-5 flex items-center justify-between md:justify-end gap-4 text-left md:text-right">
                <div className="flex flex-col order-2 md:order-1">
                  <span className="font-headline-sm text-headline-sm text-on-surface flex items-center justify-start md:justify-end gap-1.5 font-extrabold">
                    {isTeamBWinner && <Trophy className="w-4 h-4 text-primary-container" />}
                    {match.teamB.name}
                  </span>
                  <span className="font-body-sm text-xs text-on-surface-variant font-medium">
                    Captain: {getCaptainDisplayName(match.teamB.captain)}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center p-1 shadow-inner border border-surface-container-high shrink-0 font-headline-sm font-black order-1 md:order-2">
                  {match.teamB.name.slice(0, 1)}
                </div>
              </div>
            </div>

            {/* Footer with goalscorers and CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-surface-container-high">
              <div className="text-xs text-on-surface-variant font-medium">
                {match.goals && match.goals.length > 0 ? (
                  <span>Goals: {match.goals.map((g) => `${g.player?.name} (${g.matchTime})`).join(' • ')}</span>
                ) : (
                  <span>Ref: {match.referee || 'Michael O\'Hanlon'} • Grass Turf</span>
                )}
              </div>

              <Link
                href={`/matches/${match._id}`}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold rounded-lg transition-colors shrink-0"
              >
                <span>View Match Center</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};
