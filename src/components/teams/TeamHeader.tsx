import React from 'react';
import { Team } from '@/types';
import { Trophy, Shield, User, Award } from 'lucide-react';
import { getCaptainDisplayName } from '@/utils/formatters';

interface TeamHeaderProps {
  team: Team;
}

export const TeamHeader: React.FC<TeamHeaderProps> = ({ team }) => {
  const captainName = getCaptainDisplayName(team.captain);
  const rosterCount = Array.isArray(team.players) ? `${team.players.length} Athletes` : '24 Athletes';
  return (
    <div className="relative bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-md border border-surface-container-high overflow-hidden mb-8">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
        {/* Crest */}
        <div className="w-24 h-24 rounded-2xl bg-primary-container/15 text-primary-container flex items-center justify-center font-display-score text-4xl font-black border-2 border-primary-container/30 shadow-md shrink-0">
          {team.name.slice(0, 2).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-secondary-container/50 text-on-secondary-container font-label-caps text-label-caps font-bold">
              {team.seed || '#1 SEED'}
            </span>
            <span className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps font-semibold">
              {team.conference || 'Pac-West Collegiate'}
            </span>
          </div>

          <h1 className="font-display-score text-3xl sm:text-4xl text-on-surface font-black tracking-tight mb-2">
            {team.name}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mb-4">
            {team.description || 'Tier-1 Collegiate Varsity Football Program competing in national championship tournament.'}
          </p>

          {/* Leaders */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-on-surface-variant font-medium">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-primary-container" />
              <span>Head Coach: <strong className="text-on-surface font-semibold">{team.coach || 'Head Coach'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-primary-container" />
              <span>Captain: <strong className="text-on-surface font-semibold">{captainName}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-primary-container" />
              <span>Active Squad: <strong className="text-on-surface font-semibold">{rosterCount}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
