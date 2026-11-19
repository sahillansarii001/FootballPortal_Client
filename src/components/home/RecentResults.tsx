import React from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, ChevronRight } from 'lucide-react';
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
        {results.slice(0, 3).map((match) => {
          const isDraw = match.score.teamA === match.score.teamB;
          const winnerName =
            typeof match.winner === 'object' && match.winner
              ? match.winner.name
              : match.score.teamA > match.score.teamB
              ? match.teamA.name
              : match.teamB.name;

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
                  <div className="flex items-center gap-3">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-1.5">
                      {match.teamA.name} {match.score.teamA}
                    </span>
                    <span className="text-on-surface-variant font-bold">–</span>
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      {match.score.teamB} {match.teamB.name}
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant font-medium mt-0.5">
                    {match.venue || 'Inter-College Championship'} • {match.matchResult || 'Verified Match Result'}
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
                  <span className="px-2.5 py-1 rounded-full bg-secondary-container/40 text-on-secondary-container font-label-caps text-label-caps font-bold border border-secondary-container/60">
                    WINNER: {winnerName.toUpperCase()} (+3)
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-outline group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
