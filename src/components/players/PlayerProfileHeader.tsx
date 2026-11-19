import React from 'react';
import Link from 'next/link';
import { Player } from '@/types';
import { Shield, Medal } from 'lucide-react';

interface PlayerProfileHeaderProps {
  player: Player;
}

export const PlayerProfileHeader: React.FC<PlayerProfileHeaderProps> = ({ player }) => {
  const teamId = typeof player.team === 'object' && player.team ? player.team._id : '';
  const teamName = typeof player.team === 'object' && player.team ? player.team.name : 'Varsity Football Club';

  return (
    <div className="relative bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-md border border-surface-container-high overflow-hidden mb-8">
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
        {/* Jersey Number Emblem */}
        <div className="w-24 h-24 rounded-2xl bg-primary-container text-white flex items-center justify-center font-display-score text-4xl font-black shadow-lg ring-4 ring-primary-container/20 shrink-0">
          #{player.jerseyNumber}
        </div>

        {/* Player Profile Bio */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-primary-container/15 text-primary-container font-label-caps text-label-caps font-extrabold uppercase">
              {player.position}
            </span>
            <span className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps font-semibold">
              Certified Varsity Athlete
            </span>
          </div>

          <h1 className="font-display-score text-3xl sm:text-4xl text-on-surface font-black tracking-tight mb-2">
            {player.name}
            {player.club && (
              <span className="block text-base sm:text-lg font-bold text-primary-container mt-1">
                Club: {player.club}
              </span>
            )}
          </h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-on-surface-variant font-medium mb-4">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-primary-container" />
              <span>Team:</span>
              {teamId ? (
                <Link href={`/teams/${teamId}`} className="text-primary-container font-bold hover:underline">
                  {teamName}
                </Link>
              ) : (
                <span className="text-on-surface font-semibold">{teamName}</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
              <Medal className="w-3.5 h-3.5 text-primary-container" />
              <span>Origin Club: {player.club || 'Independent Club'}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-on-surface-variant">
            <span className="bg-surface-container-low px-3 py-1.5 rounded-lg border border-surface-container">
              Win Rate: <strong className="text-on-surface">{player.wins || 0}W - {player.losses || 0}L</strong>
            </span>
            <span className="bg-surface-container-low px-3 py-1.5 rounded-lg border border-surface-container">
              Tournament Status: <strong className="text-primary-container">Active Eligible</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
