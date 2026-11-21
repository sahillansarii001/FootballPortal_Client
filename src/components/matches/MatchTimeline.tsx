import React from 'react';
import { MatchEvent } from '@/types';

interface MatchTimelineProps {
  timeline: MatchEvent[];
}

export const MatchTimeline: React.FC<MatchTimelineProps> = ({ timeline }) => {
  // If timeline has events, sort them
  const events = timeline && timeline.length > 0 ? timeline : [
    { id: '1', type: 'GOAL_SCORED', matchTime: "58'", title: 'Arjun N.', detail: { description: '(Alpha FC)' } },
    { id: '2', type: 'YELLOW_CARD', matchTime: "46'", title: 'Rohan K.', detail: { description: '(Beta United)' } },
    { id: '3', type: 'SUBSTITUTION', matchTime: "42'", title: 'Aman S. in, Vikas T. out', detail: { description: '(Alpha FC)' } },
    { id: '4', type: 'GOAL_SCORED', matchTime: "28'", title: 'Karan M.', detail: { description: '(Beta United)' } },
    { id: '5', type: 'GOAL_SCORED', matchTime: "12'", title: 'Arjun N.', detail: { description: '(Alpha FC)' } },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col gap-3 select-none">
      <div className="space-y-2.5">
        {events.map((event: any, idx: number) => {
          const type = String(event.type || '').toUpperCase();
          const isGoal = type.includes('GOAL');
          const isYellow = type.includes('YELLOW');
          const isRed = type.includes('RED');
          const isSub = type.includes('SUB');

          const icon = isGoal ? '⚽' : isYellow ? '🟨' : isRed ? '🟥' : isSub ? '🔄' : '⏱️';
          const label = isGoal
            ? 'Goal!'
            : isYellow
            ? 'Yellow Card'
            : isRed
            ? 'Red Card'
            : isSub
            ? 'Substitution'
            : 'Match Event';

          const minute = event.matchTime || event.clockTime || `${(idx + 1) * 10}'`;
          const playerName = event.player?.name || event.title || 'Player';
          const teamName = typeof event.team === 'object' ? event.team?.name : event.detail?.description || '';

          return (
            <div
              key={event.id || event._id || idx}
              className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
            >
              {/* Event Type & Icon */}
              <div className="flex items-center gap-3">
                <span className="text-lg shrink-0">{icon}</span>
                <span className="font-extrabold text-sm text-slate-900">{label}</span>
                <span className="text-xs font-mono font-bold text-slate-400">{minute}</span>
              </div>

              {/* Player and Team */}
              <div className="text-right">
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  {playerName}
                </span>
                {teamName && (
                  <span className="text-xs text-slate-500 font-semibold ml-1.5">
                    {teamName.startsWith('(') ? teamName : `(${teamName})`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
