import React from 'react';
import Link from 'next/link';
import { Player } from '@/types';
import { Users, ChevronRight } from 'lucide-react';

interface TeamRosterProps {
  players: Player[];
}

export const TeamRoster: React.FC<TeamRosterProps> = ({ players }) => {
  const positions = ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'];

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high mb-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-surface-container-high">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-container" />
          <h3 className="font-headline-md text-headline-md text-on-surface font-extrabold">
            Active Squad Roster
          </h3>
        </div>
        <span className="font-label-caps text-label-caps text-on-surface-variant font-bold uppercase bg-surface-container px-3 py-1 rounded-full">
          {players.length} Certified Players
        </span>
      </div>

      {/* Grouped by positions */}
      {players.length === 0 ? (
        <div className="text-center py-8 text-on-surface-variant text-xs italic bg-surface-container-low rounded-xl border border-dashed border-surface-container">
          No certified players have been registered for this squad roster yet.
        </div>
      ) : (
        <div className="space-y-6">
          {positions.map((pos) => {
            const group = players.filter(
              (p) => p.position?.toLowerCase() === pos.toLowerCase() || (!p.position && pos === 'Midfielder')
            );
            if (group.length === 0) return null;

            return (
              <div key={pos} className="flex flex-col gap-3">
                <span className="font-label-caps text-label-caps text-primary-container font-extrabold uppercase tracking-wider">
                  {pos}s ({group.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.map((player) => (
                    <Link
                      key={player._id}
                      href={`/players/${player._id}`}
                      className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center justify-between gap-3 border border-surface-container shadow-xs group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface font-headline-sm flex items-center justify-center text-xs font-black ring-1 ring-surface-container">
                          #{player.jerseyNumber}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary-container transition-colors">
                            {player.name}
                          </span>
                          <span className="text-[11px] font-bold text-primary-container">
                            Club: {player.club || 'Independent Club'}
                          </span>
                          <span className="font-body-sm text-xs text-on-surface-variant">
                            {player.goals} Goals • {player.matchesPlayed} Apps
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-outline group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
