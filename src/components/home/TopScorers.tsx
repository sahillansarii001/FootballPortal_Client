import React from 'react';
import Link from 'next/link';
import { Medal } from 'lucide-react';
import { Player } from '@/types';

interface TopScorersProps {
  scorers: Player[];
}

export const TopScorers: React.FC<TopScorersProps> = ({ scorers }) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container" id="scorers-section">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-container">
        <div className="flex items-center gap-2">
          <Medal className="w-5 h-5 text-primary-container" />
          <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
            Top Scorers Spotlight
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded bg-surface-container-low font-label-caps text-label-caps text-on-surface-variant font-bold tracking-wider">
          GOLDEN BOOT
        </span>
      </div>

      {/* Scorers Stack */}
      <div className="space-y-2.5">
        {scorers.slice(0, 3).map((player, idx) => {
          const teamName = typeof player.team === 'object' && player.team ? player.team.name : 'Varsity FC';
          const isLeader = idx === 0;

          return (
            <Link
              key={player._id}
              href={`/players/${player._id}`}
              className={`flex items-center justify-between p-3 rounded-xl transition-all border block ${
                isLeader
                  ? 'bg-surface-container-low border-surface-container/60 shadow-xs'
                  : 'hover:bg-surface-container-low border-surface-container/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full font-headline-sm flex items-center justify-center text-xs font-black shadow-xs ${
                    isLeader
                      ? 'bg-primary-container text-on-primary ring-2 ring-primary-container/20'
                      : 'bg-surface-container-high text-on-surface'
                  }`}
                >
                  #{player.jerseyNumber}
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold group-hover:text-primary-container transition-colors">
                    {player.name}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                    {teamName} • {player.assists || 0} Assists • {player.shots || 0} Shots
                  </span>
                </div>
              </div>

              {/* Goals */}
              <div className="text-right flex flex-col items-end">
                <span
                  className={`font-stat-numeral text-stat-numeral font-black leading-none tabular-nums ${
                    isLeader ? 'text-primary-container' : 'text-on-surface'
                  }`}
                >
                  {player.goals}
                </span>
                <span className="font-label-caps text-label-caps text-on-surface-variant block uppercase font-bold mt-0.5">
                  Goals
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
