import React from 'react';
import { BarChart3 } from 'lucide-react';

interface TeamStatsGridProps {
  stats: {
    matchesPlayed: number;
    matchesWon: number;
    matchesLost: number;
    goalsScored: number;
    goalsConceded: number;
    goalDifference: number;
    totalPoints: number;
  };
}

export const TeamStatsGrid: React.FC<TeamStatsGridProps> = ({ stats }) => {
  const cards = [
    { label: 'Matches Played', val: stats.matchesPlayed, color: 'text-on-surface' },
    { label: 'Matches Won', val: stats.matchesWon, color: 'text-primary-container' },
    { label: 'Matches Lost', val: stats.matchesLost, color: 'text-error' },
    { label: 'Goals Scored', val: stats.goalsScored, color: 'text-primary-container' },
    { label: 'Goals Conceded', val: stats.goalsConceded, color: 'text-outline' },
    {
      label: 'Goal Difference',
      val: stats.goalDifference > 0 ? `+${stats.goalDifference}` : stats.goalDifference,
      color: stats.goalDifference >= 0 ? 'text-primary-container' : 'text-error',
    },
    { label: 'Tournament Points', val: `${stats.totalPoints} PTS`, color: 'text-primary-container' },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high mb-8">
      <div className="flex items-center gap-2 pb-4 mb-6 border-b border-surface-container-high">
        <BarChart3 className="w-5 h-5 text-primary-container" />
        <h3 className="font-headline-md text-headline-md text-on-surface font-extrabold">
          Championship Season Analytics
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {cards.map((c, i) => (
          <div key={i} className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container text-center flex flex-col justify-center">
            <span className={`font-stat-numeral text-2xl font-black tabular-nums ${c.color}`}>
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
