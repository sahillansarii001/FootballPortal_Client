import React from 'react';
import { ListOrdered, Trophy, Play, CheckCircle2, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { MatchEvent } from '@/types';

interface MatchTimelineProps {
  timeline: MatchEvent[];
}

export const MatchTimeline: React.FC<MatchTimelineProps> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-surface-container-high text-center">
        <p className="text-on-surface-variant font-body-sm text-body-sm">
          No match events recorded yet. Match kickoff events will appear here in chronological order.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-surface-container-high flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-5 h-5 text-primary-container" />
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-extrabold">
            Live Match Log & Chronology
          </h3>
        </div>
        <span className="font-label-caps text-label-caps text-primary-container font-extrabold uppercase bg-primary-container/10 px-2.5 py-1 rounded-md border border-primary-container/20">
          Official Event Stream
        </span>
      </div>

      {/* Vertical Timeline */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-high">
        {timeline.map((event, idx) => {
          const isGoal = event.type === 'GOAL_SCORED' || event.type === 'GOAL_RECORDED';
          const isCard = event.type === 'YELLOW_CARD' || event.type === 'RED_CARD';
          const isSub = event.type === 'SUBSTITUTION';
          const isHalf = event.type.includes('STARTED') || event.type.includes('ENDED') || event.type.includes('COMPLETED');
          const isPenalty = event.type.includes('PENALTY');

          return (
            <div key={event.id || event._id || idx} className="relative group">
              {/* Event node icon */}
              <div
                className={`absolute -left-6 top-1 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-surface-container-lowest shadow text-xs font-bold ${
                  isGoal
                    ? 'bg-primary-container text-white'
                    : isCard
                    ? 'bg-amber-400 text-stone-900'
                    : isPenalty
                    ? 'bg-secondary text-white'
                    : 'bg-surface-container-highest text-on-surface'
                }`}
              >
                {isGoal ? (
                  <Trophy className="w-3 h-3" />
                ) : isCard ? (
                  <AlertTriangle className="w-3 h-3" />
                ) : isSub ? (
                  <ArrowRightLeft className="w-3 h-3" />
                ) : isHalf ? (
                  <Play className="w-3 h-3" />
                ) : (
                  <CheckCircle2 className="w-3 h-3" />
                )}
              </div>

              {/* Event Card Content */}
              <div
                className={`p-3.5 rounded-r-lg border-l-4 transition-colors ${
                  isGoal
                    ? 'bg-primary-container/5 border-primary-container'
                    : isCard
                    ? 'bg-amber-400/10 border-amber-400'
                    : isPenalty
                    ? 'bg-secondary-container/30 border-secondary'
                    : 'bg-surface-container-low border-surface-container-high'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-label-caps text-label-caps font-black tracking-wide uppercase text-on-surface">
                    {event.type.replace(/_/g, ' ')}
                  </span>
                  <span className="font-label-caps text-label-caps text-white font-bold bg-primary-container px-2 py-0.5 rounded shadow-xs">
                    {event.clockTime || event.matchTime || '00:00'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <p className="font-headline-sm text-headline-sm text-on-surface font-black">
                    {event.title || (event.player ? `${(event.player as any).name}` : 'Match Milestone')}
                  </p>
                  {event.team && (
                    <span className="bg-surface-container text-on-surface-variant text-[11px] px-1.5 py-0.5 rounded font-semibold">
                      {(event.team as any).name}
                    </span>
                  )}
                </div>

                {event.detail?.notes && (
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-snug">
                    {event.detail.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
