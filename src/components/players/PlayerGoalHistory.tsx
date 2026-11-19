import React from 'react';
import Link from 'next/link';
import { Player } from '@/types';
import { Award, ArrowRight } from 'lucide-react';
import { formatTime } from '@/utils/formatters';

interface PlayerGoalHistoryProps {
  player: Player;
}

export const PlayerGoalHistory: React.FC<PlayerGoalHistoryProps> = ({ player }) => {
  const history = player.goalHistory || [];

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high mb-8">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-surface-container-high">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary-container" />
          <h3 className="font-headline-md text-headline-md text-on-surface font-extrabold">
            Goal Log & Match Appearances
          </h3>
        </div>
        <span className="font-label-caps text-label-caps text-primary-container font-extrabold uppercase bg-primary-container/10 px-3 py-1 rounded-full">
          {player.goals} Tournament Goals
        </span>
      </div>

      {history.length === 0 ? (
        <div className="p-8 text-center text-on-surface-variant font-body-sm text-body-sm bg-surface-container-low rounded-xl">
          No individual goal event breakdown logged for this athlete yet.
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-surface-container shadow-xs"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚽</span>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold">
                    {item.type} • {item.minute}
                  </span>
                  <span className="font-body-sm text-xs text-on-surface-variant">
                    Match Reference #{item.matchId}
                  </span>
                </div>
              </div>

              <Link
                href={`/matches/${item.matchId}`}
                className="inline-flex items-center gap-1 text-primary-container hover:underline text-xs font-bold self-end sm:self-center"
              >
                <span>View Match</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
