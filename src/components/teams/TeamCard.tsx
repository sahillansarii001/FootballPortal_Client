import React from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Team } from '@/types';
import { getCaptainDisplayName } from '@/utils/formatters';

interface TeamCardProps {
  team: Team;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
  const stats = team.stats || {
    matchesPlayed: team.matchesPlayed ?? 0,
    matchesWon: team.matchesWon ?? 0,
    matchesLost: team.matchesLost ?? 0,
    goalsScored: team.goalsScored ?? 0,
    goalsConceded: team.goalsConceded ?? 0,
    goalDifference: team.goalDifference ?? 0,
    totalPoints: team.totalPoints ?? 0,
  };

  const captainName = getCaptainDisplayName(team.captain);
  const rosterCount = Array.isArray(team.players) ? `${team.players.length} Athletes` : 'Squad Roster';

  return (
    <article className="bg-surface-container-lowest rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-surface-container-high group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-container/15 text-primary-container flex items-center justify-center font-headline-sm text-headline-sm font-black shadow-xs ring-2 ring-primary-container/20 text-lg">
              {team.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="inline-block px-2 py-0.5 rounded-full font-label-caps text-label-caps bg-surface-container-high text-on-surface-variant mb-1 font-semibold">
                {team.conference || 'Pac-West'}
              </span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-extrabold leading-tight group-hover:text-primary-container transition-colors">
                {team.name}
              </h2>
            </div>
          </div>
          <span className="px-2 py-1 rounded bg-secondary-container/50 text-on-secondary-container font-label-caps text-label-caps font-bold">
            {team.seed || '#1 SEED'}
          </span>
        </div>

        {/* Details list */}
        <div className="space-y-1.5 font-body-sm text-body-sm text-on-surface-variant mb-4 pb-3 border-b border-surface-container-high">
          <div className="flex justify-between">
            <span>Head Coach:</span>
            <span className="text-on-surface font-label-ui text-label-ui font-semibold">
              {team.coach || 'Head Coach'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Team Captain:</span>
            <span className="text-on-surface font-label-ui text-label-ui font-semibold">
              {captainName}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Active Roster:</span>
            <span className="text-primary-container font-label-ui text-label-ui font-bold">
              {rosterCount}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-2.5 rounded-xl mb-4 text-center border border-surface-container">
          <div>
            <div className="font-label-caps text-[10px] text-on-surface-variant font-bold">RECORD</div>
            <div className="font-headline-sm text-headline-sm text-on-surface font-black tabular-nums">
              {stats.matchesWon}-{stats.matchesLost}
            </div>
          </div>
          <div>
            <div className="font-label-caps text-[10px] text-on-surface-variant font-bold">DIFF</div>
            <div
              className={`font-headline-sm text-headline-sm font-black tabular-nums ${
                stats.goalDifference >= 0 ? 'text-primary-container' : 'text-error'
              }`}
            >
              {stats.goalDifference > 0 ? `+${stats.goalDifference}` : stats.goalDifference}
            </div>
          </div>
          <div>
            <div className="font-label-caps text-[10px] text-on-surface-variant font-bold">POINTS</div>
            <div className="font-headline-sm text-headline-sm text-on-surface font-black tabular-nums">
              {stats.totalPoints} PTS
            </div>
          </div>
        </div>

        {/* Form Pills */}
        <div className="mb-4">
          <div className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1.5 font-bold">
            Last Matches
          </div>
          <div className="flex items-center gap-1.5">
            {(team.form || ['W', 'W', 'D', 'W', 'W']).map((res, i) => (
              <span
                key={i}
                className={`w-6 h-6 rounded-full font-label-caps text-label-caps flex items-center justify-center font-bold ${
                  res === 'W'
                    ? 'bg-on-tertiary-container text-primary-container'
                    : res === 'D'
                    ? 'bg-surface-container-highest text-on-surface'
                    : 'bg-error-container text-error'
                }`}
              >
                {res}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Button */}
      <Link
        href={`/teams/${team._id}`}
        className="w-full py-2.5 bg-primary-container hover:bg-primary text-on-primary font-label-ui text-label-ui rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs font-bold"
      >
        <span>View Full Roster & Match Pack</span>
        <Eye className="w-4 h-4" />
      </Link>
    </article>
  );
};
