import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Player } from '@/types';

interface PlayerCardProps {
  player: Player;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  const teamName = typeof player.team === 'object' && player.team ? player.team.name : 'League FC';

  return (
    <article className="bg-surface-container-lowest rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-surface-container-high group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-container/15 text-primary-container flex items-center justify-center font-display-score text-lg font-black shadow-xs ring-2 ring-primary-container/20">
              #{player.jerseyNumber}
            </div>
            <div>
              <span className="inline-block px-2 py-0.5 rounded-full font-label-caps text-[10px] bg-surface-container-high text-on-surface-variant mb-1 font-bold">
                {player.position}
              </span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-extrabold group-hover:text-primary-container transition-colors leading-tight">
                {player.name}
                {player.club && (
                  <span className="block text-[11px] font-semibold text-primary-container mt-0.5">
                    ({player.club})
                  </span>
                )}
              </h2>
            </div>
          </div>
        </div>

        {/* Team affiliation */}
        <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium mb-4 pb-3 border-b border-surface-container-high">
          <span>{teamName}</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {player.club || 'Independent Club'}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-2.5 rounded-xl mb-4 text-center border border-surface-container">
          <div>
            <div className="font-label-caps text-[10px] text-on-surface-variant font-bold">GOALS</div>
            <div className="font-headline-sm text-headline-sm text-primary-container font-black tabular-nums">
              {player.goals}
            </div>
          </div>
          <div>
            <div className="font-label-caps text-[10px] text-on-surface-variant font-bold">APPS</div>
            <div className="font-headline-sm text-headline-sm text-on-surface font-black tabular-nums">
              {player.matchesPlayed}
            </div>
          </div>
          <div>
            <div className="font-label-caps text-[10px] text-on-surface-variant font-bold">ASSISTS</div>
            <div className="font-headline-sm text-headline-sm text-on-surface font-black tabular-nums">
              {player.assists || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Button */}
      <Link
        href={`/players/${player._id}`}
        className="w-full py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface hover:text-primary-container font-label-ui text-label-ui rounded-lg transition-colors flex items-center justify-center gap-1 font-bold"
      >
        <span>View Player Profile</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </article>
  );
};
