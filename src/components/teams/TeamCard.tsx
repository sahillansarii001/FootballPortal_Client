import React from 'react';
import Link from 'next/link';
import { Eye, Users } from 'lucide-react';
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
  const rosterCount = Array.isArray(team.players) ? `${team.players.length} Athletes` : 'Squad Roster';
  const seedLabel = team.seed ? String(team.seed) : team.position ? `#${team.position} SEED` : typeof index === 'number' ? `#${index + 1} SEED` : '#1 SEED';

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
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-extrabold leading-tight group-hover:text-primary-container transition-colors">
                {team.name}
              </h2>
            </div>
          </div>
          <span className="px-2 py-1 rounded bg-secondary-container/50 text-on-secondary-container font-label-caps text-label-caps font-bold">
            {seedLabel}
          </span>
        </div>

        {/* Details list */}
        <div className="space-y-1.5 font-body-sm text-body-sm text-on-surface-variant mb-4 pb-3 border-b border-surface-container-high">
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
          <div className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1.5 font-bold flex items-center justify-between">
            <span>Last Matches</span>
            {Array.isArray(team.form) && team.form.length > 0 && (
              <span className="text-[10px] text-on-surface-variant/70 font-semibold tracking-normal capitalize">Recent Form</span>
            )}
          </div>
          {Array.isArray(team.form) && team.form.length > 0 ? (
            <div className="flex items-center gap-1.5">
              {team.form.map((res, i) => (
                <span
                  key={i}
                  className={`w-6 h-6 rounded-full font-label-caps text-label-caps flex items-center justify-center font-bold shadow-2xs ${
                    res === 'W'
                      ? 'bg-on-tertiary-container text-primary-container'
                      : res === 'D'
                      ? 'bg-surface-container-highest text-on-surface'
                      : 'bg-error-container text-error'
                  }`}
                  title={res === 'W' ? 'Win' : res === 'D' ? 'Draw' : 'Loss'}
                >
                  {res}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-on-surface-variant/70 italic bg-surface-container-low px-2.5 py-1 rounded-md border border-surface-container">
                No matches played yet
              </span>
            </div>
          )}
        </div>

        {/* Squad Players Roster */}
        <div className="mb-4 pt-3 border-t border-surface-container">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold flex items-center gap-1">
              <Users className="w-3 h-3 text-primary-container" />
              <span>Squad Players ({Array.isArray(team.players) ? team.players.length : 0})</span>
            </span>
          </div>

          {Array.isArray(team.players) && team.players.length > 0 ? (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {team.players.map((p: any) => {
                const pObj = typeof p === 'object' && p ? p : { name: String(p), jerseyNumber: '?', position: 'Forward' };
                return (
                  <div
                    key={pObj._id || pObj.name}
                    className="flex items-center justify-between bg-surface-container-low px-2 py-1 rounded-lg border border-surface-container text-xs"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-5 h-5 rounded bg-primary-container/15 text-primary-container font-black text-[10px] flex items-center justify-center shrink-0">
                        #{pObj.jerseyNumber ?? '?'}
                      </span>
                      <span className="font-bold text-on-surface truncate">{pObj.name}</span>
                    </div>
                    <span className="text-[10px] font-medium text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded shrink-0">
                      {pObj.position || 'Forward'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] text-on-surface-variant italic py-1 text-center bg-surface-container-low/50 rounded-lg">
              No players enrolled yet
            </p>
          )}
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
