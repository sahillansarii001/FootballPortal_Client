import React from 'react';
import { Player } from '@/types';
import { BarChart3 } from 'lucide-react';

interface PlayerStatsSummaryProps {
  player: Player;
}

export const PlayerStatsSummary: React.FC<PlayerStatsSummaryProps> = ({ player }) => {
  const cards = [
    { label: 'Total Goals', val: player.goals, color: 'text-primary-container' },
    { label: 'Matches Played', val: player.matchesPlayed, color: 'text-on-surface' },
    { label: 'Key Assists', val: player.assists || 0, color: 'text-on-surface' },
    { label: 'Total Shots', val: player.shots || 0, color: 'text-on-surface' },
    { label: 'Penalties Scored', val: player.penaltiesScored || 0, color: 'text-secondary' },
    { label: 'Penalties Saved', val: player.penaltiesSaved || 0, color: 'text-primary-container' },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high mb-8">
      <div className="flex items-center gap-2 pb-4 mb-6 border-b border-surface-container-high">
        <BarChart3 className="w-5 h-5 text-primary-container" />
        <h3 className="font-headline-md text-headline-md text-on-surface font-extrabold">
          Career & Tournament Statistics
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c, i) => (
          <div key={i} className="p-4 rounded-xl bg-surface-container-low border border-surface-container text-center flex flex-col justify-center">
            <span className={`font-stat-numeral text-3xl font-black tabular-nums ${c.color}`}>
              {c.val}
            </span>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase mt-1 font-bold">
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
