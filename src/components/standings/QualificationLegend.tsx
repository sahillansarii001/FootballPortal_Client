import React from 'react';
import { Award } from 'lucide-react';

export const QualificationLegend: React.FC = () => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-high flex flex-wrap items-center justify-between gap-4 mb-6">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-primary-container inline-block shadow-sm"></span>
          <span className="font-label-ui text-label-ui text-on-surface font-semibold">
            Top 2: National Semi-Finals
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-tertiary-container inline-block shadow-sm"></span>
          <span className="font-label-ui text-label-ui text-on-surface font-semibold">
            3rd & 4th: Wildcard Playoff
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-error inline-block shadow-sm"></span>
          <span className="font-label-ui text-label-ui text-on-surface font-semibold">
            Bottom 2: Playdown Zone
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 font-label-caps text-label-caps text-on-surface-variant uppercase font-bold">
        <Award className="w-4 h-4 text-primary-container" />
        <span>Win = 1 Pt • Loss = 0 Pts • Tiebreaker: 1. Points • 2. Goal Difference • 3. Goals Scored</span>
      </div>
    </div>
  );
};
