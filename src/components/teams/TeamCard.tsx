import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { Team } from '@/types';
import { getCaptainDisplayName } from '@/utils/formatters';

interface TeamCardProps {
  team: Team;
  index?: number;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, index }) => {
  const stats = team.stats || {
    matchesPlayed: team.matchesPlayed ?? 0,
    matchesWon: team.matchesWon ?? 0,
    matchesLost: team.matchesLost ?? 0,
    goalsScored: team.goalsScored ?? 0,
    goalsConceded: team.goalsConceded ?? 0,
    goalDifference: team.goalDifference ?? 0,
    totalPoints: team.totalPoints ?? 0,
  };

  const captainName = getCaptainDisplayName(team.captain || (team as any).captainName);
  const rosterCount = Array.isArray(team.players) ? `${team.players.length} Players` : 'Roster Squad';

  // Extract clean 2-letter monogram abbreviation (NO emojis)
  const initials = team.name
    ? team.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : 'FC';

  return (
    <Link
      href={`/teams/${team._id}`}
      className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-400/60 hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center group"
    >
      {/* Centered Team Shield Logo / Monogram (Matching Reference Screen 5) */}
      <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-center p-2 shadow-xs group-hover:scale-105 transition-transform overflow-hidden relative">
        {team.logo ? (
          <img
            src={team.logo}
            alt={team.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
              const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className={`w-full h-full rounded-xl bg-gradient-to-br from-blue-50 to-slate-100 flex flex-col items-center justify-center text-blue-700 font-black text-xl tracking-wider select-none ${
            team.logo ? 'hidden' : 'flex'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-blue-400 mb-0.5 opacity-60" />
          <span>{initials}</span>
        </div>
      </div>

      {/* Centered Team Name */}
      <h2 className="text-base font-extrabold text-slate-900 mt-3.5 group-hover:text-blue-600 transition-colors truncate max-w-full">
        {team.name}
      </h2>

      {/* Team Meta Details */}
      <p className="text-xs text-slate-500 font-medium mt-1 truncate max-w-full">
        {rosterCount}
      </p>

      {/* Compact Performance Badge */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 w-full flex items-center justify-center gap-3 text-xs font-bold text-slate-600">
        <span className="text-slate-900">
          <strong className="text-blue-600 font-black">{stats.matchesWon}</strong>W - <strong className="text-slate-500">{stats.matchesLost}</strong>L
        </span>
        <span className="text-slate-300">•</span>
        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-extrabold">
          {stats.totalPoints} PTS
        </span>
      </div>
    </Link>
  );
};
