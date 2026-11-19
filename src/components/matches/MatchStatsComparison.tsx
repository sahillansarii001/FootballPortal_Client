import React from 'react';
import { BarChart2 } from 'lucide-react';

interface MatchStatsProps {
  teamAName: string;
  teamBName: string;
  stats?: {
    possessionA: number;
    possessionB: number;
    shotsOnTargetA: number;
    shotsOnTargetB: number;
    foulsA: number;
    foulsB: number;
    cornersA: number;
    cornersB: number;
    savesA: number;
    savesB: number;
  };
}

export const MatchStatsComparison: React.FC<MatchStatsProps> = ({
  teamAName,
  teamBName,
  stats = {
    possessionA: 54,
    possessionB: 46,
    shotsOnTargetA: 6,
    shotsOnTargetB: 4,
    foulsA: 8,
    foulsB: 11,
    cornersA: 7,
    cornersB: 3,
    savesA: 3,
    savesB: 4,
  },
}) => {
  const metrics = [
    { label: 'Possession', valA: `${stats.possessionA}%`, valB: `${stats.possessionB}%`, pctA: stats.possessionA },
    { label: 'Shots on Target', valA: stats.shotsOnTargetA, valB: stats.shotsOnTargetB, pctA: (stats.shotsOnTargetA / (stats.shotsOnTargetA + stats.shotsOnTargetB || 1)) * 100 },
    { label: 'Total Fouls', valA: stats.foulsA, valB: stats.foulsB, pctA: (stats.foulsA / (stats.foulsA + stats.foulsB || 1)) * 100 },
    { label: 'Corner Kicks', valA: stats.cornersA, valB: stats.cornersB, pctA: (stats.cornersA / (stats.cornersA + stats.cornersB || 1)) * 100 },
    { label: 'Saves', valA: stats.savesA, valB: stats.savesB, pctA: (stats.savesA / (stats.savesA + stats.savesB || 1)) * 100 },
  ];

  return (
    <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-surface-container-high">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-container-high">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-primary-container" />
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-extrabold">
            Match Statistics
          </h3>
        </div>
        <span className="font-label-caps text-label-caps text-primary-container font-extrabold bg-primary-container/10 px-2 py-0.5 rounded">
          LIVE OPTA
        </span>
      </div>

      {/* Teams header */}
      <div className="flex items-center justify-between pb-2 font-label-caps text-label-caps">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
          <span className="text-on-surface font-black text-xs truncate max-w-[100px]">{teamAName}</span>
        </div>
        <span className="text-on-surface-variant uppercase font-bold tracking-wider text-[11px]">
          Comparison
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-on-surface font-black text-xs truncate max-w-[100px]">{teamBName}</span>
          <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
        </div>
      </div>

      {/* Metrics Bars */}
      <div className="flex flex-col gap-4 mt-2">
        {metrics.map((m, i) => (
          <div key={i}>
            <div className="flex items-center justify-between font-headline-sm text-headline-sm mb-1.5 text-xs">
              <span className="text-primary-container font-extrabold tabular-nums">{m.valA}</span>
              <span className="font-label-caps text-[11px] text-on-surface-variant uppercase font-bold">
                {m.label}
              </span>
              <span className="text-secondary font-extrabold tabular-nums">{m.valB}</span>
            </div>
            <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden flex">
              <div
                className="h-full bg-primary-container rounded-l-full transition-all duration-500"
                style={{ width: `${m.pctA}%` }}
              />
              <div
                className="h-full bg-secondary rounded-r-full transition-all duration-500"
                style={{ width: `${100 - m.pctA}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
